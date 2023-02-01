// @flow

const {
  add, subtract, vectorTheta, makeVector, containsVector,
  dist, equals, magnitude
} = require('../utils/vectors');
const {
  addEntity, removeEntity, moveEntity, pickupEntity, putdownEntity,
  rotateEntity,
} = require('../simulation/entityOperations');
const {thetaToDir} = require('../utils/helpers');
const {
  lookupInGrid, getPheromonesInCell, insideGrid,
} = require('../utils/gridHelpers');
const {
  getNeighborPositions, getNeighborEntities, areNeighbors,
  getFreeNeighborPositions, getNeighborEntitiesAndPosition,
} = require('../selectors/neighbors');
const {
  getPositionsInFront, getPositionsBehind, getQueen, isFacing, canDoMove,
  getOtherPlayerID, getEntityBlockingTypes,
  isDirtBlockage,
} = require('../selectors/misc');
const {
  inTokenRadius, tokenExists, getToken, inTokenInfluence,
} = require('../selectors/tokens');
const {
  getPheromoneBlockers,
  getPheromoneAtPosition,
} = require('../selectors/pheromones');
const {makeEgg, makeToken, makeFood} = require('../entities/makeEntity');
const {oneOf, weightedOneOf} = require('../utils/stochastic');
const {
  makeAction, isActionTypeQueued,
  queueAction, stackAction, cancelAction,
} = require('../simulation/actionQueue.js');
const {dealDamageToEntity} = require('../simulation/miscOperations');
const {
  setPheromone, fillPheromone, clearPheromone,
} = require('../simulation/pheromones');
const globalConfig = require('../config');

import type {
  Game, Task, Grid, Entity, EntityID, EntityType, Ant,
} from '../types';


const antPickup = (
  game: Game, ant: Ant, entity: Entity, pickupPos: Vector,
): Game => {
  const config = game.config[ant.playerID];
  // if (!areNeighbors(game, ant, entity)) return game;
  // if (
  //   ant.caste != 'QUEEN' &&
  //   !config.antPickupTypes.includes(entity.type)) return game;
  if (
    ant.caste == 'QUEEN' &&
    !config.queenPickupTypes.includes(entity.type)) return game;
  // support picking up more than 1 thing
  if (ant.holdingIDs.length >= config[ant.caste].maxHold) return game;

  // damage enemies that pick up spiked larva
  if (
    entity.type == 'LARVA' &&
    game.config[entity.playerID].spikedLarva != null &&
    entity.playerID != ant.playerID
  ) {
    dealDamageToEntity(game, ant, game.config[entity.playerID].spikedLarva);
  }

  // switch enemy egg/larva/pupa to ant's side
  if (
    entity.playerID != null &&
    entity.playerID != ant.playerID &&
    entity.species == ant.species &&
    entity.type != 'TOKEN'
  ) {
    entity.playerID = ant.playerID;
  }

  // update task need if ant not doing go_to_dirt picks up marked dirt
  if (
    ant.task != 'GO_TO_DIRT' && entity.type == 'DIRT' && entity.marked == ant.playerID &&
    game.colonies[ant.playerID].taskNeed['GO_TO_DIRT'] > 0
  ) {
    game.colonies[ant.playerID].taskNeed['GO_TO_DIRT'] -= 1;
  }

  // if it's food:
  //   - set ant's foodPherQuantity property to 5x distance to food
  //   - decrement task need if this is marked for retrieval already
  //   - increment task need for each neighboring food not marked for retrieval
  //   - put food around pickup location
  if (entity.type == 'FOOD') {
    // NOTE: don't do this, task switching is handling in antDecideTask
    // antSwitchTask(game, ant, 'RETURN');

    let distToColony =
      game.config[ant.playerID].COLONY.quantity
      - getPheromoneAtPosition(game, ant.position, 'COLONY', ant.playerID);
    if (distToColony == game.config[ant.playerID].COLONY.quantity) {
      distToColony = 50;
    }
    // NOTE: set to 0 unless this food actually neighbors other food, see below
    ant.foodPherQuantity = 0;

    // multiple colonies could've marked the same food for retrieval,
    // keep that up to date here
    for (let playerID in game.players) {
      let colony = game.colonies[playerID];
      if (colony.foodMarkedForRetrieval[entity.id]) {
        if (
          (ant.task != 'RETRIEVE' && playerID == ant.playerID)
          || ant.playerID != playerID
        ) {
          colony.taskNeed['RETRIEVE'] -= 1;
        }
        delete colony.foodMarkedForRetrieval[entity.id];
      }
    }
    let colony = game.colonies[ant.playerID];

    getNeighborEntities(game, entity)
      .filter(e => e.type == 'FOOD')
      .forEach(f => {
        ant.foodPherQuantity = distToColony * 2.1;
        if (
          !colony.foodMarkedForRetrieval[f.id]
          && !inTokenRadius(game, {...f, playerID: ant.playerID}, 'COLONY')
        ) {
          colony.foodMarkedForRetrieval[f.id] = true;
          colony.taskNeed['RETRIEVE'] += 1;
        }
      });

    // don't do food pheromone if there's no colony pheromone
    if (getPheromoneAtPosition(game, ant.position, 'COLONY', ant.playerID) == 0) {
      ant.foodPherQuantity = 0;
    }

    // pheromone
    fillPheromone(game, ant.position, 'FOOD', ant.playerID, ant.foodPherQuantity);
    fillPheromone(game, entity.position, 'FOOD', ant.playerID, ant.foodPherQuantity);
    getFreeNeighborPositions(game, entity, getPheromoneBlockers('FOOD'))
      .forEach(pos => fillPheromone(game, pos, 'FOOD', ant.playerID, ant.foodPherQuantity));
  }

  // do the actual pickup
  ant.holding = pickupEntity(game, entity, pickupPos);
  ant.holdingIDs.push(ant.holding.id);
  ant.lastHeldID = ant.holding.id;

  return game;
}

const antPickupNeighbor = (game: Game, ant: Ant): Game => {
  const config = game.config[ant.playerID];
  if (ant.caste == 'QUEEN' && game.players[ant.playerID].type == 'HUMAN') {
    return game;
  }
  // support picking up more than 1 thing
  if (ant.holdingIDs.length >= config[ant.caste].maxHold) return game;

  if (ant.task == 'DEFEND' || ant.task == 'ATTACK') return game;
  if (!config.castePickup.includes(ant.caste)) return game;

  const pickupTypes = [...config.antPickupTypes];
  if (ant.caste == 'MEDIA') { // && game.colonies[ant.playerID].species == 'Leaf Cutter Ants') {
    pickupTypes.push('VINE');
  }
  const neighbors = getNeighborEntitiesAndPosition(game, ant, true)
    .filter(n => pickupTypes.includes(n.entity.type));
  if (neighbors.length == 0) return game;

  let numStacked = 0;
  for (const neighbor of neighbors) {
    const {entity, position} = neighbor;
    const toPickup = entity;
    switch (toPickup.type) {
      case 'FOOD': {
        const food = toPickup;
        if (ant.lastHeldID == food.id) break;
        if (ant.type == 'TERMITE') break;
        if (
          !inTokenRadius(game, {...food, playerID: ant.playerID}, 'COLONY') ||
          (game.colonies[ant.playerID].taskNeed['FEED_LARVA'] > 0)
        ) {
          stackAction(game, ant, makeAction(game, ant, 'PICKUP', {pickupID: food.id, position}));
          numStacked++;
        }
        break;
      }
      case 'DIRT': {
        const dirt = toPickup;
        const blockage = ant.task == 'GO_TO_BLOCKAGE' && isDirtBlockage(game, ant, dirt);
        if (dirt.marked != ant.playerID && !blockage) break;
        stackAction(game, ant, makeAction(game, ant, 'PICKUP', {pickupID: dirt.id, position}));
        numStacked++;
        break;
      }
      case 'TERMITE_EGG':
      case 'EGG': {
        const egg = toPickup;
        if (
          inTokenRadius(game, {...egg, playerID: ant.playerID}, 'EGG') ||
          !tokenExists(game, ant.playerID, 'EGG')
        ) break;
        stackAction(game, ant, makeAction(game, ant, 'PICKUP', {pickupID: egg.id, position}));
        numStacked++;
        break;
      }
      case 'LARVA': {
        const larva = toPickup;
        if (
          inTokenRadius(game, {...larva, playerID: ant.playerID}, 'MOVE_LARVA_PHER') ||
          !tokenExists(game, ant.playerID, 'MOVE_LARVA_PHER') ||
          ant.task == 'RETRIEVE'
        ) break;
        stackAction(game, ant, makeAction(game, ant, 'PICKUP', {pickupID: larva.id, position}));
        numStacked++;
        break;
      }
      case 'PUPA': {
        const pupa = toPickup;
        if (
          inTokenRadius(game, {...pupa, playerID: ant.playerID}, 'PUPA') ||
          !tokenExists(game, ant.playerID, 'PUPA')
        ) break;
        stackAction(game, ant, makeAction(game, ant, 'PICKUP', {pickupID: pupa.id, position}));
        numStacked++;
        break;
      }
      case 'VINE': {
        const vine = toPickup;
        if (vine.subType != 'LEAF') break;
        if (ant.holdingIDs.length > 0) break;
        stackAction(game, ant, makeAction(game, ant, 'PICKUP', {pickupID: vine.id, position}));
        numStacked = config[ant.caste].maxHold;
      }
    }
    if (numStacked + ant.holdingIDs.length >= config[ant.caste].maxHold) {
      return game;
    }
  }
  return game;
}

const antPutdown = (game: Game, ant: Ant, position): Game => {
  if (ant.holding == null) {
    if (ant.task != 'DEFEND') {
      antSwitchTask(game, ant, 'WANDER');
    }
    return game;
  }

  let putDownPositions = getPositionsInFront(game, ant);
  if (position != null) {
    putDownPositions = [position];
  }
  for (const putDownPos of putDownPositions) {

    const blockers = lookupInGrid(game.grid, putDownPos)
      .map(id => game.entities[id])
      .filter(e => e.type.slice(0, 4) != 'DEAD' && e.type != 'BACKGROUND' && e.type != 'SPIDER_WEB');

    // HACK: detect situation where many ants want to put down in the same place
    // and allow putting down there anyway
    if (blockers.length > 0) {
      let allAnts = true;
      for (const entity of blockers) {
        if (entity.type != 'ANT' || entity.caste == 'QUEEN') {
          allAnts = false;
        }
      }
      if (!allAnts) continue;
      // move the blocking ants to your position
      for (const entity of blockers) {
        moveEntity(game, entity, ant.position);
      }
    }
    if (!insideGrid(game.grid, putDownPos)) continue;

    if (ant.holding.type != 'VINE') {
      putdownEntity(game, ant.holding, putDownPos);
    } else {
      const leaf = ant.holding;
      for (let x = 0; x < leaf.width; x++) {
        for (let y = 0; y < leaf.height; y++) {
          addEntity(game, makeFood(game, add(putDownPos, {x, y})));
        }
      }
    }
    if (ant.holding.type != 'FOOD' && ant.holding.type != 'VINE') { // ie DIRT, EGG, LARVA, PUPA,
      antSwitchTask(game, ant, 'RETURN');
    } else {
      if (ant.task == 'FEED_LARVA') {
        game.colonies[ant.playerID].taskNeed['FEED_LARVA'] += 1;
      }
      if (ant.task != 'DEFEND') {
        antSwitchTask(game, ant, 'WANDER');
      }
    }
    // allow holding more than 1 thing
    ant.holdingIDs.pop();
    if (ant.holdingIDs.length == 0) {
      ant.holding = null;
    } else {
      ant.holding = game.entities[ant.holdingIDs[ant.holdingIDs.length - 1]];
    }
    break;
  }

  return game;
}

const antSwitchTask = (game: Game, ant: Ant, task: Task): Game => {
  if (ant.task == task) return game; // don't switch to task you're already doing
  if (ant.caste == 'QUEEN' && game.playerID == ant.playerID) return game;
  if (
    ant.caste == 'YOUNG_QUEEN' &&
    (task != 'DEFEND' && task != 'WANDER' && task != 'FLY_AWAY') &&
    !game.config[ant.playerID].youngQueensDoTasks
  ) {
    return game; // YOUNG QUEENS don't do anything else
  }
  // TODO: remove hardcoded task need
  if (ant.task == 'EXPLORE' && game.colonies[ant.playerID].taskNeed['EXPLORE'] < 10) {
    game.colonies[ant.playerID].taskNeed['EXPLORE'] += 1;
  }
  // TODO: handling "improper" task transitions like this is not scaleable
  if (ant.task == 'GO_TO_DIRT' && task != 'MOVE_DIRT') {
    game.colonies[ant.playerID].taskNeed['GO_TO_DIRT'] += 1;
  }

  // HACK ALERT: this doesn't quite work for some reason?? so I do a bookkeeping
  // pass in tickReducer instead
  // if some other ant picked up the dirt first, subtract that taskNeed
  // if (task == 'MOVE_DIRT' && ant.task != 'GO_TO_DIRT') {
  //   game.colonies[ant.playerID].taskNeed['GO_TO_DIRT'] -= 1;
  // }

  if (
    ant.task == 'RETRIEVE' && (task != 'RETURN' ||
    (ant.holding == null || ant.holding.type != 'FOOD'))
  ) {
    game.colonies[ant.playerID].taskNeed['RETRIEVE'] += 1;
  }
  if (ant.task == 'FEED_LARVA' && (ant.holding != null && ant.holding.type == 'FOOD')) {
    game.colonies[ant.playerID].taskNeed['FEED_LARVA'] += 1;
  }

  ant.task = task;
  if (game.colonies[ant.playerID].taskNeed[task] != null) {
    game.colonies[ant.playerID].taskNeed[task] -= 1;
  }
  ant.timeOnTask = 0;
  return game;
}

/**
 * Can also create tokens
 */
const antLayEgg = (game: Game, ant: Ant, layingCaste: Caste): Game => {
  const config = game.config[ant.playerID];
  const positions = getPositionsBehind(game, ant);
  const blockers = [...getEntityBlockingTypes(game, ant), 'EGG', 'LARVA'];
  for (const eggPosition of positions) {
    const occupied = lookupInGrid(game.grid, eggPosition)
      .filter(id => ant.id != id && blockers.includes(game.entities[id].type))
      .length > 0;
    const inGrid = insideGrid(game.grid, eggPosition);

    if (!occupied && inGrid && thetaToDir(ant.theta) != null) {
      if (layingCaste.includes('TOKEN')) {
        const prefix = layingCaste.slice(0, -6);
        const pheromoneType = {
          COLONY: 'COLONY',
          EGG: 'EGG',
          LARVA: 'MOVE_LARVA_PHER',
          PUPA: 'PUPA',
          DIRT: 'DIRT_DROP',
        }[prefix];
        const prevToken = getToken(game, ant.playerID, pheromoneType);
        if (prevToken != null) {
          removeEntity(game, prevToken);
        }
        const token = makeToken(game, eggPosition, ant.playerID, pheromoneType);
        addEntity(game, token);
        ant.eggCharges = 0;
        ant.eggLayingCooldown = config.eggLayingCooldown;
      } else {
        const egg = makeEgg(game, eggPosition, ant.playerID, layingCaste);
        addEntity(game, egg);
        if (layingCaste == 'MAJOR' || layingCaste == 'QUEEN') {
          ant.eggCharges = 0;
        } else {
          ant.eggCharges--;
        }
        ant.eggLayingCooldown = config.eggLayingCooldown;
      }
      return game;
    }
  }

  if (ant.actions[0]?.type == 'LAY') {
    cancelAction(game, ant);
  }
  return game;
}


// -----------------------------------------------------------------------
// Ant Decision
// -----------------------------------------------------------------------

const antDecideMove = (game: Game, ant: Ant): Game => {
  if (ant.id == game.controlledEntity?.id) {
    const token = game.TOKEN
      .map(id => game.entities[id])
      .filter(t => t.pheromoneType == 'QUEEN_FOLLOW' && t.playerID == game.playerID)[0];
    // queen moves "automatically" if the token exists, ie uses this function
    if (token == null) {
      return game;
    }
  }
  const config = game.config[ant.playerID];

  const blockers = getEntityBlockingTypes(game, ant);

  const freeNeighbors = getFreeNeighborPositions(game, ant, blockers)
    .filter(pos => canDoMove(game, ant, pos).result);

  if (freeNeighbors.length == 0) {
    ant.prevPosition = {...ant.position};
    return game;
  }

  let taskConfig = config[ant.task];
  // Young Queens have a separate config
  if (
    (ant.caste == 'YOUNG_QUEEN' && !config.youngQueensDoTasks && ant.task != 'FLY_AWAY') ||
    (ant.caste == 'QUEEN' && ant.id != game.controlledEntity?.id)
    ) {
    taskConfig = {};
    for (const pherType of globalConfig.config.pheromoneTypes) {
      if (taskConfig[pherType] == null) {
        taskConfig[pherType] = 0;
      }
    }
    taskConfig = {
      ...taskConfig,
      base: 3,
      forwardMovementBonus: 1,
      ALERT: -50,
      QUEEN_ALERT: -50,
      COLONY: 3,
      MOVE_LARVA_PHER: 3,
      WATER: -1000,
    };
  }
  // Majors also have a separate task config
  if (ant.caste == 'MAJOR') {
    taskConfig = {
      ...taskConfig,
      FOOD: 0,
    };
  }

  // HACK: media with 0 base score can get stuck on corners
  let baseScore = taskConfig.base;
  if ((ant.caste == 'MEDIA' || ant.caste == 'MAJOR') && baseScore == 0) {
    baseScore = 1;
  }

  const holdingFood = ant.holding != null && ant.holding.type == 'FOOD';

  let playerID = ant.playerID;
  // HACK switching so ants can do stuff based off opposing pheromones
  // Only really works for CPU colonies
  if (ant.task == 'ATTACK' || ant.task == 'GO_TO_BLOCKAGE') {
    playerID = game.playerID; // TODO: player can't use ATTACK task as intended
  }
  if (
    getPheromoneAtPosition(game, ant.position, 'QUEEN_DISPERSE', game.playerID) > 0
  ) {
    playerID = game.playerID;
  }


  const basePher = getPheromonesInCell(game.grid, ant.position, playerID);
  const pheromoneNeighbors = freeNeighbors
    .map(pos => getPheromonesInCell(game.grid, pos, playerID));
  let neighborScores = freeNeighbors.map(n => baseScore);
  for (let i = 0; i < freeNeighbors.length; i++) {
    const pos = freeNeighbors[i];

    const pher = pheromoneNeighbors[i];

    neighborScores[i] +=
      (pher.ALERT - basePher.ALERT) * taskConfig.ALERT;
    neighborScores[i] +=
      (pher.QUEEN_ALERT - basePher.QUEEN_ALERT)
      * taskConfig.QUEEN_ALERT;

    // enemy ants avoid your disperse
    const avoidDisperse = (
      getPheromoneAtPosition(game, ant.position, 'QUEEN_DISPERSE', game.playerID) > 0
        && ant.playerID != game.playerID
    ) ? -1 : 1;
    neighborScores[i] +=
      (pher.QUEEN_DISPERSE - basePher.QUEEN_DISPERSE) * taskConfig.QUEEN_DISPERSE * avoidDisperse;

    // don't use regular food difference for retrieval or return
    if (ant.task == 'RETRIEVE') {
      // if diff between food pheromones is due to dispersal, then just follow it normally
      if (Math.abs(basePher.FOOD - pher.FOOD) >= 4) {
        neighborScores[i] +=
          (pher.FOOD - basePher.FOOD) * taskConfig.FOOD;
      } else {
        // otherwise, want to go to smaller neighbor since food pher decreases in
        // strength as you go away from the colony
        neighborScores[i] +=
          -1 * (pher.FOOD - basePher.FOOD) * taskConfig.FOOD;
      }
    } else if (ant.task == 'RETURN' && ant.holding != null && ant.holding.type == 'FOOD') {
      // if returning with food, prefer to follow pre-existing food trail if it exists
      neighborScores[i] +=
        (pher.FOOD * taskConfig.FOOD) * (pher.COLONY - basePher.COLONY);
    } else {
      neighborScores[i] +=
        (pher.FOOD - basePher.FOOD) * taskConfig.FOOD;
    }
    neighborScores[i] +=
      (pher.QUEEN_PHER - basePher.QUEEN_PHER) * taskConfig.QUEEN_PHER;
    neighborScores[i] +=
      (pher.QUEEN_FOLLOW - basePher.QUEEN_FOLLOW) * taskConfig.QUEEN_FOLLOW;
    neighborScores[i] +=
      (pher.CRITTER_PHER - basePher.CRITTER_PHER) * taskConfig.CRITTER_PHER;

    if (ant.task == 'EXPLORE') {
      // TODO: don't hardcode explore values
      neighborScores[i] +=
        ((400 - Math.abs(pher.COLONY - 300)) - (400 - Math.abs(basePher.COLONY - 300)))
        * taskConfig.COLONY;

    } else if (ant.task == 'PATROL') {
      const otherPlayerID = getOtherPlayerID(game, ant.playerID);
      let otherColonyAttractorScore = 0;
      if (otherPlayerID != null) {
        const otherBasePher = getPheromonesInCell(game.grid, ant.position, otherPlayerID);
        const otherPheromoneNeighbors = freeNeighbors
          .map(pos => getPheromonesInCell(game.grid, pos, otherPlayerID));
        const otherPher = otherPheromoneNeighbors[i];
        otherColonyAttractorScore = (otherPher.COLONY - otherBasePher.COLONY)
          * (taskConfig.COLONY/ 10);
      }
      const radius = game.colonies[playerID].patrolRadius;
      const baseDist = (game.config[playerID].COLONY.quantity - radius) - basePher.COLONY;
      const patrolRadiusScore =
        ((pher.COLONY - basePher.COLONY) * baseDist) * taskConfig.COLONY;

      // don't patrol the radius that is away from the other colony:
      if (patrolRadiusScore > 0 && otherColonyAttractorScore < 0) {
        neighborScores[i] += otherColonyAttractorScore;

        // ignore other colony if you're aligned with it already and going in the right
        // direction
      } else if (patrolRadiusScore > 0 && otherColonyAttractorScore > 0) {
        neighborScores[i] += patrolRadiusScore;

        // enforce first going back to your own colony, then out to the patrol
        // radius towards the other colony, by checking if we need to backtrack
        // away from the patrol radius and we are still close to the colony
      } else if (
        patrolRadiusScore < 0 && otherColonyAttractorScore > 0 &&
        (game.config[playerID].COLONY.quantity - basePher.COLONY) < radius
      ) {
        neighborScores[i] += otherColonyAttractorScore;
      } else {
        neighborScores[i] += patrolRadiusScore + otherColonyAttractorScore;
      }
    } else {
      neighborScores[i] +=
        (pher.COLONY - basePher.COLONY) * taskConfig.COLONY;
    }

    neighborScores[i] +=
      (pher.PATROL_DEFEND_PHER - basePher.PATROL_DEFEND_PHER)
      * taskConfig.PATROL_DEFEND_PHER;
    neighborScores[i] +=
      (pher.EGG - basePher.EGG) * taskConfig.EGG;
    neighborScores[i] +=
      (pher.MOVE_LARVA_PHER - basePher.MOVE_LARVA_PHER) * taskConfig.MOVE_LARVA_PHER;
    neighborScores[i] +=
      (pher.LARVA - basePher.LARVA) * taskConfig.LARVA;
    neighborScores[i] +=
      (pher.PUPA - basePher.PUPA) * taskConfig.PUPA;
    neighborScores[i] +=
      (pher.PASS_THROUGH_COLONY - basePher.PASS_THROUGH_COLONY) * taskConfig.PASS_THROUGH_COLONY;
    neighborScores[i] +=
      (pher.RAID_PHER - basePher.RAID_PHER) * taskConfig.RAID_PHER;
    neighborScores[i] +=
      (pher.DIRT_DROP - basePher.DIRT_DROP) * taskConfig.DIRT_DROP;
    neighborScores[i] +=
      (pher.MARKED_DIRT_PHER - basePher.MARKED_DIRT_PHER) * taskConfig.MARKED_DIRT_PHER;

    // penalize moving to previous position
    if (equals(pos, ant.prevPosition)) {
      neighborScores[i] += config.prevPositionPenalty;
    }

    // boost continuing to move straight
    if (magnitude(subtract(pos, ant.prevPosition)) == 2) {
      neighborScores[i] += taskConfig.forwardMovementBonus;
    }

    // normalize score
    neighborScores[i] = Math.max(baseScore, neighborScores[i]);
    neighborScores[i] = Math.ceil(neighborScores[i]);
  }

  // don't let every neighbor have 0 score
  let allZero = true;
  for (let j = 0; j < neighborScores.length; j++) {
    if (neighborScores[j] != 0) {
      allZero = false;
    }
  }
  if (allZero) {
    neighborScores = neighborScores.map(s => 1);
  }
  const nextPos = weightedOneOf(freeNeighbors, neighborScores);
  if (nextPos == null) {
    console.log('nextPos was null', nextPos);
    console.log(neighborScores, allZero);
  }
  if (game.showAntDecision) {
    ant.decisions = [];
    for (let i = 0; i < freeNeighbors.length; i++) {
      ant.decisions.push({
        position: freeNeighbors[i],
        score: neighborScores[i],
        chosen: equals(freeNeighbors[i], nextPos),
      });
    }
  }

  if (ant.type == 'ANT') {
    antDecideTask(game, ant, nextPos);
  } else if (ant.type == 'TERMITE') {
    termiteDecideTask(game, ant, nextPos);
  }
  queueAction(game, ant, makeAction(game, ant, 'MOVE', {nextPos}));
  return game;
}


const antDecideTask = (game, ant, nextPos): void => {
  const config = game.config[ant.playerID];
  // queens only wander
  if (ant.caste == 'QUEEN'&& ant.task != 'QUEEN_WANDER') {
    antSwitchTask(game, ant, 'QUEEN_WANDER');
    return;
  }
  // young queens only wander or alert or fly
  if (ant.caste == 'YOUNG_QUEEN' && ant.task == 'FLY_AWAY') {
    return;
  }
  if (
    ant.caste == 'YOUNG_QUEEN' && (ant.task != 'WANDER' && ant.task != 'DEFEND')
    && !config.youngQueensDoTasks
  ) {
    antSwitchTask(game, ant, 'WANDER');
    return;
  }

  const holdingFood = ant.holding != null && (ant.holding.type == 'FOOD' || ant.holding.type == 'VINE');
  const holdingDirt = ant.holding != null && ant.holding.type == 'DIRT';
  const holdingEgg = ant.holding != null && ant.holding.type == 'EGG';
  const holdingLarva = ant.holding != null && ant.holding.type == 'LARVA';
  const holdingPupa = ant.holding != null && ant.holding.type == 'PUPA';

  const pherAtCell = getPheromonesInCell(game.grid, nextPos, ant.playerID);

  // alert trumps all (except PATROL_DEFEND), switch to Defend
  if (
    (pherAtCell.QUEEN_ALERT > 0)
    && ant.task != 'DEFEND' && ant.task != 'PATROL_DEFEND'
    && pherAtCell.PATROL_DEFEND_PHER == 0
  ) {
    antPutdown(game, ant);
    antSwitchTask(game, ant, 'DEFEND');
    return;
  }
  // don't drop what you're doing for regular alert
  if (
    pherAtCell.ALERT && ant.holding == null
    && ant.task != 'DEFEND' && ant.task != 'PATROL_DEFEND'
    && pherAtCell.PATROL_DEFEND_PHER == 0
  ) {
    antSwitchTask(game, ant, 'DEFEND');
    return;
  }


  // stay on DEFEND if time on task < 70 milliseconds
  if (ant.task == 'DEFEND' && (ant.timeOnTask < 70 ||
    (pherAtCell.ALERT > 0 || pherAtCell.QUEEN_ALERT > 0))
    && pherAtCell.PATROL_DEFEND_PHER == 0
  ) {
    antPutdown(game, ant);
    return;
  }

  // switch back to wandering if defending without pheromone
  if (
    ant.task == 'DEFEND' && ant.timeOnTask > 70 &&
    pherAtCell.ALERT == 0 && pherAtCell.QUEEN_ALERT == 0
  ) {
    antSwitchTask(game, ant, 'WANDER');
    return;
  }
  if (
    ant.task == 'PATROL_DEFEND' &&
      (pherAtCell.PATROL_DEFEND_PHER == 0 || ant.holding != null)
  ) {
    antSwitchTask(game, ant, 'WANDER');
    return;
  }

  // Go on a raid
  if (ant.task != 'RAID' && pherAtCell.RAID_PHER > 0 && ant.holding == null) {
    antSwitchTask(game, ant, 'RAID');
    return;
  }

  // Stop raiding
  if (ant.task == 'RAID' && pherAtCell.RAID_PHER == 0) {
    antSwitchTask(game, ant, 'RETURN');
    return;
  }

  // go Retrieve food if on pheromone cell
  if (
    pherAtCell.FOOD > 0 && ant.holding == null &&
    (
      ant.task == 'WANDER' || ant.task == 'PATROL' ||
      ant.task == 'EXPLORE' || ant.task == 'RETURN'
    ) &&
    game.colonies[ant.playerID].taskNeed['RETRIEVE'] > 0
  ) {
    antSwitchTask(game, ant, 'RETRIEVE');
    return;
  }

  // go to dirt if on pheromone cell
  if (
    pherAtCell.MARKED_DIRT_PHER > 0 && ant.holding == null
    && (
      ant.task == 'WANDER' || ant.task == 'PATROL' ||
      ant.task == 'EXPLORE' || ant.task == 'RETURN'
    ) &&
    game.colonies[ant.playerID].taskNeed['GO_TO_DIRT'] > 0
  ) {
    antSwitchTask(game, ant, 'GO_TO_DIRT');
    return;
  }

  // if Returning but holding nothing, see if near-ish to token to switch to WANDER
  if (
    ant.task == 'RETURN' && ant.holding == null
    && inTokenInfluence(game, ant, 'COLONY')
  ) {
    antSwitchTask(game, ant, 'WANDER');
    return;
  }

  // switching tasks based on what you're holding
  if (holdingFood && (ant.task != 'RETURN' && ant.task != 'FEED_LARVA')) {
    const position = ant.holding.prevPosition != null
      ? ant.holding.prevPosition
      : ant.position;
    if (
      inTokenRadius(game, {...ant, position}, 'COLONY') &&
      game.colonies[ant.playerID].taskNeed['FEED_LARVA'] > 0
    ) {
      antSwitchTask(game, ant, 'FEED_LARVA');
    } else {
      antSwitchTask(game, ant, 'RETURN');
    }
    return;
  }
  // NOTE: this version lets ants dynamically switch to feeding larva
  // or returning depending on the feed larva need.
  // BUT only if you're on a COLONY producing square so that the pheromone
  // trail doesn't get messed up
  if (holdingFood) {
    const position = ant.holding.prevPosition != null
      ? ant.holding.prevPosition
      : ant.position;
    if (
      ant.task == 'RETURN' &&
      pherAtCell.COLONY == game.config[ant.playerID].COLONY.quantity &&
      game.colonies[ant.playerID].taskNeed['FEED_LARVA'] > 0
    ) {
      antSwitchTask(game, ant, 'FEED_LARVA');
    } else if (
      ant.task != 'RETURN' &&
      (ant.task == 'FEED_LARVA' && game.colonies[ant.playerID].taskNeed['FEED_LARVA'] < 0)
      // !inTokenRadius(game, {...ant, position}, 'COLONY'))
    ) {
      antSwitchTask(game, ant, 'RETURN');
    }
  }
  if (holdingEgg && ant.task != 'MOVE_EGG') {
    antSwitchTask(game, ant, 'MOVE_EGG');
  }
  if (holdingLarva && ant.task != 'MOVE_LARVA') {
    antSwitchTask(game, ant, 'MOVE_LARVA');
  }
  if (holdingPupa && ant.task != 'MOVE_PUPA') {
    antSwitchTask(game, ant, 'MOVE_PUPA');
  }
  if (holdingDirt && ant.task != 'MOVE_DIRT') {
    antSwitchTask(game, ant, 'MOVE_DIRT');
  }

  // if retrieving but off trail, switch to Return
  if (
    pherAtCell.FOOD == 0 && !holdingFood &&
    ant.task == 'RETRIEVE'
  ) {
    if (
      Math.random() < 0.5 &&
      game.colonies[ant.playerID].taskNeed['EXPLORE'] > 0
    ) {
      antSwitchTask(game, ant, 'EXPLORE');
    } else {
      antSwitchTask(game, ant, 'RETURN');
    }
    return;
  }

  // if going to dirt, but no more dirt pheromone, switch to Return
  if (
    pherAtCell.MARKED_DIRT_PHER == 0 && !holdingDirt &&
    ant.task == 'GO_TO_DIRT'
  ) {
    antSwitchTask(game, ant, 'RETURN');
    return;
  }

  // if Returning but holding nothing, switch to Wander if in QUEEN_PHER
  if (
    ant.holding == null && ant.task == 'RETURN' &&
    getPheromonesInCell(game.grid, ant.position, ant.playerID).QUEEN_PHER > 0
  ) {
    antSwitchTask(game, ant, 'WANDER');
    return;
  }

  // if Wandering and you are part of the non-player colony and your path
  // to the player colony is blocked, then switch to GO_TO_BLOCKAGE
  // with certain probability
  if (
    ant.task == 'WANDER' && ant.playerID != game.playerID &&
    getPheromoneAtPosition(game, ant.position, 'COLONY', game.playerID) == 0 &&
    Math.random() < 0.01
  ) {
    antSwitchTask(game, ant, 'GO_TO_BLOCKAGE');
    return;
  }

  // switch back out of this task if there's no more blockage
  if (
    ant.task == 'GO_TO_BLOCKAGE' &&
    getPheromoneAtPosition(game, ant.position, 'COLONY', game.playerID) > 0
  ) {
    antSwitchTask(game, ant, 'WANDER');
    return;
  }

  // if Wandering, switch to Exploring with certain probability
  if (
    ant.task == 'WANDER' && Math.random() < config.exploreRate &&
    !holdingFood && !holdingDirt &&
    game.colonies[ant.playerID].taskNeed['EXPLORE'] > 0
  ) {
    antSwitchTask(game, ant, 'EXPLORE');
    return;
  }

  // if Wandering, switch to Patrolling with certain probability
  if (
    ant.task == 'WANDER' && Math.random() < 0.1 &&
    ant.holding == null &&
    game.colonies[ant.playerID].taskNeed['PATROL'] > 0
  ) {
    antSwitchTask(game, ant, 'PATROL');
    return;
  }

  // if Exploring and near the queen, switch to wander
  if (
    ant.task == 'EXPLORE' &&
    getPheromonesInCell(game.grid, ant.position, ant.playerID).QUEEN_PHER > 0
  ) {
    antSwitchTask(game, ant, 'WANDER');
  }

  // if Exploring or Patrolling, but with negative task need, switch to return
  if (
    (ant.task == 'EXPLORE' && game.colonies[ant.playerID].taskNeed['EXPLORE'] < 0) ||
    (ant.task == 'PATROL' && game.colonies[ant.playerID].taskNeed['PATROL'] < 0)
  ) {
    antSwitchTask(game, ant, 'RETURN');
    return;
  }

  // if patrolling for a long time switch to return
  if (ant.task == 'PATROL' && ant.timeOnTask > 60 * 60 * 2) {
    antSwitchTask(game, ant, 'RETURN');
    return;
  }

  // PATROL_DEFEND (aka Rally)
  if (
    pherAtCell.PATROL_DEFEND_PHER > 0 && ant.holding == null
  ) {
    if (ant.task != 'PATROL_DEFEND') {
      antSwitchTask(game, ant, 'PATROL_DEFEND');
    }
    return;
  }

}

// TODO: HACK: termiteDecideTask shouldn't be in this file!
const termiteDecideTask = (game, termite, nextPos): void => {
  const config = game.config[termite.playerID];
  const holdingFood = termite.holding != null && termite.holding.type == 'FOOD';
  const holdingEgg = termite.holding != null && termite.holding.type == 'TERMITE_EGG';

  const pherAtCell = getPheromonesInCell(game.grid, nextPos, termite.playerID);

  // alert trumps all, switch to Defend
  if (pherAtCell.ALERT > 0) {
    antPutdown(game, termite);
    antSwitchTask(game, termite, 'DEFEND');
    return;
  }

  // switch back to wandering if defending without pheromone
  if (termite.task == 'DEFEND' && pherAtCell.ALERT == 0) {
    antSwitchTask(game, termite, 'WANDER');
    return;
  }

  if (holdingEgg && termite.task != 'MOVE_EGG') {
    antSwitchTask(game, termite, 'MOVE_EGG');
  }
  if (!holdingEgg && termite.task == 'MOVE_EGG') {
    antSwitchTask(game, termite, 'WANDER');
  }
};

module.exports = {
  antPickup,
  antPickupNeighbor,
  antPutdown,
  antDecideMove,
  antSwitchTask,
  antLayEgg,
};

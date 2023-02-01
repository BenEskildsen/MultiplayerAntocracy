const {
  add,
  subtract,
  vectorTheta,
  makeVector,
  containsVector,
  dist,
  equals,
  magnitude,
  round
} = require('../utils/vectors');
const globalConfig = require('../config');
const {
  closeTo,
  thetaToDir,
  isDiagonalMove
} = require('../utils/helpers');
const {
  addEntity,
  removeEntity,
  moveEntity,
  pickupEntity,
  putdownEntity,
  rotateEntity,
  changeEntityType,
  addSegmentToEntity
} = require('../simulation/entityOperations');
const {
  lookupInGrid,
  getPheromonesInCell,
  insideGrid,
  entityInsideGrid,
  getEntityPositions
} = require('../utils/gridHelpers');
const {
  collides,
  collidesWith
} = require('../selectors/collisions');
const {
  getPositionsInFront,
  getPositionsBehind,
  getQueen,
  isFacing,
  getQueenBiteAction,
  isOnSpiderWeb,
  getEntityBlockingTypes,
  canDoMove,
  canLayFood
} = require('../selectors/misc');
const {
  getPheromoneAtPosition
} = require('../selectors/pheromones');
const {
  inTokenRadius,
  inTokenInfluence,
  getToken
} = require('../selectors/tokens');
const {
  getMaxFrameOffset
} = require('../selectors/sprites');
const {
  getNeighborPositions,
  getNeighborEntities,
  areNeighbors,
  getFreeNeighborPositions,
  getNeighborEntitiesAndPosition
} = require('../selectors/neighbors');
const {
  fillPheromone
} = require('../simulation/pheromones');
const {
  oneOf,
  weightedOneOf
} = require('../utils/stochastic');
const {
  makeAction,
  isActionTypeQueued,
  queueAction,
  stackAction,
  cancelAction
} = require('../simulation/actionQueue');
const {
  antLayEgg,
  antPickupNeighbor,
  antPickup,
  antPutdown,
  antDecideMove,
  antSwitchTask
} = require('../simulation/antOperations');
const {
  dealDamageToEntity,
  addTrapjaw,
  removeTrapjaws
} = require('../simulation/miscOperations');
const {
  makeFood,
  makeTermiteEgg,
  makeCritterEgg
} = require('../entities/makeEntity');
const {
  footFall,
  footStomp,
  footLift
} = require('../simulation/footOperations');
const {
  getEntityConfig
} = require('../selectors/config');
const critterStartCurrentAction = (game, entity) => {
  var _curAction$payload;
  if (entity.actions.length == 0) return;
  const curAction = entity.actions[0];
  curAction.effectDone = true;
  switch (curAction.type) {
    case 'PICKUP':
      {
        if (curAction.payload != null) {
          const {
            pickupID,
            position
          } = curAction.payload;
          const pickup = game.entities[pickupID];
          if (pickup.position != null) {
            antPickup(game, entity, pickup, position);
          }
        } else {
          antPickupNeighbor(game, entity);
        }
        break;
      }
    case 'PUTDOWN':
      antPutdown(game, entity, curAction === null || curAction === void 0 ? void 0 : (_curAction$payload = curAction.payload) === null || _curAction$payload === void 0 ? void 0 : _curAction$payload.position);
      break;
    case 'FEED':
      antFeedNeighbor(game, entity);
      break;
    case 'MOVE_TURN':
      if (!closeTo(entity.theta, curAction.payload.nextTheta)) {
        rotateEntity(game, entity, curAction.payload.nextTheta);
      }
    // fall-through
    case 'MOVE':
      {
        if (equals(entity.position, curAction.payload.nextPos)) break;
        if (entity.type == 'FOOT') {
          // if foot, just do the move
          moveEntity(game, entity, curAction.payload.nextPos);
          break;
        }
        entityDoMove(game, entity, curAction.payload.nextPos);
        const {
          maxFrameOffset,
          frameStep
        } = getMaxFrameOffset(game, entity);
        if (maxFrameOffset != 0) {
          entity.frameOffset = (entity.frameOffset + maxFrameOffset) % (maxFrameOffset + frameStep);
        }
        break;
      }
    case 'TURN':
      rotateEntity(game, entity, curAction.payload);
      break;
    case 'LAY':
      if (curAction.payload.slice(0, 7) == 'TERMITE') {
        termiteLayEgg(game, entity, curAction.payload);
      } else if (globalConfig.config.critterTypes.includes(curAction.payload)) {
        critterLayEgg(game, entity, curAction.payload);
      } else {
        antLayEgg(game, entity, curAction.payload);
      }
      break;
    case 'BITE':
      if (curAction.fromServer) {
        entityFight(game, entity, game.entities[curAction.payload.id]);
      } else {
        entityFight(game, entity, curAction.payload);
      }
      break;
    case 'DIE':
      removeTrapjaws(game, entity);
      entityDie(game, entity);
      break;
    case 'DASH':
      {
        if (equals(entity.position, curAction.payload.nextPos)) {
          break;
        }
        if (!isFacing(entity, curAction.payload.nextPos)) {
          break;
        }
        const didMove = entityDoMove(game, entity, curAction.payload.nextPos);
        if (didMove) {
          // HACK: if this is here, queen's sprites are offset after an odd number of dashes
          // const {maxFrameOffset, frameStep} = getMaxFrameOffset(game, entity);
          // if (maxFrameOffset != 0) {
          //   entity.frameOffset = (entity.frameOffset + maxFrameOffset)
          //     % (maxFrameOffset + frameStep);
          // }
        }
        const entityAction = getQueenBiteAction(game, entity);
        if (!didMove) {
          entity.actions = [];
          entity.prevActionType = 'DASH';
          if (entityAction.type == 'BITE') {
            queueAction(game, entity, entityAction);
            critterStartCurrentAction(game, entity);
          }
        } else if (entity.actions.length == 1 && entityAction.type == 'BITE') {
          queueAction(game, entity, entityAction);
        }
        break;
      }
    case 'WHIRLWIND':
      {
        // find all targets
        const targets = getNeighborEntities(game, entity, true /* external */).filter(e => e.hp > 0);
        // deal damage and apply stun
        for (const target of targets) {
          dealDamageToEntity(game, target, entity.damage);
          if (target.hp > 0) {
            if (entity.type != 'ANT' || game.config[entity.playerID].queenStun) {
              queueAction(game, target, makeAction(game, target, 'STUN'));
            }
          }
        }
        break;
      }
    case 'STUN':
      {
        // do nothing
        break;
      }
    case 'GRAPPLE':
      {
        if (curAction.fromServer) {
          entityFight(game, entity, game.entities[curAction.payload.id]);
        } else {
          entityFight(game, entity, curAction.payload);
        }
        break;
      }
    case 'FALL':
      {
        footFall(game, entity);
        break;
      }
    case 'STOMP':
      {
        footStomp(game, entity);
        break;
      }
    case 'LIFT':
      {
        footLift(game, entity);
        break;
      }
    case 'BURROW_HOME':
      {
        burrowHome(game, entity, curAction.payload);
        break;
      }
  }
};
const burrowHome = (game, ant, pheromoneType) => {
  const token = getToken(game, ant.playerID, pheromoneType);
  if (!token) return;
  if (!token.position) return;
  ant.position = token.position;
  return;
};

/**
 * returns true if it was able to do the move
 */
const entityDoMove = (game, entity, nextPos) => {
  // opportunity to get unstuck
  if (entity.stuck && entity.segmented != true) {
    if (Math.random() < game.config.spiderWebStuckProbability) {
      entity.stuck = false;
    } else {
      return false;
    }
  }

  // HACK: let queen dash through things
  const curAction = entity.actions[0] ? entity.actions[0].type : 'NONE';
  if (entity.caste == 'QUEEN' && curAction == 'DASH' && game.config[entity.playerID].queenArmored) {
    // HACK: deal the damage along the path here
    const collisions = collidesWith(game, entity, [...globalConfig.config.critterTypes, 'EGG', 'CRITTER_EGG', 'LARVA', 'PUPA', 'TERMITE_EGG', 'FOOD', 'ANT', 'TERMITE']);
    for (const e of collisions) {
      if (e.playerID != entity.playerID) {
        const mult = e.type == 'ANT' ? 2 : 0.5;
        dealDamageToEntity(game, e, entity.damage * mult);
      }
    }
  }
  const isMoveLegal = canDoMove(game, entity, nextPos);
  if (isMoveLegal.result == false && isMoveLegal.reason == 'OUTSIDE_GRID') {
    cancelAction(game, entity);
    return false;
  }
  const nextTheta = vectorTheta(subtract(entity.position, nextPos));
  if (isMoveLegal.result == false && isMoveLegal.reason == 'BLOCKED') {
    cancelAction(game, entity);
    if (!isFacing(entity, nextPos)) {
      stackAction(game, entity, makeAction(game, entity, 'TURN', nextTheta));
      critterStartCurrentAction(game, entity);
    }
    return false;
  }

  // Don't do move if not facing position you want to go to
  const thetaDiff = Math.abs(nextTheta - entity.theta) % (2 * Math.PI);
  if (!isFacing(entity, nextPos)) {
    if (entity.caste == 'QUEEN' && entity.playerID == game.playerID) {
      // enables turning in place off a single button press
      cancelAction(game, entity);
    }
    if (thetaDiff <= Math.PI / 2 + 0.1 && entity.type == 'ANT') {
      cancelAction(game, entity);
      stackAction(game, entity, makeAction(game, entity, 'MOVE_TURN', {
        nextTheta,
        nextPos
      }));
    } else {
      const thetaDiff = Math.abs(entity.theta - nextTheta) % (2 * Math.PI);
      stackAction(game, entity, makeAction(game, entity, 'TURN', nextTheta));
      // NOTE: for critters turning 180 degrees, do it as two turns
      if (game.config.critterTypes.includes(entity.type) && closeTo(thetaDiff, Math.PI)) {
        stackAction(game, entity, makeAction(game, entity, 'TURN', thetaDiff / 2 + entity.theta));
      }
    }
    critterStartCurrentAction(game, entity);
    return false;
  }

  // don't do food pheromone any more if there's no colony pheromone
  if (entity.type == 'ANT' && entity.holding != null && entity.holding.type == 'FOOD' && getPheromoneAtPosition(game, entity.position, 'COLONY', entity.playerID) == 0) {
    entity.foodPherQuantity = 0;
  }
  moveEntity(game, entity, nextPos);

  // opportunity to get stuck
  if (isOnSpiderWeb(game, entity) && entity.type != 'SPIDER' && Math.random() < game.config.spiderWebStuckProbability) {
    entity.stuck = true;
  }
  return true;
};
const entityFight = (game, entity, target) => {
  var _game$config$entity$p;
  if (!areNeighbors(game, entity, target)) return;
  if (target.type.slice(0, 4) === 'DEAD') return;
  if (target.position == null) return;
  let isFacingAtAll = false;
  getEntityPositions(game, target).forEach(pos => {
    getPositionsInFront(game, entity).forEach(fp => {
      if (equals(pos, fp)) {
        isFacingAtAll = true;
      }
    });
  });
  if (!isFacingAtAll) {
    let nextTheta = vectorTheta(subtract(entity.position, target.position));
    getEntityPositions(game, target).forEach(pos => {
      getNeighborPositions(game, entity).forEach(fp => {
        if (equals(pos, fp)) {
          nextTheta = vectorTheta(subtract(entity.position, fp));
        }
      });
    });
    // HACK: isFacing doesn't quite working for some diagonal directions,
    // so if you're already facing the direction you should be, then just let
    // the attack go through
    if (!closeTo(entity.theta, nextTheta)) {
      stackAction(game, entity, makeAction(game, entity, 'TURN', nextTheta));
      critterStartCurrentAction(game, entity);
      return;
    }
  }
  let damage = entity.damage;
  if (entity.actions.length > 0 && entity.actions[0].type == 'GRAPPLE') {
    damage = 0.34;
  }
  // armored queen takes half damage from the front
  if (target.caste == 'QUEEN' && game.config[target.playerID].queenArmored) {
    let inFront = false;
    const posInFront = getPositionsInFront(game, target);
    for (const p of getEntityPositions(game, entity)) {
      for (const i of posInFront) {
        if (equals(p, i)) {
          inFront = true;
        }
      }
    }
    if (inFront) {
      damage /= 2;
    }
  }

  // dash deals double damage
  if (entity.prevActionType == 'DASH') {
    damage *= 4;
  }
  dealDamageToEntity(game, target, damage);

  // Spiked larva
  if (target.hp <= 0 && target.type == 'LARVA' && game.config[target.playerID].spikedLarva) {
    dealDamageToEntity(game, entity, game.config[target.playerID].spikedLarva);
  }

  // Centipedes grow when they kill things
  if (entity.type == 'CENTIPEDE' && target.hp <= 0) {
    const lastSegmentPos = entity.segments[entity.segments.length - 1];
    addSegmentToEntity(game, entity, add(lastSegmentPos, Math.random() < 0.5 ? {
      x: 1,
      y: 0
    } : {
      x: 0,
      y: 1
    }));
  }

  // Roly Polies roll up when attacked
  if (target.type == 'ROLY_POLY') {
    target.rolled = true;
  }

  // ALERT pheromone
  if ((entity.type == 'ANT' || entity.type == 'TERMITE') && (entity.timeOnTask < 700 || entity.task != 'DEFEND') && target.type != 'VINE') {
    getEntityPositions(game, entity).forEach(pos => fillPheromone(game, pos, 'ALERT', entity.playerID));
  }

  // Trapjaw ants
  if ((_game$config$entity$p = game.config[entity.playerID]) !== null && _game$config$entity$p !== void 0 && _game$config$entity$p.trapjaw && entity.caste == 'MINIMA' && target.caste != 'MINIMA' && target.caste != 'SUB_MINIMA' && target.caste != 'TERMITE_WORKER') {
    addTrapjaw(game, target, entity);
  }

  // Queen can stun
  if (entity.caste == 'QUEEN' && game.config[entity.playerID].queenStun) {
    queueAction(game, target, makeAction(game, target, 'STUN'));
  }

  // attacked ants holding stuff put it down
  if (target.holding != null) {
    queueAction(game, target, makeAction(game, target, 'PUTDOWN'));
  }
};
const entityDie = (game, entity) => {
  if (entity.holding != null) {
    putdownEntity(game, entity.holding, entity.position);
  }

  // emit acid:
  if (entity.caste == 'MINIMA' && game.config[entity.playerID].acidDeath) {
    getEntityPositions(game, entity).forEach(pos => fillPheromone(game, pos, 'ACID', entity.playerID));
  }

  // turn into food:
  if (game.config.critterTypes.includes(entity.type) || entity.type == 'TERMITE') {
    // not numCritters > 0 because entity isn't dead yet
    const positions = getEntityPositions(game, entity);
    for (const pos of positions) {
      addEntity(game, makeFood(game, pos));
    }
  }

  // destroy spider web
  if (entity.type == 'SPIDER') {
    const web = lookupInGrid(game.grid, entity.position).map(id => game.entities[id]).filter(e => e.type == 'SPIDER_WEB')[0];
    if (web != null) {
      removeEntity(game, web);
    }
  }

  // update taskNeed:
  if (entity.task != null) {
    if (entity.task == 'EXPLORE' || entity.task == 'RETRIEVE' || entity.task == 'GO_TO_DIRT' || entity.task == 'FEED_LARVA') {
      game.colonies[entity.playerID].taskNeed[entity.task] += 1;
    }
  }
  const deadType = 'DEAD_' + entity.type;
  if (!globalConfig.config.entityTypes.includes(deadType)) {
    removeEntity(game, entity);
    return;
  }
  entity.actions = [];
  changeEntityType(game, entity, entity.type, deadType);
};
const termiteLayEgg = (game, termite, layingCaste) => {
  const config = game.config[termite.playerID];
  const positions = getPositionsBehind(game, termite);
  for (const eggPosition of positions) {
    const occupied = lookupInGrid(game.grid, eggPosition).filter(id => termite.id != id).length > 0;
    const inGrid = insideGrid(game.grid, eggPosition);
    if (!occupied && inGrid && thetaToDir(termite.theta) != null) {
      const egg = makeTermiteEgg(game, eggPosition, termite.playerID, layingCaste);
      addEntity(game, egg);
      termite.eggCharges--;
      termite.eggLayingCooldown = config.eggLayingCooldown;
      return game;
    }
  }
  cancelAction(game, termite);
  return game;
};
const critterLayEgg = (game, critter) => {
  const config = game.config;
  const positions = getPositionsBehind(game, critter);
  for (const eggPosition of positions) {
    const occupied = lookupInGrid(game.grid, eggPosition).map(id => game.entities[id]).filter(e => e.id != critter.id && e.type.slice(0, 4) != 'DEAD' && e.type != 'BACKGROUND').length > 0;
    const inGrid = insideGrid(game.grid, eggPosition);
    if (!occupied && inGrid && thetaToDir(critter.theta) != null) {
      const egg = makeCritterEgg(game, eggPosition, critter.type);
      addEntity(game, egg);
      critter.eggCharges--;
      critter.totalEggsLaid++;
      return game;
    }
  }
  cancelAction(game, critter);
  return game;
};

// ----------------------------------------------------------------------
// Deciding actions
// ----------------------------------------------------------------------

const critterDecideAction = (game, entity) => {
  const config = getEntityConfig(game, entity);
  // biting
  const targets = getNeighborEntities(game, entity, true /* external */).filter(e => {
    if (e.position == null) return false;
    return e.type == 'ANT' || e.type == 'EGG' || e.type == 'LARVA' || e.type == 'PUPA' || e.type == 'TERMITE' || e.type == 'TERMITE_EGG';
  });

  // critters with 0 damage don't fight,
  // and nothing fights in presence of DOMESTICATE pheromone
  // and aphids only fight if they've taken damage
  let domPher = false;
  for (const pos of getEntityPositions(game, entity)) {
    if (getPheromoneAtPosition(game, entity.position, 'DOMESTICATE', game.playerID) > 0) {
      domPher = true;
    }
  }
  const attackAphid = entity.type == 'APHID' && entity.hp < config.hp || entity.type != 'APHID';
  if (targets.length > 0 && config.damage > 0 && (!domPher || entity.type == 'SCORPION') && attackAphid) {
    const target = oneOf(targets);
    if (entity.type == 'SCORPION') {
      if (entity.attackIndex % 4 == 0) {
        queueAction(game, entity, makeAction(game, entity, 'WHIRLWIND', null));
        queueAction(game, entity, makeAction(game, entity, 'STUN', null));
      } else {
        queueAction(game, entity, makeAction(game, entity, 'BITE', target));
        queueAction(game, entity, makeAction(game, entity, 'STUN', null));
      }
      entity.attackIndex += 1;
    } else if (entity.type == 'SPIDER') {
      queueAction(game, entity, makeAction(game, entity, 'BITE', target));
      queueAction(game, entity, makeAction(game, entity, 'STUN', null));
    } else {
      queueAction(game, entity, makeAction(game, entity, 'BITE', target));
    }
    return;
  }

  // laying eggs
  const maxEggs = globalConfig.config[entity.type].maxEggs;
  const cooldown = globalConfig.config[entity.type].eggLayingCooldown;
  const maxSegments = globalConfig.config[entity.type].maxSegments || 0;
  if (entity.eggCharges > 0 && entity.age > (maxEggs - entity.eggCharges + 1) * cooldown && (entity.type != 'WORM' || entity.segments.length >= maxSegments)) {
    if (!isActionTypeQueued(entity, 'LAY')) {
      queueAction(game, entity, makeAction(game, entity, 'LAY', entity.type));
    }
  }

  // laying food
  if (entity.type == 'APHID' && domPher) {
    if (entity.foodLayingCooldown < 0) {
      entity.foodLayingCooldown = config.foodLayingCooldown;
      const positions = getPositionsBehind(game, entity);
      for (const pos of positions) {
        const occupied = lookupInGrid(game.grid, pos).filter(id => entity.id != id).length > 0;
        const inGrid = insideGrid(game.grid, pos);
        if (!occupied && inGrid && thetaToDir(entity.theta, true) != null) {
          addEntity(game, makeFood(game, pos));
        }
      }
    } else {
      entity.foodLayingCooldown -= game.timeSinceLastTick;
    }
  }

  // rolled up roly polies don't move
  if (entity.rolled) {
    if (entity.prevHPAge > 5000) {
      entity.rolled = false;
    }
    return;
  }

  // moving
  let freeNeighbors = getFreeNeighborPositions(game, entity, getEntityBlockingTypes(game, entity));
  // segmented entities don't move diagonally
  if (entity.segmented) {
    freeNeighbors = freeNeighbors.filter(pos => !isDiagonalMove(entity.position, pos));
  }
  if (Math.random() < 0.1 && freeNeighbors.length > 0) {
    let nextPos = oneOf(freeNeighbors);
    const forwardPosition = add(entity.position, round(makeVector(entity.theta, 1)));
    const forwardFree = freeNeighbors.filter(v => equals(v, forwardPosition)).length > 0;
    if (forwardFree && Math.random() < 0.66) {
      nextPos = forwardPosition;
    }
    queueAction(game, entity, makeAction(game, entity, 'MOVE', {
      nextPos
    }));
    if (entity.type == 'SPIDER') {
      queueAction(game, entity, makeAction(game, entity, 'STUN', null));
    }
    return;
  } else if (freeNeighbors.length == 0) {
    entity.prevPosition = {
      ...entity.position
    };
    if (entity.segmented) {
      entity.stuck = true;
    }
    return;
  }
  if (entity.stuck && freeNeighbors.length > 0 && entity.segmented) {
    entity.stuck = false;
  }
};

// TODO: decide how to make antFeedNeighbor more generalized
const antFeedNeighbor = (game, ant) => {
  if (ant.holding == null) return game;
  if (ant.holding.type != 'FOOD') return game;
  const neighboringLarva = getNeighborPositions(game, ant, true /* external */).map(pos => {
    return lookupInGrid(game.grid, pos).filter(id => game.entities[id].type == 'LARVA')[0];
  }).filter(id => id != null).map(id => game.entities[id]).filter(l => l.foodNeed > 0);
  const facingLarva = neighboringLarva.filter(l => isFacing(ant, l.position));
  if (neighboringLarva.length == 0) return game;
  let toFeed = facingLarva[0];
  if (toFeed == null) {
    toFeed = neighboringLarva[0];
    const nextTheta = vectorTheta(subtract(ant.position, toFeed.position));
    stackAction(game, ant, makeAction(game, ant, 'TURN', nextTheta));
    critterStartCurrentAction(game, ant);
    return game;
  }
  toFeed.foodNeed--;
  const food = ant.holding;
  // allow holding more than 1 thing
  ant.holdingIDs.pop();
  if (ant.holdingIDs.length == 0) {
    ant.holding = null;
  } else {
    ant.holding = game.entities[ant.holdingIDs[ant.holdingIDs.length - 1]];
  }
  removeEntity(game, food);
  if (ant.task != 'FEED_LARVA') {
    // This can cause taskNeed for feeding larva to go negative,
    // but is kind of fine because the ants already doing the FEED_LARVA
    // task will just still try to feed larva until new ones come which will
    // eventually bring the taskNeed back to 0
    game.colonies[ant.playerID].taskNeed['FEED_LARVA'] -= 1;
  }
  // antSwitchTask(game, ant, 'WANDER');
  antSwitchTask(game, ant, 'RETURN');
  return game;
};
const antDecideAction = (game, ant) => {
  const config = getEntityConfig(game, ant);

  // trapjawing ants don't do anything
  if (ant.position == null) return;

  // allow queen to feed
  if (ant.holding != null) {
    // FEED
    const neighboringLarva = getNeighborPositions(game, ant, true /* external */).map(pos => {
      return lookupInGrid(game.grid, pos).filter(id => game.entities[id].type == 'LARVA')[0];
    }).filter(id => id != null).map(id => game.entities[id]).filter(l => l.foodNeed > 0);
    if (ant.holding.type == 'FOOD' && neighboringLarva.length > 0) {
      queueAction(game, ant, makeAction(game, ant, 'FEED'));
      return;
    }
  }

  // don't do anything else if this ant is the player's queen
  if (ant.caste == 'QUEEN' && game.players[ant.playerID].type == 'HUMAN' && !ant.autopilot) {
    const token = game.TOKEN.map(id => game.entities[id]).filter(t => t.pheromoneType == 'QUEEN_FOLLOW' && t.playerID == game.playerID)[0];
    // queen moves "automatically" if the token exists, ie uses this function
    if (token != null) {
      antDecideMove(game, ant);
    }
    return;
  }

  // if this is a honeypot ant, the affix to dirt or stone
  // AND if affixed, then lay food every once in a while
  if (ant.caste == 'HONEY_POT') {
    if (!ant.affixed) {
      // see if you should affix
      if (canLayFood(game, ant)) {
        const positions = getPositionsInFront(game, ant);
        for (const pos of positions) {
          const occupied = lookupInGrid(game.grid, pos).filter(id => ant.id != id).map(id => game.entities[id]).filter(e => e.type == 'DIRT' || e.type == 'STONE').length > 0;
          const inGrid = insideGrid(game.grid, pos);
          if (occupied && inGrid && thetaToDir(ant.theta, true) != null) {
            ant.affixed = true;
            return; // affixed honeypots don't move
          }
        }
      }
    } else {
      // laying food
      if (ant.foodLayingCooldown < 0) {
        ant.foodLayingCooldown = config.foodLayingCooldown;
        const positions = getPositionsBehind(game, ant);
        for (const pos of positions) {
          const occupied = lookupInGrid(game.grid, pos).filter(id => ant.id != id).length > 0;
          const inGrid = insideGrid(game.grid, pos);
          if (!occupied && inGrid && thetaToDir(ant.theta, true) != null) {
            addEntity(game, makeFood(game, pos));
          }
        }
      } else {
        ant.foodLayingCooldown -= game.timeSinceLastTick;
      }
      return; // affixed honeypots don't move
    }
  }

  // FIGHT
  if (ant.holding == null &&
  // getPheromoneAtPosition(game, ant.position, 'PATROL_DEFEND_PHER', ant.playerID) == 0 &&
  // ^^ handle only based on task, not pheromone
  config.damage > 0) {
    const domPher = getPheromoneAtPosition(game, ant.position, 'DOMESTICATE', ant.playerID) > 0;
    const rallyPher = getPheromoneAtPosition(game, ant.position, 'PATROL_DEFEND_PHER', ant.playerID) > 0;
    const targets = getNeighborEntities(game, ant, true).filter(e => {
      if (e.position == null) return false;
      if (isDiagonalMove(ant.position, e.position) && e.type == 'ANT' && e.caste == 'MINIMA') return false;
      return game.config.critterTypes.includes(e.type) && !domPher || e.type == 'ANT' && e.playerID != ant.playerID || e.type == 'TERMITE' && e.playerID != ant.playerID ||
      // (e.type == 'FOOT' && e.state == 'stomping') ||
      // ants alerted by the queen will attack anything with hp
      e.playerID != ant.playerID && e.hp > 0 && e.type != 'FOOT' && getPheromoneAtPosition(game, ant.position, 'QUEEN_ALERT', ant.playerID) > 0 && ant.task == 'DEFEND';
    });
    if (targets.length > 0 && ant.task != 'PATROL_DEFEND' && !rallyPher) {
      // always prefer to grapple if possible
      let filteredTargets = targets.filter(t => {
        if (ant.caste != 'MINIMA') return true;
        return t.caste == 'MINIMA';
      });
      let shouldFight = true;
      let target = filteredTargets.length > 0 ? oneOf(filteredTargets) : oneOf(targets);
      let actionType = 'BITE';
      if (target.caste == 'MINIMA' && ant.caste == 'MINIMA' || target.caste == 'TERMITE_WORKER' && ant.caste == 'MINIMA'
      // || (target.caste == 'MEDIA' && ant.caste == 'MEDIA')
      ) {
        // special case for queen with break up grapple ability
        if (getPheromoneAtPosition(game, ant.position, 'QUEEN_DISPERSE', ant.playerID) > 0 || getPheromoneAtPosition(game, ant.position, 'QUEEN_DISPERSE', target.playerID) > 0) {
          if (ant.playerID == game.playerID && game.config[playerID].queenBreaksUpGrapple) {
            actionType = 'BITE';
          } else {
            shouldFight = false;
          }
        } else {
          actionType = 'GRAPPLE';
        }
      }
      if (shouldFight) {
        // special case for CPU queens w/whirlwind or dash ability
        if (ant.caste == 'QUEEN' && game.config[ant.playerID].queenAbilities.includes('JUMP') && Math.random() < 0.2) {
          actionType = 'DASH';
          target = {
            nextPos: {
              ...target.position
            }
          };
        }
        if (ant.caste == 'QUEEN' && game.config[ant.playerID].queenAbilities.includes('WHIRLWIND') && Math.random() < 0.2) {
          actionType = 'WHIRLWIND';
        }
        queueAction(game, ant, makeAction(game, ant, actionType, target));
        return;
      }
    }
  }

  // PICKUP
  if (ant.holdingIDs.length < config.maxHold) {
    // cpu queen
    if (ant.caste == 'QUEEN') {
      antDecideMove(game, ant);
      return;
    }
    antPickupNeighbor(game, ant);

    // EXAMINE
    if (ant.caste == 'MINIMA' && ant.actions.length == 0 && ant.task == 'WANDER' && getPheromoneAtPosition(game, ant.position, 'QUEEN_PHER', ant.playerID) == 0) {
      const posRight = round(add(ant.position, makeVector(ant.theta - Math.PI / 2, 1)));
      let examiningRight = false;
      if (insideGrid(game.grid, posRight)) {
        const rightOccupied = lookupInGrid(game.grid, posRight).map(id => game.entities[id]).filter(e => getEntityConfig(game, ant).blockingTypes.includes(e.type)).length > 0;
        if (rightOccupied && Math.random() < 0.33) {
          queueAction(game, ant, makeAction(game, ant, 'EXAMINE', 'right'));
          examiningRight = true;
        }
      }
      const posLeft = round(add(ant.position, makeVector(ant.theta + Math.PI / 2, 1)));
      if (insideGrid(posLeft)) {
        const leftOccupied = lookupInGrid(game.grid, posLeft).map(id => game.entities[id]).filter(e => getEntityConfig(game, ant).blockingTypes.includes(e.type)).length > 0;
        if (!examiningRight && leftOccupied && Math.random() < 0.33) {
          queueAction(game, ant, makeAction(game, ant, 'EXAMINE', 'left'));
        }
      }
    }
  }

  // PUTDOWN
  const holdingFood = ant.holding != null && ant.holding.type == 'FOOD';
  const holdingDirt = ant.holding != null && ant.holding.type == 'DIRT';
  const holdingEgg = ant.holding != null && ant.holding.type == 'EGG';
  const holdingLarva = ant.holding != null && ant.holding.type == 'LARVA';
  const holdingPupa = ant.holding != null && ant.holding.type == 'PUPA';
  if (ant.holding != null) {
    const possiblePutdownPositions = getNeighborPositions(game, ant, true /*external*/);
    for (const putdownPos of possiblePutdownPositions) {
      const putdownLoc = {
        position: putdownPos,
        playerID: ant.playerID
      };
      const occupied = lookupInGrid(game.grid, putdownPos).map(id => game.entities[id]).filter(e => {
        return e.type.slice(0, 4) != 'DEAD' && e.type != 'BACKGROUND' && e.type != 'SPIDER_WEB' && e.type != 'ANT';
      }).length > 0;
      const nextTheta = vectorTheta(subtract(ant.position, putdownPos));

      // if Returning and near colony token, put down
      const fQ = game.config[ant.playerID].COLONY.quantity;
      if (ant.task == 'RETURN' && (inTokenRadius(game, putdownLoc, 'COLONY') || getPheromoneAtPosition(game, putdownLoc.position, 'COLONY', ant.playerID) == fQ) && !occupied) {
        if (!isFacing(ant, putdownPos)) {
          queueAction(game, ant, makeAction(game, ant, 'TURN', nextTheta));
        }
        queueAction(game, ant, makeAction(game, ant, 'PUTDOWN', {
          position: putdownPos
        }));
        return;
      }
      // if holding dirt and near putdown token, put it down
      if ((holdingDirt || ant.task == 'MOVE_DIRT') && (inTokenRadius(game, putdownLoc, 'DIRT_DROP') || getPheromoneAtPosition(game, putdownPos, 'DIRT_DROP', ant.playerID) == game.config[ant.playerID]['DIRT_DROP'].quantity) && !occupied) {
        if (!isFacing(ant, putdownPos)) {
          queueAction(game, ant, makeAction(game, ant, 'TURN', nextTheta));
        }
        queueAction(game, ant, makeAction(game, ant, 'PUTDOWN', {
          position: putdownPos
        }));
        return;
      }
      // if holding egg and near putdown token, put it down
      if ((holdingEgg || ant.task == 'MOVE_EGG') && inTokenRadius(game, putdownLoc, 'EGG') && !occupied) {
        if (!isFacing(ant, putdownPos)) {
          queueAction(game, ant, makeAction(game, ant, 'TURN', nextTheta));
        }
        queueAction(game, ant, makeAction(game, ant, 'PUTDOWN', {
          position: putdownPos
        }));
        return;
      }
      // if holding larva and near putdown token, put it down
      if ((holdingLarva || ant.task == 'MOVE_LARVA') && inTokenRadius(game, putdownLoc, 'MOVE_LARVA_PHER') && !occupied) {
        if (!isFacing(ant, putdownPos)) {
          queueAction(game, ant, makeAction(game, ant, 'TURN', nextTheta));
        }
        queueAction(game, ant, makeAction(game, ant, 'PUTDOWN', {
          position: putdownPos
        }));
        return;
      }
      // if holding pupa and near putdown token, put it down
      if ((holdingPupa || ant.task == 'MOVE_PUPA') && inTokenRadius(game, putdownLoc, 'PUPA') && !occupied) {
        if (!isFacing(ant, putdownPos)) {
          queueAction(game, ant, makeAction(game, ant, 'TURN', nextTheta));
        }
        queueAction(game, ant, makeAction(game, ant, 'PUTDOWN', {
          position: putdownPos
        }));
        return;
      }
    }
  }

  // MOVE
  antDecideMove(game, ant);
};

// ----------------------------------------------------------------------
// Termites
// ----------------------------------------------------------------------

const termiteDecideAction = (game, termite) => {
  if (termite.caste == 'TERMITE_QUEEN') return;
  const config = game.config[termite.playerID];
  if (termite.holding == null) {
    // FIGHT
    const targets = getNeighborEntities(game, termite, true).filter(e => {
      return game.config.critterTypes.includes(e.type) || e.type == 'ANT' && e.playerID != termite.playerID || (e.type == 'LARVA' || e.type == 'EGG' || e.type == 'PUPA') && e.playerID != termite.playerID || e.type == 'TERMITE' && e.playerID != termite.playerID;
    });
    if (targets.length > 0) {
      const target = oneOf(targets);
      let actionType = 'BITE';
      if (target.caste == 'MINIMA' && termite.caste == 'TERMITE_WORKER' || target.caste == 'TERMITE_WORKER' && termite.caste == 'TERMITE_WORKER') {
        actionType = 'GRAPPLE';
      }
      queueAction(game, termite, makeAction(game, termite, actionType, oneOf(targets)));
      return;
    }
    // PICKUP
    antPickupNeighbor(game, termite);
  }
  const holdingFood = termite.holding != null && termite.holding.type == 'FOOD';
  const holdingEgg = termite.holding != null && termite.holding.type == 'TERMITE_EGG';
  const possiblePutdownPositions = getNeighborPositions(game, termite, true /*external*/);
  for (const putdownPos of possiblePutdownPositions) {
    const putdownLoc = {
      position: putdownPos,
      playerID: termite.playerID
    };
    const occupied = lookupInGrid(game.grid, putdownPos).length > 0;
    const nextTheta = vectorTheta(subtract(termite.position, putdownPos));

    // if holding egg and near putdown token, put it down
    if ((holdingEgg || termite.task == 'MOVE_EGG') && inTokenRadius(game, putdownLoc, 'EGG') && !occupied) {
      if (!isFacing(termite, putdownPos)) {
        queueAction(game, termite, makeAction(game, termite, 'TURN', nextTheta));
      }
      queueAction(game, termite, makeAction(game, termite, 'PUTDOWN'));
      return;
    }
  }
  antDecideMove(game, termite);
};
module.exports = {
  critterStartCurrentAction,
  critterDecideAction,
  antDecideAction,
  termiteDecideAction
};
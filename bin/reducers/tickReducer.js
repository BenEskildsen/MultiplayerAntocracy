const {
  fadeAllPheromones,
  computeAllPheromoneSteadyState,
  floodFillPheromone,
  reverseFloodFillPheromone,
  setPheromone,
  fillPheromone,
  clearPheromone,
  refreshPheromones
} = require('../simulation/pheromones');
const {
  randomIn
} = require('../utils/stochastic');
const {
  lookupInGrid,
  getEntityPositions,
  insideGrid
} = require('../utils/gridHelpers');
const {
  makeAction,
  isActionTypeQueued,
  getDuration,
  queueAction,
  stackAction,
  cancelAction
} = require('../simulation/actionQueue.js');
const {
  removeEntity,
  addEntity,
  changeEntityType,
  moveEntity,
  addSegmentToEntity
} = require('../simulation/entityOperations');
const {
  takeAcidDamage,
  removeTrapjaws
} = require('../simulation/miscOperations');
const {
  makeAnt,
  makeEgg,
  makeLarva,
  makePupa,
  makeTermite,
  makeBeetle,
  makeSpider,
  makeWorm,
  makeCentipede,
  makeRolyPoly,
  makeAphid,
  makeCaterpillar
} = require('../entities/makeEntity');
const {
  render
} = require('../render/render');
const {
  getQueen,
  getPosBehind,
  getPositionsInFront,
  onScreen,
  getPositionsBehind
} = require('../selectors/misc');
const {
  collides,
  collidesWith
} = require('../selectors/collisions');
const {
  add,
  equals,
  subtract,
  magnitude,
  scale,
  makeVector,
  vectorTheta,
  floor
} = require('../utils/vectors');
const {
  clamp,
  closeTo,
  encodePosition,
  decodePosition,
  thetaToDir
} = require('../utils/helpers');
const {
  getInterpolatedIndex,
  getDictIndexStr
} = require('../selectors/sprites');
const {
  critterStartCurrentAction,
  critterDecideAction,
  antDecideAction,
  termiteDecideAction
} = require('../simulation/critterOperations');
const {
  antSwitchTask
} = require('../simulation/antOperations');
const {
  getUnoccupiedPositionsInTokenRadius,
  getPositionsInTokenRadius,
  getNumFoodInTokenRadius,
  inTokenInfluence
} = require('../selectors/tokens');
const {
  getFreeNeighborPositions,
  areNeighbors
} = require('../selectors/neighbors');
const {
  getPheromoneAtPosition
} = require('../selectors/pheromones');
const {
  updateVines
} = require('../simulation/vineOperations');
const {
  updateSeeds
} = require('../simulation/seedOperations');
const {
  getEntityConfig
} = require('../selectors/config');
const globalConfig = require('../config');
let totalTime = 0;
const tickReducer = (game, action) => {
  switch (action.type) {
    case 'START_TICK':
      {
        if (game != null && game.tickInterval != null) {
          return game;
        }

        // keep timer working
        if (game.inCountdown) {
          game.countdownOffset = globalConfig.config.countdownMillis - game.countdownMillis;
          game.countdownStartTime = new Date().getTime();
        }
        game.prevTickTime = new Date().getTime();
        return {
          ...game,
          tickInterval: setInterval(
          // HACK: store is only available via window
          () => store.dispatch({
            type: 'TICK'
          }), game.config.msPerTick)
        };
      }
    case 'STOP_TICK':
      {
        clearInterval(game.tickInterval);
        game.tickInterval = null;
        return game;
      }
    case 'TICK':
      {
        return doTick(game);
      }
  }
  return game;
};

//////////////////////////////////////////////////////////////////////////
// Do Tick
//////////////////////////////////////////////////////////////////////////
const doTick = game => {
  const curTickTime = new Date().getTime();
  game.time += 1;

  // initializations
  if (game.time == 1) {
    game.prevTickTime = new Date().getTime();
    game.viewImage.allStale = true;
    computeAllPheromoneSteadyState(game);
    game.pheromoneWorker.postMessage({
      type: 'INIT',
      grid: game.grid,
      config: game.config,
      entities: game.entities,
      TOKEN: game.TOKEN,
      gridWidth: game.gridWidth,
      gridHeight: game.gridHeight,
      playerIDs: Object.keys(game.players)
    });

    // set queen to controlled entity
    if (game.controlledEntity == null) {
      game.controlledEntity = getQueen(game, game.playerID);
      game.focusedEntity = game.controlledEntity;
    }
  }

  // game/frame timing
  game.timeSinceLastTick = curTickTime - game.prevTickTime;
  keepControlledMoving(game);
  updatePlayerQueen(game);
  updateAnts(game);
  // updateCritters(game);
  // updateTermites(game);
  // updateCPUColonies(game);
  // updateFoot(game);
  // updateHose(game);
  // updateAntLifeCycles(game);
  // updateCritterLifeCycles(game);
  // updateTokens(game);
  updatePheromones(game);
  // updatePatrolTaskNeed(game);
  // updateVines(game);
  // updateSeeds(game);
  // updateGoToDirtTaskNeed(game);
  updateStaleTiles(game);
  updateViewPos(game, false /*don't clamp to world*/);
  updateCountdown(game);
  // updateRain(game);
  // updateRaids(game);

  render(game);

  // update timing frames
  game.totalGameTime += curTickTime - game.prevTickTime;
  game.prevTickTime = curTickTime;
  return game;
};

//////////////////////////////////////////////////////////////////////////
// Update Queen, ants, critters, and termites
//////////////////////////////////////////////////////////////////////////
const updatePlayerQueen = game => {
  const config = game.config;
  const queen = getQueen(game, game.playerID);
  const ability = queen.selectedAbility;
  if ((ability == 'MARK_DIRT' || ability == 'MARK_CHAMBER' || ability == 'MARK_DIRT_PUTDOWN') && queen.abilityActive) {
    queen.digCharge = Math.min(queen.digCharge + 0.04, config[queen.playerID].queenMaxDigCharge);
  }
  const pher = queen.selectedPheromone;
  if (queen.pheromoneActive && (pher == 'QUEEN_PHER' || pher == 'QUEEN_ALERT' || pher == 'PATROL_DEFEND_PHER' || pher == 'QUEEN_DISPERSE')) {
    if (game.time % 75 == 0) {
      getEntityPositions(game, queen).forEach(pos => fillPheromone(game, pos, pher, queen.playerID));
    }
  }
  // check for queen selected ability that isn't upgraded
  if (!config[queen.playerID].queenAbilities.includes(queen.selectedAbility)) {
    queen.selectedAbility = config[queen.playerID].queenAbilities[0];
  }
  // check for queen selected pheromone that isn't upgraded
  if (!config[queen.playerID].queenPheromones.includes(queen.selectedPheromone)) {
    queen.selectedPheromone = config[queen.playerID].queenPheromones[0];
  }
  // check for queen selected caste that she can't lay
  if (!config[queen.playerID].queenLayingCastes.includes(queen.selectedCaste)) {
    queen.selectedCaste = config[queen.playerID].queenLayingCastes[0];
  }
  const mouseToken = game.TOKEN.map(id => game.entities[id]).filter(t => t.pheromoneType == 'QUEEN_FOLLOW' && t.playerID == game.playerID)[0];
  if (mouseToken != null && areNeighbors(game, queen, mouseToken)) {
    removeEntity(game, mouseToken);
  }
};
const updateAnts = game => {
  const queen = getQueen(game, game.playerID);
  for (const id of game.ANT) {
    const ant = game.entities[id];
    // position is null if it's trapjawing
    if (ant.position == null) continue;
    takeAcidDamage(game, ant);
    if (ant.hp <= 0) {
      stackAction(game, ant, makeAction(game, ant, 'DIE', null));
    }
    ant.age++;
    ant.timeOnTask += 1;
    ant.prevHPAge += 1;

    // super majors destroy dirt
    if (ant.caste == 'MAJOR') {
      collidesWith(game, ant, ['DIRT']).forEach(dirt => {
        removeEntity(game, dirt);
      });
    }

    // young queens fly away after you upgrade
    if (ant.caste == 'YOUNG_QUEEN' && game.upgradedYoungQueens && ant.task != 'FLY_AWAY' && ant.playerID == game.playerID) {
      antSwitchTask(game, ant, 'FLY_AWAY');
    }
    if (ant.caste == 'YOUNG_QUEEN' && ant.task == 'FLY_AWAY' && ant.timeOnTask > randomIn(1500, 2000)) {
      game.totalYoungQueens++;
      removeEntity(game, ant);
      continue;
    }
    if (ant.actions.length == 0) {
      // antDecideAction(game, ant);
    }
    eggLaying(game, ant);
    stepAction(game, ant, antDecideAction);
  }

  // ants ganging up
  if (game.time % 10 == 0) {
    for (const id of game.ANT) {
      const ant = game.entities[id];
      // with certain probability, let damage from two attackers go through
      if (ant.hp - Math.floor(ant.hp) < 0.4 && Math.random() < 0.1) {
        ant.hp = Math.floor(ant.hp);
        continue;
      }
      ant.hp = Math.ceil(ant.hp);
    }
  }
};
const updateTermites = game => {
  for (const id of game.TERMITE) {
    const termite = game.entities[id];
    takeAcidDamage(game, termite);
    if (termite.hp <= 0) {
      stackAction(game, termite, makeAction(game, termite, 'DIE', null));
    }
    termite.age++;
    termite.timeOnTask += 1;
    termite.prevHPAge += 1;
    if (termite.actions.length == 0 && termite.caste != 'TERMITE_QUEEN') {
      termiteDecideAction(game, termite);
    }
    if (termite.caste == 'TERMITE_QUEEN' && game.time % 32 == 0) {
      getEntityPositions(game, termite).forEach(pos => fillPheromone(game, pos, 'QUEEN_PHER', termite.playerID));
    }
    eggLaying(game, termite);
    stepAction(game, termite, termiteDecideAction);
  }
};
const updateCritters = game => {
  for (const critterType of game.config.critterTypes) {
    for (const id of game[critterType]) {
      const critter = game.entities[id];
      takeAcidDamage(game, critter);
      critter.age += 1;
      // worms eat dirt:
      if (critter.type == 'WORM') {
        let ateDirt = false;
        collidesWith(game, critter, ['DIRT']).forEach(dirt => {
          removeEntity(game, dirt);
          ateDirt = true;
        });
        // worm growth
        if (ateDirt && Math.random() < game.config.WORM.growthRate && critter.segments.length < game.config.WORM.maxSegments) {
          const lastSegmentPos = critter.segments[critter.segments.length - 1];
          addSegmentToEntity(game, critter, add(lastSegmentPos, Math.random() < 0.5 ? {
            x: 1,
            y: 0
          } : {
            x: 0,
            y: 1
          }));
        }
      }

      // scorpions destroy dirt
      if (critter.type == 'SCORPION') {
        collidesWith(game, critter, ['DIRT']).forEach(dirt => {
          removeEntity(game, dirt);
        });
      }
      if (critter.hp <= 0) {
        queueAction(game, critter, makeAction(game, critter, 'DIE', null));
      }
      critter.prevHPAge += 1;
      if (critter.actions.length == 0) {
        critterDecideAction(game, critter);
      }
      stepAction(game, critter, critterDecideAction);
    }
  }
};

//////////////////////////////////////////////////////////////////////////
// Update hose, foot, cpu colonies
//////////////////////////////////////////////////////////////////////////
const updateHose = game => {
  for (const id of game.DOODAD) {
    const doodad = game.entities[id];
    if (doodad.sprite != 'HOSE') continue;
    if ((game.time + id) % globalConfig.config.hoseDripRate == 0) {
      const waterPos = add(doodad.position, {
        x: doodad.width,
        y: doodad.height - 1
      });
      fillPheromone(game, waterPos, 'WATER', game.playerID, globalConfig.config.hoseDripAmount);
    }
  }
};
const updateFoot = game => {
  if (game.FOOT.length > 0) {
    const foot = game.entities[game.FOOT[0]];
    foot.stompTicks--;
    // initiate foot fall
    if (foot.stompTicks <= 0 && foot.state == 'lifted' && foot.actions.length == 0) {
      // const queenOnTarget = collidesWith(game, queen, ['BACKGROUND']).length == 4;
      const queenOnTarget = onScreen(game, foot);
      if (queenOnTarget) {
        // const nextPos = {
        //   x: clamp(queen.position.x - game.config.FOOT.width/2, 0, game.gridWidth),
        //   y: clamp(queen.position.y - game.config.FOOT.height/2, 0, game.gridHeight),
        // };
        // queueAction(game, foot, makeAction(game, foot, 'MOVE', {nextPos}));
        queueAction(game, foot, makeAction(game, foot, 'FALL'));
        queueAction(game, foot, makeAction(game, foot, 'STOMP'));
      }
    }
    stepAction(game, foot, () => {});
  }
};
const updateCPUColonies = game => {
  const config = game.config;
  for (const playerID in game.players) {
    if (game.players[playerID].type == 'HUMAN') continue;
    // colony can initiate an attack
    if (game.time % config[playerID].attackTiming == 0) {
      const antsToAttack = game.ANT.map(id => game.entities[id]).filter(a => a.playerID == playerID && a.holding == null && a.caste != 'QUEEN');
      antsToAttack.forEach(a => antSwitchTask(game, a, 'ATTACK'));
    }
    // check if the queen just died
    const queen = getQueen(game, playerID);
    if ((queen == null || queen.type == 'DEAD_ANT' || queen.type == 'DEAD_TERMITE') && game.colonies[playerID].queenAlive) {
      game.colonies[playerID].queenAlive = false;
      // halve all remaining ants' hp
      for (const id of game.ANT) {
        const ant = game.entities[id];
        if (ant.playerID != playerID) continue;
        ant.hp = Math.ceil(ant.hp / 2);
      }
      // delete all their tokens
      for (const id of game.TOKEN) {
        const token = game.entities[id];
        if (token.playerID != playerID) continue;
        removeEntity(game, token);
      }
      // remove their trapjaws from your queen
      removeTrapjaws(game, getQueen(game, game.playerID));
    }
  }
};
const updateRain = game => {
  if (game.rainTicks > 0) {
    game.rainTicks--;
  }
};
const updateRaids = game => {
  if (game.raidTime > 0) {
    game.raidTime -= game.timeSinceLastTick;
  }
  if (game.raidCooldown > 0) {
    game.raidCooldown -= game.timeSinceLastTick;
  }
};

//////////////////////////////////////////////////////////////////////////
// Update Tokens
//////////////////////////////////////////////////////////////////////////
const updateTokens = game => {
  const config = game.config;
  const queen = getQueen(game, game.playerID);
  const positions = getPositionsInFront(game, queen);
  let anyNeighbors = false;
  for (const id of game.TOKEN) {
    const token = game.entities[id];
    if (token.position == null || token.pheromoneType == 'DOMESTICATE' || token.pheromoneType == 'RAID_PHER') {
      // game.pheromoneDisplay[token.pheromoneType] = false;
      token.tokenRadius = 1;
      game.pheromoneWorker.postMessage({
        type: 'SET_TOKEN_RADIUS',
        token
      });

      // clean up raid token
      if (token.pheromoneType == 'RAID_PHER' && game.raidTime <= 0) {
        var _queen$holding;
        if (((_queen$holding = queen.holding) === null || _queen$holding === void 0 ? void 0 : _queen$holding.pheromoneType) == 'RAID_PHER') {
          queen.holding = null; // drop it if the queen is holding it
        }

        removeEntity(game, token);
      }
      continue;
    }
    const totalPositions = getPositionsInTokenRadius(game, token);
    const totalContractedPositions = getPositionsInTokenRadius(game, {
      ...token,
      tokenRadius: token.tokenRadius - 1
    });
    const freePositions = getUnoccupiedPositionsInTokenRadius(game, token);
    if (freePositions.length < 0.25 * totalPositions.length) {
      token.tokenRadius += 1;
      game.pheromoneWorker.postMessage({
        type: 'SET_TOKEN_RADIUS',
        token
      });
      const nextTotalPositions = getUnoccupiedPositionsInTokenRadius(game, token);
      for (const pos of nextTotalPositions) {
        if (!totalPositions.find(p => equals(p, pos))) {
          fillPheromone(game, pos, token.pheromoneType, token.playerID);
        }
      }
    } else if (freePositions.length - (totalPositions.length - totalContractedPositions.length) > 0.25 * totalContractedPositions.length && token.tokenRadius > 1) {
      token.tokenRadius -= 1;
      game.pheromoneWorker.postMessage({
        type: 'SET_TOKEN_RADIUS',
        token
      });
      for (const pos of totalPositions) {
        if (!totalContractedPositions.find(p => equals(p, pos))) {
          clearPheromone(game, pos, token.pheromoneType, token.playerID);
        }
      }
    }

    // decide whether to display pheromone
    if (game.isExperimental) continue; // HACK
    if (token.playerID != game.playerID) continue;
    let neighboring = false;
    if (!anyNeighbors) {
      for (const pos of positions) {
        if (equals(pos, token.position)) {
          game.pheromoneDisplay[token.pheromoneType] = true;
          neighboring = true;
          anyNeighbors = true;
          break;
        }
      }
    }
    if (!neighboring) {
      game.pheromoneDisplay[token.pheromoneType] = false;
    }
  }
};

//////////////////////////////////////////////////////////////////////////
// Update Task Need
//////////////////////////////////////////////////////////////////////////

const updatePatrolTaskNeed = game => {
  for (const playerID in game.players) {
    const queen = getQueen(game, playerID);
    let firstThresholdNeed = 5;
    let secondThresholdNeed = 0.4;
    let thirdThresholdNeed = 0.7;
    let fourthThresholdNeed = 0.65;
    let fifthThresholdNeed = 0.9;
    if (queen.selectedPheromone == 'EXPAND' && queen.pheromoneActive) {
      firstThresholdNeed = 20;
      secondThresholdNeed = 0.8;
    } else if (queen.selectedPheromone == 'CONTRACT' && queen.pheromoneActive) {
      firstThresholdNeed = 0;
      secondThresholdNeed = 0.1;
    }
    let antsPatrolling = 0;
    let antsDefending = 0;
    let totalAnts = 0;
    for (const id of game.ANT) {
      const ant = game.entities[id];
      if (ant.playerID != playerID) continue;
      if (ant.caste == 'YOUNG_QUEEN') continue;
      if (ant.task == 'PATROL') {
        antsPatrolling += 1;
      }
      if (ant.task == 'DEFEND') {
        antsDefending += 1;
      }
      totalAnts += 1;
    }
    let patrolTaskNeed = 0;
    // 5/31 --> 5/50ants
    if (totalAnts > 30) {
      patrolTaskNeed = firstThresholdNeed;
    }
    // 0/51 --> 40/100 ants
    if (totalAnts > 50) {
      patrolTaskNeed = Math.round((totalAnts - 50) * secondThresholdNeed);
    }
    // 33/101 --> 70/150 ants
    if (totalAnts > 100) {
      patrolTaskNeed = Math.round((totalAnts - 50) * thirdThresholdNeed);
    }
    // 65/151 --> 98/200
    if (totalAnts > 150) {
      patrolTaskNeed = Math.round((totalAnts - 50) * fourthThresholdNeed);
    }
    // 90/201 --> 135/250
    if (totalAnts > 200) {
      patrolTaskNeed = Math.round((totalAnts - 100) * fifthThresholdNeed);
    }
    game.colonies[playerID].taskNeed.PATROL = patrolTaskNeed - antsPatrolling - antsDefending;
    game.colonies[playerID].patrolRadius = Math.min(100, patrolTaskNeed * 3);
  }
};
const updateGoToDirtTaskNeed = game => {
  if (game.time % 500 == 0) {
    let numAntsOnGoToDirt = 0;
    for (const id of game.ANT) {
      const ant = game.entities[id];
      if (ant.task == 'GO_TO_DIRT') {
        numAntsOnGoToDirt++;
      }
    }
    if (numAntsOnGoToDirt == 0 && game.markedDirtIDs.length == 0) {
      game.colonies[game.playerID].taskNeed.GO_TO_DIRT = 0;
    }
  }
};

//////////////////////////////////////////////////////////////////////////
// Move Queen/View
//////////////////////////////////////////////////////////////////////////

/**
 * If the queen isn't moving but you're still holding the key down,
 * then just put a move action back on the action queue
 */
const keepControlledMoving = game => {
  const queen = game.controlledEntity;
  if (!queen) return;
  const moveDir = {
    x: 0,
    y: 0
  };
  if (game.hotKeys.keysDown.up) {
    moveDir.y += 1;
  }
  if (game.hotKeys.keysDown.down) {
    moveDir.y -= 1;
  }
  if (game.hotKeys.keysDown.left) {
    moveDir.x -= 1;
  }
  if (game.hotKeys.keysDown.right) {
    moveDir.x += 1;
  }
  if (!equals(moveDir, {
    x: 0,
    y: 0
  })) {
    queen.timeOnMove += 1;
  } else {
    queen.timeOnMove = 0;
  }
  const queenFollow = getPheromoneAtPosition(game, queen.position, 'QUEEN_FOLLOW', queen.playerID) > 0;
  if (queenFollow) {
    moveDir.x = 0;
    moveDir.y = 0;
  }
  if (!equals(moveDir, {
    x: 0,
    y: 0
  }) && !isActionTypeQueued(queen, 'MOVE', true) && !isActionTypeQueued(queen, 'MOVE_TURN', true) && !isActionTypeQueued(queen, 'TURN') // enables turning in place
  && !isActionTypeQueued(queen, 'DASH') && !isActionTypeQueued(queen, 'BURROW_HOME')) {
    const nextPos = add(queen.position, moveDir);
    const nextTheta = vectorTheta(subtract(queen.position, nextPos));
    let entityAction = makeAction(game, queen, 'MOVE', {
      nextPos,
      frameOffset: queen.frameOffset
    });
    if (!closeTo(nextTheta, queen.theta)) {
      if (queen.timeOnMove > 1) {
        entityAction = makeAction(game, queen, 'MOVE_TURN', {
          nextPos,
          nextTheta,
          frameOffset: queen.frameOffset
        });
        queen.prevTheta = queen.theta;
      } else {
        entityAction = makeAction(game, queen, 'TURN', nextTheta);
      }
    }
    queen.timeOnMove = 0;
    queueAction(game, queen, entityAction);
  }
};
const updateViewPos = (game, clampToGrid) => {
  const config = game.config;
  let nextViewPos = {
    ...game.viewPos
  };
  const queen = game.focusedEntity;
  if (queen) {
    const moveDir = subtract(queen.position, queen.prevPosition);
    const action = queen.actions[0];
    if (queen.stuck) return;
    if (action != null && (action.type == 'MOVE' || action.type == 'DASH' || action.type == 'MOVE_TURN')) {
      const index = getInterpolatedIndex(game, queen);
      const duration = getDuration(game, queen, action.type);
      nextViewPos = add(nextViewPos, scale(moveDir, Math.min(1, game.timeSinceLastTick / duration)));
    } else if (action == null) {
      const idealPos = {
        x: queen.position.x - game.viewWidth / 2,
        y: queen.position.y - game.viewHeight / 2
      };
      const diff = subtract(idealPos, nextViewPos);
      // NOTE: this allows smooth panning to correct view position
      const duration = getDuration(game, queen, 'MOVE');
      nextViewPos = add(nextViewPos, scale(diff, 16 / duration));
    }
  }

  // rumble screen from foot
  const foot = game.entities[game.FOOT[0]];
  if (foot != null && foot.actions[0] != null && foot.actions[0].type == 'STOMP') {
    const duration = getDuration(game, foot, 'STOMP');
    const actionIndex = duration - foot.actions[0].duration;
    if (game.config.FOOT.rumbleTicks > actionIndex) {
      const magnitude = 4 * actionIndex / duration - 3;
      nextViewPos = {
        x: magnitude * Math.random() + queen.position.x - game.viewWidth / 2,
        y: magnitude * Math.random() + queen.position.y - game.viewHeight / 2
      };
    } else if (!onScreen(game, foot) && actionIndex == game.config.FOOT.rumbleTicks) {
      // if the foot doesn't stomp on screen, reset the view immediately after rumbling
      // else it looks jarring to shift the screen without the foot also moving
      const queen = getQueen(game, game.playerID);
      if (queen != null) {
        nextViewPos = {
          x: queen.position.x - game.viewWidth / 2,
          y: queen.position.y - game.viewHeight / 2
        };
      }
    }
  }
  nextViewPos = {
    x: Math.round(nextViewPos.x * 100) / 100,
    y: Math.round(nextViewPos.y * 100) / 100
  };
  if (!clampToGrid) {
    if (!equals(game.viewPos, nextViewPos)) {
      game.viewPos = nextViewPos;
    }
  } else {
    game.viewPos = {
      x: clamp(nextViewPos.x, 0, game.gridWidth - game.viewWidth),
      y: clamp(nextViewPos.y, 0, game.gridHeight - game.viewHeight)
    };
  }
};

//////////////////////////////////////////////////////////////////////////
// Egg/Larva/Pupa Life Cycles
//////////////////////////////////////////////////////////////////////////
const updateCritterLifeCycles = game => {
  // update eggs
  for (const id of game.CRITTER_EGG) {
    const egg = game.entities[id];
    egg.age += game.timeSinceLastTick;
    egg.prevHPAge += 1;
    if (egg.hp <= 0) {
      removeEntity(game, egg);
      continue;
    }
    const config = getEntityConfig(game, {
      ...egg,
      type: egg.critterType
    });
    if (egg.age > config.eggHatchAge && egg.position != null) {
      let makeFn = null;
      switch (egg.critterType) {
        case 'SPIDER':
          game.entities[id] = {
            ...makeSpider(game, egg.position, 3, 3),
            id
          };
          break;
        case 'BEETLE':
          game.entities[id] = {
            ...makeBeetle(game, egg.position),
            id
          };
          break;
        case 'APHID':
          game.entities[id] = {
            ...makeAphid(game, egg.position),
            id
          };
          break;
        case 'ROLY_POLY':
          game.entities[id] = {
            ...makeRolyPoly(game, egg.position),
            id
          };
          break;
        case 'CATERPILLAR':
          {
            // create initial segments:
            const randNeighbor = pos => {
              return Math.random() < 0.5 ? add(pos, {
                x: 1,
                y: 0
              }) : add(pos, {
                x: 0,
                y: 1
              });
            };
            const segments = [];
            let position = {
              ...egg.position
            };
            for (let i = 0; i < 5 - 1; i++) {
              const segmentPos = randNeighbor(position);
              segments.push(segmentPos);
              position = segmentPos;
            }
            game.entities[id] = {
              ...makeCaterpillar(game, egg.position, segments),
              id
            };
            break;
          }
        case 'WORM':
          {
            // create initial segments:
            const randNeighbor = pos => {
              return Math.random() < 0.5 ? add(pos, {
                x: 1,
                y: 0
              }) : add(pos, {
                x: 0,
                y: 1
              });
            };
            const segments = [];
            let position = {
              ...egg.position
            };
            for (let i = 0; i < 5 - 1; i++) {
              const segmentPos = randNeighbor(position);
              segments.push(segmentPos);
              position = segmentPos;
            }
            game.entities[id] = {
              ...makeWorm(game, egg.position, segments),
              id
            };
            break;
          }
        case 'CENTIPEDE':
          {
            // create initial segments:
            const randNeighbor = pos => {
              return Math.random() < 0.5 ? add(pos, {
                x: 1,
                y: 0
              }) : add(pos, {
                x: 0,
                y: 1
              });
            };
            const segments = [];
            let position = {
              ...egg.position
            };
            for (let i = 0; i < 5 - 1; i++) {
              const segmentPos = randNeighbor(position);
              segments.push(segmentPos);
              position = segmentPos;
            }
            game.entities[id] = {
              ...makeCentipede(game, egg.position, segments),
              id
            };
            break;
          }
      }
      changeEntityType(game, game.entities[id], 'CRITTER_EGG', egg.critterType);
    }
  }
};
const updateAntLifeCycles = game => {
  // update eggs
  for (const id of game.EGG) {
    const egg = game.entities[id];
    egg.age += game.timeSinceLastTick;
    egg.prevHPAge += 1;
    if (egg.hp <= 0) {
      removeEntity(game, egg);
      continue;
    }
    const config = getEntityConfig(game, {
      ...egg,
      type: 'ANT',
      caste: egg.caste
    });
    if (egg.age > config.eggHatchAge && egg.position != null) {
      game.entities[id] = {
        ...makeLarva(game, egg.position, egg.playerID, egg.caste),
        id
      };
      changeEntityType(game, game.entities[id], 'EGG', 'LARVA');
      game.colonies[egg.playerID].taskNeed['FEED_LARVA'] += game.entities[id].foodNeed;
      fillPheromone(game, egg.position, 'LARVA', egg.playerID);
    }
  }

  // update larva
  for (const id of game.LARVA) {
    const larva = game.entities[id];
    larva.prevHPAge += 1;
    if (larva.hp <= 0) {
      removeEntity(game, larva);
      continue;
    }
    if (larva.foodNeed <= 0 && larva.position != null) {
      game.entities[id] = {
        ...makePupa(game, larva.position, larva.playerID, larva.caste),
        id
      };
      changeEntityType(game, game.entities[id], 'LARVA', 'PUPA');
      clearPheromone(game, larva.position, 'LARVA', larva.playerID);
    }
  }

  // update pupa
  for (const id of game.PUPA) {
    const pupa = game.entities[id];
    pupa.age += game.timeSinceLastTick;
    pupa.prevHPAge += 1;
    if (pupa.hp <= 0) {
      removeEntity(game, pupa);
      continue;
    }
    const config = getEntityConfig(game, {
      ...pupa,
      type: 'ANT',
      caste: pupa.caste
    });
    if (pupa.age > config.pupaHatchAge && pupa.position != null) {
      game.entities[id] = {
        ...makeAnt(game, pupa.position, pupa.playerID, pupa.caste),
        id
      };
      if (pupa.caste == 'SUB_MINIMA') {
        for (let i = 0; i < 3; i++) {
          const subMinima = makeAnt(game, {
            ...pupa.position
          }, pupa.playerID, 'SUB_MINIMA');
          addEntity(game, subMinima);
        }
      }
      changeEntityType(game, game.entities[id], 'PUPA', 'ANT');
      refreshPheromones(game, game.entities[id].position);
      if (pupa.caste == 'QUEEN') {
        game.entities[id].autopilot = true;
        game.entities[id].selectedAbility = 'AUTOPILOT';
      }
    }
  }

  // update termite eggs
  for (const id of game.TERMITE_EGG) {
    const egg = game.entities[id];
    egg.age += 1;
    if (egg.hp <= 0) {
      removeEntity(game, egg);
      continue;
    }
    const config = getEntityConfig(game, {
      ...egg,
      type: 'TERMITE',
      caste: egg.caste
    });
    if (egg.age > config.eggHatchAge && egg.position != null) {
      game.entities[id] = {
        ...makeTermite(game, egg.position, egg.playerID, egg.caste),
        id
      };
      changeEntityType(game, game.entities[id], 'TERMITE_EGG', 'TERMITE');
    }
  }
};

//////////////////////////////////////////////////////////////////////////
// Queen Egg-Laying
//////////////////////////////////////////////////////////////////////////

const eggLaying = (game, ant) => {
  var _game$controlledEntit;
  if (ant.caste != 'QUEEN' && !(ant.caste == 'MINIMA' && game.config[ant.playerID].gamergate) && ant.caste != 'TERMITE_QUEEN') return;
  const config = game.config[ant.playerID];

  // player-character queen
  if (ant.playerID == game.playerID && ((_game$controlledEntit = game.controlledEntity) === null || _game$controlledEntit === void 0 ? void 0 : _game$controlledEntit.id) == ant.id) {
    if (ant.startEggLaying && ant.eggCharges > 0 && !ant.autotpilot) {
      if (!isActionTypeQueued(ant, 'LAY')) {
        const caste = ant.selectedCaste;
        queueAction(game, ant, makeAction(game, ant, 'LAY', caste));
      }
    } else if (ant.startEggLaying && ant.eggCharges <= 0) {
      ant.startEggLaying = false;
      ant.eggCharges = 0;
      ant.eggLayingCharge = config.eggLayingCooldown;
    }
    if (ant.eggLayingCharge > 0 && !ant.startEggLaying) {
      ant.eggLayingCharge -= game.timeSinceLastTick;
    } else if (!ant.startEggLaying) {
      const maxEggCharges = Math.max(config.maxEggCharges, Math.floor(game.ANT.map(id => game.entities[id]).filter(a => a.playerID == ant.playerID).length / 10));
      if (ant.eggCharges < maxEggCharges) {
        ant.eggCharges++;
      }

      // slow down egg production by 250ms per egg charge you already have
      // then subtract by 50ms per food you have collected. With a floor of 500ms
      // minimum per egg charge
      ant.eggLayingCharge = Math.max(config.eggLayingCooldown + (ant.eggCharges - 1) * 250 - getNumFoodInTokenRadius(game, ant.playerID) * 50, 500);
    }
  }
  // always stop laying eggs if you're not holding the button down
  if (!game.hotKeys.keysDown.V) {
    ant.startEggLaying = false;
  }

  // CPU queens
  if (
  //  ant.playerID != game.playerID ||
  ant.autopilot || config.gamergate && ant.caste != 'QUEEN') {
    var _game$controlledEntit2;
    if (config.gamergate) {
      ant.eggLayingCooldown = ant.eggLayingCooldown != null ? ant.eggLayingCooldown : 0;
    }
    if (ant.eggLayingCooldown > 0) {
      ant.eggLayingCooldown -= game.timeSinceLastTick;
    }
    const numLarva = game.LARVA.map(id => game.entities[id]).filter(l => l.playerID == ant.playerID).length;
    const lessThanMax = numLarva <= game.config[ant.playerID].maxLarva;
    const inRadius = inTokenInfluence(game, ant, 'COLONY') || !config.gamergate;
    const eggCharges = ant.caste != 'MINIMA' || ant.eggCharges != 0;
    if (ant.eggLayingCooldown <= 0 && (lessThanMax || ant.id == ((_game$controlledEntit2 = game.controlledEntity) === null || _game$controlledEntit2 === void 0 ? void 0 : _game$controlledEntit2.id)) && inRadius && eggCharges) {
      const numAnts = game.ANT.map(id => game.entities[id]).filter(a => a.playerID == ant.playerID).length;
      let caste = 'MINIMA';
      if (numAnts > config.cpuMediaThreshold && ant.caste == 'QUEEN') {
        caste = 'MEDIA';
      }
      if (numAnts > config.cpuMajorThreshold && ant.caste == 'QUEEN') {
        caste = 'MAJOR';
      }
      if (ant.autopilot) {
        caste = ant.selectedCaste;
      }
      if (ant.caste == 'TERMITE_QUEEN') {
        if (game.TERMITE.length > globalConfig.config.maxTermites) {
          return;
        }
        caste = 'TERMITE_WORKER';
        let numSoldiers = game.TERMITE.map(id => game.entities[id]).filter(t => t.caste == 'TERMITE_SOLDIER').length;
        numSoldiers += game.TERMITE_EGG.map(id => game.entities[id]).filter(t => t.caste == 'TERMITE_SOLDIER').length;
        if (numSoldiers < config.minTermiteSoldiers) {
          caste = 'TERMITE_SOLDIER';
        }
      }
      if (ant.caste == 'MINIMA' && config.gamergate) {
        ant.eggCharges = 0;
      }
      const positions = getPositionsBehind(game, ant);
      let freeToLay = ant.type == 'TERMITE' ? false : true;
      for (const eggPosition of positions) {
        const occupied = lookupInGrid(game.grid, eggPosition).filter(id => ant.id != id).length > 0;
        const inGrid = insideGrid(game.grid, eggPosition);
        if (!occupied && inGrid && thetaToDir(ant.theta) != null) {
          freeToLay = true;
        }
      }
      if (!isActionTypeQueued(ant, 'LAY') && freeToLay) {
        queueAction(game, ant, makeAction(game, ant, 'LAY', caste));
      }
    }
  }
};

//////////////////////////////////////////////////////////////////////////
// Pheromones and tiles
//////////////////////////////////////////////////////////////////////////

const updatePheromones = game => {
  if (game.time % game.config.clearStrandedPheromoneRate == 0) {
    game.pheromoneWorker.postMessage({
      type: 'CLEAR_STRANDED_PHEROMONES'
    });
  }
  if (game.time % game.config.dispersingPheromoneUpdateRate == 0) {
    game.pheromoneWorker.postMessage({
      type: 'DISPERSE_PHEROMONES'
    });
  }

  // recompute steady-state-based pheromones using the worker
  if (game.reverseFloodFillSources.length > 0) {
    game.pheromoneWorker.postMessage({
      type: 'REVERSE_FLOOD_FILL',
      reverseFloodFillSources: game.reverseFloodFillSources
    });
    game.reverseFloodFillSources = [];
  }
  if (game.floodFillSources.length > 0) {
    game.pheromoneWorker.postMessage({
      type: 'FLOOD_FILL',
      floodFillSources: game.floodFillSources
    });
    game.floodFillSources = [];
  }
};
const updateStaleTiles = game => {
  for (const id of game.staleTiles) {
    const entity = game.entities[id];
    entity.dictIndexStr = getDictIndexStr(game, entity);
  }
  game.staleTiles = [];
};

//////////////////////////////////////////////////////////////////////////
// Doing Actions
//////////////////////////////////////////////////////////////////////////

const stepAction = (game, entity, decisionFunction) => {
  if (entity.actions.length == 0) return;
  let curAction = entity.actions[0];
  const totalDuration = getDuration(game, entity, curAction.type);
  if (totalDuration - curAction.duration >= curAction.effectIndex && !curAction.effectDone) {
    critterStartCurrentAction(game, entity);
    curAction = entity.actions[0];
  } else if (curAction.duration <= 0) {
    const prevAction = entity.actions.shift();
    entity.prevActionType = prevAction.type;
    curAction = entity.actions[0];
    if (curAction == null) {
      decisionFunction(game, entity);
      curAction = entity.actions[0];
    }
    if (curAction != null && curAction.effectIndex == 0) {
      critterStartCurrentAction(game, entity);
    }
  }
  if (curAction != null) {
    curAction.duration = Math.max(0, curAction.duration - game.timeSinceLastTick);
  }
};

//////////////////////////////////////////////////////////////////////////
// Countdown
//////////////////////////////////////////////////////////////////////////

const updateCountdown = game => {
  if (game.inCountdown) {
    const timeDiff = new Date().getTime() - (game.countdownStartTime - game.countdownOffset);
    game.countdownMillis = globalConfig.config.countdownMillis - timeDiff;
    if (game.countdownMillis <= 0) {
      game.afterCountdown = true;
    }
  }
};
module.exports = {
  tickReducer
};
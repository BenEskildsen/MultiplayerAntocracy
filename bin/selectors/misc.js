const {
  lookupInGrid,
  getEntityPositions,
  entityInsideGrid,
  insideGrid
} = require('../utils/gridHelpers');
const {
  thetaToDir
} = require('../utils/helpers');
const {
  collidesWith
} = require('../selectors/collisions');
const {
  getFreeNeighborPositions,
  getNeighborPositions
} = require('../selectors/neighbors');
const {
  getEntityConfig
} = require('../selectors/config');
const {
  add,
  makeVector,
  subtract,
  vectorTheta,
  round,
  ceil,
  containsVector,
  equals
} = require('../utils/vectors');
const {
  makeAction
} = require('../simulation/actionQueue');
const {
  getPheromoneAtPosition
} = require('../selectors/pheromones');
const onScreen = (game, entity) => {
  let {
    viewPos,
    viewWidth,
    viewHeight
  } = game;
  const {
    position,
    width,
    height
  } = entity;
  const {
    x,
    y
  } = position;
  if (!game.maxMinimap) {
    return x + width >= viewPos.x - 1 && y + height >= viewPos.y - 1 && x <= viewWidth + viewPos.x + 1 && y <= viewHeight + viewPos.y + 1;
  } else {
    return x >= viewPos.x && y >= viewPos.y && x + width <= viewWidth + viewPos.x && y + height <= viewHeight + viewPos.y;
  }
};

// falls back to returning a dead queen, gameOverSystem should
// handle that this happened
const getQueen = (game, playerID) => {
  const entityID = game.queens[playerID];
  if (entityID != null) {
    return game.entities[entityID];
  }
  return null;
};

// NOTE: outside of entity
const getPositionsInFront = (game, entity) => {
  let dimension = entity.width;
  if (entity.height > entity.width) {
    dimension = entity.height;
  }
  const magnitude = entity.theta < Math.PI * 0.9 ? -1 : -1 * dimension;
  const positions = [];
  for (let x = 0; x < entity.width; x++) {
    let neighborVec = {
      x,
      y: 0
    };
    if (thetaToDir(entity.theta) == 'left' || thetaToDir(entity.theta) == 'right') {
      neighborVec = {
        x: 0,
        y: x
      };
    }
    // HACK: facing up-left or up-right diagonally causes the positions-in-front to be inside
    // BUT only the y-axis is off
    let roundingFn = Math.round;
    if (entity.theta > Math.PI) {
      roundingFn = Math.ceil;
    }
    const posSum = add(add(neighborVec, entity.position), makeVector(entity.theta, magnitude));
    positions.push({
      x: Math.round(posSum.x),
      y: roundingFn(posSum.y)
    });
  }
  return positions;
};

// NOTE: outside of entity
const getPositionsBehind = (game, entity) => {
  if (entity.segmented) {
    const tailPos = entity.segments[entity.segments.length - 1].position;
    const segBeforeTailPos = entity.segments.length > 1 ? entity.segments[entity.segments.length - 2].position : entity.position;
    const theta = vectorTheta(subtract(segBeforeTailPos, tailPos));
    const behindPos = add(tailPos, makeVector(theta, -1));
    return [behindPos];
  }
  const dir = thetaToDir(entity.theta);
  let x = 0;
  let y = entity.height + 1;
  if (dir == 'left' || dir == 'leftdown' || dir == 'leftup') {
    x = -entity.height - 1;
  }
  if (dir == 'right' || dir == 'rightdown' || dir == 'rightup') {
    x = entity.height + 1;
  }
  if (dir == 'up' || dir == 'rightup' || dir == 'leftup') {
    y = -entity.height - 1;
  }
  if (dir == 'leftup' || dir == 'leftdown') {
    x += 1;
  }
  if (dir == 'left' || dir == 'right') {
    y = 0;
  }
  const offset = {
    x,
    y
  };
  return getPositionsInFront(game, entity).map(p => subtract(p, offset));
};
const isFacing = (entity, position) => {
  const nextDir = thetaToDir(vectorTheta(subtract(entity.position, position)));
  return nextDir == thetaToDir(entity.theta);
};
const getEntityBlockingTypes = (game, entity) => {
  var _game$controlledEntit;
  let config = game.config;
  let blockers = getEntityConfig(game, entity).blockingTypes;
  if (entity.playerID != null) {
    config = game.config[entity.playerID];
  }

  // young queens doing the FLY_AWAY task are not blocked by anything
  if (entity.caste == 'YOUNG_QUEEN' && entity.task == 'FLY_AWAY') {
    return [];
  }

  // TODO: this is a hack to let media and majors move around more easily
  if (entity.caste == 'QUEEN' || entity.caste == 'MEDIA' || entity.caste == 'MAJOR'
  // || (entity.holding != null && entity.holding.type == 'FOOD')
  // || entity.caste == 'YOUNG_QUEEN'
  ) {
    const curAction = entity.actions[0] ? entity.actions[0].type : 'NONE';
    if (entity.caste == 'QUEEN' && curAction == 'DASH' && config.queenArmored) {
      blockers = config.warriorQueenBlockingTypes;
    }
  }

  // HACK: queen not blocked by anything when burrowing
  const token = game.TOKEN.map(id => game.entities[id]).filter(t => t.pheromoneType == 'QUEEN_FOLLOW' && t.playerID == game.playerID)[0];
  if (entity.id == ((_game$controlledEntit = game.controlledEntity) === null || _game$controlledEntit === void 0 ? void 0 : _game$controlledEntit.id) && token) {
    blockers = [];
  }

  // ants don't block each other when in mega colony
  // NOTE: not doing this any more because the ants just behave worse this way
  // if (entity.type == 'ANT' && config.megaColony) {
  //   blockers = blockers.filter(t => t != 'ANT');
  // }
  // NOTE: Can't actually do it this way, it's handled in collisionsAtSpace
  // having entities holding food ignore other ants for now
  // if (entity.holding != null && entity.holding.type == 'FOOD') {
  //   blockers = blockers.filter(t => t != 'ANT');
  // }

  // segmented entities block themselves only when not stuck
  if (entity.segmented && !entity.stuck) {
    blockers.push(entity.type);
  }

  // HACK: no blockers if your actual position is blocked
  const isBlocked = lookupInGrid(game.grid, entity.position).map(id => game.entities[id]).filter(e => e.id != entity.id).filter(e => blockers.includes(e.type) && (e.type != 'ANT' || e.caste == 'MAJOR' || e.caste == 'MEDIA')).length > 0;
  // if (isBlocked && entity.caste == 'QUEEN' && entity.playerID == game.playerID) {
  if (isBlocked) {
    blockers = ['DIRT', 'STONE'];
  }
  return blockers;
};
const canDoMove = (game, entity, nextPos) => {
  if (!entityInsideGrid(game, {
    ...entity,
    position: nextPos
  })) {
    return {
      result: false,
      reason: 'OUTSIDE_GRID'
    };
  }
  const blockers = getEntityBlockingTypes(game, entity);
  const freeInternalNeighbors = getFreeNeighborPositions(game, entity, blockers);
  if (!containsVector(freeInternalNeighbors, nextPos) || collidesWith(game, {
    ...entity,
    position: nextPos
  }, blockers).length > 0) {
    return {
      result: false,
      reason: 'BLOCKED'
    };
  }

  // CAN do the move even if not facing
  // if (!isFacing(entity, nextPos)) {
  //   return false;
  // }

  return {
    result: true
  };
};

/**
 *  Returns the entityAction the queen would do if you pressed B right now
 */
const getQueenBiteAction = (game, queen) => {
  if (queen.type == 'DEAD_ANT') {
    return {
      type: 'BITE',
      target: null,
      duration: 1
    };
  }
  const config = game.config;
  // PUTDOWN if holding
  if (queen.holding != null) {
    return makeAction(game, queen, 'PUTDOWN', null);
  }

  // find biting target and BITE if there is one
  let target = null;
  const positionsInFront = getPositionsInFront(game, queen);
  for (const pos of positionsInFront) {
    const maybeTarget = lookupInGrid(game.grid, pos).map(id => game.entities[id]).filter(e => {
      return config.critterTypes.includes(e.type) || e.type == 'ANT' && e.playerID != queen.playerID || e.type == 'TERMITE' && e.playerID != queen.playerID || e.type == 'VINE'
      // (e.type == 'FOOT' && e.state == 'stomping') ||
      // (e.playerID != queen.playerID && e.hp > 0 && e.type != 'CRITTER_EGG')
      ;
    })[0];
    if (maybeTarget != null) {
      target = maybeTarget;
      break;
    }
  }
  if (target != null) {
    return makeAction(game, queen, 'BITE', target);
  }

  // PICKUP if there's something to pick up
  for (const pickupPos of positionsInFront) {
    const pickup = lookupInGrid(game.grid, pickupPos).map(id => game.entities[id]).filter(e => config[queen.playerID].queenPickupTypes.includes(e.type))[0];
    if (pickup != null) {
      return makeAction(game, queen, 'PICKUP', {
        pickupID: pickup.id,
        position: pickupPos
      });
    }
  }

  // BITE if not already biting
  return makeAction(game, queen, 'BITE', target);
};

/**
 * Gets a playerID that's not yours. e.g. for patrol
 */
const getOtherPlayerID = (game, playerID) => {
  // always point at player if given ID is not player:
  if (playerID != game.playerID) return game.playerID;

  // else find some other playerID
  for (const pID in game.players) {
    if (pID != playerID) {
      return pID;
    }
  }
  return null;
};
const isOnSpiderWeb = (game, entity) => {
  return collidesWith(game, entity, ['SPIDER_WEB']).length > 0;
};
const isDead = entity => {
  return entity.type.slice(0, 4) == 'DEAD';
};

// when an ant is going towards dirt that has blocked it in, detect if the
// given dirt has the highest PASS_THROUGH_COLONY value of all the ant's neighbors
const isDirtBlockage = (game, ant, dirt) => {
  const positions = getNeighborPositions(game, ant, true);
  let maxPassThrough = 0;
  let maxPassPos = {
    x: 0,
    y: 0
  };
  for (const pos of positions) {
    const passThrough = getPheromoneAtPosition(game, pos, 'PASS_THROUGH_COLONY', game.playerID);
    // if the space is occupied by stone then we can't pass through there
    const isStone = lookupInGrid(game.grid, pos).map(id => game.entities[id]).filter(e => e.type == 'STONE' || e.type == 'DOODAD').length > 0;
    const isDirt = lookupInGrid(game.grid, pos).map(id => game.entities[id]).filter(e => e.type == 'DIRT').length > 0;
    if (isStone) continue;
    if (isDirt && passThrough > maxPassThrough || !isDirt && passThrough >= maxPassThrough) {
      maxPassThrough = passThrough;
      maxPassPos = pos;
    }
  }
  return equals(maxPassPos, dirt.position);
};
const canLayFood = (game, ant) => {
  const positions = getPositionsBehind(game, ant);
  for (const pos of positions) {
    const occupied = lookupInGrid(game.grid, pos).filter(id => ant.id != id).length > 0;
    const inGrid = insideGrid(game.grid, pos);
    if (!occupied && inGrid && thetaToDir(ant.theta, true) != null) {
      return true;
    }
  }
  return false;
};
const inferPlayerIDForUpgrade = upgrade => {
  let path0 = upgrade.path[0];
  if (path0 + "" == "1" || path0 + "" == "2" || path0 + "" == "3" || path0 + "" == "4") {
    return path0;
  }
  return 1;
};
const getTotalYoungQueens = (game, includeDead) => {
  let deadYoungQueens = game.DEAD_ANT.map(id => game.entities[id]).filter(a => {
    return a.playerID == game.playerID && a.caste == 'YOUNG_QUEEN';
  }).length;
  if (!includeDead) {
    deadYoungQueens = 0;
  }
  return game.ANT.map(id => game.entities[id]).filter(a => {
    return a.playerID == game.playerID && a.caste == 'YOUNG_QUEEN';
  }).length + game.totalYoungQueens + deadYoungQueens;
};
module.exports = {
  onScreen,
  getQueen,
  getPositionsInFront,
  getPositionsBehind,
  isFacing,
  getQueenBiteAction,
  canDoMove,
  getOtherPlayerID,
  isOnSpiderWeb,
  getEntityBlockingTypes,
  isDead,
  isDirtBlockage,
  canLayFood,
  inferPlayerIDForUpgrade,
  getTotalYoungQueens
};
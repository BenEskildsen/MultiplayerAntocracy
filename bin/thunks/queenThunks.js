const {
  getQueen,
  getPositionsInFront,
  getPosBehind,
  getQueenBiteAction
} = require('../selectors/misc');
const {
  thetaToDir
} = require('../utils/helpers');
const {
  closeTo
} = require('../utils/helpers');
const {
  lookupInGrid,
  insideGrid
} = require('../utils/gridHelpers');
const {
  add,
  subtract,
  makeVector,
  round
} = require('../utils/vectors');
const {
  dispatchToServer
} = require('../clientToServer');
const {
  makeAction,
  isActionTypeQueued
} = require('../simulation/actionQueue');
const layEgg = (dispatch, game, playerID) => {
  if (game == null) return;
  const queen = getQueen(game, playerID);
  if (queen == null) return;
  if (thetaToDir(queen.theta) == null) return;
  if (queen.eggCharges == 0) return;
  dispatch({
    type: 'START_EGG_LAYING',
    playerID
  });
  dispatchToServer({
    type: 'START_EGG_LAYING',
    playerID,
    time: game.time
  });
};

/**
 * Bite is a combination of putdown, pickup, and bite actions
 */
const bite = (dispatch, game) => {
  if (game == null) return;
  const queen = getQueen(game, game.playerID);
  if (queen == null) return;
  const config = game.config;
  const entityAction = getQueenBiteAction(game, queen);
  if (entityAction.type == 'BITE' && isActionTypeQueued(queen, 'BITE')) {
    return;
  }
  if ((entityAction.type == 'PICKUP' || entityAction.type == 'PUTDOWN') && (isActionTypeQueued(queen, 'PICKUP') || isActionTypeQueued(queen, 'PUTDOWN'))) {
    return;
  }
  dispatch({
    type: 'ENQUEUE_ENTITY_ACTION',
    entity: queen,
    entityAction
  });
  // dispatchToServer({type: 'ENQUEUE_ENTITY_ACTION', entity: queen, entityAction, time: game.time});
};

const markDirt = (dispatch, game, playerID) => {
  const queen = getQueen(game, playerID);
  const dir = thetaToDir(queen.theta);
  const magnitude = Math.floor(queen.digCharge);
  let markPositions = [];
  const tunnelLength = magnitude;
  const chamberHeight = magnitude <= 6 ? 3 : 4;
  for (let x = 1; x <= magnitude; x++) {
    for (let y = 0; y < queen.width; y++) {
      let xOffset = queen.width == 2 ? 1 : 0;
      let xPos = x;
      let yPos = y;
      if (dir == 'right') {
        xPos += xOffset;
      }
      if (dir == 'left' || dir == 'leftup' || dir == 'leftdown') {
        xPos *= -1;
      }
      if (dir == 'up' || dir == 'leftup' || dir == 'rightup') {
        xPos = y;
        yPos = -1 * x;
      }
      if (dir == 'down' || dir == 'leftdown' || dir == 'rightdown') {
        xPos = y;
        yPos = x + xOffset;
      }
      if (dir == 'leftup' || dir == 'rightdown') {
        xPos = yPos + y;
      }
      if (dir == 'leftdown' || dir == 'rightup') {
        xPos = -yPos + y;
      }
      markPositions.push({
        x: xPos,
        y: yPos
      });
    }
  }
  const dirtIDs = [];
  const emptyPositions = [];
  let numEmpty = 0;
  let actionType = queen.digActionType != null ? queen.digActionType : 'MARK_DIRT';
  for (let i = 0; i < markPositions.length; i++) {
    const pos = add(queen.position, markPositions[i]);
    const entityIDs = lookupInGrid(game.grid, pos);
    const unoccupied = entityIDs.map(id => game.entities[id]).filter(e => e.type.slice(0, 4) != 'DEAD' && e.type != 'BACKGROUND' && e.type != 'ANT' && e.type != 'SPIDER_WEB').length == 0;
    const dirt = entityIDs.filter(id => game.DIRT.includes(id))[0];
    if (unoccupied) {
      numEmpty++;
      emptyPositions.push(pos);
    } else if (dirt != null) {
      dirtIDs.push(dirt);
    }
    if ((numEmpty == 2 && i == 1 || numEmpty == 1 && queen.width == 1 && i == 0) && queen.digActionType != 'MARK_DIRT') {
      actionType = 'MARK_DIRT_PUTDOWN';
    }
  }

  // const dirtIDs = markPositions
  //   .map(p => {
  //     const entityIDs = lookupInGrid(game.grid, add(queen.position, p))
  //     return entityIDs.filter(id => game.DIRT.includes(id))[0];
  //   })
  //   .filter(id => id != null);
  const useDirtToken = game.TOKEN.map(id => game.entities[id]).filter(t => t.pheromoneType == 'DIRT_DROP').length >= 1;
  if (actionType == 'MARK_DIRT' || useDirtToken) {
    dispatch({
      type: 'MARK_DIRT',
      dirtIDs,
      playerID
    });
    dispatchToServer({
      type: 'MARK_DIRT',
      dirtIDs,
      playerID,
      time: game.time
    });
  } else {
    dispatch({
      type: 'MARK_DIRT_PUTDOWN',
      playerID,
      emptyPositions
    });
    dispatchToServer({
      type: 'MARK_DIRT_PUTDOWN',
      playerID,
      emptyPositions,
      time: game.time
    });
  }
};
const markChamber = (dispatch, game, playerID) => {
  const queen = getQueen(game, playerID);
  const dir = thetaToDir(queen.theta);
  const magnitude = Math.floor(queen.digCharge);
  const markPositions = [];
  const quadrantThetas = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
  const posOffset = [{
    x: 0,
    y: queen.height - 1
  }, {
    x: -1 * (queen.width - 1),
    y: 0
  }, {
    x: 0,
    y: -1 * (queen.height - 1)
  }, {
    x: 0,
    y: 0
  }];
  const numRays = magnitude + 2;
  for (let i = 0; i < quadrantThetas.length; i++) {
    const quadrant = quadrantThetas[i];
    for (let ray = 0; ray < numRays; ray++) {
      for (let r = 1; r <= magnitude; r++) {
        const position = round(add(
        // posOffset[i],
        {
          x: 0,
          y: 0
        }, makeVector(quadrant + ray / numRays * (Math.PI / 2), r)));
        markPositions.push(position);
      }
    }
  }
  const dirtIDs = [];
  let numEmpty = 0;
  let actionType = 'MARK_DIRT';
  for (let i = 0; i < markPositions.length; i++) {
    const pos = add(queen.position, markPositions[i]);
    const inGrid = insideGrid(game.grid, pos);
    if (!inGrid) continue;
    const entityIDs = lookupInGrid(game.grid, pos);
    const unoccupied = entityIDs.map(id => game.entities[id]).filter(e => e.type.slice(0, 4) != 'DEAD' && e.type != 'BACKGROUND' && e.type != 'ANT').length == 0;
    const dirt = entityIDs.filter(id => game.DIRT.includes(id))[0];
    if (dirt != null) {
      dirtIDs.push(dirt);
    }
  }
  dispatch({
    type: 'MARK_DIRT',
    dirtIDs,
    playerID
  });
  dispatchToServer({
    type: 'MARK_DIRT',
    dirtIDs,
    playerID,
    time: game.time
  });
};
const markDirtPutdown = (dispatch, game, playerID) => {
  const queen = getQueen(game, playerID);
  const dir = thetaToDir(queen.theta);
  const magnitude = Math.floor(queen.digCharge);
  let markPositions = [];
  const tunnelLength = magnitude;
  const chamberHeight = magnitude <= 6 ? 3 : 4;
  for (let x = 1; x <= magnitude; x++) {
    for (let y = 0; y < queen.width; y++) {
      let xOffset = queen.width == 2 ? 1 : 0;
      let xPos = x;
      let yPos = y;
      if (dir == 'right') {
        xPos += xOffset;
      }
      if (dir == 'left' || dir == 'leftup' || dir == 'leftdown') {
        xPos *= -1;
      }
      if (dir == 'up' || dir == 'leftup' || dir == 'rightup') {
        xPos = y;
        yPos = -1 * x;
      }
      if (dir == 'down' || dir == 'leftdown' || dir == 'rightdown') {
        xPos = y;
        yPos = x + xOffset;
      }
      if (dir == 'leftup' || dir == 'rightdown') {
        xPos = yPos + y;
      }
      if (dir == 'leftdown' || dir == 'rightup') {
        xPos = -yPos + y;
      }
      markPositions.push({
        x: xPos,
        y: yPos
      });
    }
  }
  const dirtIDs = [];
  const emptyPositions = [];
  let numEmpty = 0;
  let actionType = 'MARK_DIRT_PUTDOWN';
  for (let i = 0; i < markPositions.length; i++) {
    const pos = add(queen.position, markPositions[i]);
    const entityIDs = lookupInGrid(game.grid, pos);
    const unoccupied = entityIDs.map(id => game.entities[id]).filter(e => e.type.slice(0, 4) != 'DEAD' && e.type != 'BACKGROUND' && e.type != 'ANT').length == 0;
    if (unoccupied) {
      numEmpty++;
      emptyPositions.push(pos);
    }
  }
  dispatch({
    type: 'MARK_DIRT_PUTDOWN',
    playerID,
    emptyPositions
  });
  dispatchToServer({
    type: 'MARK_DIRT_PUTDOWN',
    playerID,
    emptyPositions,
    time: game.time
  });
};
const dash = (dispatch, game) => {
  if (game == null) return;
  const queen = getQueen(game, game.playerID);
  if (queen == null) return;
  const config = game.config;
  if (isActionTypeQueued(queen, 'DASH')) return;
  const dashDist = game.config[queen.playerID].queenDashDist;
  const moves = [];
  for (let i = 1; i <= dashDist; i++) {
    const moveDir = makeVector((Math.PI + queen.theta) % (2 * Math.PI), i);
    const nextPos = round(add(queen.position, moveDir));
    const entityAction = makeAction(game, queen, 'DASH', {
      nextPos
    }); // TODO: frame offset
    dispatch({
      type: 'ENQUEUE_ENTITY_ACTION',
      entity: queen,
      entityAction
    });
    // dispatchToServer({type: 'ENQUEUE_ENTITY_ACTION', entity: queen, entityAction, time: game.time});
  }
};

module.exports = {
  layEgg,
  markDirt,
  bite,
  dash,
  markChamber,
  markDirtPutdown
};
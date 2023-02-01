// @flow

// NOTE: requires are relative to current directory and not parent
// directory like every other file because this worker is not required by
// any other module and so does not go through the normal babel/browserify transforms.
// See the make file for how it works
const {
  add, multiply, subtract, equals, floor, containsVector
} = require('./utils/vectors');
const {isDiagonalMove} = require('./utils/helpers');
const {oneOf} = require('./utils/stochastic');
const {getNeighborPositions} = require('./selectors/neighbors');
const {
  lookupInGrid
} = require('./utils/gridHelpers');
const {
  getPheromoneAtPosition, getQuantityForStalePos,
  getPheromoneBlockers,
} = require('./selectors/pheromones');
const {
  encodePosition, decodePosition, clamp,
} = require('./utils/helpers');
const {setPheromone, getBiggestNeighborVal} = require('./simulation/pheromones');
const {insertEntityInGrid, removeEntityFromGrid} = require('./simulation/entityOperations');

/**
 *
 * TODO: How to handle dispersing pheromones like water?
 *       Really that entire computation should also happen in the worker
 * TODO: Make sure that if another message is posted before finishing computing
 *       the previous that it queues up implicitly (or explicitly if needed)
 * TODO: Anything else that sets pheromone needs to stay in sync with the worker
 *        - refreshPheromones
 *          (This actually works fine except requires a duplication of floodFillPheromone
 *           when no one else does)
 *
 * This is a web worker to allow computing pheromones in a separate thread
 * since it can often take a long time.
 * Here's how this system works:
 * - The worker is created on game start with a reference to it on the game state
 * - It maintains a copy of the grid and all its pheromones
 * - Whenever the floodFillSources or reverseFloodFillSources change,
 *   then post a message to the worker to compute the new pheromone state
 * - It uses modified versions of the simulation/pheromones floodFill and reverseFloodFill
 *   functions to make a list of positions with new pheromone values
 * - The worker then sends this list back to a pheromoneWorkerSystem that listens
 *   for messages
 * - This system dispatches an action to update all the pheromones at once
 */

let game = null
let floodFillQueue = [];
let reverseFloodFillQueue = [];

onmessage = function(ev) {
  const action = ev.data;
  switch (action.type) {
    case 'INIT': {
      // console.log("worker inited");
      game = {
        grid: action.grid,
        gridWidth: action.gridWidth,
        gridHeight: action.gridHeight,
        config: action.config,
        entities: action.entities,
        playerIDs: action.playerIDs,
        TOKEN: [...action.TOKEN],

        floodFillQueue: [],
        reverseFloodFillQueue: [],
        dispersingPheromonePositions: {},
      };
      for (const pherType of game.config.dispersingPheromones) {
        game.dispersingPheromonePositions[pherType] = {};
      }
      break;
    }
    case 'FLOOD_FILL': {
      // console.log("worker received flood fill request", action.floodFillSources);
      if (!game) break;
      game.floodFillQueue.push(...action.floodFillSources);
      startFloodFill();
      break;
    }
    case 'REVERSE_FLOOD_FILL': {
      // console.log("worker received reverse flood fill request");
      if (!game) break;
      game.reverseFloodFillQueue.push(...action.reverseFloodFillSources);
      startReverseFloodFill();
      break;
    }
    case 'CLEAR_STRANDED_PHEROMONES': {
      if (!game) break;
      clearStrandedPheromones();
      break;
    }
    case 'DISPERSE_PHEROMONES': {
      if (!game) break;
      startDispersePheromones();
      break;
    }
    case 'SET_PHEROMONE': {
      const {position, pheromoneType, quantity, playerID} = action;
      if (!game) break;
      setPheromone(game, position, pheromoneType, quantity, playerID);
      break;
    }
    case 'INSERT_IN_GRID': {
      const {entity} = action;
      if (!game) break;
      insertEntityInGrid(game, entity);
      game.entities[entity.id] = entity; // need to re-up this in case of
                                         // entity type change
      break;
    }
    case 'REMOVE_FROM_GRID': {
      const {entity} = action;
      if (!game) break;
      removeEntityFromGrid(game, entity);
      break;
    }
    case 'ADD_ENTITY': {
      const {entity} = action;
      if (!game) break;
      game.entities[entity.id] = entity;
      if (entity.type == 'TOKEN') {
        game.TOKEN.push(entity.id);
      }
      break;
    }
    case 'REMOVE_ENTITY': {
      const {entity} = action;
      if (!game) break;
      delete game.entities[entity.id];
      if (entity.type == 'TOKEN') {
        game.TOKEN = game.TOKEN.filter(id => id != entity.id);
      }
      break;
    }
    case 'SET_TOKEN_RADIUS': {
      const {token} = action;
      if (!game) break;
      game.entities[token.id] = token;
      break;
    }
  }
}

const clearStrandedPheromones = () => {
  const resultPositions = {};
  for (let x = 1; x < game.gridWidth - 1; x++) {
    for (let y = 1; y < game.gridHeight - 1; y++) {
      for (const pheromoneType of game.config.dispersingPheromones) {
        for (const playerID of game.playerIDs) {
          // console.log(x, y, pheromoneType, playerID);
          if (getPheromoneAtPosition(game, {x, y}, pheromoneType, playerID) == 0) {
            continue;
          }
          const encodedPos = encodePosition({x, y});
          if (
            game.dispersingPheromonePositions[pheromoneType][encodedPos] == null ||
            game.dispersingPheromonePositions[pheromoneType][encodedPos].playerID != playerID
          ) {
            resultPositions[encodedPos] = {pheromoneType, quantity: 0, playerID};
          }
        }
      }
    }
  }

  postMessage([resultPositions]);
}

const startFloodFill = () => {
  let result = [];
  for (const source of game.floodFillQueue) {
    if (source.stale) {
      source.quantity = getQuantityForStalePos(
        game, source.position, source.pheromoneType, source.playerID,
      ).quantity;
    }
    const positions = floodFillPheromone(game, source.pheromoneType, source.playerID, [source], {});
    if (Object.keys(positions).length > 0) {
      result.push(positions);
    }
  }
  game.floodFillQueue = [];
  postMessage(result);
}

const startReverseFloodFill = () => {
  let result = [];
  for (const source of game.reverseFloodFillQueue) {
    let neverFloodFill = false;
    if (source.pheromoneType == 'QUEEN_FOLLOW') {
      neverFloodFill = true;
    }
    const positions = reverseFloodFillPheromone(
      game, source.pheromoneType, source.playerID, [source.position], neverFloodFill
    );
    if (Object.keys(positions).length > 0) {
      result.push(positions);
    }
  }
  game.reverseFloodFillQueue = [];
  postMessage(result);
}

const startDispersePheromones = () => {
  const result = [];
  const nextDispersingPheromones = updateDispersingPheromones(game);
  for (const pherType in nextDispersingPheromones) {
    if (Object.keys(nextDispersingPheromones[pherType]).length > 0) {
      result.push(nextDispersingPheromones[pherType]);
    }
  }
  // console.log(result);
  if (result.length > 0) {
    postMessage(result);
  }
}

/**
 * use queue to continuously find neighbors and set their pheromone
 * value to decayAmount less, if that is greater than its current value
 */
const floodFillPheromone = (
  game, pheromoneType, playerID,
  posQueue,
  partialResults,
) => {
  const resultPositions = {...partialResults};

  while (posQueue.length > 0) {
    const {position, quantity} = posQueue.shift();
    const isOccupied = lookupInGrid(game.grid, position)
      .map(id => game.entities[id])
      .filter(e => getPheromoneBlockers(pheromoneType).includes(e.type))
      .length > 0;
    if (
      (!isOccupied  || pheromoneType == 'MARKED_DIRT_PHER') &&
      getPheromoneAtPosition(game, position, pheromoneType, playerID) < quantity
    ) {
      setPheromone(game, position, pheromoneType, quantity, playerID);
      resultPositions[encodePosition(position)] = {pheromoneType, quantity, playerID};

      const neighborPositions = getNeighborPositions(game, {position}, false /* internal */);
      let decayAmount = game.config[playerID][pheromoneType].decayAmount;
      let amount = Math.max(0, quantity - decayAmount);
      if (pheromoneType == 'FOOD') {
        decayAmount = Math.max(quantity / 2, decayAmount);
        amount = Math.min(
          game.config[playerID].FOOD.quantity * 0.6,
          Math.max(0, quantity - decayAmount)
        );
      }

      for (const neighbor of neighborPositions) {
        if (isDiagonalMove(position, neighbor)) continue;
        const neighborAmount = getPheromoneAtPosition(game, neighbor, pheromoneType, playerID);
        const occupied = lookupInGrid(game.grid, neighbor)
          .map(id => game.entities[id])
          .filter(e => getPheromoneBlockers(pheromoneType).includes(e.type))
          .length > 0;
        if (amount > 0 && amount > neighborAmount && !occupied) {
          posQueue.push({position: neighbor, quantity: amount});
        }
      }
    }

    // dispersing pheromones decay separately
    if (game.config.dispersingPheromones.includes(pheromoneType)) {
      const encodedPos = encodePosition(position);
      const quantity = getPheromoneAtPosition(game, position, pheromoneType, playerID);
      if (
        quantity > 0 &&
        game.dispersingPheromonePositions[pheromoneType][encodedPos] == null
      ) {
        game.dispersingPheromonePositions[pheromoneType][encodedPos] = {
          position, playerID, pheromoneType, quantity,
        };
      }
    }
  }
  return resultPositions;
};

/**
 * When a pheromoneBlocking entity is added into the grid, then it could close off
 * a path, requiring recalculation. So do:
 * Reverse flood fill where you start at the neighbors of the newly occupied position,
 * then 0 those positions out if they are bigger than all their neighbors,
 * then add THEIR non-zero neighbors to the queue and continue,
 * finally, re-do the flood fill on all the 0-ed out spaces in reverse order
 */
const reverseFloodFillPheromone = (
  game, pheromoneType, playerID,
  posQueue,
  neverFloodFill,
) => {
  const resultPositions = [];
  const floodFillQueue = [];
  if (pheromoneType == 'FOOD') {console.trace("hrmm");}
  while (posQueue.length > 0) {
    const position = posQueue.shift();
    const amount = getPheromoneAtPosition(game, position, pheromoneType, playerID);
    const neighborAmount = getBiggestNeighborVal(game, position, pheromoneType, playerID);
    const maxAmount = game.config[playerID][pheromoneType].quantity;
    const decayAmount = game.config[playerID][pheromoneType].decayAmount;
    let shouldFloodFill = true;
    if (neighborAmount <= amount) {
      shouldFloodFill = false;
      setPheromone(game, position, pheromoneType, 0, playerID);
      resultPositions[encodePosition(position)] = {pheromoneType, quantity: 0, playerID};
      const neighborPositions = getNeighborPositions(game, {position}, false /* internal */);
      for (const neighbor of neighborPositions) {
        if (isDiagonalMove(position, neighbor)) continue;
        const neighborAmount = getPheromoneAtPosition(game, neighbor, pheromoneType, playerID);
        if (neighborAmount > 0 && neighborAmount < maxAmount) {
          posQueue.push(neighbor);
        } else if (neighborAmount == maxAmount) {
          // neighboring a pheromone source, so flood fill from here,
          // simpler than the block below this that computes neighbor positions for flood fill
          floodFillQueue.push({position, quantity: maxAmount - decayAmount});
        }
      }
    }
    if (shouldFloodFill && !neverFloodFill) {
      // if you aren't bigger than your biggest neighbor, then your value
      // is actually fine. So then add this position to the floodFillQueue
      // since it's right on the edge of the area that needs to be re-filled in
      const neighborPositions = getNeighborPositions(game, {position}, false /* internal */);
      for (const neighbor of neighborPositions) {
        if (isDiagonalMove(position, neighbor)) continue;
        const occupied = lookupInGrid(game.grid, neighbor)
          .map(id => game.entities[id])
          .filter(e => getPheromoneBlockers(pheromoneType).includes(e.type))
          .length > 0;
        const quantity = Math.max(0, amount - decayAmount);
        if (quantity > 0 && !occupied) {
          floodFillQueue.push({position: neighbor, quantity});
        }
      }
    }
  }
  if (!neverFloodFill) {
    return floodFillPheromone(game, pheromoneType, playerID, floodFillQueue, resultPositions);
  } else {
    return resultPositions;
  }
};

// fade pheromones that disperse
const updateDispersingPheromones = (game) => {
  const nextDispersingPheromones = {};
  for (const pherType of game.config.dispersingPheromones) {
    nextDispersingPheromones[pherType] = {};
  }

  const rate = game.config.dispersingPheromoneUpdateRate;
  let nextWater = {}; // the algorithm for gravity with water will try to push
                      // the same source position multiple times, so don't let it
  for (const pherType in game.dispersingPheromonePositions) {
    for (const encodedPosition in game.dispersingPheromonePositions[pherType]) {
      const source = game.dispersingPheromonePositions[pherType][encodedPosition];
      const {position, playerID, pheromoneType} = source;
      let pheromoneQuantity = getPheromoneAtPosition(game, position, pheromoneType, playerID);

      // need to track if it became 0 on the last update and remove it now
      // (Can't remove it as soon as it becomes 0 or else we won't tell the client
      //  to also set itself to 0)
      if (pheromoneType != 'WATER' && pheromoneQuantity <= 0) {
        continue;
      }
      let decayRate = game.config[playerID][pheromoneType].decayRate;
      if (decayRate == null) {
        decayRate = game.config[playerID][pheromoneType].decayAmount;
      }
      if (pheromoneType == 'WATER') {
        const onVine = lookupInGrid(game.grid, position)
          .map(id => game.entities[id])
          .filter(e => e.type == 'VINE')
          .length > 0;
        if (onVine) {
          decayRate *= game.config['VINE'].waterMultiplier;
        }
      } else {
        decayRate *= rate;
      }

      if (pheromoneType == 'WATER') {
        let positionBelow = add(position, {x: 0, y: 1});
        let occupied = lookupInGrid(game.grid, positionBelow)
          .map(id => game.entities[id])
          .filter(e => game.config.waterBlockingTypes.includes(e.type))
          .length > 0;
        let diagonal = false;
        let leftOrRight = false;
        if (
          occupied ||
          getPheromoneAtPosition(game, positionBelow, pheromoneType, playerID) >
          game.config[playerID][pheromoneType].quantity - 1
        ) {
          const botLeft = add(position, {x: -1, y: 1});
          const botRight = add(position, {x: 1, y: 1});
          const botLeftOccupied = lookupInGrid(game.grid, botLeft)
            .map(id => game.entities[id])
            .filter(e => getPheromoneBlockers(pheromoneType).includes(e.type))
            .length > 0;
          const botRightOccupied = lookupInGrid(game.grid, botRight)
            .map(id => game.entities[id])
            .filter(e => getPheromoneBlockers(pheromoneType).includes(e.type))
            .length > 0;
          if (!botLeftOccupied && !botRightOccupied) {
            positionBelow = oneOf([botLeft, botRight]);
            occupied = false;
            diagonal = true;
          } else if (!botLeftOccupied) {
            positionBelow = botLeft;
            occupied = false;
            diagonal = true;
          } else if (!botRightOccupied) {
            positionBelow = botRight;
            occupied = false;
            diagonal = true;
          } else {
            occupied = true;
            diagonal = true;
          }
        }
        const pheromoneDiag = getPheromoneAtPosition(
          game, positionBelow, 'WATER', playerID,
        );
        if (diagonal || pheromoneDiag > 10) {
          const left = add(position, {x: -1, y: 0});
          const right = add(position, {x: 1, y: 0});
          const leftOccupied = lookupInGrid(game.grid, left)
            .map(id => game.entities[id])
            .filter(e => getPheromoneBlockers(pheromoneType).includes(e.type))
            .length > 0;
          const rightOccupied = lookupInGrid(game.grid, right)
            .map(id => game.entities[id])
            .filter(e => getPheromoneBlockers(pheromoneType).includes(e.type))
            .length > 0;
          if (!leftOccupied && !rightOccupied) {
            const leftPher = getPheromoneAtPosition(game, left, 'WATER', playerID);
            const rightPher = getPheromoneAtPosition(game, right, 'WATER', playerID);
            positionBelow = leftPher > rightPher ? right : left;
            positionBelow = leftPher == rightPher ? oneOf([left, right]) : positionBelow;
            // positionBelow = oneOf([left, right]);
            occupied = false;
            leftOrRight = true;
          } else if (!leftOccupied) {
            positionBelow = left;
            occupied = false;
            leftOrRight = true;
          } else if (!rightOccupied) {
            positionBelow = right;
            occupied = false;
            leftOrRight = true;
          }
          // don't spread left/right to a higher concentration
          // if (leftOrRight) {
          //   const leftRightQuantity =
          //     getPheromoneAtPosition(game, positionBelow, 'WATER', playerID);
          //   if (leftRightQuantity + 1 >= pheromoneQuantity) {
          //     occupied = true;
          //     leftOrRight = false;
          //   }
          // }
        }
        if (!occupied) {
          const pheromoneBelow = getPheromoneAtPosition(
            game, positionBelow, 'WATER', playerID,
          );
          const maxQuantity = game.config[playerID].WATER.quantity;

          let targetPercentLeft = 0;
          if (diagonal) {
            targetPercentLeft = 0.5;
          }
          if (leftOrRight) {
            targetPercentLeft = 0.8;
          }
          let pherToGive = pheromoneQuantity * (1 - targetPercentLeft);
          if (pheromoneBelow + pherToGive > maxQuantity) {
            pherToGive = maxQuantity - pheromoneBelow;
          }
          let leftOverPheromone = pheromoneQuantity - pherToGive;
          // TODO: bring this back when water shouldn't decay
          // if (leftOverPheromone > 1) {
          //   decayRate = 0;
          // }

          // set pheromone at this position to the left over that couldn't fall down
          setPheromone(
            game, position, pheromoneType,
            leftOverPheromone - decayRate,
            playerID,
          );

          if (!nextWater[encodePosition(position)]) {
            const nextQuantity = Math.max(0, leftOverPheromone - decayRate);
            if (nextQuantity != 0 || (source.quantity != 0)) {
              nextDispersingPheromones[pherType][encodePosition(position)] = {
                ...source,
                position: {...position},
                quantity: nextQuantity,
              };
              nextWater[encodePosition(position)] = true;
            }
          }
          // update the source to be the next position
          pheromoneQuantity = (pheromoneQuantity - leftOverPheromone) + pheromoneBelow;
          source.position = positionBelow;
        }
      }

      // TODO: bring this back when water shouldn't decay
      // if (pheromoneType == 'WATER' && pheromoneQuantity > 1) {
      //   decayRate = 0;
      // }

      setPheromone(
        game, source.position, pheromoneType,
        Math.max(0, pheromoneQuantity - decayRate),
        playerID,
      );
      if (pheromoneType == 'WATER') {
        if (pheromoneQuantity - decayRate > 0) {
          if (nextWater[encodePosition(source.position)]) {
            continue; // we've already done something with this water
          } else {
            nextWater[encodePosition(source.position)] = true;
          }
          nextDispersingPheromones[pherType][encodePosition(source.position)] =
            {...source, quantity: Math.max(0, pheromoneQuantity - decayRate)};
        }
      } else {
        nextDispersingPheromones[pherType][encodePosition(source.position)] =
          {...source, quantity: Math.max(0, pheromoneQuantity - decayRate)};
      }
    }
  }
  game.dispersingPheromonePositions = nextDispersingPheromones;
  return nextDispersingPheromones;
}



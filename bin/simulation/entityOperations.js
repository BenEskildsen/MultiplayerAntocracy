const {
  add,
  subtract,
  vectorTheta,
  equals
} = require('../utils/vectors');
const {
  thetaToDir,
  closeTo,
  encodePosition
} = require('../utils/helpers');
const {
  insideGrid,
  insertInCell,
  deleteFromCell,
  getEntityPositions
} = require('../utils/gridHelpers');
const {
  getNeighborEntities,
  getNeighborPositions
} = require('../selectors/neighbors');
const {
  makeEntity
} = require('../entities/makeEntity');
const {
  getEntityPheromoneSources,
  getQuantityForStalePos,
  getPheromoneAtPosition,
  getPheromoneBlockers
} = require('../selectors/pheromones');
const {
  setPheromone
} = require('../simulation/pheromones');
const insertEntityInGrid = (game, entity) => {
  const dir = thetaToDir(entity.theta);
  if (entity.segmented) {
    const {
      position,
      segments
    } = entity;
    const nextSegments = [];
    // head
    insertInCell(game.grid, position, entity.id);

    // segments
    let prevPos = position;
    for (let i = 0; i < segments.length - 1; i++) {
      const pos = segments[i].position;
      const nextPos = segments[i + 1].position;
      let segmentType = 'corner';
      let theta = 0;
      const beforeVec = subtract(prevPos, pos);
      const afterVec = subtract(pos, nextPos);
      if (beforeVec.x == 0 && afterVec.x == 0) {
        segmentType = 'straight';
        theta = beforeVec.y > afterVec.y ? Math.PI / 2 : 3 * Math.PI / 2;
      } else if (beforeVec.y == 0 && afterVec.y == 0) {
        segmentType = 'straight';
        theta = beforeVec.x > afterVec.x ? 2 * Math.PI : 0;
      } else {
        segmentType = 'corner';
        if (beforeVec.x > afterVec.x && beforeVec.y > afterVec.y) {
          theta = Math.PI;
        } else if (beforeVec.x < afterVec.x && beforeVec.y < afterVec.y) {
          theta = 0;
        } else if (beforeVec.x < afterVec.x && beforeVec.y > afterVec.y) {
          theta = 3 * Math.PI / 2;
        } else {
          theta = Math.PI / 2;
        }
      }
      nextSegments.push({
        position: pos,
        theta,
        segmentType
      });
      prevPos = pos;
      insertInCell(game.grid, pos, entity.id);
    }

    // tail
    const segBeforeTailPos = segments.length > 1 ? segments[segments.length - 2].position : position;
    const tailPos = segments[segments.length - 1].position;
    nextSegments.push({
      position: tailPos,
      theta: vectorTheta(subtract(segBeforeTailPos, tailPos))
    });
    insertInCell(game.grid, tailPos, entity.id);
    entity.segments = nextSegments;
  } else {
    for (let x = 0; x < entity.width; x++) {
      for (let y = 0; y < entity.height; y++) {
        let pos = {
          x,
          y
        };
        if (dir == 'left' || dir == 'right') {
          pos = {
            x: y,
            y: x
          };
        }
        const gridPos = add(entity.position, pos);
        insertInCell(game.grid, gridPos, entity.id);
        if (game.config.pheromoneBlockingTypes.includes(entity.type) && game.pheromoneWorker) {
          game.dirtPutdownPositions = game.dirtPutdownPositions.filter(p => !equals(p, gridPos));
        }
      }
    }
  }

  // for the worker
  if (!game.pheromoneWorker) return;
  if (game.time > 1) {
    game.pheromoneWorker.postMessage({
      type: 'INSERT_IN_GRID',
      entity
    });
  }
  if (game.time > 1 && game.config.unanimatedTypes.includes(entity.type)) {
    markEntityAsStale(game, entity);
  }

  // tiled sprites updating:
  if (game.config.tiledTypes.includes(entity.type)) {
    game.staleTiles.push(entity.id);
    const neighbors = getNeighborEntities(game, entity, true /*external*/).filter(e => e.type == entity.type).map(e => e.id);
    game.staleTiles.push(...neighbors);
  }
  if (game.time < 1) return;
  // pheromone updating:
  const pherSources = getEntityPheromoneSources(game, entity);
  if (pherSources.length > 0) {
    // TODO: do I need to do this filter? NOTE that having it breaks critter pheromone
    // game.reverseFloodFillSources = game.reverseFloodFillSources
    //   .filter(s => s.id != entity.id);
    game.floodFillSources.push(...pherSources);
  } else if (game.config.pheromoneBlockingTypes.includes(entity.type)) {
    game.floodFillSources = game.floodFillSources.filter(s => s.id != entity.id);
    const neighborPositions = getNeighborPositions(game, entity, true /* external */);

    for (const playerID in game.players) {
      for (const pheromoneType of game.config.steadyStatePheromones) {
        // NOTE: dispersing pheromones never reverseFloodFill
        if (game.config.dispersingPheromones.includes(pheromoneType)) {
          setPheromone(game, entity.position, pheromoneType, 0, playerID);
          continue;
        }
        for (const pos of getEntityPositions(game, entity)) {
          setPheromone(game, pos, pheromoneType, 0, playerID);
        }
        const maxAmount = game.config[playerID][pheromoneType].quantity;
        for (const neighbor of neighborPositions) {
          const quantity = getPheromoneAtPosition(game, neighbor, pheromoneType, playerID);
          if (quantity < maxAmount) {
            game.reverseFloodFillSources.push({
              id: entity.id,
              position: neighbor,
              pheromoneType,
              playerID
            });
          }
        }
      }
    }
  }
};
const removeEntityFromGrid = (game, entity) => {
  const position = entity.position;
  const dir = thetaToDir(entity.theta);
  if (entity.segmented) {
    for (const segment of entity.segments) {
      deleteFromCell(game.grid, segment.position, entity.id);
    }
    deleteFromCell(game.grid, entity.position, entity.id);
  } else {
    for (let x = 0; x < entity.width; x++) {
      for (let y = 0; y < entity.height; y++) {
        let pos = {
          x,
          y
        };
        if (dir == 'left' || dir == 'right') {
          pos = {
            x: y,
            y: x
          };
        }
        const gridPos = add(entity.position, pos);
        deleteFromCell(game.grid, gridPos, entity.id);
      }
    }
  }

  // for the worker
  if (!game.pheromoneWorker) return;
  if (game.time > 1) {
    game.pheromoneWorker.postMessage({
      type: 'REMOVE_FROM_GRID',
      entity
    });
  }
  if (game.time > 1 && game.config.unanimatedTypes.includes(entity.type)) {
    markEntityAsStale(game, entity);
  }

  // tiled sprites updating:
  if (game.config.tiledTypes.includes(entity.type)) {
    game.staleTiles = game.staleTiles.filter(id => id != entity.id);
    const neighbors = getNeighborEntities(game, entity, true /*external*/).filter(e => e.type == entity.type).map(e => e.id);
    game.staleTiles.push(...neighbors);
  }
  if (game.time < 1) return;
  // pheromone updating:
  const pherSources = getEntityPheromoneSources(game, entity);
  if (pherSources.length > 0) {
    const pheromoneType = pherSources[0].pheromoneType;
    // NOTE: dispersing pheromones never reverseFloodFill
    if (game.config.dispersingPheromones.includes(pheromoneType)) {
      return;
    }
    const playerID = pherSources[0].playerID;
    // If you are added as a fill source AND removed from the grid on the same tick,
    // then the pheromone will stay behind because reverse fills are done before flood fills
    // So check if you are in the floodFill queue and just remove it:
    for (const source of pherSources) {
      game.floodFillSources = game.floodFillSources.filter(s => {
        return !(s.pheromoneType == source.pheromoneType && s.playerID == source.playerID && equals(s.position, source.position));
      });
    }

    // by adding 1, we force this position to be bigger than all its neighbors, which is how the
    // reverse flooding checks if a position is stale and should be set to 0
    for (const source of pherSources) {
      setPheromone(game, source.position, pheromoneType, source.quantity + 1, playerID);
    }
    game.reverseFloodFillSources.push(...pherSources);
  }
  // NOTE: not an else if because marked dirt needs both
  if (game.config.pheromoneBlockingTypes.includes(entity.type)) {
    // game.reverseFloodFillSources = game.reverseFloodFillSources.filter(s => s.id != entity.id);
    for (const playerID in game.players) {
      for (const pheromoneType of game.config.steadyStatePheromones) {
        if (pherSources.length > 0 && pherSources[0].pheromoneType == pheromoneType) {
          continue; // don't flood fill this type, we just removed it
        }

        const quantity = getQuantityForStalePos(game, position, pheromoneType, playerID).quantity;
        setPheromone(game, entity.position, pheromoneType, 0, playerID);
        game.floodFillSources.push({
          id: entity.id,
          position,
          quantity,
          pheromoneType,
          playerID,
          stale: true // if stale, then you override the quantity value when
          // it comes time to compute
        });
      }
    }
  }
};

const addEntity = (game, entity) => {
  entity.id = game.nextID++;
  game.entities[entity.id] = entity;

  // properties:
  game[entity.type].push(entity.id);
  // track queens separately
  if (
  // NOTE: larva can have the queen caste too!!
  (entity.type == 'ANT' && entity.caste == 'QUEEN' || entity.caste == 'TERMITE_QUEEN') && game.queens[entity.playerID] == null) {
    game.queens[entity.playerID] = entity.id;
  }
  if (entity.isGoalCritter) {
    game.GOAL_CRITTER[entity.id] = true;
  }
  if (game.pheromoneWorker && game.time > 1) {
    game.pheromoneWorker.postMessage({
      type: 'ADD_ENTITY',
      entity
    });
  }
  insertEntityInGrid(game, entity);
  return game;
};
const removeEntity = (game, entity) => {
  game[entity.type] = game[entity.type].filter(id => id != entity.id);

  // properties
  if (game.GOAL_CRITTER[entity.id]) {
    delete game.GOAL_CRITTER[entity.id];
  }
  if (game.queens[entity.playerID] == entity.id) {
    delete game.queens[entity.playerID];
  }
  delete game.entities[entity.id];
  if (game.pheromoneWorker && game.time > 1) {
    game.pheromoneWorker.postMessage({
      type: 'REMOVE_ENTITY',
      entity
    });
  }
  if (entity.position != null) {
    removeEntityFromGrid(game, entity);
  }
  return game;
};
const moveEntity = (game, entity, nextPos) => {
  entity.prevPosition = {
    ...entity.position
  };
  removeEntityFromGrid(game, entity);
  entity.position = {
    ...nextPos
  };
  // if it's segmented, also update the positions of all the segments
  // before inserting back into the grid
  if (entity.segmented) {
    let next = {
      ...entity.prevPosition
    };
    for (const segment of entity.segments) {
      const tmp = {
        ...segment.position
      };
      segment.position = next;
      next = tmp;
    }
  }
  insertEntityInGrid(game, entity);

  // only rotate if you have to, so as not to blow away prevTheta
  const nextTheta = vectorTheta(subtract(entity.prevPosition, entity.position));
  if (!closeTo(nextTheta, entity.theta)) {
    rotateEntity(game, entity);
  }
  return game;
};
const rotateEntity = (game, entity, nextTheta) => {
  if (entity.width != entity.height) {
    removeEntityFromGrid(game, entity);
  }
  entity.prevTheta = entity.theta;
  entity.theta = nextTheta;
  if (entity.width != entity.height) {
    insertEntityInGrid(game, entity);
  }
  return game;
};
const changeEntityType = (game, entity, oldType, nextType) => {
  // NOTE: remove then re-add to grid in order to get pheromones working right
  removeEntityFromGrid(game, entity);
  game[oldType] = game[oldType].filter(id => id != entity.id);
  game[nextType].push(entity.id);
  entity.type = nextType;
  insertEntityInGrid(game, entity);
};
const changeEntitySize = (game, entity, width, height) => {
  removeEntityFromGrid(game, entity);
  entity.prevWidth = entity.width;
  entity.prevHeight = entity.height;
  entity.width = width;
  entity.height = height;
  insertEntityInGrid(game, entity);
};
const addSegmentToEntity = (game, entity, segmentPosition) => {
  removeEntityFromGrid(game, entity);
  entity.segments.push({
    position: segmentPosition
  });
  insertEntityInGrid(game, entity);
};

///////////////////////////////////////////////////////////////////////////
// Entity Subdivision
///////////////////////////////////////////////////////////////////////////

const subdivideEntity = (game, entity) => {
  const subdivisions = [];
  const quadrantPositions = [{
    x: entity.position.x,
    y: entity.position.y
  }];
  if (entity.width > 1) {
    quadrantPositions.push({
      x: Math.floor(entity.position.x + entity.width / 2),
      y: entity.position.y
    });
  }
  if (entity.height > 1) {
    quadrantPositions.push({
      x: entity.position.x,
      y: Math.floor(entity.position.y + entity.height / 2)
    });
  }
  if (entity.width > 1 && entity.height > 1) {
    quadrantPositions.push({
      x: Math.floor(entity.position.x + entity.width / 2),
      y: Math.floor(entity.position.y + entity.height / 2)
    });
  }
  for (const pos of quadrantPositions) {
    const width = pos.x != entity.position.x ? entity.width - (pos.x - entity.position.x) : Math.max(1, Math.floor(entity.position.x + entity.width / 2) - pos.x);
    const height = pos.y != entity.position.y ? entity.height - (pos.y - entity.position.y) : Math.max(1, Math.floor(entity.position.y + entity.height / 2) - pos.y);
    // console.log(pos.x, pos.y, width, height);
    const quadrantEntity = {
      ...entity,
      // carry over other properties beside pos/dimensions
      ...makeEntity(entity.type, pos, width, height)
    };
    subdivisions.push(quadrantEntity);
  }
  return subdivisions;
};
const continuouslySubdivide = (game, entity, pickupPos) => {
  const subdivisions = subdivideEntity(game, entity);
  let toSub = null;
  for (const sub of subdivisions) {
    // check if pickupPos is inside this sub
    if (pickupPos.x >= sub.position.x && pickupPos.x < sub.position.x + sub.width && pickupPos.y >= sub.position.y && pickupPos.y < sub.position.y + sub.height) {
      toSub = sub;
    } else {
      addEntity(game, sub);
    }
  }
  if (toSub.width > 1 || toSub.height > 1) {
    return continuouslySubdivide(game, toSub, pickupPos);
  } else {
    addEntity(game, toSub);
    return toSub;
  }
};

///////////////////////////////////////////////////////////////////////////
// Pickup/Putdown
///////////////////////////////////////////////////////////////////////////

const pickupEntity = (game, entity, pickupPos) => {
  let toPickup = entity;
  removeEntityFromGrid(game, entity);
  entity.prevPosition = entity.position;
  // do the subdivision if entity is bigger
  // if (pickupPos != null && (entity.width > 1 || entity.height > 1)) {
  //   const sub = continuouslySubdivide(game, entity, pickupPos);
  //   removeEntityFromGrid(game, sub);
  //   sub.position = null;
  //   toPickup = sub;
  //   removeEntity(game, entity);
  // } else {
  entity.position = null;
  // }

  return toPickup;
};
const putdownEntity = (game, entity, pos) => {
  entity.position = {
    ...pos
  };
  entity.prevPosition = {
    ...pos
  };

  // NOTE: need to do this before inserting in the grid so it doesn't do
  // a flood fill unnecessarily
  if (entity.type == 'DIRT' && entity.marked) {
    entity.marked = null;
    game.markedDirtIDs = game.markedDirtIDs.filter(id => id != entity.id);
  }
  insertEntityInGrid(game, entity);
  return game;
};

// Helper function for insert/remove to mark as stale all entity positions
// plus all neighbor positions when computing the image-based rendering background
const markEntityAsStale = (game, entity) => {
  getEntityPositions(game, entity).forEach(pos => {
    const key = encodePosition(pos);
    if (!game.viewImage.stalePositions[key]) {
      game.viewImage.stalePositions[key] = pos;
    }
  });
  getNeighborPositions(game, entity).forEach(pos => {
    const key = encodePosition(pos);
    if (!game.viewImage.stalePositions[key]) {
      game.viewImage.stalePositions[key] = pos;
    }
  });
  game.viewImage.isStale = true;
};
module.exports = {
  addEntity,
  removeEntity,
  moveEntity,
  rotateEntity,
  pickupEntity,
  putdownEntity,
  changeEntityType,
  changeEntitySize,
  markEntityAsStale,
  addSegmentToEntity,
  // NOTE: only used by the worker!
  insertEntityInGrid,
  removeEntityFromGrid
};
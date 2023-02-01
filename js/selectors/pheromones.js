// @flow

const {
  add, multiply, subtract, equals, floor, containsVector,
} = require('../utils/vectors');
const {isDiagonalMove} = require('../utils/helpers');
const {getNeighborPositions} = require('../selectors/neighbors');
const {
  lookupInGrid, getEntityPositions, insideGrid,
} = require('../utils/gridHelpers');
const {
  getUnoccupiedPositionsInTokenRadius, getPositionsInTokenRadius,
  inTokenRadius,
} = require('../selectors/tokens');
const globalConfig = require('../config');

const getPheromoneAtPosition = (
  game: Game, position: Vector, type: PheromoneType, playerID: PlayerID,
): number => {
  const {grid} = game;
  if (!insideGrid(grid, position)) return 0;
  const {x, y} = position;
  return grid[x][y][playerID][type] || 0;
};

/**
 * When a position is opened up, get candidate {pos, quantity} based on the
 * pheromone value of the greatest neighbor OR
 * if this position is itself generating pheromones (because it's in a
 * token radius) then just return that value
 */
const getQuantityForStalePos = (
  game: game, position: Vector,
  pheromoneType: PheromoneType, playerID: PlayerID,
): {position: Vector, quantity: number} => {
  if (inTokenRadius(game, {position, playerID}, pheromoneType)) {
    return {
      position,
      quantity: game.config[playerID][pheromoneType].quantity,
    };
  }

  const neighborPositions = getNeighborPositions(game, {position}, false /* internal */);
  const decayAmount = game.config[playerID][pheromoneType].decayAmount;
  let quantity = 0;
  for (const pos of neighborPositions) {
    if (isDiagonalMove(position, pos)) continue;
    let candidateAmount =
      getPheromoneAtPosition(game, pos, pheromoneType, playerID) - decayAmount;
    if (candidateAmount > quantity) {
      quantity = candidateAmount;
    }
  }
  return {position, quantity}
};


/**
 * If the given entity is a pheromone source, return it/any positions associated with
 * it that are also pheromone sources
 */
const getEntityPheromoneSources = (
  game: Game, entity: Entity,
): Array<{
  position: Vector,
  quantity: number,
  playerID: PlayerID,
  pheromoneType: PheromoneType,
}> => {
  const steadyStatePheromones = game.config.steadyStatePheromones;
  // these two are entities whose sources take up multiple positions:
  if (entity.type == 'TOKEN' && steadyStatePheromones.includes(entity.pheromoneType)) {
    const pherSources = getUnoccupiedPositionsInTokenRadius(game, entity, true).map(position => {
      const pheromoneType = entity.pheromoneType;
      const playerID = entity.playerID;
      const quantity = game.config[playerID][pheromoneType].quantity;
      return {
        id: entity.id,
        playerID,
        pheromoneType,
        position,
        quantity,
      };
    });
    if (entity.pheromoneType == 'COLONY') {
      pherSources.push({
        id: entity.id,
        playerID: entity.playerID,
        quantity: game.config[entity.playerID]['PASS_THROUGH_COLONY'].quantity,
        position: entity.position,
        pheromoneType: 'PASS_THROUGH_COLONY',
      });
    }
    return pherSources;
  }
  // if (game.config.critterTypes.includes(entity.type)) {
  //   const pheromoneType = 'CRITTER_PHER';
  //   const playerID = game.playerID; // TODO: HACK: critters don't have a playerID, use player's
  //   const quantity = game.config[playerID][pheromoneType].quantity;
  //   return getEntityPositions(game, entity)
  //     .map(position => ({
  //       id: entity.id,
  //       playerID,
  //       pheromoneType,
  //       position,
  //       quantity,
  //     }));
  // }

  let pheromoneType = null;
  let playerID = null;
  let quantity = 0;
  if (
    entity.caste == 'QUEEN' && entity.selectedPheromone == 'QUEEN_PHER' &&
    entity.pheromoneActive
  ) {
    pheromoneType = 'QUEEN_PHER';
    playerID = entity.playerID;
    quantity = game.config[playerID][pheromoneType].quantity;
    return getEntityPositions(game, entity)
      .map(position => ({
        id: entity.id,
        playerID,
        pheromoneType,
        position,
        quantity,
      }));
  }
  if (
    entity.caste == 'QUEEN' && entity.selectedPheromone == 'QUEEN_DISPERSE' &&
    entity.pheromoneActive
  ) {
    pheromoneType = 'QUEEN_DISPERSE';
    playerID = entity.playerID;
    quantity = game.config[playerID][pheromoneType].quantity;
    return getEntityPositions(game, entity)
      .map(position => ({
        id: entity.id,
        playerID,
        pheromoneType,
        position,
        quantity,
      }));
  }
  // NOTE: PATROL_DEFEND_PHER is only at the position
  if (
    entity.caste == 'QUEEN' && entity.selectedPheromone == 'PATROL_DEFEND_PHER' &&
    entity.pheromoneActive
  ) {
    pheromoneType = 'PATROL_DEFEND_PHER';
    playerID = entity.playerID;
    quantity = game.config[playerID][pheromoneType].quantity;
    return getEntityPositions(game, entity)
      .map(position => ({
        id: entity.id,
        playerID,
        pheromoneType,
        position,
        quantity,
      }));
  }
  if (
    (entity.caste == 'QUEEN' && entity.selectedPheromone == 'QUEEN_ALERT'
      && entity.pheromoneActive)
    || (entity.actions != null && entity.actions[0] != null
      && (entity.actions[0].type == 'BITE' || entity.actions[0].type == 'GRAPPLE')
      && (entity.type == 'ANT' && entity.playerID != game.playerID
        || entity.type == 'TERMITE'))
  ) {
    pheromoneType = 'QUEEN_ALERT';
    playerID = entity.playerID;
    quantity = game.config[playerID][pheromoneType].quantity;
    return getEntityPositions(game, entity)
      .map(position => ({
        id: entity.id,
        playerID,
        pheromoneType,
        position,
        quantity,
      }));
  }

  if (
    entity.holding != null && entity.holding.type == 'FOOD'
      && (entity.task == 'RETURN' || entity.caste == 'QUEEN')
  ) {
    pheromoneType = 'FOOD';
    playerID = entity.playerID;
    quantity = entity.foodPherQuantity || 0;
    if (quantity == 0) {
      return [];
    }
  }

  if (entity.type == 'LARVA') {
    pheromoneType = 'LARVA';
    playerID = entity.playerID;
    quantity = game.config[playerID][pheromoneType].quantity;
  }
  if (entity.type == 'DIRT' && entity.marked != null) {
    pheromoneType = 'MARKED_DIRT_PHER';
    playerID = entity.marked;
    quantity = game.config[playerID][pheromoneType].quantity;
  }

  if (pheromoneType != null) {
    return [{
      id: entity.id,
      playerID,
      pheromoneType,
      position: entity.position,
      quantity,
    }];
  }
  return [];
}

/**
 *  Function used at the game start to populate the initial set of pheromones
 *  across all entities emitting pheromones of the given type and playerID
 */
const getSourcesOfPheromoneType = (
  game: Game, pheromoneType: PheromoneType, playerID: PlayerID,
): Array<Entity> => {
  let sources = [];
  switch (pheromoneType) {
    case 'MOVE_LARVA_PHER':
    case 'COLONY':
    case 'DIRT_DROP':
    case 'EGG':
    case 'PUPA':
    case 'DOMESTICATE':
      sources = game.TOKEN
        .map(id => game.entities[id])
        .filter(t => t.playerID == playerID && t.pheromoneType == pheromoneType);
      break;
    case 'PASS_THROUGH_COLONY':
      sources = game.TOKEN
        .map(id => game.entities[id])
        .filter(t => t.playerID == playerID && t.pheromoneType == 'COLONY');
      break;
    case 'LARVA':
      sources = game.LARVA
        .map(id => game.entities[id])
        .filter(l => l.playerID == playerID);
      break;
    case 'MARKED_DIRT_PHER':
      sources = game.markedDirtIDs
        .map(id => game.entities[id])
        .filter(dirt => dirt.marked == playerID);
      break;
    case 'ALERT':
    case 'FOOD':
    case 'QUEEN_PHER':
      // don't need to implement these since this function only runs at game start
      break;
    case 'CRITTER_PHER':
      // if (playerID != game.playerID) break; // CRITTERS only use player pheromone
      // for (const critterType of game.config.critterTypes) {
      //   for (const id of game[critterType]) {
      //     const critter = game.entities[id];
      //     sources.push(critter);
      //   }
      // }
      // break;
  }
  return sources;
};

const getPheromoneBlockers = (pheromoneType: PheromoneType): Array<EntityType> => {
  if (pheromoneType == 'WATER') {
    return globalConfig.config.waterBlockingTypes;
  }
  if (pheromoneType == 'PASS_THROUGH_COLONY') {
    return globalConfig.config.passThroughColonyBlockingTypes;
  }
  return globalConfig.config.pheromoneBlockingTypes;
};

module.exports = {
  getPheromoneAtPosition,
  getSourcesOfPheromoneType,
  getEntityPheromoneSources,
  getQuantityForStalePos,
  getPheromoneBlockers,
};

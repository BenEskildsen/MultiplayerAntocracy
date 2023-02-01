// @flow

const {
  add, makeVector, subtract, vectorTheta, round,
} = require('../utils/vectors');
const {lookupInGrid, insideGrid} = require('../utils/gridHelpers');

import type {Game, PlayerID, Entity, Ant, Vector} from '../types';

const tokenExists = (
  game: Game, playerID: PlayerID, type: PheromoneType,
): boolean => {
  return getToken(game, playerID, type) != null;
};

const getToken = (
  game: Game, playerID: PlayerID, type: PheromoneType,
): ?Entity => {
  return game.TOKEN
    .map(id => game.entities[id])
    .filter(t => t.playerID == playerID && t.pheromoneType == type)
    [0];
};

const inTokenRadius = (
  game: Game, ant: Ant, pheromoneType: PheromoneType,
): boolean => {
  const token = getToken(game, ant.playerID, pheromoneType);
  if (token == null) return false;
  if (token.position == null) return false;

  const diff = subtract(ant.position, token.position);
  const inRadius = Math.abs(diff.x) + Math.abs(diff.y) <= token.tokenRadius;
  return inRadius;
}


/**
 * A hacky way to check if an ant is near-ish to a token.
 * Specifically for when using the RETURN task for ants holding nothing,
 * they should switch back to WANDER when they're just kinda close to
 * the COLONY token instead of causing a traffic jam trying to touch
 * the open spaces in the radius
 */
const inTokenInfluence = (
  game: Game, ant: Ant, type: PheromoneType,
): boolean => {
  let influenceRadius = 3;
  // if (type == 'COLONY') {
  //   influenceRadius = 0;
  // }
  const token = getToken(game, ant.playerID, type);
  if (token == null) return false;
  if (token.position == null) return false;

  const diff = subtract(ant.position, token.position);
  return Math.abs(diff.x) + Math.abs(diff.y) <= token.tokenRadius + influenceRadius;
}

const getPositionsInTokenRadius = (
  game: Game, token: Token,
): Array<Vector> => {
  const radius = token.tokenRadius;
  const positions = [];
  let position = token.position;
  if (token.position == null) {
    // TODO: it seems like this never happens
    position = token.prevPosition;
  }
  for (let x = 0; x <= radius; x++) {
    for (let y = 0; y <= radius; y++) {
      if (x + y <= radius) {
        positions.push(add({x,y}, position));
        if (x != 0) {
          positions.push(add({x: -x,y}, position));
        }
        if (y != 0) {
          positions.push(add({x,y: -y}, position));
        }
        if (x != 0 && y != 0) {
          positions.push(add({x: -x,y: -y}, position));
        }
      }
    }
  }
  return positions
    .filter(pos => insideGrid(game.grid, pos));
};

const getUnoccupiedPositionsInTokenRadius = (
  game: Game, token: Token, forPheromones: boolean,
  isForPassThrough: boolean,
): Array<Vector> => {
  let positions = [token.position];
  if (!isForPassThrough) {
    positions = getPositionsInTokenRadius(game, token);
  }
  return positions.filter(pos => {
    const entities = lookupInGrid(game.grid, pos);
    return entities
      .map(id => game.entities[id])
      .filter(e => {
        if (!forPheromones) {
          return e.type != 'ANT' &&
            e.type != 'BACKGROUND' &&
            e.type.slice(0,4) != 'DEAD' &&
            e.type != 'SPIDER_WEB';
        } else {
          // NOTE: this is different from pheromoneBlockingTypes since
          // e.g. eggs don't block pheromone, but take up token radius
          return game.config.pheromoneBlockingTypes.includes(e.type);
        }
      }).length == 0;
  });
};

const getNumFoodInTokenRadius = (
  game: game, playerID: PlayerID,
): number => {
  let  token = null;
  for (const tokenID of game.TOKEN) {
    if (
      game.entities[tokenID].playerID == playerID &&
      game.entities[tokenID].pheromoneType == 'COLONY'
    ) {
      token = game.entities[tokenID];
      break;
    }
  }
  if (!token) return 0;

  const positions = getPositionsInTokenRadius(game, token);
  return positions.filter(pos => {
    const entities = lookupInGrid(game.grid, pos);
    return entities
      .map(id => game.entities[id])
      .filter(e => e.type == 'FOOD')
      .length > 0;
  }).length;
};

// window.tokens = {
//   getToken,
//   inTokenRadius,
//   tokenExists,
//   getPositionsInTokenRadius,
//   getUnoccupiedPositionsInTokenRadius,
//   inTokenInfluence,
// }

module.exports = {
  getToken,
  inTokenRadius,
  tokenExists,
  getPositionsInTokenRadius,
  getUnoccupiedPositionsInTokenRadius,
  inTokenInfluence,
  getNumFoodInTokenRadius,
};

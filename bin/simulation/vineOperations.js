const {
  lookupInGrid,
  insideGrid
} = require('../utils/gridHelpers');
const {
  makeVine,
  makeFood,
  makeSeed
} = require('../entities/makeEntity');
const {
  addEntity,
  removeEntity
} = require('../simulation/entityOperations');
const {
  add,
  equals,
  subtract,
  makeVector,
  vectorTheta
} = require('../utils/vectors');
const {
  getFreeNeighborPositions,
  getNeighborEntitiesAndPosition,
  getNeighborEntities
} = require('../selectors/neighbors');
const {
  oneOf,
  weightedOneOf
} = require('../utils/stochastic');
const {
  isDiagonalMove,
  thetaToDir
} = require('../utils/helpers');
const {
  getPheromoneAtPosition,
  getPheromoneBlockers
} = require('../selectors/pheromones');
const {
  getEntityConfig
} = require('../selectors/config');
function updateVines(game) {
  const config = game.config;
  for (const vineID of game.VINE) {
    const vine = game.entities[vineID];
    vine.age++;
    if (vine.position == null) continue;
    let growthRate = 1;
    if (getPheromoneAtPosition(game, vine.position, 'WATER', game.playerID) > 0) {
      growthRate *= config['VINE'].waterMultiplier;
    }
    const nearDomesticate = getFreeNeighborPositions(game, vine, config[game.playerID].pheromoneBlockingTypes).filter(p => {
      return getPheromoneAtPosition(game, p, 'DOMESTICATE', game.playerID) > 0 && config[game.playerID].growthPheromone;
    }).length > 0;
    if (nearDomesticate) {
      growthRate *= config['VINE'].domesticateMultiplier;
    }
    vine.growthAge += growthRate;
    if (vine.hp <= 0) {
      continue;
    }
    if (!shouldGrow(game, vine)) continue;
    vine.growthAge = 0;
    if (vine.subType == 'BUD') {
      growBud(game, vine);
    } else if (vine.subType == 'STALK') {
      growStalk(game, vine);
    }
  }
}
;
function growBud(game, vine) {
  const config = game.config;
  vine.forked = false;
  const candidatePositions = getFreeNeighborPositions(game, vine, getEntityConfig(game, vine).blockingTypes).filter(pos => !isDiagonalMove(vine.position, pos));
  // "secure" positions neighbor dirt or stone
  const securePositions = candidatePositions.filter(pos => {
    const neighborEntities = getNeighborEntities(game, {
      ...vine,
      position: pos
    });
    const isSecure = neighborEntities.filter(e => e.type == 'STONE' || e.type == 'DIRT').length > 0;
    return isSecure;
  });
  if (securePositions.length > 0) {
    addEntity(game, makeVine(game, oneOf(securePositions), 'BUD'));
    if (securePositions.length > 1) {
      vine.forked = true;
    }
  } else if (candidatePositions.length > 1) {
    addEntity(game, makeVine(game, oneOf(candidatePositions), 'BUD'));
  }
  if (!vine.forked && Math.random() < config['VINE'].forkRate) {
    vine.forked = true;
  }
  if (!vine.forked) {
    vine.roots = getNeighborEntities(game, vine).filter(e => e.type == 'STONE' || e.type == 'DIRT').filter(e => !isDiagonalMove(e.position, vine.position)).map(e => subtract(e.position, vine.position))
    // don't create overlapping vines
    .filter(p => {
      return getNeighborEntities(game, {
        ...vine,
        position: add(p, vine.position)
      }).filter(e => !isDiagonalMove(e.position, p)).filter(e => {
        if (e.type == 'VINE' && e.subType == 'STALK') {
          const rootPositions = e.roots.map(pos => add(pos, e.position));
          return rootPositions.filter(pos => equals(add(p, vine.position), pos)).length != 0;
        }
        return false;
      }).length == 0;
    });
    vine.subType = 'STALK';
  }
}
function growStalk(game, vine) {
  const config = game.config;
  const candidatePositions = getFreeNeighborPositions(game, vine, getEntityConfig(game, vine).blockingTypes);
  for (const position of candidatePositions) {
    if (isDiagonalMove(position, vine.position)) continue;
    if (Math.random() > config['VINE'].foodRate) {
      const leafPos = freeToGrowLeaf(game, position, true);
      if (!leafPos) return;
      const theta = vectorTheta(subtract(position, vine.position)) + Math.PI / 2;
      const offset = makeVector(theta, -1);
      if (!insideGrid(add(offset, leafPos))) return;
      addEntity(game, makeVine(game, add(offset, leafPos), 'LEAF', theta));
      return;
    } else {
      const leafPos = freeToGrowLeaf(game, position, false);
      if (!leafPos) return;
      vine.sprouts.push({
        theta: vectorTheta(subtract(position, vine.position)) + Math.PI / 2,
        pos: subtract(position, vine.position)
      });
      const width = config.VINE.foodWidth;
      const height = config.VINE.foodHeight;
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const pos = add(leafPos, {
            x,
            y
          });
          addEntity(game, makeFood(game, pos));
        }
      }
      return;
    }
  }
}
function freeToGrowLeaf(game, position, isLeaf) {
  const config = game.config;
  const width = isLeaf ? config.VINE.leafWidth : config.VINE.foodWidth;
  const height = isLeaf ? config.VINE.leafHeight : config.VINE.foodHeight;
  const growthPositions = [position, {
    x: position.x - width + 1,
    y: position.y
  }, {
    x: position.x,
    y: position.y - height + 1
  }, {
    x: position.x - width + 1,
    y: position.y - height + 1
  }];
  for (const growthPos of growthPositions) {
    let occupiedFlag = false;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const pos = add(growthPos, {
          x,
          y
        });
        if (!insideGrid(game.grid, pos)) {
          occupiedFlag = true;
        }
        const occupied = lookupInGrid(game.grid, pos).map(id => game.entities[id]).filter(e => e.type.slice(0, 4) != 'DEAD' && e.type != 'BACKGROUND').length > 0;
        if (occupied) {
          occupiedFlag = true;
        }
      }
    }
    if (!occupiedFlag) {
      return growthPos;
    }
  }
  return false;
}
function shouldGrow(game, vine) {
  const config = game.config;
  if (vine.subType == 'LEAF') return false;
  let rate = vine.forked ? config['VINE'].forkedGrowthRate : config['VINE'].growthRate;
  if (vine.subType == 'STALK') {
    let leafRate = config['VINE'].leafRate;
    if (getPheromoneAtPosition(game, vine.position, 'WATER', game.playerID) > 0) {
      leafRate *= config['VINE'].waterMultiplier * 4;
    }
    if (vine.growthAge >= rate) {
      if (Math.random() < leafRate) {
        return true;
      } else {
        vine.growthAge = 0;
      }
    }
  }
  if (vine.subType == 'BUD') {
    if (vine.growthAge > rate) {
      return true;
    }
  }
  return false;
}
module.exports = {
  updateVines
};
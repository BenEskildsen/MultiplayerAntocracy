const globalConfig = require('../config');
const {
  thetaToDir,
  clamp
} = require('../utils/helpers');
const {
  add,
  multiply,
  subtract,
  equals,
  floor,
  containsVector
} = require('../utils/vectors');
const initGrid = (gridWidth, gridHeight, numPlayers) => {
  const grid = [];
  for (let x = 0; x < gridWidth; x++) {
    const col = [];
    for (let y = 0; y < gridHeight; y++) {
      const cell = {
        entities: []
      };
      for (let i = 0; i < numPlayers; i++) {
        cell[i + 1] = {};
        for (const pheromoneType of globalConfig.config.pheromoneTypes) {
          cell[i + 1][pheromoneType] = 0;
        }
      }
      col.push(cell);
    }
    grid.push(col);
  }
  return grid;
};
const insideGrid = (grid, position) => {
  if (position == null) return false;
  const {
    x,
    y
  } = position;
  return grid[x] != null && x >= 0 && y >= 0 && x < grid.length && y < grid[x].length;
};
const entityInsideGrid = (game, entity) => {
  const {
    gridWidth,
    gridHeight
  } = game;
  const {
    position,
    width,
    height
  } = entity;
  if (position == null) return false;
  const {
    x,
    y
  } = position;
  return x >= 0 && y >= 0 && x + width <= gridWidth && y + height <= gridHeight;
};
const lookupInGrid = (grid, position) => {
  if (!insideGrid(grid, position)) return [];
  return grid[position.x][position.y].entities;
};
const getPheromonesInCell = (grid, position, playerID) => {
  if (!insideGrid(grid, position)) return [];
  return grid[position.x][position.y][playerID];
};
const insertInCell = (grid, position, entityID) => {
  if (!insideGrid(grid, position)) return false;
  grid[position.x][position.y].entities.push(entityID);
  return true;
};
const deleteFromCell = (grid, position, entityID) => {
  if (!insideGrid(grid, position)) return true;
  const {
    x,
    y
  } = position;
  const oldLength = grid[x][y].entities.length;
  grid[x][y].entities = grid[x][y].entities.filter(id => id != entityID);
  return oldLength != grid[x][y].entities.length;
};
const canvasToGrid = (game, canvasPos) => {
  const config = globalConfig.config;
  let {
    viewPos,
    viewWidth,
    viewHeight
  } = game;

  // HACK: this is copypasta from the render/render.js function for maxMinimap
  if (game.maxMinimap) {
    const nextViewPos = {
      x: game.viewPos.x - game.viewWidth * 3 / 2,
      y: game.viewPos.y - game.viewHeight * 3 / 2
    };
    viewWidth *= 3;
    viewHeight *= 3;
    viewPos = {
      x: clamp(nextViewPos.x, 0, game.gridWidth - game.viewWidth * 3),
      y: clamp(nextViewPos.y, 0, game.gridHeight - game.viewHeight * 3)
    };
    if (viewWidth > game.gridWidth) {
      viewPos.x = game.gridWidth / 2 - viewWidth / 2;
    }
    if (viewHeight > game.gridHeight) {
      viewPos.y = game.gridHeight / 2 - viewHeight / 2;
    }
  }
  const scaleVec = {
    x: viewWidth / config.canvasWidth,
    y: viewHeight / config.canvasHeight
  };
  const gridCoord = floor(add({
    x: viewPos.x,
    y: viewPos.y
  }, multiply(canvasPos, scaleVec)));
  return floor(gridCoord);
};
const getEntityPositions = (game, entity) => {
  if (entity.segmented) {
    return [entity.position, ...entity.segments.map(s => s.position)];
  }
  const width = entity.width != null ? entity.width : 1;
  const height = entity.height != null ? entity.height : 1;
  const dir = thetaToDir(entity.theta);
  const positions = [];
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
      positions.push(add(entity.position, pos));
    }
  }
  return positions;
};
module.exports = {
  initGrid,
  // TODO: move gridHelpers out of utils/
  insideGrid,
  lookupInGrid,
  insertInCell,
  deleteFromCell,
  getPheromonesInCell,
  canvasToGrid,
  getEntityPositions,
  entityInsideGrid
};
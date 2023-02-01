// @flow

const {
  subtract, add, makeVector, vectorTheta, dist,
  magnitude, scale, toRect,
} = require('../utils/vectors');
const {lookupInGrid, getEntityPositions} = require('../utils/gridHelpers');
const {clamp} = require('../utils/helpers');
const {renderAnt, renderAntSprite, renderDeadAnt} = require('./renderAnt');
const {
  renderTermite, renderDeadTermite, renderTermiteEgg,
} = require('./renderTermite');
const {
  renderFood, renderDirt, renderToken,
  renderEgg, renderLarva, renderPupa,
  renderStone, renderDoodad, renderBackground,
  renderForeground, renderSpiderWeb,
  renderVine, renderSeed,
  renderCritterEgg,
} = require('./renderOthers');
const {renderCritter} = require('./renderCritters');
const {
  renderWorm, renderCentipede,
  renderDeadWorm, renderDeadCentipede,
  renderCaterpillar, renderDeadCaterpillar,
} = require('./renderSegmented');
const {renderFoot} = require('./renderFoot');
const {
  onScreen, getPositionsInFront, getQueen,
  getQueenBiteAction,
} = require('../selectors/misc');
const globalConfig = require('../config');
const {
  getInterpolatedPos, getSpriteAndOffset, getInterpolatedTheta,
  getPheromoneSprite, getTileSprite,
} = require('../selectors/sprites');
const {renderMinimap} = require('./renderMinimap');

import type {Game, Entity, Hill, Ant, Food} from '../types';

const renderFns = {
  BACKGROUND: renderBackground,
  DEAD_ANT: renderDeadAnt,
  DEAD_SPIDER: renderCritter,
  DEAD_BEETLE: renderCritter,
  DEAD_TERMITE: renderDeadTermite,
  DEAD_CATERPILLAR: renderDeadCaterpillar,
  DIRT: renderDirt,
  STONE: renderStone,
  FOOD: renderFood,
  EGG: renderEgg,
  LARVA: renderLarva,
  PUPA: renderPupa,
  TOKEN: renderToken,
  TERMITE_EGG: renderEgg,
  SPIDER: renderCritter,
  BEETLE: renderCritter,
  APHID: renderCritter,
  ROLY_POLY: renderCritter,
  TERMITE: renderTermite,
  ANT: renderAntSprite,
  FOOT: renderFoot,
  FOREGROUND: renderForeground,
  WORM: renderWorm,
  CENTIPEDE: renderCentipede,
  CATERPILLER: renderCaterpillar,
  DEAD_WORM: renderDeadWorm,
  DEAD_CENTIPEDE: renderDeadCentipede,
  DOODAD: renderDoodad,
  VINE: renderVine,
  SEED: renderSeed,
  CRITTER_EGG: renderCritterEgg,
};

let start = null;
let framesRendered = 0;
let cur = null;
const render = (game: Game): void => {
  window.requestAnimationFrame((timestamp) => {
    if (start == null) {
      start = timestamp;
    }
    // don't call renderFrame multiple times on the same timestamp
    if (timestamp == cur) {
      return;
    }

    framesRendered++;
    // console.log("fps:", framesRendered / ((cur - start) / 1000));
    cur = timestamp;

    renderFrame(game);
  });
}


let canvas = null;
let ctx = null;
const renderFrame = (game: Game): void => {
  canvas = document.getElementById('canvas');
  if (!canvas) return; // don't break
  ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, globalConfig.config.canvasWidth, globalConfig.config.canvasHeight);

  const pxWidth = globalConfig.config.canvasWidth / 4;
  const pxHeight = pxWidth * (game.viewHeight / game.viewWidth);
  if (!game.maxMinimap) {
    const bigDims = {
      pxWidth: globalConfig.config.canvasWidth,
      pxHeight: globalConfig.config.canvasHeight,
      viewWidth: game.viewWidth,
      viewHeight: game.viewHeight,
      viewPos: {...game.viewPos},
    };
    const miniDims = {
      pxWidth,
      pxHeight,
      viewWidth: game.viewWidth * 2,
      viewHeight: game.viewHeight * 2,
      viewPos: {
        x: game.viewPos.x - game.viewWidth / 2,
        y: game.viewPos.y - game.viewHeight / 2,
      },
    };
    // HACK: only pxWidth/pxHeight can really actually be set in main view
    renderView(canvas, ctx, game, bigDims);
    ctx.save();
    ctx.translate(
      globalConfig.config.canvasWidth - pxWidth - 8,
      8,
    );
    renderMinimap(ctx, game, miniDims);
    ctx.restore();
  } else {
    // NOTE: changes here must be also added to utils/gridHelpers.canvasToGrid
    const nextViewPos = {
      x: game.viewPos.x - game.viewWidth * 3 / 2,
      y: game.viewPos.y - game.viewHeight * 3 / 2,
    };
    const bigDims = {
      pxWidth: globalConfig.config.canvasWidth,
      pxHeight: globalConfig.config.canvasHeight,
      viewWidth: game.viewWidth * 3,
      viewHeight: game.viewHeight * 3,
      viewPos: {
        x: clamp(nextViewPos.x, 0, game.gridWidth - game.viewWidth * 3),
        y: clamp(nextViewPos.y, 0, game.gridHeight - game.viewHeight * 3),
      },
    };
    if (bigDims.viewWidth > game.gridWidth) {
      bigDims.viewPos.x = game.gridWidth/2 - bigDims.viewWidth / 2;
    }
    if (bigDims.viewHeight > game.gridHeight) {
      bigDims.viewPos.y = game.gridHeight/2 -  bigDims.viewHeight / 2;
    }
    const miniDims = {
      pxWidth,
      pxHeight,
      viewWidth: game.viewWidth,
      viewHeight: game.viewHeight,
      viewPos: {...game.viewPos},
    };
    renderMinimap(ctx, game, bigDims);
    ctx.save();
    ctx.translate(
      globalConfig.config.canvasWidth - pxWidth - 8,
      8,
    );
    ctx.globalAlpha = 0.8;
    // HACK: only pxWidth/pxHeight can really actually be set in main view
    renderView(canvas, ctx, game, miniDims, true /*isMini*/);
    ctx.restore();
  }
};

const renderView = (canvas, ctx2d, game, dims, isMini): void => {
  const config = game.config;
  const {pxWidth, pxHeight, viewWidth, viewHeight, viewPos} = dims;

	const px = viewWidth / pxWidth;
  const pxy = viewHeight / pxHeight;

  ////////////////////////////////////////////
  // canvas scaling
  ////////////////////////////////////////////
  // scale world to the canvas
  ctx.save();
  ctx.scale(
    pxWidth / viewWidth,
    pxHeight / viewHeight,
  );
  ctx.lineWidth = px;
  // translate to viewPos
  ctx.translate(-1 * viewPos.x, -1 * viewPos.y);
  ////////////////////////////////////////////

  // Image-based rendering
  refreshStaleImage(game, dims);

  if (game.viewImage.canvas != null) {
    if (isMini) {
      ctx.drawImage(
        game.viewImage.canvas,
        // canvas true dimensions:
        dims.viewPos.x / px, dims.viewPos.y / pxy,
        dims.viewWidth / px, dims.viewHeight / pxy,
        // minimap dimensions:
        dims.viewPos.x, dims.viewPos.y,
        dims.viewWidth, dims.viewHeight,
      );
    } else {
      ctx.drawImage(
        game.viewImage.canvas,
        0, 0, game.gridWidth, game.gridHeight,
      );
    }
  } else {
    // background
    ctx.fillStyle = 'rgba(186, 175, 137, 1)';
    if (isMini) {
      ctx.fillRect(
        dims.viewPos.x, dims.viewPos.y, dims.viewWidth, dims.viewHeight,
      );
    } else {
      ctx.fillRect(
        0, 0, game.gridWidth, game.gridHeight,
      );
    }

    for (const id of game.BACKGROUND) renderEntity(ctx, game, id, renderBackground, true);
    for (const id of game.DEAD_ANT) renderEntity(ctx, game, id, renderDeadAnt, true);
    for (const id of game.DEAD_SPIDER) renderEntity(ctx, game, id,  renderCritter, true);
    for (const id of game.DEAD_BEETLE) renderEntity(ctx, game, id, renderCritter, true);
    for (const id of game.DEAD_TERMITE) renderEntity(ctx, game, id, renderDeadTermite, true);
    for (const id of game.DEAD_WORM) renderEntity(ctx, game, id, renderDeadWorm, true);
    for (const id of game.DEAD_CENTIPEDE) renderEntity(ctx, game, id, renderDeadCentipede, true);
    for (const id of game.DIRT) renderEntity(ctx, game, id, renderDirt, true);
    for (const id of game.STONE) renderEntity(ctx, game, id, renderStone, true);
  }

  // animated things go on top of image:
  renderPheromones(ctx, game);
  for (const id of game.SPIDER_WEB) renderEntity(ctx, game, id, renderSpiderWeb);
  for (const id of game.DOODAD) renderEntity(ctx, game, id, renderDoodad);
  for (const id of game.VINE) renderEntity(ctx, game, id, renderVine);
  for (const id of game.SEED) renderEntity(ctx, game, id, renderSeed);
  for (const id of game.TOKEN) renderEntity(ctx, game, id, renderToken);
  for (const id of game.CRITTER_EGG) renderEntity(ctx, game, id, renderCritterEgg);
  for (const id of game.EGG) renderEntity(ctx, game, id, renderEgg);
  for (const id of game.TERMITE_EGG) renderEntity(ctx, game, id, renderEgg);
  for (const id of game.PUPA) renderEntity(ctx, game, id, renderPupa);
  for (const id of game.FOOD) renderEntity(ctx, game, id, renderFood);
  for (const id of game.LARVA) renderEntity(ctx, game, id, renderLarva);
  for (const critterType of game.config.critterTypes) {
    for (const id of game[critterType]) renderEntity(ctx, game, id, renderCritter);
  }
  for (const id of game.TERMITE) renderEntity(ctx, game, id, renderTermite);
  for (const id of game.ANT) {
    // render queens on top
    if (
      game.entities[id] != null &&
      game.entities[id].caste == 'QUEEN' &&
      game.queens[game.entities[id].playerID] == id
    ) {
      continue;
    }
    renderEntity(ctx, game, id, renderAntSprite);
  }
  for (const id of game.FOREGROUND) renderEntity(ctx, game, id, renderForeground);
  for (const id of game.FOOT) renderEntity(ctx, game, id, renderFoot);
  for (const playerID in game.queens) {
    if (game.entities[game.queens[playerID]].type == 'TERMITE') {
      renderEntity(ctx, game, game.queens[playerID], renderTermite);
    } else if (game.entities[game.queens[playerID]].type == 'DEAD_TERMITE') {
      renderEntity(ctx, game, game.queens[playerID], renderDeadTermite);
    } else {
      renderEntity(ctx, game, game.queens[playerID], renderAntSprite);
    }
  }

  // render relevant square in front of queen
  const queen = getQueen(game, game.playerID);
  if (queen != null && game.tickInterval != null) {
    ctx.save();
    const queenAction = getQueenBiteAction(game, queen);
    ctx.fillStyle = 'rgba(70,130,180, 0.1)';
    ctx.strokeStyle = 'steelblue';
    ctx.lineWidth = ctx.lineWidth * 2;
    if (queenAction.type == 'PICKUP') {
      ctx.fillRect(queenAction.payload.position.x, queenAction.payload.position.y, 1, 1);
      ctx.strokeRect(queenAction.payload.position.x, queenAction.payload.position.y, 1, 1);
    }
    if (queenAction.type == 'PUTDOWN') {
      const putdownPos = getPositionsInFront(game, queen)
        .find(pos => {
          return lookupInGrid(game.grid, pos)
            .map(id => game.entities[id])
            .filter(e => e.type.slice(0, 4) != 'DEAD' && e.type != 'BACKGROUND')
            .length == 0;
        });
      if (putdownPos != null) {
        ctx.fillRect(putdownPos.x, putdownPos.y, 1, 1);
        ctx.strokeRect(putdownPos.x, putdownPos.y, 1, 1);
      }
    }
    ctx.restore();
  }

  // render dirt putdown positions
  ctx.lineWidth = ctx.lineWidth * 2;
  for (const pos of game.dirtPutdownPositions) {
    if (!onScreen(game, {position: pos, width: 1, height: 1})) continue;
    ctx.fillStyle = 'rgba(139,0,0, 0.1)';
    ctx.strokeStyle = 'red';
    ctx.fillRect(pos.x, pos.y, 1, 1);
    ctx.strokeRect(pos.x, pos.y, 1, 1);
  }

  // marquee
  if (
    game.isExperimental && document.onmousemove != null &&
    (game.mouse.isLeftDown || game.keepMarquee)
  ) {
    ctx.strokeStyle = 'black';
    const {curPos, downPos} = game.mouse;
    let rect = toRect(curPos, downPos);
    if (game.keepMarquee && !game.mouse.isLeftDown) {
      rect = game.clipboard;
    }
    ctx.strokeRect(rect.position.x, rect.position.y, rect.width, rect.height);
  }

  ctx.restore();
}

const refreshStaleImage = (game, dims): void => {
  if (!game.viewImage.isStale && !game.viewImage.allStale) return;
  const {pxWidth, pxHeight, viewWidth, viewHeight, viewPos} = dims;
	const px = viewWidth / pxWidth;
  if (game.viewImage.canvas == null) {
    game.viewImage.canvas = document.createElement('canvas');
  }
  // changing these clears the canvas, which we don't want to do unless we need to
  if (game.viewImage.canvas.width != Math.round(game.gridWidth / px)) {
    game.viewImage.canvas.width = Math.round(game.gridWidth / px);
    game.viewImage.allStale = true;
  }
  if (game.viewImage.canvas.height != Math.round(game.gridHeight / (viewHeight / pxHeight))) {
    game.viewImage.canvas.height = Math.round(game.gridHeight / (viewHeight / pxHeight));
    game.viewImage.allStale = true;
  }
  const ctx = game.viewImage.canvas.getContext('2d');

  // scale world to the canvas
  ctx.save();
  ctx.scale(
    pxWidth / viewWidth,
    pxHeight / viewHeight,
  );
  ctx.lineWidth = px;

  if (game.viewImage.allStale) {
    // background
    ctx.fillStyle = 'rgba(186, 175, 137, 1)';
    ctx.fillRect(
      0, 0, game.gridWidth, game.gridHeight,
    );
    ctx.globalAlpha = 0.2;
    for (let y = 0; y < game.gridHeight; y++) {
      // ctx.globalAlpha += y / game.gridHeight / 100;
      for (let x = 0; x < game.gridWidth; x++) {
        const obj = getTileSprite(game, {type: 'DIRT', dictIndexStr: 'lrtb'});
        if (obj != null && obj.img != null) {
          ctx.drawImage(
            obj.img,
            obj.x, obj.y, obj.width, obj.height,
            x, y, 1, 1,
          );
        }
      }
    }
    ctx.globalAlpha = 1;

    for (const id of game.BACKGROUND) renderEntity(ctx, game, id, renderBackground);
    for (const id of game.DEAD_ANT) renderEntity(ctx, game, id, renderDeadAnt);
    for (const id of game.DEAD_SPIDER) renderEntity(ctx, game, id,  renderCritter);
    for (const id of game.DEAD_BEETLE) renderEntity(ctx, game, id, renderCritter);
    for (const id of game.DEAD_TERMITE) renderEntity(ctx, game, id, renderDeadTermite);
    for (const id of game.DEAD_WORM) renderEntity(ctx, game, id, renderDeadWorm);
    for (const id of game.DEAD_CENTIPEDE) renderEntity(ctx, game, id, renderDeadCentipede);
    for (const id of game.DIRT) renderEntity(ctx, game, id, renderDirt);
    for (const id of game.STONE) renderEntity(ctx, game, id, renderStone);
  } else {
    const staleEntities = {};
    for (const posKey in game.viewImage.stalePositions) {
      const pos = game.viewImage.stalePositions[posKey];
      // background
      ctx.fillStyle = 'rgba(186, 175, 137, 1)';
      ctx.fillRect(pos.x, pos.y, 1, 1);
      const obj = getTileSprite(game, {type: 'DIRT', dictIndexStr: 'lrtb'});
      if (obj != null && obj.img != null) {
        ctx.globalAlpha = 0.2;
        ctx.drawImage(
          obj.img,
          obj.x, obj.y, obj.width, obj.height,
          pos.x, pos.y, 1, 1,
        );
        ctx.globalAlpha = 1;
      }
      for (const entityID of lookupInGrid(game.grid, pos)) {
        const entity = game.entities[entityID];
        if (!game.config.unanimatedTypes.includes(entity.type)) continue;
        if (staleEntities[entity.type] == null) {
          staleEntities[entity.type] = {};
        }
        staleEntities[entity.type][entityID] = entity;
      }
    }
    for (const entityType in renderFns) {
      for (const entityID in staleEntities[entityType]) {
        renderEntity(ctx, game, entityID, renderFns[entityType]);
      }
    }
    game.viewImage.stalePositions = {};
  }

  ctx.restore();
  game.viewImage.isStale = false;
  game.viewImage.allStale = false;
};

const renderEntity = (ctx, game, id, renderFn, alwaysOnScreen): void => {
  let entity = game.entities[id];
  if (entity == null || entity.position == null) return;
  if (
    !onScreen(game, entity)
    && !game.config.unanimatedTypes.includes(entity.type) && !alwaysOnScreen
    && entity.type != 'FOREGROUND' &&
    ((entity.type != 'FOOT' && !entity.segmented) || game.maxMinimap)
  ) {
    return;
  }
  if (
    entity.type == 'ANT' || entity.type == 'TERMITE'
    || game.config.critterTypes.includes(entity.type)
  ) {
    // interpolate position between previous position and current position
    entity = {
      ...entity,
      position: getInterpolatedPos(game, entity),
      theta: getInterpolatedTheta(game, entity),
    };
  }

  renderFn(ctx, game, entity);

  if (game.showEntityIDs) {
    // ctx.translate(game.viewPos.x, game.viewPos.y);
    ctx.fillStyle = 'red';
    ctx.font = '1px sans serif';
    ctx.fillText(
      parseInt(entity.id), entity.position.x, entity.position.y + 1, 1,
    );
  }

  // render positions in front
  if (game.showPositionsInFront) {
    const positionsInFront = getPositionsInFront(game, entity);
    for (const pos of positionsInFront) {
      const {x, y} = pos;
      ctx.strokeStyle = 'red';
      ctx.strokeRect(x, y, 1, 1);
    }
  }

  // render true position
  if (game.showTruePositions) {
    ctx.fillStyle = 'rgba(200, 0, 0, 0.4)';
    ctx.fillRect(entity.position.x, entity.position.y, 1, 1);
  }

  // render hitbox
  if (game.showHitboxes) {
    const positionsInFront = getEntityPositions(game, entity);
    for (const pos of positionsInFront) {
      const {x, y} = pos;
      ctx.strokeStyle = 'red';
      ctx.strokeRect(x, y, 1, 1);
    }
  }

  // render true hitbox
  if (game.showTrueHitboxes) {
    const entityPositions = [];
    for (let x = 0; x < game.gridWidth; x++) {
      for (let y = 0; y < game.gridHeight; y++) {
        const entitiesAtPos = lookupInGrid(game.grid, {x, y});
        for (const id of entitiesAtPos) {
          if (id == entity.id) {
            entityPositions.push({x, y});
          }
        }
      }
    }
    for (const pos of entityPositions) {
      const {x, y} = pos;
      ctx.strokeStyle = 'red';
      ctx.strokeRect(x, y, 1, 1);
    }
  }
};


const renderPheromones = (ctx, game): void => {
  const config = game.config;
  const {grid} = game;
  for (
    let x = Math.max(0, Math.floor(game.viewPos.x));
    x < Math.min(game.viewPos.x + game.viewWidth, game.gridWidth);
    x++
  ) {
    for (
      let y = Math.max(0, Math.floor(game.viewPos.y));
      y < Math.min(game.viewPos.y + game.viewHeight, game.gridHeight);
      y++
    ) {
      if (!onScreen(game, {position: {x, y}, width: 1, height: 1})) continue;
      for (const playerID in game.players) {
        if (playerID != game.playerID) continue;
        const player = game.players[playerID];
        const queen = getQueen(game, playerID)
        if (queen != null && queen.type == 'TERMITE' && !game.isExperimental) continue;
        const pheromonesAtCell = grid[x][y][player.id];
        for (const pheromoneType in pheromonesAtCell) {
          if (!game.pheromoneDisplay[pheromoneType]) continue;
          const quantity = pheromonesAtCell[pheromoneType];
          let alpha = Math.min(quantity / config[player.id][pheromoneType].quantity / 2, 0.5);
          if (alpha < 0.1) {
            // continue; // don't bother rendering
          }
          alpha += 0.15;
          if (quantity <= 0) {
            continue;
          }
          if (pheromoneType == 'DOMESTICATE') {
            alpha /= 3;
          }
          ctx.globalAlpha = alpha;
          ctx.fillStyle = config[player.id][pheromoneType].color;
          if (game.showPheromoneValues) {
            ctx.strokeRect(x, y, 1, 1);
            ctx.font = '1px sans serif';
            ctx.fillText(parseInt(Math.ceil(quantity)), x, y + 1, 1);
          } else {
            const obj = getPheromoneSprite(game, {x, y}, player.id, pheromoneType);
            if (obj.img != null) {
              ctx.save();
              ctx.translate(x + 0.5, y + 0.5);
              ctx.rotate(obj.theta);
              ctx.drawImage(
                obj.img,
                obj.x, obj.y, obj.width, obj.height,
                -0.5, -0.5, 1, 1,
              );
              ctx.restore();
            } else {
              ctx.fillRect(x, y, 1, 1);
            }
          }
        }
      }
    }
  }
  ctx.globalAlpha = 1;
};

module.exports = {render};

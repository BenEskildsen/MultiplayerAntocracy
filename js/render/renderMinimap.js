// @flow

const {
  subtract, add, makeVector, vectorTheta, dist,
  magnitude, scale, toRect,
} = require('../utils/vectors');
const {lookupInGrid, getEntityPositions} = require('../utils/gridHelpers');
const {onScreen, getPositionsInFront, getQueen} = require('../selectors/misc');
const {renderWormCanvas} = require('./renderSegmented');
const {
  getInterpolatedPos, getSpriteAndOffset, getInterpolatedTheta,
} = require('../selectors/sprites');

import type {Game, Vector, Entity} from '../types';

export type Dimensions = {
  pxWidth: number,
  pxHeight: number,
  viewWidth: number,
  viewHeight: number,
  viewPos: Vector,
};

const renderMinimap = (ctx, game: Game, dims: Dimensions): void => {
  const config = game.config;
  const {pxWidth, pxHeight, viewWidth, viewHeight, viewPos} = dims;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = viewWidth / pxWidth * 5;
  ctx.strokeStyle = 'lightgray';
  ctx.strokeRect(0, 0, pxWidth, pxHeight);
  ctx.fillRect(0, 0, pxWidth, pxHeight);

  ////////////////////////////////////////////
  // canvas scaling
  ////////////////////////////////////////////
  // scale world to the canvas
  ctx.save();
  ctx.scale(
    pxWidth / viewWidth,
    pxHeight / viewHeight,
  );
  // translate to viewPos
  ctx.translate(-1 * viewPos.x, -1 * viewPos.y);
  ////////////////////////////////////////////

  // background
  const alpha = game.maxMinimap ? 0.9 : 0.5;
  ctx.fillStyle = 'rgba(186, 175, 137,' + alpha + ')';
  const x = Math.floor(Math.max(viewPos.x, 0));
  const y = Math.floor(Math.max(viewPos.y, 0));
  ctx.fillRect(
    x, y,
    Math.min(game.gridWidth - x, viewWidth + 1),
    Math.min(game.gridHeight - y, viewHeight + viewPos.y, viewHeight + 1),
  );

	const px = viewWidth / pxWidth;
  ctx.lineWidth = px;

  for (const id of game.DOODAD) renderEntity(ctx, game, dims, id, renderTile);
  for (const id of game.DIRT) renderEntity(ctx, game, dims, id, renderTile);
  for (const id of game.STONE) renderEntity(ctx, game, dims, id, renderTile);
  for (const id of game.FOOD) renderEntity(ctx, game, dims, id, renderTile);
  for (const id of game.VINE) renderEntity(ctx, game, dims, id, renderTile);
  for (const id of game.PUPA) renderEntity(ctx, game, dims, id, renderTile);

  for (const critterType of game.config.critterTypes) {
    if (critterType == 'WORM' || critterType == 'CENTIPEDE' || critterType == 'CATERPILLAR') continue;
    for (const id of game[critterType]) renderEntity(ctx, game, dims, id, renderPill);
  }
  for (const id of game.WORM) renderEntity(ctx, game, dims, id, renderWormCanvas);
  for (const id of game.CENTIPEDE) renderEntity(ctx, game, dims, id, renderWormCanvas);
  for (const id of game.CATERPILLAR) renderEntity(ctx, game, dims, id, renderWormCanvas);
  for (const id of game.TERMITE) renderEntity(ctx, game, dims, id, renderPill);
  for (const id of game.ANT) renderEntity(ctx, game, dims, id, renderPill);
  for (const id of game.TOKEN) renderEntity(ctx, game, dims, id, renderPill);

  ctx.restore();
};

const renderEntity = (ctx, game, dims, id, renderFn): void => {
  let entity = game.entities[id];
  if (entity == null || entity.position == null) return;
  if (!onMinimap(dims, entity) && entity.type != 'DOODAD') {
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
  renderFn(ctx, game, dims, entity);
};

const renderTile = (ctx, game, dims, entity): void => {
  if (entity == null) return;
  switch (entity.type) {
    case 'FOOD':
      ctx.fillStyle = '#008000';
      break;
    case 'DIRT':
      ctx.fillStyle = '#8B4513';
      break;
    case 'STONE':
      if (entity.subType == 'STONE') {
        ctx.fillStyle = 'darkgray';
      } else if (entity.subType == 'BRICK') {
        ctx.fillStyle = '#8B0000';
      } else {
        ctx.fillStyle = 'lightgray';
      }
      break;
    case 'PUPA':
      ctx.fillStyle = 'white';
      break;
    case 'VINE':
      ctx.fillStyle = '#556B2F';
      break;
    case 'DOODAD':
      if (entity.sprite == 'HOSE') {
        ctx.fillStyle = 'rgb(65, 136, 74)';
      } else if (entity.sprite == 'PENCIL') {
        ctx.fillStyle = 'rgb(253, 230,  107)';
      } else {
        ctx.fillStyle = 'darkgray';
      }
      break;
  }
  let width = entity.width;
  if (entity.position.x + entity.width > dims.viewWidth + dims.viewPos.x) {
    width = entity.width -
      Math.abs(entity.position.x + entity.width - (dims.viewWidth + dims.viewPos.x));
  }
  let height = entity.height;
  if (entity.position.y + entity.height > dims.viewHeight + dims.viewPos.y) {
    height = entity.height -
      Math.abs(entity.position.y + entity.height - (dims.viewHeight + dims.viewPos.y));
  }

  let x = entity.position.x;
  let y = entity.position.y;
  if (x < dims.viewPos.x) {
    x = dims.viewPos.x;
    width = entity.width - Math.abs(entity.position.x - dims.viewPos.x);
  }
  if (y < dims.viewPos.y) {
    y = dims.viewPos.y;
    height = entity.height - Math.abs(entity.position.y - dims.viewPos.y);
  }
  if (width > 0 && height > 0) {
    ctx.fillRect(x, y, width, height);
  }
};

const renderPill = (ctx, game, dims, entity): void => {
  if (!onMinimapSmall(dims, entity)) return;
  if (entity.type == 'TOKEN' && entity.pheromoneType != 'RAID_PHER') return;
  ctx.save();
  let shouldRenderCrown = false;
  // HACK for queen termite:
  let xTranslation = 0;
  let yTranslation = 0;

  switch (entity.type) {
    case 'TERMITE':
      ctx.fillStyle = 'white';
      if (entity.caste == 'TERMITE_QUEEN') {
        yTranslation = -1 * entity.width / 2;
        xTranslation = -1 * entity.width/ 2;
      }
      break;
    case 'ANT':
      ctx.fillStyle = 'blue';
      if (game.colonies[entity.playerID].species == 'Leaf Cutter Ants') {
        ctx.fillStyle = 'red';
      }
      if (game.colonies[entity.playerID].species == 'Desert Ants') {
        ctx.fillStyle = 'yellow';
      }
      if (entity.caste == 'QUEEN') shouldRenderCrown = true;
      break;
    case 'BEETLE':
      ctx.fillStyle = 'purple';
      break;
    case 'SPIDER':
      ctx.fillStyle = 'black';
      break;
    case 'TOKEN':
      ctx.fillStyle = 'red';
      break;
    case 'SCORPION':
      ctx.fillStyle = '#556B2F';
      break;
    case 'ROLY_POLY':
      ctx.fillStyle = '#556B2F';
      break;
    case 'APHID':
      ctx.fillStyle = '#556B2F';
      break;
  }
  const height = entity.height;
  const width = entity.width / 2;
  let x = entity.position.x + width / 2;
  let y = entity.position.y;
  ctx.translate(x + width/2, y + height / 2);
  ctx.rotate(entity.theta + Math.PI / 2);
  ctx.translate(-1 * (x + width/2), -1 * (y + height / 2));
  ctx.translate(xTranslation, yTranslation);

  let radius = width / 2;
  radius = {tl: radius, tr: radius, br: radius, bl: radius};
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  ctx.fill();
  if (entity.isGoalCritter) {
    ctx.strokeStyle = "gold";
    ctx.lineWidth *= 3;
    ctx.stroke();
  }
  ctx.restore();

  if (shouldRenderCrown) {
    ctx.save();
    ctx.fillStyle = 'gold';
    ctx.beginPath();
    radius = radius.tr * 1.5;
    y = y + radius * 2 - Math.sin(game.time / 60 * Math.PI)/3 - 1;
    x = x - radius / 4;
    ctx.moveTo(x, y);
    ctx.lineTo(x + radius * 2, y);
    ctx.lineTo(x + radius * 2, y - radius * 2);

    // 3-point crown
    ctx.lineTo(x + radius * 1.5, y - radius);
    ctx.lineTo(x + radius, y - radius * 2);
    ctx.lineTo(x + radius * 0.5, y - radius);

    ctx.lineTo(x, y - radius * 2);

    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
};

const onMinimapSmall = (dims: Dimensions, entity: Entity): boolean => {
  let {viewPos, viewWidth, viewHeight} = dims;
  const {position, width, height} = entity;
  const {x, y} = position;

  return x >= viewPos.x &&
    y >= viewPos.y &&
    (x + width) <= viewWidth + viewPos.x &&
    (y + height) <= viewHeight + viewPos.y;
};

const onMinimap = (dims: Dimensions, entity: Entity): boolean => {
  let {viewPos, viewWidth, viewHeight} = dims;
  const {position, width, height} = entity;
  const {x, y} = position;

  return x >= viewPos.x - 1 &&
    y >= viewPos.y - 1 &&
    (x + width) <= viewWidth + viewPos.x + 1 &&
    (y + height) <= viewHeight + viewPos.y + 1;
};

module.exports = {
  renderMinimap,
};

// @flow

const {renderHealthBar} = require('./renderHealthBar');
const {
  renderFood, renderDirt, renderHill,
  renderEgg, renderLarva, renderPupa,
  renderToken,
} = require('./renderOthers');
const {
  getTermiteSprite,
} = require('../selectors/sprites');
const {getPositionsInFront} = require('../selectors/misc');
const {lookupInGrid, getEntityPositions} = require('../utils/gridHelpers');

import type {Game, Entity, Hill, Ant, Food} from '../types';

const renderTermiteEgg = (ctx, game, entity): void => {
  const egg = entity;
  const sprite = game.sprites.EGG;
  if (sprite != null) {
    ctx.drawImage(
      sprite,
      egg.position.x, egg.position.y, egg.width, egg.height,
    );
  }
};

const renderDeadTermite = (ctx, game, entity): void => {
  const termite = entity;
  ctx.save();
	// render relative to top left of grid square,
  // but first translate for rotation around the center
	ctx.translate(
    termite.position.x + termite.width / 2,
    termite.position.y + termite.height / 2,
  );
  ctx.rotate(termite.theta - Math.PI / 2);
  ctx.translate(-termite.width / 2, -termite.height / 2);
  ctx.globalAlpha = 0.6;

  const sprite = getTermiteSprite(game, termite);
  if (sprite.img != null) {
    ctx.drawImage(
      sprite.img, sprite.x, sprite.y, sprite.width, sprite.height,
      0, 0, termite.width, termite.height,
    );
  }
  ctx.restore();
};

const renderTermite = (ctx, game, entity): void => {
  const termite = entity;
  ctx.save();
	// render relative to top left of grid square,
  // but first translate for rotation around the center
  let offset = {x: 0, y: 0};
  let spriteOffset = 0;
  if (termite.caste == 'TERMITE_QUEEN') {
    offset.x = -termite.width/2;
    // offset.y = -termite.height/2;
    spriteOffset = +termite.height/2;
  }
	ctx.translate(
    termite.position.x + termite.width / 2 + offset.x,
    termite.position.y + termite.height / 2 + offset.y,
  );
  ctx.rotate(termite.theta - Math.PI / 2);
  ctx.translate(
    -(termite.width / 2 + offset.x),
    -(termite.height / 2 + offset.y),
  );

  const sprite = getTermiteSprite(game, termite);
  if (sprite.img != null) {
    ctx.drawImage(
      sprite.img, sprite.x, sprite.y, sprite.width, sprite.height,
      0, spriteOffset, termite.width, termite.height,
    );
  }
  const curAction = termite.actions[0];
  const isPickingUp = curAction != null && curAction.type == "PICKUP";
  if (termite.holding != null && !isPickingUp) {
    const heldEntity = termite.holding;
    ctx.save();
    ctx.translate(termite.width / 2 - 0.45/2, -0.1);
    ctx.scale(0.45, 0.45);
    if (heldEntity.type == 'FOOD') {
			renderFood(ctx, game, {...heldEntity, position: {x: 0, y: 0}});
    } else if (heldEntity.type == 'DIRT') {
    	renderDirt(ctx, game, {...heldEntity, position: {x: 0, y: 0}});
    } else if (heldEntity.type == 'EGG' || heldEntity.type == 'TERMITE_EGG') {
    	renderEgg(ctx, game, {...heldEntity, position: {x: 0, y: 0}});
    } else if (heldEntity.type == 'LARVA') {
    	renderLarva(ctx, game, {...heldEntity, position: {x: 0, y: 0}});
    } else if (heldEntity.type == 'PUPA') {
    	renderPupa(ctx, game, {...heldEntity, position: {x: 0, y: 0}});
    } else if (heldEntity.type == 'TOKEN') {
    	renderToken(ctx, game, {...heldEntity, position: {x: 0, y: 0}}, true /* isHeld */);
    }

    ctx.restore();
  }
  // render hp bar
	ctx.translate(
    termite.width / 2 + offset.x,
    termite.height / 2 + offset.y,
  );
  ctx.rotate(Math.PI / 2);
  ctx.translate(
    -(termite.width / 2 + offset.x),
    -(termite.height / 2 + offset.y),
  );
  if (Math.ceil(termite.hp) < game.config[termite.playerID][termite.caste].hp) {
    renderHealthBar(ctx, {...termite}, game.config[termite.playerID][termite.caste].hp);
  }
  ctx.restore();

  // render positions in front
  if (game.showPositionsInFront) {
    const positionsInFront = getPositionsInFront(game, entity);
    for (const pos of positionsInFront) {
      const {x, y} = pos;
      ctx.strokeStyle = 'red';
      ctx.strokeRect(x, y, 1, 1);
    }
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
};


module.exports = {
  renderTermite, renderDeadTermite, renderTermiteEgg,
};

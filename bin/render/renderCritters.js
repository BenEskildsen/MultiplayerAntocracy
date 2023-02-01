const {
  subtract,
  add,
  makeVector,
  vectorTheta,
  rotate,
  multiply,
  scale
} = require('../utils/vectors');
const {
  lookupInGrid,
  getEntityPositions
} = require('../utils/gridHelpers');
const {
  renderHealthBar
} = require('./renderHealthBar');
const {
  getPositionsInFront
} = require('../selectors/misc');
const globalConfig = require('../config');
const {
  renderAntSprite
} = require('./renderAnt');
const {
  renderWorm,
  renderCentipede,
  renderCaterpillar,
  renderDeadCaterpillar,
  renderDeadCentipede,
  renderDeadWorm
} = require('./renderSegmented');
const {
  getSpiderSprite,
  getScorpionSprite,
  getBeetleSprite,
  getTileSprite,
  getBackgroundSprite,
  getForegroundSprite,
  getAphidSprite,
  getRolyPolySprite
} = require('../selectors/sprites');
const renderCritter = (ctx, game, critter) => {
  let sprite = null;
  let isDead = false;
  let thetaCorrection = 0;
  switch (critter.type) {
    case 'DEAD_SPIDER':
      isDead = true;
    // fall-through
    case 'SPIDER':
      sprite = getSpiderSprite(game, critter);
      thetaCorrection = Math.PI;
      break;
    case 'DEAD_SCORPION':
      isDead = true;
    // fall-through
    case 'SCORPION':
      sprite = getScorpionSprite(game, critter);
      thetaCorrection = Math.PI;
      break;
    case 'DEAD_BEETLE':
      isDead = true;
    // fall-through
    case 'BEETLE':
      sprite = getBeetleSprite(game, critter);
      thetaCorrection = Math.PI;
      break;
    case 'DEAD_APHID':
      isDead = true;
    // fall-through
    case 'APHID':
      sprite = getAphidSprite(game, critter);
      thetaCorrection = Math.PI;
      break;
    case 'DEAD_ROLY_POLY':
      isDead = true;
    // fall-through
    case 'ROLY_POLY':
      sprite = getRolyPolySprite(game, critter);
      thetaCorrection = Math.PI;
      break;
    case 'WORM':
      renderWorm(ctx, game, critter);
      return;
    case 'CENTIPEDE':
      renderCentipede(ctx, game, critter);
      return;
    case 'CATERPILLAR':
      renderCaterpillar(ctx, game, critter);
      return;
    case 'DEAD_CATERPILLAR':
      renderDeadCaterpillar(ctx, game, critter);
      return;
    case 'DEAD_WORM':
      renderDeadWorm(ctx, game, critter);
      return;
    case 'DEAD_CENTIPEDE':
      renderDeadCentipede(ctx, game, critter);
      return;
  }
  if (sprite == null || sprite.img == null) return;
  ctx.save();
  ctx.translate(critter.position.x + critter.width / 2, critter.position.y + critter.height / 2);
  ctx.rotate(critter.theta + Math.PI / 2 + thetaCorrection);
  ctx.translate(-critter.width / 2, -critter.height / 2);
  if (isDead) {
    ctx.globalAlpha = 0.6;
  }
  ctx.drawImage(sprite.img, sprite.x, sprite.y, sprite.width, sprite.height, 0, 0, critter.width, critter.height);
  ctx.translate(critter.width / 2, critter.height / 2);
  ctx.rotate(Math.PI / 2);
  ctx.translate(-critter.width / 2, -critter.height / 2);
  if (!isDead && critter.hp < game.config[critter.type].hp) {
    renderHealthBar(ctx, {
      ...critter
    }, game.config[critter.type].hp);
  }

  // render trapjaw ants
  if (!isDead && critter.trapjaws != null) {
    for (const trapjaw of critter.trapjaws) {
      renderAntSprite(ctx, game, {
        ...game.entities[trapjaw.id],
        position: trapjaw.position
      });
    }
  }
  ctx.restore();

  // render positions in front
  if (game.showPositionsInFront) {
    const positionsInFront = getPositionsInFront(game, critter);
    for (const pos of positionsInFront) {
      const {
        x,
        y
      } = pos;
      ctx.strokeStyle = 'red';
      ctx.strokeRect(x, y, 1, 1);
    }
  }
  // render hitbox
  if (game.showHitboxes) {
    const positionsInFront = getEntityPositions(game, critter);
    for (const pos of positionsInFront) {
      const {
        x,
        y
      } = pos;
      ctx.strokeStyle = 'red';
      ctx.strokeRect(x, y, 1, 1);
    }
  }
};
module.exports = {
  renderCritter
};
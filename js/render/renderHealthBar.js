// @flow

const {
  subtract, add, makeVector, vectorTheta,
} = require('../utils/vectors');
const {lookupInGrid} = require('../utils/gridHelpers');

const renderHealthBar = (ctx, entity, maxHealth) => {
  const renderHP = Math.ceil(entity.hp);
  if (renderHP == maxHealth) return;

  ctx.save();
  // always render healthbar above entity no matter its theta
  ctx.translate(entity.width / 2, entity.height / 2);
  ctx.rotate(-entity.theta);
  ctx.translate(-entity.width / 2, -entity.height / 2);

  const barWidth = 1.5;
  const barHeight = 0.20;
  let xPos = -0.25;
  let yPos = -0.2;
  if (entity.type == 'SPIDER') {
    xPos = 1.5;
    yPos = 1.8;
  }
  if (entity.type == 'SCORPION') {
    xPos = 2.25;
    yPos = 2.8;
  }
  if (entity.prevHP >= renderHP + 1 && entity.prevHPAge < 6) {
    const redWidth = entity.prevHP / maxHealth * barWidth;
    ctx.fillStyle = 'red';
    ctx.fillRect(
      xPos, yPos,
      redWidth, barHeight,
    );
  }

  ctx.fillStyle = 'green';
  const healthWidth = Math.max(renderHP / maxHealth * barWidth, 0);
  ctx.fillRect(
    xPos, yPos,
    healthWidth, barHeight,
  );

  ctx.strokeStyle = 'black';
  ctx.strokeRect(
    xPos, yPos,
    barWidth, barHeight,
  );

  ctx.restore();
}

module.exports = {renderHealthBar};

const {
  getFootSprite,
  getInterpolatedSize
} = require('../selectors/sprites');
const renderFoot = (ctx, game, foot) => {
  switch (foot.state) {
    case 'lifted':
      if (foot.actions.length > 0 && foot.actions[0].type == 'LIFT') {
        renderFallingFoot(ctx, game, foot);
      }
      break;
    case 'falling':
      renderFallingFoot(ctx, game, foot);
      break;
    case 'stomping':
      renderStompingFoot(ctx, game, foot);
      break;
  }
  if (foot.numStomps > 0) {
    // renderFootHealthBar(ctx, game, foot);
  }
};
const renderFallingFoot = (ctx, game, foot) => {
  ctx.save();
  ctx.fillStyle = 'black';
  const size = getInterpolatedSize(game, foot);
  const width = game.config.FOOT.width;
  const height = game.config.FOOT.height;
  ctx.globalAlpha = 0.6;
  if (size.x > width * 0.6) {
    ctx.globalAlpha = size.x / width;
  }
  // render from center of foot, not bottom left
  ctx.fillRect(foot.position.x + (width - size.x) / 2, foot.position.y + (height - size.y) / 2, size.x, size.y);
  ctx.restore();
};
const renderStompingFoot = (ctx, game, foot) => {
  // ctx.save();
  // ctx.globalAlpha = 0.1;
  // ctx.fillStyle = 'black';
  // ctx.fillRect(foot.position.x, foot.position.y, foot.width, foot.height);
  // ctx.globalAlpha = 1;
  const obj = getFootSprite(game, foot);
  if (obj != null && obj.img != null) {
    ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height, foot.position.x, foot.position.y, foot.width, foot.height);
  }
  // ctx.restore();
};

const renderFootHealthBar = (ctx, game, foot) => {
  ctx.save();
  ctx.translate(game.viewPos.x, game.viewPos.y);
  const barXMargin = 0.5;
  const barYMargin = 4;
  const barHeight = 1.25;
  const barWidth = game.viewWidth - 2 * barXMargin;
  ctx.fillStyle = 'red';
  ctx.fillRect(barXMargin, game.viewHeight - barYMargin, barWidth, barHeight);
  ctx.fillStyle = 'green';
  const healthWidth = Math.max(foot.hp / game.config.FOOT.hp * barWidth, 0);
  ctx.fillRect(barXMargin, game.viewHeight - barYMargin, healthWidth, barHeight);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(barXMargin, game.viewHeight - barYMargin, barWidth, barHeight);
  ctx.restore();
};
module.exports = {
  renderFoot
};
// @flow

const {
  getSegmentSprite, getSegmentHead, getSegmentTail,
  getDeadSegmentSprite, getDeadSegmentHead, getDeadSegmentTail,
} = require('../selectors/sprites');
const {renderHealthBar} = require('./renderHealthBar');
const {
  subtract, add, makeVector, vectorTheta,
} = require('../utils/vectors');
const {onScreen} = require('../selectors/misc');



const renderWorm = (ctx, game, entity): void => {
  renderSegmented(ctx, game, entity);
};
const renderCentipede = (ctx, game, entity): void => {
  renderSegmented(ctx, game, entity);
}
const renderCaterpillar = (ctx, game, entity): void => {
  renderSegmented(ctx, game, entity);
};

const renderDeadWorm = (ctx, game, entity): void => {
  renderDeadSegmented(ctx, game, entity);
};

const renderDeadCentipede = (ctx, game, entity): void => {
  renderDeadSegmented(ctx, game, entity);
};
const renderDeadCaterpillar = (ctx, game, entity): void => {
  renderDeadSegmented(ctx, game, entity);
};


////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////

const renderSegmented = (ctx, game, entity): void => {
  ctx.save();
  // render head:
  const headObj = getSegmentHead(game, entity);
  ctx.translate(
    entity.position.x + 0.5,
    entity.position.y + 0.5,
  );
  ctx.rotate(entity.theta - Math.PI / 2);
  ctx.translate(-0.5, -0.5);
  ctx.drawImage(
    headObj.img,
    headObj.x, headObj.y, headObj.width, headObj.height,
    0, 0, 1, 1,
  );
  ctx.restore();

  // render segments:
  for (let i = 0; i < entity.segments.length - 1; i++) {
    const segment = entity.segments[i];
    if (!onScreen(game, {position: segment.position, width: 1, height: 1})) continue;
    const obj = getSegmentSprite(game, entity, segment);
    ctx.save();
    ctx.translate(
      segment.position.x + 0.5,
      segment.position.y + 0.5,
    );
    ctx.rotate(segment.theta + Math.PI / 2);
    ctx.translate(-0.5, -0.5);
    ctx.drawImage(
      obj.img,
      obj.x, obj.y, obj.width, obj.height,
      0, 0, 1, 1,
    );
    ctx.restore();
  }

  // render tail segment:
  const tail = entity.segments[entity.segments.length - 1];
  const tailObj = getSegmentTail(game, entity, tail);
  ctx.save();
  ctx.translate(
    tail.position.x + 0.5,
    tail.position.y + 0.5,
  );
  ctx.rotate(tail.theta - Math.PI / 2);
  ctx.translate(-0.5, -0.5);
  ctx.drawImage(
    tailObj.img,
    tailObj.x, tailObj.y, tailObj.width, tailObj.height,
    0, 0, 1, 1,
  );
  ctx.restore();

  // health bar
  ctx.save();
  ctx.translate(
    entity.position.x + 0.5,
    entity.position.y + 0.5,
  );
  ctx.rotate(entity.theta - Math.PI / 2);
  ctx.translate(-0.5, -0.5);
  if (entity.hp > 0 && entity.hp < game.config[entity.type].hp) {
    renderHealthBar(ctx, entity, game.config[entity.type].hp);
  }
  ctx.restore();
}

const renderDeadSegmented = (ctx, game, entity): void => {
  ctx.save();
  ctx.globalAlpha = 0.6;

  ctx.save();
  // render head:
  const headObj = getDeadSegmentHead(game, entity);
  ctx.translate(
    entity.position.x + 0.5,
    entity.position.y + 0.5,
  );
  ctx.rotate(entity.theta - Math.PI / 2);
  ctx.translate(-0.5, -0.5);
  ctx.drawImage(
    headObj.img,
    headObj.x, headObj.y, headObj.width, headObj.height,
    0, 0, 1, 1,
  );
  ctx.restore();

  // render segments:
  for (let i = 0; i < entity.segments.length - 1; i++) {
    const segment = entity.segments[i];
    const obj = getDeadSegmentSprite(game, entity, segment);
    ctx.save();
    ctx.translate(
      segment.position.x + 0.5,
      segment.position.y + 0.5,
    );
    ctx.rotate(segment.theta + Math.PI / 2);
    ctx.translate(-0.5, -0.5);
    ctx.drawImage(
      obj.img,
      obj.x, obj.y, obj.width, obj.height,
      0, 0, 1, 1,
    );
    ctx.restore();
  }

  // render tail segment:
  const tail = entity.segments[entity.segments.length - 1];
  const tailObj = getDeadSegmentTail(game, entity, tail);
  ctx.save();
  ctx.translate(
    tail.position.x + 0.5,
    tail.position.y + 0.5,
  );
  ctx.rotate(tail.theta - Math.PI / 2);
  ctx.translate(-0.5, -0.5);
  ctx.drawImage(
    tailObj.img,
    tailObj.x, tailObj.y, tailObj.width, tailObj.height,
    0, 0, 1, 1,
  );
  ctx.restore();

  ctx.restore();
};


////////////////////////////////////////////////////////////////
// Canvas
////////////////////////////////////////////////////////////////

const renderWormCanvas = (ctx, game, dims, entity): void => {
  ctx.save();
  ctx.translate(
    entity.position.x,
    entity.position.y,
  );
  ctx.fillStyle = 'pink';
  if (entity.type == 'CENTIPEDE') {
    ctx.fillStyle = 'white';
  } else if (entity.type == 'CATERPILLAR') {
    ctx.fillStyle = 'green';
  }
  // head
  const nextSegment = entity.segments[0];
  const headDir = vectorTheta(subtract(entity.position, nextSegment.position));
  ctx.save();
  ctx.translate(0.5, 0.5);
  ctx.rotate(headDir - Math.PI / 2);
  ctx.translate(-0.5, -0.5);
  if (onMinimapSmall(dims, entity)) {
    ctx.fillRect(0, 0, 1, 0.5);
    ctx.beginPath();
    ctx.arc(0.5, 0.5, 0.5, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  // body
  for (let i = 0; i < entity.segments.length - 1; i++) {
    const segment = entity.segments[i];
    const relPos = subtract(segment.position, entity.position);
    if (onMinimapSmall(dims, {position: segment.position, width: 1, height: 1})) {
      ctx.fillRect(relPos.x, relPos.y, 1, 1);
    }
  }
  // tail
  const tail = entity.segments[entity.segments.length - 1];
  const relPos = subtract(tail.position, entity.position);
  const prevTail = entity.segments[entity.segments.length - 2];
  const tailDir = vectorTheta(subtract(tail.position, prevTail.position));
  ctx.save();
  ctx.translate(relPos.x + 0.5, relPos.y + 0.5);
  ctx.rotate(tailDir - Math.PI / 2);
  ctx.translate(-1* (relPos.x + 0.5), -1 * (relPos.y + 0.5));
  if (onMinimapSmall(dims, {position: tail.position, width: 1, height: 1})) {
    ctx.fillRect(relPos.x, relPos.y, 1, 0.5);
    ctx.beginPath();
    ctx.arc(relPos.x + 0.5, relPos.y + 0.5, 0.5, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();
}

const onMinimapSmall = (dims: Dimensions, entity: Entity): boolean => {
  let {viewPos, viewWidth, viewHeight} = dims;
  const {position, width, height} = entity;
  const {x, y} = position;

  return x >= viewPos.x &&
    y >= viewPos.y &&
    (x + width) <= viewWidth + viewPos.x &&
    (y + height) <= viewHeight + viewPos.y;
};

const renderCentipedeCanvas = (ctx, game, entity): void => {
  ctx.save();
  ctx.translate(
    entity.position.x,
    entity.position.y,
  );
  // ctx.fillStyle = '#FAEBD7'; // off-white
  ctx.fillStyle = '#FF8C00'; // dark orange
  // head
  const nextSegment = entity.segments[0];
  const headDir = vectorTheta(subtract(entity.position, nextSegment.position));
  ctx.save();
  ctx.translate(0.5, 0.5);
  ctx.rotate(headDir - Math.PI / 2);
  ctx.translate(-0.5, -0.5);
  ctx.fillRect(0, 0, 1, 0.5);
  ctx.beginPath();
  // ctx.strokeStyle = '#FAEBD7'; // off-white
  ctx.strokeStyle = '#FF8C00'; // dark orange
  ctx.arc(0.5, 0.5, 0.5, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // body
  for (let i = 0; i < entity.segments.length - 1; i++) {
    const nextSegmentPos = i == 0
      ? entity.position
      : entity.segments[i-1].position;
    const segment = entity.segments[i];
    const relPos = subtract(segment.position, entity.position);
    // legs
    const dir = vectorTheta(subtract(nextSegmentPos, relPos));
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.translate(relPos.x + 0.5, relPos.y + 0.5);
    ctx.rotate(dir);
    ctx.moveTo(0, 0);
    for (let j = 0; j < 2; j++) {
      const leg1 = makeVector(Math.PI / 2 + Math.random() * 0.7, 1);
      ctx.lineTo(leg1.x, leg1.y);
      ctx.moveTo(0, 0);
      const leg2 = makeVector(Math.PI / 2 + Math.random() * 0.7, 1);
      ctx.lineTo(leg1.x, -1 * leg1.y);
      ctx.stroke();
    }
    ctx.closePath();
    ctx.restore();

    ctx.fillRect(relPos.x, relPos.y, 1, 1);
  }
  // ctx.strokeStyle = '#FAEBD7'; // off-white
  ctx.strokeStyle = '#FF8C00'; // dark orange
  // tail
  const tail = entity.segments[entity.segments.length - 1];
  const relPos = subtract(tail.position, entity.position);
  const prevTail = entity.segments[entity.segments.length - 2];
  const tailDir = vectorTheta(subtract(tail.position, prevTail.position));
  ctx.save();
  ctx.translate(relPos.x + 0.5, relPos.y + 0.5);
  ctx.rotate(tailDir - Math.PI / 2);
  ctx.translate(-1* (relPos.x + 0.5), -1 * (relPos.y + 0.5));
  ctx.fillRect(relPos.x, relPos.y, 1, 0.5);
  ctx.beginPath();
  ctx.arc(relPos.x + 0.5, relPos.y + 0.5, 0.5, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  if (entity.hp > 0 && entity.hp < game.config[entity.type].hp) {
    renderHealthBar(ctx, entity, game.config[entity.type].hp);
  }
  ctx.restore();
};


module.exports = {
  renderWorm,
  renderWormCanvas,
  renderCentipede,
  renderCentipedeCanvas,
  renderDeadWorm,
  renderDeadCentipede,
  renderCaterpillar,
  renderDeadCaterpillar,
}

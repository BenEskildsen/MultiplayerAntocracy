// @flow

const {
  add, subtract, multiply, vectorTheta,
} = require('../utils/vectors');
const {queueAction, makeAction} = require('../simulation/actionQueue');
const {collidesWith} = require('../selectors/collisions');
const {
  changeEntitySize, moveEntity, removeEntity,
} = require('../simulation/entityOperations');
const {dealDamageToEntity} = require('../simulation/miscOperations');
const {getFreeNeighborPositions} = require('../selectors/neighbors');
const {getQueen, onScreen} = require('../selectors/misc');
const {oneOf, randomIn} = require('../utils/stochastic');

const footFall = (game, foot): void => {
  foot.state = 'falling';

  const config = game.config;
  changeEntitySize(
    game, foot,
    game.config.FOOT.width,
    game.config.FOOT.height,
  );

};

const footStomp = (game, foot): void => {
  foot.state = 'stomping';
  foot.numStomps += 1;
  const config = game.config;

  // if not close to queen, don't kill stuff
  // if (!onScreen(game, foot)) {
  //   console.log("foot stomping off screen");
  //   queueAction(game, foot, makeAction(game, foot, 'LIFT'));
  //   return;
  // }

  // kill collided ants, termites, critters
  const squishables = [
    'ANT', 'EGG', 'LARVA', 'PUPA',
    'TERMITE', 'TERMITE_EGG',
    ...config.critterTypes,
  ];
  const toSquish = collidesWith(
    game, foot, squishables,
  );
  for (const entity of toSquish) {
    dealDamageToEntity(game, entity, foot.damage);
  }

  // push out collided dirt, food
  const dirtTypes = ['DIRT'];
  const toCrater = collidesWith(
    game, foot, dirtTypes,
  );
  for (const dirt of toCrater) {
    if (Math.random() < 0.5) {
      removeEntity(game, dirt);
    } else {
      const freePositions = getFreeNeighborPositions(
        game, foot,
        [...squishables, ...dirtTypes, 'TOKEN', 'BACKGROUND'],
        true,
      );
      if (freePositions.length == 0) {
        const nextRingPositions = getFreeNeighborPositions(
          game, {...foot, position: subtract(foot.position, {x: 1, y: 1}),
            width: foot.width + 2, height: foot.height + 2,
          },
          [...squishables, ...dirtTypes, 'TOKEN', 'BACKGROUND'],
          true,
        );
        if (nextRingPositions.length > 0) {
          moveEntity(game, dirt, oneOf(nextRingPositions));
        } else if (Math.random() < 0.25) {
          removeEntity(game, dirt);
        }
      } else {
        // move to ring
        moveEntity(game, dirt, oneOf(freePositions));
      }
    }
  }

  queueAction(game, foot, makeAction(game, foot, 'LIFT'));
};

const footLift = (game, foot): void => {
  foot.state = 'lifted';
  const config = game.config;
  foot.stompTicks = game.config.FOOT.maxStompTicks;
  // foot.stompTicks = Math.min(
  //   config.FOOT.stompMultiplier * foot.numStomps * config.FOOT.stompTicks,
  //   config.FOOT.maxStompTicks,
  // );

  changeEntitySize(game, foot, 1, 1);

  // reset view
  const queen = getQueen(game, game.playerID);
  if (queen != null) {
    const viewPos = {
      x: queen.position.x - game.viewWidth / 2,
      y: queen.position.y - game.viewHeight /2,
    };
    game.viewPos = viewPos;
  }

  // NOTE: this is the old way where the foot decides where to move either per level
  //
  // kitchen level
  // let nextPos = {
  //   x: randomIn(game.gridWidth * 0.6, game.gridWidth * 0.9),
  //   y: randomIn(game.gridHeight * 0.5, game.gridHeight * 0.9),
  // };
  // neoFireAntLevel
  // let nextPos = {
  //   x: randomIn(game.gridWidth / 4, game.gridWidth * 0.75),
  //   y: randomIn(game.gridHeight / 4, game.gridHeight * 0.75),
  // };

  let nextPos = {...game.entities[oneOf(game.BACKGROUND)].position};
  queueAction(game, foot, makeAction(game, foot, 'MOVE', {nextPos}));
};

module.exports = {
  footFall, footStomp, footLift,
};

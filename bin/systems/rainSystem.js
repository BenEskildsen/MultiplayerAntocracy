const {
  randomIn,
  normalIn
} = require('../utils/stochastic');
const globalConfig = require('../config');
const {
  fillPheromone
} = require('../simulation/pheromones');
const initRainSystem = store => {
  const {
    dispatch
  } = store;
  let time = -1;
  store.subscribe(() => {
    const state = store.getState();
    const {
      game
    } = state;
    if (!game) return;
    if (game.time == time) return;
    time = game.time;

    // rain for 30 seconds every 4 minutes
    if (time > 1 && time % (24 * 4 * 60) == 0) {
      dispatch({
        type: 'SET_IS_RAINING',
        rainTicks: 24 * 15
      });
    }
    if (game.rainTicks > 0) {
      const numRainDrops = Math.random() < 0.1 ? 1 : 0;
      const rainQuantity = globalConfig.config.WATER.quantity;
      for (let i = 0; i < numRainDrops; i++) {
        const rainPos = {
          x: normalIn(10, game.gridWidth - 10),
          y: normalIn(5, game.gridHeight / 5)
        };
        fillPheromone(game, rainPos, 'WATER', game.playerID, rainQuantity);
      }
    }
  });
};
module.exports = {
  initRainSystem
};
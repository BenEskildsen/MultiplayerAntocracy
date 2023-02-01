// @flow

const {randomIn} = require('../utils/stochastic');
const {lookupInGrid} = require('../utils/gridHelpers');
const {add} = require('../utils/vectors');

const initCPUColonySystem = (store) => {
  const {dispatch} = store;
  let time = -1;
  store.subscribe(() => {
    const state = store.getState();
    const {game} = state;
    if (!game) return;
    if (game.time == time) return;
    time = game.time;

    for (const playerID in game.players) {
      const player = game.players[playerID];
      const config = game.config[player.id];
      if (player.type == "HUMAN") continue;
      const numAnts = game.ANT
        .map(id => game.entities[id])
        .filter(a => a.playerID == player.id)
        .length;
      let nextCaste = 'MINIMA';
      if (numAnts >= config.cpuMediaThreshold) {
        nextCaste = 'MEDIA';
      }
      if (numAnts >= config.cpuMajorThreshold) {
        nextCaste = 'MAJOR';
      }
      if (nextCaste != game.colonies[player.id].makingCaste) {
        dispatch({
          type: 'SET_MAKING_CASTE',
          makingCaste: nextCaste,
          playerID: player.id,
        });
      }
    }
  });
};

module.exports = {initCPUColonySystem};

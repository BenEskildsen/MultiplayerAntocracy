// @flow

const initPheromoneWorkerSystem = (store) => {
  const {dispatch} = store;
  const {game} = store.getState();

  game.pheromoneWorker.onmessage = (result) => {
    dispatch({type: 'UPDATE_ALL_PHEROMONES', pheromones: result.data});
  };
};

module.exports = {initPheromoneWorkerSystem};

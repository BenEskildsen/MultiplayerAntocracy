const {
  removeEntity,
  addEntity,
  changeEntityType,
  moveEntity
} = require('../simulation/entityOperations');
const {
  makeVine
} = require('../entities/makeEntity');
function updateSeeds(game) {
  const config = game.config;
  for (const seedID of game.SEED) {
    const seed = game.entities[seedID];
    seed.age++;
    if (seed.age > config.SEED.growthTicks && seed.position != null) {
      let plant = null;
      switch (seed.plantType) {
        case 'VINE':
          plant = makeVine(game, seed.position, 'BUD');
          break;
      }
      if (plant != null) {
        removeEntity(game, seed);
        addEntity(game, plant);
      }
    }
  }
}
module.exports = {
  updateSeeds
};
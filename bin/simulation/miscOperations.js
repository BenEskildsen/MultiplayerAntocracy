const {
  add,
  subtract,
  magnitude
} = require('../utils/vectors');
const {
  makeAction,
  isActionTypeQueued,
  queueAction,
  stackAction,
  cancelAction
} = require('../simulation/actionQueue');
const {
  removeEntity,
  addEntity
} = require('../simulation/entityOperations');
const {
  makeVine,
  makeFood,
  makeSeed
} = require('../entities/makeEntity');
const {
  getPheromoneAtPosition
} = require('../selectors/pheromones');
const dealDamageToEntity = (game, entity, damage) => {
  entity.prevHP = entity.hp;
  entity.prevHPAge = 0;
  entity.hp -= damage;
  if (entity.hp <= 0) {
    if (!entity.actions) {
      removeEntity(game, entity);
      // HACK: vines
      if (entity.type == 'VINE') {
        const config = game.config;
        if (Math.random() < config.VINE.seedRate && entity.subType == 'STALK') {
          addEntity(game, makeSeed(game, entity.position, 'VINE'));
        } else if (entity.subType == 'STALK' && (Math.random() < config.VINE.foodRateOnDeath || !game.vineDied)) {
          addEntity(game, makeFood(game, entity.position));
          game.vineDied = true;
        }
      }
    } else if (!isActionTypeQueued(entity, 'DIE')) {
      stackAction(game, entity, makeAction(game, entity, 'DIE', null));
    }
  }
};
const takeAcidDamage = (game, entity) => {
  let totalAcid = 0;
  for (const playerID in game.players) {
    if (playerID == entity.playerID) continue;
    const acid = getPheromoneAtPosition(game, entity.position, 'ACID', playerID);
    totalAcid += acid;
  }
  if (totalAcid > 0) {
    dealDamageToEntity(game, entity, totalAcid / 25);
  }
};
const addTrapjaw = (game, entity, trapjawAnt) => {
  if (entity.trapjaws == null) {
    entity.trapjaws = [];
  }
  let pos = subtract(trapjawAnt.position, entity.position);
  pos.x = pos.x > 0 ? pos.x - 1 : pos.x + 1;
  pos.y = pos.y > 0 ? pos.y - 1 : pos.y + 1;
  entity.trapjaws.push({
    id: trapjawAnt.id,
    position: pos
  });
  trapjawAnt.position = null;
};
const removeTrapjaws = (game, entity) => {
  if ((entity === null || entity === void 0 ? void 0 : entity.trapjaws) == null || entity.trapjaws.length == 0) return;
  for (const trapjaw of entity.trapjaws) {
    const ant = game.entities[trapjaw.id];
    ant.position = add(entity.position, trapjaw.position);
  }
  entity.trapjaws = null;
};
module.exports = {
  dealDamageToEntity,
  takeAcidDamage,
  addTrapjaw,
  removeTrapjaws
};
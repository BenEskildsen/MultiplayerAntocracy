// @flow

const getEntityConfig = (game: Game, entity: Entity): Object => {
  let config = game.config;

  // player-specific overrides
  if (entity.playerID != null) {
    config = game.config[entity.playerID];
  }

  // caste-specific overrides
  if (entity.caste != null) {
    config = {
      ...config[entity.type],
      ...config[entity.caste],
    };
  } else {
    config = config[entity.type];
  }

  return config;
};

module.exports = {
  getEntityConfig,
};

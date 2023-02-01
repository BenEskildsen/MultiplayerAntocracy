const {
  lookupInGrid,
  getEntityPositions
} = require('../utils/gridHelpers');
const collides = (game, entityA, entityB) => {
  return collidesWith(game, entityA).filter(e => e.id === entityB.id).length > 0;
};
const collidesWith = (game, entity, blockingTypes) => {
  const positions = getEntityPositions(game, entity);
  const collisions = [];
  for (const pos of positions) {
    const thisCell = collisionsAtSpace(game, entity, blockingTypes, pos);
    collisions.push(...thisCell);
  }
  return collisions;
};

// use special logic to see what is considered a collision at a given space
const collisionsAtSpace = (game, entity, blockingTypes, pos, neighbor) => {
  const collisions = lookupInGrid(game.grid, pos).map(id => game.entities[id])
  // regular entities do not block themselves, but segmented entities do
  // BUT only when we are considering what neighboring spaces are free to move to,
  // NOT whether a move we've made collides with ourself
  .filter(e => {
    return entity.segmented && neighbor && !entity.stuck ? true : e.id != entity.id;
  }).filter(e => {
    // ant colliding with ant is more complicated:
    if (e.type == 'ANT' && entity.type == 'ANT' && blockingTypes.includes('ANT')) {
      // queen is not blocked by ants while dashing
      const curAction = entity.actions[0] ? entity.actions[0].type : 'NONE';
      if (entity.caste == 'QUEEN' && game.config[entity.playerID].queenArmored && curAction == 'DASH' && !blockingTypes.includes('ANT') // HACK this is required for dashing through
      ) {
        return false;
      }

      // blocked by enemy ants
      if (e.playerID != entity.playerID) {
        return true;
      }

      // not blocked if holding stuff
      if (entity.holding != null && e.holding == null) {
        // || e.holding != null) {
        return false;
      }

      // not blocked if greater caste than minima
      // if (
      //   (e.caste == 'MINIMA' && entity.caste != 'MINIMA') ||
      //   (entity.caste == 'MINIMA' && e.caste != 'MINIMA')
      // ) {
      //   return false;
      // }

      // young queens don't block each other
      // if (e.caste == 'YOUNG_QUEEN' && entity.caste == 'YOUNG_QUEEN') {
      //   return false;
      // }

      // ants not blocked by friendly ants of different caste
      // OR if they're both queens
      if ((entity.caste != e.caste || entity.caste == 'QUEEN') && e.playerID == entity.playerID) {
        return false;
      } else {
        return true;
      }
    }
    // special case for foot that is not stomping -- don't get blocked
    if (e.type == 'FOOT' && e.state != 'stomping') {
      return false;
    }
    return blockingTypes.includes(e.type);
  });
  return collisions;
};
module.exports = {
  collides,
  collidesWith,
  collisionsAtSpace
};
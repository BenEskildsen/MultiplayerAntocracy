const levels = require('../levels/levels');
const {
  applyUpgrade
} = require('../state/upgrades');
const {
  inferPlayerIDForUpgrade
} = require('../selectors/misc');

/**
 * Levels can have their own upgrades, but these should be npc-specific
 * and will be applied without going through the applyUpgrade thunk
 *
 * additionalUpgrades are more like real game upgrades that apply
 * to the player and need to get applied to them
 */
function loadLevel(store, levelName, startingUpgrades, synchronous) {
  const {
    dispatch
  } = store;
  const level = levels[levelName];
  dispatch({
    type: 'SET_CURRENT_LEVEL_NAME',
    levelName
  });
  dispatch({
    type: 'SET_LEVEL',
    level
  });
  const game = store.getState().game;
  for (const upgrade of startingUpgrades) {
    const playerID = inferPlayerIDForUpgrade(upgrade);
    applyUpgrade(dispatch, game, playerID, upgrade, playerID + "" != "1" // levelOnly
    );
  }

  // NOTE: has to be done in this order to properly use applyUpgrade
  // AND reload the level with upgrades applied
  dispatch({
    type: 'SET_PLAYERS_AND_SIZE',
    synchronous
  });
}
module.exports = {
  loadLevel
};
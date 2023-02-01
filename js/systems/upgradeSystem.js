// @flow

const React = require('react');
const globalConfig = require('../config');
const SmantModal = require('../ui/Components/SmantModal.react');
const Divider = require('../ui/Components/Divider.react');
const UpgradeModal = require('../ui/UpgradeModal.react');
const CampaignUpgradeModal = require('../ui/CampaignUpgradeModal.react');
const {lookupInGrid} = require('../utils/gridHelpers');
const {getPositionsInFront, getQueen} = require('../selectors/misc');
const {getLevelYoungQueenTarget} = require('../selectors/campaignSelectors');
const {
  applyUpgrade,
  getNextTriviaBasedUpgrade,
} = require('../state/upgrades');

const initUpgradeSystem = (store) => {
  const {dispatch} = store;
  let time = -1;
  store.subscribe(() => {
    const state = store.getState();
    const {game} = state;
    if (!game) return;
    if (game.time == time) return;
    if (game.time < 1) return;
    time = game.time;

    if (!state.campaign.isCampaign) {
      freePlayUpgrades(store, dispatch, state);
      return;
    }

    // Young Queen upgrades
    const numYoungQueens = game.ANT
      .map(id => game.entities[id])
      .filter(a => a.playerID == game.playerID && a.caste == 'YOUNG_QUEEN')
      .length;
    const targetNum = getLevelYoungQueenTarget(state);

    if (numYoungQueens >= targetNum && !game.upgradedYoungQueens) {
      dispatch({type: 'SET', value: true, property: 'upgradedYoungQueens'});
      dispatch({type: 'STOP_TICK'});
      dispatch({
        type: 'SET_MODAL',
        modal: <CampaignUpgradeModal store={store} dispatch={store.dispatch} state={state} />
      });
    }

    // Trivia
    const queen = getQueen(game, game.playerID);
    const isNeighboringTrivia = getIsQueenNearTrivia(game, queen);
    if (isNeighboringTrivia && !game.triviaLocated) {
      dispatch({type: 'SET', value: true, property: 'triviaLocated'});
      dispatch({type: 'STOP_TICK'});
      const upgrade = getNextTriviaBasedUpgrade(state);
      dispatch({
        type: 'SET_MODAL',
        modal: (<SmantModal
          title={"Ant Trivia Time!"}
          body={(
            <span>
              <div>{upgrade.trivia}</div>
              <Divider />
              <div style={{textAlign: "center"}}>
                Adaptation Provided: <b>{upgrade.name}</b>
              </div>
              <div>{upgrade.description}</div>
            </span>
          )}
          buttons={[{
            label: 'Adapt',
            onClick: () => {
              dispatch({type: 'START_TICK'});
              dispatch({type: 'DISMISS_MODAL'});
              applyUpgrade(dispatch, game, game.playerID, upgrade);
            },
          }]}
        />),
      });
    }

  });
};

const freePlayUpgrades = (store, dispatch, state) => {
  const game = state.game;
  const numAnts = game.ANT
    .map(id => game.entities[id])
    .filter(a => a.playerID == game.playerID)
    .length;

  let shouldUpgrade = false;
  let upgradeNum = 0;
  for (const num of globalConfig.config.upgradeNums) {
    if (numAnts >= num && !game.upgradedAt.includes(num)) {
      shouldUpgrade = true;
      upgradeNum = num;
      break;
    }
  }

  if (shouldUpgrade) {
    dispatch({type: 'STOP_TICK'});
    dispatch({type: 'APPEND_UPGRADED_AT', upgradeNum});
    dispatch({
      type: 'SET_MODAL',
      modal: <UpgradeModal store={store} dispatch={store.dispatch} state={state} />
    });
  }
}

function getIsQueenNearTrivia(game, queen) {
  const positions = getPositionsInFront(game, queen);
  for (const pos of positions) {
    const triviaEntities = lookupInGrid(game.grid, pos)
      .map(id => game.entities[id])
      .filter(e => e.type == 'DOODAD' && e.sprite == 'QUESTION');
    if (triviaEntities.length > 0) {
      return true;
    }
  }
  return false;
}

module.exports = {initUpgradeSystem};

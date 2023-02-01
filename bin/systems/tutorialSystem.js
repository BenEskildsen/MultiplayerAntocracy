const React = require('react');
const SmantModal = require('../ui/Components/SmantModal.react');
const {
  allUpgrades,
  applyUpgrade
} = require('../state/upgrades');
const {
  randomIn
} = require('../utils/stochastic');
const {
  lookupInGrid
} = require('../utils/gridHelpers');
const {
  getPositionsInFront,
  getQueen
} = require('../selectors/misc');
const {
  add
} = require('../utils/vectors');
const initTutorialSystem = store => {
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
    const queen = getQueen(game, game.playerID);
    if (queen == null) return;
    const trigger = getTutorialTrigger(game, queen);
    if (trigger == null) return;
    if (trigger.type == 'LARVA' && game.tutorialFlags.larva == null) {
      const flag = 'larva';
      const tutorialDismissed = !!localStorage.getItem("tutorial_" + flag);
      const seenThisCampaign = !!localStorage.getItem("seenThisCampaign_" + flag);
      if (game.tutorialFlags[flag] == null && !tutorialDismissed && !seenThisCampaign) {
        localStorage.setItem('seenThisCampaign_' + flag, true);
        dispatch({
          type: 'STOP_TICK'
        });
        dispatch({
          type: 'SET_TUTORIAL_FLAG',
          flag
        });
        dispatch({
          type: 'SET_MODAL',
          modal: larvaModal(dispatch, flag)
        });
        dispatch({
          type: 'SET_HOTKEY',
          press: 'onKeyUp',
          key: 'enter',
          fn: s => dismissModal(s.dispatch)
        });
      }
    }
    if (trigger.type == 'TOKEN') {
      let flag = 'foodToken';
      let modal = foodTokenModal(dispatch, flag);
      switch (trigger.pheromoneType) {
        case 'COLONY':
          flag = 'foodToken';
          modal = foodTokenModal(dispatch, flag);
          break;
        case 'DIRT_DROP':
          flag = 'dirtToken';
          modal = dirtTokenModal(dispatch, game, flag);
          break;
        case 'MOVE_LARVA_PHER':
          flag = 'larvaToken';
          modal = larvaTokenModal(dispatch, flag);
          break;
      }
      const tutorialDismissed = !!localStorage.getItem("tutorial_" + flag);
      const seenThisCampaign = !!localStorage.getItem("seenThisCampaign_" + flag);
      if (game.tutorialFlags[flag] == null && !tutorialDismissed && !seenThisCampaign) {
        dispatch({
          type: 'STOP_TICK'
        });
        dispatch({
          type: 'SET_TUTORIAL_FLAG',
          flag
        });
        localStorage.setItem('seenThisCampaign_' + flag, true);
        dispatch({
          type: 'SET_MODAL',
          modal
        });
        dispatch({
          type: 'SET_HOTKEY',
          press: 'onKeyUp',
          key: 'enter',
          fn: s => dismissModal(s.dispatch)
        });
      }
    }
  });
};

// if an entity that should trigger a tutorial is in a position
// in front of the queen, return that type here
function getTutorialTrigger(game, queen) {
  const positions = getPositionsInFront(game, queen);
  for (const pos of positions) {
    const tutorialEntities = lookupInGrid(game.grid, pos).map(id => game.entities[id]).filter(e => {
      if (e.type == 'LARVA' && e.playerID == queen.playerID) {
        return true;
      }
      if (e.type == 'TOKEN' && (e.pheromoneType == 'DIRT_DROP' || e.pheromoneType == 'COLONY' || e.pheromoneType == 'MOVE_LARVA_PHER')) {
        return true;
      }
      return false;
    });
    if (tutorialEntities.length > 0) {
      return tutorialEntities[0];
    }
  }
  return null;
}
function larvaModal(dispatch, flag) {
  return /*#__PURE__*/React.createElement(SmantModal, {
    title: 'This is a larva',
    body: 'Eggs you lay hatch into larva. Pick up food (the green squares) and feed' + ' it to a larva by walking up to it and standing still. A fed larva ' + ' will turn into a pupa which will then hatch into a new worker ant.' + ' Once your colony is big enough, your worker ants will feed larva themselves.',
    buttons: [{
      label: 'Ok (Enter)',
      onClick: () => dismissModal(dispatch)
    }, {
      label: 'Don\'t Show This Again',
      onClick: () => dismissModal(dispatch, flag)
    }]
  });
}
function foodTokenModal(dispatch, flag) {
  return /*#__PURE__*/React.createElement(SmantModal, {
    title: 'This is the Food Token',
    body: ' This token serves as the center of your colony.' + ' Your worker ants will gather food (the green squares) around this token.' + ' You can pick up this token and place it somewhere else to relocate your colony.' + ' Tokens work best in empty areas.',
    buttons: [{
      label: 'Ok (Enter)',
      onClick: () => dismissModal(dispatch)
    }, {
      label: 'Don\'t Show This Again',
      onClick: () => dismissModal(dispatch, flag)
    }]
  });
}
function dirtTokenModal(dispatch, game, flag) {
  return /*#__PURE__*/React.createElement(SmantModal, {
    title: 'This is the Dirt Token',
    body: 'You\'ve unlocked the ability to emit a pheromone that will mark dirt ' + 'for your worker ants to dig out! Worker ants that pick up dirt will ' + 'place it around this token. To mark dirt for digging, use the > button ' + 'to switch to the "Dig" pheromone, then hold the "Dig" button while facing ' + 'dirt you want removed. Nearby unoccupied worker ants will go pick up and ' + 'move the marked dirt to this token.',
    buttons: [{
      label: 'Ok (Enter)',
      onClick: () => {
        dismissModal(dispatch);
        applyUpgrade(dispatch, game, game.playerID, allUpgrades['Mark Dirt'], true);
      }
    }, {
      label: 'Don\'t Show This Again',
      onClick: () => {
        dismissModal(dispatch, flag);
        applyUpgrade(dispatch, game, game.playerID, allUpgrades['Mark Dirt'], true);
      }
    }]
  });
}
function larvaTokenModal(dispatch, flag) {
  return /*#__PURE__*/React.createElement(SmantModal, {
    title: 'This is the Larva Token',
    body: 'Having your larva spread out all over can make it harder for your worker ' + 'ants to feed them. Now your worker ants will pick up and move larva to this ' + 'token to keep larva more organized.',
    buttons: [{
      label: 'Ok (Enter)',
      onClick: () => dismissModal(dispatch)
    }, {
      label: 'Don\'t Show This Again',
      onClick: () => dismissModal(dispatch, flag)
    }]
  });
}
function dismissModal(dispatch, flag) {
  dispatch({
    type: 'DISMISS_MODAL'
  });
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyUp',
    key: 'enter',
    fn: s => {}
  });
  dispatch({
    type: 'START_TICK'
  });
  if (flag) {
    localStorage.setItem('tutorial_' + flag, true);
  }
}
module.exports = {
  initTutorialSystem
};
const React = require('react');
const Button = require('./Button.react');
const Modal = require('./Modal.react');
const {
  registerSession
} = require('../../thunks/clientToServerThunks');
const {
  getQueen
} = require('../../selectors/misc');
const {
  isElectron
} = require('../../utils/helpers');
let remote = null;
if (isElectron() && window.require) {
  remote = window.require('electron');
}
const {
  useState,
  useEffect,
  useMemo
} = React;
const QuitButton = props => {
  const {
    isInGame,
    dispatch,
    store
  } = props;
  if (!isInGame && !isElectron()) return null;
  const buttonStyle = isInGame ? {} : {
    margin: 5,
    borderRadius: 8,
    left: 5
  };
  return /*#__PURE__*/React.createElement("div", {
    style: buttonStyle
  }, /*#__PURE__*/React.createElement(Button, {
    label: "Quit",
    onClick: () => {
      if (!isInGame) {
        remote.webFrame.context.close();
      } else {
        quitGameModal(dispatch);
      }
    }
  }));
};
const quitGameModal = dispatch => {
  dispatch({
    type: 'STOP_TICK'
  });
  const returnToMainMenuButton = {
    label: 'Main Menu',
    onClick: () => {
      registerQuit(store, 'lobby');
      dispatch({
        type: 'DISMISS_MODAL'
      });
      dispatch({
        type: 'RETURN_TO_LOBBY'
      });
    }
  };
  const returnToGameButton = {
    label: 'Return to Game',
    onClick: () => {
      dispatch({
        type: 'DISMISS_MODAL'
      });
      dispatch({
        type: 'START_TICK'
      });
    }
  };
  const quitAppButton = {
    label: 'Quit Application',
    onClick: () => {
      registerQuit(store, 'quit');
      remote.webFrame.context.close();
    }
  };
  const buttons = [returnToGameButton, returnToMainMenuButton];
  if (isElectron()) {
    buttons.push(quitAppButton);
  }
  const body = /*#__PURE__*/React.createElement("div", null);
  dispatch({
    type: 'SET_MODAL',
    modal: /*#__PURE__*/React.createElement(Modal, {
      title: 'Quit Game?',
      body: body,
      buttons: buttons
    })
  });
};
function registerQuit(store, quitType) {
  const state = store.getState();
  const game = state.game;
  if (game != null) {
    const playerQueen = getQueen(game, game.playerID);
    if (playerQueen != null && playerQueen.type != 'DEAD_ANT') {
      registerSession(state, quitType);
    }
  }
}
module.exports = QuitButton;
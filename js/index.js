// @flow

const {createStore} = require('redux');
const Main = require('./ui/Main.react');
const React = require('react');
const ReactDOM = require('react-dom/client');
const {getQueen} = require('./selectors/misc');
const {rootReducer} = require('./reducers/rootReducer');
const {registerSession} = require('./thunks/clientToServerThunks');

import type {Store} from './types';

const store = createStore(rootReducer);
window.store = store; // useful for debugging and a few hacks


// track when players quit
window.onbeforeunload = function() {
  if (window.location.hostname == 'localhost') return;
  const state = store.getState();
  const game = state.game;
  if (game != null) {
    const playerQueen = getQueen(game, game.playerID);
    if (playerQueen != null && playerQueen.type != 'DEAD_ANT') {
      registerSession(state, 'quit');
    }
  }
}

function renderUI(root): React.Node {
  const state = store.getState();
  root.render(
    <Main dispatch={store.dispatch}
      store={store} state={state}
      modal={state.modal}
    />
  );
}

const root = ReactDOM.createRoot(document.getElementById('container'));
renderUI(root);

// subscribe the game rendering to the store
store.subscribe(() => {
  renderUI(root);
});

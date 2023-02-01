// @flow

const React = require('react');
const Game = require('./Game.react');
const Overworld = require('./Overworld.react');
const LevelEditor = require('./LevelEditor.react');
const Lobby = require('./Lobby.react');
const SessionLobby = require('./SessionLobby.react');
const Button = require('./components/Button.react');
const Canvas = require('./Canvas.react');
const Checkbox = require('./Components/Checkbox.react');
const RadioPicker = require('./Components/RadioPicker.react');
const ExperimentalSidebar = require('./ExperimentalSidebar.react');
const {setupSocket} = require('../clientToServer');
const {useEffect} = React;

import type {State, Action} from '../types';

type Props = {
  state: State, // Game State
  dispatch: (action: Action) => Action,
  store: Object,
  modal: Object,
};

function Main(props: Props): React.Node {
  const {state, modal} = props;

  useEffect(() => {
    setupSocket(props.dispatch);
  }, []);

  let content = null;
  if (state.screen === 'LOBBY') {
    content = <Lobby dispatch={props.dispatch} store={props.store} />;
  } else if (state.screen === 'SESSION_LOBBY') {
    content = (<SessionLobby
      dispatch={props.dispatch}
      state={props.store.getState()}
      getState={props.store.getState}
      store={props.store}
    />);
  } else if (state.screen === 'GAME') {
    content = (
      <Game
        dispatch={props.dispatch} store={props.store}
        gameID={state.game.gameID}
        tickInterval={state.game.tickInterval}
      />
    );
  } else if (state.screen == 'EDITOR') {
    content = (
      <span>
      <Game
        dispatch={props.dispatch} store={props.store}
        gameID={state.game.gameID}
        tickInterval={state.game.tickInterval}
        isInLevelEditor={true}
      />
        <LevelEditor
          state={state}
          dispatch={props.dispatch} store={props.store}
        />
      </span>
    );
  } else if (state.screen == 'SPECIES_SELECTION') {
  } else if (state.screen == 'UPGRADES') {
  } else if (state.screen == 'OVERWORLD') {
    content = (
      <Overworld
        dispatch={props.dispatch} store={props.store}
        state={props.state}
      />
    );
  }

  // don't let clicked buttons get focus since this lets pressing enter click it again
  useEffect(() => {
    document.addEventListener('click', function(e) {
      if (document.activeElement.toString() == '[object HTMLButtonElement]') {
        document.activeElement.blur();
      }
    });
  }, [state.screen]);

  return (
    <React.Fragment>
      {content}
      {state.modal}
    </React.Fragment>
  )
}

module.exports = Main;

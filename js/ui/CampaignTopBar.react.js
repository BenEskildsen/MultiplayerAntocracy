
const React = require('react');
const AudioWidget = require('./Components/AudioWidget.react');
const Button = require('./Components/Button.react');
const Modal = require('./Components/Modal.react');
const SmantModal = require('./Components/SmantModal.react');
const QuitButton = require('../ui/components/QuitButton.react');
const globalConfig = require('../config');
const {getLevelYoungQueenTarget} = require('../selectors/campaignSelectors');
const {getTotalYoungQueens} = require('../selectors/misc');
const {getDisplayTime, isMobile} = require('../utils/helpers');
const {useMemo, useState, useEffect} = React;

function CampaignTopBar(props) {
  const {store, dispatch, isExperimental} = props;
  const state = store.getState();
  const game = state?.game;
  const tickInterval = state?.game?.tickInterval;

  if (isExperimental && tickInterval == null) {
    return null
  }

  const height = 100;
  const topPadding = 8;
  const leftPadding = innerWidth / 2 - 200;


  ///////////////////
  // Goals
  const numYoungQueens = useMemo(() => {
    // yougn queens that are alive + the ones that flew away
    return getTotalYoungQueens(game, game.upgradedYoungQueens);
  }, [game.ANT.length, game.totalYoungQueens, game.upgradedYoungQueens]);
  const targetNum = useMemo(() => getLevelYoungQueenTarget(state), []);
  let youngQueenHTML = (
    <div>
      <b>Young Queens: {numYoungQueens} / {targetNum}</b>
    </div>
  );
  if (game.upgradedYoungQueens) {
    youngQueenHTML = (<s>{youngQueenHTML}</s>);
  }

  let triviaHTML = (
    <div>
      <b>Trivia Located: {game.triviaLocated ? 1 : 0} / 1</b>
    </div>
  );
  if (game.triviaLocated) {
    triviaHTML = (<s>{triviaHTML}</s>);
  }

  const goalCritters = {};
  for (const critterID in game.GOAL_CRITTER) {
    const critter = game.entities[critterID];
    let cType = critter.type.slice(0,4) == 'DEAD' ? critter.type.slice(5) : critter.type;
    if (!goalCritters[cType]) {
      goalCritters[cType] = {dead: 0, total: 1};
    } else {
      goalCritters[cType].total += 1;
    }
    if (critter.hp <= 0) {
      goalCritters[cType].dead += 1;
    }
  }
  const goalCrittersHTML = [];
  for (const critterGoal in goalCritters) {
    const {dead, total} = goalCritters[critterGoal];
    let critterLabel = critterGoal;
    if (critterGoal == 'ANT') {
      critterLabel = 'QUEEN ANT';
    } else if (critterGoal == 'TERMITE') {
      critterLabel = 'QUEEN TERMITE';
    }
    const row = (
      <div key={"critterGoal_" + critterGoal}>
        <b>{critterLabel}: {dead} / {total}</b>
      </div>
    );
    if (dead >= total) {
      goalCrittersHTML.push(<s key={"strike_" + critterGoal}>{row}</s>);
    } else {
      goalCrittersHTML.push(row);
    }
  }
  ///////////////////

  return (
    <div
      style={{
        position: 'absolute',
        top: topPadding,
        height,
        width: '100%',
        zIndex: 2,
        textShadow: '-1px -1px 0 #FFF, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          float: 'left',
          paddingLeft: 8,
          pointerEvents: 'all',
        }}
      >
        <QuitButton isInGame={true} dispatch={dispatch} store={store} />
        <AudioWidget
          audioFiles={globalConfig.config.campaignAudioFiles}
          isShuffled={false}
          isMuted={state.isMuted}
          setIsMuted={() => {
            store.dispatch({type: 'SET_IS_MUTED', isMuted: !state.isMuted});
          }}
          style={{
          }}
        />
        <div>
          <Button
            label="Instructions"
            onClick={() => {
              instructionsModal(dispatch);
            }}
          />
        </div>
        <div>
          <Button
            label={tickInterval ? 'Pause' : 'Play'}
            disabled={state.modal != null}
            onClick={() => {
              if (tickInterval != null) {
                dispatch({type: 'STOP_TICK'});
              } else {
                dispatch({type: 'START_TICK'});
              }
            }}
          />
        </div>
      </div>
      <div
        style={{
          float: 'right',
          paddingRight: 8,
          pointerEvents: 'all',
        }}
      >
        <Button
          label="+"
          onClick={() => dispatch({type: 'SWAP_MINI_MAP'})}
        />
      </div>
      <div
        id="centerTopbar"
        style={{
          left: leftPadding,
          position: 'absolute',
        }}
      >
        <div
          id="leftCenter"
          style={{
            display: 'inline-block',
          }}
        >
          <div
            style={{
              fontSize: '24px',
            }}
          >
            <b>Main Goal:</b>
            <span
              style={{
                fontSize: 'initial',
              }}
            >
              {goalCrittersHTML}
            </span>
          </div>
          <div
            style={{
              fontSize: '20px',
            }}
          >
            <b>Secondary Goals:</b>
            <span
              style={{
                fontSize: 'initial',
              }}
            >
              <div><b>(Complete to Earn Upgrades)</b></div>
              {youngQueenHTML}
              {triviaHTML}
            </span>
          </div>
        </div>
        <StatsCard game={game} />
      </div>
    </div>
  );
}

function StatsCard(props) {
  const {game} = props;

  const numAnts = useMemo(() => {
    return game.ANT
      .map(id => game.entities[id])
      .filter(a => a.playerID == game.playerID)
      .length;
  }, [game.ANT.length]);

  const numKilled = useMemo(() => {
    return game.DEAD_ANT
      .map(id => game.entities[id])
      .filter(a => a.playerID == game.playerID)
      .length;
  }, [game.DEAD_ANT.length]);

  const numEggs = useMemo(() => {
    return game.EGG
      .map(id => game.entities[id])
      .filter(e => e.playerID == game.playerID)
      .length;
  }, [game.EGG.length]);

  const numLarva = useMemo(() => {
    return game.LARVA
      .map(id => game.entities[id])
      .filter(e => e.playerID == game.playerID)
      .length;
  }, [game.LARVA.length]);

  const numPupa = useMemo(() => {
    return game.PUPA
      .map(id => game.entities[id])
      .filter(e => e.playerID == game.playerID)
      .length;
  }, [game.PUPA.length]);

  return (
    <div
      id="rightCenter"
      style={{
        display: 'inline-block',
        marginLeft: 20,
        verticalAlign: 'top',
      }}
    >
      <div
        style={{
          fontSize: '20px',
        }}
      >
        <b>Stats:</b>
      </div>
      <div>
        <b>Ants: {numAnts}</b>
      </div>
      <div>
        <b>Ants Died: {numKilled}</b>
      </div>
      <div>
        <b>Eggs: {numEggs}</b>
      </div>
      <div>
        <b>Larva: {numLarva}</b>
      </div>
      <div>
        <b>Pupa: {numPupa}</b>
      </div>
    </div>
  );
}

function instructionsModal(dispatch) {
  dispatch({type: 'STOP_TICK'});
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyUp',
    key: 'enter',
    fn: (s) => dismissModal(s.dispatch),
  });
  dispatch({
    type: 'SET_MODAL',
    modal: (<SmantModal
      title="Instructions"
      body={(<span style={{textAlign: 'initial'}}>
        <div>
          <div style={{textAlign: 'center'}}><b>Controls:</b></div>
          Use the arrow keys or WASD to move. Use the buttons to have your queen
          perform actions or press the labelled (KEY) for the corresponding action.
          {isMobile() ? "Use the joystick in the bottom right corner to control the queen" : null}
          &nbsp; Your worker ants behave automatically.
        </div>
        <div>
          <div style={{textAlign: 'center'}}><b>Main Goal:</b></div>
          Kill the enemy critters designated under the "Main Goal" header. On the minimap these
          enemies are highlighted in gold. When these enemies are defeated you win the level.
        </div>
        <div>
          <div style={{textAlign: 'center'}}><b>Secondary Goals:</b></div>
          When you raise the designated number of young queens you get to pick 1 of 5
          species-specific upgrades for your colony. When you locate the trivia tidbit
          somewhere in the world (the box with a question mark) you will get a random
          species-specific upgrade. Make sure to accomplish the secondary goals before
          you finish the main goal or else you will miss out on upgrades!
        </div>
      </span>)}
      buttons={[{label: 'Dismiss (Enter)', onClick: () => {
        dismissModal(dispatch);
      }}]}
    />),
  });
}

function dismissModal(dispatch) {
  dispatch({type: 'DISMISS_MODAL'});
  dispatch({
    type: 'SET_HOTKEY', press: 'onKeyUp',
    key: 'enter',
    fn: (s) => {},
  });
  dispatch({type: 'START_TICK'});
}

module.exports = CampaignTopBar;

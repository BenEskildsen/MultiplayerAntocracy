const React = require('react');
const AudioWidget = require('./Components/AudioWidget.react');
const Button = require('./Components/Button.react');
const Modal = require('./Components/Modal.react');
const SmantModal = require('./Components/SmantModal.react');
const QuitButton = require('../ui/components/QuitButton.react');
const globalConfig = require('../config');
const {
  getLevelYoungQueenTarget
} = require('../selectors/campaignSelectors');
const {
  getTotalYoungQueens
} = require('../selectors/misc');
const {
  getDisplayTime,
  isMobile
} = require('../utils/helpers');
const {
  useMemo,
  useState,
  useEffect
} = React;
function CampaignTopBar(props) {
  var _state$game;
  const {
    store,
    dispatch,
    isExperimental
  } = props;
  const state = store.getState();
  const game = state === null || state === void 0 ? void 0 : state.game;
  const tickInterval = state === null || state === void 0 ? void 0 : (_state$game = state.game) === null || _state$game === void 0 ? void 0 : _state$game.tickInterval;
  if (isExperimental && tickInterval == null) {
    return null;
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
  let youngQueenHTML = /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "Young Queens: ", numYoungQueens, " / ", targetNum));
  if (game.upgradedYoungQueens) {
    youngQueenHTML = /*#__PURE__*/React.createElement("s", null, youngQueenHTML);
  }
  let triviaHTML = /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "Trivia Located: ", game.triviaLocated ? 1 : 0, " / 1"));
  if (game.triviaLocated) {
    triviaHTML = /*#__PURE__*/React.createElement("s", null, triviaHTML);
  }
  const goalCritters = {};
  for (const critterID in game.GOAL_CRITTER) {
    const critter = game.entities[critterID];
    let cType = critter.type.slice(0, 4) == 'DEAD' ? critter.type.slice(5) : critter.type;
    if (!goalCritters[cType]) {
      goalCritters[cType] = {
        dead: 0,
        total: 1
      };
    } else {
      goalCritters[cType].total += 1;
    }
    if (critter.hp <= 0) {
      goalCritters[cType].dead += 1;
    }
  }
  const goalCrittersHTML = [];
  for (const critterGoal in goalCritters) {
    const {
      dead,
      total
    } = goalCritters[critterGoal];
    let critterLabel = critterGoal;
    if (critterGoal == 'ANT') {
      critterLabel = 'QUEEN ANT';
    } else if (critterGoal == 'TERMITE') {
      critterLabel = 'QUEEN TERMITE';
    }
    const row = /*#__PURE__*/React.createElement("div", {
      key: "critterGoal_" + critterGoal
    }, /*#__PURE__*/React.createElement("b", null, critterLabel, ": ", dead, " / ", total));
    if (dead >= total) {
      goalCrittersHTML.push( /*#__PURE__*/React.createElement("s", {
        key: "strike_" + critterGoal
      }, row));
    } else {
      goalCrittersHTML.push(row);
    }
  }
  ///////////////////

  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: topPadding,
      height,
      width: '100%',
      zIndex: 2,
      textShadow: '-1px -1px 0 #FFF, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      float: 'left',
      paddingLeft: 8,
      pointerEvents: 'all'
    }
  }, /*#__PURE__*/React.createElement(QuitButton, {
    isInGame: true,
    dispatch: dispatch,
    store: store
  }), /*#__PURE__*/React.createElement(AudioWidget, {
    audioFiles: globalConfig.config.campaignAudioFiles,
    isShuffled: false,
    isMuted: state.isMuted,
    setIsMuted: () => {
      store.dispatch({
        type: 'SET_IS_MUTED',
        isMuted: !state.isMuted
      });
    },
    style: {}
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    label: "Instructions",
    onClick: () => {
      instructionsModal(dispatch);
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    label: tickInterval ? 'Pause' : 'Play',
    disabled: state.modal != null,
    onClick: () => {
      if (tickInterval != null) {
        dispatch({
          type: 'STOP_TICK'
        });
      } else {
        dispatch({
          type: 'START_TICK'
        });
      }
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      float: 'right',
      paddingRight: 8,
      pointerEvents: 'all'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    label: "+",
    onClick: () => dispatch({
      type: 'SWAP_MINI_MAP'
    })
  })), /*#__PURE__*/React.createElement("div", {
    id: "centerTopbar",
    style: {
      left: leftPadding,
      position: 'absolute'
    }
  }, /*#__PURE__*/React.createElement("div", {
    id: "leftCenter",
    style: {
      display: 'inline-block'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '24px'
    }
  }, /*#__PURE__*/React.createElement("b", null, "Main Goal:"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'initial'
    }
  }, goalCrittersHTML)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '20px'
    }
  }, /*#__PURE__*/React.createElement("b", null, "Secondary Goals:"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'initial'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "(Complete to Earn Upgrades)")), youngQueenHTML, triviaHTML))), /*#__PURE__*/React.createElement(StatsCard, {
    game: game
  })));
}
function StatsCard(props) {
  const {
    game
  } = props;
  const numAnts = useMemo(() => {
    return game.ANT.map(id => game.entities[id]).filter(a => a.playerID == game.playerID).length;
  }, [game.ANT.length]);
  const numKilled = useMemo(() => {
    return game.DEAD_ANT.map(id => game.entities[id]).filter(a => a.playerID == game.playerID).length;
  }, [game.DEAD_ANT.length]);
  const numEggs = useMemo(() => {
    return game.EGG.map(id => game.entities[id]).filter(e => e.playerID == game.playerID).length;
  }, [game.EGG.length]);
  const numLarva = useMemo(() => {
    return game.LARVA.map(id => game.entities[id]).filter(e => e.playerID == game.playerID).length;
  }, [game.LARVA.length]);
  const numPupa = useMemo(() => {
    return game.PUPA.map(id => game.entities[id]).filter(e => e.playerID == game.playerID).length;
  }, [game.PUPA.length]);
  return /*#__PURE__*/React.createElement("div", {
    id: "rightCenter",
    style: {
      display: 'inline-block',
      marginLeft: 20,
      verticalAlign: 'top'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '20px'
    }
  }, /*#__PURE__*/React.createElement("b", null, "Stats:")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "Ants: ", numAnts)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "Ants Died: ", numKilled)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "Eggs: ", numEggs)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "Larva: ", numLarva)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "Pupa: ", numPupa)));
}
function instructionsModal(dispatch) {
  dispatch({
    type: 'STOP_TICK'
  });
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyUp',
    key: 'enter',
    fn: s => dismissModal(s.dispatch)
  });
  dispatch({
    type: 'SET_MODAL',
    modal: /*#__PURE__*/React.createElement(SmantModal, {
      title: "Instructions",
      body: /*#__PURE__*/React.createElement("span", {
        style: {
          textAlign: 'initial'
        }
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: 'center'
        }
      }, /*#__PURE__*/React.createElement("b", null, "Controls:")), "Use the arrow keys or WASD to move. Use the buttons to have your queen perform actions or press the labelled (KEY) for the corresponding action.", isMobile() ? "Use the joystick in the bottom right corner to control the queen" : null, "\xA0 Your worker ants behave automatically."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: 'center'
        }
      }, /*#__PURE__*/React.createElement("b", null, "Main Goal:")), "Kill the enemy critters designated under the \"Main Goal\" header. On the minimap these enemies are highlighted in gold. When these enemies are defeated you win the level."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: 'center'
        }
      }, /*#__PURE__*/React.createElement("b", null, "Secondary Goals:")), "When you raise the designated number of young queens you get to pick 1 of 5 species-specific upgrades for your colony. When you locate the trivia tidbit somewhere in the world (the box with a question mark) you will get a random species-specific upgrade. Make sure to accomplish the secondary goals before you finish the main goal or else you will miss out on upgrades!")),
      buttons: [{
        label: 'Dismiss (Enter)',
        onClick: () => {
          dismissModal(dispatch);
        }
      }]
    })
  });
}
function dismissModal(dispatch) {
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
}
module.exports = CampaignTopBar;
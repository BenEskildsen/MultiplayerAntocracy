const React = require('react');
const Divider = require('../ui/components/Divider.react');
const ItchLink = require('../ui/components/ItchLink.react');
const Modal = require('../ui/components/Modal.react');
const SmantModal = require('../ui/components/SmantModal.react');
const Button = require('../ui/components/Button.react');
const globalConfig = require('../config');
const {
  lookupInGrid
} = require('../utils/gridHelpers');
const {
  add
} = require('../utils/vectors');
const {
  getQueen,
  getTotalYoungQueens
} = require('../selectors/misc');
const {
  render
} = require('../render/render');
const {
  getDisplayTime
} = require('../utils/helpers');
const {
  isElectron
} = require('../utils/helpers');
const {
  getNumLevels
} = require('../selectors/campaignSelectors');
const {
  registerSession,
  postScore
} = require('../thunks/clientToServerThunks');
const {
  useState
} = React;

/**
 * Checks the state every tick for game-over conditions, then orchestrates
 * transition out of the level on win or loss
 *
 * Can short-circuit the game-over checks by setting the gameOver flag on the
 * game directly or with the SET_GAME_OVER action
 */
const initGameOverSystem = store => {
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
    if (game.time == 0) return;
    time = game.time;
    if (!state.campaign.isCampaign && !game.isExperimental) {
      freePlayWinConditions(store, dispatch, state);
      return;
    }

    // win
    // check goalCritters
    let killedAllGoalCritters = false;
    if (Object.keys(game.GOAL_CRITTER).length > 0) {
      killedAllGoalCritters = true;
      for (const critterID in game.GOAL_CRITTER) {
        const critter = game.entities[critterID];
        if (critter.hp > 0) {
          killedAllGoalCritters = false;
        }
      }
    }
    if (game.gameOver == 'win' || killedAllGoalCritters) {
      if (state.campaign.level >= getNumLevels()) {
        campaignWon(store, dispatch, state);
      } else {
        campaignLevelWon(store, dispatch, state);
      }
    }

    // lose
    const playerQueen = getQueen(game, game.playerID);
    if (game.gameOver == 'lose' || playerQueen == null || playerQueen.type == 'DEAD_ANT') {
      handleGameLoss(store, dispatch, state, 'queen dead');
    }
  });
};

/////////////////////////////////////////////////////////////////////////
// Campaign Win Conditions
/////////////////////////////////////////////////////////////////////////

const campaignWon = (store, dispatch, state) => {
  const game = state.game;
  const map = state.campaign.levelName;
  registerSession(state, 'won_campaign_level');

  // relevant ant stats
  const numYoungQueens = getTotalYoungQueens(game);
  const totalAnts = game.ANT.map(id => game.entities[id]).filter(a => a.playerID == game.playerID).length;
  dispatch({
    type: 'STOP_TICK'
  });
  dispatch({
    type: 'SET_CURRENT_LEVEL_WON'
  });
  dispatch({
    type: 'SET_GAME_OVER',
    gameOver: null
  });
  const returnButton = {
    label: 'Back to Main Menu',
    onClick: () => {
      // local high score
      let localScores = JSON.parse(localStorage.getItem('scores'));
      localStorage.setItem('scores', JSON.stringify({
        ...localScores,
        [map]: [...localScores[map], {
          queens: numYoungQueens,
          ticks: getDisplayTime(game.ticksAtWin * globalConfig.config.msPerTick),
          game_time: getDisplayTime(game.totalGameTime),
          ants: totalAnts,
          species: state.campaign.species
        }]
      }));
      dispatch({
        type: 'DISMISS_MODAL'
      });
      dispatch({
        type: 'RETURN_TO_LOBBY'
      });
    }
  };
  const firstWin = !localStorage.getItem('wonCampaign');
  dispatch({
    type: 'SET_MODAL',
    modal: /*#__PURE__*/React.createElement(SmantModal, {
      title: 'Campaign Won!',
      body: /*#__PURE__*/React.createElement("div", null, "Congratulations! Your colony has defeated all competition and now rules the land.", /*#__PURE__*/React.createElement("div", null, firstWin ? "For beating the campaign, you've unlocked an additional species to play as!" : null), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(RecordScore, {
        dispatch: dispatch,
        numYoungQueens: numYoungQueens,
        totalGameTime: game.totalGameTime,
        totalAnts: totalAnts,
        species: state.campaign.species,
        map: map
      }), /*#__PURE__*/React.createElement(Divider, null)),
      buttons: [returnButton]
    })
  });

  // set campaign-winning state
  localStorage.setItem('wonCampaign', true);
  dispatch({
    type: 'CLEAR_SAVED_CAMPAIGN'
  });
};
const campaignLevelWon = (store, dispatch, state) => {
  const game = state.game;
  const map = state.campaign.levelName;
  registerSession(state, 'won_campaign_level');

  // relevant ant stats
  const numYoungQueens = getTotalYoungQueens(game);
  const totalAnts = game.ANT.map(id => game.entities[id]).filter(a => a.playerID == game.playerID).length;
  dispatch({
    type: 'STOP_TICK'
  });
  dispatch({
    type: 'SET_CURRENT_LEVEL_WON'
  });
  dispatch({
    type: 'SET_GAME_OVER',
    gameOver: null
  });
  const resetButton = {
    label: 'Reset',
    onClick: () => {
      dispatch({
        type: 'DISMISS_MODAL'
      });
      dispatch({
        type: 'SET_PLAYERS_AND_SIZE'
      });
      render(store.getState().game); // HACK for level editor
    }
  };

  const nextLevelButton = {
    label: "Continue",
    onClick: () => {
      // save the upgrades you got in this level
      if (state.screen != 'EDITOR') {
        localStorage.setItem('curCampaign', JSON.stringify(state.campaign));
      }
      dispatch({
        type: 'SET_SCREEN',
        screen: 'OVERWORLD'
      });
      dispatch({
        type: 'DISMISS_MODAL'
      });

      // local high score
      let localScores = JSON.parse(localStorage.getItem('scores'));
      localStorage.setItem('scores', JSON.stringify({
        ...localScores,
        [map]: [...localScores[map], {
          queens: numYoungQueens,
          ticks: getDisplayTime(game.ticksAtWin * globalConfig.config.msPerTick),
          game_time: getDisplayTime(game.totalGameTime),
          ants: totalAnts,
          species: state.campaign.species
        }]
      }));
    }
  };
  dispatch({
    type: 'SET_MODAL',
    modal: /*#__PURE__*/React.createElement(SmantModal, {
      title: 'Level Won',
      body: /*#__PURE__*/React.createElement(RecordScore, {
        dispatch: dispatch,
        numYoungQueens: numYoungQueens,
        totalGameTime: game.totalGameTime,
        totalAnts: totalAnts,
        species: state.campaign.species,
        map: map
      }),
      buttons: [game.isExperimental ? resetButton : nextLevelButton]
    })
  });
};

/////////////////////////////////////////////////////////////////////////
// Free Play Win Conditions
/////////////////////////////////////////////////////////////////////////

const freePlayWinConditions = (store, dispatch, state) => {
  const game = state.game;
  // handle hitting ants to win
  const numAnts = game.ANT.map(id => game.entities[id]).filter(a => a.playerID == game.playerID).length;
  if (game.gameOver == 'hit_250' || numAnts >= globalConfig.config.antsToWin && !game.inCountdown && !game.afterCountdown) {
    handleGameWon(store, dispatch, state, 'ants to win');
  }

  // handle top score at the end of the countdown
  if (game.gameOver == 'win' || game.afterCountdown && game.inCountdown) {
    handleCountdownOver(store, dispatch, state);
  }

  // loss conditions
  const playerQueen = getQueen(game, game.playerID);
  if (game.gameOver == 'lose' || playerQueen == null || playerQueen.type == 'DEAD_ANT') {
    handleGameLoss(store, dispatch, state, 'queen dead');
  }
};
const handleCountdownOver = (store, dispatch, state) => {
  const {
    game
  } = state;
  registerSession(state, 'win');
  dispatch({
    type: 'SWAP_MINI_MAP'
  });
  dispatch({
    type: 'STOP_TICK'
  });
  dispatch({
    type: 'END_COUNTDOWN'
  });
  const numYoungQueens = game.ANT.map(id => game.entities[id]).filter(a => a.playerID == game.playerID && a.caste == 'YOUNG_QUEEN').length;
  const totalAnts = game.ANT.map(id => game.entities[id]).filter(a => a.playerID == game.playerID).length;
  const returnButton = {
    label: 'Back to Main Menu',
    onClick: () => {
      dispatch({
        type: 'DISMISS_MODAL'
      });
      let localScores = JSON.parse(localStorage.getItem('scores'));
      localStorage.setItem('scores', JSON.stringify({
        ...localScores,
        [map]: [...localScores[map], {
          queens: numYoungQueens,
          ticks: getDisplayTime(game.ticksAtWin * globalConfig.config.msPerTick),
          game_time: getDisplayTime(game.totalGameTime),
          ants: totalAnts
        }]
      }));
      dispatch({
        type: 'RETURN_TO_LOBBY'
      });
    }
  };
  const resetButton = {
    label: 'Reset',
    onClick: () => {
      dispatch({
        type: 'DISMISS_MODAL'
      });
      dispatch({
        type: 'SET_PLAYERS_AND_SIZE'
      });
      render(store.getState().game); // HACK for level editor
    }
  };

  const contButton = {
    label: 'Keep Playing For Fun',
    onClick: () => {
      dispatch({
        type: 'DISMISS_MODAL'
      });
      let localScores = JSON.parse(localStorage.getItem('scores'));
      localStorage.setItem('scores', JSON.stringify({
        ...localScores,
        [map]: [...localScores[map], {
          queens: numYoungQueens,
          ticks: getDisplayTime(game.ticksAtWin * globalConfig.config.msPerTick),
          game_time: getDisplayTime(game.totalGameTime),
          ants: totalAnts
        }]
      }));
      dispatch({
        type: 'START_TICK'
      });
    }
  };
  const buttons = [returnButton, contButton];
  if (state.screen == 'EDITOR') {
    buttons.push(resetButton);
  }
  const map = state.campaign.levelName.slice(0, -5);
  dispatch({
    type: 'SET_MODAL',
    modal: /*#__PURE__*/React.createElement(Modal, {
      title: 'Thank you for playing antocracy.io!',
      body: /*#__PURE__*/React.createElement(RecordScore, {
        dispatch: dispatch,
        numYoungQueens: numYoungQueens,
        totalGameTime: game.totalGameTime,
        totalAnts: totalAnts,
        species: state.campaign.species,
        map: map
      }),
      buttons: buttons
    })
  });
};
const RecordScore = props => {
  const {
    dispatch,
    numYoungQueens,
    totalGameTime,
    totalAnts,
    map,
    queenDead,
    species
  } = props;
  const antsToWin = globalConfig.config.antsToWin;
  const [name, setName] = useState(localStorage.getItem('name') || '');
  const [nameMessage, setNameMessage] = useState(null);
  const [scoreRegistered, setScoreRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const score = {
    queens: numYoungQueens,
    game_time: totalGameTime,
    ants: totalAnts,
    map,
    species
  };
  let message = "You raised " + totalAnts + " ants and " + numYoungQueens + " Young Queens! " + " If you want, you can add a name and register your score for the leaderboards. ";
  if (queenDead) {
    message = "However, you still raised over " + antsToWin + " ants, and " + numYoungQueens + " Young Queens. So if you want you can add a name and register " + "your score for the leaderboards before you return to the main menu.";
  }
  const linkMessage = /*#__PURE__*/React.createElement("div", null, "If you liked this game (or have suggestions for improvements), please leave a review or comment on its ", /*#__PURE__*/React.createElement(ItchLink, {
    campaignLink: isElectron()
  }));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, message), /*#__PURE__*/React.createElement("div", null, "Name:", /*#__PURE__*/React.createElement("input", {
    type: "text",
    style: {
      width: 100
    },
    value: name,
    onChange: ev => {
      setName(ev.target.value);
      setNameMessage(null);
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, nameMessage)), /*#__PURE__*/React.createElement(Button, {
    disabled: name == '' || scoreRegistered || registering,
    label: registering ? "Registering Score" : "Register Score",
    onClick: () => {
      setRegistering(true);
      const localUser = name === localStorage.getItem('name');
      postScore({
        username: name,
        localUser,
        ...score
      }).then(res => {
        localStorage.setItem('name', name);
        localStorage.setItem('score', score);
        setScoreRegistered(true);
        setNameMessage("Score registered");
        setRegistering(false);
      }).catch(err => {
        setRegistering(false);
        setNameMessage("This name is already taken");
      });
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '4px',
      marginTop: '4px'
    }
  }, /*#__PURE__*/React.createElement(Divider, null)), linkMessage, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: '4px',
      marginTop: '4px'
    }
  }));
};
const handleGameLoss = (store, dispatch, state, reason) => {
  const {
    game
  } = state;
  registerSession(state, 'lose');
  dispatch({
    type: 'STOP_TICK'
  });
  const numYoungQueens = getTotalYoungQueens(game);
  const totalAnts = game.ANT.map(id => game.entities[id]).filter(a => a.playerID == game.playerID).length;
  const map = state.campaign.levelName.slice(0, -5);
  const returnButton = {
    label: 'Back to Main Menu',
    onClick: () => {
      dispatch({
        type: 'DISMISS_MODAL'
      });
      dispatch({
        type: 'RETURN_TO_LOBBY'
      });
    }
  };
  const resetButton = {
    label: 'Reset',
    onClick: () => {
      dispatch({
        type: 'DISMISS_MODAL'
      });
      dispatch({
        type: 'SET_PLAYERS_AND_SIZE'
      });
      render(store.getState().game); // HACK for level editor
    }
  };

  const buttons = [returnButton];
  if (state.screen == 'EDITOR') {
    buttons.push(resetButton);
  }
  const body = /*#__PURE__*/React.createElement("div", null, "The queen is dead! Ant colonies can't survive without their queen.", !game.inCountdown ? null : /*#__PURE__*/React.createElement(RecordScore, {
    dispatch: dispatch,
    numYoungQueens: numYoungQueens,
    totalGameTime: game.totalGameTime,
    totalAnts: totalAnts,
    queenDead: true,
    map: map
  }));
  dispatch({
    type: 'SET_MODAL',
    modal: /*#__PURE__*/React.createElement(Modal, {
      title: 'Game Over',
      body: body,
      buttons: buttons
    })
  });
};
const handleGameWon = (store, dispatch, state, reason) => {
  const {
    game
  } = state;
  registerSession(state, 'hit_250');
  dispatch({
    type: 'STOP_TICK'
  });

  // set screen size  to be zoomed out
  // let ratio = game.viewHeight / game.viewWidth;
  // let viewWidth = game.gridWidth;
  // let viewHeight = viewWidth * ratio;
  // dispatch({type: 'SET_VIEW_POS',
  //   viewPos: {x: 0, y: 0}, viewWidth, viewHeight, rerender: true,
  // });

  const antsToWin = globalConfig.config.antsToWin;
  const message = "You created " + antsToWin + " ants! You now have 10 minutes to go for " + " a high score by raising as many young queens as you can.";
  const contButton = {
    label: 'Continue to High Score',
    onClick: () => {
      dispatch({
        type: 'DISMISS_MODAL'
      });
      dispatch({
        type: 'SET_HIT_ANTS_TO_WIN'
      });
      dispatch({
        type: 'START_TICK'
      });
    }
  };
  const resetButton = {
    label: 'Reset',
    onClick: () => {
      dispatch({
        type: 'DISMISS_MODAL'
      });
      dispatch({
        type: 'SET_PLAYERS_AND_SIZE'
      });
      render(store.getState().game); // HACK for level editor
    }
  };

  const buttons = [contButton];
  if (state.screen == 'EDITOR') {
    buttons.push(resetButton);
  }
  dispatch({
    type: 'SET_MODAL',
    modal: /*#__PURE__*/React.createElement(Modal, {
      title: 'Level Won',
      body: message,
      buttons: buttons
    })
  });
};
module.exports = {
  initGameOverSystem
};
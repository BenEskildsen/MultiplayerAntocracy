const React = require('react');
const Button = require('./Components/Button.react');
const Canvas = require('./Canvas.react');
const Checkbox = require('./Components/Checkbox.react');
const RadioPicker = require('./Components/RadioPicker.react');
const Joystick = require('./Joystick.react');
const AbilityControls = require('./AbilityControls.react');
const TopBar = require('./TopBar.react');
const CampaignTopBar = require('./CampaignTopBar.react');
const {
  makeAction,
  isActionTypeQueued
} = require('../simulation/actionQueue');
const {
  config
} = require('../config');
const {
  initMouseControlsSystem
} = require('../systems/mouseControlsSystem');
const {
  initGameOverSystem
} = require('../systems/gameOverSystem');
const {
  initSpriteSheetSystem
} = require('../systems/spriteSheetSystem');
const {
  initCPUColonySystem
} = require('../systems/cpuColonySystem');
const {
  initTutorialSystem
} = require('../systems/tutorialSystem');
const {
  initRainSystem
} = require('../systems/rainSystem');
const {
  initPheromoneWorkerSystem
} = require('../systems/pheromoneWorkerSystem');
const {
  initUpgradeSystem
} = require('../systems/upgradeSystem');
const {
  initKeyboardControlsSystem,
  clearHotkeys
} = require('../systems/keyboardControlsSystem');
const ExperimentalSidebar = require('./ExperimentalSidebar.react');
const {
  layEgg,
  markDirt,
  bite,
  dash,
  markChamber,
  markDirtPutdown
} = require('../thunks/queenThunks');
const {
  getQueen,
  getQueenBiteAction
} = require('../selectors/misc');
const {
  useEffect,
  useState,
  useMemo,
  Component,
  memo
} = React;
const {
  add,
  subtract
} = require('../utils/vectors');
const {
  lookupInGrid,
  insideGrid
} = require('../utils/gridHelpers');
const {
  makeToken
} = require('../entities/makeEntity');
const {
  clamp,
  isMobile,
  isIpad
} = require('../utils/helpers');
const globalConfig = require('../config');
const {
  dispatchToServer
} = require('../clientToServer');
function Game(props) {
  const {
    dispatch,
    store,
    isInLevelEditor,
    gameID,
    tickInterval
  } = props;
  const state = store.getState();

  // init systems
  useEffect(() => {
    // trying to prevent pinch zoom
    document.addEventListener('touchmove', function (ev) {
      if (ev.scale !== 1) {
        ev.preventDefault();
      }
    }, {
      passive: false
    });
    document.addEventListener('gesturestart', function (ev) {
      ev.preventDefault();
    }, {
      passive: false
    });
  }, []);
  useEffect(() => {
    initKeyboardControlsSystem(store);
    if (tickInterval != null) {
      initGameOverSystem(store);
    }
    // initPheromoneWorkerSystem(store);
    // initTutorialSystem(store);
    initUpgradeSystem(store);
    registerHotkeys(dispatch);
    const handlers = {
      // rightDown: (state, dispatch, gridPos) => {
      //   const token = state.game.TOKEN
      //     .map(id => state.game.entities[id])
      //     .filter(t => t.pheromoneType == 'QUEEN_FOLLOW' && t.playerID == state.game.playerID)[0];
      //   if (token != null) {
      //     dispatch({type: 'DELETE_ENTITY', entity: token});
      //   }
      // },
      leftDown: (state, dispatch, gridPos) => {
        // const token = state.game.TOKEN
        //   .map(id => state.game.entities[id])
        //   .filter(t => t.pheromoneType == 'QUEEN_FOLLOW' && t.playerID == state.game.playerID)[0];
        // if (token != null) {
        //   dispatch({type: 'DELETE_ENTITY', entity: token});
        // }

        const queen = getQueen(state.game, state.game.playerID);
        if ((queen === null || queen === void 0 ? void 0 : queen.selectedAbility) != 'CREATE_RAID') return;
        if (!(queen !== null && queen !== void 0 && queen.abilityActive)) return;
        if (state.game.raidCooldown > 0) return;
        if (!insideGrid(state.game.grid, gridPos)) return;
        dispatch({
          type: 'CREATE_ENTITY',
          entity: makeToken(state.game, gridPos, state.game.playerID, 'RAID_PHER')
        });
        dispatch({
          type: 'SET',
          property: 'raidCooldown',
          value: globalConfig.config.raidCooldown
        });
        dispatch({
          type: 'SET',
          property: 'raidTime',
          value: globalConfig.config.raidTime
        });
        dispatch({
          type: 'SET_ABILITY_ACTIVE',
          active: false,
          playerID: queen.playerID
        });
        if (state.game.maxMinimap) {
          // dispatch({type: 'SWAP_MINI_MAP'});
        }
      }
    };
    initMouseControlsSystem(store, handlers);
    // initSpriteSheetSystem(store);
    // initRainSystem(store);
    return () => {
      clearHotkeys();
    };
  }, [gameID, tickInterval]);

  // ---------------------------------------------
  // memoizing UI stuff here
  // ---------------------------------------------
  const {
    game
  } = state;
  const queen = getQueen(game, game.playerID);
  const numAnts = useMemo(() => {
    return game.ANT.map(id => game.entities[id]).filter(a => a.playerID == game.playerID).length;
  }, [game.ANT.length]);
  const numYoungQueens = useMemo(() => {
    return game.ANT.map(id => game.entities[id]).filter(a => a.playerID == game.playerID && a.caste == 'YOUNG_QUEEN').length;
  }, [game.ANT.length]);
  const numKilled = useMemo(() => {
    return game.DEAD_ANT.map(id => game.entities[id]).filter(a => a.playerID == game.playerID).length;
  }, [game.DEAD_ANT.length]);
  const enemiesKilled = useMemo(() => {
    return game.DEAD_ANT.map(id => game.entities[id]).filter(a => a.playerID != game.playerID).length;
  }, [game.DEAD_ANT.length]);
  const enemyTermitesKilled = game.DEAD_TERMITE.length;
  const elem = document.getElementById('background');
  const dims = useMemo(() => {
    const dims = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    if (isInLevelEditor && elem != null) {
      const slider = document.getElementById('sliderBar');
      const editor = document.getElementById('levelEditor');
      let sliderWidth = slider != null ? slider.getBoundingClientRect().width : 0;
      let editorWidth = editor != null ? editor.getBoundingClientRect().width : 0;
      dims.width = dims.width - sliderWidth - editorWidth;
    }
    return dims;
  }, [window.innerWidth, window.innerHeight, elem != null]);
  return /*#__PURE__*/React.createElement("div", {
    className: "background",
    id: "background",
    style: {
      position: 'relative'
    }
  }, state.screen == 'EDITOR' ? /*#__PURE__*/React.createElement(ExperimentalSidebar, {
    state: state,
    dispatch: dispatch
  }) : null, /*#__PURE__*/React.createElement(Canvas, {
    dispatch: dispatch,
    tickInterval: tickInterval,
    queen: queen,
    innerWidth: dims.width,
    innerHeight: dims.height,
    isExperimental: false,
    megaColony: game.config[game.playerID].megaColony
  }), state.campaign.isCampaign ? /*#__PURE__*/React.createElement(CampaignTopBar, {
    store: store,
    dispatch: dispatch,
    isExperimental: props.isInLevelEditor
  }) : /*#__PURE__*/React.createElement(TopBar, {
    dispatch: dispatch,
    store: store,
    numAnts: numAnts,
    numKilled: numKilled,
    enemiesKilled: enemiesKilled,
    enemyTermitesKilled: enemyTermitesKilled,
    numYoungQueens: numYoungQueens,
    upgradedAt: game.upgradedAt,
    isExperimental: props.isInLevelEditor,
    tickInterval: state.game.tickInterval,
    modal: state.modal,
    innerWidth: window.innerWidth,
    isMuted: state.isMuted,
    inCountdown: game.inCountdown,
    countdownMillis: game.countdownMillis
  }), /*#__PURE__*/React.createElement(ControlButtons, {
    dispatch: dispatch,
    isExperimental: props.isInLevelEditor,
    game: game,
    queen: queen
  }));
}
function registerHotkeys(dispatch) {
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyDown',
    key: 'E',
    fn: s => {
      const game = s.getState().game;
      bite(dispatch, game);
    }
  });
  // TODO: move pheromone controls to queen thunks
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyDown',
    key: 'R',
    fn: s => {
      const game = s.getState().game;
      const queen = getQueen(game, game.playerID);
      const active = queen.selectedAbility == 'AUTOPILOT' ? !!!queen.autopilot : true;
      if (queen.selectedAbility == 'CREATE_RAID' && game.raidCooldown > 0) {
        return;
      }
      dispatch({
        type: 'SET_ABILITY_ACTIVE',
        active,
        playerID: queen.playerID
      });
      dispatchToServer({
        type: 'SET_ABILITY_ACTIVE',
        active,
        playerID: queen.playerID,
        time: game.time
      });
      if (queen.selectedAbility === 'MARK_DIRT') {
        markDirt(dispatch, game, game.playerID);
      }
      if (queen.selectedAbility === 'MARK_CHAMBER') {
        markChamber(dispatch, game, game.playerID);
      }
      if (queen.selectedAbility === 'MARK_DIRT_PUTDOWN') {
        markDirtPutdown(dispatch, game, game.playerID);
      }
      if (queen.selectedAbility == 'JUMP') {
        dash(dispatch, game);
      }
      if (queen.selectedAbility == 'WHIRLWIND') {
        if (!isActionTypeQueued(queen, 'WHIRLWIND')) {
          const entityAction = makeAction(game, queen, 'WHIRLWIND');
          dispatch({
            type: 'ENQUEUE_ENTITY_ACTION',
            entity: queen,
            entityAction
          });
          dispatchToServer({
            type: 'ENQUEUE_ENTITY_ACTION',
            entity: queen,
            entityAction,
            time: game.time
          });
        }
      }
    }
  });
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyUp',
    key: 'R',
    fn: s => {
      const game = s.getState().game;
      const queen = getQueen(game, game.playerID);
      if (queen.selectedAbility != 'AUTOPILOT' && queen.selectedAbility != 'CREATE_RAID') {
        dispatch({
          type: 'SET_ABILITY_ACTIVE',
          active: false,
          playerID: queen.playerID
        });
        dispatchToServer({
          type: 'SET_ABILITY_ACTIVE',
          active: false,
          playerID: queen.playerID,
          time: game.time
        });
      }
    }
  });
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyDown',
    key: 'F',
    fn: s => {
      const game = s.getState().game;
      const queen = getQueen(game, game.playerID);
      dispatch({
        type: 'SET_PHEROMONE_ACTIVE',
        active: !queen.pheromoneActive,
        playerID: queen.playerID
      });
      dispatchToServer({
        type: 'SET_PHEROMONE_ACTIVE',
        active: !queen.pheromoneActive,
        playerID: queen.playerID,
        time: game.time
      });
    }
  });
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyDown',
    key: 'V',
    fn: s => {
      const game = s.getState().game;
      layEgg(s.dispatch, game, game.playerID);
    }
  });
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyDown',
    key: 'T',
    fn: s => {
      const game = s.getState().game;
      const queen = getQueen(game, game.playerID);
      const abilityIndex = game.config[queen.playerID].queenAbilities.indexOf(queen.selectedAbility);
      const abilityLength = game.config[queen.playerID].queenAbilities.length;
      s.dispatch({
        type: 'SET_SELECTED_ABILITY',
        playerID: queen.playerID,
        ability: game.config[queen.playerID].queenAbilities[(abilityIndex + 1) % abilityLength]
      });
      dispatchToServer({
        type: 'SET_SELECTED_ABILITY',
        playerID: queen.playerID,
        ability: game.config[queen.playerID].queenAbilities[(abilityIndex + 1) % abilityLength],
        time: game.time
      });
    }
  });
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyDown',
    key: 'G',
    fn: s => {
      const game = s.getState().game;
      const queen = getQueen(game, game.playerID);
      const pherIndex = game.config[queen.playerID].queenPheromones.indexOf(queen.selectedPheromone);
      const pherLength = game.config[queen.playerID].queenPheromones.length;
      s.dispatch({
        type: 'SET_SELECTED_PHEROMONE',
        playerID: queen.playerID,
        pheromone: game.config[queen.playerID].queenPheromones[(pherIndex + 1) % pherLength]
      });
      dispatchToServer({
        type: 'SET_SELECTED_PHEROMONE',
        playerID: queen.playerID,
        time: game.time,
        pheromone: game.config[queen.playerID].queenPheromones[(pherIndex + 1) % pherLength]
      });
    }
  });
  dispatch({
    type: 'SET_HOTKEY',
    press: 'onKeyDown',
    key: 'B',
    fn: s => {
      const game = s.getState().game;
      const queen = getQueen(game, game.playerID);
      const casteIndex = game.config[queen.playerID].queenLayingCastes.indexOf(queen.selectedCaste);
      const casteLength = game.config[queen.playerID].queenLayingCastes.length;
      s.dispatch({
        type: 'SET_LAYING_CASTE',
        playerID: queen.playerID,
        caste: game.config[queen.playerID].queenLayingCastes[(casteIndex + 1) % casteLength]
      });
      dispatchToServer({
        type: 'SET_LAYING_CASTE',
        playerID: queen.playerID,
        time: game.time,
        caste: game.config[queen.playerID].queenLayingCastes[(casteIndex + 1) % casteLength]
      });
    }
  });
}
function ControlButtons(props) {
  const {
    dispatch,
    game,
    queen,
    isExperimental
  } = props;
  const height = 150;
  const padding = 4;
  if (isExperimental && game.tickInterval == null) {
    return null;
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: isIpad() ? config.canvasHeight / 2 : config.canvasHeight - height,
      height,
      width: config.canvasWidth - 2 * padding,
      left: game.isExperimental ? 510 : 0,
      pointerEvents: isMobile() ? 'auto' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      marginLeft: 4
    }
  }, /*#__PURE__*/React.createElement(AbilityControls, props)), /*#__PURE__*/React.createElement("div", {
    style: {
      float: 'right'
    }
  }, isMobile() ? /*#__PURE__*/React.createElement(Joystick, {
    dispatch: dispatch
  }) : null));
}
module.exports = Game;
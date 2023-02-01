const {
  initState
} = require('../state/state');
const {
  initGameState,
  initBaseState
} = require('../state/gameState');
const {
  tickReducer
} = require('./serverTickReducer');
const {
  gameReducer
} = require('./gameReducer');
const {
  mouseReducer
} = require('./mouseReducer');
const {
  hotKeysReducer
} = require('./hotKeysReducer');
const {
  modalReducer
} = require('./modalReducer');
const {
  campaignReducer
} = require('./campaignReducer');
const {
  makeAnt,
  makeToken,
  makeSeed
} = require('../entities/makeEntity');
const {
  addEntity
} = require('../simulation/entityOperations');
const {
  sameArray
} = require('../utils/helpers');
const {
  getQueen
} = require('../selectors/misc');
const {
  add
} = require('../utils/vectors');
const levels = require('../levels/levels');
const {
  getSession
} = require('../selectors/sessions');
const {
  emitToSession
} = require('../../server/sessions');
const rootReducer = (serverState, action, clientID, socket, dispatch) => {
  const {
    sessions,
    socketClients,
    clientToSession
  } = serverState;
  let state = sessions[clientToSession[clientID]];

  // emulate enhanced reducer by merging actions without a type
  if (action.type === 'MERGE') {
    delete action.type;
    return {
      ...state,
      ...action
    };
  }
  switch (action.type) {
    case 'START':
      {
        var _state, _state$campaign, _state2, _state2$campaign, _state3, _state3$campaign, _state4, _state4$campaign, _state5, _state5$campaign;
        const {
          screen,
          isExperimental,
          isCampaign
        } = action;
        const game = initBaseState({
          x: 25,
          y: 25
        }, 2, [((_state = state) === null || _state === void 0 ? void 0 : (_state$campaign = _state.campaign) === null || _state$campaign === void 0 ? void 0 : _state$campaign.species) || 'Marauder Ants', 'Leaf Cutter Ants'], clientID, state.clients);
        game.session = state;
        game.socketClients = socketClients;
        game.clientID = clientID;
        game.isExperimental = isExperimental;
        game.sprites = {
          ...state.sprites
        };
        return {
          ...state,
          // isMuted: !state.interactedWithIsMuted ? false : state.isMuted,
          screen: screen != null ? screen : state.screen,
          game,
          campaign: {
            isCampaign,
            // whether or not we're actually in the campaign
            species: (_state2 = state) !== null && _state2 !== void 0 && (_state2$campaign = _state2.campaign) !== null && _state2$campaign !== void 0 && _state2$campaign.species ? state.campaign.species : 'Marauder Ants',
            upgrades: (_state3 = state) !== null && _state3 !== void 0 && (_state3$campaign = _state3.campaign) !== null && _state3$campaign !== void 0 && _state3$campaign.upgrades ? state.campaign.upgrades : [],
            currency: 0,
            level: (_state4 = state) !== null && _state4 !== void 0 && (_state4$campaign = _state4.campaign) !== null && _state4$campaign !== void 0 && _state4$campaign.level ? state.campaign.level : 0,
            levelName: '',
            levelsCompleted: (_state5 = state) !== null && _state5 !== void 0 && (_state5$campaign = _state5.campaign) !== null && _state5$campaign !== void 0 && _state5$campaign.levelsCompleted ? state.campaign.levelsCompleted : []
          },
          editor: {
            actions: [],
            index: 0,
            clipboard: {} // Rectangle
          }
        };
      }

    case 'SET_CURRENT_LEVEL_NAME':
      if (state.game != null) {
        state.game.level = action.levelName.slice(0, -5);
      }
    // fall-through
    case 'SET_CURRENT_LEVEL_WON':
    case 'SET_CURRENCY':
    case 'CLEAR_UPGRADES':
    case 'CLEAR_LEVEL_ONLY_UPGRADES':
    case 'CONTINUE_CAMPAIGN':
    case 'CLEAR_SAVED_CAMPAIGN':
      return {
        ...state,
        campaign: campaignReducer(state.campaign, action)
      };
    case 'SET_SPECIES':
      if (state.game != null) {
        state.game.colonies[action.playerID].species = action.species;
        if (state.game.playerID != action.playerID) {
          return state;
        }
      }
      return {
        ...state,
        campaign: campaignReducer(state.campaign, action)
      };
    case 'SET_SCREEN':
      {
        const {
          screen
        } = action;
        const nextState = {
          ...state,
          screen
        };
        if (screen == 'EDITOR' && state.game != null) {
          nextState.game.isExperimental = true;
        }
        if (screen == 'GAME' || screen == 'EDITOR') {
          nextState.game.sprites = {
            ...state.sprites
          };
        }
        return nextState;
      }
    case 'SET_IS_MUTED':
      {
        return {
          ...state,
          isMuted: action.isMuted,
          interactedWithIsMuted: true
        };
      }
    case 'SET_LEVEL':
      {
        var _state6, _state6$campaign;
        const {
          numPlayers,
          gridWidth,
          gridHeight,
          actions,
          upgrades,
          cpuSpecies
        } = action.level;
        const game = initBaseState({
          x: gridWidth,
          y: gridHeight
        }, numPlayers, [((_state6 = state) === null || _state6 === void 0 ? void 0 : (_state6$campaign = _state6.campaign) === null || _state6$campaign === void 0 ? void 0 : _state6$campaign.species) || 'Marauder Ants', ...(cpuSpecies || ['Leaf Cutter Ants'])], clientID, state.clients);
        game.session = state;
        game.socketClients = socketClients;
        game.clientID = clientID;
        // const nextState = loadLevelReducer(state, action);
        const nextState = {
          ...state,
          game
        };
        // upgrades
        for (const upgrade of upgrades) {
          if (!upgrade.levelOnly) {
            if (!nextState.campaign.upgrades) {
              nextState.campaign.upgrades = [];
            }
            nextState.campaign.upgrades.push(upgrade);
          }
        }
        nextState.editor.actions = [...action.level.actions];
        nextState.editor.index = nextState.editor.actions.length;
        nextState.game.isExperimental = !!action.isExperimental || state.screen == 'EDITOR';
        nextState.campaign.level += 1;
        return nextState;
      }
    case 'REDO':
      // HACK: it's about to get subtracted 1
      state.editor.index = Math.min(state.editor.index + 2, state.editor.actions.length + 1);
    // Fall-through
    case 'UNDO':
      // state.editor.actions.pop();
      state.editor.index -= 1;
    // Fall-through
    case 'SET_PLAYERS_AND_SIZE':
      {
        const level = action;
        level.actions = state.editor.actions.slice(0, state.editor.index);
        if (action.numPlayers == null && state.game != null) {
          var _state$game$colonies$, _state$game$colonies$2, _state$game$colonies$3;
          level.numPlayers = Object.keys(state.game.players).length;
          level.gridWidth = state.game.gridWidth;
          level.gridHeight = state.game.gridHeight;
          level.upgrades = [...state.campaign.upgrades];
          level.cpuSpecies = [(_state$game$colonies$ = state.game.colonies[2]) === null || _state$game$colonies$ === void 0 ? void 0 : _state$game$colonies$.species, (_state$game$colonies$2 = state.game.colonies[3]) === null || _state$game$colonies$2 === void 0 ? void 0 : _state$game$colonies$2.species, (_state$game$colonies$3 = state.game.colonies[4]) === null || _state$game$colonies$3 === void 0 ? void 0 : _state$game$colonies$3.species];
        }
        if (action.numPlayers != null || level.reset) {
          var _state7, _state7$campaign;
          const {
            numPlayers,
            gridWidth,
            gridHeight,
            actions,
            upgrades,
            cpuSpecies
          } = level;
          const game = initBaseState({
            x: gridWidth,
            y: gridHeight
          }, numPlayers, [((_state7 = state) === null || _state7 === void 0 ? void 0 : (_state7$campaign = _state7.campaign) === null || _state7$campaign === void 0 ? void 0 : _state7$campaign.species) || 'Marauder Ants', ...(cpuSpecies || ['Leaf Cutter Ants'])], clientID, state.clients);
          game.session = state;
          game.socketClients = socketClients;
          game.clientID = clientID;
          if (state.screen == 'EDITOR') {
            game.isExperimental = true;
          }
          let sprites = null;
          if (state.game != null && state.game.sprites != null && state.game.sprites['EGG1'] != null) {
            sprites = state.game.sprites;
          } else {
            sprites = state.sprites;
          }
          let viewPos = {
            x: -5,
            y: -5
          };
          let viewWidth = 32;
          let viewHeight = 18;
          let hotKeys = {};
          let pheromoneWorker = game.pheromoneWorker;
          if (state.game != null && state.game.viewPos != null) {
            viewPos = state.game.viewPos;
            viewWidth = state.game.viewWidth;
            viewHeight = state.game.viewHeight;
            hotKeys = state.game.hotKeys;
            pheromoneWorker = state.game.pheromoneWorker;
          }
          state.game = game;
          state.game.sprites = sprites;
          state.game.viewPos = viewPos;
          state.game.viewWidth = viewWidth;
          state.game.viewHeight = viewHeight;
          state.game.hotKeys = hotKeys;
          state.game.gameID = state.game.gameID != null ? state.game.gameID + 1 : 1;
          state.game.pheromoneWorker = pheromoneWorker;
        }
        // keep track of these across level reload
        const {
          viewPos,
          viewWidth,
          viewHeight,
          isExperimental,
          sprites,
          keepMarquee
        } = state.game;
        // re-load level
        state = loadLevelReducer(state, {
          level
        });
        state.game.keepMarquee = keepMarquee;
        state.game.viewPos = viewPos;
        state.game.viewWidth = viewWidth;
        state.game.viewHeight = viewHeight;
        state.game.isExperimental = isExperimental;
        state.game.sprites = sprites;
        if (state.screen == 'EDITOR') {
          state.game.isExperimental = true;
        }
        // HACK: have to not copy here in order for async level loading to work!
        return state;
      }
    case 'RETURN_TO_LOBBY':
      return {
        ...state,
        screen: 'LOBBY',
        game: null,
        editor: {},
        campaign: {}
      };
    case 'TICK':
      emitToSession(state, socketClients, action, clientID, true);
    case 'STOP_TICK':
    case 'START_TICK':
      {
        if (!state.game) return state;
        return {
          ...state,
          game: tickReducer(serverState, action, clientID, socket, dispatch)
        };
      }
    case 'SET_MOUSE_POS':
    case 'SET_MOUSE_DOWN':
      {
        if (!state.game) return state;
        return {
          ...state,
          game: {
            ...state.game,
            mouse: mouseReducer(state.game.mouse, action)
          }
        };
      }
    case 'SET_MODAL':
    case 'DISMISS_MODAL':
      return modalReducer(state, action);
    case 'SET_HOTKEY':
    case 'SET_KEY_PRESS':
      {
        // emitToSession(state, socketClients, action, clientID);
        if (!state.game) return state;
        return {
          ...state,
          game: {
            ...state.game,
            hotKeys: hotKeysReducer(state.game.hotKeys, action)
          }
        };
      }
    case 'SET_GAME':
      {
        return {
          ...state,
          game: action.game
        };
      }
    case 'SET_SPRITE_SHEET':
      state.sprites[action.name] = action.img;
    case 'CREATE_ENTITIES':
    case 'DELETE_ENTITIES':
    case 'FILL_PHEROMONE':
    case 'COPY_ENTITIES':
    case 'PASTE_ENTITIES':
      if (state.screen == 'EDITOR' && action.type != 'SET_SPRITE_SHEET') {
        state.editor.actions = state.editor.actions.slice(0, state.editor.index);
        state.editor.actions.push(action);
        state.editor.index += 1;
      }
    case 'SET_HIT_ANTS_TO_WIN':
    case 'UPDATE_ALL_PHEROMONES':
    case 'END_COUNTDOWN':
    case 'SET_GAME_OVER':
    case 'CREATE_ENTITY':
    case 'DELETE_ENTITY':
    case 'SET_VIEW_POS':
    case 'INCREMENT_ZOOM':
    case 'SET_PHEROMONE_VISIBILITY':
    case 'SET_EGG_LAYING_COOLDOWN':
    case 'ANT_BITE':
    case 'START_EGG_LAYING':
    case 'MARK_DIRT':
    case 'MARK_DIRT_PUTDOWN':
    case 'SET_LAYING_CASTE':
    case 'SET_SELECTED_ABILITY':
    case 'SET_ABILITY_ACTIVE':
    case 'SET_SELECTED_PHEROMONE':
    case 'SET_PHEROMONE_ACTIVE':
    case 'SWAP_MINI_MAP':
    case 'SET_TUTORIAL_FLAG':
    case 'SET_IS_RAINING':
    case 'APPEND_UPGRADED_AT':
    case 'SET_MARQUEE_MODE':
    case 'SET':
    case 'ENQUEUE_ENTITY_ACTION':
      {
        emitToSession(state, socketClients, action, clientID);
        if (!state.game) return state;
        return {
          ...state,
          game: gameReducer(state.game, action)
        };
      }
    case 'SET_CONFIG':
      {
        if (!state.game) return state;
        // reset config
        state.game = gameReducer(state.game, action);
        // re-apply upgrades
        for (const upgrade of state.campaign.upgrades) {
          state = upgradeReducer(state, upgrade);
        }
        return state;
      }
    case 'UPGRADE':
      {
        return upgradeReducer(state, action);
      }
  }
  return state;
};
function loadLevelReducer(prevState, action) {
  const {
    numPlayers,
    gridWidth,
    gridHeight,
    actions,
    upgrades,
    synchronous
  } = action.level;
  let game = prevState.game;

  // apply upgrades
  let state = {
    ...prevState,
    game
  };
  if (upgrades != null) {
    for (const upgrade of upgrades) {
      state = upgradeReducer(state, upgrade);
      let alreadyInCampaign = false;
      for (const up of state.campaign.upgrades) {
        if (up.name == upgrade.name) {
          alreadyInCampaign = true;
          break;
        }
      }
      if (!alreadyInCampaign) {
        state.campaign.upgrades.push(upgrade);
      }
    }
  }

  // apply game actions
  if (state.screen != 'EDITOR' && !synchronous) {
    asyncApplyLevelActions(game, [...actions], actions.length);
  } else {
    for (let i = 0; i < actions.length; i++) {
      const levelAction = actions[i];
      const progress = (i / actions.length * 100).toFixed(1);
      // console.log("loading: " + progress + "%");
      game = gameReducer(game, levelAction);
    }

    // NOTE: this is all moved to a callback of the asyncApplyLevelActions function
    // gameID incrementing tells Game UI components to refresh
    game.gameID = state != null && state.game != null && state.game.gameID != null ? state.game.gameID + 1 : 1;

    // center view on the queen
    const queen = getQueen(game, game.playerID);
    if (queen != null) {
      game.viewPos = {
        x: queen.position.x - game.viewWidth / 2,
        y: queen.position.y - game.viewHeight / 2
      };
    }
    // spawn initial starting ants
    for (let playerID in game.players) {
      const startingAnts = game.config[playerID].numStartingWorkers;
      const playerQueen = getQueen(game, playerID);
      if (playerQueen != null) {
        for (let i = 0; i < startingAnts; i++) {
          addEntity(game, makeAnt(game, playerQueen.position, playerID, 'MINIMA'));
        }
      }
    }
  }
  return {
    ...state,
    game
  };
}

// NOTE: this doesn't actually work because it returns immediately
function asyncApplyLevelActions(game, actions, totalActions) {
  if (actions.length == 0) {
    // gameID incrementing tells Game UI components to refresh
    // game.gameID = state != null && state.game != null && state.game.gameID != null
    //   ? state.game.gameID + 1 : 1;

    // center view on the queen
    const queen = getQueen(game, game.playerID);
    if (queen != null) {
      game.viewPos = {
        x: queen.position.x - game.viewWidth / 2,
        y: queen.position.y - game.viewHeight / 2
      };
    }
    // spawn initial starting ants
    // AND also spawn any additional tokens
    for (let playerID in game.players) {
      const startingAnts = game.config[playerID].numStartingWorkers;
      const playerQueen = getQueen(game, playerID);
      if (playerQueen != null) {
        for (let i = 0; i < startingAnts; i++) {
          addEntity(game, makeAnt(game, playerQueen.position, playerID, 'MINIMA'));
        }
        if (game.config[playerID].startWithSeed) {
          const seed1 = makeSeed(game, add(playerQueen.position, {
            x: 1,
            y: 0
          }), 'VINE');
          addEntity(game, seed1);
        }
        if (game.config[playerID].startWithPupaToken) {
          const token = makeToken(game, add(playerQueen.position, {
            x: 0,
            y: 1
          }), playerQueen.playerID, 'PUPA');
          addEntity(game, token);
        }
        for (let i = 0; i < game.config[playerID].startWithDomesticateToken; i++) {
          const token = makeToken(game, add(playerQueen.position, {
            x: 1 + i,
            y: 1 + i
          }), playerQueen.playerID, 'DOMESTICATE');
          addEntity(game, token);
        }
      }
    }
    return;
  }
  ;
  game = gameReducer(game, actions.shift());
  const progress = (totalActions - actions.length) / totalActions * 100;
  game.loadingProgress = progress;
  setTimeout(() => asyncApplyLevelActions(game, actions, totalActions), 0);
}
function upgradeReducer(state, action) {
  if (!state.game) return state;
  let updatedUpgrade = false;
  if (action.name != null) {
    for (const upgrade of state.campaign.upgrades) {
      if (upgrade.name == action.name && upgrade.path[0] == action.path[0]) {
        updatedUpgrade = true;
        // HACK: support start with multiple domesticate tokens
        let value = action.value;
        if (upgrade.name == 'Start With Domesticate Token') {
          value += 1;
        }
        upgrade.value = value;
        break;
      }
    }
  }
  if (!updatedUpgrade) {
    state.campaign.upgrades = [...state.campaign.upgrades, action];
  }
  return {
    ...state,
    game: gameReducer(state.game, action)
  };
}
module.exports = {
  rootReducer
};

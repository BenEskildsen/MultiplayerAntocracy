
const express = require('express');
const cors = require('cors');
const urlParser = require('url');
const {
  recordVisit,
  recordSession,
  checkUsername,
  getHighScores, writeScore,
  getDashboardData,
} = require('./middleware');
const {initSocketServer} = require('./socket');
const {emitToSession} = require('./sessions');

const {initState} = require('../bin/state/state');
const {rootReducer} = require('../bin/reducers/serverReducer');
const {loadLevel} = require('../bin/thunks/levelThunks');



const port = process.env.PORT || 8000;

const leaderboards = express();
leaderboards.use(cors());
leaderboards.use(express.json());
leaderboards.use(express.urlencoded({extended: false}));

leaderboards.get('/highscores', [
  getHighScores,
]);
leaderboards.post('/score', [
  checkUsername,
  writeScore,
]);

const game = express();
game.use(cors());
game.use(express.json());
game.use(express.static('./'));
game.post('/visit', [
  recordVisit,
]);
game.post('/session', [
  recordSession,
]);
game.get('/dashboard', [
  getDashboardData,
]);
game.use(leaderboards);

// ---------------------------------------------------------
// Session stuff
// ---------------------------------------------------------

let nextSessionID = 1;
const newSession = (clientID) => {
  const id = nextSessionID++;
  return {
    id,
    name: "Game #" + id,
    clients: [clientID],
    clientsLoaded: {},

    actionHistory: [],
    ...initState(),
  };
};

const gameReducer = (state, action, clientID, socket) => {
  const {sessions, socketClients, clientToSession} = state;
  const sessionID = clientToSession[clientID];
  let session = sessions[sessionID];
  if (!session) return;


  // const checkLoading = (dispatch) => {
  //   let progress = 0;
  //   if (state.game != null) {
  //     progress = state.game.loadingProgress;
  //   }
  //   if (progress < 100) {
  //     setTimeout(checkLoading, 100);
  //   } else {
  //     dispatch({type: 'DONE_LOADING'});
  //   }
  // }

  console.log("server received", action);

  const dispatch = (action) => {
    sessions[sessionID] = rootReducer(state, action, clientID, socket, dispatch);
  };

  switch (action.type) {
    case 'DO_LOAD_LEVEL': {
      loadLevel(
        {
          dispatch,
          getState: () => sessions[sessionID],
        },
        action.levelName, action.startingUpgrades, true,
      );
      break;
    }
    case 'DONE_LOADING': {
      session.clientsLoaded[clientID] = true;
      let shouldStart = true;
      for (let id of session.clients) {
        if (!session.clientsLoaded[id]) {
          shouldStart = false;
          break;
        }
      }
      if (shouldStart) {
        emitToSession(
          session, socketClients,
          {type: 'DISMISS_MODAL'},
          clientID, true, // emit to self
        );
        session.screen = 'GAME';
        emitToSession(
          session, socketClients,
          {type: 'SET_SCREEN', screen: 'GAME'},
          clientID, true, // emit to self
        );
        sessions[sessionID] = rootReducer(state, {type: 'START_TICK'}, clientID, socket, dispatch);
        // emitToSession(
        //   session, socketClients,
        //   {type: 'START_TICK'},
        //   clientID, true, // emit to self
        // );
      }
      break;
    }
  }

  sessions[sessionID] = rootReducer(state, action, clientID, socket, dispatch);
}


const server = initSocketServer(game, newSession, gameReducer);

console.log("server listening on port", port);
server.listen(port);

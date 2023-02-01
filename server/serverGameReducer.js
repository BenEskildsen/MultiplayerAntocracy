const {
  leaveSession, emitToSession, emitToAllClients,
} = require('./sessions');

const gameReducer = (state, action, clientID, socket) => {
  const {sessions, socketClients, clientToSession} = state;

  switch (action.type) {
   case 'START': {
      const session = sessions[clientToSession[clientID]];
      if (!session) break;
      session.moveHistory = [];
      emitToSession(session, socketClients, action, clientID);
      break;
    }
    case 'CREATE_PIECE':
    case 'MOVE_PIECE': {
      const session = sessions[clientToSession[clientID]];
      if (!session) break;
      session.moveHistory.push(action);
      emitToSession(session, socketClients, action, clientID);
      break;
    }
    case 'UNDO': {
      const session = sessions[clientToSession[clientID]];
      if (!session) {
        console.log("no session", clientID, clientToSession[clientID], sessions);
        break;
      }
      session.moveHistory.pop();
      emitToSession(session, socketClients, action, clientID);
      break;
    }
    case 'SET_USE_MOVE_RULES': {
      const session = sessions[clientToSession[clientID]];
      if (!session) break;
      const {useMoveRules} = action;
      session.useMoveRules = useMoveRules;
      emitToSession(session, socketClients, action, clientID);
      break;
    }
    default:
      const session = sessions[clientToSession[clientID]];
      if (!session) break;
      emitToSession(session, socketClients, action, clientID);
  }

  return state;
};


module.exports = {gameReducer};

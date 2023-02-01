const React = require('react');
const {
  Button,
  InfoCard,
  Divider,
  Plot,
  plotReducer,
  Modal,
  Indicator,
  Board,
  SpriteSheet,
  TextField,
  CheckerBackground
} = require('bens_ui_components');
const PlayButton = require('./PlayButton.react');
const {
  dispatchToServer
} = require('../clientToServer');
const {
  initSpriteSheetSystem
} = require('../systems/spriteSheetSystem');
const {
  getSession
} = require('../selectors/sessions');
const {
  useEffect,
  useState,
  useMemo
} = React;
const Lobby = props => {
  const {
    dispatch,
    state,
    getState
  } = props;

  // on mount
  useEffect(() => {
    initSpriteSheetSystem(store);
  }, []);
  const sessionCards = [];
  for (const sessionID in state.sessions) {
    var _getSession;
    sessionCards.push( /*#__PURE__*/React.createElement(SessionCard, {
      key: "sessionCard_" + sessionID,
      session: state.sessions[sessionID],
      joinedSessionID: (_getSession = getSession(state)) === null || _getSession === void 0 ? void 0 : _getSession.id
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 300,
      margin: 'auto',
      marginTop: 100
    }
  }, /*#__PURE__*/React.createElement(CreateGameCard, null), sessionCards);
};
const CreateGameCard = props => {
  const [name, setName] = useState('');
  return /*#__PURE__*/React.createElement(InfoCard, {
    style: {
      width: 300
    }
  }, "Game Name:\xA0", /*#__PURE__*/React.createElement(TextField, {
    value: name,
    onChange: setName
  }), /*#__PURE__*/React.createElement(Button, {
    label: "Create Game",
    style: {
      width: 300,
      height: 30,
      marginTop: 8
    },
    onClick: () => {
      dispatchToServer({
        type: 'CREATE_SESSION',
        name: name != '' ? name : null
      });
    }
  }));
};
const SessionCard = props => {
  const {
    session,
    joinedSessionID
  } = props;
  const {
    id,
    name,
    clients
  } = session;
  return /*#__PURE__*/React.createElement(InfoCard, {
    style: {
      width: 300
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("b", null, name)), "Players: ", clients.length, joinedSessionID == id ? /*#__PURE__*/React.createElement(PlayButton, {
    store: store,
    isCampaign: false,
    title: "Play",
    level: 'antVsAnt2',
    isUniquePlayer: false
  }) : /*#__PURE__*/React.createElement(Button, {
    style: {
      width: 300,
      height: 30
    },
    label: "Join Game",
    onClick: () => {
      dispatchToServer({
        type: 'JOIN_SESSION',
        sessionID: id
      });
    }
  }));
};
module.exports = Lobby;
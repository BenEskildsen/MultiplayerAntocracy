// @flow

const axios = require('axios');
const {isMobile, isIpad, isElectron} = require('../utils/helpers');

// heroku
// const axiosInstance = axios.create({
//   baseURL: 'https://sidewalk-empire.herokuapp.com',
// });
// droplet
const axiosInstance = axios.create({
  baseURL: 'https://benhub.io/analytics',
});
// for localhost:
// const axiosInstance = axios;


// ------------------------------------------------------------------
// Post Session
let prevSession = {};
const registerSession = (state, ending) => {
  const game = state.game;

  const map = state.campaign.levelName.slice(0, -5);
  const isUnique = game.isUnique;

  const queens = game.ANT
    .map(id => game.entities[id])
    .filter(a => a.playerID == game.playerID && a.caste == 'YOUNG_QUEEN')
    .length;
  const ants = game.ANT
    .map(id => game.entities[id])
    .filter(a => a.playerID == game.playerID)
    .length;

  const username = localStorage.getItem('name') || 'unnamed';

  let device = 'PC';
  if (isMobile()) {
    device = 'Mobile';
  }
  if (isIpad()) {
    device = 'iPad';
  }
  if (isElectron()) {
    device = 'electron';
  }

  const session = {
    hostname: getHostname(),
    ending,
    is_unique: isUnique ? 1 : 0,
    map,
    ants,
    queens,
    play_minutes: Math.round(game.totalGameTime / 6000) / 10,
    username,
    device,
    species: state.campaign.species,
  };

  // there can be issues registering the same session multiple times,
  // particularly on win. Just check if we just registered that session and
  // ignore if so using a shallow object equals check
  let sameAsOldSession = true;
  for (var key in session) {
    if(session[key] !== prevSession[key]) {
      sameAsOldSession = false;
    }
  }
  if (sameAsOldSession) return;

  axiosInstance.post('/session', session);
  prevSession = session;
}

// ------------------------------------------------------------------
// Post Score
const postScore = (score) => {
  return axiosInstance.post('/score', score);
};

// ------------------------------------------------------------------
// Post Visit
const postVisit = (path, map, isUnique) => {
  return new Promise(() => {});
  // return axiosInstance
  //   .post('/visit', {
  //     hostname: getHostname(), path, isUnique, map,
  //   });
};

// ------------------------------------------------------------------
// Get Highscores
const getHighScores = (params: {mapNames: Array<string>, scoreTypes: Object}) => {
  return axiosInstance.get('highscores', {params});
};


// ------------------------------------------------------------------
// Helpers

const getHostname = () => {
  if (isElectron()) {
    return 'electron';
  } else {
    return window.location.hostname;
  }
}

module.exports = {
  registerSession,
  postScore,
  postVisit,
  getHighScores,
};

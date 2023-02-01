// @flow

import type {State} from '../types';

const initState = (): State => {
  return {
    screen: 'SESSION_LOBBY',
    editor: {},
    campaign: {},
    game: null,
    isMuted: true,
    // players: [],
    modal: null,
    sprites: {},

    sessions: {},
  };
};

module.exports = {initState};

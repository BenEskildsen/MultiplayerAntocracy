// @flow

const {
  makeAnt, makeDirt, makeEntity,
  makeToken,
} = require('../entities/makeEntity');
const {addEntity, removeEntity} = require('../simulation/entityOperations');
const {add, subtract} = require('../utils/vectors');
const {initGrid, lookupInGrid} = require('../utils/gridHelpers');
const {randomIn} = require('../utils/stochastic');
const {config} = require('../config');
const {makeConfig} = require('./makeConfig');
const {isServer} = require('../selectors/sessions');

import type {Game} from '../types';

// -----------------------------------------------------------------------
// player and colony initialization
// -----------------------------------------------------------------------

const initPlayerAndColony = (
  type: 'HUMAN' | 'COMPUTER', id: number, name: string,
  species: string,
): {player: Player, colony: Colony} => {
  return {
    player: {
      id,
      name,
      type,
    },
    colony: {
      id,
      species,
      taskNeed: {
        EXPLORE: 10,
        PATROL: 0,
        FEED_LARVA: 0,
        GO_TO_DIRT: 0,
        RETRIEVE: 0,
      },
      foodMarkedForRetrieval: {},
      patrolRadius: 0,
      queenAlive: true,
    },
  }
}

// -----------------------------------------------------------------------
// base state
// -----------------------------------------------------------------------

const initBaseState = (
  gridSize: Vector, numPlayers: number, speciesArray: Array<string>,
  playerID, clients,
): Game => {
  const gridWidth = gridSize.x;
  const gridHeight = gridSize.y;
  const game = {
    time: 0,
    players: {},
    colonies: {},
    gameID: 0,
    playerID,
    numPlayers,

    // for tracking game time
    prevTickTime: 0,
    totalGameTime: 0,
    timeSinceLastTick: 0,

    pheromoneDisplay: {
      COLONY: false,
      FOOD: true,
      ALERT: false,
      EGG: false,
      LARVA: false,
      PUPA: false,
      DIRT_DROP: false,
      QUEEN_PHER: true,
      QUEEN_ALERT: true,
      MARKED_DIRT_PHER: false,
      WATER: true,
      PATROL_DEFEND_PHER: true,
      QUEEN_DISPERSE: true,
      DOMESTICATE: true,
      ACID: true,
      RAID_PHER: false,
    },
    maxMinimap: false,

    sprites: {},

    gridWidth,
    gridHeight,
    grid: initGrid(gridWidth, gridHeight, numPlayers),
    viewPos: {x: 0, y: 0},
    viewWidth: config.viewWidth,
    viewHeight: config.viewHeight,
    viewImage: {
      canvas: null,
      imgPos: {x:0, y: 0},
      stalePositions: {},
      isStale: true,
      allStale: true,
    },

    controlledEntity: null,
    focusedEntity: null,

    nextID: 1,
    entities: {},
    markedDirtIDs: [],
    dirtPutdownPositions: [],
    queens: {}, // map of playerID to queen entityID
    totalYoungQueens: 0, // young queens that flew away

    upgradedAt: [], // track upgrade thresholds you've already reached so that
                    // you can't e.g. get 10 ants, upgrade, lose ant, gain ant,
                    // and then upgrade again at 10

    staleTiles: [],
    floodFillSources: [],
    reverseFloodFillSources: [],
    dispersingPheromonePositions: [],
    pheromoneWorker: function() {
      if (isServer()) {
        return null;
      } else {
        return new Worker('bin/pheromoneWorker.js');
      }
    }(),

    mouse: {
      isLeftDown: false,
      isRightDown: false,
      downPos: {x: 0, y: 0},
      curPos: {x: 0, y: 0},
      curPixel: {x: 0, y: 0},
      prevPixel: {x: 0, y: 0},
    },
    hotKeys: {
      onKeyDown: {},
      onKeyPress: {},
      onKeyUp: {},
      keysDown: {},
    },

    clipboard: {position: {x: 0, y: 0}, width: 1, height: 1},

    // give the timestamp that the tutorial modal was triggered,
    // if null then we haven't
    tutorialFlags: {
      larva: null,
      foodToken: null,
      dirtToken: null,
      larvaToken: null,
    },

    gameOver: false,

    config: makeConfig(gridSize, numPlayers),

    // properties:
    GOAL_CRITTER: {},
  };

  // lookup for entityIDs by entityType
  for (const entityType of config.entityTypes) {
    game[entityType] = [];
  }

  for (let i = 1; i <= clients.length; i++) {
    const clientID = clients[i - 1];
    if (clientID == playerID) {
      game.playerID = i;
    }
    const playerAndColony = initPlayerAndColony(
      'HUMAN', i, 'You', speciesArray[i-1] || 'Marauder Ants',
    );
    game.players[i] = playerAndColony.player;
    game.colonies[i] = playerAndColony.colony;
  }

  for (let i = 2; i < numPlayers; i++) {
    const {player, colony} = initPlayerAndColony(
      'COMPUTER', i+1, 'Enemy',
      speciesArray[i] || 'Leaf Cutter Ants',
    );
    game.players[player.id] = player;
    game.colonies[player.id] = colony;
  }

  return game;
};

// -----------------------------------------------------------------------
// misc helpers
// -----------------------------------------------------------------------

module.exports = {initBaseState, initPlayerAndColony};

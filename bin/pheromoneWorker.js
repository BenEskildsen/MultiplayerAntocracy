(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const config = {
  msPerTick: 16,
  antsToWin: 250,
  countdownMillis: 10 * 60 * 1000,
  canvasWidth: 1200,
  canvasHeight: 1200,
  viewWidth: 18,
  viewHeight: 32,
  useFullScreen: true,
  cellWidth: 33,
  cellHeight: 25,
  imageFiles: {
    'SMANT': './img/Smant1.png',
    'FOOD': './img/Food2.png',
    'DIRT': './img/Dirt3.png',
    'STONE': './img/Stone1.png',
    'BRICK': './img/Brick1.png',
    'KITCHEN': './img/Kitchen1.png',
    'PHEROMONE': './img/Pheromones.png',
    'VINE': './img/Vine1.png',
    'ROOTS': './img/Roots1.png',
    'SEED': './img/Seed1.png',
    'SPROUT': './img/Sprout2.png',
    'LEAF': './img/Leaf1.png',
    'ALERT': './img/Exclamation1.png',
    'WANDER': './img/Ellipsis1.png',
    'QUESTION': './img/Question1.png',
    'MALE': './img/Male1.png',
    'FEMALE': './img/Female1.png',
    'NICKEL': './img/Doodad1.png',
    'BOTTLE_CAP': './img/Doodad2.png',
    'PENCIL': './img/Pencil1.png',
    'HOSE': './img/Hose1.png',
    'ANT': './img/Ant2.png',
    'YOUNG_QUEEN': './img/YoungQueen1.png',
    'FLYING_QUEEN': './img/YoungQueen2.png',
    'WARRIOR_QUEEN': './img/QueenAnt2.png',
    'TRAPJAW_ANT': './img/Ant5.png',
    'HONEY_POT': './img/Ant6.png',
    'RED_ANT': './img/Ant3.png',
    'RED_YOUNG_QUEEN': './img/RedYoungQueen1.png',
    'RED_FLYING_QUEEN': './img/RedYoungQueen2.png',
    'RED_WARRIOR_QUEEN': './img/RedQueenAnt2.png',
    'RED_TRAPJAW_ANT': './img/RedAnt5.png',
    'RED_HONEY_POT': './img/RedAnt6.png',
    'YELLOW_ANT': './img/Ant4.png',
    'YELLOW_YOUNG_QUEEN': './img/YellowYoungQueen1.png',
    'YELLOW_FLYING_QUEEN': './img/YellowYoungQueen2.png',
    'YELLOW_WARRIOR_QUEEN': './img/YellowQueenAnt2.png',
    'YELLOW_TRAPJAW_ANT': './img/YellowAnt5.png',
    'YELLOW_HONEY_POT': './img/YellowAnt6.png',
    'ANT_QUEEN': './img/QueenAnt1.png',
    'LARVA': './img/Larva2.png',
    'SPIKED_LARVA': './img/Larva3.png',
    'PUPA': './img/Pupa6.png',
    'EGG': './img/Egg1.png',
    'EGG_HATCH': './img/EggHatch1.png',
    'SPIDER': './img/Spider2.png',
    'SCORPION': './img/Scorpion1.png',
    'BEETLE': './img/Beetle1.png',
    'SPIDER_WEB': './img/Spiderweb1.png',
    'WORM': './img/Worm1.png',
    'CENTIPEDE': './img/Centipede1.png',
    'CATERPILLAR': './img/Caterpillar1.png',
    'ROLY_POLY': './img/Rolypoly1.png',
    'APHID': './img/Aphid1.png',
    'HILLSIDE': './img/Hillside1.png',
    'BLUEGRASS': './img/Bluegrass1.png',
    'FLOOR_TILE': './img/FloorTile1.png',
    'PICNIC_BLANKET': './img/PicnicBlanket1.png',
    'TERMITE_QUEEN': './img/TermiteQueen1.png',
    'TERMITE_WORKER': './img/TermiteWorker1.png',
    'TERMITE_SOLDIER': './img/TermiteSoldier2.png',
    'FOOT_BOT_LEFT': './img/Foot1.png',
    'FOOT_BOT_RIGHT': './img/Foot2.png',
    'FOOT_TOP_RIGHT': './img/Foot3.png',
    'FOOT_TOP_LEFT': './img/Foot4.png'
  },
  audioFiles: [
  // {path: 'audio/silence.mp3', type: 'mp3'},
  {
    path: 'audio/Ants-Video-Game Main.mp3',
    type: 'mp3'
  }, {
    path: 'audio/Beetle Guts.mp3',
    type: 'mp3'
  }, {
    path: 'audio/Song Oct. 9 (Update).mp3',
    type: 'mp3'
  }, {
    path: 'audio/Sidewalk Life.mp3',
    type: 'mp3'
  }, {
    path: 'audio/The Queen, Her Majesty.wav',
    type: 'wav'
  }, {
    path: 'audio/March of the Ants.wav',
    type: 'wav'
  }, {
    path: 'audio/Exploration.mp3',
    type: 'mp3'
  }, {
    path: 'audio/Song Oct. 9.wav',
    type: 'wav'
  }, {
    path: 'audio/Moving Dirt.wav',
    type: 'wav'
  }, {
    path: 'audio/Rising suspense song.mp3',
    type: 'mp3'
  }],
  campaignAudioFiles: [{
    path: 'audio/campaign/BeetleGuts.mp3',
    type: 'mp3'
  }, {
    path: 'audio/campaign/Exploration.mp3',
    type: 'mp3'
  }, {
    path: 'audio/campaign/FairlyConstantSuspense.mp3',
    type: 'mp3'
  }, {
    path: 'audio/campaign/GatherersRemix.mp3',
    type: 'mp3'
  }, {
    path: 'audio/campaign/MarchOfTheAnts.mp3',
    type: 'mp3'
  }, {
    path: 'audio/campaign/QueenAntsGambit.mp3',
    type: 'mp3'
  }, {
    path: 'audio/campaign/SidewalkLife.mp3',
    type: 'mp3'
  }, {
    path: 'audio/campaign/SlowSodaCanSongP1.mp3',
    type: 'mp3'
  }, {
    path: 'audio/campaign/SlowSodaCanSongP2.mp3',
    type: 'mp3'
  }, {
    path: 'audio/campaign/SpanishAnts.mp3',
    type: 'mp3'
  }, {
    path: 'audio/campaign/TheQueenHerMajesty.mp3',
    type: 'mp3'
  }],
  // indicies into the spritesheet
  tileDict: {
    'ltb': {
      x: 0,
      y: 1
    },
    'rtb': {
      x: 2,
      y: 1
    },
    'lrt': {
      x: 1,
      y: 0
    },
    'lrb': {
      x: 1,
      y: 2
    },
    't': {
      x: 3,
      y: 0
    },
    'b': {
      x: 3,
      y: 2
    },
    'l': {
      x: 4,
      y: 2
    },
    'r': {
      x: 6,
      y: 2
    },
    'tb': {
      x: 3,
      y: 1
    },
    'lt': {
      x: 0,
      y: 0
    },
    'lb': {
      x: 0,
      y: 2
    },
    'rt': {
      x: 2,
      y: 0
    },
    'rb': {
      x: 2,
      y: 2
    },
    'lr': {
      x: 5,
      y: 2
    }
  },
  entityTypes: ['DIRT', 'FOOD', 'STONE', 'ANT', 'EGG', 'LARVA', 'PUPA', 'SPIDER', 'SCORPION', 'SPIDER_WEB', 'BEETLE', 'WORM', 'CENTIPEDE', 'CATERPILLAR', 'APHID', 'ROLY_POLY', 'CRITTER_EGG', 'DEAD_WORM', 'DEAD_CENTIPEDE', 'DEAD_ANT', 'DEAD_SPIDER', 'DEAD_BEETLE', 'DEAD_TERMITE', 'DEAD_CATERPILLAR', 'DEAD_APHID', 'DEAD_ROLY_POLY', 'DEAD_SCORPION', 'TOKEN', 'DOODAD', 'BACKGROUND', 'FOREGROUND', 'TERMITE', 'TERMITE_EGG', 'FOOT', 'VINE', 'SEED'],
  critterTypes: ['SPIDER', 'SCORPION', 'BEETLE', 'WORM', 'CENTIPEDE', 'CATERPILLAR', 'APHID', 'ROLY_POLY'],
  unanimatedTypes: ['DIRT', 'STONE', 'DEAD_ANT', 'DEAD_SPIDER', 'DEAD_ANT', 'DEAD_SPIDER', 'DEAD_BEETLE', 'DEAD_TERMITE', 'DEAD_WORM', 'DEAD_CENTIPEDE', 'DEAD_SCORPION',
  // 'DOODAD',
  'BACKGROUND', 'FOREGROUND'],
  tiledTypes: ['FOOD', 'DIRT', 'STONE', 'VINE'],
  pheromoneTypes: ['COLONY', 'FOOD', 'EGG', 'LARVA', 'PUPA', 'DIRT_DROP', 'QUEEN_PHER', 'MOVE_LARVA_PHER', 'CRITTER_PHER', 'MARKED_DIRT_PHER', 'ALERT', 'QUEEN_ALERT', 'QUEEN_FOLLOW', 'QUEEN_DISPERSE', 'WATER', 'PATROL_DEFEND_PHER', 'DOMESTICATE', 'PASS_THROUGH_COLONY', 'ACID', 'RAID_PHER'],
  // pheromone types that can be computed ahead of time
  // TODO this is unnecessary, all pheromones are steady state pheromones
  steadyStatePheromones: ['COLONY', 'EGG', 'LARVA', 'PUPA', 'MARKED_DIRT_PHER', 'MOVE_LARVA_PHER', 'DIRT_DROP', 'CRITTER_PHER', 'QUEEN_PHER', 'QUEEN_ALERT', 'ALERT', 'FOOD', 'QUEEN_FOLLOW', 'WATER', 'PATROL_DEFEND_PHER', 'QUEEN_DISPERSE', 'DOMESTICATE', 'PASS_THROUGH_COLONY', 'ACID', 'RAID_PHER'],
  // pheromone types that are computed every tick
  dispersingPheromones: [
  // NOTE: these are both types
  'QUEEN_PHER', 'ALERT', 'FOOD', 'QUEEN_ALERT', 'WATER', 'PATROL_DEFEND_PHER', 'QUEEN_DISPERSE', 'ACID'],
  dispersingPheromoneUpdateRate: 6,
  clearStrandedPheromoneRate: 500,
  pheromoneBlockingTypes: ['DIRT', 'FOOD', 'STONE', 'PUPA', 'DOODAD', 'VINE'],
  waterBlockingTypes: ['DIRT', 'FOOD', 'STONE', 'PUPA', 'LARVA'],
  passThroughColonyBlockingTypes: ['STONE', 'DOODAD'],
  queenPheromones: [
    // 'QUEEN_PHER', 'QUEEN_ALERT',
    // 'EXPAND',
    // 'CONTRACT',
    // 'PATROL_DEFEND_PHER',
  ],
  queenAbilities: [
    // 'MARK_DIRT',
    // 'JUMP',
    // 'DOMESTICATE',
  ],
  queenLayingCastes: ['MINIMA'
  // 'YOUNG_QUEEN',
  // 'COLONY TOKEN', 'DIRT TOKEN',
  // 'LARVA TOKEN',
  // 'EGG TOKEN', 'LARVA TOKEN', 'PUPA TOKEN',
  ],

  castes: ['QUEEN', 'MINIMA', 'MEDIA', 'MAJOR', 'YOUNG_QUEEN', 'HONEY_POT', 'SUB_MINIMA', 'SOLDIER'],
  tasks: ['WANDER', 'EXPLORE', 'RETRIEVE', 'RETURN', 'FEED_LARVA', 'MOVE_DIRT', 'MOVE_EGG', 'MOVE_LARVA', 'MOVE_PUPA', 'DEFEND', 'GO_TO_DIRT', 'QUEEN_WANDER', 'QUEEN_FOLLOW_MOUSE', 'ATTACK',
  // handled as a special case
  'PATROL', 'PATROL_DEFEND', 'FLY_AWAY', 'GO_TO_BLOCKAGE', 'RAID'],
  actions: ['PICKUP', 'PUTDOWN', 'FEED', 'MOVE', 'TURN', 'LAY', 'HATCH', 'BITE', 'STING', 'DIE', 'DASH', 'GRAPPLE', 'EXAMINE', 'MOVE_TURN',
  // combine a move and a turn for better interpolation
  'FALL', 'STOMP', 'LIFT',
  // FOOT actions
  'BURROW_HOME'],
  // queen
  queenMaxDigCharge: 8,
  queenDashDist: 4,
  suppressionRadius: 4,
  suppressionMultiplier: 10,
  eggLayingCooldown: 2500,
  // in ms
  maxEggCharges: 25,
  numStartingWorkers: 0,
  queenArmored: false,
  megaColony: false,
  upgradeNums: [10, 20, 30, 50, 75, 100, 150, 200],
  // upgradeNums: [1, 2, 3, 4, 5, 6, 7, 8],
  startWithPupaToken: false,
  startWithDomesticateToken: 0,
  startWithSeed: false,
  // raid
  raidCooldown: 4 * 60 * 1000,
  raidTime: 1.2 * 60 * 1000,
  // CPU
  attackTiming: 0,
  // no attack by default
  maxLarva: 12,
  // TODO: use or not use cpu media/major thresholds
  cpuMediaThreshold: 1000,
  cpuMajorThreshold: 1500,
  spiderWebStuckProbability: 0.1,
  // hose
  hoseDripRate: 400 * 3,
  hoseDripAmount: 12,
  // termites
  termiteCastes: ['TERMITE_WORKER', 'TERMITE_SOLDIER', 'TERMITE_QUEEN'],
  minTermiteSoldiers: 6,
  maxTermites: 100,
  castePickup: ['SUB_MINIMA', 'MINIMA', 'MEDIA', 'QUEEN', 'SOLDIER', 'TERMITE_WORKER'],
  // TODO: pickupTypes should just live on the caste
  antPickupTypes: ['FOOD', 'DIRT', 'EGG', 'LARVA', 'PUPA', 'TERMITE_EGG', 'SEED', 'CRITTER_EGG'],
  queenPickupTypes: ['TOKEN', 'FOOD', 'DIRT', 'EGG', 'LARVA', 'PUPA', 'TERMITE_EGG', 'SEED', 'CRITTER_EGG'],
  warriorQueenBlockingTypes: ['DIRT', 'TOKEN', 'STONE', 'DOODAD' // 'FOOD',
  ],

  youngQueensDoTasks: false,
  // common params
  prevPositionPenalty: -100,
  exploreRate: 0.001,
  // castes
  QUEEN: {
    hp: 60,
    damage: 2,
    width: 2,
    height: 2,
    eggHatchAge: 34000,
    larvaFoodNeed: 12,
    pupaHatchAge: 80000,
    maxHold: 1,
    BITE: {
      duration: 41 * 8,
      spriteOrder: [5, 6, 7, 6]
    },
    MOVE: {
      duration: 45 * 4,
      spriteOrder: [1, 2],
      maxFrameOffset: 2,
      frameStep: 2
    },
    MOVE_TURN: {
      duration: 41 * 5,
      spriteOrder: [1, 2],
      maxFrameOffset: 2,
      frameStep: 2
    },
    DASH: {
      duration: 41 * 1,
      spriteOrder: [1],
      maxFrameOffset: 4,
      frameStep: 1
    },
    BURROW_HOME: {
      duration: 41 * 10,
      effectIndex: 320,
      spriteOrder: [1, 2, 3, 4]
    },
    blockingTypes: ['ANT', 'FOOD', 'DIRT', 'TOKEN', 'SPIDER', 'SCORPION', 'BEETLE', 'STONE', 'DOODAD',
    // 'BACKGROUND',
    'PUPA', 'TERMITE', 'WORM', 'CENTIPEDE', 'CATERPILLAR', 'APHID', 'ROLY_POLY', 'VINE', 'FOOT', 'SEED']
  },
  YOUNG_QUEEN: {
    hp: 10,
    damage: 2,
    width: 1,
    height: 1,
    eggHatchAge: 17000,
    larvaFoodNeed: 2,
    pupaHatchAge: 6000 * 3,
    maxHold: 1,
    MOVE: {
      duration: 41 * 10,
      spriteOrder: [1, 0, 2]
    },
    MOVE_TURN: {
      duration: 41 * 12,
      spriteOrder: [1, 0, 2]
    },
    TURN: {
      duration: 41 * 4,
      spriteOrder: [1, 2]
    },
    DIE: {
      duration: 41 * 2,
      spriteOrder: [3]
    },
    PICKUP: {
      duration: 41 * 6,
      spriteOrder: [1, 0, 2]
    },
    PUTDOWN: {
      duration: 41 * 6,
      spriteOrder: [1, 0, 2]
    },
    FEED: {
      duration: 41 * 11,
      spriteOrder: [1, 0, 2]
    },
    BITE: {
      duration: 41 * 10,
      spriteOrder: [1, 0, 2]
    }
  },
  SUB_MINIMA: {
    hp: 5,
    damage: 1,
    width: 1,
    height: 1,
    eggHatchAge: 20000,
    larvaFoodNeed: 1,
    pupaHatchAge: 50000,
    maxHold: 1,
    TURN: {
      duration: 41 * 8,
      spriteOrder: [1, 2, 3, 4]
    },
    MOVE: {
      duration: 41 * 16,
      spriteOrder: [1, 2, 3, 4]
    },
    MOVE_TURN: {
      duration: 41 * 19,
      spriteOrder: [1, 2, 3, 4]
    }
  },
  MINIMA: {
    hp: 20,
    damage: 1,
    width: 1,
    height: 1,
    eggHatchAge: 24000,
    larvaFoodNeed: 1,
    pupaHatchAge: 55000,
    maxHold: 1
  },
  SOLDIER: {
    hp: 30,
    damage: 3,
    width: 1,
    height: 1,
    eggHatchAge: 24000,
    larvaFoodNeed: 3,
    pupaHatchAge: 55000,
    maxHold: 1,
    TURN: {
      duration: 41 * 8,
      spriteOrder: [1, 2, 3, 4]
    },
    MOVE: {
      duration: 41 * 16,
      spriteOrder: [1, 2, 3, 4]
    },
    MOVE_TURN: {
      duration: 41 * 19,
      spriteOrder: [1, 2, 3, 4]
    },
    BITE: {
      duration: 41 * 15,
      spriteOrder: [1, 0, 2]
    }
  },
  HONEY_POT: {
    hp: 25,
    damage: 0,
    width: 2,
    height: 3,
    eggHatchAge: 24000,
    larvaFoodNeed: 2,
    pupaHatchAge: 55000,
    maxHold: 1,
    foodLayingCooldown: 30000
  },
  MEDIA: {
    hp: 40,
    damage: 2,
    width: 2,
    height: 2,
    eggHatchAge: 25000,
    larvaFoodNeed: 4,
    pupaHatchAge: 72000,
    maxHold: 3,
    MOVE: {
      duration: 41 * 8,
      spriteOrder: [1, 2, 3, 4]
    },
    BITE: {
      duration: 41 * 20,
      spriteOrder: [1, 0, 2]
    },
    blockingTypes: ['FOOD', 'DIRT', 'TOKEN', 'SPIDER', 'SCORPION', 'BEETLE', 'ANT', 'STONE', 'DOODAD',
    // 'BACKGROUND',
    'PUPA', 'TERMITE', 'WORM', 'CENTIPEDE', 'VINE', 'FOOT', 'SEED', 'CATERPILLAR', 'APHID', 'ROLY_POLY']
  },
  MAJOR: {
    hp: 100,
    damage: 4,
    width: 3,
    height: 3,
    eggHatchAge: 34000,
    larvaFoodNeed: 10,
    pupaHatchAge: 80000,
    maxHold: 0,
    blockingTypes: ['FOOD', 'TOKEN', 'SPIDER', 'SCORPION', 'BEETLE', 'ANT', 'STONE', 'DOODAD',
    // 'BACKGROUND',
    'TERMITE', 'WORM', 'CENTIPEDE', 'VINE', 'FOOT', 'SEED', 'CATERPILLAR', 'APHID', 'ROLY_POLY'],
    BITE: {
      duration: 41 * 15,
      spriteOrder: [1, 0, 2]
    }
  },
  // entities
  ANT: {
    PICKUP: {
      duration: 41 * 6,
      spriteOrder: [5, 6, 7]
    },
    PUTDOWN: {
      duration: 41 * 6,
      spriteOrder: [7, 6, 5]
    },
    FEED: {
      duration: 41 * 11,
      spriteOrder: [3, 4, 3, 0]
    },
    TURN: {
      duration: 41 * 6,
      spriteOrder: [1, 2, 3, 4]
    },
    MOVE: {
      duration: 41 * 12,
      spriteOrder: [1, 2, 3, 4]
    },
    MOVE_TURN: {
      duration: 41 * 14,
      spriteOrder: [1, 2, 3, 4]
    },
    EXAMINE: {
      duration: 41 * 24,
      spriteOrder: [9, 10, 11, 10, 11, 10]
    },
    DIE: {
      duration: 41 * 2,
      spriteOrder: [8]
    },
    BITE: {
      duration: 41 * 10,
      spriteOrder: [5, 6, 7, 6]
    },
    LAY: {
      duration: 41 * 5,
      spriteOrder: [0]
    },
    DASH: {
      // placeholder
    },
    WHIRLWIND: {
      duration: 41 * 12,
      spriteOrder: [0]
    },
    STUN: {
      duration: 41 * 12,
      spriteOrder: [0]
    },
    GRAPPLE: {
      duration: 41 * 10,
      spriteOrder: [6, 7]
    },
    BURROW_HOME: {
      // placeholder
      duration: 41 * 8,
      spriteOrder: [0]
    },
    blockingTypes: ['FOOD', 'DIRT', 'ANT', 'SPIDER', 'SCORPION', 'BEETLE', 'STONE', 'DOODAD',
    // 'BACKGROUND',
    'PUPA', 'TERMITE', 'WORM', 'CENTIPEDE', 'CATERPILLAR', 'APHID', 'ROLY_POLY', 'VINE', 'SEED']
  },
  SPIDER: {
    hp: 100,
    damage: 10,
    width: 5,
    height: 5,
    eggHatchAge: 60000,
    eggLayingCooldown: 6000 * 3,
    maxEggs: 0,
    MOVE: {
      duration: 41 * 10,
      spriteOrder: [1, 2, 3, 4, 5]
    },
    BITE: {
      duration: 41 * 5,
      spriteOrder: [6, 7]
    },
    DIE: {
      duration: 41 * 2,
      spriteOrder: [8]
    },
    TURN: {
      duration: 41 * 15,
      spriteOrder: [1, 2, 3, 4, 5]
    },
    MOVE_TURN: {
      duration: 41 * 22,
      spriteOrder: [1, 2, 3, 4, 5, 1, 2, 3, 4, 5]
    },
    LAY: {
      duration: 41 * 5,
      spriteOrder: [0]
    },
    BURROW_HOME: {
      // placeholder
      duration: 41 * 8,
      spriteOrder: [0]
    },
    STUN: {
      duration: 41 * 10,
      spriteOrder: [0]
    },
    blockingTypes: ['FOOD', 'DIRT', 'ANT', 'SPIDER', 'SCORPION', 'BEETLE', 'STONE', 'DOODAD',
    // 'BACKGROUND',
    'PUPA', 'TERMITE', 'WORM', 'CENTIPEDE', 'CATERPILLAR', 'APHID', 'ROLY_POLY', 'VINE', 'SEED']
  },
  SCORPION: {
    hp: 500,
    damage: 12,
    width: 6,
    height: 6,
    eggHatchAge: 60000,
    eggLayingCooldown: 6000 * 3,
    maxEggs: 0,
    MOVE: {
      duration: 41 * 10,
      spriteOrder: [0, 1, 2, 3]
    },
    BITE: {
      duration: 41 * 12,
      spriteOrder: [4, 5]
    },
    DIE: {
      duration: 41 * 2,
      spriteOrder: [6]
    },
    TURN: {
      duration: 41 * 15,
      spriteOrder: [0, 1, 2, 3]
    },
    MOVE_TURN: {
      duration: 41 * 22,
      spriteOrder: [0, 1, 1, 2, 3, 3]
    },
    LAY: {
      duration: 41 * 5,
      spriteOrder: [0]
    },
    BURROW_HOME: {
      // placeholder
      duration: 41 * 8,
      spriteOrder: [0]
    },
    STUN: {
      duration: 41 * 12,
      spriteOrder: [0]
    },
    WHIRLWIND: {
      duration: 41 * 15,
      effectIndex: 41 * 5,
      spriteOrder: [4, 5, 4, 5, 4, 5, 4, 5]
    },
    blockingTypes: ['FOOD', 'DIRT', 'ANT', 'SPIDER', 'SCORPION', 'BEETLE', 'STONE', 'DOODAD',
    // 'BACKGROUND',
    'PUPA', 'TERMITE', 'WORM', 'CENTIPEDE', 'CATERPILLAR', 'APHID', 'ROLY_POLY', 'VINE', 'SEED']
  },
  BEETLE: {
    hp: 30,
    damage: 5,
    width: 3,
    height: 3,
    eggHatchAge: 60000,
    eggLayingCooldown: 6000 * 3,
    maxEggs: 1,
    MOVE: {
      duration: 41 * 6,
      spriteOrder: [1, 1, 0, 2, 2, 0]
    },
    BITE: {
      duration: 41 * 15,
      spriteOrder: [3, 4, 0, 5, 3]
    },
    DIE: {
      duration: 41 * 2,
      spriteOrder: [6]
    },
    TURN: {
      duration: 41 * 12,
      spriteOrder: [1, 0, 2, 0]
    },
    MOVE_TURN: {
      duration: 41 * 16,
      spriteOrder: [1, 1, 0, 2, 2, 0]
    },
    LAY: {
      duration: 41 * 5,
      spriteOrder: [0]
    },
    BURROW_HOME: {
      // placeholder
      duration: 41 * 8,
      spriteOrder: [0]
    },
    STUN: {
      duration: 41 * 12,
      spriteOrder: [0]
    },
    blockingTypes: ['FOOD', 'DIRT', 'ANT', 'SPIDER', 'SCORPION', 'BEETLE', 'STONE', 'DOODAD',
    // 'BACKGROUND',
    'PUPA', 'TERMITE', 'WORM', 'CENTIPEDE', 'CATERPILLAR', 'APHID', 'ROLY_POLY', 'VINE', 'SEED']
  },
  ROLY_POLY: {
    hp: 40,
    damage: 0,
    width: 3,
    height: 3,
    eggHatchAge: 60000,
    eggLayingCooldown: 6000 * 3,
    maxEggs: 0,
    MOVE: {
      duration: 41 * 6,
      spriteOrder: [1, 1, 0, 2, 2, 0]
    },
    BITE: {
      duration: 41 * 15,
      spriteOrder: [1, 1, 0, 2, 2, 0]
    },
    DIE: {
      duration: 41 * 2,
      spriteOrder: [6]
    },
    TURN: {
      duration: 41 * 12,
      spriteOrder: [1, 0, 2, 0]
    },
    MOVE_TURN: {
      duration: 41 * 16,
      spriteOrder: [1, 1, 0, 2, 2, 0]
    },
    LAY: {
      duration: 41 * 5,
      spriteOrder: [0]
    },
    BURROW_HOME: {
      // placeholder
      duration: 41 * 8,
      spriteOrder: [0]
    },
    STUN: {
      duration: 41 * 12,
      spriteOrder: [0]
    },
    blockingTypes: ['FOOD', 'DIRT', 'ANT', 'SPIDER', 'SCORPION', 'BEETLE', 'STONE', 'DOODAD',
    // 'BACKGROUND',
    'PUPA', 'TERMITE', 'WORM', 'CENTIPEDE', 'CATERPILLAR', 'APHID', 'ROLY_POLY', 'VINE', 'SEED']
  },
  APHID: {
    hp: 15,
    damage: 2,
    width: 2,
    height: 2,
    eggHatchAge: 60000,
    eggLayingCooldown: 6000 * 3,
    maxEggs: 1,
    foodLayingCooldown: 4000,
    MOVE: {
      duration: 41 * 6,
      spriteOrder: [1, 1, 0, 2, 2, 0]
    },
    BITE: {
      duration: 41 * 15,
      spriteOrder: [1, 1, 0, 2, 2, 0]
    },
    DIE: {
      duration: 41 * 2,
      spriteOrder: [3]
    },
    TURN: {
      duration: 41 * 12,
      spriteOrder: [1, 0, 2, 0]
    },
    MOVE_TURN: {
      duration: 41 * 16,
      spriteOrder: [1, 1, 0, 2, 2, 0]
    },
    LAY: {
      duration: 41 * 5,
      spriteOrder: [0]
    },
    BURROW_HOME: {
      // placeholder
      duration: 41 * 8,
      spriteOrder: [0]
    },
    STUN: {
      duration: 41 * 12,
      spriteOrder: [0]
    },
    blockingTypes: ['FOOD', 'DIRT', 'ANT', 'SPIDER', 'SCORPION', 'BEETLE', 'STONE', 'DOODAD',
    // 'BACKGROUND',
    'PUPA', 'TERMITE', 'WORM', 'CENTIPEDE', 'CATERPILLAR', 'APHID', 'ROLY_POLY', 'VINE', 'SEED']
  },
  CENTIPEDE: {
    hp: 75,
    damage: 5,
    width: 1,
    height: 1,
    segmented: true,
    maxSegments: 16,
    eggHatchAge: 60000,
    eggLayingCooldown: 6000 * 3,
    maxEggs: 1,
    // sprites for each segment
    straight: 1,
    corner: 4,
    tail: 1,
    MOVE: {
      duration: 41 * 8,
      spriteOrder: [1, 2, 1, 3] // for 180, 90 = +3
    },

    BITE: {
      duration: 41 * 15,
      spriteOrder: [10, 0, 11]
    },
    DIE: {
      duration: 41 * 2,
      spriteOrder: [6] // placeholder
    },

    TURN: {
      duration: 41 * 1,
      spriteOrder: [0]
    },
    MOVE_TURN: {
      duration: 41 * 4,
      spriteOrder: [1, 1, 0, 2, 2, 0] // placeholder
    },

    LAY: {
      duration: 41 * 5,
      spriteOrder: [0]
    },
    BURROW_HOME: {
      // placeholder
      duration: 41 * 8,
      spriteOrder: [0]
    },
    STUN: {
      duration: 41 * 12,
      spriteOrder: [0]
    },
    blockingTypes: ['FOOD', 'DIRT', 'ANT', 'SPIDER', 'SCORPION', 'BEETLE', 'STONE', 'DOODAD',
    // 'BACKGROUND',
    'PUPA', 'TERMITE', 'WORM', 'CATERPILLAR', 'APHID', 'ROLY_POLY', 'VINE', 'SEED']
  },
  WORM: {
    hp: 50,
    damage: 0,
    width: 1,
    height: 1,
    segmented: true,
    growthRate: 0.2,
    maxSegments: 16,
    eggHatchAge: 60000,
    eggLayingCooldown: 6000 * 3,
    maxEggs: 1,
    // sprites for each segment
    straight: 1,
    corner: 7,
    tail: 0,
    MOVE: {
      duration: 41 * 10,
      spriteOrder: [2, 3, 4, 5, 6] // for 180, 90 = +6
    },

    BITE: {
      duration: 41 * 15,
      spriteOrder: [3, 4, 0, 5, 3]
    },
    DIE: {
      duration: 41 * 2,
      spriteOrder: [6]
    },
    TURN: {
      duration: 41 * 12,
      spriteOrder: [0]
    },
    LAY: {
      duration: 41 * 5,
      spriteOrder: [0]
    },
    BURROW_HOME: {
      // placeholder
      duration: 41 * 8,
      spriteOrder: [0]
    },
    STUN: {
      duration: 41 * 12,
      spriteOrder: [0]
    },
    blockingTypes: ['FOOD', 'ANT', 'SPIDER', 'SCORPION', 'BEETLE', 'STONE', 'DOODAD',
    // 'BACKGROUND',
    'PUPA', 'TERMITE', 'CENTIPEDE', 'CATERPILLAR', 'APHID', 'ROLY_POLY', 'VINE', 'SEED']
  },
  CATERPILLAR: {
    hp: 40,
    damage: 0,
    width: 1,
    height: 1,
    segmented: true,
    growthRate: 0.2,
    maxSegments: 12,
    eggHatchAge: 60000,
    eggLayingCooldown: 6000 * 3,
    maxEggs: 0,
    // sprites for each segment
    straight: 1,
    corner: 7,
    tail: 0,
    MOVE: {
      duration: 41 * 10,
      spriteOrder: [2, 3, 4, 5, 6] // for 180, 90 = +6
    },

    BITE: {
      duration: 41 * 15,
      spriteOrder: [3, 4, 0, 5, 3]
    },
    DIE: {
      duration: 41 * 2,
      spriteOrder: [6]
    },
    TURN: {
      duration: 41 * 12,
      spriteOrder: [0]
    },
    LAY: {
      duration: 41 * 5,
      spriteOrder: [0]
    },
    BURROW_HOME: {
      // placeholder
      duration: 41 * 8,
      spriteOrder: [0]
    },
    STUN: {
      duration: 41 * 12,
      spriteOrder: [0]
    },
    blockingTypes: ['FOOD', 'ANT', 'SPIDER', 'SCORPION', 'BEETLE', 'DIRT', 'STONE', 'DOODAD',
    // 'BACKGROUND',
    'PUPA', 'TERMITE', 'CENTIPEDE', 'APHID', 'ROLY_POLY', 'WORM', 'VINE', 'SEED']
  },
  VINE: {
    leafWidth: 3,
    leafHeight: 3,
    foodWidth: 4,
    foodHeight: 4,
    growthRate: 1400 * 3,
    // 40 ticks
    forkedGrowthRate: 3000 * 3,
    // ticks if you've grown already
    hp: 20,
    forkRate: 0.15,
    leafRate: 0.0075,
    foodRate: 0.75,
    seedRate: 0.05,
    // likelihood of getting a seed when a vine dies
    foodRateOnDeath: 0.2,
    // likelihood of getting a food when a vine dies
    waterMultiplier: 12,
    // how much faster you grow with water
    domesticateMultiplier: 12,
    // how much faster you grow w/domesticate pheromone
    blockingTypes: ['FOOD', 'DIRT', 'ANT', 'SPIDER', 'SCORPION', 'BEETLE', 'STONE', 'DOODAD',
    // 'BACKGROUND',
    'PUPA', 'TERMITE', 'WORM', 'CENTIPEDE', 'VINE', 'SEED']
  },
  SEED: {
    // hp: 10,
    growthTicks: 1200 * 3
  },
  // termites
  TERMITE_WORKER: {
    hp: 10,
    damage: 1,
    width: 1,
    height: 1,
    eggHatchAge: 50000,
    maxHold: 1,
    MOVE: {
      duration: 41 * 12,
      spriteOrder: [1, 2, 3, 2]
    },
    MOVE_TURN: {
      duration: 41 * 16,
      spriteOrder: [1, 2, 3, 2]
    },
    TURN: {
      duration: 41 * 4,
      spriteOrder: [1, 2, 3, 2]
    },
    FEED: {
      duration: 41 * 12,
      spriteOrder: [1, 2, 3, 2]
    },
    PICKUP: {
      duration: 41 * 6,
      spriteOrder: [1, 2]
    },
    PUTDOWN: {
      duration: 41 * 6,
      spriteOrder: [2, 1]
    },
    BITE: {
      duration: 41 * 10,
      spriteOrder: [1, 2, 3, 2]
    },
    GRAPPLE: {
      duration: 41 * 10,
      spriteOrder: [1, 2]
    },
    DIE: {
      duration: 41 * 2,
      spriteOrder: [4]
    },
    STUN: {
      duration: 41 * 12,
      spriteOrder: [0]
    }
  },
  TERMITE_SOLDIER: {
    hp: 80,
    damage: 5,
    width: 3,
    height: 3,
    eggHatchAge: 60000,
    maxHold: 0,
    PICKUP: {
      duration: 41 * 6,
      spriteOrder: [5, 6, 7]
    },
    PUTDOWN: {
      duration: 41 * 6,
      spriteOrder: [7, 6, 5]
    },
    FEED: {
      duration: 41 * 11,
      spriteOrder: [3, 4, 3, 0]
    },
    TURN: {
      duration: 41 * 12,
      spriteOrder: [1, 2, 3, 4]
    },
    MOVE: {
      duration: 41 * 10,
      spriteOrder: [1, 2, 3, 4]
    },
    MOVE_TURN: {
      duration: 41 * 20,
      spriteOrder: [1, 2, 3, 4]
    },
    DIE: {
      duration: 41 * 2,
      spriteOrder: [8]
    },
    BITE: {
      duration: 41 * 10,
      spriteOrder: [5, 6, 7, 6]
    },
    STUN: {
      duration: 41 * 12,
      spriteOrder: [0]
    }
  },
  TERMITE_QUEEN: {
    hp: 300,
    damage: 0,
    width: 3,
    height: 6,
    maxHold: 0,
    LAY: {
      duration: 41 * 12,
      spriteOrder: [1, 2, 3, 4],
      effectIndex: 41 * 10
    },
    DIE: {
      duration: 41 * 2,
      spriteOrder: [5]
    },
    STUN: {
      duration: 41 * 12,
      spriteOrder: [0]
    }
  },
  TERMITE: {
    // placeholders:
    PICKUP: {},
    PUTDOWN: {},
    FEED: {},
    TURN: {
      duration: 41 * 5,
      spriteOrder: [1, 2, 3, 4]
    },
    MOVE: {
      duration: 41 * 10,
      spriteOrder: [1, 2, 3, 4]
    },
    MOVE_TURN: {
      duration: 41 * 12,
      spriteOrder: [1, 2, 3, 4]
    },
    STUN: {
      duration: 41 * 12,
      spriteOrder: [0]
    },
    DIE: {},
    BITE: {},
    LAY: {},
    GRAPPLE: {},
    BURROW_HOME: {
      // placeholder
      duration: 41 * 8,
      spriteOrder: [0]
    },
    blockingTypes: ['FOOD', 'DIRT', 'ANT', 'SPIDER', 'SCORPION', 'BEETLE', 'STONE', 'DOODAD',
    // 'BACKGROUND',
    'PUPA', 'TERMITE', 'WORM', 'CENTIPEDE', 'VINE', 'SEED']
  },
  FOOT: {
    hp: 100000,
    damage: 1000,
    width: 16,
    // 18
    height: 30,
    // 32
    stompTicks: 450 * 3,
    maxStompTicks: 6000 * 3,
    rumbleTicks: 180 * 3,
    FALL: {
      duration: 41 * 250,
      spriteOrder: [0]
    },
    STOMP: {
      duration: 41 * 100,
      spriteOrder: [0]
    },
    LIFT: {
      duration: 41 * 40,
      spriteOrder: [0]
    },
    MOVE: {
      duration: 41 * 20,
      spriteOrder: [0]
    },
    BURROW_HOME: {
      // placeholder
      duration: 41 * 8,
      spriteOrder: [0]
    }
  },
  // pheromones
  COLONY: {
    quantity: 350,
    decayAmount: 1,
    color: 'rgb(0, 0, 255)',
    tileIndex: 1
  },
  RAID_PHER: {
    quantity: 350,
    decayAmount: 1,
    color: 'rgb(0, 0, 255)',
    tileIndex: 1
  },
  PASS_THROUGH_COLONY: {
    quantity: 350,
    decayAmount: 1,
    color: 'rgb(0, 0, 255)',
    tileIndex: 1
  },
  FOOD: {
    quantity: 100,
    decayAmount: 40,
    decayRate: 0.03,
    // how much it decays per tick
    color: 'rgb(0, 255, 0)',
    tileIndex: 0
  },
  EGG: {
    quantity: 200,
    decayAmount: 1,
    color: 'rgb(0, 139, 139)',
    tileIndex: 4
  },
  LARVA: {
    quantity: 60,
    decayAmount: 1,
    color: 'rgb(138, 43, 226)',
    tileIndex: 4
  },
  MOVE_LARVA_PHER: {
    quantity: 200,
    decayAmount: 1,
    color: 'rgb(138, 43, 226)',
    tileIndex: 4
  },
  PUPA: {
    quantity: 200,
    decayAmount: 1,
    color: 'rgb(233, 150, 132)',
    tileIndex: 4
  },
  DIRT_DROP: {
    quantity: 300,
    decayAmount: 1,
    color: 'rgb(210, 105, 30)',
    tileIndex: 5
  },
  ALERT: {
    quantity: 60,
    decayAmount: 10,
    decayRate: 0.5,
    // how much it decays per tick
    color: 'rgb(255, 0, 0)',
    tileIndex: 2
  },
  QUEEN_ALERT: {
    quantity: 120,
    decayAmount: 10,
    decayRate: 0.25,
    // how much it decays per tick
    color: 'rgb(255, 0, 0)',
    tileIndex: 2
  },
  QUEEN_FOLLOW: {
    quantity: 300,
    decayAmount: 1,
    color: 'rgb(210, 105, 30)',
    tileIndex: 5
  },
  QUEEN_PHER: {
    quantity: 140,
    decayAmount: 10,
    decayRate: 0.1,
    // how much it decays per tick
    color: 'rgb(255, 105, 180)',
    tileIndex: 1
  },
  CRITTER_PHER: {
    quantity: 80,
    decayAmount: 8,
    color: 'rgb(255, 0, 0)',
    tileIndex: 2
  },
  MARKED_DIRT_PHER: {
    quantity: 45,
    decayAmount: 1,
    color: 'rgb(210, 105, 30)',
    tileIndex: 5
  },
  WATER: {
    quantity: 12,
    decayAmount: 4,
    //decayRate: 0,
    decayRate: 0.0005,
    // how much it decays per tick
    color: 'rgb(0, 0, 255)',
    tileIndex: 1
  },
  ACID: {
    quantity: 10,
    decayAmount: 3,
    decayRate: 0.05,
    // how much it decays per tick
    color: 'rgb(0, 0, 255)',
    tileIndex: 3
  },
  PATROL_DEFEND_PHER: {
    quantity: 100,
    decayAmount: 10,
    decayRate: 0.125,
    // how much it decays per tick
    color: 'rgb(0, 0, 255)',
    tileIndex: 3
  },
  QUEEN_DISPERSE: {
    quantity: 60,
    decayAmount: 10,
    decayRate: 0.5,
    // how much it decays per tick
    color: 'rgb(0, 0, 255)',
    tileIndex: 3
  },
  DOMESTICATE: {
    quantity: 20,
    decayAmount: 1,
    color: 'rgb(0, 0, 255)',
    tileIndex: 0
  },
  // task-specific params
  WANDER: {
    base: 1,
    forwardMovementBonus: 0,
    ALERT: 500,
    QUEEN_ALERT: 500,
    FOOD: 10,
    COLONY: 0,
    // CRITTER_PHER: -100,
    QUEEN_PHER: 2000,
    QUEEN_DISPERSE: 500
  },
  RETRIEVE: {
    base: 1,
    forwardMovementBonus: 100,
    ALERT: 300,
    QUEEN_ALERT: 300,
    FOOD: 200,
    COLONY: -100,
    QUEEN_PHER: -100
  },
  RETURN: {
    base: 10,
    forwardMovementBonus: 500,
    ALERT: 1000,
    QUEEN_ALERT: 500,
    FOOD: 200,
    COLONY: 1000,
    CRITTER_PHER: 0
  },
  FEED_LARVA: {
    base: 1,
    forwardMovementBonus: 0,
    ALERT: -100,
    QUEEN_ALERT: -100,
    LARVA: 200,
    MOVE_LARVA_PHER: 0
  },
  MOVE_DIRT: {
    base: 1,
    forwardMovementBonus: 20,
    ALERT: 100,
    QUEEN_ALERT: 100,
    DIRT_DROP: 200
  },
  MOVE_EGG: {
    base: 1,
    forwardMovementBonus: 20,
    ALERT: 100,
    QUEEN_ALERT: 100,
    EGG: 200
  },
  MOVE_LARVA: {
    base: 1,
    forwardMovementBonus: 20,
    ALERT: 100,
    QUEEN_ALERT: 100,
    MOVE_LARVA_PHER: 200
  },
  MOVE_PUPA: {
    base: 1,
    forwardMovementBonus: 20,
    ALERT: 100,
    QUEEN_ALERT: 100,
    PUPA: 200
  },
  DEFEND: {
    base: 3,
    forwardMovementBonus: 40,
    ALERT: 100,
    QUEEN_ALERT: 800,
    // CRITTER_PHER: 1500,
    QUEEN_PHER: 20,
    QUEEN_DISPERSE: 500
  },
  PATROL_DEFEND: {
    base: 3,
    forwardMovementBonus: 40,
    ALERT: 100,
    QUEEN_ALERT: 500,
    PATROL_DEFEND_PHER: 100,
    // CRITTER_PHER: 1500,
    QUEEN_PHER: 20
  },
  QUEEN_WANDER: {
    base: 500,
    forwardMovementBonus: 0,
    ALERT: 100,
    COLONY: 100,
    EGG: 100,
    LARVA: 100,
    MOVE_LARVA_PHER: 100,
    PUPA: 100,
    CRITTER_PHER: -100
  },
  QUEEN_FOLLOW_MOUSE: {
    base: 0,
    forwardMovementBonus: 0,
    QUEEN_FOLLOW: 50
  },
  EXPLORE: {
    base: 10,
    forwardMovementBonus: 0,
    ALERT: 300,
    QUEEN_ALERT: 800,
    FOOD: 500,
    COLONY: 100,
    CRITTER_PHER: -100
  },
  GO_TO_DIRT: {
    base: 1,
    forwardMovementBonus: 20,
    ALERT: 100,
    QUEEN_ALERT: 100,
    MARKED_DIRT_PHER: 300
  },
  ATTACK: {
    // NOTE: is actually handled based on the opposing playerID
    base: 1,
    forwardMovementBonus: 40,
    ALERT: 1000,
    QUEEN_ALERT: 1000,
    FOOD: -100,
    COLONY: 1000
  },
  PATROL: {
    base: 5,
    forwardMovementBonus: 0,
    ALERT: 100,
    QUEEN_ALERT: 500,
    FOOD: -100,
    COLONY: 100,
    QUEEN_PHER: 15000
  },
  RAID: {
    base: 1,
    forwardMovementBonus: 5,
    RAID_PHER: 100
  },
  FLY_AWAY: {
    base: 1,
    forwardMovementBonus: 5,
    PASS_THROUGH_COLONY: -100
  },
  GO_TO_BLOCKAGE: {
    // NOTE: is actually handled based on the opposing playerID
    base: 1,
    forwardMovementBonus: 5,
    PASS_THROUGH_COLONY: 100
  }
};
module.exports = {
  config
};
},{}],2:[function(require,module,exports){
const {
  add,
  subtract,
  equals,
  makeVector,
  vectorTheta
} = require('../utils/vectors');
const {
  getNeighborEntities
} = require('../selectors/neighbors');
const {
  isDiagonalMove,
  thetaToDir
} = require('../utils/helpers');
const makeEntity = (type, position, width, height) => {
  return {
    id: -1,
    // NOTE: this is set by the reducer
    type,
    position,
    age: 0,
    prevPosition: position,
    width: width != null ? width : 1,
    height: height != null ? height : 1,
    theta: 0,
    prevTheta: 0
  };
};
const makeVine = (game, position, subType, theta) => {
  const config = game.config;
  const width = subType == 'LEAF' ? config.VINE.leafWidth : 1;
  const height = subType == 'LEAF' ? config.VINE.leafHeight : 1;
  const vine = {
    ...makeEntity('VINE', position, width, height),
    theta: theta || 0,
    subType,
    hp: config['VINE'].hp,
    forked: false,
    roots: [],
    // Array<Vector>
    sprouts: [],
    // Array<Theta>
    growthAge: 0
  };
  if (subType == 'STALK') {
    vine.roots = getNeighborEntities(game, vine).filter(e => e.type == 'STONE' || e.type == 'DIRT').filter(e => !isDiagonalMove(e.position, vine.position)).map(e => subtract(e.position, vine.position))
    // don't create overlapping vines
    .filter(p => {
      return getNeighborEntities(game, {
        ...vine,
        position: add(p, vine.position)
      }).filter(e => !isDiagonalMove(e.position, p)).filter(e => {
        if (e.type == 'VINE' && e.subType == 'STALK') {
          const rootPositions = e.roots.map(pos => add(pos, e.position));
          return rootPositions.filter(pos => equals(add(p, vine.position), pos)).length != 0;
        }
        return false;
      }).length == 0;
    });
  }
  return vine;
};
const makeSeed = (game, position, plantType) => {
  const config = game.config;
  return {
    ...makeEntity('SEED', position, 1, 1),
    // hp: config['SEED'].hp,
    plantType
  };
};
const makeFoot = (game, position) => {
  const config = game.config;
  const foot = {
    ...makeEntity('FOOT', position, 1, 1 // starting width and height
    ),

    theta: 3 * Math.PI / 2,
    prevWidth: 1,
    prevHeight: 1,
    hp: config['FOOT'].hp,
    damage: config['FOOT'].damage,
    stompTicks: config['FOOT'].stompTicks,
    numStomps: 0,
    actions: [],
    state: 'lifted' // 'falling', 'stomping'
  };

  return foot;
};
const makeAnt = (game, position, playerID, caste, isGoalCritter) => {
  const config = game.config[playerID];
  const ant = {
    ...makeEntity('ANT', position, config[caste].width, config[caste].height),
    playerID,
    caste,
    hp: config[caste].hp,
    prevHP: config[caste].hp,
    prevHPAge: 0,
    damage: config[caste].damage,
    fighting: null,
    holding: null,
    holdingIDs: [],
    // for media, treat holding like a stack
    task: 'WANDER',
    timeOnTask: 0,
    actions: [],
    lastHeldID: null,
    foodPherQuantity: 0,
    // ant tracks for itself how much food
    // pheromone to emit

    // this frame offset allows iterating through spritesheets across
    // multiple actions (rn only used by queen ant doing one full walk
    // cycle across two MOVE actions)
    frameOffset: 0,
    isGoalCritter
  };
  if (caste == 'QUEEN') {
    ant.eggLayingCooldown = 0;
    ant.eggLayingCharge = config.eggLayingCooldown;
    ant.eggCharges = 10;
    ant.task = game.playerID == playerID ? 'QUEEN_FOLLOW_MOUSE' : 'QUEEN_WANDER';
    ant.selectedPheromone = 'QUEEN_ALERT';
    ant.selectedAbility = 'JUMP';
    ant.digCharge = 1;
    ant.pheromoneActive = false;
    ant.selectedCaste = 'MINIMA';
    ant.timeOnMove = 0; // for turning in place
  }

  if (caste == 'HONEY_POT') {
    ant.foodLayingCooldown = config[caste].foodLayingCooldown;
  }
  return ant;
};
const makeTermite = (game, position, playerID, caste, isGoalCritter) => {
  const config = game.config[playerID];
  const termite = {
    ...makeEntity('TERMITE', position, config[caste].width, config[caste].height),
    playerID,
    caste,
    hp: config[caste].hp,
    prevHP: config[caste].hp,
    prevHPAge: 0,
    damage: config[caste].damage,
    holding: null,
    task: 'WANDER',
    holdingIDs: [],
    // for media, treat holding like a stack
    timeOnTask: 0,
    actions: [],
    lastHeldID: null,
    // this frame offset allows iterating through spritesheets across
    // multiple actions (rn only used by queen ant doing one full walk
    // cycle across two MOVE actions)
    frameOffset: 0,
    isGoalCritter
  };
  if (caste == 'TERMITE_QUEEN') {
    termite.eggLayingCooldown = 0;
    termite.eggLayingCharge = config.eggLayingCooldown;
    termite.eggCharges = 1;
    termite.selectedCaste = 'TERMITE_WORKER';
  }
  return termite;
};
const makeDeadAnt = (game, position, playerID, caste) => {
  return {
    ...makeAnt(game, position, playerID, caste),
    type: 'DEAD_ANT'
  };
};
const makeDeadTermite = (game, position, playerID, caste) => {
  return {
    ...makeTermite(game, position, playerID, caste),
    type: 'DEAD_TERMITE'
  };
};
const makeEgg = (game, position, playerID, caste) => {
  const config = game.config[playerID];
  return {
    ...makeEntity('EGG', position, 1, 1),
    playerID,
    caste,
    actions: [],
    hp: 10,
    prevHP: 10,
    prevHPAge: 0,
    age: 0
  };
};
const makeCritterEgg = (game, position, critterType) => {
  const config = game.config;
  return {
    ...makeEntity('CRITTER_EGG', position, 1, 1),
    critterType,
    actions: [],
    hp: 10,
    prevHP: 10,
    prevHPAge: 0,
    age: 0
  };
};
const makeTermiteEgg = (game, position, playerID, caste) => {
  const config = game.config[playerID];
  return {
    ...makeEntity('TERMITE_EGG', position, 1, 1),
    playerID,
    caste,
    actions: [],
    hp: 10,
    prevHP: 10,
    prevHPAge: 0,
    age: 0
  };
};
const makeLarva = (game, position, playerID, caste) => {
  const config = game.config[playerID];
  return {
    ...makeEntity('LARVA', position, 1, 1),
    playerID,
    caste,
    actions: [],
    hp: 10,
    prevHP: 10,
    prevHPAge: 0,
    foodNeed: config[caste].larvaFoodNeed
  };
};
const makePupa = (game, position, playerID, caste) => {
  const config = game.config[playerID];
  return {
    ...makeEntity('PUPA', position, 1, 1),
    playerID,
    caste,
    actions: [],
    hp: 10,
    prevHP: 10,
    prevHPAge: 0,
    age: 0
  };
};
const makeSpider = (game, position, isGoalCritter) => {
  const config = game.config['SPIDER'];
  // const mult = (widthOverride || config.width) / config.width;
  const mult = 1;
  return {
    ...makeEntity('SPIDER', position,
    // widthOverride || config.width, heightOverride || config.height,
    config.width, config.height),
    hp: config.hp * mult,
    prevHP: config.hp * mult,
    prevHPAge: 0,
    damage: config.damage * mult,
    eggCharges: config.maxEggs,
    totalEggsLaid: 0,
    actions: [],
    isGoalCritter
  };
};
const makeDeadSpider = (game, position) => {
  return {
    ...makeSpider(game, position),
    type: 'DEAD_SPIDER'
  };
};
const makeSpiderWeb = (game, position, width, height) => {
  return {
    ...makeEntity('SPIDER_WEB', position, width || 10, height || 10),
    theta: Math.PI / 2
  };
};
const makeScorpion = (game, position, isGoalCritter) => {
  const config = game.config['SCORPION'];
  return {
    ...makeEntity('SCORPION', position, config.width, config.height),
    hp: config.hp,
    prevHP: config.hp,
    prevHPAge: 0,
    damage: config.damage,
    eggCharges: config.maxEggs,
    totalEggsLaid: 0,
    actions: [],
    isGoalCritter,
    attackIndex: 1
  };
};
const makeDeadScorpion = (game, position) => {
  return {
    ...makeScorpion(game, position),
    type: 'DEAD_SCORPION'
  };
};
const makeBeetle = (game, position, isGoalCritter) => {
  const config = game.config['BEETLE'];
  return {
    ...makeEntity('BEETLE', position, config.width, config.height),
    hp: config.hp,
    prevHP: config.hp,
    prevHPAge: 0,
    damage: config.damage,
    eggCharges: config.maxEggs,
    totalEggsLaid: 0,
    actions: [],
    isGoalCritter
  };
};
const makeDeadBeetle = (game, position) => {
  return {
    ...makeBeetle(game, position),
    type: 'DEAD_BEETLE'
  };
};
const makeAphid = (game, position) => {
  const config = game.config['APHID'];
  return {
    ...makeEntity('APHID', position, config.width, config.height),
    hp: config.hp,
    prevHP: config.hp,
    prevHPAge: 0,
    damage: config.damage,
    eggCharges: config.maxEggs,
    totalEggsLaid: 0,
    foodLayingCooldown: config.foodLayingCooldown,
    actions: []
  };
};
const makeDeadAphid = (game, position) => {
  return {
    ...makeAphid(game, position),
    type: 'DEAD_APHID'
  };
};
const makeRolyPoly = (game, position) => {
  const config = game.config['ROLY_POLY'];
  return {
    ...makeEntity('ROLY_POLY', position, config.width, config.height),
    hp: config.hp,
    prevHP: config.hp,
    prevHPAge: 0,
    damage: config.damage,
    eggCharges: config.maxEggs,
    totalEggsLaid: 0,
    actions: []
  };
};
const makeDeadRolyPoly = (game, position) => {
  return {
    ...makeRolyPoly(game, position),
    type: 'DEAD_ROLY_POLY'
  };
};
const makeFood = (game, position, width, height) => {
  return {
    ...makeEntity('FOOD', position, width, height),
    dictIndexStr: ''
  };
};
const makeDirt = (game, position, width, height) => {
  return {
    ...makeEntity('DIRT', position, width, height),
    marked: null,
    dictIndexStr: ''
  };
};
const makeStone = (game, position, subType, width, height) => {
  return {
    ...makeEntity('STONE', position, width, height),
    subType: subType == null || subType == 1 ? 'STONE' : subType,
    dictIndexStr: ''
  };
};
const makeDoodad = (game, position, width, height, sprite) => {
  return {
    ...makeEntity('DOODAD', position, width, height),
    sprite,
    theta: Math.PI / 2
  };
};
const makeBackground = (game, position, width, height, name) => {
  return {
    ...makeEntity('BACKGROUND', position, width, height),
    name
  };
};
const makeForeground = (game, position, width, height, name) => {
  return {
    ...makeEntity('FOREGROUND', position, width, height),
    name
  };
};
const makeToken = (game, position, playerID, pheromoneType) => {
  return {
    ...makeEntity('TOKEN', position),
    playerID,
    tokenRadius: 1,
    pheromoneType
  };
};
const makeWorm = (game, position, segmentPositions) => {
  const config = game.config['WORM'];
  const segments = [];
  let prevPos = position;
  for (let i = 0; i < segmentPositions.length - 1; i++) {
    const pos = segmentPositions[i];
    const nextPos = segmentPositions[i + 1];
    let segmentType = 'corner';
    let theta = 0;
    const beforeVec = subtract(prevPos, pos);
    const afterVec = subtract(pos, nextPos);
    if (beforeVec.x == 0 && afterVec.x == 0) {
      segmentType = 'straight';
      theta = beforeVec.y > afterVec.y ? Math.PI / 2 : 3 * Math.PI / 2;
    } else if (beforeVec.y == 0 && afterVec.y == 0) {
      segmentType = 'straight';
      theta = beforeVec.x > afterVec.x ? 2 * Math.PI : 0;
    } else {
      segmentType = 'corner';
      if (beforeVec.x > afterVec.x && beforeVec.y > afterVec.y) {
        theta = Math.PI;
      } else if (beforeVec.x < afterVec.x && beforeVec.y < afterVec.y) {
        theta = 0;
      } else if (beforeVec.x < afterVec.x && beforeVec.y > afterVec.y) {
        theta = 3 * Math.PI / 2;
      } else {
        theta = Math.PI / 2;
      }
    }
    segments.push({
      position: pos,
      theta,
      segmentType
    });
    prevPos = pos;
  }
  const segBeforeTailPos = segmentPositions.length > 1 ? segmentPositions[segmentPositions.length - 2] : position;
  const tailPos = segmentPositions[segmentPositions.length - 1];
  segments.push({
    position: tailPos,
    theta: vectorTheta(subtract(segBeforeTailPos, tailPos))
  });
  return {
    ...makeEntity('WORM', position),
    segmented: true,
    segments,
    hp: config.hp,
    prevHP: config.hp,
    prevHPAge: 0,
    damage: config.damage,
    eggCharges: config.maxEggs,
    totalEggsLaid: 0,
    actions: []
  };
};
const makeCaterpillar = (game, position, segments) => {
  const config = game.config['CATERPILLAR'];
  return {
    ...makeWorm(game, position, segments),
    type: 'CATERPILLAR',
    hp: config.hp,
    prevHP: config.hp,
    prevHPAge: 0,
    damage: config.damage,
    eggCharges: config.maxEggs,
    totalEggsLaid: 0,
    actions: []
  };
};
const makeCentipede = (game, position, segments, isGoalCritter) => {
  const config = game.config['CENTIPEDE'];
  return {
    ...makeEntity('CENTIPEDE', position),
    segmented: true,
    segments: segments.map(p => ({
      position: p
    })),
    hp: config.hp,
    prevHP: config.hp,
    prevHPAge: 0,
    damage: config.damage,
    eggCharges: config.maxEggs,
    totalEggsLaid: 0,
    actions: [],
    isGoalCritter
  };
};
const makeDeadWorm = (game, position, segments) => {
  return {
    ...makeWorm(game, position, segments),
    type: 'DEAD_WORM'
  };
};
const makeDeadCaterpillar = (game, position, segments) => {
  return {
    ...makeCaterpillar(game, position, segments),
    type: 'DEAD_CATERPILLAR'
  };
};
const makeDeadCentipede = (game, position, segments) => {
  return {
    ...makeCentipede(game, position, segments),
    type: 'DEAD_CENTIPEDE'
  };
};
module.exports = {
  makeEntity,
  makeAnt,
  makeFood,
  makeDirt,
  makeEgg,
  makeLarva,
  makePupa,
  makeToken,
  makeSpider,
  makeDeadAnt,
  makeDeadSpider,
  makeBeetle,
  makeDeadBeetle,
  makeScorpion,
  makeDeadScorpion,
  makeStone,
  makeDoodad,
  makeBackground,
  makeForeground,
  makeTermiteEgg,
  makeTermite,
  makeDeadTermite,
  makeFoot,
  makeSpiderWeb,
  makeWorm,
  makeDeadWorm,
  makeCentipede,
  makeDeadCentipede,
  makeVine,
  makeSeed,
  makeCritterEgg,
  makeCaterpillar,
  makeDeadCaterpillar,
  makeAphid,
  makeDeadAphid,
  makeRolyPoly,
  makeDeadRolyPoly
};
},{"../selectors/neighbors":5,"../utils/helpers":11,"../utils/vectors":13}],3:[function(require,module,exports){
// NOTE: requires are relative to current directory and not parent
// directory like every other file because this worker is not required by
// any other module and so does not go through the normal babel/browserify transforms.
// See the make file for how it works
const {
  add,
  multiply,
  subtract,
  equals,
  floor,
  containsVector
} = require('./utils/vectors');
const {
  isDiagonalMove
} = require('./utils/helpers');
const {
  oneOf
} = require('./utils/stochastic');
const {
  getNeighborPositions
} = require('./selectors/neighbors');
const {
  lookupInGrid
} = require('./utils/gridHelpers');
const {
  getPheromoneAtPosition,
  getQuantityForStalePos,
  getPheromoneBlockers
} = require('./selectors/pheromones');
const {
  encodePosition,
  decodePosition,
  clamp
} = require('./utils/helpers');
const {
  setPheromone,
  getBiggestNeighborVal
} = require('./simulation/pheromones');
const {
  insertEntityInGrid,
  removeEntityFromGrid
} = require('./simulation/entityOperations');

/**
 *
 * TODO: How to handle dispersing pheromones like water?
 *       Really that entire computation should also happen in the worker
 * TODO: Make sure that if another message is posted before finishing computing
 *       the previous that it queues up implicitly (or explicitly if needed)
 * TODO: Anything else that sets pheromone needs to stay in sync with the worker
 *        - refreshPheromones
 *          (This actually works fine except requires a duplication of floodFillPheromone
 *           when no one else does)
 *
 * This is a web worker to allow computing pheromones in a separate thread
 * since it can often take a long time.
 * Here's how this system works:
 * - The worker is created on game start with a reference to it on the game state
 * - It maintains a copy of the grid and all its pheromones
 * - Whenever the floodFillSources or reverseFloodFillSources change,
 *   then post a message to the worker to compute the new pheromone state
 * - It uses modified versions of the simulation/pheromones floodFill and reverseFloodFill
 *   functions to make a list of positions with new pheromone values
 * - The worker then sends this list back to a pheromoneWorkerSystem that listens
 *   for messages
 * - This system dispatches an action to update all the pheromones at once
 */

let game = null;
let floodFillQueue = [];
let reverseFloodFillQueue = [];
onmessage = function (ev) {
  const action = ev.data;
  switch (action.type) {
    case 'INIT':
      {
        // console.log("worker inited");
        game = {
          grid: action.grid,
          gridWidth: action.gridWidth,
          gridHeight: action.gridHeight,
          config: action.config,
          entities: action.entities,
          playerIDs: action.playerIDs,
          TOKEN: [...action.TOKEN],
          floodFillQueue: [],
          reverseFloodFillQueue: [],
          dispersingPheromonePositions: {}
        };
        for (const pherType of game.config.dispersingPheromones) {
          game.dispersingPheromonePositions[pherType] = {};
        }
        break;
      }
    case 'FLOOD_FILL':
      {
        // console.log("worker received flood fill request", action.floodFillSources);
        if (!game) break;
        game.floodFillQueue.push(...action.floodFillSources);
        startFloodFill();
        break;
      }
    case 'REVERSE_FLOOD_FILL':
      {
        // console.log("worker received reverse flood fill request");
        if (!game) break;
        game.reverseFloodFillQueue.push(...action.reverseFloodFillSources);
        startReverseFloodFill();
        break;
      }
    case 'CLEAR_STRANDED_PHEROMONES':
      {
        if (!game) break;
        clearStrandedPheromones();
        break;
      }
    case 'DISPERSE_PHEROMONES':
      {
        if (!game) break;
        startDispersePheromones();
        break;
      }
    case 'SET_PHEROMONE':
      {
        const {
          position,
          pheromoneType,
          quantity,
          playerID
        } = action;
        if (!game) break;
        setPheromone(game, position, pheromoneType, quantity, playerID);
        break;
      }
    case 'INSERT_IN_GRID':
      {
        const {
          entity
        } = action;
        if (!game) break;
        insertEntityInGrid(game, entity);
        game.entities[entity.id] = entity; // need to re-up this in case of
        // entity type change
        break;
      }
    case 'REMOVE_FROM_GRID':
      {
        const {
          entity
        } = action;
        if (!game) break;
        removeEntityFromGrid(game, entity);
        break;
      }
    case 'ADD_ENTITY':
      {
        const {
          entity
        } = action;
        if (!game) break;
        game.entities[entity.id] = entity;
        if (entity.type == 'TOKEN') {
          game.TOKEN.push(entity.id);
        }
        break;
      }
    case 'REMOVE_ENTITY':
      {
        const {
          entity
        } = action;
        if (!game) break;
        delete game.entities[entity.id];
        if (entity.type == 'TOKEN') {
          game.TOKEN = game.TOKEN.filter(id => id != entity.id);
        }
        break;
      }
    case 'SET_TOKEN_RADIUS':
      {
        const {
          token
        } = action;
        if (!game) break;
        game.entities[token.id] = token;
        break;
      }
  }
};
const clearStrandedPheromones = () => {
  const resultPositions = {};
  for (let x = 1; x < game.gridWidth - 1; x++) {
    for (let y = 1; y < game.gridHeight - 1; y++) {
      for (const pheromoneType of game.config.dispersingPheromones) {
        for (const playerID of game.playerIDs) {
          // console.log(x, y, pheromoneType, playerID);
          if (getPheromoneAtPosition(game, {
            x,
            y
          }, pheromoneType, playerID) == 0) {
            continue;
          }
          const encodedPos = encodePosition({
            x,
            y
          });
          if (game.dispersingPheromonePositions[pheromoneType][encodedPos] == null || game.dispersingPheromonePositions[pheromoneType][encodedPos].playerID != playerID) {
            resultPositions[encodedPos] = {
              pheromoneType,
              quantity: 0,
              playerID
            };
          }
        }
      }
    }
  }
  postMessage([resultPositions]);
};
const startFloodFill = () => {
  let result = [];
  for (const source of game.floodFillQueue) {
    if (source.stale) {
      source.quantity = getQuantityForStalePos(game, source.position, source.pheromoneType, source.playerID).quantity;
    }
    const positions = floodFillPheromone(game, source.pheromoneType, source.playerID, [source], {});
    if (Object.keys(positions).length > 0) {
      result.push(positions);
    }
  }
  game.floodFillQueue = [];
  postMessage(result);
};
const startReverseFloodFill = () => {
  let result = [];
  for (const source of game.reverseFloodFillQueue) {
    let neverFloodFill = false;
    if (source.pheromoneType == 'QUEEN_FOLLOW') {
      neverFloodFill = true;
    }
    const positions = reverseFloodFillPheromone(game, source.pheromoneType, source.playerID, [source.position], neverFloodFill);
    if (Object.keys(positions).length > 0) {
      result.push(positions);
    }
  }
  game.reverseFloodFillQueue = [];
  postMessage(result);
};
const startDispersePheromones = () => {
  const result = [];
  const nextDispersingPheromones = updateDispersingPheromones(game);
  for (const pherType in nextDispersingPheromones) {
    if (Object.keys(nextDispersingPheromones[pherType]).length > 0) {
      result.push(nextDispersingPheromones[pherType]);
    }
  }
  // console.log(result);
  if (result.length > 0) {
    postMessage(result);
  }
};

/**
 * use queue to continuously find neighbors and set their pheromone
 * value to decayAmount less, if that is greater than its current value
 */
const floodFillPheromone = (game, pheromoneType, playerID, posQueue, partialResults) => {
  const resultPositions = {
    ...partialResults
  };
  while (posQueue.length > 0) {
    const {
      position,
      quantity
    } = posQueue.shift();
    const isOccupied = lookupInGrid(game.grid, position).map(id => game.entities[id]).filter(e => getPheromoneBlockers(pheromoneType).includes(e.type)).length > 0;
    if ((!isOccupied || pheromoneType == 'MARKED_DIRT_PHER') && getPheromoneAtPosition(game, position, pheromoneType, playerID) < quantity) {
      setPheromone(game, position, pheromoneType, quantity, playerID);
      resultPositions[encodePosition(position)] = {
        pheromoneType,
        quantity,
        playerID
      };
      const neighborPositions = getNeighborPositions(game, {
        position
      }, false /* internal */);
      let decayAmount = game.config[playerID][pheromoneType].decayAmount;
      let amount = Math.max(0, quantity - decayAmount);
      if (pheromoneType == 'FOOD') {
        decayAmount = Math.max(quantity / 2, decayAmount);
        amount = Math.min(game.config[playerID].FOOD.quantity * 0.6, Math.max(0, quantity - decayAmount));
      }
      for (const neighbor of neighborPositions) {
        if (isDiagonalMove(position, neighbor)) continue;
        const neighborAmount = getPheromoneAtPosition(game, neighbor, pheromoneType, playerID);
        const occupied = lookupInGrid(game.grid, neighbor).map(id => game.entities[id]).filter(e => getPheromoneBlockers(pheromoneType).includes(e.type)).length > 0;
        if (amount > 0 && amount > neighborAmount && !occupied) {
          posQueue.push({
            position: neighbor,
            quantity: amount
          });
        }
      }
    }

    // dispersing pheromones decay separately
    if (game.config.dispersingPheromones.includes(pheromoneType)) {
      const encodedPos = encodePosition(position);
      const quantity = getPheromoneAtPosition(game, position, pheromoneType, playerID);
      if (quantity > 0 && game.dispersingPheromonePositions[pheromoneType][encodedPos] == null) {
        game.dispersingPheromonePositions[pheromoneType][encodedPos] = {
          position,
          playerID,
          pheromoneType,
          quantity
        };
      }
    }
  }
  return resultPositions;
};

/**
 * When a pheromoneBlocking entity is added into the grid, then it could close off
 * a path, requiring recalculation. So do:
 * Reverse flood fill where you start at the neighbors of the newly occupied position,
 * then 0 those positions out if they are bigger than all their neighbors,
 * then add THEIR non-zero neighbors to the queue and continue,
 * finally, re-do the flood fill on all the 0-ed out spaces in reverse order
 */
const reverseFloodFillPheromone = (game, pheromoneType, playerID, posQueue, neverFloodFill) => {
  const resultPositions = [];
  const floodFillQueue = [];
  if (pheromoneType == 'FOOD') {
    console.trace("hrmm");
  }
  while (posQueue.length > 0) {
    const position = posQueue.shift();
    const amount = getPheromoneAtPosition(game, position, pheromoneType, playerID);
    const neighborAmount = getBiggestNeighborVal(game, position, pheromoneType, playerID);
    const maxAmount = game.config[playerID][pheromoneType].quantity;
    const decayAmount = game.config[playerID][pheromoneType].decayAmount;
    let shouldFloodFill = true;
    if (neighborAmount <= amount) {
      shouldFloodFill = false;
      setPheromone(game, position, pheromoneType, 0, playerID);
      resultPositions[encodePosition(position)] = {
        pheromoneType,
        quantity: 0,
        playerID
      };
      const neighborPositions = getNeighborPositions(game, {
        position
      }, false /* internal */);
      for (const neighbor of neighborPositions) {
        if (isDiagonalMove(position, neighbor)) continue;
        const neighborAmount = getPheromoneAtPosition(game, neighbor, pheromoneType, playerID);
        if (neighborAmount > 0 && neighborAmount < maxAmount) {
          posQueue.push(neighbor);
        } else if (neighborAmount == maxAmount) {
          // neighboring a pheromone source, so flood fill from here,
          // simpler than the block below this that computes neighbor positions for flood fill
          floodFillQueue.push({
            position,
            quantity: maxAmount - decayAmount
          });
        }
      }
    }
    if (shouldFloodFill && !neverFloodFill) {
      // if you aren't bigger than your biggest neighbor, then your value
      // is actually fine. So then add this position to the floodFillQueue
      // since it's right on the edge of the area that needs to be re-filled in
      const neighborPositions = getNeighborPositions(game, {
        position
      }, false /* internal */);
      for (const neighbor of neighborPositions) {
        if (isDiagonalMove(position, neighbor)) continue;
        const occupied = lookupInGrid(game.grid, neighbor).map(id => game.entities[id]).filter(e => getPheromoneBlockers(pheromoneType).includes(e.type)).length > 0;
        const quantity = Math.max(0, amount - decayAmount);
        if (quantity > 0 && !occupied) {
          floodFillQueue.push({
            position: neighbor,
            quantity
          });
        }
      }
    }
  }
  if (!neverFloodFill) {
    return floodFillPheromone(game, pheromoneType, playerID, floodFillQueue, resultPositions);
  } else {
    return resultPositions;
  }
};

// fade pheromones that disperse
const updateDispersingPheromones = game => {
  const nextDispersingPheromones = {};
  for (const pherType of game.config.dispersingPheromones) {
    nextDispersingPheromones[pherType] = {};
  }
  const rate = game.config.dispersingPheromoneUpdateRate;
  let nextWater = {}; // the algorithm for gravity with water will try to push
  // the same source position multiple times, so don't let it
  for (const pherType in game.dispersingPheromonePositions) {
    for (const encodedPosition in game.dispersingPheromonePositions[pherType]) {
      const source = game.dispersingPheromonePositions[pherType][encodedPosition];
      const {
        position,
        playerID,
        pheromoneType
      } = source;
      let pheromoneQuantity = getPheromoneAtPosition(game, position, pheromoneType, playerID);

      // need to track if it became 0 on the last update and remove it now
      // (Can't remove it as soon as it becomes 0 or else we won't tell the client
      //  to also set itself to 0)
      if (pheromoneType != 'WATER' && pheromoneQuantity <= 0) {
        continue;
      }
      let decayRate = game.config[playerID][pheromoneType].decayRate;
      if (decayRate == null) {
        decayRate = game.config[playerID][pheromoneType].decayAmount;
      }
      if (pheromoneType == 'WATER') {
        const onVine = lookupInGrid(game.grid, position).map(id => game.entities[id]).filter(e => e.type == 'VINE').length > 0;
        if (onVine) {
          decayRate *= game.config['VINE'].waterMultiplier;
        }
      } else {
        decayRate *= rate;
      }
      if (pheromoneType == 'WATER') {
        let positionBelow = add(position, {
          x: 0,
          y: 1
        });
        let occupied = lookupInGrid(game.grid, positionBelow).map(id => game.entities[id]).filter(e => game.config.waterBlockingTypes.includes(e.type)).length > 0;
        let diagonal = false;
        let leftOrRight = false;
        if (occupied || getPheromoneAtPosition(game, positionBelow, pheromoneType, playerID) > game.config[playerID][pheromoneType].quantity - 1) {
          const botLeft = add(position, {
            x: -1,
            y: 1
          });
          const botRight = add(position, {
            x: 1,
            y: 1
          });
          const botLeftOccupied = lookupInGrid(game.grid, botLeft).map(id => game.entities[id]).filter(e => getPheromoneBlockers(pheromoneType).includes(e.type)).length > 0;
          const botRightOccupied = lookupInGrid(game.grid, botRight).map(id => game.entities[id]).filter(e => getPheromoneBlockers(pheromoneType).includes(e.type)).length > 0;
          if (!botLeftOccupied && !botRightOccupied) {
            positionBelow = oneOf([botLeft, botRight]);
            occupied = false;
            diagonal = true;
          } else if (!botLeftOccupied) {
            positionBelow = botLeft;
            occupied = false;
            diagonal = true;
          } else if (!botRightOccupied) {
            positionBelow = botRight;
            occupied = false;
            diagonal = true;
          } else {
            occupied = true;
            diagonal = true;
          }
        }
        const pheromoneDiag = getPheromoneAtPosition(game, positionBelow, 'WATER', playerID);
        if (diagonal || pheromoneDiag > 10) {
          const left = add(position, {
            x: -1,
            y: 0
          });
          const right = add(position, {
            x: 1,
            y: 0
          });
          const leftOccupied = lookupInGrid(game.grid, left).map(id => game.entities[id]).filter(e => getPheromoneBlockers(pheromoneType).includes(e.type)).length > 0;
          const rightOccupied = lookupInGrid(game.grid, right).map(id => game.entities[id]).filter(e => getPheromoneBlockers(pheromoneType).includes(e.type)).length > 0;
          if (!leftOccupied && !rightOccupied) {
            const leftPher = getPheromoneAtPosition(game, left, 'WATER', playerID);
            const rightPher = getPheromoneAtPosition(game, right, 'WATER', playerID);
            positionBelow = leftPher > rightPher ? right : left;
            positionBelow = leftPher == rightPher ? oneOf([left, right]) : positionBelow;
            // positionBelow = oneOf([left, right]);
            occupied = false;
            leftOrRight = true;
          } else if (!leftOccupied) {
            positionBelow = left;
            occupied = false;
            leftOrRight = true;
          } else if (!rightOccupied) {
            positionBelow = right;
            occupied = false;
            leftOrRight = true;
          }
          // don't spread left/right to a higher concentration
          // if (leftOrRight) {
          //   const leftRightQuantity =
          //     getPheromoneAtPosition(game, positionBelow, 'WATER', playerID);
          //   if (leftRightQuantity + 1 >= pheromoneQuantity) {
          //     occupied = true;
          //     leftOrRight = false;
          //   }
          // }
        }

        if (!occupied) {
          const pheromoneBelow = getPheromoneAtPosition(game, positionBelow, 'WATER', playerID);
          const maxQuantity = game.config[playerID].WATER.quantity;
          let targetPercentLeft = 0;
          if (diagonal) {
            targetPercentLeft = 0.5;
          }
          if (leftOrRight) {
            targetPercentLeft = 0.8;
          }
          let pherToGive = pheromoneQuantity * (1 - targetPercentLeft);
          if (pheromoneBelow + pherToGive > maxQuantity) {
            pherToGive = maxQuantity - pheromoneBelow;
          }
          let leftOverPheromone = pheromoneQuantity - pherToGive;
          // TODO: bring this back when water shouldn't decay
          // if (leftOverPheromone > 1) {
          //   decayRate = 0;
          // }

          // set pheromone at this position to the left over that couldn't fall down
          setPheromone(game, position, pheromoneType, leftOverPheromone - decayRate, playerID);
          if (!nextWater[encodePosition(position)]) {
            const nextQuantity = Math.max(0, leftOverPheromone - decayRate);
            if (nextQuantity != 0 || source.quantity != 0) {
              nextDispersingPheromones[pherType][encodePosition(position)] = {
                ...source,
                position: {
                  ...position
                },
                quantity: nextQuantity
              };
              nextWater[encodePosition(position)] = true;
            }
          }
          // update the source to be the next position
          pheromoneQuantity = pheromoneQuantity - leftOverPheromone + pheromoneBelow;
          source.position = positionBelow;
        }
      }

      // TODO: bring this back when water shouldn't decay
      // if (pheromoneType == 'WATER' && pheromoneQuantity > 1) {
      //   decayRate = 0;
      // }

      setPheromone(game, source.position, pheromoneType, Math.max(0, pheromoneQuantity - decayRate), playerID);
      if (pheromoneType == 'WATER') {
        if (pheromoneQuantity - decayRate > 0) {
          if (nextWater[encodePosition(source.position)]) {
            continue; // we've already done something with this water
          } else {
            nextWater[encodePosition(source.position)] = true;
          }
          nextDispersingPheromones[pherType][encodePosition(source.position)] = {
            ...source,
            quantity: Math.max(0, pheromoneQuantity - decayRate)
          };
        }
      } else {
        nextDispersingPheromones[pherType][encodePosition(source.position)] = {
          ...source,
          quantity: Math.max(0, pheromoneQuantity - decayRate)
        };
      }
    }
  }
  game.dispersingPheromonePositions = nextDispersingPheromones;
  return nextDispersingPheromones;
};

},{"./selectors/neighbors":5,"./selectors/pheromones":6,"./simulation/entityOperations":8,"./simulation/pheromones":9,"./utils/gridHelpers":10,"./utils/helpers":11,"./utils/stochastic":12,"./utils/vectors":13}],4:[function(require,module,exports){
const {
  lookupInGrid,
  getEntityPositions
} = require('../utils/gridHelpers');
const collides = (game, entityA, entityB) => {
  return collidesWith(game, entityA).filter(e => e.id === entityB.id).length > 0;
};
const collidesWith = (game, entity, blockingTypes) => {
  const positions = getEntityPositions(game, entity);
  const collisions = [];
  for (const pos of positions) {
    const thisCell = collisionsAtSpace(game, entity, blockingTypes, pos);
    collisions.push(...thisCell);
  }
  return collisions;
};

// use special logic to see what is considered a collision at a given space
const collisionsAtSpace = (game, entity, blockingTypes, pos, neighbor) => {
  const collisions = lookupInGrid(game.grid, pos).map(id => game.entities[id])
  // regular entities do not block themselves, but segmented entities do
  // BUT only when we are considering what neighboring spaces are free to move to,
  // NOT whether a move we've made collides with ourself
  .filter(e => {
    return entity.segmented && neighbor && !entity.stuck ? true : e.id != entity.id;
  }).filter(e => {
    // ant colliding with ant is more complicated:
    if (e.type == 'ANT' && entity.type == 'ANT' && blockingTypes.includes('ANT')) {
      // queen is not blocked by ants while dashing
      const curAction = entity.actions[0] ? entity.actions[0].type : 'NONE';
      if (entity.caste == 'QUEEN' && game.config[entity.playerID].queenArmored && curAction == 'DASH' && !blockingTypes.includes('ANT') // HACK this is required for dashing through
      ) {
        return false;
      }

      // blocked by enemy ants
      if (e.playerID != entity.playerID) {
        return true;
      }

      // not blocked if holding stuff
      if (entity.holding != null && e.holding == null) {
        // || e.holding != null) {
        return false;
      }

      // not blocked if greater caste than minima
      // if (
      //   (e.caste == 'MINIMA' && entity.caste != 'MINIMA') ||
      //   (entity.caste == 'MINIMA' && e.caste != 'MINIMA')
      // ) {
      //   return false;
      // }

      // young queens don't block each other
      // if (e.caste == 'YOUNG_QUEEN' && entity.caste == 'YOUNG_QUEEN') {
      //   return false;
      // }

      // ants not blocked by friendly ants of different caste
      // OR if they're both queens
      if ((entity.caste != e.caste || entity.caste == 'QUEEN') && e.playerID == entity.playerID) {
        return false;
      } else {
        return true;
      }
    }
    // special case for foot that is not stomping -- don't get blocked
    if (e.type == 'FOOT' && e.state != 'stomping') {
      return false;
    }
    return blockingTypes.includes(e.type);
  });
  return collisions;
};
module.exports = {
  collides,
  collidesWith,
  collisionsAtSpace
};
},{"../utils/gridHelpers":10}],5:[function(require,module,exports){
const {
  equals,
  add,
  subtract,
  containsVector
} = require('../utils/vectors');
const {
  lookupInGrid,
  insideGrid,
  getEntityPositions
} = require('../utils/gridHelpers');
const {
  collidesWith,
  collisionsAtSpace
} = require('../selectors/collisions');
const getNeighborEntities = (game, entity, external) => {
  if (entity.position == null) return [];
  const neighborIDs = [];
  const neighborPositions = getNeighborPositions(game, entity, external);
  for (const pos of neighborPositions) {
    const entitiesInCell = lookupInGrid(game.grid, pos).filter(id => !neighborIDs.includes(id) && id != entity.id);
    neighborIDs.push(...entitiesInCell);
  }
  return neighborIDs.map(id => game.entities[id]);
};
const getNeighborEntitiesAndPosition = (game, entity) => {
  if (entity.position == null) return [];
  const neighborObjs = [];
  const neighborPositions = getNeighborPositions(game, entity, true /* external */);
  for (const pos of neighborPositions) {
    const entitiesInCell = lookupInGrid(game.grid, pos).filter(id => !neighborObjs.includes(id) && id != entity.id);
    for (const id of entitiesInCell) {
      neighborObjs.push({
        entity: game.entities[id],
        position: pos
      });
    }
  }
  return neighborObjs;
};
const areNeighbors = (game, entityA, entityB) => {
  if (entityA == null || entityB == null) return false;
  const aNeighbors = getNeighborEntities(game, entityA, true);
  return aNeighbors.filter(e => e.id === entityB.id).length > 0;
};
const getFreeNeighborPositions = (game, entity, blockingTypes, external) => {
  const neighborPositions = getNeighborPositions(game, entity, external /* internal by default */);
  const freePositions = [];
  for (const pos of neighborPositions) {
    const isOccupied = collisionsAtSpace(game, entity, blockingTypes, pos, true /*neighbor*/).length > 0;

    // const alreadyCollidesWith = collidesWith(game, entity, blockingTypes)
    //   .map(e => e.id);
    // const alreadyColliding = entitiesAtPos
    //   .filter(e => !alreadyCollidesWith.includes(e.id))
    //   .length > 0;
    if (!isOccupied) {
      freePositions.push(pos);
    }
  }
  return freePositions;
};

/**
 * external means the neighbor positions should all be outside the entity,
 * regardless its size,
 * whereas !external means the directly-neighboring positions to the entity's
 * position value
 */
const getNeighborPositions = (game, entity, external) => {
  const positions = [];
  const neighbors = [
  // {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1},
  {
    x: -1,
    y: 1
  }, {
    x: 0,
    y: 1
  }, {
    x: 1,
    y: 1
  }, {
    x: -1,
    y: 0
  }, {
    x: 1,
    y: 0
  }, {
    x: -1,
    y: -1
  }, {
    x: 0,
    y: -1
  }, {
    x: 1,
    y: -1
  }];
  if (external) {
    const entityPositions = getEntityPositions(game, entity);
    for (const pos of entityPositions) {
      for (const n of neighbors) {
        const potentialNeighbor = add(n, pos);
        if (!containsVector(entityPositions, potentialNeighbor) && !containsVector(positions, potentialNeighbor) && insideGrid(game.grid, potentialNeighbor)) {
          positions.push(potentialNeighbor);
        }
      }
    }
  } else {
    for (const n of neighbors) {
      const potentialNeighbor = add(entity.position, n);
      if (insideGrid(game.grid, potentialNeighbor)) {
        positions.push(potentialNeighbor);
      }
    }
  }
  return positions;
};
module.exports = {
  getNeighborPositions,
  getNeighborEntities,
  getNeighborEntitiesAndPosition,
  getFreeNeighborPositions,
  areNeighbors
};
},{"../selectors/collisions":4,"../utils/gridHelpers":10,"../utils/vectors":13}],6:[function(require,module,exports){
const {
  add,
  multiply,
  subtract,
  equals,
  floor,
  containsVector
} = require('../utils/vectors');
const {
  isDiagonalMove
} = require('../utils/helpers');
const {
  getNeighborPositions
} = require('../selectors/neighbors');
const {
  lookupInGrid,
  getEntityPositions,
  insideGrid
} = require('../utils/gridHelpers');
const {
  getUnoccupiedPositionsInTokenRadius,
  getPositionsInTokenRadius,
  inTokenRadius
} = require('../selectors/tokens');
const globalConfig = require('../config');
const getPheromoneAtPosition = (game, position, type, playerID) => {
  const {
    grid
  } = game;
  if (!insideGrid(grid, position)) return 0;
  const {
    x,
    y
  } = position;
  return grid[x][y][playerID][type] || 0;
};

/**
 * When a position is opened up, get candidate {pos, quantity} based on the
 * pheromone value of the greatest neighbor OR
 * if this position is itself generating pheromones (because it's in a
 * token radius) then just return that value
 */
const getQuantityForStalePos = (game, position, pheromoneType, playerID) => {
  if (inTokenRadius(game, {
    position,
    playerID
  }, pheromoneType)) {
    return {
      position,
      quantity: game.config[playerID][pheromoneType].quantity
    };
  }
  const neighborPositions = getNeighborPositions(game, {
    position
  }, false /* internal */);
  const decayAmount = game.config[playerID][pheromoneType].decayAmount;
  let quantity = 0;
  for (const pos of neighborPositions) {
    if (isDiagonalMove(position, pos)) continue;
    let candidateAmount = getPheromoneAtPosition(game, pos, pheromoneType, playerID) - decayAmount;
    if (candidateAmount > quantity) {
      quantity = candidateAmount;
    }
  }
  return {
    position,
    quantity
  };
};

/**
 * If the given entity is a pheromone source, return it/any positions associated with
 * it that are also pheromone sources
 */
const getEntityPheromoneSources = (game, entity) => {
  const steadyStatePheromones = game.config.steadyStatePheromones;
  // these two are entities whose sources take up multiple positions:
  if (entity.type == 'TOKEN' && steadyStatePheromones.includes(entity.pheromoneType)) {
    const pherSources = getUnoccupiedPositionsInTokenRadius(game, entity, true).map(position => {
      const pheromoneType = entity.pheromoneType;
      const playerID = entity.playerID;
      const quantity = game.config[playerID][pheromoneType].quantity;
      return {
        id: entity.id,
        playerID,
        pheromoneType,
        position,
        quantity
      };
    });
    if (entity.pheromoneType == 'COLONY') {
      pherSources.push({
        id: entity.id,
        playerID: entity.playerID,
        quantity: game.config[entity.playerID]['PASS_THROUGH_COLONY'].quantity,
        position: entity.position,
        pheromoneType: 'PASS_THROUGH_COLONY'
      });
    }
    return pherSources;
  }
  // if (game.config.critterTypes.includes(entity.type)) {
  //   const pheromoneType = 'CRITTER_PHER';
  //   const playerID = game.playerID; // TODO: HACK: critters don't have a playerID, use player's
  //   const quantity = game.config[playerID][pheromoneType].quantity;
  //   return getEntityPositions(game, entity)
  //     .map(position => ({
  //       id: entity.id,
  //       playerID,
  //       pheromoneType,
  //       position,
  //       quantity,
  //     }));
  // }

  let pheromoneType = null;
  let playerID = null;
  let quantity = 0;
  if (entity.caste == 'QUEEN' && entity.selectedPheromone == 'QUEEN_PHER' && entity.pheromoneActive) {
    pheromoneType = 'QUEEN_PHER';
    playerID = entity.playerID;
    quantity = game.config[playerID][pheromoneType].quantity;
    return getEntityPositions(game, entity).map(position => ({
      id: entity.id,
      playerID,
      pheromoneType,
      position,
      quantity
    }));
  }
  if (entity.caste == 'QUEEN' && entity.selectedPheromone == 'QUEEN_DISPERSE' && entity.pheromoneActive) {
    pheromoneType = 'QUEEN_DISPERSE';
    playerID = entity.playerID;
    quantity = game.config[playerID][pheromoneType].quantity;
    return getEntityPositions(game, entity).map(position => ({
      id: entity.id,
      playerID,
      pheromoneType,
      position,
      quantity
    }));
  }
  // NOTE: PATROL_DEFEND_PHER is only at the position
  if (entity.caste == 'QUEEN' && entity.selectedPheromone == 'PATROL_DEFEND_PHER' && entity.pheromoneActive) {
    pheromoneType = 'PATROL_DEFEND_PHER';
    playerID = entity.playerID;
    quantity = game.config[playerID][pheromoneType].quantity;
    return getEntityPositions(game, entity).map(position => ({
      id: entity.id,
      playerID,
      pheromoneType,
      position,
      quantity
    }));
  }
  if (entity.caste == 'QUEEN' && entity.selectedPheromone == 'QUEEN_ALERT' && entity.pheromoneActive || entity.actions != null && entity.actions[0] != null && (entity.actions[0].type == 'BITE' || entity.actions[0].type == 'GRAPPLE') && (entity.type == 'ANT' && entity.playerID != game.playerID || entity.type == 'TERMITE')) {
    pheromoneType = 'QUEEN_ALERT';
    playerID = entity.playerID;
    quantity = game.config[playerID][pheromoneType].quantity;
    return getEntityPositions(game, entity).map(position => ({
      id: entity.id,
      playerID,
      pheromoneType,
      position,
      quantity
    }));
  }
  if (entity.holding != null && entity.holding.type == 'FOOD' && (entity.task == 'RETURN' || entity.caste == 'QUEEN')) {
    pheromoneType = 'FOOD';
    playerID = entity.playerID;
    quantity = entity.foodPherQuantity || 0;
    if (quantity == 0) {
      return [];
    }
  }
  if (entity.type == 'LARVA') {
    pheromoneType = 'LARVA';
    playerID = entity.playerID;
    quantity = game.config[playerID][pheromoneType].quantity;
  }
  if (entity.type == 'DIRT' && entity.marked != null) {
    pheromoneType = 'MARKED_DIRT_PHER';
    playerID = entity.marked;
    quantity = game.config[playerID][pheromoneType].quantity;
  }
  if (pheromoneType != null) {
    return [{
      id: entity.id,
      playerID,
      pheromoneType,
      position: entity.position,
      quantity
    }];
  }
  return [];
};

/**
 *  Function used at the game start to populate the initial set of pheromones
 *  across all entities emitting pheromones of the given type and playerID
 */
const getSourcesOfPheromoneType = (game, pheromoneType, playerID) => {
  let sources = [];
  switch (pheromoneType) {
    case 'MOVE_LARVA_PHER':
    case 'COLONY':
    case 'DIRT_DROP':
    case 'EGG':
    case 'PUPA':
    case 'DOMESTICATE':
      sources = game.TOKEN.map(id => game.entities[id]).filter(t => t.playerID == playerID && t.pheromoneType == pheromoneType);
      break;
    case 'PASS_THROUGH_COLONY':
      sources = game.TOKEN.map(id => game.entities[id]).filter(t => t.playerID == playerID && t.pheromoneType == 'COLONY');
      break;
    case 'LARVA':
      sources = game.LARVA.map(id => game.entities[id]).filter(l => l.playerID == playerID);
      break;
    case 'MARKED_DIRT_PHER':
      sources = game.markedDirtIDs.map(id => game.entities[id]).filter(dirt => dirt.marked == playerID);
      break;
    case 'ALERT':
    case 'FOOD':
    case 'QUEEN_PHER':
      // don't need to implement these since this function only runs at game start
      break;
    case 'CRITTER_PHER':
    // if (playerID != game.playerID) break; // CRITTERS only use player pheromone
    // for (const critterType of game.config.critterTypes) {
    //   for (const id of game[critterType]) {
    //     const critter = game.entities[id];
    //     sources.push(critter);
    //   }
    // }
    // break;
  }

  return sources;
};
const getPheromoneBlockers = pheromoneType => {
  if (pheromoneType == 'WATER') {
    return globalConfig.config.waterBlockingTypes;
  }
  if (pheromoneType == 'PASS_THROUGH_COLONY') {
    return globalConfig.config.passThroughColonyBlockingTypes;
  }
  return globalConfig.config.pheromoneBlockingTypes;
};
module.exports = {
  getPheromoneAtPosition,
  getSourcesOfPheromoneType,
  getEntityPheromoneSources,
  getQuantityForStalePos,
  getPheromoneBlockers
};
},{"../config":1,"../selectors/neighbors":5,"../selectors/tokens":7,"../utils/gridHelpers":10,"../utils/helpers":11,"../utils/vectors":13}],7:[function(require,module,exports){
const {
  add,
  makeVector,
  subtract,
  vectorTheta,
  round
} = require('../utils/vectors');
const {
  lookupInGrid,
  insideGrid
} = require('../utils/gridHelpers');
const tokenExists = (game, playerID, type) => {
  return getToken(game, playerID, type) != null;
};
const getToken = (game, playerID, type) => {
  return game.TOKEN.map(id => game.entities[id]).filter(t => t.playerID == playerID && t.pheromoneType == type)[0];
};
const inTokenRadius = (game, ant, pheromoneType) => {
  const token = getToken(game, ant.playerID, pheromoneType);
  if (token == null) return false;
  if (token.position == null) return false;
  const diff = subtract(ant.position, token.position);
  const inRadius = Math.abs(diff.x) + Math.abs(diff.y) <= token.tokenRadius;
  return inRadius;
};

/**
 * A hacky way to check if an ant is near-ish to a token.
 * Specifically for when using the RETURN task for ants holding nothing,
 * they should switch back to WANDER when they're just kinda close to
 * the COLONY token instead of causing a traffic jam trying to touch
 * the open spaces in the radius
 */
const inTokenInfluence = (game, ant, type) => {
  let influenceRadius = 3;
  // if (type == 'COLONY') {
  //   influenceRadius = 0;
  // }
  const token = getToken(game, ant.playerID, type);
  if (token == null) return false;
  if (token.position == null) return false;
  const diff = subtract(ant.position, token.position);
  return Math.abs(diff.x) + Math.abs(diff.y) <= token.tokenRadius + influenceRadius;
};
const getPositionsInTokenRadius = (game, token) => {
  const radius = token.tokenRadius;
  const positions = [];
  let position = token.position;
  if (token.position == null) {
    // TODO: it seems like this never happens
    position = token.prevPosition;
  }
  for (let x = 0; x <= radius; x++) {
    for (let y = 0; y <= radius; y++) {
      if (x + y <= radius) {
        positions.push(add({
          x,
          y
        }, position));
        if (x != 0) {
          positions.push(add({
            x: -x,
            y
          }, position));
        }
        if (y != 0) {
          positions.push(add({
            x,
            y: -y
          }, position));
        }
        if (x != 0 && y != 0) {
          positions.push(add({
            x: -x,
            y: -y
          }, position));
        }
      }
    }
  }
  return positions.filter(pos => insideGrid(game.grid, pos));
};
const getUnoccupiedPositionsInTokenRadius = (game, token, forPheromones, isForPassThrough) => {
  let positions = [token.position];
  if (!isForPassThrough) {
    positions = getPositionsInTokenRadius(game, token);
  }
  return positions.filter(pos => {
    const entities = lookupInGrid(game.grid, pos);
    return entities.map(id => game.entities[id]).filter(e => {
      if (!forPheromones) {
        return e.type != 'ANT' && e.type != 'BACKGROUND' && e.type.slice(0, 4) != 'DEAD' && e.type != 'SPIDER_WEB';
      } else {
        // NOTE: this is different from pheromoneBlockingTypes since
        // e.g. eggs don't block pheromone, but take up token radius
        return game.config.pheromoneBlockingTypes.includes(e.type);
      }
    }).length == 0;
  });
};
const getNumFoodInTokenRadius = (game, playerID) => {
  let token = null;
  for (const tokenID of game.TOKEN) {
    if (game.entities[tokenID].playerID == playerID && game.entities[tokenID].pheromoneType == 'COLONY') {
      token = game.entities[tokenID];
      break;
    }
  }
  if (!token) return 0;
  const positions = getPositionsInTokenRadius(game, token);
  return positions.filter(pos => {
    const entities = lookupInGrid(game.grid, pos);
    return entities.map(id => game.entities[id]).filter(e => e.type == 'FOOD').length > 0;
  }).length;
};

// window.tokens = {
//   getToken,
//   inTokenRadius,
//   tokenExists,
//   getPositionsInTokenRadius,
//   getUnoccupiedPositionsInTokenRadius,
//   inTokenInfluence,
// }

module.exports = {
  getToken,
  inTokenRadius,
  tokenExists,
  getPositionsInTokenRadius,
  getUnoccupiedPositionsInTokenRadius,
  inTokenInfluence,
  getNumFoodInTokenRadius
};
},{"../utils/gridHelpers":10,"../utils/vectors":13}],8:[function(require,module,exports){
const {
  add,
  subtract,
  vectorTheta,
  equals
} = require('../utils/vectors');
const {
  thetaToDir,
  closeTo,
  encodePosition
} = require('../utils/helpers');
const {
  insideGrid,
  insertInCell,
  deleteFromCell,
  getEntityPositions
} = require('../utils/gridHelpers');
const {
  getNeighborEntities,
  getNeighborPositions
} = require('../selectors/neighbors');
const {
  makeEntity
} = require('../entities/makeEntity');
const {
  getEntityPheromoneSources,
  getQuantityForStalePos,
  getPheromoneAtPosition,
  getPheromoneBlockers
} = require('../selectors/pheromones');
const {
  setPheromone
} = require('../simulation/pheromones');
const insertEntityInGrid = (game, entity) => {
  const dir = thetaToDir(entity.theta);
  if (entity.segmented) {
    const {
      position,
      segments
    } = entity;
    const nextSegments = [];
    // head
    insertInCell(game.grid, position, entity.id);

    // segments
    let prevPos = position;
    for (let i = 0; i < segments.length - 1; i++) {
      const pos = segments[i].position;
      const nextPos = segments[i + 1].position;
      let segmentType = 'corner';
      let theta = 0;
      const beforeVec = subtract(prevPos, pos);
      const afterVec = subtract(pos, nextPos);
      if (beforeVec.x == 0 && afterVec.x == 0) {
        segmentType = 'straight';
        theta = beforeVec.y > afterVec.y ? Math.PI / 2 : 3 * Math.PI / 2;
      } else if (beforeVec.y == 0 && afterVec.y == 0) {
        segmentType = 'straight';
        theta = beforeVec.x > afterVec.x ? 2 * Math.PI : 0;
      } else {
        segmentType = 'corner';
        if (beforeVec.x > afterVec.x && beforeVec.y > afterVec.y) {
          theta = Math.PI;
        } else if (beforeVec.x < afterVec.x && beforeVec.y < afterVec.y) {
          theta = 0;
        } else if (beforeVec.x < afterVec.x && beforeVec.y > afterVec.y) {
          theta = 3 * Math.PI / 2;
        } else {
          theta = Math.PI / 2;
        }
      }
      nextSegments.push({
        position: pos,
        theta,
        segmentType
      });
      prevPos = pos;
      insertInCell(game.grid, pos, entity.id);
    }

    // tail
    const segBeforeTailPos = segments.length > 1 ? segments[segments.length - 2].position : position;
    const tailPos = segments[segments.length - 1].position;
    nextSegments.push({
      position: tailPos,
      theta: vectorTheta(subtract(segBeforeTailPos, tailPos))
    });
    insertInCell(game.grid, tailPos, entity.id);
    entity.segments = nextSegments;
  } else {
    for (let x = 0; x < entity.width; x++) {
      for (let y = 0; y < entity.height; y++) {
        let pos = {
          x,
          y
        };
        if (dir == 'left' || dir == 'right') {
          pos = {
            x: y,
            y: x
          };
        }
        const gridPos = add(entity.position, pos);
        insertInCell(game.grid, gridPos, entity.id);
        if (game.config.pheromoneBlockingTypes.includes(entity.type) && game.pheromoneWorker) {
          game.dirtPutdownPositions = game.dirtPutdownPositions.filter(p => !equals(p, gridPos));
        }
      }
    }
  }

  // for the worker
  if (!game.pheromoneWorker) return;
  if (game.time > 1) {
    game.pheromoneWorker.postMessage({
      type: 'INSERT_IN_GRID',
      entity
    });
  }
  if (game.time > 1 && game.config.unanimatedTypes.includes(entity.type)) {
    markEntityAsStale(game, entity);
  }

  // tiled sprites updating:
  if (game.config.tiledTypes.includes(entity.type)) {
    game.staleTiles.push(entity.id);
    const neighbors = getNeighborEntities(game, entity, true /*external*/).filter(e => e.type == entity.type).map(e => e.id);
    game.staleTiles.push(...neighbors);
  }
  if (game.time < 1) return;
  // pheromone updating:
  const pherSources = getEntityPheromoneSources(game, entity);
  if (pherSources.length > 0) {
    // TODO: do I need to do this filter? NOTE that having it breaks critter pheromone
    // game.reverseFloodFillSources = game.reverseFloodFillSources
    //   .filter(s => s.id != entity.id);
    game.floodFillSources.push(...pherSources);
  } else if (game.config.pheromoneBlockingTypes.includes(entity.type)) {
    game.floodFillSources = game.floodFillSources.filter(s => s.id != entity.id);
    const neighborPositions = getNeighborPositions(game, entity, true /* external */);

    for (const playerID in game.players) {
      for (const pheromoneType of game.config.steadyStatePheromones) {
        // NOTE: dispersing pheromones never reverseFloodFill
        if (game.config.dispersingPheromones.includes(pheromoneType)) {
          setPheromone(game, entity.position, pheromoneType, 0, playerID);
          continue;
        }
        for (const pos of getEntityPositions(game, entity)) {
          setPheromone(game, pos, pheromoneType, 0, playerID);
        }
        const maxAmount = game.config[playerID][pheromoneType].quantity;
        for (const neighbor of neighborPositions) {
          const quantity = getPheromoneAtPosition(game, neighbor, pheromoneType, playerID);
          if (quantity < maxAmount) {
            game.reverseFloodFillSources.push({
              id: entity.id,
              position: neighbor,
              pheromoneType,
              playerID
            });
          }
        }
      }
    }
  }
};
const removeEntityFromGrid = (game, entity) => {
  const position = entity.position;
  const dir = thetaToDir(entity.theta);
  if (entity.segmented) {
    for (const segment of entity.segments) {
      deleteFromCell(game.grid, segment.position, entity.id);
    }
    deleteFromCell(game.grid, entity.position, entity.id);
  } else {
    for (let x = 0; x < entity.width; x++) {
      for (let y = 0; y < entity.height; y++) {
        let pos = {
          x,
          y
        };
        if (dir == 'left' || dir == 'right') {
          pos = {
            x: y,
            y: x
          };
        }
        const gridPos = add(entity.position, pos);
        deleteFromCell(game.grid, gridPos, entity.id);
      }
    }
  }

  // for the worker
  if (!game.pheromoneWorker) return;
  if (game.time > 1) {
    game.pheromoneWorker.postMessage({
      type: 'REMOVE_FROM_GRID',
      entity
    });
  }
  if (game.time > 1 && game.config.unanimatedTypes.includes(entity.type)) {
    markEntityAsStale(game, entity);
  }

  // tiled sprites updating:
  if (game.config.tiledTypes.includes(entity.type)) {
    game.staleTiles = game.staleTiles.filter(id => id != entity.id);
    const neighbors = getNeighborEntities(game, entity, true /*external*/).filter(e => e.type == entity.type).map(e => e.id);
    game.staleTiles.push(...neighbors);
  }
  if (game.time < 1) return;
  // pheromone updating:
  const pherSources = getEntityPheromoneSources(game, entity);
  if (pherSources.length > 0) {
    const pheromoneType = pherSources[0].pheromoneType;
    // NOTE: dispersing pheromones never reverseFloodFill
    if (game.config.dispersingPheromones.includes(pheromoneType)) {
      return;
    }
    const playerID = pherSources[0].playerID;
    // If you are added as a fill source AND removed from the grid on the same tick,
    // then the pheromone will stay behind because reverse fills are done before flood fills
    // So check if you are in the floodFill queue and just remove it:
    for (const source of pherSources) {
      game.floodFillSources = game.floodFillSources.filter(s => {
        return !(s.pheromoneType == source.pheromoneType && s.playerID == source.playerID && equals(s.position, source.position));
      });
    }

    // by adding 1, we force this position to be bigger than all its neighbors, which is how the
    // reverse flooding checks if a position is stale and should be set to 0
    for (const source of pherSources) {
      setPheromone(game, source.position, pheromoneType, source.quantity + 1, playerID);
    }
    game.reverseFloodFillSources.push(...pherSources);
  }
  // NOTE: not an else if because marked dirt needs both
  if (game.config.pheromoneBlockingTypes.includes(entity.type)) {
    // game.reverseFloodFillSources = game.reverseFloodFillSources.filter(s => s.id != entity.id);
    for (const playerID in game.players) {
      for (const pheromoneType of game.config.steadyStatePheromones) {
        if (pherSources.length > 0 && pherSources[0].pheromoneType == pheromoneType) {
          continue; // don't flood fill this type, we just removed it
        }

        const quantity = getQuantityForStalePos(game, position, pheromoneType, playerID).quantity;
        setPheromone(game, entity.position, pheromoneType, 0, playerID);
        game.floodFillSources.push({
          id: entity.id,
          position,
          quantity,
          pheromoneType,
          playerID,
          stale: true // if stale, then you override the quantity value when
          // it comes time to compute
        });
      }
    }
  }
};

const addEntity = (game, entity) => {
  entity.id = game.nextID++;
  game.entities[entity.id] = entity;

  // properties:
  game[entity.type].push(entity.id);
  // track queens separately
  if (
  // NOTE: larva can have the queen caste too!!
  (entity.type == 'ANT' && entity.caste == 'QUEEN' || entity.caste == 'TERMITE_QUEEN') && game.queens[entity.playerID] == null) {
    game.queens[entity.playerID] = entity.id;
  }
  if (entity.isGoalCritter) {
    game.GOAL_CRITTER[entity.id] = true;
  }
  if (game.pheromoneWorker && game.time > 1) {
    game.pheromoneWorker.postMessage({
      type: 'ADD_ENTITY',
      entity
    });
  }
  insertEntityInGrid(game, entity);
  return game;
};
const removeEntity = (game, entity) => {
  game[entity.type] = game[entity.type].filter(id => id != entity.id);

  // properties
  if (game.GOAL_CRITTER[entity.id]) {
    delete game.GOAL_CRITTER[entity.id];
  }
  if (game.queens[entity.playerID] == entity.id) {
    delete game.queens[entity.playerID];
  }
  delete game.entities[entity.id];
  if (game.pheromoneWorker && game.time > 1) {
    game.pheromoneWorker.postMessage({
      type: 'REMOVE_ENTITY',
      entity
    });
  }
  if (entity.position != null) {
    removeEntityFromGrid(game, entity);
  }
  return game;
};
const moveEntity = (game, entity, nextPos) => {
  entity.prevPosition = {
    ...entity.position
  };
  removeEntityFromGrid(game, entity);
  entity.position = {
    ...nextPos
  };
  // if it's segmented, also update the positions of all the segments
  // before inserting back into the grid
  if (entity.segmented) {
    let next = {
      ...entity.prevPosition
    };
    for (const segment of entity.segments) {
      const tmp = {
        ...segment.position
      };
      segment.position = next;
      next = tmp;
    }
  }
  insertEntityInGrid(game, entity);

  // only rotate if you have to, so as not to blow away prevTheta
  const nextTheta = vectorTheta(subtract(entity.prevPosition, entity.position));
  if (!closeTo(nextTheta, entity.theta)) {
    rotateEntity(game, entity);
  }
  return game;
};
const rotateEntity = (game, entity, nextTheta) => {
  if (entity.width != entity.height) {
    removeEntityFromGrid(game, entity);
  }
  entity.prevTheta = entity.theta;
  entity.theta = nextTheta;
  if (entity.width != entity.height) {
    insertEntityInGrid(game, entity);
  }
  return game;
};
const changeEntityType = (game, entity, oldType, nextType) => {
  // NOTE: remove then re-add to grid in order to get pheromones working right
  removeEntityFromGrid(game, entity);
  game[oldType] = game[oldType].filter(id => id != entity.id);
  game[nextType].push(entity.id);
  entity.type = nextType;
  insertEntityInGrid(game, entity);
};
const changeEntitySize = (game, entity, width, height) => {
  removeEntityFromGrid(game, entity);
  entity.prevWidth = entity.width;
  entity.prevHeight = entity.height;
  entity.width = width;
  entity.height = height;
  insertEntityInGrid(game, entity);
};
const addSegmentToEntity = (game, entity, segmentPosition) => {
  removeEntityFromGrid(game, entity);
  entity.segments.push({
    position: segmentPosition
  });
  insertEntityInGrid(game, entity);
};

///////////////////////////////////////////////////////////////////////////
// Entity Subdivision
///////////////////////////////////////////////////////////////////////////

const subdivideEntity = (game, entity) => {
  const subdivisions = [];
  const quadrantPositions = [{
    x: entity.position.x,
    y: entity.position.y
  }];
  if (entity.width > 1) {
    quadrantPositions.push({
      x: Math.floor(entity.position.x + entity.width / 2),
      y: entity.position.y
    });
  }
  if (entity.height > 1) {
    quadrantPositions.push({
      x: entity.position.x,
      y: Math.floor(entity.position.y + entity.height / 2)
    });
  }
  if (entity.width > 1 && entity.height > 1) {
    quadrantPositions.push({
      x: Math.floor(entity.position.x + entity.width / 2),
      y: Math.floor(entity.position.y + entity.height / 2)
    });
  }
  for (const pos of quadrantPositions) {
    const width = pos.x != entity.position.x ? entity.width - (pos.x - entity.position.x) : Math.max(1, Math.floor(entity.position.x + entity.width / 2) - pos.x);
    const height = pos.y != entity.position.y ? entity.height - (pos.y - entity.position.y) : Math.max(1, Math.floor(entity.position.y + entity.height / 2) - pos.y);
    // console.log(pos.x, pos.y, width, height);
    const quadrantEntity = {
      ...entity,
      // carry over other properties beside pos/dimensions
      ...makeEntity(entity.type, pos, width, height)
    };
    subdivisions.push(quadrantEntity);
  }
  return subdivisions;
};
const continuouslySubdivide = (game, entity, pickupPos) => {
  const subdivisions = subdivideEntity(game, entity);
  let toSub = null;
  for (const sub of subdivisions) {
    // check if pickupPos is inside this sub
    if (pickupPos.x >= sub.position.x && pickupPos.x < sub.position.x + sub.width && pickupPos.y >= sub.position.y && pickupPos.y < sub.position.y + sub.height) {
      toSub = sub;
    } else {
      addEntity(game, sub);
    }
  }
  if (toSub.width > 1 || toSub.height > 1) {
    return continuouslySubdivide(game, toSub, pickupPos);
  } else {
    addEntity(game, toSub);
    return toSub;
  }
};

///////////////////////////////////////////////////////////////////////////
// Pickup/Putdown
///////////////////////////////////////////////////////////////////////////

const pickupEntity = (game, entity, pickupPos) => {
  let toPickup = entity;
  removeEntityFromGrid(game, entity);
  entity.prevPosition = entity.position;
  // do the subdivision if entity is bigger
  // if (pickupPos != null && (entity.width > 1 || entity.height > 1)) {
  //   const sub = continuouslySubdivide(game, entity, pickupPos);
  //   removeEntityFromGrid(game, sub);
  //   sub.position = null;
  //   toPickup = sub;
  //   removeEntity(game, entity);
  // } else {
  entity.position = null;
  // }

  return toPickup;
};
const putdownEntity = (game, entity, pos) => {
  entity.position = {
    ...pos
  };
  entity.prevPosition = {
    ...pos
  };

  // NOTE: need to do this before inserting in the grid so it doesn't do
  // a flood fill unnecessarily
  if (entity.type == 'DIRT' && entity.marked) {
    entity.marked = null;
    game.markedDirtIDs = game.markedDirtIDs.filter(id => id != entity.id);
  }
  insertEntityInGrid(game, entity);
  return game;
};

// Helper function for insert/remove to mark as stale all entity positions
// plus all neighbor positions when computing the image-based rendering background
const markEntityAsStale = (game, entity) => {
  getEntityPositions(game, entity).forEach(pos => {
    const key = encodePosition(pos);
    if (!game.viewImage.stalePositions[key]) {
      game.viewImage.stalePositions[key] = pos;
    }
  });
  getNeighborPositions(game, entity).forEach(pos => {
    const key = encodePosition(pos);
    if (!game.viewImage.stalePositions[key]) {
      game.viewImage.stalePositions[key] = pos;
    }
  });
  game.viewImage.isStale = true;
};
module.exports = {
  addEntity,
  removeEntity,
  moveEntity,
  rotateEntity,
  pickupEntity,
  putdownEntity,
  changeEntityType,
  changeEntitySize,
  markEntityAsStale,
  addSegmentToEntity,
  // NOTE: only used by the worker!
  insertEntityInGrid,
  removeEntityFromGrid
};
},{"../entities/makeEntity":2,"../selectors/neighbors":5,"../selectors/pheromones":6,"../simulation/pheromones":9,"../utils/gridHelpers":10,"../utils/helpers":11,"../utils/vectors":13}],9:[function(require,module,exports){
const {
  add,
  multiply,
  subtract,
  equals,
  floor,
  containsVector
} = require('../utils/vectors');
const {
  isDiagonalMove
} = require('../utils/helpers');
const {
  getNeighborPositions
} = require('../selectors/neighbors');
const {
  lookupInGrid,
  getEntityPositions,
  insideGrid
} = require('../utils/gridHelpers');
const {
  getUnoccupiedPositionsInTokenRadius,
  getPositionsInTokenRadius
} = require('../selectors/tokens');
const {
  getPheromoneAtPosition,
  getSourcesOfPheromoneType,
  getQuantityForStalePos,
  getPheromoneBlockers
} = require('../selectors/pheromones');

/**
 * use queue to continuously find neighbors and set their pheromone
 * value to decayAmount less, if that is greater than its current value
 */
const floodFillPheromone = (game, pheromoneType, playerID, posQueue) => {
  const start = new Date().getTime();
  while (posQueue.length > 0) {
    const {
      position,
      quantity
    } = posQueue.shift();
    const isOccupied = lookupInGrid(game.grid, position).map(id => game.entities[id]).filter(e => getPheromoneBlockers(pheromoneType).includes(e.type)).length > 0;
    if ((!isOccupied || pheromoneType == 'MARKED_DIRT_PHER') && getPheromoneAtPosition(game, position, pheromoneType, playerID) < quantity) {
      setPheromone(game, position, pheromoneType, quantity, playerID);
      const neighborPositions = getNeighborPositions(game, {
        position
      }, false /* internal */);
      let decayAmount = game.config[playerID][pheromoneType].decayAmount;
      let amount = Math.max(0, quantity - decayAmount);
      if (pheromoneType == 'FOOD') {
        decayAmount = Math.max(quantity / 2, decayAmount);
        amount = Math.min(game.config[playerID].FOOD.quantity * 0.6, Math.max(0, quantity - decayAmount));
      }
      for (const neighbor of neighborPositions) {
        if (isDiagonalMove(position, neighbor)) continue;
        const neighborAmount = getPheromoneAtPosition(game, neighbor, pheromoneType, playerID);
        const occupied = lookupInGrid(game.grid, neighbor).map(id => game.entities[id]).filter(e => getPheromoneBlockers(pheromoneType).includes(e.type)).length > 0;
        if (amount > 0 && amount > neighborAmount && !occupied) {
          posQueue.push({
            position: neighbor,
            quantity: amount
          });
        }
      }
    }

    // dispersing pheromones decay separately
    if (game.config.dispersingPheromones.includes(pheromoneType)) {
      if (getPheromoneAtPosition(game, position, pheromoneType, playerID) > 0 && game.dispersingPheromonePositions.find(s => {
        return equals(s.position, position) && playerID == s.playerID && s.pheromoneType == pheromoneType;
      }) == null) {
        game.dispersingPheromonePositions.push({
          position,
          playerID,
          pheromoneType
        });
      }
    }
  }
  const end = new Date().getTime();
  if (end - start > 50 && game.time > 1) {
    console.log('frame took > 50ms to render', end - start, game.time, pheromoneType, playerID);
  }
};

/**
 * When a pheromoneBlocking entity is added into the grid, then it could close off
 * a path, requiring recalculation. So do:
 * Reverse flood fill where you start at the neighbors of the newly occupied position,
 * then 0 those positions out if they are bigger than all their neighbors,
 * then add THEIR non-zero neighbors to the queue and continue,
 * finally, re-do the flood fill on all the 0-ed out spaces in reverse order
 */
const reverseFloodFillPheromone = (game, pheromoneType, playerID, posQueue, neverFloodFill) => {
  const floodFillQueue = [];
  if (pheromoneType == 'FOOD') {
    console.trace("hrmm");
  }
  while (posQueue.length > 0) {
    const position = posQueue.shift();
    const amount = getPheromoneAtPosition(game, position, pheromoneType, playerID);
    const neighborAmount = getBiggestNeighborVal(game, position, pheromoneType, playerID);
    const maxAmount = game.config[playerID][pheromoneType].quantity;
    const decayAmount = game.config[playerID][pheromoneType].decayAmount;
    let shouldFloodFill = true;
    if (neighborAmount <= amount) {
      shouldFloodFill = false;
      setPheromone(game, position, pheromoneType, 0, playerID);
      const neighborPositions = getNeighborPositions(game, {
        position
      }, false /* internal */);
      for (const neighbor of neighborPositions) {
        if (isDiagonalMove(position, neighbor)) continue;
        const neighborAmount = getPheromoneAtPosition(game, neighbor, pheromoneType, playerID);
        if (neighborAmount > 0 && neighborAmount < maxAmount) {
          posQueue.push(neighbor);
        } else if (neighborAmount == maxAmount) {
          // neighboring a pheromone source, so flood fill from here,
          // simpler than the block below this that computes neighbor positions for flood fill
          floodFillQueue.push({
            position,
            quantity: maxAmount - decayAmount
          });
        }
      }
    }
    if (shouldFloodFill && !neverFloodFill) {
      // if you aren't bigger than your biggest neighbor, then your value
      // is actually fine. So then add this position to the floodFillQueue
      // since it's right on the edge of the area that needs to be re-filled in
      const neighborPositions = getNeighborPositions(game, {
        position
      }, false /* internal */);
      for (const neighbor of neighborPositions) {
        if (isDiagonalMove(position, neighbor)) continue;
        const occupied = lookupInGrid(game.grid, neighbor).map(id => game.entities[id]).filter(e => getPheromoneBlockers(pheromoneType).includes(e.type)).length > 0;
        const quantity = Math.max(0, amount - decayAmount);
        if (quantity > 0 && !occupied) {
          floodFillQueue.push({
            position: neighbor,
            quantity
          });
        }
      }
    }
  }
  if (!neverFloodFill) {
    floodFillPheromone(game, pheromoneType, playerID, floodFillQueue);
  }
};
const computeAllPheromoneSteadyState = game => {
  for (const playerID in game.players) {
    for (const pheromoneType of game.config.pheromoneTypes) {
      // elements in this queue will be of type:
      // {position: Vector, quantity: number}
      const posQueue = [];
      // find sources of the pheromoneType and add their positions to the queue
      getSourcesOfPheromoneType(game, pheromoneType, playerID).forEach(entity => {
        if (entity.type == 'TOKEN') {
          getUnoccupiedPositionsInTokenRadius(game, entity, true, pheromoneType == 'PASS_THROUGH_COLONY').forEach(position => {
            posQueue.push({
              position,
              quantity: game.config[playerID][pheromoneType].quantity
            });
          });
        }
        getEntityPositions(game, entity).forEach(position => {
          posQueue.push({
            position,
            quantity: game.config[playerID][pheromoneType].quantity
          });
        });
      });
      floodFillPheromone(game, pheromoneType, playerID, posQueue);
    }
  }
};

// ------------------------------------------------------------------
// Setters
// ------------------------------------------------------------------

/**
 *  Set the pheromone value of one specific position
 */
const setPheromone = (game, position, type, quantity, playerID, alreadyUpdatedWorker) => {
  const {
    config,
    grid
  } = game;
  if (!insideGrid(grid, position)) return;
  const {
    x,
    y
  } = position;
  if (type != 'FOOD') {
    grid[x][y][playerID][type] = Math.min(quantity, config[playerID][type].quantity);
  } else {
    grid[x][y][playerID][type] = quantity;
  }
  if (game.pheromoneWorker && !alreadyUpdatedWorker) {
    game.pheromoneWorker.postMessage({
      type: 'SET_PHEROMONE',
      position,
      pheromoneType: type,
      quantity,
      playerID
    });
  }
};

/**
 *  Add the pheromone source to the flood fill queue
 */
const fillPheromone = (game, position, pheromoneType, playerID, quantityOverride) => {
  const quantity = quantityOverride != null ? quantityOverride : game.config[playerID][pheromoneType].quantity;
  if (quantity == 0) {
    return;
  }
  game.floodFillSources.push({
    position,
    pheromoneType,
    playerID,
    quantity
  });
};

/**
 *  Add the pheromone source to the reverse flood fill queue
 */
const clearPheromone = (game, position, pheromoneType, playerID) => {
  const quantity = getPheromoneAtPosition(game, position, pheromoneType, playerID);
  setPheromone(game, position, pheromoneType, quantity + 1, playerID);
  game.reverseFloodFillSources.push({
    position,
    pheromoneType,
    playerID,
    quantity
  });
};

/**
 *  Recompute the pheromone values at this position across every
 *  pheromone type. Used for when e.g. a pupa hatches into an
 *  ant, need to re-fill in the space left behind by the pupa
 */
const refreshPheromones = (game, position) => {
  for (const playerID in game.players) {
    for (const pheromoneType of game.config.pheromoneTypes) {
      const quantity = getQuantityForStalePos(game, position, pheromoneType, playerID).quantity;
      if (quantity > 0) {
        game.floodFillSources.push({
          position,
          pheromoneType,
          playerID: parseInt(playerID),
          quantity,
          stale: true
        });
      }
    }
  }
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

const getBiggestNeighborVal = (game, position, pheromoneType, playerID) => {
  const neighborPositions = getNeighborPositions(game, {
    position
  }, false /* internal */);
  let quantity = 0;
  for (const pos of neighborPositions) {
    if (isDiagonalMove(position, pos)) continue;
    const candidateAmount = getPheromoneAtPosition(game, pos, pheromoneType, playerID);
    if (candidateAmount > quantity) {
      quantity = candidateAmount;
    }
  }
  return quantity;
};
module.exports = {
  computeAllPheromoneSteadyState,
  floodFillPheromone,
  reverseFloodFillPheromone,
  setPheromone,
  fillPheromone,
  clearPheromone,
  refreshPheromones,
  getBiggestNeighborVal
};
},{"../selectors/neighbors":5,"../selectors/pheromones":6,"../selectors/tokens":7,"../utils/gridHelpers":10,"../utils/helpers":11,"../utils/vectors":13}],10:[function(require,module,exports){
const globalConfig = require('../config');
const {
  thetaToDir,
  clamp
} = require('../utils/helpers');
const {
  add,
  multiply,
  subtract,
  equals,
  floor,
  containsVector
} = require('../utils/vectors');
const initGrid = (gridWidth, gridHeight, numPlayers) => {
  const grid = [];
  for (let x = 0; x < gridWidth; x++) {
    const col = [];
    for (let y = 0; y < gridHeight; y++) {
      const cell = {
        entities: []
      };
      for (let i = 0; i < numPlayers; i++) {
        cell[i + 1] = {};
        for (const pheromoneType of globalConfig.config.pheromoneTypes) {
          cell[i + 1][pheromoneType] = 0;
        }
      }
      col.push(cell);
    }
    grid.push(col);
  }
  return grid;
};
const insideGrid = (grid, position) => {
  if (position == null) return false;
  const {
    x,
    y
  } = position;
  return grid[x] != null && x >= 0 && y >= 0 && x < grid.length && y < grid[x].length;
};
const entityInsideGrid = (game, entity) => {
  const {
    gridWidth,
    gridHeight
  } = game;
  const {
    position,
    width,
    height
  } = entity;
  if (position == null) return false;
  const {
    x,
    y
  } = position;
  return x >= 0 && y >= 0 && x + width <= gridWidth && y + height <= gridHeight;
};
const lookupInGrid = (grid, position) => {
  if (!insideGrid(grid, position)) return [];
  return grid[position.x][position.y].entities;
};
const getPheromonesInCell = (grid, position, playerID) => {
  if (!insideGrid(grid, position)) return [];
  return grid[position.x][position.y][playerID];
};
const insertInCell = (grid, position, entityID) => {
  if (!insideGrid(grid, position)) return false;
  grid[position.x][position.y].entities.push(entityID);
  return true;
};
const deleteFromCell = (grid, position, entityID) => {
  if (!insideGrid(grid, position)) return true;
  const {
    x,
    y
  } = position;
  const oldLength = grid[x][y].entities.length;
  grid[x][y].entities = grid[x][y].entities.filter(id => id != entityID);
  return oldLength != grid[x][y].entities.length;
};
const canvasToGrid = (game, canvasPos) => {
  const config = globalConfig.config;
  let {
    viewPos,
    viewWidth,
    viewHeight
  } = game;

  // HACK: this is copypasta from the render/render.js function for maxMinimap
  if (game.maxMinimap) {
    const nextViewPos = {
      x: game.viewPos.x - game.viewWidth * 3 / 2,
      y: game.viewPos.y - game.viewHeight * 3 / 2
    };
    viewWidth *= 3;
    viewHeight *= 3;
    viewPos = {
      x: clamp(nextViewPos.x, 0, game.gridWidth - game.viewWidth * 3),
      y: clamp(nextViewPos.y, 0, game.gridHeight - game.viewHeight * 3)
    };
    if (viewWidth > game.gridWidth) {
      viewPos.x = game.gridWidth / 2 - viewWidth / 2;
    }
    if (viewHeight > game.gridHeight) {
      viewPos.y = game.gridHeight / 2 - viewHeight / 2;
    }
  }
  const scaleVec = {
    x: viewWidth / config.canvasWidth,
    y: viewHeight / config.canvasHeight
  };
  const gridCoord = floor(add({
    x: viewPos.x,
    y: viewPos.y
  }, multiply(canvasPos, scaleVec)));
  return floor(gridCoord);
};
const getEntityPositions = (game, entity) => {
  if (entity.segmented) {
    return [entity.position, ...entity.segments.map(s => s.position)];
  }
  const width = entity.width != null ? entity.width : 1;
  const height = entity.height != null ? entity.height : 1;
  const dir = thetaToDir(entity.theta);
  const positions = [];
  for (let x = 0; x < entity.width; x++) {
    for (let y = 0; y < entity.height; y++) {
      let pos = {
        x,
        y
      };
      if (dir == 'left' || dir == 'right') {
        pos = {
          x: y,
          y: x
        };
      }
      positions.push(add(entity.position, pos));
    }
  }
  return positions;
};
module.exports = {
  initGrid,
  // TODO: move gridHelpers out of utils/
  insideGrid,
  lookupInGrid,
  insertInCell,
  deleteFromCell,
  getPheromonesInCell,
  canvasToGrid,
  getEntityPositions,
  entityInsideGrid
};
},{"../config":1,"../utils/helpers":11,"../utils/vectors":13}],11:[function(require,module,exports){
const {
  subtract,
  vectorTheta
} = require('./vectors');
const clamp = (val, min, max) => {
  return Math.min(Math.max(val, min), max);
};

// NOTE: for angles in radians being close to each other!
const closeTo = (a, b) => {
  const normalizedA = a % (2 * Math.PI);
  const epsilon = 0.00001;
  return Math.abs(normalizedA - b) < epsilon;
};
const sameArray = (arrayA, arrayB) => {
  if (arrayA.length != arrayB.length) return false;
  for (let i = 0; i < arrayA.length; i++) {
    if (arrayA[i] != arrayB[i]) {
      return false;
    }
  }
  return true;
};
const thetaToDir = (theta, noDiagonal) => {
  // 90 degree only:
  if (noDiagonal) {
    const directions = ['left', 'down', 'right', 'up'];
    const deg = Math.round(theta * 180 / Math.PI);
    if (Math.round(deg / 45) % 2 != 0) return null;
    return directions[Math.round(deg / 90) % 4];
  }

  // including 45 degree:
  const directions = ['left', 'leftup', 'up', 'rightup', 'right', 'rightdown', 'down', 'leftdown'];
  const deg = Math.round(theta * 180 / Math.PI);
  if (Math.round(deg / 45) != deg / 45) return null;
  return directions[Math.round(deg / 45) % 8];
};
const isDiagonalTheta = theta => {
  const dir = thetaToDir(theta);
  return dir == 'leftdown' || dir == 'rightdown' || dir == 'rightup' || dir == 'leftup';
};
const isDiagonalMove = (vecA, vecB) => {
  if (vecA == null || vecB == null) return false;
  return isDiagonalTheta(vectorTheta(subtract(vecA, vecB)));
};
const encodePosition = pos => {
  return "" + pos.x + "," + pos.y;
};
const decodePosition = pos => {
  const [x, y] = pos.split(',');
  return {
    x,
    y
  };
};
const getDisplayTime = millis => {
  const seconds = Math.floor(millis / 1000);
  const minutes = Math.floor(seconds / 60);
  const leftOverSeconds = seconds - minutes * 60;
  let leftOverSecondsStr = leftOverSeconds == 0 ? '00' : '' + leftOverSeconds;
  if (leftOverSeconds < 10 && leftOverSeconds != 0) {
    leftOverSecondsStr = '0' + leftOverSecondsStr;
  }
  return `${minutes}:${leftOverSecondsStr}`;
};
const throttle = (func, args, wait) => {
  let inThrottle = false;
  return ev => {
    if (inThrottle) {
      return;
    }
    func(...args, ev);
    inThrottle = true;
    setTimeout(() => {
      inThrottle = false;
    }, wait);
  };
};
function deepCopy(obj) {
  if (typeof obj !== 'object' || obj == null) {
    return obj;
  }
  const copy = {};
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] != null) {
      if (Array.isArray(obj[key])) {
        copy[key] = [];
        for (const elem of obj[key]) {
          copy[key].push(deepCopy(elem));
        }
      } else {
        copy[key] = deepCopy(obj[key]);
      }
    } else {
      copy[key] = obj[key];
    }
  }
  return copy;
}
function isIpad() {
  return navigator.platform == 'MacIntel' && navigator.maxTouchPoints > 0 && !navigator.userAgent.match(/iPhone/i);
}
function isMobile() {
  const toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];
  return toMatch.some(toMatchItem => {
    return navigator.userAgent.match(toMatchItem);
  }) || isIpad();
}

// HACK: when we're in electron window.require is a function
function isElectron() {
  return false;
  return window.require != null;
}
module.exports = {
  clamp,
  closeTo,
  sameArray,
  thetaToDir,
  isDiagonalTheta,
  isDiagonalMove,
  encodePosition,
  decodePosition,
  getDisplayTime,
  isMobile,
  isIpad,
  deepCopy,
  throttle,
  isElectron
};
},{"./vectors":13}],12:[function(require,module,exports){
const {
  floor,
  sqrt,
  round
} = Math;
const rand = () => Math.random();

// return an integer between min and max, inclusive
const randomIn = (min, max) => floor(min + rand() * (max - min + 1));
const shamefulGaussian = () => (rand() + rand() + rand() + rand() + rand() + rand() - 3) / 3;
const normalIn = (min, max) => {
  const gaussian = shamefulGaussian();
  return floor(min + gaussian * (max - min + 1));
};
const oneOf = options => {
  if (options.length === 0) return null;
  return options[floor(rand() * options.length)];
};

// weights must be positive
const weightedOneOf = (options, weights) => {
  const cumulativeWeights = [];
  let sum = 0;
  for (let i = 0; i < options.length; i++) {
    sum += weights[i];
    cumulativeWeights.push(sum);
  }
  const randomVal = randomIn(0, sum - 1) + 1;
  let index = 0;
  for (; randomVal > cumulativeWeights[index]; index++);
  return options[index];
};
module.exports = {
  randomIn,
  normalIn,
  oneOf,
  weightedOneOf
};
},{}],13:[function(require,module,exports){
const {
  cos,
  sin
} = Math;
const add = (...vectors) => {
  const resultVec = {
    x: 0,
    y: 0
  };
  for (const v of vectors) {
    resultVec.x += v.x;
    resultVec.y += v.y;
  }
  return resultVec;
};
const equals = (a, b) => {
  return a.x == b.x && a.y == b.y;
};

// NOTE: see vectorTheta note if subtracting vectors to find the angle between them
const subtract = (...vectors) => {
  const resultVec = {
    ...vectors[0]
  };
  for (let i = 1; i < vectors.length; i++) {
    resultVec.x -= vectors[i].x;
    resultVec.y -= vectors[i].y;
  }
  return resultVec;
};
const makeVector = (theta, magnitude) => {
  const x = magnitude * cos(theta);
  const y = magnitude * sin(theta);
  return {
    x,
    y
  };
};
const dist = (vecA, vecB) => {
  return magnitude(subtract(vecA, vecB));
};
const scale = (vec, scalar) => {
  return {
    x: vec.x * scalar,
    y: vec.y * scalar
  };
};
const magnitude = vector => {
  const {
    x,
    y
  } = vector;
  return Math.sqrt(x * x + y * y);
};

// what is the angle of this vector
// NOTE: that when subtracting two vectors in order to compute the theta
// between them, the target should be the first argument
const vectorTheta = vector => {
  // shift domain from [-Math.PI, Math.PI] to [0, 2 * Math.PI]
  return (2 * Math.PI + Math.atan2(vector.y, vector.x)) % (2 * Math.PI);
};
const multiply = (...vectors) => {
  const resultVec = {
    x: 1,
    y: 1
  };
  for (let i = 0; i < vectors.length; i++) {
    resultVec.x *= vectors[i].x;
    resultVec.y *= vectors[i].y;
  }
  return resultVec;
};
const floor = vector => {
  return {
    x: Math.floor(vector.x),
    y: Math.floor(vector.y)
  };
};
const round = vector => {
  return {
    x: Math.round(vector.x),
    y: Math.round(vector.y)
  };
};
const ceil = vector => {
  return {
    x: Math.ceil(vector.x),
    y: Math.ceil(vector.y)
  };
};
const containsVector = (array, vec) => {
  for (const vector of array) {
    if (equals(vector, vec)) return true;
  }
  return false;
};
const abs = vector => {
  return {
    x: Math.abs(vector.x),
    y: Math.abs(vector.y)
  };
};

// given two positions, return a rectangle with the positions at opposite corners
const toRect = (posA, posB) => {
  const rect = {
    position: {
      x: Math.min(posA.x, posB.x),
      y: Math.min(posA.y, posB.y)
    },
    width: Math.abs(posA.x - posB.x) + 1,
    height: Math.abs(posA.y - posB.y) + 1
  };
  return rect;
};
const rotate = (vector, theta) => {
  const {
    x,
    y
  } = vector;
  return {
    x: cos(theta) * x - sin(theta) * y,
    y: sin(theta) * x + cos(theta) * y
  };
};
module.exports = {
  add,
  subtract,
  equals,
  makeVector,
  scale,
  dist,
  magnitude,
  vectorTheta,
  multiply,
  floor,
  round,
  ceil,
  containsVector,
  toRect,
  rotate,
  abs
};
},{}]},{},[3]);

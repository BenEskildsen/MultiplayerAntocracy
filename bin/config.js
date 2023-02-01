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
// @flow

const {config} = require('../config');

const makeConfig = (gridSize: Vector, numPlayers: number): Object => {
  // global config values
  const gameConfig = {
    msPerTick: config.msPerTick,

    canvasWidth: config.canvasWidth,
    canvasHeight: config.canvasHeight,

    showTaskColors: config.showTaskColors,
    showPheromoneValues: config.showPheromoneValues,

    pheromoneTypes: config.pheromoneTypes,
    steadyStatePheromones: config.steadyStatePheromones,
    dispersingPheromones: config.dispersingPheromones,
    dispersingPheromoneUpdateRate: config.dispersingPheromoneUpdateRate,
    clearStrandedPheromoneRate: config.clearStrandedPheromoneRate,
    // TODO: don't have pheromoneBlockingTypes on player config also
    pheromoneBlockingTypes: config.pheromoneBlockingTypes,
    waterBlockingTypes: config.waterBlockingTypes,
    tiledTypes: config.tiledTypes,
    unanimatedTypes: config.unanimatedTypes,
    critterTypes: config.critterTypes,
    tasks: config.tasks,

    spiderWebStuckProbability: config.spiderWebStuckProbability,

    termiteCastes: config.termiteCastes,
    FOOT: {...config.FOOT},
    VINE: {...config.VINE},
    SEED: {...config.SEED},
  };

  for (const critterType of config.critterTypes) {
    gameConfig[critterType] = {...config[critterType]};
  }

  // player-specific config values
  for (let i = 1; i <= numPlayers; i++) {
    const playerConfig = {
      eggLayingCooldown: config.eggLayingCooldown,
      maxEggCharges: config.maxEggCharges,

      numStartingWorkers: config.numStartingWorkers,

      cpuMediaThreshold: config.cpuMediaThreshold,
      cpuMajorThreshold: config.cpuMajorThreshold,
      attackTiming: config.attackTiming,
      maxLarva: config.maxLarva,

      exploreRate: config.exploreRate,
      baseScore: config.baseScore,
      prevPositionPenalty: config.prevPositionPenalty,

      castes: config.castes,

      pheromoneBlockingTypes: config.pheromoneBlockingTypes,
      castePickup: config.castePickup,
      antPickupTypes: config.antPickupTypes,
      queenPickupTypes: config.queenPickupTypes,
      warriorQueenBlockingTypes: config.warriorQueenBlockingTypes,
      youngQueensDoTasks: config.youngQueensDoTasks,

      queenArmored: config.queenArmored,
      queenBreaksUpGrapple: config.queenBreaksUpGrapple,
      megaColony: config.megaColony,
      // tokens you've unlocked
      startWithPupaToken: config.startWithPupaToken,
      startWithDomesticateToken: config.startWithDomesticateToken,
      startWithSeed: config.startWithSeed,

      queenPheromones: [...config.queenPheromones],
      queenAbilities: [...config.queenAbilities],
      queenLayingCastes: [...config.queenLayingCastes],
      queenMaxDigCharge: config.queenMaxDigCharge,
      queenDashDist: config.queenDashDist,
      suppressionRadius: config.suppressionRadius,
      suppressionMultiplier: config.suppressionMultiplier,

      minTermiteSoldiers: config.minTermiteSoldiers,
    };

    for (const pheromoneType of config.pheromoneTypes) {
      playerConfig[pheromoneType] = {...config[pheromoneType]};
    }
    for (const caste of config.castes) {
      playerConfig[caste] = {...config[caste]};
    }
    for (const caste of config.termiteCastes) {
      playerConfig[caste] = {...config[caste]};
    }
    for (const task of config.tasks) {
      playerConfig[task] = {...config[task]};
      for (const pherType of config.pheromoneTypes) {
        if (playerConfig[task][pherType] == null) {
          playerConfig[task][pherType] = 0;
        }
      }
    }
    playerConfig.ANT = {...config.ANT};
    playerConfig.TERMITE = {...config.TERMITE};


    gameConfig[i] = playerConfig;
  }

  return gameConfig;
};

module.exports = {makeConfig};

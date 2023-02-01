// @flow

import type {Dispatch, PlayerID, Game} from '../types';
const {oneOf, randomIn} = require('../utils/stochastic');

export type Upgrade = {
  name: string,
  path: Array<string>,
  value: mixed,
  cost: number,
};

/////////////////////////////////////////////////////////////
// Helpers
/////////////////////////////////////////////////////////////

/**
 * Validation/subtracting currency of upgraded done at UI level
 */
const applyUpgrade = (
  dispatch: Dispatch, game: Game, playerID: PlayerID, upgrade: Upgrade,
  levelOnly: ?boolean,
): boolean => {
  if (playerID == '*') {
    for (const id in game.players) {
      dispatch({type: 'UPGRADE',
        ...upgrade, path: [id, ...upgrade.path],
        levelOnly,
      });
    }
  } else if (playerID != null && upgrade.path[0] + "" != playerID + "") {
    dispatch({type: 'UPGRADE',
      ...upgrade, path: [playerID, ...upgrade.path],
      levelOnly,
    });
  }

  // packaged upgrades
  if (upgrade.packages) {
    for (const up of upgrade.packages) {
      applyUpgrade(dispatch, game, playerID, up, levelOnly);
    }
  }

  return true;
}

/////////////////////////////////////////////////////////////
// Upgrades
// NOTE: must use applyUpgrade function to properly dispatch
// the upgrade to:
//   - apply/validate the cost of the upgrade
//   - add the playerID to the path so the right player gets the upgrade
/////////////////////////////////////////////////////////////

const storedEggSequence = {
  ['Set Stored Eggs to 3']: {
    name: 'Set Stored Eggs to 3',
    path: ['maxEggCharges'],
    value: 3,
    cost: 1,
    sequenceID: 'storedEggs',
    sequenceIndex: 0,
  },
  ['Set Stored Eggs to 4']: {
    name: 'Set Stored Eggs to 4',
    path: ['maxEggCharges'],
    value: 4,
    cost: 2,
    sequenceID: 'storedEggs',
    sequenceIndex: 1,
  },
  ['Set Stored Eggs to 5']: {
    name: 'Set Stored Eggs to 5',
    path: ['maxEggCharges'],
    value: 5,
    cost: 3,
    sequenceID: 'storedEggs',
    sequenceIndex: 2,
  },
  ['Set Stored Eggs to 6']: {
    name: 'Set Stored Eggs to 6',
    path: ['maxEggCharges'],
    value: 6,
    cost: 4,
    sequenceID: 'storedEggs',
    sequenceIndex: 3,
  },
  ['Set Stored Eggs to 7']: {
    name: 'Set Stored Eggs to 7',
    path: ['maxEggCharges'],
    value: 7,
    cost: 5,
    sequenceID: 'storedEggs',
    sequenceIndex: 4,
  },
  ['Set Stored Eggs to 8']: {
    name: 'Set Stored Eggs to 8',
    path: ['maxEggCharges'],
    value: 8,
    cost: 5,
    sequenceID: 'storedEggs',
    sequenceIndex: 5,
  },
  ['Set Stored Eggs to 9']: {
    name: 'Set Stored Eggs to 9',
    path: ['maxEggCharges'],
    value: 9,
    cost: 5,
    sequenceID: 'storedEggs',
    sequenceIndex: 6,
  },
  ['Set Stored Eggs to 10']: {
    name: 'Set Stored Eggs to 10',
    path: ['maxEggCharges'],
    value: 10,
    cost: 5,
    sequenceID: 'storedEggs',
    sequenceIndex: 7,
  },
};

const startWithWorkersSequence = {
  ['Start with 1 Worker']: {
    name: 'Start with 1 Worker',
    path: ['numStartingWorkers'],
    value: 1,
    cost: 1,
    sequenceID: 'startWithWorkers',
    sequenceIndex: 0,
    needsReset: true,
  },
  ['Start with 2 Workers']: {
    name: 'Start with 2 Workers',
    path: ['numStartingWorkers'],
    value: 2,
    cost: 2,
    sequenceID: 'startWithWorkers',
    sequenceIndex: 1,
    needsReset: true,
  },
  ['Start with 3 Workers']: {
    name: 'Start with 3 Workers',
    path: ['numStartingWorkers'],
    value: 3,
    cost: 3,
    sequenceID: 'startWithWorkers',
    sequenceIndex: 2,
    needsReset: true,
  },
  ['Start with 4 Workers']: {
    name: 'Start with 4 Workers',
    path: ['numStartingWorkers'],
    value: 4,
    cost: 4,
    sequenceID: 'startWithWorkers',
    sequenceIndex: 3,
    needsReset: true,
  },
  ['Start with 5 Workers']: {
    name: 'Start with 5 Workers',
    path: ['numStartingWorkers'],
    value: 5,
    cost: 5,
    sequenceID: 'startWithWorkers',
    sequenceIndex: 4,
    needsReset: true,
  },
  ['Start with 6 Workers']: {
    name: 'Start with 6 Workers',
    path: ['numStartingWorkers'],
    value: 6,
    cost: 6,
    sequenceID: 'startWithWorkers',
    sequenceIndex: 5,
    needsReset: true,
  },
  ['Start with 7 Workers']: {
    name: 'Start with 7 Workers',
    path: ['numStartingWorkers'],
    value: 7,
    cost: 7,
    sequenceID: 'startWithWorkers',
    sequenceIndex: 6,
    needsReset: true,
  },
  ['Start with 8 Workers']: {
    name: 'Start with 8 Workers',
    path: ['numStartingWorkers'],
    description: 'Start each of the following levels with 8 workers.',
    value: 8,
    cost: 8,
    sequenceID: 'startWithWorkers',
    sequenceIndex: 7,
    needsReset: true,
  },
  ['Start with 9 Workers']: {
    name: 'Start with 9 Workers',
    path: ['numStartingWorkers'],
    value: 9,
    cost: 9,
    sequenceID: 'startWithWorkers',
    sequenceIndex: 8,
    needsReset: true,
  },
  ['Start with 10 Workers']: {
    name: 'Start with 10 Workers',
    path: ['numStartingWorkers'],
    value: 10,
    cost: 10,
    sequenceID: 'startWithWorkers',
    sequenceIndex: 9,
    needsReset: true,
  },
};

const allUpgrades = {
  // queen size
  ['Longer']: {
    name: 'Longer',
    path: ['QUEEN', 'height'],
    value: 3,
    cost: 0,
    needsReset: true,
  },
  ['Wider']: {
    name: 'Wider',
    path: ['QUEEN', 'width'],
    value: 3,
    cost: 0,
    needsReset: true,
  },
  ['Shorter']: {
    name: 'Shorter',
    path: ['QUEEN', 'height'],
    value: 1,
    cost: 0,
    needsReset: true,
  },
  ['Thinner']: {
    name: 'Thinner',
    path: ['QUEEN', 'width'],
    value: 1,
    cost: 0,
    needsReset: true,
  },

  // queen hp
  ['Decrease Queen HP by 50%']: {
    name: 'Decrease Queen HP by 50%',
    path: ['QUEEN', 'hp'],
    value: 0.5,
    cost: 0,
    operation: 'multiply',
    needsReset: true,
  },
  ['Increase Queen HP by 50%']: {
    name: 'Increase Queen HP by 50%',
    path: ['QUEEN', 'hp'],
    value: 1.5,
    cost: 12,
    operation: 'multiply',
    sequenceID: 'increaseQueenHP',
    sequenceIndex: 0,
    needsReset: true,
  },
  ['Increase Queen HP by 20%']: {
    name: 'Increase Queen HP by 20%',
    path: ['QUEEN', 'hp'],
    value: 1.2,
    cost: 12,
    operation: 'multiply',
    sequenceID: 'increaseQueenHP',
    sequenceIndex: 1,
    needsReset: true,
  },
  ['Increase Queen HP by 25%']: {
    name: 'Increase Queen HP by 25%',
    path: ['QUEEN', 'hp'],
    value: 1.25,
    cost: 15,
    operation: 'multiply',
    sequenceID: 'increaseQueenHP',
    sequenceIndex: 2,
    needsReset: true,
  },

  // queen damage
  ['Double Queen Damage']: {
    name: 'Double Queen Damage',
    path: ['QUEEN', 'damage'],
    value: 2,
    cost: 16,
    operation: 'multiply',
    sequenceID: 'doubleQueenDamage',
    sequenceIndex: 0,
  },
  ['Double Queen Damage (2)']: {
    name: 'Quadruple Queen Damage (2)',
    path: ['QUEEN', 'damage'],
    value: 2,
    cost: 18,
    operation: 'multiply',
    sequenceID: 'doubleQueenDamage',
    sequenceIndex: 1,
  },
  ['Double Queen Damage (3)']: {
    name: 'Quadruple Queen Damage (3)',
    path: ['QUEEN', 'damage'],
    value: 2,
    cost: 20,
    operation: 'multiply',
    sequenceID: 'doubleQueenDamage',
    sequenceIndex: 2,
  },

  // queen dash attack
  ['Dash Attack']: {
    name: 'Dash Attack',
    description: 'A queen ability that lets you cover ground faster and attack',
    path: ['queenAbilities'],
    value: 'JUMP',
    operation: 'append',
    sequenceID: 'Aggression',
    sequenceIndex: 0,
  },
  // queen ALERT
  ['Alert Pheromone']: {
    name: 'Alert Pheromone',
    description: 'A pheromone ability that spurs all nearby workers to drop everything and fight.' +
      ' (Alerted ants will also attack nearby vines, which when killed occasionally produce' +
      ' food and seeds)',
    path: ['queenPheromones'],
    value: 'QUEEN_ALERT',
    operation: 'append',
    sequenceID: 'Aggression',
    sequenceIndex: 1,
  },
  // queen DEFEND
  ['Rally Pheromone']: {
    name: 'Rally Pheromone',
    description: 'Rally to the queen! Nearby ants will stop fighting to surround their queen.' +
      ' Ants that are holding things won\'t be disturbed',
    trivia: 'In some species of ants, notably some slave driver ants, the queen emits pheromones ' +
      'and leads the charge personally',
    path: ['queenPheromones'],
    value: 'PATROL_DEFEND_PHER',
    operation: 'append',
    sequenceID: 'Mega Colony',
    sequenceIndex: 2,
  },
  // queen FOLLOW
  ['Follow Pheromone']: {
    name: 'Follow Pheromone',
    description: 'A pheromone ability that attracts unoccupied workers to follow the queen',
    trivia: 'In some species of ants, notably some slave driver ants, the queen emits pheromones ' +
      'and leads the charge personally',
    path: ['queenPheromones'],
    value: 'QUEEN_PHER',
    operation: 'append',
    sequenceID: 'Mega Colony',
    sequenceIndex: 0,
  },
  // queen marking dirt
  ['Mark Dirt']: {
    name: 'Mark Dirt',
    description: 'A queen ability that marks dirt for workers to pick up and marks ' +
      'empty spaces for workers to put down',
    path: ['queenAbilities'],
    value: 'MARK_DIRT',
    operation: 'append',
    sequenceID: 'Farmer',
    sequenceIndex: 1,
  },
  // queen marking chamber
  ['Mark Chamber']: {
    name: 'Mark Chamber',
    description: 'A queen ability that marks a chamber-sized area for workers to pick up' +
      ' paired with an ability to mark areas to put dirt down',
    trivia: 'Ants like leaf cutters build elaborate underground colonies with up to hundreds of ' +
      'different chambers',
    path: ['queenAbilities'],
    value: 'MARK_CHAMBER',
    operation: 'append',
    sequenceID: 'Farmer',
    sequenceIndex: 1,
    packages: [{
      name: 'Mark Dirt Putdown',
      path: ['queenAbilities'],
      value: 'MARK_DIRT_PUTDOWN',
      operation: 'append',
    },
    ],
  },
  // Fast Travel ability
  ['Fast Travel']: {
    name: 'Fast Travel',
    description: 'Fast travel back to the Larva token from wherever you are in the world',
    trivia: 'The Sahara Desert Ant is the fastest ant in the world, travelling at almost ' +
      '1 meter per second or 2 miles per hour. It will wander the desert until it ' +
      ' gets too hot and then sprint straight back to the colony from wherever it is.',
    path: ['queenAbilities'],
    value: 'BURROW',
    operation: 'append',
    sequenceID: 'Farmer',
    sequenceIndex: 0,
  },
  // Pupa Token
  ['Pupa Token']: {
    name: 'Pupa Token',
    description: 'Get a token that your workers will store your pupa near until they hatch' +
     ' in order to keep them out of the way of your larva',
    trivia: 'Ants follow the same life cycle as butterflies and moths: egg, then larva/caterpillar, ' +
      ' and then pupa/cocoon/chrysalis, and finally ant/butterfly',
    path: ['Pupa Token'],
    value: true,
    sequenceID: 'Farmer',
    sequenceIndex: 3,
    packages: [{
      name: 'Start With Pupa Token',
      path: ['startWithPupaToken'],
      value: true,
    }],
  },
  // Free Play Domesticate
  ['Ant Farm']: {
    name: 'Ant Farm',
    description: 'Shrink into a quick and nimble farmer. Get a token that pacifies nearby ' +
      ' critters and increases the growth rate' +
      ' of nearby vines. Also get a seed that will sprout into a vine. ' +
      ' (Water from the hose also makes vines grow and sprout food faster)',
    path: ['domesticate'],
    value: true,
    sequenceID: 'Farmer',
    sequenceIndex: 3,
    packages: [
      {
        name: 'Shorter',
        path: ['QUEEN', 'height'],
        value: 1,
        cost: 0,
      },
      {
        name: 'Thinner',
        path: ['QUEEN', 'width'],
        value: 1,
        cost: 0,
      },
    ]
  },
  // Domesticate Token
  ['Domesticate']: {
    name: 'Domesticate',
    description: 'Get a token that pacifies nearby ' +
      ' critters and induces aphids to produce food',
    trivia: 'Some species of ants, including Argentinean ants, raise and protect aphids for the ' +
      'sugar they produce, even bringing them with them when they start new colonies',
    path: ['domesticate'],
    value: true,
    sequenceID: 'Farmer',
    sequenceIndex: 3,
    packages: [{
      name: 'Start With Domesticate Token',
      path: ['startWithDomesticateToken'],
      value: 1,
      operation: 'add',
    }],
  },
  ['Growth Pheromone']: {
    name: 'Growth Pheromone',
    description: 'Your Domesticate tokens now also increase the growth rate of ' +
      'nearby vines and make them produce food more often',
    trivia: 'Numerous ant species cultivate and protect plants in order to get additional ' +
      'food from them',
    path: ['growthPheromone'],
    value: true,
  },
  // Get A Seed
  ['Get A Seed']: {
    name: 'Get A Seed',
    description: 'Get a seed that will grow into a vine that occasionally produces food',
    trivia: 'Leaf Cutter Ants harvest leaves from the rain forest that they use to grow the fungus' +
      ' that they eat. Leaf Cutter queens bring a bit of fungus with them when they start a new colony.',
    path: ['getSeed'],
    value: true,
    sequenceID: 'Farmer',
    sequenceIndex: 3,
    packages: [{
      name: 'Start With Seed',
      path: ['startWithSeed'],
      value: true,
    }],
  },
  // Mega Colony
  ['Mega Colony']: {
    name: 'Mega Colony',
    description: 'Sit back and grow your colony fast! Workers move faster, your view ' +
      'zooms out to see them, and unlock an ability to lay eggs automatically',
    trivia: 'Ants like Argentinean ants form mega colonies Billions of individuals!',
    path: ['megaColony'],
    value: true,
    sequenceID: 'Mega Colony',
    sequenceIndex: 3,
    packages: [{
      name: 'Autopilot',
      description: 'An ability that has your queen lay eggs automatically',
      path: ['queenAbilities'],
      value: 'AUTOPILOT',
      operation: 'append',
    }],
  },
  // queen is armored
  ['Queen Armor']: {
    name: 'Queen Armor',
    path: ['queenArmored'],
    value: true,
  },
  // queen breaks up grapple lines
  ['Warrior Queen']: {
    name: 'Warrior Queen',
    description: 'Double your HP, take half damage from frontal attacks ' +
      'and your dash attacks now go THROUGH enemy bugs, dealing tons of damage',
    path: ['queenArmored'],
    value: true,
    sequenceID: 'Aggression',
    sequenceIndex: 3,
    packages: [{
      name: 'Double Queen HP',
      path: ['QUEEN', 'hp'],
      value: 2,
      operation: 'multiply',
    },
    ],
  },
  ['Heal Queen']: {
    name: 'Heal Queen',
    description: 'Heal the queen to full hp. Can be used multiple times.',
    path: ['QUEEN', 'hp'],
    value: 1,
    operation: 'multiply',
  },
  ['Raid Ability']: {
    name: 'Raid Ability',
    description: 'Select a spot on the minimap to raid with your entire colony. ' +
      'Can only be used once every 4 minutes',
    path: ['queenAbilities'],
    value: 'CREATE_RAID',
    operation: 'append',
  },
  ['Trapjaw Workers']: {
    name: 'Trapjaw Workers',
    trivia: 'Trapjaw ants can close their massive jaws at up to 100 miles per hour ' +
      'with force greater than 300 times their body weight!',
    description: 'Your workers now have trap jaws that allow them to deal more damage' +
    ' and latch on to enemies, slowing them down',
    path: ['trapjaw'],
    value: true,
    packages: [{
      name: 'Double Worker Damage',
      path: ['MINIMA', 'damage'],
      value: 2,
      operation: 'multiply',
    },
    ],
  },
  ['Soldier Caste']: {
    name: 'Soldier Caste',
    description: 'Stronger, slower workers that take 3 food to raise.',
    trivia: 'Some ant species, like Marauder Ants, have dedicated soldiers whose only ' +
      'purpose is to defend the colony',
    path: ['queenLayingCastes'],
    value: 'SOLDIER',
    operation: 'append',
    sequenceID: 'Farmer',
    sequenceIndex: 2,
  },
  ['Gamergate Workers']: {
    name: 'Gamergate Workers',
    trivia: 'In species of ants where workers can themselves lay worker eggs these ' +
      'workers are called "Gamergates" (yes, seriously)',
    description: 'Your workers will now each lay one egg when near the colony',
    path: ['gamergate'],
    value: true,
  },

  ['Spiked Larva']: {
    name: 'Spiked Larva',
    trivia: 'The larva of some ant species (like Trap Jaw Ants) are covered in spikes!',
    description: 'Spiky larva deal damage to critters or enemy ants that eat them',
    path: ['spikedLarva'],
    value: 10,
  },
  ['Whirlwind Attack Ability']: {
    name: 'Whirlwind Attack Ability',
    description: 'A queen ability that damages surrounding enemies',
    path: ['queenAbilities'],
    value: 'WHIRLWIND',
    operation: 'append',
  },
  ['Stun Ability']: {
    name: 'Stun Ability',
    description: 'Makes your queen\'s attacks stun enemies',
    trivia: 'Ants like Trapjaw ants can bite so quickly that arthopods are stunned',
    path: ['queenStun'],
    value: 'true',
  },
  ['Acid Death Ability']: {
    name: 'Acid Death Ability',
    trivia: 'Some ants release a painful acid when they are killed',
    description: 'When your workers die, they emit a short-lasting acid that continuously' +
      ' deals damage to enemy ants and critters nearby',
    path: ['acidDeath'],
    value: true,
  },

  // queen EXPAND
  ['Expand and Contract']: {
    name: 'Expand and Contract',
    description: 'A pair of queen abilities that sends workers away from the colony' +
      ' or brings them all back home',
    path: ['queenPheromones'],
    value: 'EXPAND',
    operation: 'append',
    sequenceID: 'organizational',
    sequenceIndex: 2,
    packages: [{
      name: 'Contract',
      description: 'A queen ability that recalls all workers back to the colony',
      path: ['queenPheromones'],
      value: 'CONTRACT',
      operation: 'append',
    }],
  },
  // queen CONTRACT
  ['Contract']: {
    name: 'Contract',
    description: 'A queen ability that recalls all workers back to the colony',
    path: ['queenPheromones'],
    value: 'CONTRACT',
    operation: 'append',
    sequenceID: 'organizational',
    sequenceIndex: 3,
  },

  // castes
  ['Major Only']: {
    name: 'Major Only',
    path: ['queenLayingCastes'],
    value: [
      'MEDIA', 'YOUNG_QUEEN',
    ],
    cost: 0,
  },
  ['Young Queen Caste']: {
    name: 'Young Queen Caste',
    description: 'Otherwise useless ants that you should get as many of as you can ' +
      'for a high score',
    path: ['queenLayingCastes'],
    value: 'YOUNG_QUEEN',
    operation: 'append',
    cost: 8,
    sequenceID: 'Mega Colony',
    sequenceIndex: 1,
  },
  ['Major Caste']: {
    name: 'Major Caste',
    description: 'Bigger, stronger, clumsier workers that can carry 3x what a regular ' +
      'worker ant can, but require more food to raise',
    trivia: 'Some species of ants, notably like leaf cutters, have workers of different sizes ' +
      ' who can specialize in different tasks.',
    path: ['queenLayingCastes'],
    value: 'MEDIA',
    operation: 'append',
    cost: 8,
    sequenceID: 'Farmer',
    sequenceIndex: 2,
  },
  ['Minima Caste']: {
    name: 'Minima Caste',
    description: 'Very small workers that take less food to raise but can still carry ' +
      'just as much as a regular worker',
    path: ['queenLayingCastes'],
    value: 'SUB_MINIMA',
    operation: 'append',
    cost: 15,
    sequenceID: 'Aggression',
    sequenceIndex: 2,
  },
  ['Super Major Caste']: {
    name: 'Super Major Caste',
    description: 'Huge living tanks that smash dirt out of their way but ' +
      'cost all your egg charges, take a lot of food to raise, and do nothing but fight',
    path: ['queenLayingCastes'],
    value: 'MAJOR',
    operation: 'append',
    cost: 15,
    sequenceID: 'Aggression',
    sequenceIndex: 2,
  },
  ['Honey Pot Caste']: {
    name: 'Honey Pot Caste',
    description: 'Honey Pot ants store food in their giant abdomens to dole out to the colony',
    trivia: 'Certain species of ants in the desert designate some workers as "repletes" -- living ' +
      'food and water stores who can replenish the colony during droughts. In some cultures these ' +
      'workers, also known as honeypots, are considered delicacies',
    path: ['queenLayingCastes'],
    value: 'HONEY_POT',
    operation: 'append',
    cost: 8,
    sequenceID: 'Farmer',
    sequenceIndex: 2,
  },
  ['Queen Caste']: {
    name: 'Queen Caste',
    description: 'Some ant species have colonies with multiple egg-laying queens',
    trivia: 'Argentinean ant colonies support multiple cooperating queens. ' +
      'This is one of the reasons Argentinean ants are so successful -- neighboring ' +
      'colonies cooperate as if they were a mega colony instead of competing like in ' +
      ' other ant species',
    path: ['queenLayingCastes'],
    value: 'QUEEN',
    operation: 'append',
    cost: 8,
    sequenceID: 'Farmer',
    sequenceIndex: 2,
  },

  // young queen upgrades
  ['Young Queens Only']: {
    name: 'Young Queens Only',
    path: ['queenLayingCastes'],
    value: [
      'YOUNG_QUEEN',
      // 'COLONY TOKEN', 'DIRT TOKEN', 'EGG TOKEN', 'LARVA TOKEN', 'PUPA TOKEN',
    ],
    cost: 0,
  },
  ['Young Queens Pickup']: {
    name: 'Young Queens Pickup',
    path: ['castePickup'],
    value: 'YOUNG_QUEEN',
    operation: 'append',
    cost: 0,
  },
  ['Young Queens Do Tasks']: {
    name: 'Young Queens Do Tasks',
    description: 'Before you reach the upgrade threshold for a level, your young queens' +
      ' will do tasks like regular workers',
    path: ['youngQueensDoTasks'],
    value: true,
    cost: 0,
    packages: [{
      name: 'Young Queens Pick Up',
      description: 'Young Queens can pick up things',
      path: ['castePickup'],
      value: 'YOUNG_QUEEN',
      operation: 'append',
    }],
  },


  // egg laying
  ['Slower Egg Production']: {
    name: 'Slower Egg Production',
    path: ['eggLayingCooldown'],
    value: 300,
    cost: 12,
  },
  ['Faster Egg Production']: {
    name: 'Faster Egg Production',
    path: ['eggLayingCooldown'],
    value: 45,
    cost: 12,
  },

  // stored-egg sequence
  ...storedEggSequence,

  // minima stats
  ['Increase Worker Damage']: {
    name: 'Increase Worker Damage',
    path: ['MINIMA', 'damage'],
    value: 1,
    cost: 12,
    operation: 'add',
  },

  // starting with workers
  ...startWithWorkersSequence,
  ['Start with many Workers']: {
    name: 'Start with many Workers',
    path: ['numStartingWorkers'],
    value: 16,
    cost: 20,
    needsReset: true,
  },

  // CPU-related
  ['Attack Fast']: {
    name: 'Attack Fast',
    path: ['attackTiming'],
    value: 500,
    cost: 0,
  },
  ['Attack 3.5 minutes']: {
    name: 'Attack 3.5 minutes',
    path: ['attackTiming'],
    value: 5000, // 3.5 minutes
    cost: 0,
  },
  ['Attack 5 minutes']: {
    name: 'Attack 5 minutes',
    path: ['attackTiming'],
    value: 7000, // 5 minutes
    cost: 0,
  },
  ['Increase Queen Pheromone Quantity']: {
    name: 'Increase Queen Pheromone Quantity',
    path: ['QUEEN_PHER', 'quantity'],
    value: 1000,
    cost: 0,
  },
  ['Increase Egg Pheromone Quantity']: {
    name: 'Increase Egg Pheromone Quantity',
    path: ['EGG', 'quantity'],
    value: 700,
    cost: 0,
  },
};

const freePlayUpgrades = (): Array<Upgrade> => {
  return {
    initial: [ // upgrades you start with
    ],
    additional: [ // upgrades you get later

      // farmer sequence
      allUpgrades['Fast Travel'],
      allUpgrades['Mark Dirt'],
      allUpgrades['Major Caste'],
      allUpgrades['Ant Farm'],

      // mega colony sequence
      allUpgrades['Follow Pheromone'],
      allUpgrades['Young Queen Caste'],
      allUpgrades['Rally Pheromone'],
      allUpgrades['Mega Colony'],

      // aggro sequence
      allUpgrades['Dash Attack'],
      allUpgrades['Alert Pheromone'],
      allUpgrades['Super Major Caste'],
      allUpgrades['Warrior Queen'],
    ],
  };
};

const argentineanAntUpgrades = (): Array<Upgrade> => {
  return {
    initial: [ // upgrades you start with
      allUpgrades['Follow Pheromone'],
      allUpgrades['Young Queen Caste'],
    ],
    additional: [ // upgrades you get later
      allUpgrades['Mark Dirt'],
      allUpgrades['Start with 8 Workers'],
      allUpgrades['Mega Colony'],
    ],
    triviaBased: [ // upgrades you get based on triva
      allUpgrades['Queen Caste'],
      allUpgrades['Domesticate'],
      allUpgrades['Pupa Token'],
    ],
  }
}


const marauderAntUpgrades = (): Array<Upgrade> => {
  return {
    initial: [ // upgrades you start with
      allUpgrades['Alert Pheromone'],
      allUpgrades['Young Queen Caste'],
    ],
    additional: [ // upgrades you get later
      allUpgrades['Heal Queen'],
      allUpgrades['Super Major Caste'],
      allUpgrades['Queen Caste'],
      allUpgrades['Start with 8 Workers'],
      allUpgrades['Raid Ability'],
    ],
    triviaBased: [ // upgrades you get based on triva
      allUpgrades['Major Caste'],
      allUpgrades['Trapjaw Workers'],
      allUpgrades['Acid Death Ability'],
      allUpgrades['Soldier Caste'],
      allUpgrades['Mark Dirt'],
    ],
  };
};

const desertAntUpgrades = (): Array<Upgrade> => {
  return {
    initial: [ // upgrades you start with
      allUpgrades['Young Queen Caste'],
      allUpgrades['Dash Attack'],
    ],
    additional: [ // upgrades you get later
      allUpgrades['Heal Queen'],
      allUpgrades['Mark Chamber'],
      allUpgrades['Warrior Queen'],
      allUpgrades['Whirlwind Attack Ability'],
      allUpgrades['Young Queens Do Tasks'],
    ],
    triviaBased: [ // upgrades you get based on triva
      allUpgrades['Fast Travel'],
      allUpgrades['Honey Pot Caste'],
      allUpgrades['Rally Pheromone'],
      allUpgrades['Spiked Larva'],
      allUpgrades['Gamergate Workers'],
      allUpgrades['Stun Ability'],
    ],
  };
};

const leafCutterAntUpgrades = (): Array<Upgrade> => {
  return {
    initial: [ // upgrades you start with
      allUpgrades['Mark Dirt'],
      allUpgrades['Young Queen Caste'],
    ],
    additional: [ // upgrades you get later
      allUpgrades['Minima Caste'],
      allUpgrades['Follow Pheromone'],
      allUpgrades['Start with 8 Workers'],
      allUpgrades['Get A Seed'],
      allUpgrades['Domesticate'],
    ],
    triviaBased: [ // upgrades you get based on triva
      allUpgrades['Mark Chamber'],
      allUpgrades['Domesticate'],
      allUpgrades['Growth Pheromone'],
      allUpgrades['Pupa Token'],
      allUpgrades['Mega Colony'],
      allUpgrades['Major Caste'],
    ],
  }
};

const getAllUniqueUpgrades = () => {
  return [
    allUpgrades['Alert Pheromone'],
    allUpgrades['Super Major Caste'],
    allUpgrades['Queen Caste'],
    allUpgrades['Start with 8 Workers'],
    allUpgrades['Heal Queen'],
    allUpgrades['Raid Ability'],
    allUpgrades['Major Caste'],
    allUpgrades['Trapjaw Workers'],
    allUpgrades['Acid Death Ability'],
    allUpgrades['Soldier Caste'],
    allUpgrades['Mark Dirt'],
    allUpgrades['Dash Attack'],
    allUpgrades['Mark Chamber'],
    allUpgrades['Warrior Queen'],
    allUpgrades['Whirlwind Attack Ability'],
    allUpgrades['Young Queens Do Tasks'],
    allUpgrades['Fast Travel'],
    allUpgrades['Honey Pot Caste'],
    allUpgrades['Follow Pheromone'],
    allUpgrades['Spiked Larva'],
    allUpgrades['Gamergate Workers'],
    allUpgrades['Minima Caste'],
    allUpgrades['Rally Pheromone'],
    allUpgrades['Domesticate'],
    allUpgrades['Pupa Token'],
    allUpgrades['Get A Seed'],
    allUpgrades['Mega Colony'],
  ];
};

const randomEverythingUpgrades = (): Array<Upgrade> => {
  const savedUpgrades = JSON.parse(localStorage.getItem('randomUpgrades'));
  if (savedUpgrades?.initial != null) return savedUpgrades;

  const uniqueUpgrades = getAllUniqueUpgrades();

  const upgrades = {
    initial: [allUpgrades['Young Queen Caste']],
    additional: [],
    triviaBased: [],
  };

  // get initial upgrade
  let acceptableUpgrade = false;
  while (!acceptableUpgrade) {
    const index = randomIn(0, uniqueUpgrades.length);
    if (!uniqueUpgrades[index]) {
      console.error(index, uniqueUpgrades);
      continue;
    }
    if (uniqueUpgrades[index].name != 'Heal Queen') {
      acceptableUpgrade = true;
      upgrades.initial.push(uniqueUpgrades[index]);
      uniqueUpgrades.splice(index, 1);
    }
  }

  // add triviaBased upgrades
  let numUpgrades = 0;
  while (numUpgrades < 5) {
    const index = randomIn(0, uniqueUpgrades.length - 1);
    if (!uniqueUpgrades[index]) {
      console.error(index, uniqueUpgrades);
      continue;
    }
    if (uniqueUpgrades[index].trivia) {
      numUpgrades++;
      upgrades.triviaBased.push(uniqueUpgrades[index]);
      uniqueUpgrades.splice(index, 1);
    }
  }

  // add additional upgrades
  numUpgrades = 0;
  while (numUpgrades < 5) {
    const index = randomIn(0, uniqueUpgrades.length - 1);
    if (!uniqueUpgrades[index]) {
      console.error(index, uniqueUpgrades);
      continue;
    }
    numUpgrades++;
    upgrades.additional.push(uniqueUpgrades[index]);
    uniqueUpgrades.splice(index, 1);
  }

  localStorage.setItem('randomUpgrades', JSON.stringify(upgrades));
  return upgrades;
};

const upgradeMap = (state): Object => {
  switch (state.campaign.species) {
    case 'Free Play':
      return freePlayUpgrades();
    case 'Argentinean Ants':
      return argentineanAntUpgrades();
    case 'Marauder Ants':
      return marauderAntUpgrades();
    case 'Desert Ants':
      return desertAntUpgrades();
    case 'Leaf Cutter Ants':
      return leafCutterAntUpgrades();
    case 'Random Everything':
      return randomEverythingUpgrades();
  }
}

const getNextTriviaBasedUpgrade = (state): Upgrade => {
  let upgrades = [...upgradeMap(state).triviaBased];
  const alreadyUpgraded = state.campaign.upgrades.map(u => u.name);
  upgrades = upgrades.filter(u => !alreadyUpgraded.includes(u.name));
  return oneOf(upgrades);
};

// window.upgrades = allUpgrades;
// window.upgrade = (upgrade, playerID, levelOnly) => {
//   applyUpgrade(store.dispatch, store.getState().game, playerID || 1, upgrade, levelOnly);
// };

module.exports = {
  allUpgrades,
  freePlayUpgrades,
  argentineanAntUpgrades,
  marauderAntUpgrades,
  desertAntUpgrades,
  leafCutterAntUpgrades,
  applyUpgrade,
  getNextTriviaBasedUpgrade,
  upgradeMap,
};

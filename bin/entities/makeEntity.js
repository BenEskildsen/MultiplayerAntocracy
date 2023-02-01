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
// @flow

const {
  equals, add, subtract, magnitude, scale, vectorTheta, abs,
} = require('../utils/vectors');
const {getDuration, getFrame} = require('../simulation/actionQueue');
const {
  lookupInGrid, getPheromonesInCell,
} = require('../utils/gridHelpers');
const {getNeighborPositions} = require('../selectors/neighbors');
const globalConfig = require('../config');
const {getQueen, getPositionsInFront} = require('../selectors/misc');
const {thetaToDir, closeTo} = require('../utils/helpers');

const getInterpolatedPos = (game: Game, entity: Entity): Vector => {
  const action = entity.actions[0];
  let pos = entity.position;
  if (action != null && !entity.stuck) {
    switch (action.type) {
      case 'MOVE_TURN':
      case 'MOVE': {
        const diff = subtract(entity.position, entity.prevPosition);
        const duration = getDuration(game, entity, action.type);
        const actionDuration = Math.min(duration, action.duration);
        const progress = (duration - actionDuration) / duration;
        pos = add(entity.prevPosition, scale(diff, progress));
        break;
      }
      case 'FEED':
      case 'BITE': {
        const posInFront = getPositionsInFront(game, entity)[0];
        const diff = subtract(posInFront, entity.position);
        const duration = getDuration(game, entity, action.type);
        let progress = (duration - Math.abs(duration / 2 - action.duration)) / (duration);
        if (magnitude(diff) > 1) {
          progress *= 0.5;
        }
        pos = add(entity.position, scale(diff, progress));
        break;
      }
      case 'GRAPPLE': {
        const posInFront = getPositionsInFront(game, entity)[0];
        const diff = subtract(posInFront, entity.position);
        pos = add(entity.position, scale(diff, 0.1));
        break;
      }
    }
  } else if (
    entity.caste == 'QUEEN' && entity.abilityActive == true &&
    (entity.selectedAbility == 'MARK_DIRT' || entity.selectedAbility == 'MARK_CHAMBER'
      || entity.selectedAbility == 'MARK_DIRT_PUTDOWN')
  ) {
    const diff = entity.digCharge - Math.floor(entity.digCharge);
    const progress = Math.round(diff * 6) % 2
      ? diff / 2
      : -1 * diff / 2;

    const dir = thetaToDir(entity.theta);
    if (dir == 'up' || dir == 'down') {
      pos = add(entity.position, {x: progress, y: 0});
    } else {
      pos = add(entity.position, {x: 0, y: progress});
    }
  }
  return pos;
};

const getInterpolatedTheta = (game: Game, entity: Entity): Vector => {
  const action = entity.actions[0];
  let theta = entity.theta;
  if (action == null) return theta;
  switch (action.type) {
    case 'MOVE_TURN': {
      let diff = entity.theta - entity.prevTheta;
      if (Math.abs(diff) < 0.01) break;
      if (Math.abs(diff) > Math.PI) {
        const mult = diff < 0 ? 1 : -1;
        diff = mult * (2 * Math.PI - Math.abs(diff));
      }
      const duration = getDuration(game, entity, action.type);
      const progress = Math.max(0, (duration - ( action.duration / 3)) / duration);
      theta = progress * diff + entity.prevTheta;
      break
    }
    case 'TURN': {
      let diff = entity.theta - entity.prevTheta;
      if (Math.abs(diff) > Math.PI) {
        const mult = diff < 0 ? 1 : -1;
        diff = mult * (2 * Math.PI - Math.abs(diff));
      }
      const duration = getDuration(game, entity, action.type);
      const progress = (duration - (action.duration + 0)) / duration;
      theta = progress * diff + entity.prevTheta;
      break;
    }
    case 'WHIRLWIND': {
      const diff = Math.PI * 4;
      const duration = getDuration(game, entity, action.type);
      const progress = (duration - (action.duration + 0)) / duration;
      theta = progress * diff + entity.theta;
      break;
    }
  }
  return theta;
};

// specifically for foot
const getInterpolatedSize = (game: Game, entity: Entity): Vector => {
  const baseSize = {x: entity.width, y: entity.height};
  if (entity.prevWidth == null) return baseSize;
  const action = entity.actions[0];
  if (action == null) return baseSize;
  if (action.type != 'FALL' && action.type != 'LIFT') return baseSize;

  const duration = getDuration(game, entity, action.type);
  const progress = (duration - (action.duration + 0)) / duration;
  const prevSize = {x: entity.prevWidth, y: entity.prevHeight};
  const diff = subtract(baseSize, prevSize);
  const size = add(prevSize, scale(diff, progress));
  return size;
};

const getInterpolatedIndex = (game: Game, entity: Entity): number => {
  const action = entity.actions[0];
  if (action == null) return 0;

  const duration = getDuration(game, entity, action.type);
  return Math.max(duration - action.duration - 1, 0);
};

const getMaxFrameOffset = (game: Game, entity: Entity): number => {
  let config = game.config;
  if (entity.playerID != null) {
    config = game.config[entity.playerID];
  }

  if (entity.actions.length == 0) return {maxFrameOffset: 0, frameStep: 0};
  const actionType = entity.actions[0].type;

  let maxFrameOffset = config[entity.type][actionType].maxFrameOffset;
  if (entity.caste != null && config[entity.caste][actionType] != null) {
    maxFrameOffset = config[entity.caste][actionType].maxFrameOffset;
  }
  if (maxFrameOffset == null) {
    maxFrameOffset = 0;
  }
  let frameStep = config[entity.type][actionType].frameStep;
  if (entity.caste != null && config[entity.caste][actionType] != null) {
    frameStep = config[entity.caste][actionType].frameStep;
  }
  if (frameStep == null) {
    frameStep = 0;
  }
  return {maxFrameOffset, frameStep};
};

//////////////////////////////////////////////////////////////////////
// Critter-specific
//////////////////////////////////////////////////////////////////////

const getSpiderSprite = (game: Game, spider: Spider): Object => {
  const config = game.config;
  let width = 36;
  let height = 36;
  const obj = {
    img: game.sprites.SPIDER,
    x: 0, y: 0,
    width, height,
  };
  let index = getInterpolatedIndex(game, spider);
  if (spider.type == 'DEAD_SPIDER') {
    index = 8;
    obj.x = index * width;
  } else if (spider.actions.length == 0) {
    return obj;
  } else {
    obj.x = getFrame(game, spider, index) * width;
  }
  return obj;
};

const getScorpionSprite = (game: Game, scorpion: Scorpion): Object => {
  const config = game.config;
  let width = 48;
  let height = 48;
  const obj = {
    img: game.sprites.SCORPION,
    x: 0, y: 0,
    width, height,
  };
  let index = getInterpolatedIndex(game, scorpion);
  if (scorpion.type == 'DEAD_SCORPION') {
    index = 6;
    obj.x = index * width;
  } else if (scorpion.actions.length == 0) {
    return obj;
  } else {
    obj.x = getFrame(game, scorpion, index) * width;
  }
  return obj;
};

const getBeetleSprite = (game: Game, beetle: Beetle): Object => {
  const config = game.config;
  let width = 32;
  let height = 32;
  const obj = {
    img: game.sprites.BEETLE,
    x: 0, y: 0,
    width, height,
  };
  let index = getInterpolatedIndex(game, beetle);
  if (beetle.type == 'DEAD_BEETLE') {
    index = 6;
    obj.x = index * width;
  } else if (beetle.actions.length == 0) {
    return obj;
  } else {
    obj.x = getFrame(game, beetle, index) * width;
  }
  return obj;
};

const getAphidSprite = (game: Game, aphid: Aphid): Object => {
  const config = game.config;
  let width = 32;
  let height = 32;
  const obj = {
    img: game.sprites.APHID,
    x: 0, y: 0,
    width, height,
  };
  let index = getInterpolatedIndex(game, aphid);
  if (aphid.type == 'DEAD_APHID') {
    index = 3;
    obj.x = index * width;
  } else if (aphid.actions.length == 0) {
    return obj;
  } else {
    obj.x = getFrame(game, aphid, index) * width;
  }
  return obj;
};

const getRolyPolySprite = (game: Game, rolyPoly: RolyPoly): Object => {
  const config = game.config;
  let width = 32;
  let height = 32;
  const obj = {
    img: game.sprites.ROLY_POLY,
    x: 0, y: 0,
    width, height,
  };
  let index = getInterpolatedIndex(game, rolyPoly);
  if (rolyPoly.type == 'DEAD_ROLY_POLY') {
    index = 4;
    obj.x = index * width;
  } else if (rolyPoly.actions.length == 0) {
    if (rolyPoly.rolled) {
      obj.x = 3 * width;
    }
    return obj;
  } else {
    obj.x = getFrame(game, rolyPoly, index) * width;
  }
  return obj;
};

const getFootSprite = (game: Game, foot: Entity): Object => {
  const config = game.config;
  const width = 50;
  const height = 128;

  const queen = getQueen(game, game.playerID);
  let img = game.sprites.FOOT_BOT_LEFT;
  // if (queen.position.x < foot.position.x) {
  //   if (queen.position.y > foot.position.y + foot.height / 2) {
  //     img = game.sprites.FOOT_TOP_LEFT;
  //   }
  // } else {
  //   if (queen.position.y > foot.position.y + foot.height / 2) {
  //     img = game.sprites.FOOT_TOP_RIGHT;
  //   } else {
  //     img = game.sprites.FOOT_BOT_RIGHT;
  //   }
  // }

  const obj = {
    img,
    x: 7, y: 0,
    width, height,
  }
  return obj;
};

//////////////////////////////////////////////////////////////////////
// Termite-specific
//////////////////////////////////////////////////////////////////////
const getTermiteSprite = (game: Game, termite: Termite): Object => {
  const config = game.config[termite.playerID];
  let width = 32;
  let height = 32;
  let img = game.sprites.TERMITE_WORKER;
  if (termite.caste == 'TERMITE_SOLDIER') {
    width = 48;
    height = 48;
    img = game.sprites.TERMITE_SOLDIER;
  } else if (termite.caste == 'TERMITE_QUEEN') {
    width = 32;
    height = 64;
    img = game.sprites.TERMITE_QUEEN;
  }

  const obj = {
    img,
    x: 0,
    y: 0,
    width,
    height,
  };

  let index = getInterpolatedIndex(game, termite);
  if (termite.type == "DEAD_TERMITE") {
    if (termite.caste == 'TERMITE_WORKER') {
      index = 4;
    } else if (termite.caste == 'TERMITE_SOLDIER') {
      index = 8;
    } else if (termite.caste == 'TERMITE_QUEEN') {
      index = 5;
    }
    obj.x = index * width;
  } else if (termite.actions.length == 0) {
    return obj;
  } else {
    let frame = getFrame(game, termite, index);
    obj.x = frame * width;
  }

  return obj;
};

//////////////////////////////////////////////////////////////////////
// Ant-specific
//////////////////////////////////////////////////////////////////////

const getAntSpriteAndOffset = (game: Game, ant: Ant): Object => {
  const config = game.config[ant.playerID];
  let width = 32;
  let height = 32;
  let spriteName = 'ANT';
  if (ant.caste == 'YOUNG_QUEEN') {
    if (ant.task == 'FLY_AWAY') {
      spriteName = 'FLYING_QUEEN';
      height = 64;
      width = 88;
    } else {
      spriteName = 'YOUNG_QUEEN';
      height = 64;
      width = 32;
    }
  } else if (ant.caste == 'QUEEN' && config.queenArmored) {
    spriteName = 'WARRIOR_QUEEN';
  } else if (ant.caste == 'HONEY_POT') {
    spriteName = 'HONEY_POT';
    height = 48;
  } else if (ant.caste == 'SOLDIER') {
    spriteName = 'WARRIOR_QUEEN';
  } else if (ant.caste == 'MINIMA' && config.trapjaw) {
    spriteName = 'TRAPJAW_ANT';
  }

  let antColor = '';
  if (game.colonies[ant.playerID].species == 'Leaf Cutter Ants') {
    antColor = 'RED_';
  }
  if (game.colonies[ant.playerID].species == 'Desert Ants') {
    antColor = 'YELLOW_';
  }
  spriteName = antColor + spriteName;
  const img = game.sprites[spriteName];

  const obj = {
    img,
    x: 0,
    y: 0,
    width,
    height,
  };

  let index = getInterpolatedIndex(game, ant);
  if (ant.type == "DEAD_ANT") {
    index = ant.caste == 'YOUNG_QUEEN' ? 3 : 8;
    if (ant.caste == 'HONEY_POT') {
      index = 5;
    }
    obj.x = index * width;
  } else if (ant.actions.length == 0) {
    return obj;
  } else {
    let frame = getFrame(game, ant, index);
    if (ant.caste == 'YOUNG_QUEEN' && ant.task == 'FLY_AWAY') {
      frame = 3;
    }
    obj.x = frame * width;
  }

  return obj;
};

//////////////////////////////////////////////////////////////////////
// Pheromones
/////////////////////////////////////////////////////////////////////

const getPheromoneSprite = (
  game: Game, position: Vector, playerID: PlayerID, pheromoneType: string,
): Object => {
  let width = 16;
  let height = 16;
  const numFrames = 8;
  let img = game.sprites.PHEROMONE;
  const config = game.config[playerID][pheromoneType];
  const quantity = getPheromonesInCell(game.grid, position, playerID)[pheromoneType];
  const progress = numFrames - Math.round((quantity / config.quantity) * numFrames);
  const obj = {
    img,
    x: progress * width,
    y: config.tileIndex * height,
    width,
    height,
    theta: 0,
  };

  if (quantity > config.quantity - config.decayAmount || pheromoneType == 'WATER') {
    obj.x = 5;
    obj.y += 4;
    obj.width = 4;
    obj.height = 4;
    return obj;
  }

  const neighborPositions = getNeighborPositions(
    game, {position}, false, /* internal */
  );
  let neighborAmount = 0;
  let neighborPosition = null;
  for (const pos of neighborPositions) {
    const candidateAmount = getPheromonesInCell(game.grid, pos, playerID)[pheromoneType];
    if (candidateAmount > neighborAmount) {
      neighborAmount = candidateAmount;
      neighborPosition = pos;
    }
  }
  if (neighborPosition != null) {
    obj.theta = vectorTheta(subtract(position, neighborPosition)) + Math.PI / 2;
    // flip around if you are bigger than your biggest neighbor
    if (neighborAmount < quantity) {
      obj.theta += Math.PI;
    }
  }

  return obj;
}

//////////////////////////////////////////////////////////////////////
// Dirt/Food specific
/////////////////////////////////////////////////////////////////////

const getTileSprite = (game: Game, entity: Entity): Object => {
  let width = 16;
  let height = 16;
  let spriteType = entity.type == 'STONE' ? entity.subType : entity.type;
  spriteType = spriteType == null ? entity.type : spriteType;
  let img = game.sprites[spriteType];
  const obj = {
    img,
    x: 0,
    y: 0,
    width,
    height,
  };
  const {dictIndexStr} = entity;
  if (dictIndexStr === '' || dictIndexStr == null) {
    obj.x = (4 + (entity.id % 4)) * width;
  } else if  (dictIndexStr === 'lrtb') {
    // HACK: write to the entity here so it will always choose the same tile
    if (entity.dictX != null) {
      obj.x = entity.dictX;
      obj.y = entity.dictY;
      obj.width = entity.dictWidth;
      obj.height = entity.dictHeight;
    } else {
      if (Math.random() < 0.7 || entity.type == 'FOOD') {
        obj.x = width;
        obj.y = height;
      } else {
        obj.y = height + 2;
        obj.x = (4 + (Math.round(Math.random() * 4) % 4)) * width + 2;

        obj.width = 13;
        obj.height = 12;
      }
      entity.dictX = obj.x;
      entity.dictY = obj.y;
      entity.dictWidth = obj.width;
      entity.dictHeight = obj.height;
    }
  } else {
    if (globalConfig.config.tileDict[dictIndexStr] == null) {
      console.error("nothing in config for", dictIndexStr);
      return obj;
    }
    const {x, y} = globalConfig.config.tileDict[dictIndexStr];
    obj.x = x * width;
    obj.y = y * height;
  }

  return obj;
};

const hasNeighbor = (game, pos, type): boolean => {
  return lookupInGrid(game.grid, pos)
    .map(id => game.entities[id])
    .filter(e => e.type == type)
    .length > 0;
}

const getDictIndexStr = (game: Game, entity: Entity): Object => {
  let dictIndexStr = '';
  if (entity.position == null) return dictIndexStr;
  if (hasNeighbor(game, add(entity.position, {x: 1, y: 0}), entity.type)) {
    dictIndexStr += 'l';
  }
  if (hasNeighbor(game, add(entity.position, {x: -1, y: 0}), entity.type)) {
    dictIndexStr += 'r';
  }
  if (hasNeighbor(game, add(entity.position, {x: 0, y: 1}), entity.type)) {
    dictIndexStr += 't';
  }
  if (hasNeighbor(game, add(entity.position, {x: 0, y: -1}), entity.type)) {
    dictIndexStr += 'b';
  }
  return dictIndexStr;
};

//////////////////////////////////////////////////////////////////////
// Background
/////////////////////////////////////////////////////////////////////

const getBackgroundSprite = (game: Game, entity: Entity): Object => {
  const bgWidth = 80;
  const bgHeight = 80;

  let width = bgWidth / 25;
  let height = bgHeight / 25;
  let img = game.sprites[entity.name];
  const obj = {
    img,
    x: 0,
    y: 0,
    width,
    height,
  };

  obj.x = (entity.position.x * bgWidth / 25 + 2 * width) % 250;
  obj.y = (entity.position.y * bgHeight / 25 + 2 * height) % 300;
  if (entity.name == 'PICNIC_BLANKET') {
    // obj.x = 250 - obj.x;
    obj.y = 300 - obj.y;
  }

  return obj;
};

const getForegroundSprite = (game: Game, entity: Entity): Object => {
  const bgWidth = 100;
  const bgHeight = 100;

  let width = bgWidth / game.gridWidth;
  let height = bgHeight / game.gridHeight;
  let img = game.sprites['BLUEGRASS'];
  const obj = {
    img,
    x: 0,
    y: 0,
    width: bgWidth,
    height: bgHeight,
  };

  obj.x = (entity.position.x + game.viewPos.x * 1.5)
    * bgWidth / game.gridWidth;
  obj.y = (entity.position.y + game.viewPos.y * 1.5)
    * bgHeight / game.gridHeight;

  return obj;
};


//////////////////////////////////////////////////////////////////////
// Segmented Critters
/////////////////////////////////////////////////////////////////////

const getSegmentSprite = (game: Game, entity: Entity, segment): Object => {
  const img = game.sprites[entity.type];
  const obj = {
    img,
    x: 0,
    y: 0,
    width: 16,
    height: 16,
  };

  let index = getInterpolatedIndex(game, entity);
  let frame = 0;
  if (entity.actions.length > 0 && entity.actions[0].type != 'BITE') {
    frame = getFrame(game, entity, index);
  }

  if (frame == 0) {
    frame = globalConfig.config[entity.type][segment.segmentType];
    if (!segment.segmentType) {
      frame = 1;
    }
  } else if (segment.segmentType == 'corner') {
    const diff = globalConfig.config[entity.type].corner -
      globalConfig.config[entity.type].straight;
    frame += diff;
  }

  obj.x = frame * obj.width

  return obj;
};

const getSegmentHead = (game: Game, entity: Entity): Object => {
  const img = game.sprites[entity.type];
  const obj = {
    img,
    x: 0,
    y: 0,
    width: 16,
    height: 16,
  };

  let index = getInterpolatedIndex(game, entity);
  let frame = 0;
  if (entity.actions.length > 0 && entity.actions[0].type == 'BITE') {
    frame = getFrame(game, entity, index);
  }
  obj.x = frame * obj.width

  return obj;
};

const getSegmentTail = (game: Game, entity: Entity, segment): Object => {
  if (entity.type == 'CENTIPEDE') {
    return getSegmentSprite(game, entity, segment);
  } else {
    return getSegmentHead(game, entity, segment);
  }
};

const getDeadSegmentHead = (game: Game, entity: Entity, segment): Object => {
  let img = game.sprites.WORM;
  if (entity.type == 'DEAD_CENTIPEDE') {
    img = game.sprites.CENTIPEDE;
  } else if (entity.type == 'DEAD_CATERPILLAR') {
    img = game.sprites.CATERPILLAR;
  }
  const obj = {
    img,
    x: 0,
    y: 0,
    width: 16,
    height: 16,
  };

  if (entity.type == 'DEAD_WORM' || entity.type == 'DEAD_CATERPILLAR') {
    obj.x = 13 * obj.width;
  } else if (entity.type == 'DEAD_CENTIPEDE') {
    obj.x = 7 * obj.width;
  }
  return obj;
};

const getDeadSegmentSprite = (game: Game, entity: Entity, segment): Object => {
  let img = game.sprites.WORM;
  if (entity.type == 'DEAD_CENTIPEDE') {
    img = game.sprites.CENTIPEDE;
  } else if (entity.type == 'DEAD_CATERPILLAR') {
    img = game.sprites.CATERPILLAR;
  }
  const obj = {
    img,
    x: 0,
    y: 0,
    width: 16,
    height: 16,
  };

  if (entity.type == 'DEAD_WORM' || entity.type == 'DEAD_CATERPILLAR') {
    if (segment.segmentType == 'straight') {
      obj.x = 14 * obj.width;
    } else {
      obj.x = 15 * obj.width;
    }
  } else if (entity.type == 'DEAD_CENTIPEDE') {
    if (segment.segmentType == 'straight') {
      obj.x = 8 * obj.width;
    } else {
      obj.x = 9 * obj.width;
    }
  }
  return obj;
};

const getDeadSegmentTail = (game: Game, entity: Entity, segment): Object => {
  if (entity.type == 'CENTIPEDE') {
    return getDeadSegmentSprite(game, entity, segment);
  } else {
    return getDeadSegmentHead(game, entity, segment);
  }
};

module.exports = {
  getInterpolatedPos,
  getInterpolatedTheta,
  getInterpolatedIndex,
  getInterpolatedSize,
  getSpiderSprite,
  getScorpionSprite,
  getAntSpriteAndOffset,
  getTileSprite,
  getPheromoneSprite,
  getBeetleSprite,
  getAphidSprite,
  getRolyPolySprite,
  getDictIndexStr,
  getBackgroundSprite,
  getForegroundSprite,
  getMaxFrameOffset,
  getTermiteSprite,
  getFootSprite,
  getSegmentSprite,
  getSegmentHead,
  getSegmentTail,
  getDeadSegmentSprite,
  getDeadSegmentHead,
  getDeadSegmentTail,
}

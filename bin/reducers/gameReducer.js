const {
  addEntity,
  removeEntity,
  markEntityAsStale,
  changeEntitySize
} = require('../simulation/entityOperations');
const {
  entityInsideGrid,
  lookupInGrid,
  getEntityPositions
} = require('../utils/gridHelpers');
const {
  queueAction,
  makeAction
} = require('../simulation/actionQueue');
const {
  getQueen
} = require('../selectors/misc');
const {
  add,
  subtract,
  round,
  floor,
  ceil,
  equals
} = require('../utils/vectors');
const {
  render
} = require('../render/render');
const {
  fillPheromone,
  clearPheromone,
  setPheromone
} = require('../simulation/pheromones');
const {
  clamp,
  encodePosition,
  decodePosition
} = require('../utils/helpers');
const {
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
  makeScorpion,
  makeDeadScorpion,
  makeBeetle,
  makeDeadBeetle,
  makeStone,
  makeDoodad,
  makeBackground,
  makeForeground,
  makeTermite,
  makeTermiteEgg,
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
} = require('../entities/makeEntity');
const {
  getEntityPheromoneSources,
  getPheromoneAtPosition
} = require('../selectors/pheromones');
const {
  getToken,
  inTokenInfluence
} = require('../selectors/tokens');
const {
  isServer
} = require('../selectors/sessions');
const globalConfig = require('../config');
const gameReducer = (game, action) => {
  switch (action.type) {
    case 'UPGRADE':
      {
        const {
          path,
          value,
          operation,
          name
        } = action;
        let obj = game.config;
        for (let i = 0; i < path.length; i++) {
          const p = path[i];
          if (p == null) break; // don't apply upgrade if it doesn't have a valid path
          if (i == path.length - 1) {
            if (operation == 'append') {
              obj[p].push(value);
            } else if (operation == 'multiply') {
              obj[p] *= value;
            } else if (operation == 'add') {
              obj[p] += value;
            } else {
              obj[p] = value;
            }
          }
          obj = obj[p];
        }
        const queen = getQueen(game, path[0]);
        if (!queen) return game;
        // NOTE: anything that needs to affect the game after the queen has been added
        // but still at the start of the game needs to be added to the asyncApplyLevelActions
        // function over in the rootReducer

        // upgrade-specific hacks:
        if (name == 'Heal Queen') {
          queen.hp = game.config[queen.playerID].QUEEN.hp;
        }
        // HACK: increase hp without restarting the game
        if (name == 'Warrior Queen') {
          queen.hp = 2 * globalConfig.config.QUEEN.hp;
        }
        // HACK: get a seed
        if (name == 'Get A Seed' || name == 'Ant Farm') {
          const seed1 = makeSeed(game, add(queen.position, {
            x: 1,
            y: 0
          }), 'VINE');
          addEntity(game, seed1);
        }
        // HACK: create DOMESTICATE token
        if (name == 'Domesticate' || name == 'Ant Farm') {
          const token = makeToken(game, add(queen.position, {
            x: 1,
            y: 1
          }), queen.playerID, 'DOMESTICATE');
          addEntity(game, token);
          // const seed1 = makeSeed(game, add(queen.position, {x: 0, y: 1}), 'VINE');
          // addEntity(game, seed1);
        }
        // HACK: create PUPA token
        if (name == 'Pupa Token') {
          const token = makeToken(game, add(queen.position, {
            x: 0,
            y: 1
          }), queen.playerID, 'PUPA');
          addEntity(game, token);
          // const seed1 = makeSeed(game, add(queen.position, {x: 0, y: 1}), 'VINE');
          // addEntity(game, seed1);
        }
        // HACK: change queen size
        let width = queen.width;
        let height = queen.height;
        if (name == 'Shorter') height = 1;
        if (name == 'Thinner') width = 1;
        if (name == 'Longer') height = 3;
        if (name == 'Wider') width = 3;
        if (name == 'Shorter' || name == 'Thinner' || name == 'Longer' || name == 'Wider') {
          changeEntitySize(game, queen, width, height);
        }
        return game;
      }
    case 'SET_HIT_ANTS_TO_WIN':
      {
        game.inCountdown = true;
        game.countdownStartTime = new Date().getTime();
        game.countdownMillis = globalConfig.config.countdownMillis;
        game.countdownOffset = 0;
        game.ticksAtWin = game.time;
        return game;
      }
    case 'ENQUEUE_ENTITY_ACTION':
      {
        const {
          entityAction,
          entity,
          entityID
        } = action;
        // if the action came from the server, then adjust the entityAction duration
        // based on the latency
        if (!isServer() && action.time) {
          const diff = action.time - game.time;
          const time = diff * globalConfig.config.msPerTick;
          console.log("time added", diff, time);
          // entityAction.duration += time;
          // entityAction.duration = Math.max(0, entityAction.duration);
        }

        if (entityID) {
          queueAction(game, game.entities[entityID], entityAction, true);
        } else {
          queueAction(game, entity, entityAction);
        }
        return game;
      }
    case 'SET_VIEW_POS':
      {
        const {
          viewPos,
          viewWidth,
          viewHeight
        } = action;
        game.viewPos = viewPos;
        if (viewWidth != null) {
          game.viewWidth = viewWidth;
        }
        if (viewHeight != null) {
          game.viewHeight = viewHeight;
        }
        if (action.rerender) {
          render(game);
        }
        return game;
      }
    case 'INCREMENT_ZOOM':
      {
        const {
          zoom
        } = action;
        const ratio = game.viewWidth / game.viewHeight;
        const widthInc = Math.round(zoom * ratio * 10);
        const heightInc = Math.round(zoom * ratio * 10);
        const nextWidth = game.viewWidth + widthInc;
        const nextHeight = game.viewHeight + heightInc;
        const oldWidth = game.viewWidth;
        const oldHeight = game.viewHeight;
        game.viewWidth = clamp(nextWidth, Math.round(5 * ratio), game.gridWidth + 50);
        game.viewHeight = clamp(nextHeight, Math.round(5 * ratio), game.viewHeight + 50);
        game.viewPos = floor({
          x: (oldWidth - game.viewWidth) / 2 + game.viewPos.x,
          y: (oldHeight - game.viewHeight) / 2 + game.viewPos.y
        });
        render(game); // HACK: for level editor
        return game;
      }
    case 'SET_PHEROMONE_VISIBILITY':
      {
        const {
          pheromoneType,
          isVisible
        } = action;
        game.pheromoneDisplay[pheromoneType] = isVisible;
        return game;
      }
    case 'CREATE_ENTITY':
      {
        const {
          entity
        } = action;
        return addEntity(game, entity);
      }
    case 'DELETE_ENTITY':
      {
        const {
          entity
        } = action;
        removeEntity(game, entity);
        return game;
      }
    case 'CREATE_ENTITIES':
      {
        return createEntitiesReducer(game, action);
      }
    case 'COPY_ENTITIES':
      {
        const {
          rect
        } = action;
        game.clipboard = rect;
        return game;
      }
    case 'PASTE_ENTITIES':
      {
        const {
          pastePos
        } = action;
        const {
          position,
          width,
          height
        } = game.clipboard;
        game.viewImage.isStale = true;
        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            const entities = lookupInGrid(game.grid, add(position, {
              x,
              y
            })).map(id => game.entities[id]).filter(e => equals(e.position, add(position, {
              x,
              y
            })));
            for (const copyEntity of entities) {
              const pos = add(pastePos, {
                x,
                y
              });
              const key = encodePosition(pos);
              game.viewImage.stalePositions[key] = pos;
              const entity = {
                ...copyEntity,
                position: pos
              };
              if (!entityInsideGrid(game, entity)) continue;
              addEntity(game, entity);
            }
          }
        }
        return game;
      }
    case 'FILL_PHEROMONE':
      {
        const {
          gridPos,
          pheromoneType,
          playerID,
          quantity
        } = action;
        fillPheromone(game, gridPos, pheromoneType, playerID, quantity);
        return game;
      }
    case 'UPDATE_ALL_PHEROMONES':
      {
        const {
          pheromones
        } = action;
        // console.log('received pheromone update', pheromones, game.time);
        for (const positionHash of pheromones) {
          for (const encodedPosition in positionHash) {
            const position = decodePosition(encodedPosition);
            const {
              pheromoneType,
              quantity,
              playerID
            } = positionHash[encodedPosition];
            // NOTE: probably don't need this unless I can repro ALERT not clearing in the campaign
            // const blockers = pheromoneType != 'WATER'
            //   ? globalConfig.config.pheromoneBlockingTypes
            //   : globalConfig.config.waterBlockingTypes;
            // const collisions = collidesWith(game, {type: 'DIRT', position}, blockers);
            setPheromone(game, position, pheromoneType, quantity, playerID, true /*no worker*/);
          }
        }

        return game;
      }
    case 'DELETE_ENTITIES':
      {
        const {
          rect
        } = action;
        const {
          position,
          width,
          height
        } = rect;
        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            const pos = add(position, {
              x,
              y
            });
            const ids = lookupInGrid(game.grid, pos);
            for (const id of ids) {
              const entity = game.entities[id];
              removeEntity(game, entity);
              if (game.config.unanimatedTypes.includes(entity.type)) {
                game.viewImage.allStale = true;
              }
            }
          }
        }
        return game;
      }
    case 'SET_EGG_LAYING_COOLDOWN':
      {
        const {
          playerID,
          cooldown
        } = action;
        const queen = getQueen(game, playerID);
        queen.eggLayingCooldown = cooldown;
        return game;
      }
    case 'SET_CONFIG':
      {
        game.config = action.config;
        return game;
      }
    case 'START_EGG_LAYING':
      {
        const {
          playerID
        } = action;
        const queen = getQueen(game, playerID);
        queen.startEggLaying = true;
        return game;
      }
    case 'SET_MAKING_CASTE':
      {
        const {
          makingCaste,
          playerID
        } = action;
        game.colonies[playerID].makingCaste = makingCaste;
        return game;
      }
    case 'SET_SPRITE_SHEET':
      {
        const {
          name,
          img
        } = action;
        game.sprites[name] = img;
        game.viewImage.isStale = true;
        game.viewImage.allStale = true;
        return game;
      }
    case 'SET_TUTORIAL_FLAG':
      {
        const {
          flag
        } = action;
        game.tutorialFlags[flag] = game.time;
        return game;
      }
    case 'MARK_DIRT':
      {
        const {
          playerID,
          dirtIDs
        } = action;
        let taskNeed = 0;
        const pherSources = [];
        for (const id of dirtIDs) {
          const dirt = game.entities[id];
          if (dirt.marked == null && dirt.position != null) {
            taskNeed++;
            game.markedDirtIDs.push(id);
          }
          dirt.marked = playerID;
          fillPheromone(game, dirt.position, 'MARKED_DIRT_PHER', playerID);
          markEntityAsStale(game, dirt);
        }
        game.colonies[playerID].taskNeed['GO_TO_DIRT'] += taskNeed;
        const queen = getQueen(game, playerID);
        queen.digActionType = 'MARK_DIRT';
        return game;
      }
    case 'MARK_DIRT_PUTDOWN':
      {
        const {
          playerID,
          emptyPositions
        } = action;
        for (const pos of emptyPositions) {
          let alreadyAdded = false;
          for (const p of game.dirtPutdownPositions) {
            if (equals(p, pos)) {
              alreadyAdded = true;
              break;
            }
          }
          if (alreadyAdded) {
            continue;
          } else {
            game.dirtPutdownPositions.push(pos);
            game.floodFillSources.push({
              playerID,
              pheromoneType: 'DIRT_DROP',
              position: pos,
              quantity: game.config[playerID]['DIRT_DROP'].quantity
            });
          }
        }
        const queen = getQueen(game, playerID);
        queen.digActionType = 'MARK_DIRT_PUTDOWN';
        return game;
      }
    case 'SET_LAYING_CASTE':
      {
        const {
          playerID,
          caste
        } = action;
        const queen = getQueen(game, playerID);
        queen.selectedCaste = caste;
        return game;
      }
    case 'SWAP_MINI_MAP':
      {
        game.maxMinimap = !game.maxMinimap;
        game.viewImage.allStale = true;
        render(game);
        return game;
      }
    case 'APPEND_UPGRADED_AT':
      {
        const {
          upgradeNum
        } = action;
        game.upgradedAt.push(upgradeNum);
        return game;
      }
    case 'SET_SELECTED_ABILITY':
      {
        const {
          playerID,
          ability
        } = action;
        const queen = getQueen(game, playerID);
        if (queen.selectedAbility = 'AUTOPILOT') {
          queen.autopilot = false;
        }
        queen.selectedAbility = ability;
        queen.abilityActive = false;
        return game;
      }
    case 'SET_ABILITY_ACTIVE':
      {
        const {
          playerID,
          active
        } = action;
        const queen = getQueen(game, playerID);
        // mark dirt
        if ((queen.selectedAbility == 'MARK_DIRT' || queen.selectedAbility == 'MARK_CHAMBER' || queen.selectedAbility == 'MARK_DIRT_PUTDOWN') && active == false) {
          queen.digCharge = 1;
          queen.digActionType = null;
        }

        // autopilot
        if (queen.selectedAbility == 'AUTOPILOT') {
          queen.autopilot = active;
        }

        // burrow
        if (queen.selectedAbility == 'BURROW' && active == true) {
          // queueAction(game, queen, makeAction(game, queen, 'BURROW_HOME', 'MOVE_LARVA_PHER'));
          let pherType = 'MOVE_LARVA_PHER';
          let token = getToken(game, queen.playerID, pherType);
          if (!token) {
            pherType = 'COLONY';
            token = getToken(game, queen.playerID, pherType);
          }
          let pher = false;
          for (const pos of getEntityPositions(game, queen)) {
            if (getPheromoneAtPosition(game, queen.position, pherType, queen.playerID) > 0) {
              pher = true;
            }
          }
          // don't do it if close to the token to avoid a bug
          if (inTokenInfluence(game, queen, pherType)) {
            pher = false;
          }
          if (token && pher) {
            addEntity(game, makeToken(game, token.position, queen.playerID, 'QUEEN_FOLLOW'));
          }
        }
        if (queen.selectedAbility != 'WHIRLWIND') {
          queen.abilityActive = active;
        }
        if (queen.selectedAbility == 'CREATE_RAID' && !game.maxMinimap) {
          // HACK: copy-pasta from SWAP_MINI_MAP action handler
          game.maxMinimap = !game.maxMinimap;
          game.viewImage.allStale = true;
        }
        return game;
      }
    case 'SET_SELECTED_PHEROMONE':
      {
        const {
          playerID,
          pheromone
        } = action;
        const queen = getQueen(game, playerID);
        queen.selectedPheromone = pheromone;
        queen.pheromoneActive = false;
        return game;
      }
    case 'SET_PHEROMONE_ACTIVE':
      {
        const {
          playerID,
          active
        } = action;
        const queen = getQueen(game, playerID);

        // alert/follow/defend
        if ((queen.selectedPheromone == 'QUEEN_ALERT' || queen.selectedPheromone == 'QUEEN_PHER' || queen.selectedPheromone == 'PATROL_DEFEND_PHER') && active == true && queen.pheromoneActive == false) {
          if (queen.selectedPheromone == 'PATROL_DEFEND_PHER') {
            fillPheromone(game, queen.position, queen.selectedPheromone, queen.playerID);
          } else {
            getEntityPositions(game, queen).forEach(pos => fillPheromone(game, pos, queen.selectedPheromone, queen.playerID));
          }
        }

        // expand
        if (queen.selectedPheromone == 'EXPAND' && active == true && queen.pheromoneActive == false) {
          game.colonies[playerID].taskNeed['EXPLORE'] += 20;
          game.config[playerID].WANDER.COLONY = -50;
          game.config[playerID].WANDER.FOOD = 0;
        }
        if (queen.selectedPheromone == 'EXPAND' && active == false && queen.pheromoneActive == true) {
          game.colonies[playerID].taskNeed['EXPLORE'] -= 20;
          game.config[playerID].WANDER.COLONY = 0;
          game.config[playerID].WANDER.FOOD = 10;
        }

        // contract
        if (queen.selectedPheromone == 'CONTRACT' && active == true && queen.pheromoneActive == false) {
          game.colonies[playerID].taskNeed['EXPLORE'] -= 10;
          game.config[playerID].WANDER.COLONY = 50;
          game.config[playerID].WANDER.MOVE_LARVA_PHER = 10;
          game.config[playerID].WANDER.FOOD = 0;
        }
        if (queen.selectedPheromone == 'CONTRACT' && active == false && queen.pheromoneActive == true) {
          game.colonies[playerID].taskNeed['EXPLORE'] += 10;
          game.config[playerID].WANDER.MOVE_LARVA_PHER = 0;
          game.config[playerID].WANDER.COLONY = 0;
          game.config[playerID].WANDER.FOOD = 10;
        }

        // defend
        if (queen.selectedPheromone == 'PATROL_DEFEND_PHER' && active == true && queen.pheromoneActive == false) {
          // PLACEHOLDER
        }
        if (queen.selectedPheromone == 'PATROL_DEFEND_PHER' && active == false && queen.pheromoneActive == true) {
          // PLACEHOLDER
        }
        if (queen.selectedPheromone != null) {
          queen.pheromoneActive = active;
        }
        return game;
      }
    case 'SET':
      {
        const {
          property,
          value
        } = action;
        game[property] = value;
        return game;
      }
    case 'SET_GAME_OVER':
      {
        /**
         * false | 'win' | 'lose' | 'hit_250'
         */
        const {
          gameOver
        } = action;
        game.gameOver = gameOver;
        return game;
      }
    case 'SET_MARQUEE_MODE':
      {
        const {
          keepMarquee
        } = action;
        game.keepMarquee = keepMarquee;
        return game;
      }
    case 'END_COUNTDOWN':
      {
        game.inCountdown = false;
        return game;
      }
    case 'SET_IS_RAINING':
      {
        const {
          rainTicks
        } = action;
        game.rainTicks = rainTicks;
        return game;
      }
  }
  return game;
};
function createEntitiesReducer(game, action) {
  const {
    entityType,
    args,
    rect
  } = action;
  const {
    position,
    width,
    height
  } = rect;
  let makeFn = 'No makeFn provided for entity type ' + entityType;
  switch (entityType) {
    case 'DIRT':
      makeFn = makeDirt;
      break;
    case 'FOOD':
      makeFn = makeFood;
      break;
    case 'EGG':
      makeFn = makeEgg;
      // don't make for out of bounds playerID
      if (args[0] > game.numPlayers) return game;
      break;
    case 'LARVA':
      makeFn = makeLarva;
      // don't make for out of bounds playerID
      if (args[0] > game.numPlayers) return game;
      break;
    case 'PUPA':
      makeFn = makePupa;
      // don't make for out of bounds playerID
      if (args[0] > game.numPlayers) return game;
      break;
    case 'ANT':
      makeFn = makeAnt;
      // don't make for out of bounds playerID
      if (args[0] > game.numPlayers) return game;
      break;
    case 'TOKEN':
      makeFn = makeToken;
      // don't make for out of bounds playerID
      if (args[0] > game.numPlayers) return game;
      break;
    case 'DEAD_ANT':
      makeFn = makeDeadAnt;
      break;
    case 'DEAD_SPIDER':
      makeFn = makeDeadSpider;
      break;
    case 'DEAD_BEETLE':
      makeFn = makeDeadBeetle;
      break;
    case 'STONE':
      makeFn = makeStone;
      break;
    case 'DOODAD':
      makeFn = makeDoodad;
      break;
    case 'BACKGROUND':
      makeFn = makeBackground;
      break;
    case 'FOREGROUND':
      makeFn = makeForeground;
      break;
    case 'TERMITE':
      makeFn = makeTermite;
      break;
    case 'TERMITE_EGG':
      makeFn = makeTermiteEgg;
      break;
    case 'DEAD_TERMITE':
      makeFn = makeDeadTermite;
      break;
    case 'FOOT':
      makeFn = makeFoot;
      break;
    case 'SPIDER_WEB':
      makeFn = makeSpiderWeb;
      break;
    case 'SPIDER':
      makeFn = makeSpider;
      break;
    case 'BEETLE':
      makeFn = makeBeetle;
      break;
    case 'APHID':
      makeFn = makeAphid;
      break;
    case 'ROLY_POLY':
      makeFn = makeRolyPoly;
      break;
    case 'CATERPILLAR':
      makeFn = makeCaterpillar;
      break;
    case 'SCORPION':
      makeFn = makeScorpion;
      break;
    case 'DEAD_SCORPION':
      makeFn = makeDeadScorpion;
      break;
    case 'DEAD_APHID':
      makeFn = makeDeadAphid;
      break;
    case 'DEAD_ROLY_POLY':
      makeFn = makeDeadRolyPoly;
      break;
    case 'DEAD_CATERPILLAR':
      makeFn = makeDeadCaterpillar;
      break;
    case 'WORM':
      makeFn = makeWorm;
      break;
    case 'CENTIPEDE':
      makeFn = makeCentipede;
      break;
    case 'DEAD_WORM':
      makeFn = makeDeadWorm;
      break;
    case 'DEAD_CENTIPEDE':
      makeFn = makeDeadCentipede;
      break;
    case 'VINE':
      makeFn = makeVine;
      break;
    case 'SEED':
      makeFn = makeSeed;
      break;
    case 'CRITTER_EGG':
      makeFn = makeCritterEgg;
      break;
    default:
      console.error(makeFn);
  }
  const onlyMakeOne = entityType == 'SPIDER_WEB' || entityType == 'DOODAD';
  if (onlyMakeOne) {
    const occupied = lookupInGrid(game.grid, position).map(id => game.entities[id]).filter(e => e.type.slice(0, 4) != 'DEAD' && e.type != 'BACKGROUND').length > 0;
    const entity = makeFn(game, position, ...args);
    if (!occupied && entityInsideGrid) {
      addEntity(game, entity);
    }
  } else {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const pos = add(position, {
          x,
          y
        });
        const occupied = lookupInGrid(game.grid, pos).map(id => game.entities[id]).filter(e => e.type.slice(0, 4) != 'DEAD' && e.type != 'BACKGROUND').length > 0;
        if (occupied && entityType != 'BACKGROUND') continue;
        const entity = makeFn(game, pos, ...args);
        if (!entityInsideGrid(game, entity)) continue;
        addEntity(game, entity);
      }
    }
  }
  if (game.config.unanimatedTypes.includes(entityType)) {
    game.viewImage.allStale = true;
  }
  return game;
}
module.exports = {
  gameReducer
};
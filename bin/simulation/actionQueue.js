const {
  closeTo,
  isDiagonalTheta,
  thetaToDir
} = require('../utils/helpers');
const {
  getPheromoneAtPosition
} = require('../selectors/pheromones');
const {
  getEntityConfig
} = require('../selectors/config');
const {
  floor,
  ceil
} = require('../utils/vectors');
const {
  dispatchToServer
} = require('../clientToServer');
const {
  isServer
} = require('../selectors/sessions');
const {
  emitToSession
} = require('../../server/sessions');
// -----------------------------------------------------------------------
// Queueing Actions
// -----------------------------------------------------------------------

const cancelAction = (game, entity) => {
  if (entity.actions.length == 0) return;
  const curAction = entity.actions[0];
  switch (curAction.type) {
    case 'LAY':
    case 'MOVE':
      entity.prevPosition = {
        ...entity.position
      };
      break;
    case 'TURN':
      entity.prevTheta = entity.theta;
      break;
    case 'MOVE_TURN':
      entity.prevPosition = {
        ...entity.position
      };
      entity.prevTheta = entity.theta;
      break;
  }
  entity.actions.shift();
};

// stacked actions come before other queued actions
const stackAction = (game, entity, action) => {
  if (entity.actions.length == 0) {
    entity.actions.push(action);
    return;
  }
  const curAction = entity.actions[0];
  // HACK: this nonsense is because if the ant was previously pointing diagonally,
  // and then points at a 90degree angle, the duration needs to change from 1.4x
  // to just 1x, but the entity's action won't ever update unless we pre-send
  // that theta and update the action here as soon as we stack it
  let theta = action.type == 'TURN' ? action.payload : entity.theta;
  theta = action.type == 'MOVE_TURN' ? action.payload.nextTheta : theta;
  curAction.duration = getDuration(game, {
    ...entity,
    theta
  }, curAction.type);
  curAction.effectDone = false;
  entity.actions.unshift(action);
};
const queueAction = (game, entity, action, noServer) => {
  // const curAction = entity.actions[0];
  // if (curAction != null) {
  //   // HACK: this nonsense is because if the ant was previously pointing diagonally,
  //   // and then points at a 90degree angle, the duration needs to change from 1.4x
  //   // to just 1x, but the entity's action won't ever update unless we pre-send
  //   // that theta and update the action here as soon as we stack it
  //   let theta = action.type == 'TURN'
  //     ? action.payload : entity.theta;
  //   theta = action.type == 'MOVE_TURN' ? action.payload.nextTheta : theta;
  //   action.duration = getDuration(game, {...entity, theta}, curAction.type);
  // }
  entity.actions.push(action);
  if (!noServer) {
    if (isServer()) {
      emitToSession(game.session, game.socketClients, {
        type: 'ENQUEUE_ENTITY_ACTION',
        entityID: entity.id,
        entityAction: {
          ...action,
          fromServer: true
        },
        time: game.time
      }, game.clientID, true);
    } else {
      dispatchToServer({
        type: 'ENQUEUE_ENTITY_ACTION',
        entityID: entity.id,
        entityAction: {
          ...action,
          fromServer: true
        },
        time: game.time
      });
    }
  }
};

// -----------------------------------------------------------------------
// Making Actions
// -----------------------------------------------------------------------

const makeAction = (game, entity, actionType, payload) => {
  var _getEntityConfig$acti;
  let duration = getDuration(game, entity, actionType);
  const effectIndex = ((_getEntityConfig$acti = getEntityConfig(game, entity)[actionType]) === null || _getEntityConfig$acti === void 0 ? void 0 : _getEntityConfig$acti.effectIndex) || 0;
  const action = {
    type: actionType,
    duration,
    payload,
    effectIndex,
    effectDone: false
  };
  return action;
};

// -----------------------------------------------------------------------
// Getters
// -----------------------------------------------------------------------

const isActionTypeQueued = (entity, actionType, almostDone) => {
  for (const action of entity.actions) {
    if (action.type == actionType) {
      if (almostDone && action.duration <= 16) {
        continue;
      }
      return true;
    }
  }
  return false;
};
const getDuration = (game, entity, actionType) => {
  var _getEntityConfig, _getEntityConfig$acti2;
  let duration = ((_getEntityConfig = getEntityConfig(game, entity)) === null || _getEntityConfig === void 0 ? void 0 : (_getEntityConfig$acti2 = _getEntityConfig[actionType]) === null || _getEntityConfig$acti2 === void 0 ? void 0 : _getEntityConfig$acti2.duration) || 1;

  // HACK: this is a bad way to change durations conditionally...
  if (entity.type == 'ANT') {
    var _game$controlledEntit, _game$entity$playerID, _game$entity$playerID2;
    // actions that go from holding something to not any more need to be excluded here
    if (entity.holding != null && actionType != 'PUTDOWN' && actionType != 'FEED' && actionType != 'DASH' && entity.caste != 'QUEEN' // Queen doesn't get slowed down holding stuff
    ) {
      duration = Math.round(duration * 1.5);
    }
    if (entity.task == 'DEFEND' && (actionType == 'MOVE' || actionType == 'MOVE_TURN')) {
      duration = Math.round(duration * 0.4);
    }
    if (entity.task == 'PATROL_DEFEND' && (actionType == 'MOVE' || actionType == 'MOVE_TURN')) {
      duration = Math.round(duration * 0.6);
    }
    if (entity.task == 'ATTACK' && (actionType == 'MOVE' || actionType == 'MOVE_TURN')) {
      duration = Math.round(duration * 0.4);
    }
    // if (entity.caste == 'QUEEN' && entity.playerID != game.playerID) {
    //   duration *= 2;
    // }
    if (entity.caste == 'QUEEN' && entity.width == 1) {
      duration *= 0.8;
    }
    if (entity.caste == 'QUEEN' && entity.id == ((_game$controlledEntit = game.controlledEntity) === null || _game$controlledEntit === void 0 ? void 0 : _game$controlledEntit.id)) {
      const token = game.TOKEN.map(id => game.entities[id]).filter(t => t.pheromoneType == 'QUEEN_FOLLOW' && t.playerID == game.playerID)[0];
      if (token != null) {
        duration = 6;
      }
    }
    if (entity.caste != 'QUEEN' && (_game$entity$playerID = game[entity.playerID]) !== null && _game$entity$playerID !== void 0 && (_game$entity$playerID2 = _game$entity$playerID.config) !== null && _game$entity$playerID2 !== void 0 && _game$entity$playerID2.megaColony) {
      duration = Math.round(duration * 0.6);
    }
    if (entity.caste == 'YOUNG_QUEEN' && entity.task == 'FLY_AWAY' && (actionType == 'TURN' || actionType == 'MOVE_TURN')) {
      duration *= 2;
    }
  }
  if (
  // (actionType == 'MOVE' || actionType == 'MOVE_TURN') &&
  actionType == 'MOVE' && isDiagonalTheta(entity.theta)) {
    duration = Math.round(duration * 1.4); // sqrt(2)
  }

  // slowed down by water
  const inWater = getPheromoneAtPosition(game, floor(entity.position), 'WATER', game.playerID) > 0 || getPheromoneAtPosition(game, floor(entity.prevPosition), 'WATER', game.playerID) > 0;
  if ((actionType == 'MOVE' || actionType == 'MOVE_TURN') && inWater) {
    duration *= 2.5;
  }

  // slowed down by trapjaws
  if (entity.trapjaws != null) {
    duration *= 1 + entity.trapjaws.length * 0.5;
  }
  return duration;
};
const getFrame = (game, entity, index) => {
  var _getEntityConfig2, _getEntityConfig2$act;
  if (entity.actions.length == 0) return 0;
  const actionType = entity.actions[0].type;

  // compute hacky frameOffset
  let frameOffset = 0;
  if (entity.actions[0].payload != null && entity.actions[0].payload.frameOffset > 0 && (actionType == 'MOVE' || actionType == 'MOVE_TURN')
  // HACK: when bite target is queen, frameOffset can be > 0
  ) {
    frameOffset = entity.actions[0].payload.frameOffset;
  }

  // compute caste-specific overrides
  const spriteOrder = (_getEntityConfig2 = getEntityConfig(game, entity)) === null || _getEntityConfig2 === void 0 ? void 0 : (_getEntityConfig2$act = _getEntityConfig2[actionType]) === null || _getEntityConfig2$act === void 0 ? void 0 : _getEntityConfig2$act.spriteOrder;
  const duration = getDuration(game, entity, actionType);
  const progress = index / duration;
  const spriteIndex = Math.floor(progress * spriteOrder.length);
  return spriteOrder[spriteIndex] + frameOffset;
};
module.exports = {
  cancelAction,
  stackAction,
  queueAction,
  isActionTypeQueued,
  getDuration,
  makeAction,
  getFrame
};
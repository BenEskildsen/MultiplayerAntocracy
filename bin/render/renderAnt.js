const {
  subtract,
  add,
  makeVector,
  vectorTheta,
  round,
  rotate,
  floor
} = require('../utils/vectors');
const {
  lookupInGrid,
  getEntityPositions,
  getPheromonesInCell
} = require('../utils/gridHelpers');
const {
  renderHealthBar
} = require('./renderHealthBar');
const {
  renderFood,
  renderDirt,
  renderHill,
  renderEgg,
  renderLarva,
  renderPupa,
  renderToken,
  renderSeed,
  renderCritterEgg,
  renderVine
} = require('./renderOthers');
const {
  getAntSpriteAndOffset
} = require('../selectors/sprites');
const {
  onScreen,
  getPositionsInFront,
  getQueen
} = require('../selectors/misc');
const {
  thetaToDir
} = require('../utils/helpers');
const renderAnt = (ctx, game, ant, highlight) => {
  ctx.save();
  // render relative to top left of grid square,
  // but first translate for rotation around the center
  // NOTE: to support NxM entities, width/height assumes an up-down orientation,
  // so when the ant is left-right, flip width and height
  const dir = thetaToDir(ant.theta);
  const width = dir == 'left' || dir == 'right' ? ant.height : ant.width;
  const height = dir == 'left' || dir == 'right' ? ant.width : ant.height;
  ctx.translate(ant.position.x + width / 2, ant.position.y + height / 2);
  ctx.rotate(ant.theta);
  ctx.translate(-width / 2, -height / 2);
  if (ant.playerID == 1) {
    ctx.fillStyle = '#0000CD';
    ctx.strokeStyle = '#0000CD';
  } else if (ant.playerID == 2) {
    ctx.fillStyle = '#CD0000';
    ctx.strokeStyle = '#CD0000';
  } else if (ant.playerID == 3) {
    ctx.fillStyle = "#8A2BE2";
    ctx.strokeStyle = "#8A2BE2";
  } else if (ant.playerID == 4) {
    ctx.fillStyle = "#E9967A";
    ctx.strokeStyle = "#E9967A";
  }
  if (highlight) {
    if (ant.task == 'WANDER') {
      ctx.strokeStyle = 'white';
    } else if (ant.task == 'RETURN') {
      ctx.strokeStyle = 'black';
    } else if (ant.task == 'RETRIEVE') {
      ctx.strokeStyle = 'brown';
    } else if (ant.task == 'DEFEND' || ant.task == 'ATTACK') {
      ctx.strokeStyle = 'orange';
    } else if (ant.task == 'EXPLORE') {
      ctx.strokeStyle = 'purple';
    } else if (ant.task == 'FEED_LARVA') {
      ctx.strokeStyle = 'blue';
    } else if (ant.task == 'MOVE_DIRT') {
      ctx.strokeStyle = 'yellow';
    } else if (ant.task == 'MOVE_EGG') {
      ctx.strokeStyle = 'gray';
    } else if (ant.task == 'MOVE_LARVA') {
      ctx.strokeStyle = 'pink';
    } else if (ant.task == 'MOVE_PUPA') {
      ctx.strokeStyle = 'green';
    } else if (ant.task == 'GO_TO_DIRT') {
      ctx.strokeStyle = 'steelblue';
    } else if (ant.task == 'PATROL') {
      ctx.strokeStyle = 'red';
    } else if (ant.task == 'PATROL_DEFEND') {
      ctx.strokeStyle = 'green';
    } else if (ant.task == 'RAID') {
      ctx.strokeStyle = 'green';
    }
  }
  const originalFill = ctx.fillStyle;
  const queenFill = '#FFD700';
  ctx.beginPath();

  // legs
  ctx.translate(width / 2, height / 2);
  for (let deg = 60; deg <= 120; deg += 30) {
    const rad = deg * Math.PI / 180;
    const leg1 = makeVector(rad, width * 0.7);
    const leg2 = makeVector(-rad, width * 0.7);
    ctx.moveTo(0, 0);
    ctx.lineTo(leg1.x, leg1.y);
    ctx.stroke();
    ctx.moveTo(0, 0);
    ctx.lineTo(leg2.x, leg2.y);
    ctx.stroke();
  }
  ctx.translate(-width / 2, -height / 2);
  ctx.closePath();

  // body
  let radius = 0.8 * width / 2;
  radius = radius / 2;
  ctx.beginPath();
  ctx.arc(width / 2 - 2 * radius, height / 2, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fill();
  if (ant.caste == 'QUEEN') {
    ctx.fillStyle = queenFill;
  }
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width / 2 + 2 * radius, height / 2, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = originalFill;
  ctx.fill();
  if (ant.holding != null) {
    const heldEntity = ant.holding;
    ctx.save();
    ctx.scale(0.45, 0.45);
    ctx.translate(0.5, 1);
    if (heldEntity.type == 'FOOD') {
      renderFood(ctx, game, {
        ...heldEntity,
        position: {
          x: 0,
          y: 0
        }
      });
    } else if (heldEntity.type == 'DIRT') {
      renderDirt(ctx, game, {
        ...heldEntity,
        position: {
          x: 0,
          y: 0
        }
      });
    } else if (heldEntity.type == 'EGG') {
      renderEgg(ctx, game, {
        ...heldEntity,
        position: {
          x: 0,
          y: 0
        }
      });
    } else if (heldEntity.type == 'LARVA') {
      renderLarva(ctx, game, {
        ...heldEntity,
        position: {
          x: 0,
          y: 0
        }
      });
    } else if (heldEntity.type == 'PUPA') {
      renderPupa(ctx, game, {
        ...heldEntity,
        position: {
          x: 0,
          y: 0
        }
      });
    } else if (heldEntity.type == 'TOKEN') {
      renderToken(ctx, game, {
        ...heldEntity,
        position: {
          x: 0,
          y: 0
        }
      }, true /* isHeld */);
    }

    ctx.restore();
  }
  ctx.closePath();
  if (ant.hp < game.config[ant.playerID][ant.caste].hp) {
    renderHealthBar(ctx, ant, game.config[ant.playerID][ant.caste].hp);
  }
  ctx.restore();

  // render positions in front
  if (game.showPositionsInFront) {
    const positionsInFront = getPositionsInFront(game, ant);
    for (const pos of positionsInFront) {
      const {
        x,
        y
      } = pos;
      ctx.strokeStyle = 'red';
      ctx.strokeRect(x, y, 1, 1);
    }
  }

  // render hitbox
  if (game.showHitboxes) {
    const entityPositions = getEntityPositions(game, ant);
    for (const pos of entityPositions) {
      const {
        x,
        y
      } = pos;
      ctx.strokeStyle = 'red';
      ctx.strokeRect(x, y, 1, 1);
    }
  }

  // render true hitbox
  if (game.showTrueHitboxes) {
    const entityPositions = [];
    for (let x = 0; x < game.gridWidth; x++) {
      for (let y = 0; y < game.gridHeight; y++) {
        const entitiesAtPos = lookupInGrid(game.grid, {
          x,
          y
        });
        for (const id of entitiesAtPos) {
          if (id == ant.id) {
            entityPositions.push({
              x,
              y
            });
          }
        }
      }
    }
    for (const pos of entityPositions) {
      const {
        x,
        y
      } = pos;
      ctx.strokeStyle = 'red';
      ctx.strokeRect(x, y, 1, 1);
    }
  }
  if (game.showAntDecision && ant.decisions != null) {
    for (const decision of ant.decisions) {
      const {
        position,
        score,
        chosen
      } = decision;
      const {
        x,
        y
      } = position;
      if (chosen) {
        ctx.strokeStyle = 'red';
        ctx.strokeRect(x, y, 1, 1);
      }
      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'black';
      ctx.font = '1px sans serif';
      ctx.fillText(parseInt(score), x, y + 1, 1);
    }
  }
};
const renderAntSprite = (ctx, game, ant, recursed) => {
  if (game.showTaskColors) {
    renderAnt(ctx, game, ant, game.showTaskColors);
    return;
  }
  ctx.save();

  // render relative to top left of grid square,
  // but first translate for rotation around the center
  // NOTE: to support NxM entities, width/height assumes an up-down orientation,
  // so when the ant is left-right, flip width and height
  const dir = thetaToDir(ant.theta);
  let width = dir == 'left' || dir == 'right' ? ant.height : ant.width;
  let height = dir == 'left' || dir == 'right' ? ant.width : ant.height;
  if (ant.caste == 'SUB_MINIMA') {
    width = 0.5;
    height = 0.5;
  }
  ctx.translate(ant.position.x + width / 2, ant.position.y + height / 2);
  ctx.rotate(ant.theta - Math.PI / 2);
  // EXAMINE spritesheet only looks right, so need to flip it if it's looking left
  if (ant.actions.length > 0 && ant.actions[0].type == 'EXAMINE' && ant.actions[0].payload == 'left') {
    ctx.scale(-1, 1);
  }
  ctx.translate(-1 * width / 2, -1 * height / 2);
  const sprite = getAntSpriteAndOffset(game, ant);
  let renderHeight = ant.height;
  let renderWidth = ant.width;
  if (sprite.img != null) {
    if (ant.caste == 'YOUNG_QUEEN') {
      if (ant.task == 'FLY_AWAY') {
        renderHeight = 2;
        renderWidth = 3;
      } else {
        renderHeight = 2;
      }
    } else if (ant.caste == 'SUB_MINIMA') {
      renderWidth = 0.5;
      renderHeight = 0.5;
    } else if (ant.caste == 'SOLDIER') {
      renderWidth = 1.4;
      renderHeight = 1.5;
    }
    ctx.drawImage(sprite.img, sprite.x, sprite.y, sprite.width, sprite.height, 0, 0, renderWidth, renderHeight);
  }
  const curAction = ant.actions[0];
  const isPickingUp = curAction != null && curAction.type == "PICKUP";
  if (ant.holding != null && !isPickingUp) {
    for (let i = 0; i < ant.holdingIDs.length; i++) {
      const heldEntity = game.entities[ant.holdingIDs[i]];
      ctx.save();
      if (ant.holdingIDs.length == 1) {
        ctx.translate(renderWidth / 2 - 0.45 / 2, -0.1);
        ctx.scale(0.45, 0.45);
      } else {
        ctx.translate(i * width / 3, -0.1);
        ctx.scale(0.48, 0.48);
      }
      if (heldEntity.type == 'FOOD') {
        renderFood(ctx, game, {
          ...heldEntity,
          position: {
            x: 0,
            y: 0
          }
        });
      } else if (heldEntity.type == 'DIRT') {
        renderDirt(ctx, game, {
          ...heldEntity,
          position: {
            x: 0,
            y: 0
          }
        });
      } else if (heldEntity.type == 'EGG' || heldEntity.type == 'TERMITE_EGG') {
        renderEgg(ctx, game, {
          ...heldEntity,
          position: {
            x: 0,
            y: 0
          }
        });
      } else if (heldEntity.type == 'CRITTER_EGG') {
        renderCritterEgg(ctx, game, {
          ...heldEntity,
          position: {
            x: 0,
            y: 0
          }
        });
      } else if (heldEntity.type == 'LARVA') {
        renderLarva(ctx, game, {
          ...heldEntity,
          position: {
            x: 0,
            y: 0
          }
        });
      } else if (heldEntity.type == 'PUPA') {
        renderPupa(ctx, game, {
          ...heldEntity,
          position: {
            x: 0,
            y: 0
          }
        });
      } else if (heldEntity.type == 'TOKEN') {
        renderToken(ctx, game, {
          ...heldEntity,
          position: {
            x: 0,
            y: 0
          }
        }, true /* isHeld */);
      } else if (heldEntity.type == 'SEED') {
        renderSeed(ctx, game, {
          ...heldEntity,
          position: {
            x: 0,
            y: 0
          }
        });
      } else if (heldEntity.type == 'VINE') {
        renderVine(ctx, game, {
          ...heldEntity,
          position: {
            x: 0,
            y: 0
          }
        });
      }
      ctx.restore();
    }
  }

  // render trapjaw ants
  if (ant.trapjaws != null) {
    for (const trapjaw of ant.trapjaws) {
      renderAntSprite(ctx, game, {
        ...game.entities[trapjaw.id],
        position: trapjaw.position
      });
    }
  }

  // render shadow if dashing
  if (ant.actions[0] != null && ant.actions[0].type == 'DASH' && !recursed) {
    ctx.globalAlpha = 0.5;
    const y = height + 0.5;
    renderAntSprite(ctx, game, {
      ...ant,
      position: {
        x: 0,
        y
      },
      theta: Math.PI / 2
    }, true);
    ctx.globalAlpha = 0.2;
    renderAntSprite(ctx, game, {
      ...ant,
      position: {
        x: 0,
        y: y * 2
      },
      theta: Math.PI / 2
    }, true);
    ctx.globalAlpha = 1;
  }

  // render token for task
  const pheromoneType = {
    WANDER: 'WANDER',
    QUEEN_WANDER: 'WANDER',
    EXPLORE: null,
    RETRIEVE: 'COLONY',
    RETURN: 'COLONY',
    FEED_LARVA: 'MOVE_LARVA_PHER',
    MOVE_DIRT: 'DIRT_DROP',
    DEFEND: 'ALERT',
    MOVE_EGG: 'EGG',
    MOVE_LARVA: 'MOVE_LARVA_PHER',
    MOVE_PUPA: 'PUPA',
    GO_TO_DIRT: 'DIRT_DROP',
    ATTACK: 'ALERT',
    PATROL: 'ALERT',
    RAID: 'ALERT',
    PATROL_DEFEND: 'ALERT'
  }[ant.task];
  const maxTime = 20;
  if (ant.timeOnTask < maxTime && pheromoneType != null && ant.caste != 'QUEEN') {
    const newRadius = Math.min(0.7, 0.7 * ant.timeOnTask / (maxTime / 2));
    ctx.save();
    ctx.translate(width / 2 - newRadius / 2, 0.5);
    ctx.scale(newRadius, newRadius);
    renderToken(ctx, game, {
      type: 'TOKEN',
      playerID: ant.playerID,
      id: 1,
      position: {
        x: 0,
        y: 0
      },
      pheromoneType,
      width: 1,
      height: 1
    }, true /* is held */);

    ctx.restore();
  } else if (ant.caste != 'QUEEN' && pheromoneType != null && ant.timeOnTask > maxTime) {
    // detect ant confusion
    const pher = getPheromonesInCell(game.grid, round(ant.position), ant.playerID);
    if (ant.playerID == game.playerID && (ant.task == 'RETURN' && pher.COLONY == 0 || ant.task == 'MOVE_DIRT' && pher.DIRT_DROP == 0 || ant.task == 'MOVE_LARVA' && pher.MOVE_LARVA_PHER == 0 || ant.task == 'MOVE_EGG' && pher.EGG == 0 || ant.task == 'MOVE_PUPA' && pher.PUPA == 0)) {
      const newRadius = Math.min(1, 0.7 + 1 / (game.time % maxTime));
      ctx.save();

      // rotate
      ctx.translate(width / 2, 0.5);
      ctx.rotate(-1 * ant.theta + Math.PI / 2);
      ctx.translate(-newRadius / 2, 0);

      // ctx.translate(width/2 - newRadius/2, 0.5);
      ctx.scale(newRadius, newRadius);
      // counter rotate
      renderToken(ctx, game, {
        type: 'TOKEN',
        playerID: ant.playerID,
        id: 1,
        position: {
          x: 0,
          y: 0
        },
        pheromoneType: 'QUESTION',
        width: 1,
        height: 1
      }, true /* is held */);

      ctx.restore();
    }
  }
  ctx.translate(width / 2, height / 2);
  ctx.rotate(Math.PI / 2);
  ctx.translate(-width / 2, -height / 2);

  // render hp bar
  if (Math.ceil(ant.hp) < game.config[ant.playerID][ant.caste].hp && !recursed) {
    renderHealthBar(ctx, ant, game.config[ant.playerID][ant.caste].hp);
  }
  ctx.restore();

  // render positions in front
  if (game.showPositionsInFront) {
    const positionsInFront = getPositionsInFront(game, ant);
    for (const pos of positionsInFront) {
      const {
        x,
        y
      } = pos;
      ctx.strokeStyle = 'red';
      ctx.strokeRect(x, y, 1, 1);
    }
  }

  // render true position
  if (game.showTruePositions) {
    ctx.fillStyle = 'rgba(200, 0, 0, 0.4)';
    ctx.fillRect(ant.position.x, ant.position.y, 1, 1);
  }

  // render hitbox
  if (game.showHitboxes) {
    const positionsInFront = getEntityPositions(game, ant);
    for (const pos of positionsInFront) {
      const {
        x,
        y
      } = pos;
      ctx.strokeStyle = 'red';
      ctx.strokeRect(x, y, 1, 1);
    }
  }

  // render true hitbox
  if (game.showTrueHitboxes) {
    const entityPositions = [];
    for (let x = 0; x < game.gridWidth; x++) {
      for (let y = 0; y < game.gridHeight; y++) {
        const entitiesAtPos = lookupInGrid(game.grid, {
          x,
          y
        });
        for (const id of entitiesAtPos) {
          if (id == ant.id) {
            entityPositions.push({
              x,
              y
            });
          }
        }
      }
    }
    for (const pos of entityPositions) {
      const {
        x,
        y
      } = pos;
      ctx.strokeStyle = 'red';
      ctx.strokeRect(x, y, 1, 1);
    }
  }
  if (game.showAntDecision && ant.decisions != null) {
    for (const decision of ant.decisions) {
      const {
        position,
        score,
        chosen
      } = decision;
      const {
        x,
        y
      } = position;
      if (chosen) {
        ctx.strokeStyle = 'red';
        ctx.strokeRect(x, y, 1, 1);
      }
      ctx.strokeStyle = 'black';
      ctx.fillStyle = 'black';
      ctx.font = '1px sans serif';
      ctx.fillText(parseInt(score), x, y + 1, 1);
    }
  }
};
const renderDeadAnt = (ctx, game, ant) => {
  ctx.save();
  // render relative to top left of grid square,
  // but first translate for rotation around the center
  let width = ant.width;
  let height = ant.height;
  if (ant.caste == 'SUB_MINIMA') {
    width = 0.5;
    height = 0.5;
  }
  ctx.translate(ant.position.x + width / 2, ant.position.y + height / 2);
  ctx.rotate(ant.theta - Math.PI / 2);
  ctx.translate(-ant.width / 2, -ant.height / 2);
  ctx.globalAlpha = 0.6;
  const sprite = getAntSpriteAndOffset(game, ant);
  if (sprite.img != null) {
    ctx.drawImage(sprite.img, sprite.x, sprite.y, sprite.width, sprite.height, 0, 0, width, height);
  }
  ctx.restore();
};
module.exports = {
  renderDeadAnt,
  renderAnt,
  renderAntSprite
};
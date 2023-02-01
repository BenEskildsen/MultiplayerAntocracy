// @flow

const {
  subtract, add, makeVector, vectorTheta, rotate,
  multiply, scale,
} = require('../utils/vectors');
const {renderHealthBar} = require('./renderHealthBar');
const {getPositionsInTokenRadius} = require('../selectors/tokens');
const {
  getTileSprite,
  getBackgroundSprite,
  getForegroundSprite,
  getBeetleSprite,
} = require('../selectors/sprites');

import type {Game, Entity, Hill, Ant, Food} from '../types';

const renderFood = (ctx, game, food): void => {
  const obj = getTileSprite(game, food);
  if (obj == null || obj.img == null) return;
  ctx.drawImage(
    obj.img,
    obj.x, obj.y, obj.width, obj.height,
    food.position.x, food.position.y, food.width, food.height,
  );

  if (game.showMarkedFood) {
    if (game.colonies[game.playerID].foodMarkedForRetrieval[food.id]) {
      ctx.fillStyle = 'rgba(0, 0, 250, 0.2)';
      ctx.fillRect(food.position.x, food.position.y, food.width, food.height);
      ctx.fillStyle = 'red';
      ctx.font = '1px sans serif';
      ctx.fillText(
        parseInt(food.id), food.position.x, food.position.y + 1, 1,
      );
    }
  }
};

const renderDirt = (ctx, game, dirt): void => {
  const obj = getTileSprite(game, dirt);

  if (obj == null || obj.img == null) return;
  ctx.drawImage(
    obj.img,
    obj.x, obj.y, obj.width, obj.height,
    dirt.position.x, dirt.position.y, dirt.width, dirt.height,
  );

  if (dirt.marked != null) {
    ctx.fillStyle = 'rgba(0, 0, 250, 0.2)';
    ctx.fillRect(dirt.position.x, dirt.position.y, dirt.width, dirt.height);
  }
}

const renderStone = (ctx, game, stone): void => {
  const obj = getTileSprite(game, stone);
  if (obj == null || obj.img == null) return;
  ctx.drawImage(
    obj.img,
    obj.x, obj.y, obj.width, obj.height,
    stone.position.x, stone.position.y, stone.width, stone.height,
  );
};

const renderDoodad = (ctx, game, doodad): void => {
  let width = doodad.width;
  let height = doodad.height;
  if (doodad.sprite == 'QUESTION') {
    width = 1;
    height = 1;
    let subType = 'KITCHEN';
    if (game.triviaLocated) {
      subType = 'STONE';
    }
    renderStone(
      ctx, game,
      {...doodad,
        type: 'STONE',
        position: {...doodad.position}, // explicitly copy this
        subType, dictIndexStr: 'lt', width: 1, height: 1,
      },
    );
    renderStone(
      ctx, game,
      {...doodad,
        position: add(doodad.position, {x: 0, y: 1}),
        type: 'STONE',
        subType, dictIndexStr: 'lb',
        width: 1, height: 1,
      },
    );
    renderStone(
      ctx, game,
      {...doodad,
        position: add(doodad.position, {x: 1, y: 0}),
        type: 'STONE',
        subType, dictIndexStr: 'rt',
        width: 1, height: 1,
      },
    );
    renderStone(
      ctx, game,
      {...doodad,
        position: add(doodad.position, {x: 1, y: 1}),
        type: 'STONE',
        subType, dictIndexStr: 'rb',
        width: 1, height: 1,
      },
    );
    ctx.translate(0.5, 0.5);
  }
  const sprite = game.sprites[doodad.sprite];
  if (sprite != null) {
    ctx.drawImage(
      sprite,
      doodad.position.x, doodad.position.y,
      width, height,
    );
  }

  if (doodad.sprite == 'QUESTION') {
    ctx.translate(-0.5, -0.5);
  }
};

const renderSpiderWeb = (ctx, game, spiderWeb): void => {
  const sprite = game.sprites.SPIDER_WEB;
  if (sprite != null) {
    ctx.drawImage(
      sprite,
      spiderWeb.position.x, spiderWeb.position.y,
      spiderWeb.width, spiderWeb.height,
    );
  }
};

const renderBackground = (ctx, game, tile): void => {
  let obj = getBackgroundSprite(game, tile);
  if (obj == null || obj.img == null) return;
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.drawImage(
    obj.img,
    obj.x, obj.y, obj.width, obj.height,
    tile.position.x, tile.position.y,
    tile.width, tile.height,
  );
  ctx.restore();
};

const renderForeground = (ctx, game, tile): void => {
  const obj = getForegroundSprite(game, tile);
  if (obj == null || obj.img == null) return;
  ctx.drawImage(
    obj.img,
    obj.x, obj.y, obj.width, obj.height,
    tile.position.x, tile.position.y,
    game.gridWidth, game.gridHeight,
  );
};

const renderTokenSymbol = (ctx, game, entity): void => {
  const sprite = game.sprites[entity.type];
  if (sprite != null) {
    ctx.drawImage(
      sprite,
      entity.position.x, entity.position.y, entity.width, entity.height,
    );
  }
}

const renderEgg = (ctx, game, entity): void => {
  const egg = entity;
  const timeToHatch = game.config[egg.playerID][egg.caste].eggHatchAge - egg.age;

  let position = egg.position;
  // const speed = 30;
  // if (egg.age < speed) {
  //   const queen = getQueen(game, egg.playerID);
  //   if (queen != null && queen.position != null) {
  //     const progress = egg.age / speed;
  //     const diff = subtract(egg.position, queen.position);
  //     position = add(queen.position, scale(diff, progress));
  //   }
  // }

  let scale = 1;
  let num = 0;
  if (egg.caste == 'SUB_MINIMA') {
    scale = 0.5;
    num = 1;
  }
  for (let x = 0; x <= num; x++) {
    for (let y = 0; y <= num; y++) {
      if (timeToHatch < 120) {
        const sprite = game.sprites.EGG_HATCH;
        if (sprite != null) {
          ctx.drawImage(
            sprite,
            32 * Math.floor((119 - timeToHatch) / 20), 0, 32, 32,
            position.x + x/2, position.y + y/2, egg.width * scale, egg.height * scale,
          );
        }
      } else {
        const sprite = game.sprites.EGG;
        if (sprite != null) {
          ctx.drawImage(
            sprite,
            position.x + x/2, position.y + y/2, egg.width * scale, egg.height * scale,
          );
        }
      }
    }
  }
}

const renderCritterEgg = (ctx, game, entity): void => {
  const egg = entity;
  const sprite = game.sprites.EGG;
  if (sprite != null) {
    ctx.drawImage(
      sprite,
      egg.position.x, egg.position.y, egg.width, egg.height,
    );
  }
}

const renderLarva = (ctx, game, larva): void => {
  let sprite = game.sprites.LARVA;
  if (game.config[larva.playerID].spikedLarva) {
    sprite = game.sprites.SPIKED_LARVA;
  }
  let scale = 1.3
  if (sprite != null) {
    if (larva.caste == 'SUB_MINIMA') {
      for (let x = 0; x <= 1; x++) {
        for (let y = 0; y <= 1; y++) {
          scale = 0.5;
          ctx.drawImage(
            sprite,
            32 * (Math.floor((game.time + (larva.id % 10)) / 12) % 3), 0, 32, 32,
            larva.position.x + (x / 2), larva.position.y + (y / 2),
            larva.width * scale, larva.height * scale,
          );
        }
      }
    } else {
      ctx.drawImage(
        sprite,
        32 * (Math.floor((game.time + (larva.id % 10)) / 12) % 3), 0, 32, 32,
        larva.position.x, larva.position.y,
        larva.width * scale, larva.height * scale,
      );
    }
  }

  const need = larva.foodNeed;
  if (larva.caste != null && need != null && larva.playerID != null) {
    const totalNeed = game.config[larva.playerID][larva.caste].larvaFoodNeed;
    if (need < totalNeed) {
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth *= 2;

      ctx.strokeStyle = 'green';
      ctx.arc(
        larva.position.x + (larva.width*scale) / 2, // x
        larva.position.y + (larva.height*scale) / 2, // y
        larva.width * 0.5, // radius
        (Math.PI * 2) * (need / totalNeed) + Math.PI / 2,
        Math.PI / 2,
      );
      ctx.stroke();

      ctx.restore();
    }
  }
}

const renderPupa = (ctx, game, pupa): void => {

  let scale = 1;
  let num = 0;
  if (pupa.caste == 'SUB_MINIMA') {
    scale = 0.5;
    num = 1;
  }
  for (let x = 0; x <= num; x++) {
    for (let y = 0; y <= num; y++) {

      if (pupa.age < 40 && !pupa.isToken) {
        const sprite = game.sprites.LARVA;
        renderLarva(ctx, game, pupa);
        ctx.drawImage(
          sprite,
          32 * 5 + 32 * Math.floor(pupa.age / 10), 0, 32, 32,
          pupa.position.x + x/2, pupa.position.y + y/2,
          pupa.width * scale, pupa.height * scale,
        );
        return;
      }
      const sprite = game.sprites.PUPA;
      if (sprite != null) {
        if (pupa.caste != 'SUB_MINIMA') {
          ctx.save();
          ctx.translate(
            pupa.position.x + pupa.width / 2,
            pupa.position.y + pupa.height / 2,
          );
          const rotation = [0, Math.PI / 2, Math.PI, Math.PI * 1.5][pupa.id % 4];
          ctx.rotate(rotation);
          ctx.drawImage(
            sprite,
            -pupa.width / 2, -pupa.height /2, pupa.width, pupa.height,
          );
          ctx.restore();
        } else {
          ctx.drawImage(
            sprite,
            pupa.position.x + x/2, pupa.position.y + y/2,
            pupa.width * scale, pupa.height * scale,
          );
        }

      }
    }
  }
}

const renderToken = (ctx, game, token, isHeld): void => {
  let renderFn = null;
  let renderType = null;
  let scale = 0.5;
  ctx.save();
  ctx.translate(token.position.x, token.position.y);
  switch (token.pheromoneType) {
    case 'EGG':
      renderType = 'EGG';
      renderFn = renderEgg;
      ctx.fillStyle = 'white';
      break;
    case 'MOVE_LARVA_PHER':
      renderType = 'LARVA';
      renderFn = renderLarva;
      ctx.fillStyle = 'rgba(138, 43, 226)';
      break;
    case 'PUPA':
      renderType = 'PUPA';
      renderFn = renderPupa;
      ctx.fillStyle = 'grey';
      break;
    case 'DIRT_DROP':
      renderType = 'DIRT';
      renderFn = renderDirt;
      ctx.fillStyle = 'brown';
      break;
    case 'COLONY':
      renderType = 'FOOD';
      renderFn = renderFood;
      ctx.fillStyle = 'blue';
      break;
    case 'QUEEN_FOLLOW':
    case 'WANDER':
      renderType = 'WANDER';
      renderFn = renderTokenSymbol;
      ctx.fillStyle = 'grey';
      break;
    case 'RAID_PHER':
    case 'ALERT':
      renderType = 'ALERT';
      renderFn = renderTokenSymbol;
      ctx.fillStyle = 'black';
      break;
    case 'QUESTION':
      renderType = 'QUESTION';
      renderFn = renderTokenSymbol;
      ctx.fillStyle = 'grey';
      break;
    case 'MALE':
      renderType = 'MALE';
      renderFn = renderTokenSymbol;
      ctx.fillStyle = 'grey';
      break;
    case 'FEMALE':
      renderType = 'FEMALE';
      renderFn = renderTokenSymbol;
      ctx.fillStyle = 'grey';
      break;
    case 'DOMESTICATE':
      renderType = 'BEETLE';
      ctx.fillStyle = 'tan';
      renderFn = (ctx, game, beetle) => {
        const sprite = getBeetleSprite(game, beetle);
        ctx.drawImage(
          sprite.img, sprite.x, sprite.y, sprite.width, sprite.height,
          0, 0, 1, 1,
        );
      };
      scale = 0.8;
      break;
  }

  if (!isHeld && game.pheromoneDisplay[token.pheromoneType]) {
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = 'black';
    const positions = getPositionsInTokenRadius(game, token);
    for (const pos of positions) {
      const {x,y} = subtract(pos, token.position);
      ctx.strokeRect(
        x, y, 1, 1,
      );
    }
    ctx.globalAlpha = 1;
  }

  ctx.strokeStyle = 'black';
  ctx.beginPath();
  const radius = token.width / 2;
  ctx.arc(
    token.width / 2,
    token.height / 2,
    radius, 0, Math.PI * 2,
  );
  ctx.closePath();
  ctx.stroke();
  ctx.fill();

  if (renderFn == null || renderType == null) {
    ctx.restore();
    return;
  }

  ctx.scale(scale, scale);
  ctx.translate(1 - scale, 1 - scale);
  renderFn(
    ctx, game,
    {
      ...token, position: {x: 0, y: 0}, type: renderType, caste: 'MINIMA',
      isToken: true,
      actions: [],
    });
  ctx.restore();
}

const renderVine = (ctx, game, vine): void => {
  ctx.save();
	ctx.translate(
    vine.position.x + vine.width / 2,
    vine.position.y + vine.height / 2,
  );
  ctx.rotate(vine.theta);
  ctx.translate(-vine.width / 2, -vine.height / 2);
  switch (vine.subType) {
    case 'BUD':
    case 'STALK':
      const obj = getTileSprite(game, vine);
      if (obj == null || obj.img == null) break;
      ctx.drawImage(
        obj.img,
        obj.x, obj.y, obj.width, obj.height,
        0, 0, vine.width * 1, vine.height * 1,
      );
      const rootSprite = game.sprites.ROOTS;
      for (const root of vine.roots) {
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.translate(root.x + 0.5, root.y + 0.5);
        ctx.rotate(vectorTheta(root) - Math.PI / 2);
        ctx.drawImage(rootSprite, -0.55, -0.55, 1.1, 1.1);
        ctx.restore();
      }
      const sproutSprite = game.sprites.SPROUT;
      const width = 4;
      const height = 2;
      for (const sprout of vine.sprouts) {
        ctx.save();

        // rotation
        ctx.translate(0.5, 0.5);
        ctx.rotate(sprout.theta);
        ctx.translate(-0.5, -0.5);

        // translation
        const vec = rotate(multiply({x: -1, y: 1}, sprout.pos), sprout.theta);
        ctx.translate(vec.x - 1.5, vec.y - 1);
        ctx.drawImage(sproutSprite, 0, 0, width, height);

        ctx.restore();
      }
      break;
    case 'LEAF':
      const leafSprite = game.sprites.LEAF;
      ctx.drawImage(leafSprite, 0, 0, vine.width, vine.height);

      break;
  }

  if (vine.hp < game.config['VINE'].hp) {
    renderHealthBar(ctx, {...vine}, game.config['VINE'].hp);
  }

  ctx.restore();
}

const renderSeed = (ctx, game, seed): void => {
  const sprite = game.sprites.SEED;
  if (sprite != null) {
    ctx.drawImage(
      sprite,
      seed.position.x, seed.position.y,
      seed.width, seed.height,
    );
  }
}




module.exports = {
  renderFood, renderDirt,
  renderEgg, renderLarva, renderPupa,
  renderToken,
  renderStone, renderDoodad, renderBackground,
  renderForeground,
  renderSpiderWeb,
  renderVine, renderSeed,
  renderCritterEgg,
};

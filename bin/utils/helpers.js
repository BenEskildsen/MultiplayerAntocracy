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
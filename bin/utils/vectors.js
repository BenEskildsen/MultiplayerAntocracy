const {
  cos,
  sin
} = Math;
const add = (...vectors) => {
  const resultVec = {
    x: 0,
    y: 0
  };
  for (const v of vectors) {
    resultVec.x += v.x;
    resultVec.y += v.y;
  }
  return resultVec;
};
const equals = (a, b) => {
  return a.x == b.x && a.y == b.y;
};

// NOTE: see vectorTheta note if subtracting vectors to find the angle between them
const subtract = (...vectors) => {
  const resultVec = {
    ...vectors[0]
  };
  for (let i = 1; i < vectors.length; i++) {
    resultVec.x -= vectors[i].x;
    resultVec.y -= vectors[i].y;
  }
  return resultVec;
};
const makeVector = (theta, magnitude) => {
  const x = magnitude * cos(theta);
  const y = magnitude * sin(theta);
  return {
    x,
    y
  };
};
const dist = (vecA, vecB) => {
  return magnitude(subtract(vecA, vecB));
};
const scale = (vec, scalar) => {
  return {
    x: vec.x * scalar,
    y: vec.y * scalar
  };
};
const magnitude = vector => {
  const {
    x,
    y
  } = vector;
  return Math.sqrt(x * x + y * y);
};

// what is the angle of this vector
// NOTE: that when subtracting two vectors in order to compute the theta
// between them, the target should be the first argument
const vectorTheta = vector => {
  // shift domain from [-Math.PI, Math.PI] to [0, 2 * Math.PI]
  return (2 * Math.PI + Math.atan2(vector.y, vector.x)) % (2 * Math.PI);
};
const multiply = (...vectors) => {
  const resultVec = {
    x: 1,
    y: 1
  };
  for (let i = 0; i < vectors.length; i++) {
    resultVec.x *= vectors[i].x;
    resultVec.y *= vectors[i].y;
  }
  return resultVec;
};
const floor = vector => {
  return {
    x: Math.floor(vector.x),
    y: Math.floor(vector.y)
  };
};
const round = vector => {
  return {
    x: Math.round(vector.x),
    y: Math.round(vector.y)
  };
};
const ceil = vector => {
  return {
    x: Math.ceil(vector.x),
    y: Math.ceil(vector.y)
  };
};
const containsVector = (array, vec) => {
  for (const vector of array) {
    if (equals(vector, vec)) return true;
  }
  return false;
};
const abs = vector => {
  return {
    x: Math.abs(vector.x),
    y: Math.abs(vector.y)
  };
};

// given two positions, return a rectangle with the positions at opposite corners
const toRect = (posA, posB) => {
  const rect = {
    position: {
      x: Math.min(posA.x, posB.x),
      y: Math.min(posA.y, posB.y)
    },
    width: Math.abs(posA.x - posB.x) + 1,
    height: Math.abs(posA.y - posB.y) + 1
  };
  return rect;
};
const rotate = (vector, theta) => {
  const {
    x,
    y
  } = vector;
  return {
    x: cos(theta) * x - sin(theta) * y,
    y: sin(theta) * x + cos(theta) * y
  };
};
module.exports = {
  add,
  subtract,
  equals,
  makeVector,
  scale,
  dist,
  magnitude,
  vectorTheta,
  multiply,
  floor,
  round,
  ceil,
  containsVector,
  toRect,
  rotate,
  abs
};
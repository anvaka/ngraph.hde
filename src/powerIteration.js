let createRandom = require('ngraph.random')

module.exports = function powerIteration(S, k, eps = 1e-40, maxIteration = 10000, seed = 42) {
  if (k > S.length) throw new Error("Matrix ain't that big");
  let random = createRandom(seed);

  let vectors = [];
  let threshold = (1 - eps) * (1 - eps);
  for (let i = 0; i < k; ++i) {
    let next = createRandomVector(S.length);
    normalize(next); 
    let diff = 0;
    let v;
    while (diff < threshold) { 
      v = next; 
      // orthogonize against previous vectors using Gram Schmidt process:
      // https://en.wikipedia.org/wiki/Gram%E2%80%93Schmidt_process
      for (let j = 0; j < i; ++j) {
        let u = vectors[j];
        let product = dot(v, u); 
        for (let col = 0; col < v.length; ++col) {
          // vectors already normalized, so no need to do it again:
          v[col] = v[col] - product * u[col];
        } 
      }

      next = multiply(S, v);
      let len = dot(next, next);
      if (len === 0) {
        // this is likely the vector that corresponds to 0 eigenvalue
        next = v;
        len = dot(next, next);
      }
      divide(next, Math.sqrt(len));
      diff = dot(next, v);
      diff *= diff; 
      
      maxIteration -= 1;
      if (maxIteration < 0) {
        // This usually happens when we run out of precision, still results are normally okay.
        // console.log('Failed to converge :(', i);
        break;
      } 
    }
    vectors.push(next)
  }
  
  return vectors;

  function createRandomVector(l) {
    return Array(l).fill(1).map(() => random.nextDouble());
  }
}


function normalize(v) { 
  let size = Math.sqrt(dot(v, v)); 
  for (let i = 0; i < v.length; ++i) {
    v[i] /= size;
  } 
  return v;
}

function divide(v, l) {
  for (let i = 0; i < v.length; ++i) {
    v[i] /= l;
  } 
  return v;
}

function multiply(A, v) {
  if (A.length !== v.length) throw new Error('Matrix * Vector dimension mismatch');
  let result = [];
  for (let row = 0; row < A.length; ++row) {
    let sum = 0;
    for (let col = 0; col < A.length; ++col) {
      sum += A[row][col] * v[col];
    }
    result[row] = sum;
  }
  return result;
}

function dot(a, b) { 
  let sum = 0;
  if (a.length !== b.length) throw new Error('Vector length mismatch');
  for (let i = 0; i < a.length; ++i) {
    sum += a[i] * b[i];
  }
  return sum;
}

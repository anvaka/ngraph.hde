const Matrix = require('./Matrix');
const powerIteration = require('./powerIteration');
const createRandom = require('ngraph.random');

/**
 * This function creates high dimensional layout for a given graph.
 * 
 * Once the layout is created - positions in lower dimensions are already know.
 * At the moment the graphs are considered to be undirected an unweighted.
 * 
 * @param {*} graph - ngraph.graph instance (https://github.com/anvaka/ngraph.graph)
 * @param {*} options - layout configuration
 * @param {number} options.pivotCount - dimensionality of the initial embedding
 * @param {number} options.dimensions - dimensionality of `getNodePosition`
 * 
 * @see http://www.wisdom.weizmann.ac.il/~harel/papers/highdimensionalGD.pdf
 */
module.exports = function createLayout(graph, options = {}) {
  /**
   * How many pivot points should be used to compute shortest paths?
   * Very low values (less than 3) don't usually result in a good embedding.
   */
  let pivotCount = (Number.isFinite(options.pivotCount) && options.pivotCount > 0) ? options.pivotCount : 50;

  /**
   * By default, do a 2D layout. Layout cannot have more dimensions than pivotCount;
   */
  let layoutDimensions = (Number.isFinite(options.dimensions) && options.dimensions > 0) ? options.dimensions : 2;

  let random = createRandom(42);
  let nodeIdToNumber = new Map();
  let nodes = [];
  graph.forEachNode(node => {
    let id =  nodes.length;
    nodeIdToNumber.set(node.id, id);
    nodes.push(node.id);
  });

  // Now that we know number of points, let's adjust our input variables:
  pivotCount = Math.min(pivotCount, nodes.length);
  layoutDimensions = Math.min(layoutDimensions, pivotCount);

  let {matrix, pivotNodes} = computeHighDimensionalLayout(nodes[0]);
  let vectors = prepareMatrixAndGetCovariantEigenvectors(matrix, layoutDimensions);

  return {
    getNodePosition,
    getPivotNodes,
    getLayoutDimensionsCount
  }

  function getNodePosition(nodeId) {
    let column = nodeIdToNumber.get(nodeId);
    return vectors.map(v => matrix.applyVectorToColumn(column, v));
  }

  function getPivotNodes() {
    return pivotNodes;
  }

  function getLayoutDimensionsCount() {
    return layoutDimensions;
  }

  function computeHighDimensionalLayout(pivot) {
    let bfsDist = Array(nodes.length).fill(Infinity);
    let matrix = new Matrix(pivotCount, nodes.length);
    let pivotNodes = [];

    for (let i = 0; i < pivotCount; ++i) {
      pivotNodes.push(pivot);
      addRow(matrix, i, pivot);

      let nextPivotIndex = bfsDist.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
      // alternative sampling mechanism:
      // let totalDist = 0;
      // for (let j = 0; j < bfsDist.length; ++j) {
      //   totalDist += bfsDist[j];
      // }
      // let sampleProbability = random.next(totalDist);

      // let nextPivotIndex;
      // let cumulativeProbability = 0;
      // for (let j = 0; j < bfsDist.length; ++j) {
      //   cumulativeProbability += bfsDist[j];
      //   if (cumulativeProbability > sampleProbability) {
      //     nextPivotIndex = j;
      //     break;
      //   }
      // }
      // bfsDist[nextPivotIndex] = 0;
      pivot = nodes[nextPivotIndex];
    }

    return {matrix, pivotNodes};

    function addRow(matrix, rowNumber, pivotNode) {
      let queue = [{node: pivotNode, d: 0}];
      let visited = new Set([pivotNode]);
      while (queue.length) {
        let next = queue.shift();
        let column = nodeIdToNumber.get(next.node);
        matrix.set(rowNumber, column, next.d);
        bfsDist[column] = Math.min(bfsDist[column], next.d);

        graph.forEachLinkedNode(next.node, other => {
          if (visited.has(other.id)) return;
          queue.push({
            node: other.id,
            d: next.d + 1
          });
          visited.add(other.id)
        })
      }

      if (visited.size !== nodes.length) {
        throw new Error('Graph has disconnected component. Please use ngraph.hde once per individual component');
      }
    }
  }

  function prepareMatrixAndGetCovariantEigenvectors(matrix, vectorCount) {
    let covariant = matrix.centerMatrix().getCovariant().toArray();
    return powerIteration(covariant, vectorCount);
  }
}

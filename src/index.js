const Matrix = require('./Matrix');
const powerIteration = require('./powerIteration');

/**
 * 
 * @param {*} graph - ngraph.graph instance (https://github.com/anvaka/ngraph.graph)
 * @param {*} options 
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
    getPivotNodes
  }

  function getNodePosition(nodeId) {
    let column = nodeIdToNumber.get(nodeId);
    return vectors.map(v => matrix.applyVectorToColumn(column, v));
  }

  function getPivotNodes() {
    return pivotNodes;
  }

  function computeHighDimensionalLayout(pivot) {
    let bfsDist = Array(nodes.length).fill(Infinity);
    let matrix = new Matrix(pivotCount, nodes.length);
    let pivotNodes = [];

    for (let i = 0; i < pivotCount; ++i) {
      pivotNodes.push(pivot);
      addRow(matrix, i, pivot);

      let indexOfMaxValue = bfsDist.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
      pivot = nodes[indexOfMaxValue];
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

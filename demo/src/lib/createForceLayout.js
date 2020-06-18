import createLayout from 'ngraph.forcelayout';
import * as d3 from 'd3-force';

export default function createForceLayout(graph, layoutName) {
  if (layoutName === 'd3-force') {
    return createD3Layout(graph);
  }

  return createLayout(graph, {
    timeStep: 0.5,
    springLength: 10,
    springCoeff: 0.8,
    gravity: -12,
    dragCoeff: 0.9,
  });
}

function createD3Layout(graph) {
  let nodes = [];
  let nodeToIndex = new Map();
  graph.forEachNode(node => {
    let id = nodes.length;
    nodes.push({id});
    nodeToIndex.set(node.id, id);
  });

  let links = [];
  graph.forEachLink(link => {
    let source = nodeToIndex.get(link.fromId)
    let target = nodeToIndex.get(link.toId)
    links.push({ source, target })
  });

  let simulation 
  let nodeDirty = false;

  return {
    getNodePosition(nodeId) {
      return nodes[nodeToIndex.get(nodeId)];
    },
    setNodePosition(nodeId, x, y) {
      let node = nodes[nodeToIndex.get(nodeId)];
      node.x = x;
      node.y = y;
      nodeDirty = true;
    },
    step() {
      if (!simulation) {
        simulation = d3.forceSimulation(nodes)
          .alphaDecay(0)
          .alpha(0.5)
          .force('x', d3.forceX())
          .force('y', d3.forceY())
          .force('charge', d3.forceManyBody().strength(-5))
          .force('link', d3.forceLink(links).distance(1));

        simulation.stop();
      }
      simulation.tick();
    }
  }
}
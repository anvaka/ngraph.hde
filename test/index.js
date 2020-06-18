let createLayout = require('../src/index');
let test = require('tap').test;
let createGraph = require('ngraph.graph');
let miserables = require('miserables');

test('it produces layout', t => {
  let graph = createGraph();
  graph.addLink(1, 2);
  graph.addLink(2, 3);
  graph.addLink(1, 3);

  
  let layout = createLayout(graph);
  console.log(layout.getNodePosition(1)); // returns []
  graph.forEachNode(node => {
    let pos = layout.getNodePosition(node.id);
    t.ok(Number.isFinite(pos[0]), 'x is defined for ' + node.id);
    t.ok(Number.isFinite(pos[1]), 'y is defined for ' + node.id);
  })

  t.end();
});

test('it produces miserables', t => {
  let graph = miserables.create();

  let layout = createLayout(graph);
  graph.forEachNode(node => {
    let pos = layout.getNodePosition(node.id);
    t.ok(Number.isFinite(pos[0]), 'x is defined for ' + node.id);
    t.ok(Number.isFinite(pos[1]), 'y is defined for ' + node.id);
  })

  t.end();
});

test('it produces 4d layout for miserables', t => {
  let graph = miserables.create();

  let layout = createLayout(graph, {
    dimensions: 4
  });

  graph.forEachNode(node => {
    let pos = layout.getNodePosition(node.id);
    t.equals(pos.length, 4);
    for (let i = 0; i < 4; ++i) {
      t.ok(Number.isFinite(pos[i]), i + ' is defined for ' + node.id);
    }
  })

  t.end();
});
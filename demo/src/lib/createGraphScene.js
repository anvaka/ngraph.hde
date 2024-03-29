import createHighLayout from 'ngraph.hde';
import {createScene, createGuide} from 'w-gl';
import LineCollection from './LineCollection.js';
import PointCollection from './PointCollection.js';
import bus from './bus.js';
import createForceLayout from './createForceLayout.js';
import findLargestComponent from './findLargestComponent.js';

export default function createGraphScene(canvas) {
  let drawLinks = true;

  // Since graph can be loaded dynamically, we have these uninitialized
  // and captured into closure. loadGraph will do the initialization
  let graph, layout;
  let scene, nodes, lines, guide;

  let layoutName;
  let layoutSteps = 0; // how many frames shall we run layout?
  let rafHandle;

  bus.on('load-graph', loadGraph);

  return {
    dispose,
    runLayout,
    selectLayout
  };

  function loadGraph(newGraph, desiredLayout) {
    if (scene) {
      scene.dispose();
      scene = null
      layoutSteps = 0;
      cancelAnimationFrame(rafHandle);
    }
    scene = initScene();
    graph = findLargestComponent(newGraph, 1)[0];

    if (desiredLayout && desiredLayout !== layoutName) {
      layoutName = desiredLayout;
    }
    let is3d = layoutName.match(/3d/);
    if (is3d) {
      guide = createGuide(scene, {showGrid: true, lineColor: 0xffffff10, maxAlpha: 0x20});
    }
    // this is a standard force layout
    layout = createForceLayout(graph, layoutName);
    // This is our "initialization" bit with HDE
    let start = performance.now();
    let hde = createHighLayout(graph, {dimensions: is3d ? 3 : 2});
    let end = performance.now() - start;
    let time = Math.round(end) + 'ms';


    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    let scale = 2.5;
    graph.forEachNode(node => {
      let pos = hde.getNodePosition(node.id);
      let x = pos[0] * scale;
      let y = pos[1] * scale;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;

      if (is3d)  {
        layout.setNodePosition(node.id, x, y, pos[2] * scale)
      } else {
        layout.setNodePosition(node.id, x, y)
      }
    });

    setSceneSize(Math.max(maxX - minX, maxY - minY));
    initUIElements();

    rafHandle = requestAnimationFrame(frame);

    // Notify ui about stats
    setTimeout(() => {
      bus.fire('stats', {
        time,
        nodeCount: graph.getNodesCount(),
        linkCount: graph.getLinksCount()
      });
    }, 200);
  }

  function setSceneSize(sceneSize) {
    scene.setViewBox({
      left:  -sceneSize,
      top:   -sceneSize,
      right:  sceneSize,
      bottom: sceneSize,
    });
  }

  function runLayout(stepsCount) {
    layoutSteps += stepsCount;
  }

  function selectLayout(newLayoutName) {
    layoutSteps = 0;
    layoutName = newLayoutName;
    loadGraph(graph)
  }

  function initScene() {
    let scene = createScene(canvas);
    scene.setClearColor(12/255, 41/255, 82/255, 1)
    return scene;
  }
  
  function initUIElements() {
    nodes = new PointCollection(scene.getGL(), {
      capacity: graph.getNodesCount()
    });

    graph.forEachNode(node => {
      var point = layout.getNodePosition(node.id);
      let size = 1;
      if (node.data && node.data.size) {
        size = node.data.size;
      } else {
        if (!node.data) node.data = {};
        node.data.size = size;
      }
      node.ui = {size, position: [point.x, point.y, point.z || 0], color: 0x90f8fcff};
      node.uiId = nodes.add(node.ui);
    });

    lines = new LineCollection(scene.getGL(), { capacity: graph.getLinksCount() });

    graph.forEachLink(link => {
      var from = layout.getNodePosition(link.fromId);
      var to = layout.getNodePosition(link.toId);
      var line = { from: [from.x, from.y, from.z || 0], to: [to.x, to.y, to.z || 0], color: 0xFFFFFF10 };
      link.ui = line;
      link.uiId = lines.add(link.ui);
    });

    scene.appendChild(lines);
    scene.appendChild(nodes);
  }

  function frame() {
    rafHandle = requestAnimationFrame(frame);

    if (layoutSteps > 0) {
      layoutSteps -= 1;
      layout.step();
    }
    drawGraph();
    scene.renderFrame();
  }

  function drawGraph() {
    graph.forEachNode(node => {
      let pos = layout.getNodePosition(node.id);
      let uiPosition = node.ui.position;
      uiPosition[0] = pos.x;
      uiPosition[1] = pos.y;
      uiPosition[2] = pos.z || 0;
      nodes.update(node.uiId, node.ui)
    });

    if (drawLinks) {
      graph.forEachLink(link => {
        var fromPos = layout.getNodePosition(link.fromId);
        var toPos = layout.getNodePosition(link.toId);
        let {from, to} = link.ui;
        from[0] = fromPos.x; from[1] = fromPos.y; from[2] = fromPos.z || 0;
        to[0] = toPos.x; to[1] = toPos.y; to[2] = toPos.z || 0;
        lines.update(link.uiId, link.ui);
      })
    }
  }

  function dispose() {
    cancelAnimationFrame(rafHandle);

    scene.dispose();
    bus.off('load-graph', loadGraph);
  }
}
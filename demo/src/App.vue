<template>
  <h2>Demo of <a href="https://github.com/anvaka/ngraph.hde" class='source'>ngraph.hde</a> for initial positions</h2>
  <div class='content'>
    1. Select a graph: <select v-model='selectedGraph' :disable='loading'>
      <option v-for="graph in graphs" :key='graph' :value='graph'>{{graph}}</option>
    </select>
    <div v-if='stats'>
      2. Computed initial positions for <span class='number'>{{stats.nodeCount}}</span> nodes <span class='number'>{{stats.linkCount}}</span> edges in
      <span class='number'>{{stats.time}}</span>
    </div>
    <div v-if='!loading && stats' class='layout-box'>
      3. (optional) To make {{stepCount}} 
      layout steps with <select v-model='selectedLayout'>
        <option v-for="layout in layouts" :key='layout' :value='layout'>{{layout}}</option>
      </select> layout <a href="#" @click.prevent='runLayout'>CLICK HERE</a> 
    </div>

    <div v-if='loading'>Loading graph...</div>
  </div>
</template>

<script>
import queryState from 'query-state';
import createGraphScene from './lib/createGraphScene.js';
import getAvailableGraphs from './lib/getAvailableGraphs.js';
import loadGraph from './lib/loadGraph.js';
import bus from './lib/bus.js';

let layouts = ['ngraph.forcelayout', 'd3-force', 'ngraph.forcelayout3d'];
let appState = queryState({graph: 'Miserables'}, { useSearch: true });

export default {
  name: 'app',
  methods: {
    runLayout() {
      this.scene.runLayout(this.stepCount);
    },
    updateStats(stats) {
      this.stats = stats;
    },

    loadNewGraph(newGraph) {
      this.loading = true;
      this.stats = null;

      loadGraph(newGraph).then(newGraph => {
        bus.fire('load-graph', newGraph, this.selectedLayout);
        this.loading = false;
      });
    }
  },
  watch: {
    selectedLayout(newLayout) {
      appState.set('layout', newLayout);
      this.scene.selectLayout(newLayout);
    },
    selectedGraph(newGraph) {
      appState.set('graph', newGraph);
      this.loadNewGraph(newGraph);
    }
  },
  data() {
    let graphs = getAvailableGraphs();
    return {
      stepCount: getStepCountFromAppState(),
      selectedGraph: appState.get('graph'),
      layouts,
      selectedLayout: getLayoutFromAppStateSafe(),
      loading: false,
      stats: null,
      graphs
    }
  },
  mounted() {
    const canvas = document.getElementById('cnv');
    this.scene = createGraphScene(canvas);
    bus.on('stats', this.updateStats);
    this.loadNewGraph(this.selectedGraph);
  },

  beforeDestroy() {
    if (this.scene) {
      this.scene.dispose();
    }
    bus.off('stats', this.updateStats);
  }
}

function getStepCountFromAppState() {
  let step = appState.get('step');
  return (Number.isFinite(step) && step > 0) ? step : 200;
}

function getLayoutFromAppStateSafe() {
  let layout = appState.get('layout');
  if (layouts.indexOf(layout) > -1) {
    return layout;
  }
  return layouts[0];
}
</script>

<style>
#app {
  position: absolute;
  max-width: 400px;
  background: rgb(12, 41, 82);
  border: 1px solid white;
  padding: 8px;
}

.row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.row .label {
  flex: 1;
}
.row .value {
  flex: 1;
}
.row select {
  width: 100%;
}
.btn-command {
  display: block;
  padding: 4px;
  margin-top: 10px;
  border: 1px solid;
}
.stats {
  font-size: 12px;
  background:#222;
  margin: 8px -8px;
  padding: 0 8px;
}

a {
  color: rgb(244, 244, 244);
  text-decoration: none;
  border-bottom: 1px dashed;
  text-align: center;
  padding: 0 4px
}
h2 {
  margin: 8px 0 16px 0;
  font-size: 18px;
  font-weight: normal;
}
.number {
  color: yellow;
  font-size: 18px;
}
</style>

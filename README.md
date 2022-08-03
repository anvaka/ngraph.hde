# ngraph.hde

[![build status](https://github.com/anvaka/ngraph.hde/actions/workflows/tests.yaml/badge.svg)](https://github.com/anvaka/ngraph.hde/actions/workflows/tests.yaml)


This package implements high dimensional graph layout with `O(m*(|V| + |E|))` time complexity.

While the layout doesn't necessary look appealing for all possible graphs, this package
provides amazing initial configuration for nodes for subsequent refinement by `ngraph.forcelayout`
or `d3-force`.

Since force based layout convergence speed depends on initial configuration, this library
can provide significant boost for large graphs layout. 

See the demo here: https://anvaka.github.io/ngraph.hde/

![demo](https://i.imgur.com/G25jKM1.png)

Demo's source code is [here](https://github.com/anvaka/ngraph.hde/tree/main/demo)

## How does it work?

The package follows [Graph Drawing by High-Dimensional Embedding](http://www.wisdom.weizmann.ac.il/~harel/papers/highdimensionalGD.pdf) paper by David Harel and Yehuda Koren.

First, the graph is projected into `M`-dimensional space. In this space adjacent nodes are 
close to each other. By default `M` has 50 dimensions.

Then from this `M` dimensional space we crash graph back into 2D or 3D, or any other `D < M` where you want
to visualize the graph. The "crash" is done by PCA. In this `D`-dimensional space we can visualize the graph,
 or use it as starting position for a force based layout.

## Usage

```
npm install ngraph.hde
```

Then, using your favorite bundler:

``` js
let createLayout = require('ngraph.hde');
let createGraph = require('ngraph.graph');

let graph = createGraph(); // your graph.
graph.addLink(1, 2);
graph.addLink(2, 3);
graph.addLink(1, 3);
// set up nodes/vertices and then:

let layout = createLayout(graph);
layout.getNodePosition(1); // returns [0.39, -0.72]
```

Current version of the library doesn't support graphs with multiple disconnected components.
You'd have to first [find the connected components](https://github.com/anvaka/ngraph.hde/blob/main/demo/src/lib/findLargestComponent.js) and then use layout on connected parts.


### Options

Layout supports a few options:

``` js
let layout = createLayout(graph, {
  // Defines number of dimensions in `M` space. If value is larger than number
  // of nodes, then number of nodes is used by default.
  pivotCount: 50,

  // Defines number of components for `getNodePosition()` method. This is number of
  // principal component in the PCA.
  dimensions: 2
});
```

## Support

You can always reach out to me [on twitter](https://twitter.com/anvaka) if you have any questions.
If you love this library, please consider sponsoring it https://github.com/sponsors/anvaka .

## License

MIT

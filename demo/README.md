# ngraph.hde demo

This folder contains a demo of [ngraph.hde](https://github.com/anvaka/ngraph.hde).

It shows initial layout positions guessed by ngraph.hde.

It allows you to chose a graph from [University of Florida Sparse Matrix Collection](https://aws.amazon.com/datasets/university-of-florida-sparse-matrix-collection/), and measures performance of initialization.

It also shows how to use these positions as the feed to [ngraph.forcelayout](https://github.com/anvaka/ngraph.forcelayout) or [d3-force](https://github.com/d3/d3-force/).

Oh you can also drop any .dot file into the browser window, and the tool will attempt to visualize it.

Note: This is super basic example, created in couple hours. It may contain bugs but I hope it conveys the 
main idea.

Happy exploration!

### Compiles and hot-reloads for development
```
npm run serve
```

This should render a simple graph and you can do some basic layout. You can drop `.dot` files into it
to load new graphs.

### Compiles and minifies for production
```
npm run build
```

### Customize vue configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## What's inside?

* [ngraph.graph](https://github.com/anvaka/ngraph.graph) as a graph data structure
* [ngraph.forcelayout](https://github.com/anvaka/ngraph.forcelayout) for the basic graph layout
* [d3-force](https://github.com/d3/d3-force/) for alternative graph layout
* [w-gl](https://github.com/anvaka/w-gl) - super duper obscure (and fast) WebGL renderer.
* vue.js powered UI and dev tools.

## Thanks!

* Stay tuned for updates: https://twitter.com/anvaka
* If you like my work and would like to support it - https://www.patreon.com/anvaka
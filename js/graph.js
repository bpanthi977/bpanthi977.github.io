let graph_name = "../node-graph.json";

function handleHover() {
  // Make nodes interactive to hovering
  handleMouseOver = (d, i) => {
    nde = d3.select(d.currentTarget);
    // gray color and increased size
    nde.attr("fill", "#999")
      .attr("r", nde.attr("r") * 1.4);

    // display text element
    d3.selectAll("text")
      .filter('#' + CSS.escape(d.currentTarget.id))
      .style("font-size", (view.fontZoomSize / transform.k) + 'px')
      .style("display", "block")


    d3.selectAll("line")
      .filter((l, _) =>
        l.source.index == i.index ||
          l.target.index == i.index)
      .attr("stroke-width", 8);
  };

  handleMouseOut = (d, _) => {
    nde = d3.select(d.currentTarget);
    nde.attr("fill", nodeColor)
      .attr("r", nde.attr("r") / 1.4);

    // revert to normal thickness for all lines except the connecting lines
    d3.selectAll("line")
      .attr("stroke-width", 1);

    const el = d3.selectAll("text")
          .filter('#' + CSS.escape(d.currentTarget.id))
          .style("font-size", view.fontSize)
    if (transform.k < view.labelsToggle) {
      el.style("display", "none")
    }

  };

  return { handleMouseOver, handleMouseOut }
}

let transform = d3.zoomIdentity;
function drag(simulation) {
  function dragsubject(event) {
    const node = simulation.find(transform.invertX(event.x), transform.invertY(event.y));
    node.x = transform.applyX(node.x);
    node.y = transform.applyY(node.y);
    return node;
  }

  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.7).restart();
    event.subject.fx = transform.invertX(event.subject.x);
    event.subject.fy = transform.invertY(event.subject.y);
  }

  function dragged(event) {
    event.subject.fx = transform.invertX(event.x);
    event.subject.fy = transform.invertY(event.y);
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3.drag()
    .subject(dragsubject)
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
};


function handleZoom(svg, els) {
  const zoomed = (e) => {
    els.forEach(el => el.attr('transform', e.transform))
    transform = e.transform;
    if (transform.k > view.labelsToggle) {
      d3.selectAll("text").style("display", "block");
    } else {
      d3.selectAll("text").style("display", "none");
    }
  }

  const zoom = d3.zoom()
        .on('zoom', zoomed)

  svg.call(zoom)

  const initial = new d3.ZoomTransform(0.15, 800, 460)
  svg.call(zoom.transform, initial);
}

const physics = {
  gravity: 0.05,
  alpha: 0.7,
  velocityDecay: 0.25,
  linkForce: 0.2,
  charge: -1000,
  collisionStrength: 1.5
}

const view = {
  height: 1100,
  width: 1600,
  fontSize: "25px",
  fontZoomSize: 50,
  labelsToggle: 0.5 // at 0.5x zoom
}

function draw_graph(graph_name) {
  return d3.json(graph_name).then(function (data) {
    // Radius function for nodes. Node radius are function of centrality
    scale = 1;
    radius = d => {
      if (!d.radius) {
        d.radius = 2 * (11 + 24 * Math.pow(d.centrality, 4 / 5));
      }
      return d.radius;
    };
    color = "#ffffff";

    // Number of colors is the number of clusters (given by communityLabel)
    num_colors = Math.max(...data.nodes.map(d => d.communityLabel)) + 1;

    angleArr = [...Array(num_colors).keys()].map(x => 2 * Math.PI * x / num_colors);
    // Cluster centers around an circle
    centersx = angleArr.map(x => Math.cos(Math.PI + x));
    centersy = angleArr.map(x => Math.sin(Math.PI + x));
    // Color palette
    nodeColors = [
      '#C98914',
      '#C55F1A',
      '#4189AD',
      '#007500',
      '#968674',
      '#5E998A',
      "#363ea9",
    ];
    // Color function just maps cluster to color palette
    nodeColor = d => {
      return nodeColors[d.communityLabel % nodeColors.length];
    };


    // Graph data
    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));

    // Force simulation for the graph
    simulation = d3.forceSimulation(nodes)
      .alpha(physics.alpha)
      .velocityDecay(physics.velocityDecay)
      .force("link", d3.forceLink(links).id(d => d.id).strength(physics.linkForce))
      .force("charge", d3.forceManyBody()
             .strength(physics.charge))
      .force('collision',
             d3.forceCollide().radius(d => radius(d) * 1.2).strength(physics.collisionStrength))
      .force('x', d3.forceX()
             .strength(physics.gravity))
      .force('y', d3.forceY()
             .strength(physics.gravity))

    // Create all the graph elements
    const svg = d3.select("svg#note-graph")
          .attr('max-width', '60%')
          .attr("viewBox", [0, 0, view.width, view.height])

    const link = svg.append("g")
          .attr("stroke", "#000")
          .attr("stroke-opacity", 1)
          .selectAll("line")
          .data(links)
          .join("line")
          .attr("stroke-width", 1);

    const { handleMouseOver, handleMouseOut } = handleHover()

    const node = svg.append("g")
          .selectAll("circle")
          .data(nodes)
          .join("a")
          .attr("xlink:href", d => {
            return "/braindump/" + d.lnk + '.html';
          })
          .attr("id", d => "circle_" + d.lnk)
          .append("circle")
          .attr("id", d => d.id.toLowerCase())
          .attr("r", radius)
          .attr("fill", nodeColor)
          .attr("stroke", "#000")
          .attr("stroke-width", 1)
          .on("mouseover", handleMouseOver)
          .on("mouseout", handleMouseOut)
          .on('zoom', handleZoom)
          .call(drag(simulation))

    node.append("title")
      .text(d => d.label.replace(/"/g, ''));


    // Nodes have a label that is visible on hover
    // They have two layers a rectangle "background" and the text on top
    const label = svg.append("g")
          .selectAll("text")
          .data(nodes)
          .join("g");
    const label_background = label.append("text")
          .style("font-size", view.fontSize)
          .text(function (d) { return "  " + d.label.replace(/"/g, '') + "  "; })
          .attr("dy", -25)
          .attr("id", d => d.id.toLowerCase())
          .attr("class", "node_label")
          .style("display", "none")
          .style("pointer-events", "none")
          .style("alignment-baseline", "middle")
          .attr("filter", "url(#solid)");

    const label_text = label.append("text")
          .style("fill", "#222")
          .style("font-size", view.fontSize)
          .text(function (d) { return "  " + d.label.replace(/"/g, '') + "  "; })
          .attr("dy", -25)
          .attr("id", d => d.id.toLowerCase())
          .attr("class", "node_label")
          .style("display", "none")
          .style("pointer-events", "none")
          .style("alignment-baseline", "middle");

    handleZoom(svg, [node, link, label]);

    // Run the simulation
    simulation.on("tick", () => {
      link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node.attr("cx", d => d.x)
        .attr("cy", d => d.y);

      label_text.attr("x", d => d.x)
        .attr("y", d => d.y);

      label_background.attr("x", d => d.x)
        .attr("y", d => d.y);
    });
  });
}

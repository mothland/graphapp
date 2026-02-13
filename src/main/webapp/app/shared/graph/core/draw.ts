import * as d3 from 'd3';
import { GraphData, GraphNode } from './types';
import { indexNodes } from './layout';

const NODE_RADIUS = 16;
const DIRECTED_ARROW_PADDING = 8;

export function getEdgeGeometry(source: GraphNode, target: GraphNode, directed?: boolean) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) {
    return {
      x1: source.x,
      y1: source.y,
      x2: target.x,
      y2: target.y,
      mx: source.x,
      my: source.y,
    };
  }

  const ux = dx / distance;
  const uy = dy / distance;
  const sourceOffset = NODE_RADIUS;
  const targetOffset = NODE_RADIUS + (directed ? DIRECTED_ARROW_PADDING : 0);

  const x1 = source.x + ux * sourceOffset;
  const y1 = source.y + uy * sourceOffset;
  const x2 = target.x - ux * targetOffset;
  const y2 = target.y - uy * targetOffset;

  return {
    x1,
    y1,
    x2,
    y2,
    mx: (x1 + x2) / 2,
    my: (y1 + y2) / 2,
  };
}

export function drawGraph(root: d3.Selection<SVGGElement, unknown, null, undefined>, graph: GraphData) {
  const nodeById = indexNodes(graph);

  // Edges
  const edges = root
    .append('g')
    .selectAll('line')
    .data(graph.edges)
    .enter()
    .append('line')
    .attr('stroke', '#64748b')
    .attr('stroke-width', 2)
    .attr('marker-end', d => (d.directed ? 'url(#arrow)' : null))
    .attr('x1', d => {
      const source = nodeById.get(d.source);
      const target = nodeById.get(d.target);
      if (!source || !target) return 0;
      return getEdgeGeometry(source, target, d.directed).x1;
    })
    .attr('y1', d => {
      const source = nodeById.get(d.source);
      const target = nodeById.get(d.target);
      if (!source || !target) return 0;
      return getEdgeGeometry(source, target, d.directed).y1;
    })
    .attr('x2', d => {
      const source = nodeById.get(d.source);
      const target = nodeById.get(d.target);
      if (!source || !target) return 0;
      return getEdgeGeometry(source, target, d.directed).x2;
    })
    .attr('y2', d => {
      const source = nodeById.get(d.source);
      const target = nodeById.get(d.target);
      if (!source || !target) return 0;
      return getEdgeGeometry(source, target, d.directed).y2;
    });

  // Edge labels
  const edgeLabels = root
    .append('g')
    .selectAll('text')
    .data(graph.edges.filter(e => e.weight !== undefined))
    .enter()
    .append('text')
    .text(d => d.weight)
    .attr('font-size', 12)
    .attr('text-anchor', 'middle')
    .attr('fill', '#1f2937')
    .attr('x', d => {
      const source = nodeById.get(d.source);
      const target = nodeById.get(d.target);
      if (!source || !target) return 0;
      return getEdgeGeometry(source, target, d.directed).mx;
    })
    .attr('y', d => {
      const source = nodeById.get(d.source);
      const target = nodeById.get(d.target);
      if (!source || !target) return 0;
      return getEdgeGeometry(source, target, d.directed).my;
    });

  // Nodes
  const nodes = root
    .append('g')
    .selectAll('g')
    .data(graph.nodes)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  nodes.append('circle').attr('r', 16).attr('fill', '#4f46e5').attr('stroke', '#1e1b4b').attr('stroke-width', 2);

  nodes
    .append('text')
    .text(d => d.label)
    .attr('dy', 5)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .attr('font-size', 12);

  return { nodes, edges, edgeLabels };
}

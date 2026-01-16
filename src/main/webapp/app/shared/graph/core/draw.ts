import * as d3 from 'd3';
import { GraphData, GraphNode } from './types';
import { indexNodes, edgeMidpoint } from './layout';

export function drawGraph(root: d3.Selection<SVGGElement, unknown, null, undefined>, graph: GraphData) {
  const nodeById = indexNodes(graph);

  // Edges
  const edges = root
    .append('g')
    .selectAll('line')
    .data(graph.edges)
    .enter()
    .append('line')
    .attr('stroke', '#999')
    .attr('stroke-width', 1.5)
    .attr('x1', d => nodeById.get(d.source)?.x ?? 0)
    .attr('y1', d => nodeById.get(d.source)?.y ?? 0)
    .attr('x2', d => nodeById.get(d.target)?.x ?? 0)
    .attr('y2', d => nodeById.get(d.target)?.y ?? 0);

  // Edge labels
  const edgeLabels = root
    .append('g')
    .selectAll('text')
    .data(graph.edges.filter(e => e.weight !== undefined))
    .enter()
    .append('text')
    .text(d => d.weight)
    .attr('font-size', 10)
    .attr('text-anchor', 'middle')
    .attr('fill', '#333')
    .attr('x', d => edgeMidpoint(nodeById, d.source, d.target).x)
    .attr('y', d => edgeMidpoint(nodeById, d.source, d.target).y);

  // Nodes
  const nodes = root
    .append('g')
    .selectAll('g')
    .data(graph.nodes)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  nodes
    .append('circle')
    .attr('r', 16)
    .attr('fill', d => d.color ?? '#4f46e5');

  nodes
    .append('text')
    .text(d => d.label)
    .attr('dy', 5)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white');

  return { nodes, edges, edgeLabels };
}

import * as d3 from 'd3';
import { GraphData, GraphNode } from '../core/types';
import { drawGraph } from '../core/draw';

export interface GraphInteractionHandlers {
  onNodeSelect?: (node: GraphNode | null) => void;
}

export function renderGraphDynamic(
  svgElement: SVGSVGElement,
  graph: GraphData,
  width: number,
  height: number,
  handlers?: GraphInteractionHandlers,
): void {
  const svg = d3.select(svgElement);

  svg.selectAll('*').remove();
  svg.attr('width', width).attr('height', height);

  const zoomLayer = svg.append('g');

  svg.call(
    d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on('zoom', event => {
        zoomLayer.attr('transform', event.transform);
      }),
  );

  const { nodes, edges, edgeLabels } = drawGraph(zoomLayer, graph);

  // ----------------------------
  // Force simulation
  // ----------------------------
  const simulation = d3
    .forceSimulation<GraphNode>(graph.nodes)
    .force(
      'link',
      d3
        .forceLink(graph.edges as any)
        .id((d: any) => d.id)
        .distance(120)
        .strength(0.8),
    )
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(40))
    .on('tick', ticked);

  function ticked() {
    nodes.attr('transform', d => `translate(${d.x}, ${d.y})`);

    edges
      .attr('x1', d => (d.source as GraphNode).x)
      .attr('y1', d => (d.source as GraphNode).y)
      .attr('x2', d => (d.target as GraphNode).x)
      .attr('y2', d => (d.target as GraphNode).y);

    edgeLabels
      .attr('x', d => ((d.source as GraphNode).x + (d.target as GraphNode).x) / 2)
      .attr('y', d => ((d.source as GraphNode).y + (d.target as GraphNode).y) / 2);
  }

  // ----------------------------
  // Selection state (UI-only)
  // ----------------------------
  let selectedNodeId: number | null = null;

  function updateSelection() {
    nodes.selectAll('circle').attr('fill', d => (d.id === selectedNodeId ? 'orange' : '#69b3a2'));
  }

  nodes.attr('cursor', 'pointer').on('click', (_, d) => {
    selectedNodeId = selectedNodeId === d.id ? null : d.id;
    updateSelection();

    handlers?.onNodeSelect?.(selectedNodeId == null ? null : (graph.nodes.find(n => n.id === selectedNodeId) ?? null));
  });
}

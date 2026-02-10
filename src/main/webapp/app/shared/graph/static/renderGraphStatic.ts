import * as d3 from 'd3';
import { GraphData } from '../core/types';
import { drawGraph } from '../core/draw';

export function renderGraphStatic(svgElement: SVGSVGElement, graph: GraphData, width: number, height: number): void {
  const svg = d3.select(svgElement);

  svg.selectAll('*').remove();
  svg.attr('width', width).attr('height', height);

  const defs = svg.append('defs');
  defs
    .append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 9)
    .attr('refY', 5)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto-start-reverse')
    .append('path')
    .attr('d', 'M 0 0 L 10 5 L 0 10 z')
    .attr('fill', '#64748b');

  const root = svg.append('g');

  drawGraph(root, graph);
}

import * as d3 from 'd3';
import { GraphData } from '../core/types';
import { drawGraph } from '../core/draw';

export function renderGraphStatic(svgElement: SVGSVGElement, graph: GraphData, width: number, height: number): void {
  const svg = d3.select(svgElement);

  svg.selectAll('*').remove();
  svg.attr('width', width).attr('height', height);

  const root = svg.append('g');

  drawGraph(root, graph);
}

import { GraphData } from './types';
import { GraphNode } from './types';

export function indexNodes(graph: GraphData): Map<number, GraphNode> {
  return new Map(graph.nodes.map(n => [n.id, n]));
}

export function edgeMidpoint(nodeById: Map<number, GraphNode>, source: number, target: number): { x: number; y: number } {
  const s = nodeById.get(source);
  const t = nodeById.get(target);

  return {
    x: s && t ? (s.x + t.x) / 2 : 0,
    y: s && t ? (s.y + t.y) / 2 : 0,
  };
}

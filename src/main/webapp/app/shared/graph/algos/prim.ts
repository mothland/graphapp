import { AlgoInput, AlgoResult, GraphAlgo } from './types';

type WeightedNeighbor = {
  id: number;
  weight: number;
};

type UndirectedEdge = {
  source: number;
  target: number;
  weight: number;
};

type FrontierEdge = {
  from: number;
  to: number;
  weight: number;
};

export const primAlgo: GraphAlgo = {
  id: 'prim',
  name: 'Prim (MST)',
  run: (input: AlgoInput): AlgoResult => runPrim(input),
};

function runPrim(input: AlgoInput): AlgoResult {
  if (!input.nodes.includes(input.start) || !input.nodes.includes(input.end)) {
    return { path: [], steps: [] };
  }

  const edges = normalizeUndirectedEdges(input);
  const adjacency = buildWeightedAdjacency(input.nodes, edges);
  const mstAdjacency = initAdjacency(input.nodes);
  const visited = new Set<number>();
  const steps: AlgoResult['steps'] = [];
  const frontier: FrontierEdge[] = [];

  visited.add(input.start);
  steps.push({ type: 'visit', nodeId: input.start });

  for (const neighbor of adjacency.get(input.start) ?? []) {
    frontier.push({ from: input.start, to: neighbor.id, weight: neighbor.weight });
  }

  while (frontier.length > 0 && visited.size < input.nodes.length) {
    frontier.sort((edgeA, edgeB) => edgeA.weight - edgeB.weight);
    const nextEdge = frontier.shift();
    if (!nextEdge || visited.has(nextEdge.to)) continue;

    visited.add(nextEdge.to);
    steps.push({ type: 'visit', nodeId: nextEdge.to });
    addUndirectedEdge(mstAdjacency, nextEdge.from, nextEdge.to);

    for (const neighbor of adjacency.get(nextEdge.to) ?? []) {
      if (!visited.has(neighbor.id)) {
        frontier.push({ from: nextEdge.to, to: neighbor.id, weight: neighbor.weight });
      }
    }
  }

  const path = buildPathFromAdjacency(mstAdjacency, input.start, input.end);
  return { path, steps };
}

function normalizeUndirectedEdges(input: AlgoInput): UndirectedEdge[] {
  const map = new Map<string, UndirectedEdge>();
  const nodeSet = new Set<number>(input.nodes);

  for (const edge of input.edges) {
    if (!nodeSet.has(edge.source) || !nodeSet.has(edge.target)) continue;
    if (edge.source === edge.target) continue;

    const source = Math.min(edge.source, edge.target);
    const target = Math.max(edge.source, edge.target);
    const key = `${source}:${target}`;
    const weight = Number.isFinite(edge.weight) ? edge.weight : 1;

    const previous = map.get(key);
    if (!previous || weight < previous.weight) {
      map.set(key, { source, target, weight });
    }
  }

  return [...map.values()];
}

function buildWeightedAdjacency(nodes: number[], edges: UndirectedEdge[]): Map<number, WeightedNeighbor[]> {
  const map = new Map<number, WeightedNeighbor[]>();
  nodes.forEach(nodeId => map.set(nodeId, []));

  for (const edge of edges) {
    map.get(edge.source)?.push({ id: edge.target, weight: edge.weight });
    map.get(edge.target)?.push({ id: edge.source, weight: edge.weight });
  }

  return map;
}

function initAdjacency(nodes: number[]): Map<number, number[]> {
  const map = new Map<number, number[]>();
  nodes.forEach(nodeId => map.set(nodeId, []));
  return map;
}

function addUndirectedEdge(adjacency: Map<number, number[]>, source: number, target: number): void {
  adjacency.get(source)?.push(target);
  adjacency.get(target)?.push(source);
}

function buildPathFromAdjacency(adjacency: Map<number, number[]>, start: number, end: number): number[] {
  if (start === end) return [start];
  if (!adjacency.has(start) || !adjacency.has(end)) return [];

  const queue: number[] = [start];
  const prev = new Map<number, number | null>([[start, null]]);

  while (queue.length > 0) {
    const node = queue.shift();
    if (node === undefined) continue;
    if (node === end) break;

    for (const neighbor of adjacency.get(node) ?? []) {
      if (prev.has(neighbor)) continue;
      prev.set(neighbor, node);
      queue.push(neighbor);
    }
  }

  if (!prev.has(end)) return [];

  const path: number[] = [];
  let current: number | null = end;

  while (current !== null) {
    path.push(current);
    current = prev.get(current) ?? null;
  }

  path.reverse();
  return path[0] === start ? path : [];
}

export default primAlgo;

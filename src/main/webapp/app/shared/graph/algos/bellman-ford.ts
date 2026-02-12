import { AlgoInput, AlgoResult, GraphAlgo } from './types';

type DirectedEdge = {
  source: number;
  target: number;
  weight: number;
};

export const bellmanFordAlgo: GraphAlgo = {
  id: 'bellman-ford',
  name: 'Bellman-Ford',
  run: (input: AlgoInput): AlgoResult => runBellmanFord(input),
};

function runBellmanFord(input: AlgoInput): AlgoResult {
  if (!input.nodes.includes(input.start) || !input.nodes.includes(input.end)) {
    return { path: [], steps: [] };
  }

  const steps: AlgoResult['steps'] = [];
  const nodes = input.nodes;
  const nodeSet = new Set<number>(nodes);
  const edges = normalizeEdges(input, nodeSet);

  const distances = new Map<number, number>();
  const previous = new Map<number, number | null>();

  for (const nodeId of nodes) {
    distances.set(nodeId, Number.POSITIVE_INFINITY);
    previous.set(nodeId, null);
  }
  distances.set(input.start, 0);
  steps.push({ type: 'visit', nodeId: input.start });

  for (let pass = 0; pass < nodes.length - 1; pass += 1) {
    let changed = false;
    const touched = new Set<number>();

    for (const edge of edges) {
      const sourceDistance = distances.get(edge.source) ?? Number.POSITIVE_INFINITY;
      const targetDistance = distances.get(edge.target) ?? Number.POSITIVE_INFINITY;

      if (sourceDistance === Number.POSITIVE_INFINITY) continue;

      const candidateDistance = sourceDistance + edge.weight;
      if (candidateDistance < targetDistance) {
        distances.set(edge.target, candidateDistance);
        previous.set(edge.target, edge.source);
        touched.add(edge.target);
        changed = true;
      }
    }

    for (const nodeId of touched) {
      steps.push({ type: 'visit', nodeId });
    }

    if (!changed) {
      break;
    }
  }

  if (hasReachableNegativeCycle(edges, distances)) {
    return { path: [], steps };
  }

  return {
    path: reconstructPath(previous, input.start, input.end),
    steps,
  };
}

function normalizeEdges(input: AlgoInput, nodeSet: Set<number>): DirectedEdge[] {
  const normalized: DirectedEdge[] = [];

  for (const edge of input.edges) {
    if (!nodeSet.has(edge.source) || !nodeSet.has(edge.target)) continue;
    if (edge.source === edge.target) continue;

    const weight = Number.isFinite(edge.weight) ? edge.weight : 1;
    normalized.push({ source: edge.source, target: edge.target, weight });

    if (!edge.directed) {
      normalized.push({ source: edge.target, target: edge.source, weight });
    }
  }

  return normalized;
}

function hasReachableNegativeCycle(edges: DirectedEdge[], distances: Map<number, number>): boolean {
  for (const edge of edges) {
    const sourceDistance = distances.get(edge.source) ?? Number.POSITIVE_INFINITY;
    const targetDistance = distances.get(edge.target) ?? Number.POSITIVE_INFINITY;

    if (sourceDistance === Number.POSITIVE_INFINITY) continue;
    if (sourceDistance + edge.weight < targetDistance) {
      return true;
    }
  }

  return false;
}

function reconstructPath(prev: Map<number, number | null>, start: number, end: number): number[] {
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

export default bellmanFordAlgo;

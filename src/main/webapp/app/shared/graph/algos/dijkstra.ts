import { AlgoInput, AlgoResult, GraphAlgo } from './types';

type WeightedNeighbor = {
  id: number;
  weight: number;
};

export const dijkstraAlgo: GraphAlgo = {
  id: 'dijkstra',
  name: 'Dijkstra',
  run: (input: AlgoInput): AlgoResult => runDijkstra(input),
};

function runDijkstra(input: AlgoInput): AlgoResult {
  const adjacency = buildAdjacency(input);
  const distances = new Map<number, number>();
  const previous = new Map<number, number | null>();
  const unvisited = new Set<number>(input.nodes);
  const steps: AlgoResult['steps'] = [];

  input.nodes.forEach(nodeId => {
    distances.set(nodeId, Number.POSITIVE_INFINITY);
    previous.set(nodeId, null);
  });

  distances.set(input.start, 0);

  while (unvisited.size > 0) {
    let currentNode: number | null = null;
    let currentDistance = Number.POSITIVE_INFINITY;

    for (const nodeId of unvisited) {
      const distance = distances.get(nodeId) ?? Number.POSITIVE_INFINITY;
      if (distance < currentDistance) {
        currentNode = nodeId;
        currentDistance = distance;
      }
    }

    if (currentNode === null || currentDistance === Number.POSITIVE_INFINITY) {
      break;
    }

    unvisited.delete(currentNode);
    steps.push({ type: 'visit', nodeId: currentNode });

    if (currentNode === input.end) {
      break;
    }

    for (const neighbor of adjacency.get(currentNode) ?? []) {
      if (!unvisited.has(neighbor.id)) continue;

      const candidateDistance = currentDistance + neighbor.weight;
      if (candidateDistance < (distances.get(neighbor.id) ?? Number.POSITIVE_INFINITY)) {
        distances.set(neighbor.id, candidateDistance);
        previous.set(neighbor.id, currentNode);
      }
    }
  }

  const path = reconstructPath(previous, input.start, input.end);
  return { path, steps };
}

function buildAdjacency(input: AlgoInput): Map<number, WeightedNeighbor[]> {
  const map = new Map<number, WeightedNeighbor[]>();
  input.nodes.forEach(id => map.set(id, []));

  for (const edge of input.edges) {
    const weight = Number.isFinite(edge.weight) ? edge.weight : 1;
    map.get(edge.source)?.push({ id: edge.target, weight });

    if (!edge.directed) {
      map.get(edge.target)?.push({ id: edge.source, weight });
    }
  }

  return map;
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

export default dijkstraAlgo;

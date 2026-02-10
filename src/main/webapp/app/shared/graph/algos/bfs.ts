import { AlgoInput, AlgoResult, GraphAlgo } from './types';

export const bfsAlgo: GraphAlgo = {
  id: 'bfs',
  name: 'Breadth-First Search',
  run: (input: AlgoInput): AlgoResult => runBfs(input),
};

function runBfs(input: AlgoInput): AlgoResult {
  const adjacency = buildAdjacency(input);
  const visited = new Set<number>();
  const queue: number[] = [];
  const prev = new Map<number, number | null>();
  const steps: AlgoResult['steps'] = [];

  queue.push(input.start);
  visited.add(input.start);
  prev.set(input.start, null);

  while (queue.length > 0) {
    const node = queue.shift() as number;
    steps.push({ type: 'visit', nodeId: node });

    if (node === input.end) {
      break;
    }

    for (const neighbor of adjacency.get(node) ?? []) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      prev.set(neighbor, node);
      queue.push(neighbor);
    }
  }

  const path = reconstructPath(prev, input.start, input.end);
  return { path, steps };
}

function buildAdjacency(input: AlgoInput): Map<number, number[]> {
  const map = new Map<number, number[]>();
  input.nodes.forEach(id => map.set(id, []));

  for (const edge of input.edges) {
    map.get(edge.source)?.push(edge.target);
    if (!edge.directed) {
      map.get(edge.target)?.push(edge.source);
    }
  }

  return map;
}

function reconstructPath(prev: Map<number, number | null>, start: number, end: number): number[] {
  if (!prev.has(end)) return [];
  const path: number[] = [];
  let current: number | null = end;
  while (current != null) {
    path.push(current);
    current = prev.get(current) ?? null;
  }
  path.reverse();
  return path[0] === start ? path : [];
}

export default bfsAlgo;

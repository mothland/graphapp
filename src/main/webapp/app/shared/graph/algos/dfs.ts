import { AlgoInput, AlgoResult, GraphAlgo } from './types';

export const dfsAlgo: GraphAlgo = {
  id: 'dfs',
  name: 'Depth-First Search',
  run: (input: AlgoInput): AlgoResult => runDfs(input),
};

function runDfs(input: AlgoInput): AlgoResult {
  const adjacency = buildAdjacency(input);
  const visited = new Set<number>();
  const prev = new Map<number, number | null>();
  const steps: AlgoResult['steps'] = [];
  let found = false;

  const visit = (node: number, parent: number | null) => {
    if (found || visited.has(node)) return;

    visited.add(node);
    prev.set(node, parent);
    steps.push({ type: 'visit', nodeId: node });

    if (node === input.end) {
      found = true;
      return;
    }

    for (const neighbor of adjacency.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        visit(neighbor, node);
      }
      if (found) return;
    }
  };

  visit(input.start, null);

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

  while (current !== null) {
    path.push(current);
    current = prev.get(current) ?? null;
  }

  path.reverse();
  return path[0] === start ? path : [];
}

export default dfsAlgo;

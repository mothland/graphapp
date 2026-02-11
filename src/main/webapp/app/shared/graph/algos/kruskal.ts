import { AlgoInput, AlgoResult, GraphAlgo } from './types';

type UndirectedEdge = {
  source: number;
  target: number;
  weight: number;
};

export const kruskalAlgo: GraphAlgo = {
  id: 'kruskal',
  name: 'Kruskal (MST)',
  run: (input: AlgoInput): AlgoResult => runKruskal(input),
};

function runKruskal(input: AlgoInput): AlgoResult {
  if (!input.nodes.includes(input.start) || !input.nodes.includes(input.end)) {
    return { path: [], steps: [] };
  }

  const edges = normalizeUndirectedEdges(input).sort(
    (edgeA, edgeB) => edgeA.weight - edgeB.weight || edgeA.source - edgeB.source || edgeA.target - edgeB.target,
  );

  const disjointSet = new DisjointSet(input.nodes);
  const mstAdjacency = initAdjacency(input.nodes);
  const stepVisited = new Set<number>();
  const steps: AlgoResult['steps'] = [];

  stepVisited.add(input.start);
  steps.push({ type: 'visit', nodeId: input.start });

  for (const edge of edges) {
    const merged = disjointSet.union(edge.source, edge.target);
    if (!merged) continue;

    addUndirectedEdge(mstAdjacency, edge.source, edge.target);

    if (!stepVisited.has(edge.source)) {
      stepVisited.add(edge.source);
      steps.push({ type: 'visit', nodeId: edge.source });
    }
    if (!stepVisited.has(edge.target)) {
      stepVisited.add(edge.target);
      steps.push({ type: 'visit', nodeId: edge.target });
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

class DisjointSet {
  private parent: Map<number, number>;

  private rank: Map<number, number>;

  constructor(nodes: number[]) {
    this.parent = new Map();
    this.rank = new Map();
    nodes.forEach(nodeId => {
      this.parent.set(nodeId, nodeId);
      this.rank.set(nodeId, 0);
    });
  }

  public find(nodeId: number): number {
    const parentId = this.parent.get(nodeId);
    if (parentId === undefined) {
      this.parent.set(nodeId, nodeId);
      this.rank.set(nodeId, 0);
      return nodeId;
    }

    if (parentId === nodeId) return nodeId;
    const root = this.find(parentId);
    this.parent.set(nodeId, root);
    return root;
  }

  public union(nodeA: number, nodeB: number): boolean {
    const rootA = this.find(nodeA);
    const rootB = this.find(nodeB);
    if (rootA === rootB) return false;

    const rankA = this.rank.get(rootA) ?? 0;
    const rankB = this.rank.get(rootB) ?? 0;

    if (rankA < rankB) {
      this.parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA);
    } else {
      this.parent.set(rootB, rootA);
      this.rank.set(rootA, rankA + 1);
    }

    return true;
  }
}

export default kruskalAlgo;

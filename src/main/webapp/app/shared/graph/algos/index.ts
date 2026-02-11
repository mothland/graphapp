import { GraphAlgo } from './types';
import bfsAlgo from './bfs';
import dfsAlgo from './dfs';
import dijkstraAlgo from './dijkstra';

const fallbackAlgos: GraphAlgo[] = [bfsAlgo, dfsAlgo, dijkstraAlgo];

const context = (require as any)?.context?.('./', false, /\.ts$/);

function loadAlgos(): GraphAlgo[] {
  if (!context) return fallbackAlgos;

  const modules = context
    .keys()
    .filter((key: string) => key !== './index.ts' && key !== './types.ts')
    .map((key: string) => context(key));

  const algos = modules
    .map((mod: any) => mod?.default ?? Object.values(mod).find((value: any) => value?.id && value?.run))
    .filter(Boolean) as GraphAlgo[];

  return algos.length > 0 ? algos : fallbackAlgos;
}

export const graphAlgos = loadAlgos();

export function getGraphAlgoById(id: string): GraphAlgo | undefined {
  return graphAlgos.find(algo => algo.id === id);
}

export * from './types';

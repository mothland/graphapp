export interface AlgoStep {
  type: 'visit';
  nodeId: number;
}

export interface AlgoResult {
  path: number[];
  steps: AlgoStep[];
}

export interface AlgoInput {
  nodes: number[];
  edges: {
    source: number;
    target: number;
    directed: boolean;
    weight: number;
  }[];
  start: number;
  end: number;
}

export interface GraphAlgo {
  id: string;
  name: string;
  run: (input: AlgoInput) => AlgoResult;
}

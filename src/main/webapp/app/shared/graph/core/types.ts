export interface GraphNode {
  id: number;
  label: string;
  x: number;
  y: number;
  color?: string;
}

export interface GraphEdge {
  id: number;
  source: number;
  target: number;
  weight?: number;
  directed?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

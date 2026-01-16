import axios from 'axios';

/* ======================================================
 * ENTITY-LEVEL API (raw JHipster REST)
 * ====================================================== */

export async function createGraph(payload: { name: string; description?: string }) {
  const res = await axios.post('/api/graphs', payload);
  return res.data as { id: number };
}

export async function createNode(payload: { label: string; x: number; y: number; graph: { id: number } }) {
  const res = await axios.post('/api/nodes', payload);
  return res.data as { id: number };
}

export async function createEdge(payload: {
  weight: number;
  directed: boolean;
  graph: { id: number };
  source: { id: number };
  target: { id: number };
}) {
  const res = await axios.post('/api/edges', payload);
  return res.data;
}

/* ======================================================
 * READ-ONLY AGGREGATE DTO
 * (matches FullGraphDTO on backend)
 * ====================================================== */

export interface FullGraphDTO {
  graph: {
    id: number;
    name: string;
    description?: string;
  };
  nodes: {
    id: number;
    label: string;
    x: number;
    y: number;
  }[];
  edges: {
    id: number;
    source: number;
    target: number;
    weight: number;
    directed: boolean;
  }[];
}

/**
 * ✅ Aggregate read by ID
 * Backend: GET /api/graphs/{id}/full
 */
export async function getFullGraphById(id: number): Promise<FullGraphDTO> {
  const res = await axios.get<FullGraphDTO>(`/api/graphs/${id}/full`);
  return res.data;
}

/* ======================================================
 * FRONTEND ORCHESTRATION (user intent)
 * ====================================================== */

export async function createFullGraphFrontend(input: {
  name: string;
  description?: string;
  nodes: {
    label: string;
    x: number;
    y: number;
  }[];
  edges: {
    sourceIndex: number; // index in nodes[]
    targetIndex: number;
    weight: number;
    directed?: boolean;
  }[];
}) {
  // 1️⃣ Create graph
  const graph = await createGraph({
    name: input.name,
    description: input.description,
  });

  const graphId = graph.id;

  // 2️⃣ Create nodes
  const createdNodes = await Promise.all(
    input.nodes.map(n =>
      createNode({
        label: n.label,
        x: n.x,
        y: n.y,
        graph: { id: graphId },
      }),
    ),
  );

  const nodeIds = createdNodes.map(n => n.id);

  // 3️⃣ Create edges
  await Promise.all(
    input.edges.map(e =>
      createEdge({
        weight: e.weight,
        directed: e.directed ?? true,
        graph: { id: graphId },
        source: { id: nodeIds[e.sourceIndex] },
        target: { id: nodeIds[e.targetIndex] },
      }),
    ),
  );

  return graphId;
}

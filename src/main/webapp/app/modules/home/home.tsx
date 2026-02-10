import './home.scss';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, CardBody, CardHeader, Col, Input, Row, Spinner } from 'reactstrap';

import { renderGraphStatic } from 'app/shared/graph';
import { GraphData } from 'app/shared/graph/core/types';
import { FullGraphDTO, getFullGraphById } from 'app/shared/graph/graph.api';

type GraphDTO = {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: string | null;
};

const PAGE_SIZE = 4;
const PREVIEW_WIDTH = 360;
const PREVIEW_HEIGHT = 220;

const GraphPreview = ({ graphId }: { graphId: number }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadGraph = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const full = await getFullGraphById(graphId);
        if (!isActive) return;

        setGraphData(mapToGraphData(full));
      } catch (err: any) {
        if (!isActive) return;
        setErrorMessage(err?.message ?? 'Failed to load graph.');
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    if (graphId) {
      loadGraph();
    }

    return () => {
      isActive = false;
    };
  }, [graphId]);

  useEffect(() => {
    if (!graphData || !svgRef.current) return;
    renderGraphStatic(svgRef.current, graphData, PREVIEW_WIDTH, PREVIEW_HEIGHT);
  }, [graphData]);

  return (
    <div className="graph-preview">
      {loading && (
        <div className="d-flex align-items-center gap-2">
          <Spinner size="sm" /> Loading preview...
        </div>
      )}
      {errorMessage && (
        <Alert color="danger" className="mb-0">
          {errorMessage}
        </Alert>
      )}
      {!loading && !errorMessage && !graphData && (
        <Alert color="warning" className="mb-0">
          No graph data.
        </Alert>
      )}
      {!loading && !errorMessage && graphData && <svg ref={svgRef} width={PREVIEW_WIDTH} height={PREVIEW_HEIGHT} />}
    </div>
  );
};

// Placeholder pour le composant GraphRenderer (fait par ton collègue)
const GraphRendererGrid = ({ graphs }: { graphs: GraphDTO[] }) => (
  <Row className="g-3">
    {graphs.map(g => (
      <Col key={g.id} md="6">
        <Card className="graph-card">
          <CardHeader className="d-flex justify-content-between align-items-center">
            <span className="graph-title">{g.name}</span>
            <div className="d-flex gap-2">
              <Link to={`/visualize/${g.id}`}>
                <Button size="sm" color="primary">
                  Visualize
                </Button>
              </Link>
              <Link to={`/editor/${g.id}`}>
                <Button size="sm" color="secondary">
                  Edit
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            <GraphPreview graphId={g.id} />
            {g.description ? <div className="text-muted mt-2">{g.description}</div> : null}
          </CardBody>
        </Card>
      </Col>
    ))}
  </Row>
);

const ALGORITHMS = [
  { name: 'BFS (Breadth-First Search)', url: 'https://en.wikipedia.org/wiki/Breadth-first_search' },
  { name: 'DFS (Depth-First Search)', url: 'https://en.wikipedia.org/wiki/Depth-first_search' },
  { name: 'Dijkstra', url: 'https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm' },
  { name: 'Kruskal', url: 'https://en.wikipedia.org/wiki/Kruskal%27s_algorithm' },
  { name: 'Prim', url: 'https://en.wikipedia.org/wiki/Prim%27s_algorithm' },
];

export const Home = () => {
  const [graphs, setGraphs] = useState<GraphDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const loadGraphs = async () => {
      setLoading(true);
      try {
        const res = await axios.get<GraphDTO[]>('/api/graphs');
        setGraphs(res.data ?? []);
      } finally {
        setLoading(false);
      }
    };
    loadGraphs();
  }, []);

  const filteredGraphs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return graphs;
    return graphs.filter(g => g.name.toLowerCase().includes(q));
  }, [graphs, query]);

  const pageCount = Math.max(1, Math.ceil(filteredGraphs.length / PAGE_SIZE));

  useEffect(() => {
    if (page > pageCount - 1) setPage(0);
  }, [page, pageCount]);

  const visibleGraphs = filteredGraphs.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <Row className="home-layout">
      <Col md="3" className="home-sidebar">
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <span>Algorithmes</span>
            <Button
              size="sm"
              color="success"
              onClick={() => window.open('https://github.com/<TON_ORG>/<TON_REPO>', '_blank', 'noopener,noreferrer')}
            >
              Contribuer
            </Button>
          </CardHeader>
          <CardBody>
            <ul className="algo-list">
              {ALGORITHMS.map(algo => (
                <li key={algo.name}>
                  <a href={algo.url} target="_blank" rel="noopener noreferrer">
                    {algo.name}
                  </a>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </Col>

      <Col md="9">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h3 mb-0">Discover graphs</h1>
          <Link to="/graph/builder">
            <Button color="primary">Create</Button>
          </Link>
        </div>

        <div className="d-flex gap-2 align-items-center mb-3">
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher un graphe par son nom…" />
          <Button color="secondary" onClick={() => setQuery('')} disabled={!query}>
            Clear
          </Button>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="text-muted">{loading ? 'Chargement…' : `${filteredGraphs.length} graphe(s)`}</div>
          <div className="d-flex gap-2">
            <Button color="secondary" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>
              ← Précédent
            </Button>
            <div className="page-indicator">
              Page {page + 1} / {pageCount}
            </div>
            <Button color="secondary" disabled={page >= pageCount - 1} onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}>
              Suivant →
            </Button>
          </div>
        </div>

        {visibleGraphs.length === 0 ? (
          <Card>
            <CardBody>Aucun graphe trouvé.</CardBody>
          </Card>
        ) : (
          <GraphRendererGrid graphs={visibleGraphs} />
        )}
      </Col>
    </Row>
  );
};

function mapToGraphData(full: FullGraphDTO): GraphData {
  return {
    nodes: full.nodes.map(n => ({ id: n.id, label: n.label, x: n.x, y: n.y })),
    edges: full.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      weight: e.weight,
      directed: e.directed,
    })),
  };
}

export default Home;

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Alert, Card, CardBody, CardHeader, Spinner } from 'reactstrap';

import { renderGraphStatic } from 'app/shared/graph';
import { GraphData } from 'app/shared/graph/core/types';
import { FullGraphDTO, getFullGraphById } from 'app/shared/graph/graph.api';
import { IGraph } from 'app/shared/model/graph.model';

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 520;

export const GraphRenderTestStatic = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [graphMeta, setGraphMeta] = useState<IGraph | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadOldestGraph = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const listRes = await axios.get<IGraph[]>('/api/graphs?size=1&sort=createdAt,asc');
        const oldest = listRes.data[0];
        if (!oldest?.id) {
          if (isActive) {
            setGraphMeta(null);
            setGraphData(null);
          }
          return;
        }

        const full = await getFullGraphById(oldest.id);
        if (!isActive) return;

        setGraphMeta(oldest);
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

    loadOldestGraph();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!graphData || !svgRef.current) return;
    renderGraphStatic(svgRef.current, graphData, CANVAS_WIDTH, CANVAS_HEIGHT);
  }, [graphData]);

  return (
    <Card className="shadow">
      <CardHeader>Graph Renderer Test (Static)</CardHeader>
      <CardBody>
        {loading && (
          <div className="d-flex align-items-center gap-2">
            <Spinner size="sm" /> Loading graph...
          </div>
        )}
        {errorMessage && (
          <Alert color="danger" className="mb-3">
            {errorMessage}
          </Alert>
        )}
        {!loading && !errorMessage && !graphData && <Alert color="warning">No graphs found.</Alert>}
        {!loading && graphData && (
          <>
            <div className="mb-3">
              <strong>{graphMeta?.name ?? 'Untitled Graph'}</strong>
              {graphMeta?.description ? <span className="text-muted"> — {graphMeta.description}</span> : null}
            </div>
            <svg ref={svgRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
          </>
        )}
      </CardBody>
    </Card>
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

export default GraphRenderTestStatic;

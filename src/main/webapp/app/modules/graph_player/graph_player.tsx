import './graph_player.scss';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import { Alert, Button, Card, CardBody, CardHeader, Spinner } from 'reactstrap';
import { useNavigate, useParams } from 'react-router-dom';

import { getGraphAlgoById, graphAlgos } from 'app/shared/graph/algos';
import type { AlgoResult } from 'app/shared/graph/algos/types';
import { renderGraphDynamic } from 'app/shared/graph/dynamic/renderGraphDynamic';
import { GraphData, GraphEdge, GraphNode } from 'app/shared/graph/core/types';
import { FullGraphDTO, getFullGraphById } from 'app/shared/graph/graph.api';
import { IGraph } from 'app/shared/model/graph.model';

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 620;
const STEP_DURATION_MS = 700;

type SelectionState = {
  start: number | null;
  end: number | null;
};

type GraphOption = {
  id: number;
  name: string;
  description?: string | null;
};

type RenderedEdge = Omit<GraphEdge, 'source' | 'target'> & {
  source: number | GraphNode;
  target: number | GraphNode;
};

const GraphPlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const requestedGraphId = useMemo(() => {
    if (!id) return null;
    const parsedId = Number(id);
    return Number.isInteger(parsedId) ? parsedId : null;
  }, [id]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const isPlayingRef = useRef(false);

  const [graphOptions, setGraphOptions] = useState<GraphOption[]>([]);
  const [selectedGraphId, setSelectedGraphId] = useState<number | null>(requestedGraphId);
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>(graphAlgos[0]?.id ?? 'bfs');

  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [graphMeta, setGraphMeta] = useState<IGraph | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selection, setSelection] = useState<SelectionState>({ start: null, end: null });
  const [algoResult, setAlgoResult] = useState<AlgoResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const loading = loadingCatalog || loadingGraph;
  const activeAlgo = getGraphAlgoById(selectedAlgoId) ?? graphAlgos[0];

  const resetRunState = useCallback(() => {
    setSelection({ start: null, end: null });
    setAlgoResult(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const handleNodeSelect = useCallback((node: GraphNode | null) => {
    if (!node || isPlayingRef.current) return;

    setSelection(prev => {
      if (prev.start === null || prev.end !== null) {
        return { start: node.id, end: null };
      }
      if (prev.start === node.id) {
        return prev;
      }
      return { start: prev.start, end: node.id };
    });

    setAlgoResult(null);
    setCurrentStepIndex(0);
    setInfoMessage(null);
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadGraphOptions = async () => {
      try {
        setLoadingCatalog(true);
        setErrorMessage(null);
        setInfoMessage(null);

        const listRes = await axios.get<IGraph[]>('/api/graphs?sort=createdAt,asc');
        if (!isActive) return;

        const options = (listRes.data ?? []).map(toGraphOption).filter((option): option is GraphOption => option !== null);

        setGraphOptions(options);

        if (options.length === 0) {
          resetRunState();
          setGraphMeta(null);
          setGraphData(null);
          setSelectedGraphId(null);
          return;
        }

        const requestExists = requestedGraphId !== null && options.some(option => option.id === requestedGraphId);

        if (requestedGraphId !== null && !requestExists) {
          setInfoMessage(`Graph #${requestedGraphId} not found. Loaded oldest graph instead.`);
        }

        setSelectedGraphId(prev => {
          if (requestedGraphId !== null) {
            return requestExists ? requestedGraphId : options[0].id;
          }

          if (prev !== null && options.some(option => option.id === prev)) {
            return prev;
          }

          return options[0].id;
        });
      } catch (err: any) {
        if (!isActive) return;
        setErrorMessage(err?.message ?? 'Unable to load graph list.');
        setGraphOptions([]);
        setSelectedGraphId(null);
        setGraphMeta(null);
        setGraphData(null);
      } finally {
        if (isActive) {
          setLoadingCatalog(false);
        }
      }
    };

    loadGraphOptions();

    return () => {
      isActive = false;
    };
  }, [requestedGraphId, resetRunState]);

  useEffect(() => {
    let isActive = true;

    const loadSelectedGraph = async () => {
      if (selectedGraphId === null) {
        setGraphMeta(null);
        setGraphData(null);
        return;
      }

      try {
        setLoadingGraph(true);
        setErrorMessage(null);
        resetRunState();

        const full = await getFullGraphById(selectedGraphId);
        if (!isActive) return;

        const option = graphOptions.find(item => item.id === selectedGraphId);

        setGraphMeta({
          id: full.graph.id,
          name: full.graph.name,
          description: full.graph.description ?? option?.description ?? null,
        });
        setGraphData(mapToGraphData(full));
      } catch (err: any) {
        if (!isActive) return;
        setErrorMessage(err?.message ?? 'Unable to load graph data.');
        setGraphMeta(null);
        setGraphData(null);
      } finally {
        if (isActive) {
          setLoadingGraph(false);
        }
      }
    };

    loadSelectedGraph();

    return () => {
      isActive = false;
    };
  }, [selectedGraphId, graphOptions, resetRunState]);

  useEffect(() => {
    if (!svgRef.current || !graphData) return;

    const renderData: GraphData = {
      nodes: graphData.nodes.map(node => ({ ...node })),
      edges: graphData.edges.map(edge => ({ ...edge })),
    };

    renderGraphDynamic(svgRef.current, renderData, CANVAS_WIDTH, CANVAS_HEIGHT, {
      onNodeSelect: handleNodeSelect,
    });
  }, [graphData, handleNodeSelect]);

  useEffect(() => {
    if (!algoResult || !isPlaying) return;

    if (currentStepIndex >= algoResult.steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCurrentStepIndex(prev => prev + 1);
    }, STEP_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [algoResult, isPlaying, currentStepIndex]);

  const isRunDone = !!algoResult && currentStepIndex >= Math.max(0, algoResult.steps.length - 1) && !isPlaying;

  const visitedNodeIds = useMemo(() => {
    if (!algoResult || algoResult.steps.length === 0) return new Set<number>();
    const upperBound = Math.min(currentStepIndex, algoResult.steps.length - 1);
    return new Set(algoResult.steps.slice(0, upperBound + 1).map(step => step.nodeId));
  }, [algoResult, currentStepIndex]);

  const currentNodeId = useMemo(() => {
    if (!algoResult || algoResult.steps.length === 0) return null;
    const upperBound = Math.min(currentStepIndex, algoResult.steps.length - 1);
    return algoResult.steps[upperBound]?.nodeId ?? null;
  }, [algoResult, currentStepIndex]);

  const pathEdgeSet = useMemo(() => {
    if (!algoResult || !isRunDone || algoResult.path.length < 2) return new Set<string>();
    const set = new Set<string>();
    for (let i = 0; i < algoResult.path.length - 1; i += 1) {
      set.add(edgeKey(algoResult.path[i], algoResult.path[i + 1]));
    }
    return set;
  }, [algoResult, isRunDone]);

  useEffect(() => {
    if (!svgRef.current || !graphData) return;

    const svg = d3.select(svgRef.current);

    svg
      .selectAll<SVGLineElement, RenderedEdge>('line')
      .attr('stroke', edge => (isEdgeInPath(edge, pathEdgeSet) ? '#16a34a' : '#64748b'))
      .attr('stroke-width', edge => (isEdgeInPath(edge, pathEdgeSet) ? 4 : 2));

    svg
      .selectAll<SVGCircleElement, GraphNode>('circle')
      .attr('fill', node => {
        if (node.id === currentNodeId) return '#f59e0b';
        if (node.id === selection.start) return '#2563eb';
        if (node.id === selection.end) return '#dc2626';
        if (visitedNodeIds.has(node.id)) return '#10b981';
        return '#4f46e5';
      })
      .attr('stroke', '#1e1b4b')
      .attr('stroke-width', node => (node.id === currentNodeId ? 3 : 2));
  }, [graphData, selection.start, selection.end, visitedNodeIds, currentNodeId, pathEdgeSet]);

  const progress = useMemo(() => {
    if (!algoResult || algoResult.steps.length === 0) {
      return { current: 0, total: 0, percent: 0 };
    }
    const current = Math.min(currentStepIndex + 1, algoResult.steps.length);
    const total = algoResult.steps.length;
    return {
      current,
      total,
      percent: (current / total) * 100,
    };
  }, [algoResult, currentStepIndex]);

  const visitedLabels = useMemo(() => {
    if (!graphData || visitedNodeIds.size === 0) return [];
    return [...visitedNodeIds].map(nodeId => graphData.nodes.find(node => node.id === nodeId)?.label ?? `#${nodeId}`);
  }, [graphData, visitedNodeIds]);

  const pathLabels = useMemo(() => {
    if (!graphData || !algoResult || !isRunDone || algoResult.path.length === 0) return [];
    return algoResult.path.map(nodeId => graphData.nodes.find(node => node.id === nodeId)?.label ?? `#${nodeId}`);
  }, [graphData, algoResult, isRunDone]);

  const getNodeLabel = (nodeId: number | null): string => {
    if (!graphData || nodeId === null) return '-';
    return graphData.nodes.find(node => node.id === nodeId)?.label ?? `#${nodeId}`;
  };

  const handleAlgoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAlgoId(event.target.value);
    setAlgoResult(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setInfoMessage(null);
  };

  const handleGraphChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextGraphId = Number(event.target.value);
    if (!Number.isInteger(nextGraphId) || nextGraphId === selectedGraphId) return;

    setInfoMessage(null);
    setSelectedGraphId(nextGraphId);
    navigate(`/visualize/${nextGraphId}`);
  };

  const handleRunAlgo = () => {
    if (!graphData) return;
    if (!activeAlgo) {
      setInfoMessage('No algorithm available.');
      return;
    }

    if (selection.start === null || selection.end === null) {
      setInfoMessage('Select a start node and an end node before running.');
      return;
    }

    const result = activeAlgo.run({
      nodes: graphData.nodes.map(node => node.id),
      edges: graphData.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        directed: edge.directed ?? false,
        weight: edge.weight ?? 1,
      })),
      start: selection.start,
      end: selection.end,
    });

    setAlgoResult(result);
    setCurrentStepIndex(0);
    setIsPlaying(result.steps.length > 1);
    setInfoMessage(result.path.length === 0 ? `${activeAlgo.name}: no path between selected nodes.` : null);
  };

  const handleTogglePlayback = () => {
    if (!algoResult) return;

    if (currentStepIndex >= algoResult.steps.length - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(algoResult.steps.length > 1);
      return;
    }

    setIsPlaying(prev => !prev);
  };

  const handleReset = () => {
    resetRunState();
    setInfoMessage(null);
  };

  if (loading) {
    return (
      <div className="graph-player-loading">
        <Spinner size="sm" />
        <span>Loading graph...</span>
      </div>
    );
  }

  return (
    <div className="graph-player-page">
      <Card className="graph-player-shell">
        <CardHeader className="graph-player-header">
          <div>
            <h1 className="graph-player-title">Graph Player</h1>
            <p className="graph-player-subtitle">Select graph and algorithm, then click nodes to set start/end.</p>
          </div>
          <div className="graph-player-meta">
            <div className="meta-label">Graph</div>
            <div className="meta-value">{graphMeta?.name ?? 'Untitled graph'}</div>
            {graphMeta?.description ? <div className="meta-description">{graphMeta.description}</div> : null}
          </div>
        </CardHeader>

        <CardBody>
          {errorMessage && (
            <Alert color="danger" className="mb-3">
              {errorMessage}
            </Alert>
          )}

          {!errorMessage && !graphData && <Alert color="warning">No graph found.</Alert>}

          {!errorMessage && graphData && (
            <div className="graph-player-layout">
              <section className="graph-player-canvas">
                <svg ref={svgRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="graph-player-svg" />
                <div className="graph-player-legend">
                  <div className="legend-item">
                    <span className="legend-dot legend-start" />
                    <span>Start</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot legend-end" />
                    <span>End</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot legend-current" />
                    <span>Current</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot legend-visited" />
                    <span>Visited</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-line legend-path" />
                    <span>Computed path</span>
                  </div>
                </div>
              </section>

              <aside className="graph-player-panel">
                <div className="panel-block">
                  <h2 className="panel-title">Selection</h2>
                  <p>
                    <strong>Start:</strong> {getNodeLabel(selection.start)}
                  </p>
                  <p>
                    <strong>End:</strong> {getNodeLabel(selection.end)}
                  </p>
                </div>

                <div className="panel-block">
                  <h2 className="panel-title">Controls</h2>

                  <label className="panel-label" htmlFor="graph-choice">
                    Graph
                  </label>
                  <select
                    id="graph-choice"
                    className="graph-player-select"
                    value={selectedGraphId ?? ''}
                    onChange={handleGraphChange}
                    disabled={graphOptions.length === 0 || loadingGraph}
                  >
                    {graphOptions.length === 0 && (
                      <option value="" disabled>
                        No graph available
                      </option>
                    )}
                    {graphOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>

                  <label className="panel-label" htmlFor="algo-choice">
                    Algorithm
                  </label>
                  <select
                    id="algo-choice"
                    className="graph-player-select"
                    value={selectedAlgoId}
                    onChange={handleAlgoChange}
                    disabled={isPlaying || graphAlgos.length === 0}
                  >
                    {graphAlgos.map(algo => (
                      <option key={algo.id} value={algo.id}>
                        {algo.name}
                      </option>
                    ))}
                  </select>

                  <div className="graph-player-actions">
                    <Button
                      color="success"
                      onClick={handleRunAlgo}
                      disabled={selection.start === null || selection.end === null || isPlaying}
                    >
                      Run {activeAlgo ? activeAlgo.id.toUpperCase() : 'ALGO'}
                    </Button>
                    <Button color="primary" outline onClick={handleTogglePlayback} disabled={!algoResult}>
                      {isPlaying ? 'Pause' : 'Resume'}
                    </Button>
                    <Button color="secondary" onClick={handleReset}>
                      Reset
                    </Button>
                  </div>
                </div>

                {infoMessage && (
                  <Alert color="info" className="mb-0">
                    {infoMessage}
                  </Alert>
                )}

                {algoResult && (
                  <div className="panel-block">
                    <h2 className="panel-title">Progress</h2>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
                    </div>
                    <div className="progress-value">
                      {progress.current}/{progress.total} visited steps
                    </div>

                    <div className="result-row">
                      <div className="result-label">Visited:</div>
                      <div className="result-value">{visitedLabels.length > 0 ? visitedLabels.join(' -> ') : '-'}</div>
                    </div>

                    <div className="result-row">
                      <div className="result-label">Path:</div>
                      <div className="result-value">{pathLabels.length > 0 ? pathLabels.join(' -> ') : 'Not available yet'}</div>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

function toGraphOption(graph: IGraph): GraphOption | null {
  if (typeof graph.id !== 'number') return null;
  return {
    id: graph.id,
    name: graph.name ?? `Graph #${graph.id}`,
    description: graph.description ?? null,
  };
}

function mapToGraphData(full: FullGraphDTO): GraphData {
  return {
    nodes: full.nodes.map(node => ({
      id: node.id,
      label: node.label,
      x: node.x,
      y: node.y,
    })),
    edges: full.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      weight: edge.weight,
      directed: edge.directed,
    })),
  };
}

function edgeKey(source: number, target: number): string {
  return `${source}->${target}`;
}

function endpointId(endpoint: number | GraphNode): number {
  return typeof endpoint === 'number' ? endpoint : endpoint.id;
}

function isEdgeInPath(edge: RenderedEdge, pathEdgeSet: Set<string>): boolean {
  if (pathEdgeSet.size === 0) return false;

  const source = endpointId(edge.source);
  const target = endpointId(edge.target);

  if (pathEdgeSet.has(edgeKey(source, target))) {
    return true;
  }

  return !edge.directed && pathEdgeSet.has(edgeKey(target, source));
}

export default GraphPlayerPage;

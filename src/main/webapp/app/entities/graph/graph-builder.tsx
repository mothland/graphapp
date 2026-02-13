import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  createEdge,
  createFullGraphFrontend,
  createNode,
  deleteEdge,
  deleteNode,
  getFullGraphById,
  updateEdge,
  updateGraph,
  updateNode,
} from 'app/shared/graph/graph.api';

interface BuilderNode {
  id: number;
  label: string;
  x: number;
  y: number;
}

interface BuilderEdge {
  id: number;
  source: number;
  target: number;
  weight: number;
  directed: boolean;
}

const DEFAULT_CANVAS_HEIGHT = 520;

export const GraphBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const graphId = id ? Number(id) : null;
  const isEditMode = Number.isFinite(graphId);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const originalNodesRef = useRef<BuilderNode[]>([]);
  const originalEdgesRef = useRef<BuilderEdge[]>([]);
  const nextTempNodeIdRef = useRef(-1);
  const nextTempEdgeIdRef = useRef(-1);
  const nextNodeLabelRef = useRef(1);

  const [graphName, setGraphName] = useState('');
  const [graphDescription, setGraphDescription] = useState('');

  const [nodes, setNodes] = useState<BuilderNode[]>([]);
  const [edges, setEdges] = useState<BuilderEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [connectMode, setConnectMode] = useState(false);
  const [connectFromId, setConnectFromId] = useState<number | null>(null);
  const [edgeWeight, setEdgeWeight] = useState(1);
  const [edgeDirected, setEdgeDirected] = useState(true);

  const [dragging, setDragging] = useState<{ id: number; offsetX: number; offsetY: number } | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(900);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingGraph, setLoadingGraph] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setCanvasWidth(Math.max(320, Math.floor(rect.width)));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!isEditMode || graphId == null) return;
    let isActive = true;
    const loadGraph = async () => {
      setLoadingGraph(true);
      setErrorMessage(null);
      try {
        const full = await getFullGraphById(graphId);
        if (!isActive) return;
        setGraphName(full.graph.name ?? '');
        setGraphDescription(full.graph.description ?? '');
        const loadedNodes = full.nodes.map(n => ({ id: n.id, label: n.label, x: n.x, y: n.y }));
        const loadedEdges = full.edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          weight: e.weight,
          directed: e.directed,
        }));
        originalNodesRef.current = loadedNodes;
        originalEdgesRef.current = loadedEdges;
        nextTempNodeIdRef.current = -1;
        nextTempEdgeIdRef.current = -1;
        nextNodeLabelRef.current = loadedNodes.length + 1;
        setNodes(loadedNodes);
        setEdges(loadedEdges);
        setSelectedNodeId(null);
        setConnectFromId(null);
        setConnectMode(false);
      } catch (err: any) {
        if (!isActive) return;
        setErrorMessage(err?.message ?? 'Failed to load graph.');
      } finally {
        if (isActive) setLoadingGraph(false);
      }
    };
    loadGraph();
    return () => {
      isActive = false;
    };
  }, [graphId, isEditMode]);

  const getSvgPoint = (event: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) {
      return { x: 0, y: 0 };
    }
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) {
      return { x: 0, y: 0 };
    }
    const cursor = point.matrixTransform(ctm.inverse());
    return { x: cursor.x, y: cursor.y };
  };

  const addNodeAt = (x: number, y: number) => {
    const tempNodeId = nextTempNodeIdRef.current;
    nextTempNodeIdRef.current -= 1;
    const label = `N${nextNodeLabelRef.current}`;
    nextNodeLabelRef.current += 1;
    setNodes(prev => [...prev, { id: tempNodeId, label, x, y }]);
    setSelectedNodeId(tempNodeId);
  };

  const addEdge = (sourceId: number, targetId: number) => {
    if (sourceId === targetId) {
      return;
    }
    const duplicate = edges.some(e => e.source === sourceId && e.target === targetId);
    if (duplicate) {
      return;
    }
    setEdges(prev => [
      ...prev,
      {
        id: nextTempEdgeIdRef.current--,
        source: sourceId,
        target: targetId,
        weight: edgeWeight,
        directed: edgeDirected,
      },
    ]);
  };

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (dragging) return;
    if ((event.target as Element).tagName.toLowerCase() !== 'svg') return;
    const point = getSvgPoint(event);
    addNodeAt(point.x, point.y);
    if (connectMode) {
      setConnectFromId(null);
    }
  };

  const handleNodeClick = (event: React.MouseEvent, node: BuilderNode) => {
    event.stopPropagation();
    if (connectMode) {
      if (connectFromId == null) {
        setConnectFromId(node.id);
        setSelectedNodeId(node.id);
        return;
      }
      if (connectFromId !== node.id) {
        addEdge(connectFromId, node.id);
        setConnectFromId(null);
      }
      return;
    }
    setSelectedNodeId(node.id);
  };

  const handleNodeMouseDown = (event: React.MouseEvent, node: BuilderNode) => {
    event.stopPropagation();
    const point = getSvgPoint(event);
    setDragging({ id: node.id, offsetX: point.x - node.x, offsetY: point.y - node.y });
  };

  const handleSvgMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const point = getSvgPoint(event);
    setNodes(prev => prev.map(n => (n.id === dragging.id ? { ...n, x: point.x - dragging.offsetX, y: point.y - dragging.offsetY } : n)));
  };

  const handleSvgMouseUp = () => setDragging(null);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null;

  const handleUpdateSelectedNodeLabel = (value: string) => {
    if (!selectedNode) return;
    setNodes(prev => prev.map(n => (n.id === selectedNode.id ? { ...n, label: value } : n)));
  };

  const handleDeleteSelectedNode = () => {
    if (!selectedNode) return;
    setNodes(prev => prev.filter(n => n.id !== selectedNode.id));
    setEdges(prev => prev.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNodeId(null);
    if (connectFromId === selectedNode.id) {
      setConnectFromId(null);
    }
  };

  const handleDeleteEdge = (edgeId: number) => setEdges(prev => prev.filter(e => e.id !== edgeId));

  const handleSave = async () => {
    if (!graphName.trim()) {
      setErrorMessage('Graph name is required.');
      return;
    }
    if (nodes.length === 0) {
      setErrorMessage('Add at least one node before saving.');
      return;
    }
    setErrorMessage(null);
    setSaving(true);
    try {
      if (!isEditMode || graphId == null) {
        const nodeIndex = new Map(nodes.map((n, idx) => [n.id, idx]));
        const createdGraphId = await createFullGraphFrontend({
          name: graphName.trim(),
          description: graphDescription.trim() || undefined,
          nodes: nodes.map(n => ({ label: n.label, x: n.x, y: n.y })),
          edges: edges.map(e => ({
            sourceIndex: nodeIndex.get(e.source) ?? 0,
            targetIndex: nodeIndex.get(e.target) ?? 0,
            weight: e.weight,
            directed: e.directed,
          })),
        });
        navigate(`/graph/${createdGraphId}`);
        return;
      }

      await updateGraph({ id: graphId, name: graphName.trim(), description: graphDescription.trim() || null });

      const originalNodeIds = new Set(originalNodesRef.current.map(n => n.id));
      const originalEdgeIds = new Set(originalEdgesRef.current.map(e => e.id));
      const originalNodesById = new Map(originalNodesRef.current.map(n => [n.id, n]));
      const originalEdgesById = new Map(originalEdgesRef.current.map(e => [e.id, e]));

      const currentNodeIds = new Set(nodes.map(n => n.id));
      const currentEdgeIds = new Set(edges.map(e => e.id));

      const nodesToDelete = originalNodesRef.current.filter(n => !currentNodeIds.has(n.id));
      const edgesToDelete = originalEdgesRef.current.filter(e => !currentEdgeIds.has(e.id));

      await Promise.all(edgesToDelete.map(e => deleteEdge(e.id)));
      await Promise.all(nodesToDelete.map(n => deleteNode(n.id)));

      const nodesToCreate = nodes.filter(n => !originalNodeIds.has(n.id));
      const createdNodes = await Promise.all(
        nodesToCreate.map(n =>
          createNode({
            label: n.label,
            x: n.x,
            y: n.y,
            graph: { id: graphId },
          }),
        ),
      );
      const tempIdToRealId = new Map(nodesToCreate.map((n, index) => [n.id, createdNodes[index].id]));

      const nodesToUpdate = nodes.filter(n => {
        if (!originalNodeIds.has(n.id)) return false;
        const original = originalNodesById.get(n.id);
        return !!original && (original.label !== n.label || original.x !== n.x || original.y !== n.y);
      });
      await Promise.all(
        nodesToUpdate.map(n =>
          updateNode({
            id: n.id,
            label: n.label,
            x: n.x,
            y: n.y,
            graph: { id: graphId },
          }),
        ),
      );

      const resolveNodeId = (nodeId: number): number => {
        const resolvedNodeId = tempIdToRealId.get(nodeId) ?? nodeId;
        if (resolvedNodeId <= 0) {
          throw new Error(`Unable to resolve temporary node id ${nodeId} before edge persistence.`);
        }
        return resolvedNodeId;
      };

      const edgesToCreate = edges.filter(e => !originalEdgeIds.has(e.id));
      await Promise.all(
        edgesToCreate.map(e =>
          createEdge({
            weight: e.weight,
            directed: e.directed,
            graph: { id: graphId },
            source: { id: resolveNodeId(e.source) },
            target: { id: resolveNodeId(e.target) },
          }),
        ),
      );

      const edgesToUpdate = edges.filter(e => {
        if (!originalEdgeIds.has(e.id)) return false;
        const original = originalEdgesById.get(e.id);
        return (
          !!original &&
          (original.source !== e.source || original.target !== e.target || original.weight !== e.weight || original.directed !== e.directed)
        );
      });
      await Promise.all(
        edgesToUpdate.map(e =>
          updateEdge({
            id: e.id,
            weight: e.weight,
            directed: e.directed,
            graph: { id: graphId },
            source: { id: resolveNodeId(e.source) },
            target: { id: resolveNodeId(e.target) },
          }),
        ),
      );

      navigate(`/graph/${graphId}`);
    } catch (err: any) {
      setErrorMessage(err?.message ?? (isEditMode ? 'Failed to save graph.' : 'Failed to create graph.'));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setNodes([]);
    setEdges([]);
    nextTempNodeIdRef.current = -1;
    nextTempEdgeIdRef.current = -1;
    nextNodeLabelRef.current = 1;
    setSelectedNodeId(null);
    setConnectFromId(null);
    setConnectMode(false);
  };

  return (
    <div className="graph-builder">
      <div className="graph-builder__header">
        <div>
          <h2 className="graph-builder__title">Visual Graph Builder</h2>
          <p className="graph-builder__subtitle">Click to add nodes, drag to reposition, and connect nodes to create edges.</p>
        </div>
        <div className="graph-builder__header-actions">
          <Button color="secondary" tag={Link} to="/">
            <FontAwesomeIcon icon="arrow-left" /> Back to list
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert color="danger" className="graph-builder__alert">
          {errorMessage}
        </Alert>
      )}

      <Row className="graph-builder__layout">
        <Col lg="8">
          <Card className="graph-builder__canvas-card shadow">
            <CardHeader className="graph-builder__canvas-header">
              <div className="graph-builder__canvas-actions">
                <Button
                  color={connectMode ? 'primary' : 'outline-primary'}
                  onClick={() => {
                    setConnectMode(prev => !prev);
                    setConnectFromId(null);
                  }}
                >
                  <FontAwesomeIcon icon="tasks" /> {connectMode ? 'Connect Mode' : 'Connect Nodes'}
                </Button>
                <div className="graph-builder__badge-group">
                  <Badge color="info">Nodes: {nodes.length}</Badge>
                  <Badge color="secondary">Edges: {edges.length}</Badge>
                </div>
              </div>
              {connectMode && (
                <div className="graph-builder__hint">
                  {connectFromId == null ? 'Click a node to start an edge.' : 'Click another node to complete the edge.'}
                </div>
              )}
            </CardHeader>
            <CardBody>
              <div className="graph-builder__canvas" ref={containerRef}>
                <svg
                  ref={svgRef}
                  className="graph-builder__svg"
                  width={canvasWidth}
                  height={DEFAULT_CANVAS_HEIGHT}
                  onClick={handleSvgClick}
                  onMouseMove={handleSvgMouseMove}
                  onMouseUp={handleSvgMouseUp}
                  onMouseLeave={handleSvgMouseUp}
                >
                  <defs>
                    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    </pattern>
                    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                    </marker>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" rx="8" pointerEvents="none" />
                  <g className="graph-builder__edges">
                    {edges.map(edge => {
                      const source = nodes.find(n => n.id === edge.source);
                      const target = nodes.find(n => n.id === edge.target);
                      if (!source || !target) return null;
                      return (
                        <g key={edge.id}>
                          <line
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            stroke="#64748b"
                            strokeWidth="2"
                            markerEnd={edge.directed ? 'url(#arrow)' : undefined}
                          />
                          <text
                            x={(source.x + target.x) / 2}
                            y={(source.y + target.y) / 2 - 6}
                            textAnchor="middle"
                            fill="#1f2937"
                            fontSize="12"
                          >
                            {edge.weight}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                  <g className="graph-builder__nodes">
                    {nodes.map(node => (
                      <g
                        key={node.id}
                        className={`graph-builder__node${selectedNodeId === node.id ? ' is-selected' : ''}`}
                        transform={`translate(${node.x}, ${node.y})`}
                        onMouseDown={event => handleNodeMouseDown(event, node)}
                        onClick={event => handleNodeClick(event, node)}
                      >
                        <circle r="18" />
                        <text dy="5" textAnchor="middle">
                          {node.label}
                        </text>
                      </g>
                    ))}
                  </g>
                </svg>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col lg="4">
          <Card className="graph-builder__panel shadow">
            <CardHeader>Graph Details</CardHeader>
            <CardBody>
              <FormGroup>
                <Label for="graph-name">Name</Label>
                <Input
                  id="graph-name"
                  value={graphName}
                  onChange={event => setGraphName(event.target.value)}
                  placeholder="My cool graph"
                  disabled={isEditMode}
                />
              </FormGroup>
              <FormGroup>
                <Label for="graph-description">Description</Label>
                <Input
                  id="graph-description"
                  value={graphDescription}
                  onChange={event => setGraphDescription(event.target.value)}
                  placeholder="Optional description"
                />
              </FormGroup>
              <FormGroup>
                <Label for="edge-weight">Default edge weight</Label>
                <Input
                  id="edge-weight"
                  type="number"
                  min="0"
                  value={edgeWeight}
                  onChange={event => setEdgeWeight(Number(event.target.value || 0))}
                />
              </FormGroup>
              <FormGroup check className="graph-builder__checkbox">
                <Input
                  id="edge-directed"
                  type="checkbox"
                  checked={edgeDirected}
                  onChange={event => setEdgeDirected(event.target.checked)}
                />
                <Label for="edge-directed" check>
                  Directed edges
                </Label>
              </FormGroup>
              <div className="graph-builder__panel-actions">
                <Button color="primary" onClick={handleSave} disabled={saving || loadingGraph}>
                  <FontAwesomeIcon icon="save" /> {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Graph'}
                </Button>
                <Button color="outline-secondary" onClick={handleReset} disabled={saving}>
                  Clear canvas
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card className="graph-builder__panel shadow">
            <CardHeader>Selection</CardHeader>
            <CardBody>
              {selectedNode ? (
                <>
                  <FormGroup>
                    <Label for="node-label">Node label</Label>
                    <Input
                      id="node-label"
                      value={selectedNode.label}
                      onChange={event => handleUpdateSelectedNodeLabel(event.target.value)}
                    />
                  </FormGroup>
                  <div className="graph-builder__panel-actions">
                    <Button color="danger" onClick={handleDeleteSelectedNode}>
                      <FontAwesomeIcon icon="trash" /> Delete node
                    </Button>
                  </div>
                </>
              ) : (
                <p className="graph-builder__muted">Select a node to edit its label or remove it.</p>
              )}
            </CardBody>
          </Card>

          <Card className="graph-builder__panel shadow">
            <CardHeader>Edges</CardHeader>
            <CardBody>
              {edges.length === 0 ? (
                <p className="graph-builder__muted">No edges yet. Enable connect mode and click two nodes.</p>
              ) : (
                <div className="graph-builder__edge-list">
                  {edges.map(edge => (
                    <div key={edge.id} className="graph-builder__edge-row">
                      <div className="graph-builder__edge-label">
                        {nodes.find(n => n.id === edge.source)?.label ?? edge.source}
                        {edge.directed ? ' -> ' : ' <-> '}
                        {nodes.find(n => n.id === edge.target)?.label ?? edge.target}
                      </div>
                      <div className="graph-builder__edge-controls">
                        <Input
                          type="number"
                          min="0"
                          value={edge.weight}
                          onChange={event =>
                            setEdges(prev => prev.map(e => (e.id === edge.id ? { ...e, weight: Number(event.target.value || 0) } : e)))
                          }
                        />
                        <FormGroup check className="graph-builder__edge-checkbox">
                          <Input
                            type="checkbox"
                            checked={edge.directed}
                            onChange={event =>
                              setEdges(prev => prev.map(e => (e.id === edge.id ? { ...e, directed: event.target.checked } : e)))
                            }
                          />
                          <Label check>Directed</Label>
                        </FormGroup>
                        <Button color="link" className="graph-builder__edge-delete" onClick={() => handleDeleteEdge(edge.id)}>
                          <FontAwesomeIcon icon="trash" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GraphBuilder;

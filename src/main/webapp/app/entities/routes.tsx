import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';
import GraphPlayerPage from 'app/modules/graph_player/graph_player';

import Graph from './graph';
import Node from './node';
import Edge from './edge';
import Comment from './comment';
/* jhipster-needle-add-route-import - JHipster will add routes here */

export default () => {
  return (
    <div>
      <ErrorBoundaryRoutes>
        {/* prettier-ignore */}
        <Route path="graph/*" element={<Graph />} />
        <Route path="node/*" element={<Node />} />
        <Route path="edge/*" element={<Edge />} />
        <Route path="comment/*" element={<Comment />} />
        <Route path="graph-player" element={<GraphPlayerPage />} />
        <Route path="visualize" element={<GraphPlayerPage />} />
        <Route path="visualize/:id" element={<GraphPlayerPage />} />
        {/* jhipster-needle-add-route-path - JHipster will add routes here */}
      </ErrorBoundaryRoutes>
    </div>
  );
};

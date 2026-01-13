import React from 'react';
import { Route } from 'react-router'; // eslint-disable-line

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

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
        {/* jhipster-needle-add-route-path - JHipster will add routes here */}
      </ErrorBoundaryRoutes>
    </div>
  );
};

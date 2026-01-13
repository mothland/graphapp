import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Graph from './graph';
import GraphDetail from './graph-detail';
import GraphUpdate from './graph-update';
import GraphDeleteDialog from './graph-delete-dialog';

const GraphRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Graph />} />
    <Route path="new" element={<GraphUpdate />} />
    <Route path=":id">
      <Route index element={<GraphDetail />} />
      <Route path="edit" element={<GraphUpdate />} />
      <Route path="delete" element={<GraphDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default GraphRoutes;

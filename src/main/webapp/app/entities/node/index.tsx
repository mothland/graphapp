import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Node from './node';
import NodeDetail from './node-detail';
import NodeUpdate from './node-update';
import NodeDeleteDialog from './node-delete-dialog';

const NodeRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Node />} />
    <Route path="new" element={<NodeUpdate />} />
    <Route path=":id">
      <Route index element={<NodeDetail />} />
      <Route path="edit" element={<NodeUpdate />} />
      <Route path="delete" element={<NodeDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default NodeRoutes;

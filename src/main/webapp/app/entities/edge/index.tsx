import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Edge from './edge';
import EdgeDetail from './edge-detail';
import EdgeUpdate from './edge-update';
import EdgeDeleteDialog from './edge-delete-dialog';

const EdgeRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Edge />} />
    <Route path="new" element={<EdgeUpdate />} />
    <Route path=":id">
      <Route index element={<EdgeDetail />} />
      <Route path="edit" element={<EdgeUpdate />} />
      <Route path="delete" element={<EdgeDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default EdgeRoutes;

import './helper/http.interceptor';
import './index.scss';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { routeTree } from './routeTree.gen';
const root = document.getElementById('root');
if (root === null) {
  throw new Error('Root element not found');
}
const queryClient = new QueryClient();
const router = createRouter({
  routeTree,
  context: { queryClient },
});

declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Register {
    router: typeof router;
  }
}
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

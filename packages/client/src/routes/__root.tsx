import {
  Outlet,
  createRootRouteWithContext,
  redirect,
} from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import style from './__root.module.scss';
import useAuthStore from '../Store';
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: () => (
    <main className={style.main}>
      <Outlet />
      <TanStackRouterDevtools />
    </main>
  ),
  beforeLoad: ({ location }) => {
    const unauthenticatedRoutes = ['/login'];
    const unauthenticatedMatch = unauthenticatedRoutes.find(route =>
      location.pathname.startsWith(route)
    );
    if (typeof unauthenticatedMatch === 'string') return;
    const { authenticated } = useAuthStore.getState();
    if (!authenticated) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw redirect({
        to: '/login',
        search: {
          redirectUrl: location.href,
        },
      });
    }
  },
});

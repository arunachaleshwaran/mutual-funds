import { createFileRoute, useNavigate } from '@tanstack/react-router';
import useAuthStore from '../Store';

export const Route = createFileRoute('/login')({
  component: Index,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirectUrl:
        typeof search.redirectUrl === 'string'
          ? search.redirectUrl
          : '/home',
    };
  },
});
function Index() {
  const setAuthenticated = useAuthStore(
    store => store.setAuthenticated
  );
  const { redirectUrl } = Route.useSearch();
  const navigate = useNavigate();
  const login = () => {
    setAuthenticated(true);
    void navigate({ to: redirectUrl });
  };
  return (
    <>
      Login Page
      <button type='button' onClick={() => login()}>
        Login
      </button>
    </>
  );
}

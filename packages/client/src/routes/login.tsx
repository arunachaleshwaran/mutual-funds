import type { FormEvent, FormEventHandler } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import style from './login.module.css';
import useAuthStore from '../Store';

export const Route = createFileRoute('/login')({
  component: Comp,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirectUrl:
        typeof search.redirectUrl === 'string'
          ? search.redirectUrl
          : '/home',
    };
  },
});
function Comp() {
  const setAuthenticated = useAuthStore(
    store => store.setAuthenticated
  );
  const { redirectUrl } = Route.useSearch();
  const navigate = useNavigate();
  const login: FormEventHandler<HTMLFormElement> = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const phone = new FormData(event.target as HTMLFormElement).get(
      'phone'
    ) as string;
    setAuthenticated(phone);
    void navigate({ to: redirectUrl });
  };
  return (
    <form className={style.form} onSubmit={login}>
      <input
        name='phone'
        pattern='\d{10}'
        placeholder='Phone Number'
        type='text'
        required
      />
      <input type='submit' value='Login' />
    </form>
  );
}

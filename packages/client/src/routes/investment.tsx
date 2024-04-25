import { Link, createFileRoute } from '@tanstack/react-router';
import type { Order } from '@mutual-fund/shared';
import type { QueryObserverResult } from '@tanstack/react-query';
import type { Strategy } from '@mutual-fund/shared/strategies';
import strategies from '@mutual-fund/shared/strategies';
import style from './investment.module.scss';
import { useAuthStore } from '../Store';
import useFetchEvent from '../helper/useFetchEvent';
export const Route = createFileRoute('/investment')({
  component: Comp,
  validateSearch: (search: Record<string, unknown>) => {
    const { strategy, transactionID } = search;
    if (typeof strategy !== 'string')
      throw new Error('No strategy found');
    if (typeof transactionID !== 'string')
      throw new Error('No transactionID found');
    return {
      strategy: strategy as Strategy['name'],
      transactionID,
    };
  },
});
function Comp() {
  const { strategy, transactionID } = Route.useSearch();
  const authenticated = useAuthStore(store => store.authenticated);
  const [state, error] = useFetchEvent<
    Array<
      Pick<QueryObserverResult<Order>, 'data' | 'error' | 'status'>
    >
  >(
    `http://localhost:4000/transact/${transactionID}?strategy=${strategy}`,
    {
      method: 'POST',
      headers: {
        authorization: authenticated,
      },
    },
    ['Already Processed']
  );
  const currentStrategy = strategies.find(i => i.name === strategy)!;
  if (error !== null)
    return (
      <div className={style.investment}>
        {error}
        <Link to='/'>Home</Link>
      </div>
    );
  return (
    <div className={style.investment}>
      Investment for {strategy}
      {/* Note: always currentStrategy funds and query result are on correct order */}
      {state?.map((queryResult, i) => (
        <div
          key={currentStrategy.funds[i].name}
          className={style.status}>
          {currentStrategy.funds[i].name} -{queryResult.status}
        </div>
      ))}
      <Link to='/'>Home</Link>
    </div>
  );
}

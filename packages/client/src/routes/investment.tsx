import { Link, createFileRoute } from '@tanstack/react-router';
import type { MarketValue, Order, Payment } from '../model';
import { queryOptions, useQueries } from '@tanstack/react-query';
import type { Strategy } from '../strategies';
import axios from 'axios';
import strategies from '../strategies';
import style from './investment.module.scss';
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
  loader: async ({
    context: { queryClient },
    location: { search },
  }) => {
    const { transactionID } = search as {
      strategy: string;
      transactionID: string;
    };
    return queryClient.ensureQueryData(
      queryOptions({
        queryKey: ['payment', transactionID],
        queryFn: async () => {
          const res = await axios.get<Payment>(
            `http://localhost:8080/payment/${transactionID}`
          );
          return res.data;
        },
      })
    );
  },
});
function Comp() {
  const { strategy, transactionID } = Route.useSearch();
  const payment = Route.useLoaderData();
  if (payment.status === 'Failed') {
    history.back();
    throw new Error('Payment failed');
  }
  const currentStrategy = strategies.find(i => i.name === strategy);
  if (!currentStrategy) throw new Error('No strategy found');
  const userQueries = useQueries({
    queries: currentStrategy.funds.map(fund => ({
      queryKey: ['order', fund.name, transactionID],
      queryFn: async () => {
        const { data: marketValue } = await axios.get<MarketValue>(
          `http://localhost:8081/market-value/${fund.name}`
        );
        const PERCENTAGE = 100;
        const amount =
          (payment.amount * fund.percentage) / PERCENTAGE;
        return axios.post<Order>('http://localhost:8081/order', {
          fund: fund.name,
          amount,
          units: amount / marketValue.marketValue,
          pricePerUnit: marketValue.marketValue,
          paymentID: transactionID,
        });
      },
    })),
  });
  return (
    <div className={style.investment}>
      Investment for {strategy}
      {userQueries.map(({ status }, i) => (
        <div
          key={currentStrategy.funds[i].name}
          className={style.status}>
          {currentStrategy.funds[i].name} -{status}
        </div>
      ))}
      <Link
        // eslint-disable-next-line react/forbid-component-props
        className={
          userQueries.every(({ status }) => status === 'success')
            ? ''
            : style.disable
        }
        to='/'>
        Home
      </Link>
    </div>
  );
}

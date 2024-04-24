import { Link, createFileRoute } from '@tanstack/react-router';
import InvestVsMarket from '../components/InvestVsMarket';
import type { OrderResponse } from '../Store';
import type { Strategy } from '@mutual-fund/shared/strategies';
import axios from 'axios';
import { queryOptions } from '@tanstack/react-query';
import style from './index.module.scss';
import { useEffect } from 'react';
import { useFundStore } from '../Store';
export const Route = createFileRoute('/')({
  component: Comp,
  loader: async ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(
      queryOptions({
        queryKey: ['order'],
        queryFn: async () => {
          const res = await axios.get<Array<OrderResponse>>(
            'http://localhost:4000/order'
          );
          return res.data;
        },
      })
    );
  },
});

function Comp() {
  const orders = Route.useLoaderData();
  const [strategyVsOrders, setStrategyVsOrders] = useFundStore(
    store => [store.strategyVsOrders, store.setStrategyVsOrders]
  );
  useEffect(() => setStrategyVsOrders(orders), [orders]);
  const strategyAndOrders = Object.entries(strategyVsOrders) as Array<
    [Strategy['name'], Array<OrderResponse>]
  >;
  return (
    <div className={style.home}>
      <Link to='/transact'>Transact</Link>
      <div className={style.investments}>
        {strategyAndOrders.map(([strategy, ordersOfStrategy]) => (
          <div key={strategy} className={style.investment}>
            {strategy}
            <div className={style.option}>
              <InvestVsMarket
                ids={ordersOfStrategy.map(({ orderId }) => orderId)}
              />
              <Link search={{ strategy }} to='/holding'>
                See Holdings
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

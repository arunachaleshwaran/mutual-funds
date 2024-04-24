import { Link, createFileRoute } from '@tanstack/react-router';
import InvestVsMarket from '../components/InvestVsMarket';
import type { OrderResponse } from '../Store';
import type { Strategy } from '@mutual-fund/shared/strategies';
import homeStyle from './index.module.scss';
import style from './holding.module.scss';
import { useFundStore } from '../Store';
export const Route = createFileRoute('/holding')({
  component: Comp,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      strategy: search.strategy as Strategy['name'],
    };
  },
});

function Comp() {
  const { strategy } = Route.useSearch();
  const strategyVsOrders = useFundStore(
    store => store.strategyVsOrders
  );
  const orders = strategyVsOrders[strategy];
  if (!orders) {
    return (
      <div className={style.holding}>
        <Link to='/' />
      </div>
    );
  }
  const funds = (
    Object.entries(
      Object.groupBy(orders, ({ fund }) => fund)
    ) as Array<
      [
        Extract<
          Strategy,
          { name: typeof strategy }
        >['funds'][number]['name'],
        Array<OrderResponse>,
      ]
    >
  ).sort(([fund1], [fund2]) => fund1.localeCompare(fund2));
  return (
    <div className={style.holding}>
      <Link to='/' />
      <div className={homeStyle.investments}>
        {funds.map(([fund, ordersOfFund]) => (
          <div key={fund} className={homeStyle.investment}>
            {fund}
            <div className={homeStyle.option}>
              <InvestVsMarket
                ids={ordersOfFund.map(({ orderId }) => orderId)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Link, createFileRoute } from '@tanstack/react-router';
import type { FundStore } from '../Store';
import InvestVsMarket from '../components/InvestVsMarket';
import homeStyle from './index.module.scss';
import strategies from '../strategies';
import style from './holding.module.scss';
export const Route = createFileRoute('/holding')({
  component: Comp,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      order: search.order as FundStore['investments'][number],
    };
  },
});

function Comp() {
  const { order } = Route.useSearch();
  const currStrategy = strategies.find(
    i => i.name === order.strategy
  );
  if (!currStrategy) {
    return <div>Strategy not found</div>;
  }
  return (
    <div className={style.holding}>
      <Link to='/' />
      <div className={homeStyle.investments}>
        {order.orderIDs.map((id, index) => {
          const fund = currStrategy.funds[index];
          return (
            <div key={fund.name} className={homeStyle.investment}>
              {fund.name}
              <div className={homeStyle.option}>
                <InvestVsMarket ids={[id]} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

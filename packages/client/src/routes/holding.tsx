import { Link, createFileRoute } from '@tanstack/react-router';
import InvestVsMarket from '../components/InvestVsMarket';
import homeStyle from './index.module.scss';
import strategies from '../strategies';
import style from './holding.module.scss';
type Strategy = (typeof strategies)[number];
export const Route = createFileRoute('/holding')({
  component: Comp,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      amount: typeof search.amount === 'number' ? search.amount : 0,
      strategy: (typeof search.strategy === 'string'
        ? search.strategy
        : 'Arbitrage Strategy') as Strategy['name'],
    };
  },
});

function Comp() {
  const { amount, strategy } = Route.useSearch();
  const currStrategy = strategies.find(i => i.name === strategy);
  if (!currStrategy) {
    return <div>Strategy not found</div>;
  }
  return (
    <div className={style.holding}>
      <Link to='/' />
      <div className={homeStyle.investments}>
        {currStrategy.funds.map(fund => (
          <div key={fund.name} className={homeStyle.investment}>
            {fund.name}
            <div className={homeStyle.option}>
              <InvestVsMarket
                invest={(amount * fund.percentage) / 100}
                market={0}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
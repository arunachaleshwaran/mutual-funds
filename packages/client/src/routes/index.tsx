import InvestVsMarket from '../components/InvestVsMarket';
import { createFileRoute } from '@tanstack/react-router';
import type strategies from '../strategies';
import style from './index.module.scss';
export const Route = createFileRoute('/')({
  component: Comp,
});

function Comp() {
  type Strategy = (typeof strategies)[number];
  const investments: Array<{
    name: Strategy['name'];
    amount: number;
  }> = [
    {
      name: 'Arbitrage Strategy',
      amount: 50,
    },
    {
      name: 'Balanced Strategy',
      amount: 49,
    },
  ];
  // Show all the form
  return (
    <div className={style.home}>
      <button type='button'>Transact</button>
      <div className={style.investments}>
        {investments.map(i => (
          <div
            key={`${i.name}${i.amount}`}
            className={style.investment}>
            {i.name}
            <div className={style.option}>
              <InvestVsMarket invest={i.amount} market={0} />
              <button type='button'>See Holdings</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

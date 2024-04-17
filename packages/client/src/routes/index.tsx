import { Link, createFileRoute } from '@tanstack/react-router';
import InvestVsMarket from '../components/InvestVsMarket';
import style from './index.module.scss';
import { useFundStore } from '../Store';
export const Route = createFileRoute('/')({
  component: Comp,
});

function Comp() {
  const storedInvestment = useFundStore(store => store.investments);
  return (
    <div className={style.home}>
      <Link to='/transact'>Transact</Link>
      <div className={style.investments}>
        {storedInvestment.map(i => (
          <div key={i.paymentID} className={style.investment}>
            {i.strategy}
            <div className={style.option}>
              <InvestVsMarket ids={i.orderIDs} />
              <Link search={{ order: i }} to='/holding'>
                See Holdings
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

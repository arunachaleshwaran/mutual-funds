import type { MarketValue, Order } from '@mutual-fund/shared';
import axios from 'axios';
import style from './InvestVsMarket.module.scss';
import { useQueries } from '@tanstack/react-query';
export default function InvestVsMarket({
  ids,
}: {
  readonly ids: Array<Order['id']>;
}) {
  const marketQueries = useQueries({
    queries: ids.map(id => ({
      queryKey: ['market-value', id],
      queryFn: async () => {
        const { data: order } = await axios.get<Order>(
          `http://localhost:8081/order/${id}`
        );
        const { data: marketValue } = await axios.get<MarketValue>(
          `http://localhost:8081/market-value/${order.fund}`
        );
        return {
          invest: order.amount,
          market: marketValue.marketValue * order.units,
        };
      },
    })),
  });
  const isLoading = marketQueries.some(i => i.isLoading);
  const INITIAL_AMOUNT = 0;
  const invest = isLoading
    ? INITIAL_AMOUNT
    : marketQueries.reduce(
        (acc, i) => acc + i.data!.invest,
        INITIAL_AMOUNT
      );
  const market = isLoading
    ? INITIAL_AMOUNT
    : marketQueries.reduce(
        (acc, i) => acc + i.data!.market,
        INITIAL_AMOUNT
      );
  return (
    <>
      <span className={style.tile}>
        <div className={style.title}>Invested Amount</div>
        <div className={`${style.amount} ${style.up}`}>
          {isLoading ? '...' : `Rs.${Math.round(invest)}`}
        </div>
      </span>
      <span className={style.tile}>
        <div className={style.title}>Market Value</div>
        <div
          className={`${style.amount} ${invest < market ? style.up : style.down}`}>
          {isLoading ? '...' : `Rs.${Math.round(market)}`}
        </div>
      </span>
    </>
  );
}

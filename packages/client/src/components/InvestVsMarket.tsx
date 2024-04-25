import type { Order } from '@mutual-fund/shared';
import axios from 'axios';
import style from './InvestVsMarket.module.scss';
import { useQuery } from '@tanstack/react-query';
/**
 * Shows investment and market value
 */
export default function InvestVsMarket({
  ids,
}: {
  readonly ids: Array<Order['id']>;
}) {
  const { status, data } = useQuery({
    queryKey: ['market-value', ...ids],
    gcTime: 30000,
    staleTime: 20000,
    refetchInterval: 30000,
    queryFn: async () => {
      const { data: marketValue } = await axios.get<{
        invest: number;
        market: number;
      }>(`http://localhost:4000/market-value/`, {
        params: { orderIds: ids },
      });
      return marketValue;
    },
  });
  return (
    <>
      <span className={style.tile}>
        <div className={style.title}>Invested Amount</div>
        <div className={`${style.amount} ${style.up}`}>
          {status === 'success' ? `Rs.${data.invest}` : '...'}
        </div>
      </span>
      <span className={style.tile}>
        <div className={style.title}>Market Value</div>
        {status === 'success' ? (
          <div
            className={`${style.amount} ${
              data.invest < data.market ? style.up : style.down
            }`}>
            Rs.{data.market}
          </div>
        ) : (
          <div className={style.amount}>...</div>
        )}
      </span>
    </>
  );
}

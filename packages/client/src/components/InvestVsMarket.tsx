import style from './InvestVsMarket.module.css';
export default function InvestVsMarket({
  invest,
  market,
}: {
  readonly invest: number;
  readonly market: number;
}) {
  return (
    <>
      <span className={style.tile}>
        <div className={style.title}>Invested Amount</div>
        <div className={`${style.amount} ${style.up}`}>
          Rs.{invest}
        </div>
      </span>
      <span className={style.tile}>
        <div className={style.title}>Market Value</div>
        <div className={`${style.amount} ${style.down}`}>
          Rs.{market}
        </div>
      </span>
    </>
  );
}

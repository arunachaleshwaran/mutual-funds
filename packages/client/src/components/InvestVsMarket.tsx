import style from './InvestVsMarket.module.scss';
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
        <div
          className={`${style.amount} ${invest < market ? style.up : style.down}`}>
          Rs.{market}
        </div>
      </span>
    </>
  );
}

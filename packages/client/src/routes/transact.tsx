import { Link, createFileRoute } from '@tanstack/react-router';
import type { FormEventHandler } from 'react';
import type { Strategy } from '../strategies';
import axios from 'axios';
import strategies from '../strategies';
import style from './transact.module.scss';
import { useState } from 'react';
export const Route = createFileRoute('/transact')({
  component: Comp,
});
function Comp() {
  const [allFunds, setAllFunds] = useState<Array<{
    name: Strategy['funds'][number]['name'];
    amount: number;
  }> | null>(null);
  const updateFunds: FormEventHandler<HTMLFormElement> = event => {
    const form = new FormData(
      (event.target as HTMLFormElement).form as HTMLFormElement
    );
    const currStrategy = strategies.find(
      i => i.name === form.get('strategy')
    );
    if (!currStrategy) return;
    const amount = Number(form.get('amount')) || 0;
    const PERCENTAGE = 100;
    setAllFunds(
      currStrategy.funds.map(fund => {
        return {
          name: fund.name,
          amount: (amount * fund.percentage) / PERCENTAGE,
        };
      })
    );
  };
  return (
    <div className={style.transact}>
      <Link to='/' />
      <form onChange={updateFunds}>
        <input
          min={0}
          name='amount'
          pattern='\d+'
          placeholder='Amount'
          type='number'
          required
        />
        <select defaultValue='' name='strategy' required>
          <option value='' disabled hidden>
            Choose Strategy
          </option>
          {strategies.map(strategy => (
            <option key={strategy.name}>{strategy.name}</option>
          ))}
        </select>
        <div className={style.amountSplit}>
          {allFunds ? (
            <>
              {allFunds.map(fund => (
                <div key={fund.name}>
                  {fund.name}
                  <div className={style.amount}>{fund.amount}</div>
                </div>
              ))}
            </>
          ) : null}
        </div>
        <input type='submit' value='Invest' />
      </form>
    </div>
  );
}

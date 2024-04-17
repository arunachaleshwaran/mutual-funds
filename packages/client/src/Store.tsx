import type { Order } from './model';
import type { Strategy } from './strategies';
import { create } from 'zustand';

export type AuthStore = {
  authenticated: string;
  setAuthenticated: (authenticated: string) => void;
};
export const useAuthStore = create<AuthStore>()(set => ({
  authenticated: '123456789',
  setAuthenticated: authenticated => set(() => ({ authenticated })),
}));

export type FundStore = {
  investments: Array<{
    paymentID: Order['paymentID'];
    orderIDs: Array<Order['id']>;
    strategy: Strategy['name'];
  }>;
  addOrder: (
    orders: Array<Order>,
    strategy: FundStore['investments'][number]['strategy']
  ) => void;
};
export const useFundStore = create<FundStore>()(set => ({
  investments: JSON.parse(
    sessionStorage.getItem('investments') ?? '[]'
  ) as FundStore['investments'],
  addOrder: (orders, strategy) => {
    const newInvestment: FundStore['investments'][number] = {
      paymentID: orders[0].paymentID,
      orderIDs: [],
      strategy,
    };
    for (const order of orders) newInvestment.orderIDs.push(order.id);
    set(state => {
      const investments = [newInvestment, ...state.investments];
      sessionStorage.setItem(
        'investments',
        JSON.stringify(investments)
      );
      return {
        investments,
      };
    });
  },
}));

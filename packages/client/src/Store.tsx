import type { Order } from '@mutual-fund/shared';
import type { Strategy } from '@mutual-fund/shared/strategies';
import { create } from 'zustand';

export type AuthStore = {
  authenticated: string;
  setAuthenticated: (authenticated: string) => void;
};
export const useAuthStore = create<AuthStore>()(set => ({
  authenticated: sessionStorage.getItem('phone') ?? '',
  setAuthenticated: authenticated => {
    sessionStorage.setItem('phone', authenticated);
    set(() => ({ authenticated }));
  },
}));

export type FundStore = {
  investments: Array<{
    paymentID: Order['paymentID'];
    orderIDs: Array<Order['id']>;
    strategy: Strategy['name'];
  }>;
};
export const useFundStore = create<FundStore>()(set => ({
  investments: JSON.parse(
    sessionStorage.getItem('investments') ?? '[]'
  ) as FundStore['investments'],
}));

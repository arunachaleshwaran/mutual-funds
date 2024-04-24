import type { Order, Schema } from '@mutual-fund/shared';
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
export type OrderResponse = Omit<
  Schema['order'],
  'paymentId' | 'phoneNumber'
> &
  Pick<Order, 'fund'>;
export type FundStore = {
  strategyVsOrders: Readonly<
    Partial<Record<Strategy['name'], Array<OrderResponse>>>
  >;
  setStrategyVsOrders: (orders: Array<OrderResponse>) => void;
};
export const useFundStore = create<FundStore>()(set => ({
  strategyVsOrders: {},
  setStrategyVsOrders: orders => {
    set(() => ({
      strategyVsOrders: Object.groupBy(
        orders,
        ({ strategy }) => strategy
      ),
    }));
  },
}));

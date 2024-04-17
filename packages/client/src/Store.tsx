import { create } from 'zustand';

export type AuthStore = {
  authenticated: string;
  setAuthenticated: (authenticated: string) => void;
};
export const useAuthStore = create<AuthStore>()(set => ({
  authenticated: '',
  setAuthenticated: authenticated => set(() => ({ authenticated })),
}));

export type FundStore = {
  funds: Array<{
    name: string;
    percentage: number;
  }>;
  addFunds: (funds: FundStore['funds']) => void;
};
export const useFundStore = create<FundStore>()(set => ({
  funds: [],
  addFunds: funds => set(() => ({ funds })),
}));

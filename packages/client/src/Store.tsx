import { create } from 'zustand';

export type Store = {
  authenticated: boolean;
  setAuthenticated: (authenticated: boolean) => void;
};
const useAuthStore = create<Store>()(set => ({
  authenticated: false,
  setAuthenticated: authenticated => set(() => ({ authenticated })),
}));
export default useAuthStore;

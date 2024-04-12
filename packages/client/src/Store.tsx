import { create } from 'zustand';

export type Store = {
  authenticated: string;
  setAuthenticated: (authenticated: string) => void;
};
const useAuthStore = create<Store>()(set => ({
  authenticated: '',
  setAuthenticated: authenticated => set(() => ({ authenticated })),
}));
export default useAuthStore;

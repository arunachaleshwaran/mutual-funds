import { create } from 'zustand';

export type Store = {};
const useStore = create<Store>()(() => ({}));
export default useStore;

import { create } from 'zustand';
interface UiState { domain: string; type: string; setDomain(value: string): void; setType(value: string): void; clear(): void }
export const useUiStore = create<UiState>((set) => ({ domain: '', type: '', setDomain: (domain) => set({ domain }), setType: (type) => set({ type }), clear: () => set({ domain: '', type: '' }) }));

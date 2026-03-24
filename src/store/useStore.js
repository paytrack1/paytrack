import { create } from 'zustand';

/**
 * GLOBAL STORE (Zustand)
 * Manages the UI state that needs to be accessed across different pages.
 */
export const useStore = create((set) => ({
  // 1. Navigation State
  activeTab: 'home', // Default starting screen
  setActiveTab: (tab) => set({ activeTab: tab }),

  // 2. Sale Process State
  isSaleModalOpen: false,
  setSaleModal: (isOpen) => set({ isSaleModalOpen: isOpen }),

  // 3. Sync Status (UI only)
  lastSyncedAt: null,
  setLastSynced: (timestamp) => set({ lastSyncedAt: timestamp }),

  // 4. Global Refresh Trigger
  // Incrementing this forces the Home page to re-pull from Dexie
  refreshId: 0,
  triggerRefresh: () => set((state) => ({ refreshId: state.refreshId + 1 })),
}));
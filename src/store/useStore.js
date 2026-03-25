import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../db/dexie';

export const useStore = create(
  persist(
    (set, get) => ({

      isAuthenticated: false,
      user: null,

      login: (email, businessName, password) => {
        set({
          isAuthenticated: true,
          user: { email, businessName, password, id: `user-${Date.now()}` },
        });
        get().init();
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          sales: [],
          transactions: [],
          activeTab: 'home',
          isSaleModalOpen: false,
        });
      },

      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),

      isSaleModalOpen: false,
      setSaleModal: (val) => set({ isSaleModalOpen: val }),

      sales: [],
      transactions: [],

      init: async () => {
        try {
          const savedSales = await db.sales.orderBy('createdAt').reverse().toArray();
          set({ sales: savedSales, transactions: savedSales });
        } catch (err) {
          console.error('Failed to load sales from DB:', err);
        }
      },

      addSale: async (newSale) => {
        const sale = {
          ...newSale,
          id: `sale-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: new Date().toISOString(),
          synced: 0,
          verified: false,
          provider: null,
        };

        try {
          await db.sales.add(sale);
          set((state) => ({
            sales: [sale, ...state.sales],
            transactions: [sale, ...state.sales],
          }));
          if (navigator.onLine) {
            get().syncSale(sale);
          }
        } catch (err) {
          console.error('Failed to save sale:', err);
          throw err;
        }
      },

      syncSale: async (sale) => {
        try {
          const response = await fetch('https://paytrack-lite-backend.onrender.com/api/sales/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sales: [sale] }),
          });
          if (response.ok) {
            const results = await response.json();
            results.forEach((res) => {
              get().setVerificationStatus(res.id, res.verified, res.provider);
            });
          }
        } catch (err) {
          console.warn('Sync failed, will retry later:', err);
        }
      },

      syncPending: async () => {
        const { sales, syncSale } = get();
        const pending = sales.filter((s) => s.status === 'completed' && s.synced === 0);
        if (pending.length === 0) return;
        for (const sale of pending) {
          await syncSale(sale);
        }
      },

      setVerificationStatus: async (id, verified, provider) => {
        try {
          await db.sales.update(id, { synced: 1, verified, provider });
          set((state) => ({
            sales: state.sales.map((s) =>
              s.id === id ? { ...s, synced: 1, verified, provider } : s
            ),
            transactions: state.transactions.map((s) =>
              s.id === id ? { ...s, synced: 1, verified, provider } : s
            ),
          }));
        } catch (err) {
          console.error('Failed to update verification:', err);
        }
      },

    }),
    {
      name: 'paytrack-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

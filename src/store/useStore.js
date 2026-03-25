import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../db/dexie';

export const useStore = create(
  persist(
    (set, get) => ({

      // ─── AUTH STATE ───────────────────────────────────
      isAuthenticated: false,
      user: null,

      login: (email, businessName, password) => {
        set({
          isAuthenticated: true,
          user: { email, businessName, password, id: `user-${Date.now()}` },
        });
        // Load sales from IndexedDB after login
        get().init();
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          sales: [],
          activeTab: 'home',
          isSaleModalOpen: false,
        });
      },

      // ─── NAVIGATION STATE ─────────────────────────────
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),

      isSaleModalOpen: false,
      setSaleModal: (val) => set({ isSaleModalOpen: val }),

      // ─── SALES / TRANSACTIONS STATE ───────────────────
      // "sales" and "transactions" both point to same data
      // Reports.jsx uses "transactions", Home.jsx uses "sales"
      sales: [],
      get transactions() {
        return get().sales;
      },

      // ─── INIT: Load sales from IndexedDB on app start ─
      init: async () => {
        try {
          const savedSales = await db.sales.orderBy('createdAt').reverse().toArray();
          set({ sales: savedSales });
        } catch (err) {
          console.error('Failed to load sales from DB:', err);
        }
      },

      // ─── ADD SALE: Save to IndexedDB + update state ───
      addSale: async (newSale) => {
        const sale = {
          ...newSale,
          id: `sale-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: new Date().toISOString(),
          synced: 0,       // 0 = pending, 1 = synced
          verified: false, // becomes true after Interswitch check
          provider: null,
        };

        try {
          // 1. Save to IndexedDB first (works offline)
          await db.sales.add(sale);

          // 2. Update Zustand state so UI refreshes instantly
          set((state) => ({ sales: [sale, ...state.sales] }));

          // 3. If online, try to sync immediately
          if (navigator.onLine) {
            get().syncSale(sale);
          }
        } catch (err) {
          console.error('Failed to save sale:', err);
          throw err;
        }
      },

      // ─── SYNC SINGLE SALE to backend ─────────────────
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
          // Offline or server down — sale stays as pending, will sync later
          console.warn('Sync failed, will retry later:', err);
        }
      },

      // ─── SYNC ALL PENDING SALES (called every 30s) ────
      syncPending: async () => {
        const { sales, syncSale } = get();
        const pending = sales.filter((s) => s.status === 'completed' && s.synced === 0);
        if (pending.length === 0) return;
        for (const sale of pending) {
          await syncSale(sale);
        }
      },

      // ─── UPDATE VERIFICATION STATUS after sync ────────
      setVerificationStatus: async (id, verified, provider) => {
        try {
          // Update in IndexedDB
          await db.sales.update(id, { synced: 1, verified, provider });

          // Update in Zustand state
          set((state) => ({
            sales: state.sales.map((s) =>
              s.id === id ? { ...s, synced: 1, verified, provider } : s
            ),
          }));
        } catch (err) {
          console.error('Failed to update verification:', err);
        }
      },

    }),
    {
      name: 'paytrack-auth', // only persist auth, not sales (sales come from IndexedDB)
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
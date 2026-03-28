import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../db/dexie';

const BACKEND_URL = 'https://paytrack-lite-backend.onrender.com';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export const useStore = create(
  persist(
    (set, get) => ({

      isAuthenticated: false,
      user: null,

      login: (email, businessName, password) => {
        const allUsers = JSON.parse(localStorage.getItem('paytrack-users') || '{}');
        if (allUsers[email.toLowerCase()]) {
          if (allUsers[email.toLowerCase()].password !== password) {
            throw new Error('Incorrect PIN.');
          }
        } else {
          allUsers[email.toLowerCase()] = {
            email,
            businessName,
            password,
            id: `user-${Date.now()}`,
            profileImage: null,
          };
          localStorage.setItem('paytrack-users', JSON.stringify(allUsers));
        }
        const user = allUsers[email.toLowerCase()];
        set({ isAuthenticated: true, user });
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

      setProfileImage: (imageBase64) => {
        set((state) => ({
          user: { ...state.user, profileImage: imageBase64 },
        }));
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
          status: 'pending',
          provider: null,
        };
        try {
          await db.sales.add(sale);
          set((state) => ({
            sales: [sale, ...state.sales],
            transactions: [sale, ...state.transactions], // ✅ fixed: was state.sales
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
        if (!navigator.onLine) return;
        try {
          const response = await fetch(`${BACKEND_URL}/api/sales/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(API_KEY && { 'x-api-key': API_KEY }),
            },
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
        if (!navigator.onLine) return;
        const { sales, syncSale } = get();
        const pending = sales.filter((s) => s.synced === 0 && s.paymentMethod !== 'cash');
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
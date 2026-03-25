import { useStore } from '../store/useStore';

export const syncService = {
  performSync: async () => {
    const { syncPending } = useStore.getState();
    await syncPending();
  }
};

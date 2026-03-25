import { useStore } from '../store/useStore';

export const syncService = {
  performSync: async () => {
    const { transactions, setVerificationStatus } = useStore.getState();

    // RULE: Sync only completed sales that haven't been synced yet
    const pendingSales = transactions.filter(
      (s) => s.status === 'completed' && s.synced === 0
    );

    if (pendingSales.length === 0) return;

    try {
      // POST /api/sales/sync as per Master Prompt
      const response = await fetch('/api/sales/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sales: pendingSales }),
      });

      if (response.ok) {
        const results = await response.json(); 
        // Backend returns: [{ id: 1, verified: true, provider: "interswitch" }]
        results.forEach(res => {
          setVerificationStatus(res.id, res.verified, res.provider);
        });
      }
    } catch (error) {
      console.error("Cloud Sync Failed:", error);
    }
  }
};
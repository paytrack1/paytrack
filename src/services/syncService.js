import { db } from '../db/dexie';

/**
 * SYNC SERVICE
 * Responsibilities:
 * 1. Find all local sales marked 'synced: 0'
 * 2. Send them to the Mock API
 * 3. Update local DB to 'synced: 1' on success
 */
export const syncService = {
  isSyncing: false,

  async performSync() {
    // Prevent multiple sync loops running at once
    if (this.isSyncing) return;
    
    const pendingSales = await db.sales.where('synced').equals(0).toArray();
    
    if (pendingSales.length === 0) {
      console.log("✅ All sales are up to date.");
      return;
    }

    this.isSyncing = true;
    console.log(`📡 Attempting to sync ${pendingSales.length} sales...`);

    for (const sale of pendingSales) {
      try {
        // MOCK API CALL - This is where your backend dev's URL goes later
        const response = await fetch('https://api.mock-paytrack.com/v1/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sale)
        });

        // If server accepts it (200 or 201) or if it's a duplicate (409)
        if (response.ok || response.status === 409) {
          await db.sales.update(sale.id, { synced: 1 });
          console.log(`✔ Sale ${sale.id} synced successfully.`);
        }
      } catch (error) {
        console.error(`❌ Sync failed for ${sale.id}. Will retry when connection stabilizes.`);
        // Stop the loop if there's a network error to save battery/data
        break; 
      }
    }

    this.isSyncing = false;
  }
};
import Dexie from 'dexie';

// Initialize the Database
export const db = new Dexie('PayTrackLiteDB');

/**
 * SCHEMA DEFINITION
 * sales: 
 * - id: Primary Key (UUID)
 * - total: Total amount of the sale
 * - items: Array of objects [{name, qty, price}]
 * - synced: 0 for Pending, 1 for Success
 * - createdAt: Timestamp for history sorting
 */
db.version(1).stores({
  sales: 'id, total, synced, createdAt' 
});

// Helper to get summary of today's sales
export const getTodayStats = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todaySales = await db.sales
    .where('createdAt')
    .above(startOfDay.toISOString())
    .toArray();

  const totalRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const txCount = todaySales.length;

  return { totalRevenue, txCount };
};

export default db;
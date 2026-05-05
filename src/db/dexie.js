import Dexie from 'dexie';

export const db = new Dexie('FloworaDB');

db.version(1).stores({
  sales: 'id, total, synced, createdAt'
});

db.version(2).stores({
  sales: 'id, total, synced, createdAt',
  expenses: 'id, amount, category, createdAt, synced'
});

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

export const getTodayExpenses = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayExpenses = await db.expenses
    .where('createdAt')
    .above(startOfDay.toISOString())
    .toArray();
  return todayExpenses.reduce((sum, e) => sum + e.amount, 0);
};

export default db;

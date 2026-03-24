import React, { useEffect, useState } from 'react';
import { db } from '../db/dexie';
import { useOnline } from '../hooks/useOnline';
import RevenueCard from '../components/RevenueCard';
import TransactionItem from '../components/TransactionItem';

const Home = ({ onNavigateToSale }) => {
  const isOnline = useOnline();
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({ total: 0, count: 0 });

  // Load data from Dexie
  useEffect(() => {
    const loadDashboardData = async () => {
      const allSales = await db.sales.orderBy('createdAt').reverse().toArray();
      const totalRevenue = allSales.reduce((sum, s) => sum + s.total, 0);
      
      setSales(allSales);
      setStats({ total: totalRevenue, count: allSales.length });
    };

    loadDashboardData();
    // Refresh when DB changes (Live Query logic)
    const interval = setInterval(loadDashboardData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#F5F7FA] min-h-screen pb-32">
      {/* Top Header */}
      <div className="p-6 flex justify-between items-center bg-white">
        <div>
          <p className="text-[#64748B] text-xs font-bold uppercase">Good Morning 👋</p>
          <h1 className="text-xl font-black text-[#0F172A]">Adeola Store</h1>
        </div>
        <div className="w-10 h-10 bg-[#2F5FB3] rounded-xl flex items-center justify-center text-white font-bold">AS</div>
      </div>

      {/* Hero Revenue Card */}
      <RevenueCard 
        totalAmount={stats.total} 
        txCount={stats.count} 
        isOnline={isOnline} 
      />

      {/* Transactions List */}
      <div className="px-6 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[#0F172A]">Recent Transactions</h3>
          <span className="text-[#2F5FB3] text-xs font-bold">View All</span>
        </div>
        
        {sales.length === 0 ? (
          <div className="text-center py-10 text-[#94A3B8] text-sm italic">
            No sales recorded yet.
          </div>
        ) : (
          sales.map(sale => (
            <TransactionItem 
              key={sale.id}
              name={sale.items[0]?.name || "General Sale"}
              itemsCount={sale.items.length}
              amount={sale.total}
              time={new Date(sale.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              synced={sale.synced === 1}
            />
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 left-0 right-0 px-6">
        <button 
          onClick={onNavigateToSale}
          className="w-full bg-[#2F5FB3] text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
        >
          + New Sale
        </button>
      </div>
    </div>
  );
};

export default Home;
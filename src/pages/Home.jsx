import React from 'react';
import { ShoppingBag, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';

const Home = () => {
  const { sales } = useStore();

  const totalRevenue = sales.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const todaySales = sales.filter((s) => {
    const today = new Date().toDateString();
    return new Date(s.createdAt).toDateString() === today;
  });
  const netProfit = totalRevenue * 0.3; // placeholder until backend provides margin

  return (
    <div className="space-y-6">

      {/* REVENUE CARD */}
      <div className="bg-[#1B4F9B] rounded-[2rem] p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -right-4 -bottom-8 w-28 h-28 bg-white/5 rounded-full" />

        <div className="flex justify-between items-start mb-6 relative z-10">
          <p className="text-blue-200 text-xs font-black uppercase tracking-widest">
            Today's Revenue
          </p>
          <span className="bg-green-400/20 text-green-300 text-[10px] font-black px-3 py-1 rounded-full">
            ● Synced
          </span>
        </div>

        <h2 className="text-4xl font-black tracking-tight relative z-10">
          ₦{totalRevenue.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>

        <div className="flex gap-8 mt-6 pt-4 border-t border-white/10 relative z-10">
          <div>
            <p className="text-blue-300 text-[10px] font-bold uppercase">Transactions</p>
            <p className="text-white font-black text-lg">{todaySales.length}</p>
          </div>
          <div>
            <p className="text-blue-300 text-[10px] font-bold uppercase">Net Profit</p>
            <p className="text-green-300 font-black text-lg">₦{netProfit.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-[#0F172A] text-lg">Recent Transactions</h3>
          <button className="text-[#2F5FB3] text-xs font-black uppercase tracking-wide">
            View All
          </button>
        </div>

        {sales.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <ShoppingBag className="mx-auto mb-2" size={48} />
            <p className="font-bold italic">No sales recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sales.slice(0, 10).map((sale) => (
              <div
                key={sale.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-center gap-3 shadow-sm"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={18} className="text-slate-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[#0F172A] font-bold text-sm truncate">
                    {sale.itemName || 'General Sale'}
                  </p>
                  <p className="text-[#94A3B8] text-xs font-medium mt-0.5">
                    {sale.paymentMethod} · {sale.time}
                  </p>
                </div>

                {/* Amount + Status */}
                <div className="text-right flex-shrink-0">
                  <p className="text-[#0F172A] font-black text-sm mb-1">
                    ₦{sale.total?.toLocaleString()}
                  </p>
                  {sale.synced === 1 ? (
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                      Synced
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
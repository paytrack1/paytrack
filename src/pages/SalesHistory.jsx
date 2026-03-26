import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { TrendingUp, ShoppingBag } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SalesHistory = () => {
  const { sales } = useStore();

  const chartData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - (6 - i));
      const dayStr = date.toDateString();
      const daySales = sales.filter(
        (s) => new Date(s.createdAt).toDateString() === dayStr
      );
      return {
        day: DAYS[date.getDay()],
        total: daySales.reduce((sum, s) => sum + (s.total || 0), 0),
        count: daySales.length,
        isToday: i === 6,
      };
    });
  }, [sales]);

  const maxTotal = Math.max(...chartData.map((d) => d.total), 1);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#0F172A]">Sales History</h2>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Last 7 Days</p>
        <div className="flex items-end justify-between gap-2 h-40">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              {d.total > 0 && (
                <p className="text-[9px] font-black text-slate-400 text-center">
                  {d.total >= 1000 ? `${(d.total / 1000).toFixed(0)}k` : d.total}
                </p>
              )}
              <div className="w-full flex items-end" style={{ height: '100px' }}>
                <div
                  className={`w-full rounded-xl transition-all ${
                    d.isToday ? 'bg-[#2F5FB3]' : d.total > 0 ? 'bg-[#93C5FD]' : 'bg-slate-100'
                  }`}
                  style={{ height: d.total > 0 ? `${Math.max((d.total / maxTotal) * 100, 8)}%` : '8%' }}
                />
              </div>
              <p className={`text-[10px] font-black ${d.isToday ? 'text-[#2F5FB3]' : 'text-slate-400'}`}>
                {d.isToday ? 'Today' : d.day}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase">Total</p>
          <p className="text-xl font-black text-[#0F172A]">{sales.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase">Verified</p>
          <p className="text-xl font-black text-green-600">{sales.filter((s) => s.verified).length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase">Pending</p>
          <p className="text-xl font-black text-amber-500">{sales.filter((s) => !s.verified).length}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">All Transactions</p>
        {sales.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <ShoppingBag className="mx-auto mb-2" size={48} />
            <p className="font-bold italic">No sales recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sales.map((sale) => (
              <div key={sale.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={18} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0F172A] font-bold text-sm truncate">{sale.itemName || 'General Sale'}</p>
                  <p className="text-[#94A3B8] text-xs font-medium mt-0.5">
                    {sale.paymentMethod} · {sale.time} · {new Date(sale.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[#0F172A] font-black text-sm mb-1">
                    ₦{sale.total?.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </p>
                  {sale.verified ? (
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">Verified</span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">Pending</span>
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

export default SalesHistory;

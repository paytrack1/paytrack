import React from 'react';

const RevenueCard = ({ totalAmount = 0, txCount = 0, netProfit = 0, isOnline = false }) => {
  return (
    <div className="mx-6 mt-6 rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #185FA5 0%, #0C447C 100%)' }}>
      {/* Decorative circles */}
      <div style={{ position: 'relative', padding: '1.5rem', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute', top: -24, right: -24,
            width: 120, height: 120, borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
          }}
        />
        <div
          style={{
            position: 'absolute', bottom: -32, right: 40,
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />

        {/* Top row */}
        <div className="flex items-center justify-between mb-3 relative">
          <p className="text-blue-200 text-[11px] font-semibold uppercase tracking-widest">
            Today's Revenue
          </p>
          <span
            className="text-[11px] font-semibold px-3 py-1 rounded-full"
            style={{
              background: isOnline ? 'rgba(29,158,117,0.25)' : 'rgba(255,255,255,0.12)',
              color: isOnline ? '#9FE1CB' : 'rgba(255,255,255,0.6)',
              border: `1px solid ${isOnline ? 'rgba(95,218,176,0.3)' : 'rgba(255,255,255,0.15)'}`,
            }}
          >
            {isOnline ? '● Synced' : '○ Offline'}
          </span>
        </div>

        {/* Revenue amount */}
        <p className="text-white font-black text-4xl tracking-tight mb-5 relative">
          ₦{totalAmount.toLocaleString()}
        </p>

        {/* Stats row */}
        <div className="border-t border-white/10 pt-4 flex gap-8 relative">
          <div>
            <p className="text-white/50 text-[10px] uppercase tracking-widest font-semibold mb-1">
              Transactions
            </p>
            <p className="text-white font-black text-xl">{txCount}</p>
          </div>
          <div>
            <p className="text-white/50 text-[10px] uppercase tracking-widest font-semibold mb-1">
              Net Profit
            </p>
            <p className="font-black text-xl" style={{ color: '#9FE1CB' }}>
              ₦{Math.round(netProfit).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueCard;
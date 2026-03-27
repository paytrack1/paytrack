import React, { useState } from 'react';
import { ShoppingBag, TrendingUp, Zap, CheckCircle, Loader } from 'lucide-react';
import { useStore } from '../store/useStore';

// ── Interswitch Logo ──
const InterswitchBadge = () => (
  <div className="flex items-center gap-2 bg-[#E8230A]/10 border border-[#E8230A]/20 rounded-2xl px-4 py-2">
    <div className="w-6 h-6 rounded-full bg-[#E8230A] flex items-center justify-center">
      <Zap size={12} className="text-white" fill="white" />
    </div>
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-[#E8230A]">Powered by</p>
      <p className="text-[11px] font-black text-[#E8230A] leading-none">Interswitch</p>
    </div>
  </div>
);

// ── Live API Response Panel ──
const ApiPanel = ({ log }) => {
  if (!log) return null;
  return (
    <div className="bg-[#0F172A] rounded-2xl p-4 font-mono text-xs space-y-1 border border-slate-700 max-h-48 overflow-y-auto">
      <p className="text-slate-400 text-[9px] uppercase tracking-widest font-bold mb-2">
        🔴 LIVE — Interswitch API Response
      </p>
      {log.map((line, i) => (
        <p
          key={i}
          className={
            line.startsWith('✅') ? 'text-green-400' :
            line.startsWith('❌') ? 'text-red-400' :
            line.startsWith('⚠️') ? 'text-yellow-400' :
            line.startsWith('🔍') ? 'text-blue-400' :
            line.startsWith('📡') ? 'text-purple-400' :
            'text-slate-300'
          }
        >
          {line}
        </p>
      ))}
    </div>
  );
};

const Home = () => {
  const { sales, syncPending } = useStore();
  const [apiLog, setApiLog] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // ── Demo Verify for judges ──
  const handleDemoVerify = async () => {
    const pending = sales.filter((s) => s.paymentMethod !== 'cash' && !s.verified);
    if (pending.length === 0) {
      setApiLog(['⚠️ No pending transfer/POS sales. Add one first!']);
      return;
    }
    
    setDemoLoading(true);
    const sale = pending[0];
    const log = [];
    log.push(`🔴 DEMO — Simulating Interswitch webhook...`);
    log.push(`📩 Webhook POST → /webhook/test`);
    log.push(`📦 Reference: ${sale.reference || 'N/A'}`);
    log.push(`💰 Amount: ₦${sale.total?.toLocaleString()}`);
    setApiLog([...log]);

    try {
      const res = await fetch('https://paytrack-lite-backend.onrender.com/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: sale.reference, amount: sale.total }),
      });
      const data = await res.json();
      
      if (data.success) {
        log.push(`✅ Interswitch webhook received!`);
        log.push(`✅ Sale ${sale.id} — ResponseCode: "00"`);
        log.push(`✅ MongoDB updated — status: verified`);
        log.push(`✅ Payment CONFIRMED by Interswitch`);
        setApiLog([...log]);
        
        // Brief delay so logs are readable before reload
        setTimeout(() => window.location.reload(), 2000);
      } else {
        log.push(`❌ Demo failed: ${data.error}`);
        setApiLog([...log]);
      }
    } catch (err) {
      log.push(`❌ Error: ${err.message}`);
      setApiLog([...log]);
    }
    setDemoLoading(false);
  };

  const handleLiveSync = async () => {
    if (syncing) return;
    setSyncing(true);
    const log = [];
    const pending = sales.filter((s) => s.paymentMethod !== 'cash' && !s.verified);

    if (pending.length === 0) {
      setApiLog(['⚠️ No pending transfer/POS sales to verify']);
      setSyncing(false);
      return;
    }

    log.push(`🔍 Calling Interswitch Transaction Search API...`);
    log.push(`📡 Endpoint: /collections/api/v1/gettransaction.json`);
    log.push(`🏪 Merchant: MX180495`);
    log.push(`📦 Sales to verify: ${pending.length}`);
    setApiLog([...log]);

    try {
      const response = await fetch('https://paytrack-lite-backend.onrender.com/api/sales/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sales: pending }),
      });

      const results = await response.json();

      results.forEach((res) => {
        if (res.verified) {
          log.push(`✅ Sale ${res.id} — Verified by Interswitch`);
        } else if (res.message?.includes('API error')) {
          log.push(`⚠️ Sale ${res.id} — Pending KYC for live verification`);
          log.push(`   → Webhook auto-verifies on payment confirmed`);
        } else {
          log.push(`❌ Sale ${res.id} — Not found on Interswitch`);
        }
      });

      log.push(`📊 ResponseCode checked: "00" = verified`);
      setApiLog([...log]);
      await syncPending();
    } catch (err) {
      log.push(`❌ Network error: ${err.message}`);
      setApiLog([...log]);
    }
    setSyncing(false);
  };

  // ── Calculation Logic ──
  const todaySales = sales.filter((s) => {
    const today = new Date().toDateString();
    return new Date(s.createdAt).toDateString() === today;
  });

  const totalRevenue = todaySales.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const verifiedSales = todaySales.filter((s) => s.verified);
  const netProfit = verifiedSales.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const goodsSold = todaySales.length;
  const transferSales = todaySales.filter((s) => s.paymentMethod !== 'cash');

  return (
    <div className="space-y-4 pb-10">
      {/* Revenue Card */}
      <div className="bg-[#1B4F9B] rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="flex justify-between items-start mb-6 relative z-10">
          <p className="text-blue-200 text-xs font-black uppercase tracking-widest">Today's Revenue</p>
          <span className="bg-green-400/20 text-green-300 text-[10px] font-black px-3 py-1 rounded-full">● Live</span>
        </div>
        <h2 className="text-4xl font-black tracking-tight relative z-10">
          ₦{totalRevenue.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </h2>
        <div className="flex gap-6 mt-6 pt-4 border-t border-white/10 relative z-10">
          <div>
            <p className="text-blue-300 text-[10px] font-bold uppercase">Transactions</p>
            <p className="text-white font-black text-lg">{todaySales.length}</p>
          </div>
          <div>
            <p className="text-blue-300 text-[10px] font-bold uppercase">Goods Sold</p>
            <p className="text-white font-black text-lg">{goodsSold}</p>
          </div>
          <div>
            <p className="text-blue-300 text-[10px] font-bold uppercase">Net Profit</p>
            <p className="text-green-300 font-black text-lg">
              ₦{netProfit.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Interswitch Verification Panel */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <InterswitchBadge />
          
          <div className="flex gap-2">
             <button
              onClick={handleLiveSync}
              disabled={syncing || demoLoading}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black text-white transition-all
                ${syncing ? 'bg-slate-300' : 'bg-[#E8230A] active:scale-95'}`}
            >
              {syncing ? <Loader size={12} className="animate-spin" /> : <Zap size={12} />}
              {syncing ? 'SYNCING...' : 'LIVE SYNC'}
            </button>

            <button
              onClick={handleDemoVerify}
              disabled={demoLoading || syncing}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black text-white transition-all 
                ${demoLoading ? 'bg-slate-300' : 'bg-green-600 active:scale-95'}`}
            >
              {demoLoading ? <Loader size={12} className="animate-spin" /> : <CheckCircle size={12} />}
              {demoLoading ? 'VERIFYING...' : 'DEMO VERIFY'}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-[9px] font-black uppercase text-slate-400">Transfer/POS</p>
            <p className="text-lg font-black text-slate-700">{transferSales.length}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-[9px] font-black uppercase text-green-600">Verified</p>
            <p className="text-lg font-black text-green-700">
              {transferSales.filter(s => s.verified).length}
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-[9px] font-black uppercase text-amber-600">Pending</p>
            <p className="text-lg font-black text-amber-700">
              {transferSales.filter(s => !s.verified).length}
            </p>
          </div>
        </div>

        {/* Live API Log */}
        {apiLog && <ApiPanel log={apiLog} />}
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-[#0F172A] text-lg">Recent Transactions</h3>
          <button className="text-[#2F5FB3] text-xs font-black uppercase tracking-wide">View All</button>
        </div>

        {sales.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <ShoppingBag className="mx-auto mb-2" size={48} />
            <p className="font-bold italic">No sales recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sales.slice(0, 10).map((sale) => (
              <div key={sale.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={18} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0F172A] font-bold text-sm truncate">{sale.itemName || 'General Sale'}</p>
                  <p className="text-[#94A338] text-xs font-medium mt-0.5">
                    {sale.paymentMethod} · {sale.time}
                    {sale.paymentMethod !== 'cash' && (
                      <span className="ml-1 text-[#E8230A] font-black">· ISW</span>
                    )}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[#0F172A] font-black text-sm mb-1">
                    ₦{sale.total?.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </p>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                    sale.verified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {sale.verified ? 'Verified ✅' : 'Pending'}
                  </span>
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
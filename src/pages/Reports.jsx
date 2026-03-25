import React from 'react';
import { useStore } from '../store/useStore';
import { BarChart3, ShieldCheck, Percent, Layers } from 'lucide-react';

const Reports = () => {
  const { sales } = useStore();

  const completedSales = sales.filter((s) => s.status === 'completed');
  const totalRevenue = completedSales.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const verifiedCount = completedSales.filter((s) => s.verified).length;
  const draftCount = sales.filter((s) => s.status === 'draft').length;
  const verificationRate = completedSales.length > 0
    ? ((verifiedCount / completedSales.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#0F172A]">Business Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="w-10 h-10 bg-[#EEF2FF] text-[#2F5FB3] rounded-xl flex items-center justify-center mb-4">
            <BarChart3 size={20} />
          </div>
          <p className="text-[#64748B] text-xs font-bold uppercase">Total Revenue</p>
          <h3 className="text-2xl font-black text-[#0F172A]">₦{totalRevenue.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>

        {/* Verified Transactions */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="w-10 h-10 bg-[#DCFCE7] text-[#22C55E] rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck size={20} />
          </div>
          <p className="text-[#64748B] text-xs font-bold uppercase">Verified Transactions</p>
          <h3 className="text-2xl font-black text-[#0F172A]">
            {verifiedCount} <span className="text-sm text-[#64748B] font-medium">of {completedSales.length}</span>
          </h3>
        </div>
      </div>

      {/* Verification Rate */}
      <div className="bg-[#2F5FB3] p-6 rounded-2xl text-white flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">
            Verification Rate
          </p>
          <h3 className="text-4xl font-black">{verificationRate}%</h3>
          <p className="text-blue-200 text-[10px] mt-2 font-medium italic">
            Powered by Interswitch Sync Engine
          </p>
        </div>
        <Percent className="absolute -right-4 -bottom-4 opacity-10" size={100} />
      </div>

      {/* Draft Summary */}
      <div className="bg-white p-4 rounded-xl border border-dashed border-[#E2E8F0] flex justify-between items-center">
        <div className="flex items-center gap-3 text-[#64748B]">
          <Layers size={18} />
          <span className="text-sm font-bold">Unsaved Drafts</span>
        </div>
        <span className="font-black text-[#0F172A]">{draftCount}</span>
      </div>
    </div>
  );
};

export default Reports;
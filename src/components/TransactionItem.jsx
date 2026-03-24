import React from 'react';

const TransactionItem = ({ name, itemsCount, amount, time, synced }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl mb-3 border border-[#E2E8F0] hover:border-[#2F5FB3] transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl flex items-center justify-center text-xl">
          🛒
        </div>
        <div>
          <h4 className="text-[#0F172A] font-bold text-sm">{name || "Quick Sale"}</h4>
          <p className="text-[#64748B] text-xs">{itemsCount} items • {time}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[#0F172A] font-black text-sm">₦{amount.toLocaleString()}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
          synced ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEF3C7] text-[#B45309]'
        }`}>
          {synced ? 'Synced' : 'Pending'}
        </span>
      </div>
    </div>
  );
};

export default TransactionItem;
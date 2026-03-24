import React from 'react';

const RevenueCard = ({ totalAmount = 0, txCount = 0, isOnline = true }) => {
  return (
    <div className="px-6 py-4">
      <div className="bg-[#2F5FB3] rounded-3xl p-6 text-white shadow-lg shadow-blue-100 relative overflow-hidden">
        {/* Background Decorative Circle */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full" />
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">Today's Revenue</p>
            <h2 className="text-3xl font-black mt-1">₦{totalAmount.toLocaleString()}</h2>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
            isOnline ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400' : 'bg-orange-400 animate-pulse'}`} />
            {isOnline ? 'SYNCED' : 'OFFLINE'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
          <div>
            <p className="text-blue-200 text-[10px] uppercase">Transactions</p>
            <p className="text-lg font-bold">{txCount}</p>
          </div>
          <div>
            <p className="text-blue-200 text-[10px] uppercase">Net Profit</p>
            <p className="text-lg font-bold">₦{(totalAmount * 0.3).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueCard;
import React from 'react';

const Settings = () => {
  const settingsOptions = [
    { label: 'Store Profile', icon: '🏪', sub: 'Adeola Store, Lagos' },
    { label: 'Sync Settings', icon: '🔄', sub: 'Auto-sync is enabled' },
    { label: 'Export Data', icon: '📥', sub: 'Download CSV' },
    { label: 'Help & Support', icon: '🎧', sub: 'Chat with us' },
  ];

  return (
    <div className="bg-[#F5F7FA] min-h-screen pb-32">
      <div className="p-6 bg-white border-b border-[#E2E8F0]">
        <h1 className="text-xl font-black text-[#0F172A]">Settings</h1>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          {settingsOptions.map((opt, i) => (
            <div 
              key={i} 
              className={`p-4 flex items-center justify-between active:bg-[#F8F9FB] cursor-pointer ${
                i !== settingsOptions.length - 1 ? 'border-b border-[#F1F5F9]' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-xl">{opt.icon}</span>
                <div>
                  <p className="text-[#0F172A] font-bold text-sm">{opt.label}</p>
                  <p className="text-[#94A3B8] text-[11px] font-medium">{opt.sub}</p>
                </div>
              </div>
              <span className="text-[#CBD5E1]">→</span>
            </div>
          ))}
        </div>

        <button className="w-full mt-8 py-4 text-red-500 font-bold bg-red-50 rounded-2xl active:scale-95 transition-transform">
          Log Out
        </button>
        
        <p className="text-center mt-6 text-[#94A3B8] text-[10px] font-bold uppercase tracking-widest">
          PayTrack Lite v1.0.4
        </p>
      </div>
    </div>
  );
};

export default Settings;
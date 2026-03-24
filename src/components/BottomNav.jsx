import React from 'react';

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'sales', label: 'Sales', icon: '📊' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] px-6 py-3 pb-8 flex justify-between items-center z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="flex flex-col items-center gap-1 group"
        >
          <span className={`text-xl transition-transform group-active:scale-90 ${
            activeTab === tab.id ? 'opacity-100' : 'opacity-30 grayscale'
          }`}>
            {tab.icon}
          </span>
          <span className={`text-[10px] font-bold ${
            activeTab === tab.id ? 'text-[#2F5FB3]' : 'text-[#94A3B8]'
          }`}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default BottomNav;
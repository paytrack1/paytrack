import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { db } from '../db/dexie';

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const Settings = () => {
  const { logout, user } = useStore();
  const [exportStatus, setExportStatus] = useState('');

  const handleExportCSV = async () => {
    try {
      const sales = await db.sales.toArray();
      if (sales.length === 0) {
        setExportStatus('No sales to export yet.');
        setTimeout(() => setExportStatus(''), 3000);
        return;
      }

      const headers = ['ID', 'Item', 'Total (₦)', 'Payment', 'Status', 'Synced', 'Date'];
      const rows = sales.map((s) => [
        s.id,
        s.itemName || 'General Sale',
        s.total,
        s.paymentMethod,
        s.status,
        s.synced === 1 ? 'Yes' : 'No',
        new Date(s.createdAt).toLocaleString(),
      ]);

      const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paytrack-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus('Export successful!');
      setTimeout(() => setExportStatus(''), 3000);
    } catch (err) {
      setExportStatus('Export failed. Try again.');
      console.error(err);
    }
  };

  const settingsOptions = [
    {
      label: 'Store Profile',
      sub: `${user?.businessName || 'My Store'}`,
      iconBg: '#EEF4FF',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: 'Sync Settings',
      sub: 'Auto-sync enabled',
      iconBg: '#F0FDF4',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      ),
    },
    {
      label: 'Export Data',
      sub: 'Download as CSV',
      iconBg: '#F5F3FF',
      action: 'export',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
    {
      label: 'Help & Support',
      sub: 'Chat with us',
      iconBg: '#FFF7ED',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#0F172A]">Settings</h2>

      {/* Options */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
        {settingsOptions.map((opt, i) => (
          <button
            key={i}
            onClick={() => opt.action === 'export' && handleExportCSV()}
            className={`w-full p-4 flex items-center justify-between active:bg-[#F8F9FB] transition-colors text-left ${
              i !== settingsOptions.length - 1 ? 'border-b border-[#F1F5F9]' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: opt.iconBg }}
              >
                {opt.icon}
              </div>
              <div>
                <p className="text-[#0F172A] font-bold text-sm">{opt.label}</p>
                <p className="text-[#94A3B8] text-[11px] font-medium">{opt.sub}</p>
              </div>
            </div>
            <ChevronRight />
          </button>
        ))}
      </div>

      {/* Export feedback */}
      {exportStatus && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-green-700 text-sm font-medium text-center">{exportStatus}</p>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full py-4 text-red-500 font-bold bg-red-50 rounded-2xl border border-red-100 active:scale-95 transition-transform"
      >
        Log Out
      </button>

      <p className="text-center text-[#CBD5E1] text-[10px] font-bold uppercase tracking-widest">
        PayTrack Lite v1.0.4
      </p>
    </div>
  );
};

export default Settings;
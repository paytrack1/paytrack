import React, { useEffect, useState } from 'react';
import { db } from '../db/dexie';

const Reports = () => {
  const [reportData, setReportData] = useState({ total: 0, count: 0, avg: 0 });

  useEffect(() => {
    const calculateReports = async () => {
      const sales = await db.sales.toArray();
      const total = sales.reduce((sum, s) => sum + s.total, 0);
      const count = sales.length;
      setReportData({
        total,
        count,
        avg: count > 0 ? (total / count).toFixed(2) : 0
      });
    };
    calculateReports();
  }, []);

  return (
    <div className="bg-[#F5F7FA] min-h-screen pb-32">
      <div className="p-6 bg-white border-b border-[#E2E8F0]">
        <h1 className="text-xl font-black text-[#0F172A]">Sales Reports</h1>
      </div>

      <div className="p-6 grid grid-cols-1 gap-4">
        {/* Main Stats Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <p className="text-[#64748B] text-xs font-bold uppercase mb-4">Performance Overview</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8] text-sm font-medium">Total Revenue</span>
              <span className="text-[#0F172A] font-black text-lg">₦{reportData.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8] text-sm font-medium">Total Sales</span>
              <span className="text-[#0F172A] font-black text-lg">{reportData.count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8] text-sm font-medium">Average Sale</span>
              <span className="text-[#2F5FB3] font-black text-lg">₦{Number(reportData.avg).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Mock Chart Placeholder */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <h4 className="text-[#0F172A] font-bold mb-4">Sale Volume (₦k)</h4>
          <div className="flex items-end justify-between h-32 gap-2">
            {[40, 70, 45, 90, 65, 80, 30].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-[#EEF2FF] rounded-t-lg transition-all duration-500" 
                  style={{ height: `${height}%`, backgroundColor: i === 3 ? '#2F5FB3' : '#EEF2FF' }}
                />
                <span className="text-[10px] text-[#94A3B8] font-bold">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
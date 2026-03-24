import React, { useState, useEffect } from 'react';
// Components
import Dashboard from './components/Dashboard';
import SaleForm from './components/SaleForm';
import BottomNav from './components/Layout/BottomNav';
// Hooks & Services
import { useSalesData } from './hooks/useSalesData';
import { useOnline } from './hooks/useOnline';
import { syncService } from './services/syncService';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showSaleForm, setShowSaleForm] = useState(false);
  
  // Custom hooks for DB data and Internet status
  const { sales, totalRevenue, txCount, saveSale } = useSalesData();
  const isOnline = useOnline();

  // SYNC LOGIC: Whenever the phone goes online, trigger the sync service
  useEffect(() => {
    if (isOnline) {
      console.log("App is Online: Checking for pending syncs...");
      syncService.syncPendingSales();
    }
  }, [isOnline, sales]); // Runs when status changes or new sales are added

  // Handler to save a new sale from the Form to IndexedDB
  const handleSaveNewSale = async (saleData) => {
    const result = await saveSale(saleData);
    if (result.success) {
      setShowSaleForm(false);
      // If online, try to sync immediately
      if (isOnline) syncService.syncPendingSales();
    } else {
      alert("Error saving sale locally!");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative overflow-x-hidden shadow-2xl">
      {/* Network Status Toast (Visual proof for judges) */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-[10px] py-1 z-50 text-center font-bold">
          OFFLINE MODE — DATA SAVING LOCALLY
        </div>
      )}

      {showSaleForm ? (
        <SaleForm 
          onBack={() => setShowSaleForm(false)} 
          onSave={handleSaveNewSale} 
        />
      ) : (
        <>
          {activeTab === 'home' && (
            <Dashboard 
              onNewSale={() => setShowSaleForm(true)} 
              transactions={sales}
              totalRevenue={totalRevenue}
              txCount={txCount}
            />
          )}

          {activeTab === 'sales' && (
            <div className="p-10 text-center pt-20">
              <h2 className="font-bold text-gray-800">Sales History</h2>
              <p className="text-gray-400 text-sm mt-2">Full history coming soon...</p>
            </div>
          )}

          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </>
      )}
    </div>
  );
}

export default App;

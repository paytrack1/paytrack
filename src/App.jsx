import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { useOnline } from './hooks/useOnline';
import { syncService } from './services/syncService';

// Pages
import Home from './pages/Home';
import NewSale from './pages/NewSale';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Components
import BottomNav from './components/BottomNav';

const App = () => {
  const { activeTab, setActiveTab, isSaleModalOpen, setSaleModal } = useStore();
  const isOnline = useOnline();

  // BACKGROUND SYNC LOGIC
  // This effect runs whenever the internet connection status changes
  useEffect(() => {
    if (isOnline) {
      // Small delay to ensure connection is stable before pushing data
      const timer = setTimeout(() => {
        syncService.performSync();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  // TAB ROUTING LOGIC
  const renderPage = () => {
    // If the "New Sale" modal/page is triggered, show it regardless of tab
    if (isSaleModalOpen) {
      return <NewSale onBack={() => setSaleModal(false)} />;
    }

    switch (activeTab) {
      case 'home':
        return <Home onNavigateToSale={() => setSaleModal(true)} />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'sales':
        // Reuse Home or create a dedicated list view
        return <Home onNavigateToSale={() => setSaleModal(true)} />;
      default:
        return <Home onNavigateToSale={() => setSaleModal(true)} />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative font-sans">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-[#F59E0B] text-white text-[10px] font-bold py-1 text-center sticky top-0 z-[60] uppercase tracking-widest">
          Offline Mode • Sales will sync later
        </div>
      )}

      {/* Main Content Area */}
      <main className="pb-20">
        {renderPage()}
      </main>

      {/* Bottom Navigation (Hidden when making a new sale for focus) */}
      {!isSaleModalOpen && (
        <BottomNav 
          activeTab={activeTab} 
          onTabChange={(tab) => setActiveTab(tab)} 
        />
      )}
    </div>
  );
};

export default App;
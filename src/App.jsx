import React, { useEffect } from 'react';
import { useStore } from './store/useStore';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import NewSale from './pages/NewSale';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Components
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';

const App = () => {
  const {
    isAuthenticated,
    activeTab,
    isSaleModalOpen,
    setSaleModal,
    init,
    syncPending,
    user,
  } = useStore();

  // INITIALIZE + BACKGROUND SYNC
  useEffect(() => {
    if (isAuthenticated) {
      init();
      const syncInterval = setInterval(() => {
        if (navigator.onLine) syncPending();
      }, 30000);
      return () => clearInterval(syncInterval);
    }
  }, [isAuthenticated, init]);

  // AUTH GUARD
  if (!isAuthenticated) {
    return <Login />;
  }

  // PAGE RENDERER
  const renderContent = () => {
    if (isSaleModalOpen) {
      return <NewSale onBack={() => setSaleModal(false)} />;
    }
    switch (activeTab) {
      case 'home':     return <Home />;
      case 'reports':  return <Reports />;
      case 'settings': return <Settings />;
      case 'sales':    return (
        <div className="flex items-center justify-center h-[60vh]">
          <p className="font-black text-slate-300 uppercase tracking-widest text-sm">
            Sales History Coming Soon
          </p>
        </div>
      );
      default:         return <Home />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F0F4FF] font-sans">

      {/* DESKTOP SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-64 min-h-screen relative">

        {/* TOP HEADER - desktop only */}
        <div className="hidden lg:flex max-w-5xl mx-auto px-8 pt-12 pb-8 justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Live System
              </p>
            </div>
            <p className="text-2xl font-black text-[#0F172A] tracking-tighter">
              {user?.businessName || 'Merchant Dashboard'}
            </p>
          </div>
        </div>

        {/* MOBILE HEADER */}
        <div className="lg:hidden px-5 pt-10 pb-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Live
              </p>
            </div>
            <p className="text-xl font-black text-[#0F172A] tracking-tighter">
              {user?.businessName || 'Dashboard'}
            </p>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="px-5 lg:px-8 pb-32 lg:pb-20">
          <div className="max-w-5xl mx-auto">
            {renderContent()}
          </div>
        </div>

        {/* MOBILE FLOATING + BUTTON */}
        {!isSaleModalOpen && (
          <button
            onClick={() => setSaleModal(true)}
            className="lg:hidden fixed bottom-24 right-5 w-14 h-14 bg-[#2F5FB3] text-white rounded-2xl shadow-2xl shadow-blue-300/50 flex items-center justify-center z-50 active:scale-90 transition-transform"
          >
            <span className="text-3xl font-light leading-none">+</span>
          </button>
        )}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <BottomNav />

    </div>
  );
};

export default App;
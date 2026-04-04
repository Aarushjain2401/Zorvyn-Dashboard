import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Statusbar } from './Statusbar';
import { TransactionModal } from '../UI/TransactionModal';
import { BottomNav } from './BottomNav';

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[100dvh] bg-[var(--color-primary)] text-[var(--color-text-primary)] font-sans">
      {/* Ambient Mesh Background */}
      <div className="mesh-bg">
        <div className="mesh-blob-1"></div>
        <div className="mesh-blob-2"></div>
      </div>
      
      <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      <Topbar isExpanded={isSidebarExpanded} />
      
      {/* Scrollable Main Area */}
      <main className={`flex-1 transition-all duration-300 ease-in-out mt-[56px] md:mt-[60px] pb-[70px] md:mb-[28px] md:pb-0 p-3 sm:p-6 lg:p-8 w-full ${isSidebarExpanded ? 'md:ml-[220px] md:w-[calc(100%-220px)]' : 'md:ml-[64px] md:w-[calc(100%-64px)]'}`}>
        <div className="max-w-[1600px] w-full mx-auto">
          <Outlet />
        </div>
      </main>
      
      <Statusbar />
      <BottomNav />
      <TransactionModal />
    </div>
  );
};

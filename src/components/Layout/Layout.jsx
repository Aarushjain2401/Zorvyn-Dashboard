import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Statusbar } from './Statusbar';
import { TransactionModal } from '../UI/TransactionModal';

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Topbar toggleSidebar={() => setIsSidebarOpen(true)} />
      
      {/* Scrollable Main Area */}
      <main className="md:ml-[64px] mt-[60px] mb-[28px] p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-88px)] overflow-y-auto w-full md:w-[calc(100%-64px)]">
        <div className="max-w-[1200px] w-full mx-auto">
          <Outlet />
        </div>
      </main>
      
      <Statusbar />
      <TransactionModal />
    </>
  );
};

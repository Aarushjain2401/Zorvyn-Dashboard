import React from 'react';
import { Search, Bell, Plus, Menu } from 'lucide-react';
import { useAppContext } from '../../context/AppProvider';

export const Topbar = ({ toggleSidebar }) => {
  const { role, setRole, currency, setCurrency, openModal } = useAppContext();

  return (
    <header className="fixed top-0 right-0 h-[60px] w-full md:w-[calc(100%-64px)] bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border-subtle)] flex items-center justify-between px-4 sm:px-6 z-30 transition-all">
      {/* Left */}
      <div className="flex items-center gap-3 w-1/4 sm:w-1/4 min-w-fit">
        <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-2 bg-[var(--color-primary)] border border-[var(--color-border-subtle)] rounded-md px-3 py-1.5 w-full max-w-md transition-colors hover:border-[#2D3A5D] focus-within:border-[var(--color-violet)]">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search transactions, assets, or settings..." 
            className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder:text-gray-500 font-sans"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex-1 sm:w-1/4 flex items-center justify-end gap-3 sm:gap-5">
        
        {/* Currency Selector */}
        <select 
          value={currency} 
          onChange={(e) => setCurrency(e.target.value)}
          className="bg-transparent border border-[var(--color-border-subtle)] rounded-md text-[10px] text-gray-400 focus:outline-none py-1 px-2 cursor-pointer"
        >
          {['USD', 'EUR', 'GBP', 'INR'].map(cur => (
            <option key={cur} value={cur} className="bg-[var(--color-elevated)]">{cur}</option>
          ))}
        </select>

        {/* Role Toggle Pill */}
        <div className="hidden sm:flex items-center bg-[var(--color-primary)] border border-[var(--color-border-subtle)] p-0.5 rounded-md">
          <button 
            onClick={() => setRole('Admin')} 
            className={`px-3 py-1 text-[10px] font-semibold rounded transition-all ${role === 'Admin' ? 'bg-[var(--color-elevated)] text-white shadow-sm' : 'text-gray-500'}`}
          >
            Admin
          </button>
          <button 
            onClick={() => setRole('Viewer')} 
            className={`px-3 py-1 text-[10px] font-semibold rounded transition-all ${role === 'Viewer' ? 'bg-[var(--color-elevated)] text-white shadow-sm' : 'text-gray-500'}`}
          >
            Viewer
          </button>
        </div>

        {/* Bell */}
        <div className="relative text-gray-400 hover:text-white cursor-pointer transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-[var(--color-rose)] rounded-full border border-[var(--color-surface)]"></span>
        </div>

        {/* Add Transaction Button */}
        {role === 'Admin' && (
          <button onClick={() => openModal()} className="flex items-center gap-1.5 bg-[var(--color-violet)] hover:bg-[#6A5AE6] transition-colors text-white text-xs font-semibold px-4 py-2 rounded-md shadow-[0_4px_14px_rgba(124,110,250,0.3)]">
            <Plus className="w-4 h-4" /> Add
          </button>
        )}
      </div>
    </header>
  );
};

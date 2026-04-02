import React from 'react';
import { Search, Bell, Plus } from 'lucide-react';
import { useAppContext } from '../../context/AppProvider';

export const Topbar = () => {
  const { role, setRole, currency, setCurrency, openModal } = useAppContext();

  return (
    <header className="fixed top-0 right-0 h-[56px] md:h-[60px] w-full md:w-[calc(100%-64px)] bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border-subtle)] flex items-center justify-between px-3 sm:px-6 z-30 transition-all">
      {/* Left */}
      <div className="flex items-center gap-3 w-auto md:w-1/4">
        <span className="md:hidden font-bold text-[15px] tracking-tight ml-2">Zorvyn</span>
      </div>

      {/* Center: Search (Hidden on Mobile/Tablet usually? Spec says: "Tablet: hide search. Mobile: hide search") */}
      <div className="hidden lg:flex flex-1 justify-center">
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
      <div className="flex-1 lg:w-1/4 flex items-center justify-end gap-3 md:gap-5">
        
        {/* Currency Selector (Hidden on Mobile) */}
        <select 
          value={currency} 
          onChange={(e) => setCurrency(e.target.value)}
          className="hidden md:block bg-transparent border border-[var(--color-border-subtle)] rounded-md text-[10px] text-gray-400 focus:outline-none py-1 px-2 cursor-pointer"
        >
          {['USD', 'EUR', 'GBP', 'INR'].map(cur => (
            <option key={cur} value={cur} className="bg-[var(--color-elevated)]">{cur}</option>
          ))}
        </select>

        {/* Role Toggle Pill (Tablet+ only) */}
        <div className="hidden md:flex items-center bg-[var(--color-primary)] border border-[var(--color-border-subtle)] p-0.5 rounded-md h-[44px] md:h-auto">
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
        <div className="relative text-gray-400 hover:text-white cursor-pointer transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-rose)] rounded-full border border-[var(--color-surface)]"></span>
        </div>

        {/* Add Transaction Button */}
        {role === 'Admin' && (
          <button onClick={() => openModal()} className="flex items-center justify-center gap-1.5 bg-[var(--color-violet)] hover:bg-[#6A5AE6] transition-colors text-white text-xs font-semibold px-0 md:px-4 w-[44px] md:w-auto h-[44px] md:h-8 rounded-full md:rounded-md shadow-[0_4px_14px_rgba(124,110,250,0.3)]">
            <Plus className="w-5 h-5 md:w-4 md:h-4" /> 
            <span className="hidden md:inline">Add</span>
          </button>
        )}
      </div>
    </header>
  );
};

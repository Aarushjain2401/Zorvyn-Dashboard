import React from 'react';
import { Search, Bell, Plus } from 'lucide-react';
import { useAppContext } from '../../context/AppProvider';
import { Select } from '../UI/Select';

export const Topbar = () => {
  const { role, setRole, currency, setCurrency, theme, setTheme, openModal } = useAppContext();

  return (
    <header className="fixed top-0 right-0 h-[56px] md:h-[60px] w-full md:w-[calc(100%-64px)] bg-[var(--color-surface)]/50 backdrop-blur-xl border-b border-[var(--color-border-subtle)] flex items-center justify-between px-3 sm:px-6 z-30 transition-all">
      {/* Left */}
      <div className="flex items-center gap-3 w-auto md:w-1/4">
        <img src="https://companyasset.blob.core.windows.net/assets/zorvynlogolight.png" alt="Zorvyn" className="md:hidden w-6 h-auto object-contain ml-2 opacity-90" />
      </div>


      {/* Right: Actions */}
      <div className="flex-1 lg:w-1/4 flex items-center justify-end gap-3 md:gap-5">
        
        {/* Currency Selector (Hidden on Mobile) */}
        <div className="hidden md:block w-24">
          <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {['USD', 'EUR', 'GBP', 'INR'].map(cur => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </Select>
        </div>

        {/* Theme Selector (Hidden on Mobile) */}
        <div className="hidden md:block w-36">
          <Select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </Select>
        </div>

        {/* Role Toggle Dropdown */}
        <div className="w-28">
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Admin">Admin</option>
            <option value="Viewer">Viewer</option>
          </Select>
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

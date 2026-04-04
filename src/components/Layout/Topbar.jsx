import React, { useState, useRef, useEffect } from 'react';
import { Bell, Plus, Sun, Moon, ChevronDown, UserPlus } from 'lucide-react';
import { useAppContext } from '../../context/AppProvider';

export const Topbar = ({ isExpanded }) => {
  const { role, setRole, currency, setCurrency, theme, setTheme, openModal } = useAppContext();
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const currencyRef = useRef(null);
  const roleRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) setIsCurrencyOpen(false);
      if (roleRef.current && !roleRef.current.contains(event.target)) setIsRoleOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currencies = ['USD', 'EUR', 'GBP', 'INR'];
  const roles = ['Admin', 'Viewer'];

  return (
    <header className={`fixed top-0 right-0 h-[56px] md:h-[60px] w-full bg-[var(--color-surface)]/50 backdrop-blur-xl border-b border-[var(--color-border-subtle)] flex items-center justify-between px-3 sm:px-6 z-30 transition-all duration-300 ease-in-out ${isExpanded ? 'md:w-[calc(100%-220px)]' : 'md:w-[calc(100%-64px)]'}`}>
      {/* Left */}
      <div className="flex items-center gap-3 w-auto md:w-1/4">
        <img src="https://companyasset.blob.core.windows.net/assets/zorvynlogolight.png" alt="Zorvyn" className="md:hidden w-6 h-auto object-contain ml-2 opacity-90" />
      </div>

      {/* Right: Actions */}
      <div className="flex-1 flex items-center justify-end gap-3 md:gap-5">
        
        {/* Currency Dropdown (Custom) */}
        <div className="relative hidden md:block" ref={currencyRef}>
          <button onClick={() => setIsCurrencyOpen(!isCurrencyOpen)} className="flex items-center gap-2 h-8 px-3 text-xs font-semibold border border-[var(--color-border-subtle)] bg-[var(--color-elevated)] hover:bg-[var(--color-popover)] text-[var(--color-text-primary)] transition-colors rounded-none">
            {currency} <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
          {isCurrencyOpen && (
            <div className="absolute top-full right-0 mt-1 w-20 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] shadow-xl z-50 rounded-none overflow-hidden">
              {currencies.map(cur => (
                <button key={cur} onClick={() => { setCurrency(cur); setIsCurrencyOpen(false); }} className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-[var(--color-elevated)] ${currency === cur ? 'text-[var(--color-violet)] font-bold' : 'text-[var(--color-text-primary)] font-medium'}`}>
                  {cur}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle (Pill Switch) */}
        <div className="hidden md:flex items-center gap-1 bg-[var(--color-elevated)] border border-[var(--color-border-subtle)] p-[2px] rounded-full">
          <button onClick={() => setTheme('light')} className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-[var(--color-popover)] shadow-sm text-amber-500' : 'text-gray-400 hover:text-[var(--color-text-primary)]'}`}>
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setTheme('dark')} className={`p-1.5 rounded-full transition-colors ${theme === 'dark' || theme === 'system' ? 'bg-[var(--color-popover)] shadow-sm text-indigo-400' : 'text-gray-400 hover:text-[var(--color-text-primary)]'}`}>
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-5 bg-[var(--color-border-subtle)] mx-1"></div>

        {/* Role Toggle Dropdown (Custom) */}
        <div className="relative hidden md:block" ref={roleRef}>
          <button onClick={() => setIsRoleOpen(!isRoleOpen)} className="flex items-center gap-2 h-8 px-3 text-xs font-semibold bg-[var(--color-elevated)] hover:bg-[var(--color-popover)] text-[var(--color-text-primary)] transition-colors rounded-none">
            {role} <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
          {isRoleOpen && (
            <div className="absolute top-full right-0 mt-1 w-24 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] shadow-xl z-50 rounded-none overflow-hidden">
              {roles.map(r => (
                <button key={r} onClick={() => { setRole(r); setIsRoleOpen(false); }} className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-[var(--color-elevated)] ${role === r ? 'text-[var(--color-violet)] font-bold' : 'text-[var(--color-text-primary)] font-medium'}`}>
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bell */}
        <div className="relative text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer transition-colors flex items-center justify-center min-w-[36px] min-h-[36px]">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[var(--color-rose)] rounded-none"></span>
        </div>

        {/* Profile */}
        <div className="hidden md:flex items-center gap-3 border-l border-[var(--color-border-subtle)] pl-4 cursor-pointer hover:bg-[var(--color-popover)] p-1 rounded-none transition-colors ml-1">
          <div className="w-7 h-7 rounded-none bg-[var(--color-violet)] text-white flex items-center justify-center font-bold text-xs">AJ</div>
        </div>

        {/* Add Actions */}
        <div className="flex items-center gap-2 pl-2">
          {role === 'Admin' && (
            <button className="hidden md:flex items-center justify-center gap-1.5 border border-[var(--color-violet)] text-[var(--color-violet)] hover:bg-[var(--color-violet)]/10 transition-colors text-xs font-semibold px-3 h-8 rounded-none">
              <UserPlus className="w-3.5 h-3.5" /> 
              <span>Invite</span>
            </button>
          )}
          {role === 'Admin' && (
            <button onClick={() => openModal()} className="flex items-center justify-center gap-1.5 bg-[var(--color-violet)] hover:bg-[#6A5AE6] transition-colors text-white text-xs font-semibold px-0 md:px-3 w-9 md:w-auto h-9 md:h-8 rounded-none shadow-[0_4px_14px_rgba(124,110,250,0.3)]">
              <Plus className="w-4 h-4" /> 
              <span className="hidden md:inline">Add</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Plus, Sun, Moon, ChevronDown, UserPlus } from 'lucide-react';
import { useAppContext } from '../../context/AppProvider';

export const Topbar = ({ isExpanded }) => {
  const { role, setRole, currency, setCurrency, currencyRate, theme, setTheme, openModal } = useAppContext();
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const currencyRef = useRef(null);
  const roleRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) setIsCurrencyOpen(false);
      if (roleRef.current && !roleRef.current.contains(event.target)) setIsRoleOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
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
        <div className="flex items-center gap-2 hidden md:flex">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--color-text-secondary)]">FX Rate</span>
            {currency !== 'USD' && <span className="text-[9px] text-[var(--color-brand)] font-mono">1 USD = {currencyRate.toFixed(2)}</span>}
          </div>
          <div className="relative" ref={currencyRef}>
            <button onClick={() => setIsCurrencyOpen(!isCurrencyOpen)} className="flex items-center justify-between w-[70px] h-8 px-2.5 text-xs font-semibold border border-[var(--color-border-subtle)] bg-[var(--color-elevated)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-violet)] text-[var(--color-text-primary)] transition-colors rounded-lg shadow-sm">
              {currency} <ChevronDown className="w-3 h-3 text-[var(--color-text-secondary)]" />
            </button>
            {isCurrencyOpen && (
              <div className="absolute top-full right-0 mt-2 w-32 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] shadow-xl z-50 rounded-lg overflow-hidden flex flex-col py-1">
                {currencies.map(cur => (
                  <button key={cur} onClick={() => { setCurrency(cur); setIsCurrencyOpen(false); }} className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-[var(--color-elevated)] focus:outline-none focus:bg-[var(--color-elevated)] ${currency === cur ? 'text-[var(--color-violet)] font-bold' : 'text-[var(--color-text-primary)] font-medium'}`}>
                    {cur}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Theme Toggle (Pill Switch) */}
        <div className="hidden md:flex items-center gap-1.5 px-1">
          <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500' : 'text-[var(--color-border-subtle)]'}`} />
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            className="relative flex flex-shrink-0 items-center w-10 h-5 bg-[var(--color-border-subtle)] rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-violet)] transition-colors"
            aria-label="Toggle Theme"
          >
            <div className={`absolute top-[2px] w-4 h-4 bg-[var(--color-elevated)] rounded-full flex items-center justify-center shadow-sm transition-transform duration-300 ${theme === 'light' ? 'left-[2px]' : 'left-[22px]'}`}></div>
          </button>
          <Moon className={`w-3 h-3 ${theme === 'dark' ? 'text-indigo-400' : 'text-[var(--color-border-subtle)]'}`} />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-5 bg-[var(--color-border-subtle)] mx-1"></div>

        {/* Role Toggle Dropdown (Custom) */}
        <div className="relative hidden md:block" ref={roleRef}>
          <button onClick={() => setIsRoleOpen(!isRoleOpen)} className="flex items-center gap-2 h-8 px-3 text-xs font-semibold bg-[var(--color-elevated)] hover:bg-[var(--color-popover)] text-[var(--color-text-primary)] transition-colors rounded-none">
            {role} <ChevronDown className="w-3 h-3 text-[var(--color-text-secondary)]" />
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

        {/* Bell Custom Alert */}
        <div className="relative flex" ref={notifRef}>
          <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-violet)] cursor-pointer transition-colors flex items-center justify-center min-w-[36px] min-h-[36px] rounded-lg">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[var(--color-rose)] text-white text-[9px] font-bold rounded-full flex items-center justify-center">2</span>
          </button>
          {isNotifOpen && (
             <div className="absolute top-full right-0 mt-2 w-64 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] shadow-xl z-50 rounded-lg overflow-hidden flex flex-col py-2">
                <div className="px-4 py-2 border-b border-[var(--color-border-subtle)] text-xs font-semibold text-[var(--color-text-primary)]">Notifications</div>
                <button className="px-4 py-3 text-left hover:bg-[var(--color-elevated)] transition-colors border-b border-[var(--color-border-subtle)]">
                   <div className="text-xs font-semibold text-[var(--color-text-primary)] mb-1">New transaction flagged</div>
                   <div className="text-[10px] text-[var(--color-text-secondary)] line-clamp-1">Suspicious SaaS bill over $2k.</div>
                </button>
                <button className="px-4 py-3 text-left hover:bg-[var(--color-elevated)] transition-colors">
                   <div className="text-xs font-semibold text-[var(--color-text-primary)] mb-1">Payroll sync complete</div>
                   <div className="text-[10px] text-[var(--color-text-secondary)] line-clamp-1">Added 32 new expense records.</div>
                </button>
             </div>
          )}
        </div>

        {/* Profile */}
        <div className="hidden md:flex items-center gap-3 border-l border-[var(--color-border-subtle)] pl-4 cursor-pointer hover:bg-[var(--color-popover)] p-1 rounded-none transition-colors ml-1">
          <div className="w-7 h-7 rounded-none bg-[var(--color-violet)] text-white flex items-center justify-center font-bold text-xs">AJ</div>
        </div>

        {/* Add Actions */}
        <div className="flex items-center gap-2 pl-2">
          {role === 'Admin' && (
            <button className="hidden md:flex items-center justify-center gap-1.5 bg-[var(--color-text-primary)] hover:bg-[var(--color-text-secondary)] text-[var(--color-primary)] transition-colors text-xs font-semibold px-4 h-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--color-text-primary)]">
              <UserPlus className="w-3.5 h-3.5" /> 
              <span>Invite</span>
            </button>
          )}
          {role === 'Admin' && (
            <button onClick={() => openModal()} className="flex items-center justify-center gap-1.5 bg-[var(--color-violet)] hover:bg-[#6A5AE6] transition-colors text-white text-xs font-semibold px-0 md:px-4 w-9 md:w-auto h-9 md:h-8 rounded-lg shadow-[0_4px_14px_rgba(124,110,250,0.3)] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--color-violet)]">
              <Plus className="w-4 h-4" /> 
              <span className="hidden md:inline">Add</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

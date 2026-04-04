import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Lightbulb, Wallet, Settings, ChevronRight, ChevronLeft } from 'lucide-react';

export const Sidebar = ({ isExpanded, setIsExpanded }) => {
  const icons = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { to: '/insights', icon: Lightbulb, label: 'Insights' },
    { to: '/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className={`hidden md:flex fixed left-0 top-0 bottom-0 bg-[var(--color-surface)] border-r border-[var(--color-border-subtle)] flex-col py-4 z-40 transition-all duration-300 ease-in-out ${isExpanded ? 'w-[220px] items-stretch px-4' : 'w-[64px] items-center px-0'}`}>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-6 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-full p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-violet)] transition-all z-50 shadow-sm"
      >
        {isExpanded ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>

      {/* Logo */}
      <div className={`flex items-center mt-2 mb-6 h-14 ${isExpanded ? 'justify-start px-2' : 'justify-center w-14'}`}>
        <img src="https://companyasset.blob.core.windows.net/assets/zorvynlogolight.png" alt="Zorvyn Logo" className="w-8 h-auto object-contain opacity-90 mx-auto" style={isExpanded ? {margin: 0} : {}} />
        {isExpanded && <span className="ml-3 font-semibold text-lg tracking-tight text-[var(--color-text-primary)]">Zorvyn</span>}
      </div>

      {/* Center Icons */}
      <div className="flex-1 flex flex-col gap-2">
        {icons.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              relative flex items-center h-11 rounded-none transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-violet)]
              ${isExpanded ? 'px-3 justify-start' : 'w-11 justify-center mx-auto'}
              ${isActive ? 'bg-[var(--color-violet)]/20 text-[var(--color-violet)] font-semibold' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-elevated)] font-medium'}
            `}
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={2.5} />
            {isExpanded && <span className="ml-3 text-sm truncate">{item.label}</span>}
          </NavLink>
        ))}
      </div>

      {/* Bottom Avatar */}
      <div className={`mt-auto flex items-center ${isExpanded ? 'px-2' : 'justify-center'}`}>
        <div className="w-10 h-10 shrink-0 rounded-none border-2 border-[var(--color-border-subtle)] overflow-hidden cursor-pointer hover:border-[var(--color-violet)] transition-colors">
          <img src="https://i.pravatar.cc/100?img=33" alt="User Avatar" />
        </div>
        {isExpanded && (
          <div className="ml-3 flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate text-[var(--color-text-primary)]">Aarush Jain</span>
            <span className="text-[10px] text-[var(--color-text-secondary)] truncate">Admin</span>
          </div>
        )}
      </div>
    </aside>
  );
};

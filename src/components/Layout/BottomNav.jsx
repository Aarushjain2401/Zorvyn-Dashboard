import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Lightbulb, Wallet, Settings } from 'lucide-react';

export const BottomNav = () => {
  const icons = [
    { to: '/', icon: LayoutDashboard },
    { to: '/transactions', icon: ArrowLeftRight },
    { to: '/insights', icon: Lightbulb },
    { to: '/wallet', icon: Wallet },
    { to: '/settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-[var(--color-surface)] border-t border-[var(--color-border-subtle)] flex items-center justify-around px-2 z-[100] pb-safe">
      {icons.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `
            relative flex justify-center items-center h-[44px] min-w-[44px] rounded-full transition-all flex-1 mx-1
            ${isActive ? 'bg-[var(--color-violet)]/20 text-[var(--color-violet)]' : 'text-[var(--color-text-secondary)] active:text-white'}
          `}
        >
          <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
        </NavLink>
      ))}
    </nav>
  );
};

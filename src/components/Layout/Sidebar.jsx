import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Lightbulb, Wallet, Settings } from 'lucide-react';

export const Sidebar = () => {
  const icons = [
    { to: '/', icon: LayoutDashboard },
    { to: '/transactions', icon: ArrowLeftRight },
    { to: '/insights', icon: Lightbulb },
    { to: '/wallet', icon: Wallet },
    { to: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[64px] bg-[var(--color-surface)] border-r border-[var(--color-border-subtle)] flex-col items-center py-4 z-40">
      {/* Logo */}
      <div className="w-14 h-14 mb-6 mt-2 flex items-center justify-center">
        <img src="https://companyasset.blob.core.windows.net/assets/zorvynlogolight.png" alt="Zorvyn Logo" className="w-8 h-auto object-contain opacity-90" />
      </div>

      {/* Center Icons */}
      <div className="flex-1 flex flex-col gap-4">
        {icons.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              relative flex justify-center items-center w-11 h-11 rounded-md transition-all
              ${isActive ? 'bg-[var(--color-violet)]/20 text-[var(--color-violet)]' : 'text-gray-500 hover:text-white hover:bg-[var(--color-elevated)]'}
            `}
          >
            <item.icon className="w-[18px] h-[18px]" strokeWidth={2.5} />
          </NavLink>
        ))}
      </div>

      {/* Bottom Avatar */}
      <div className="w-10 h-10 rounded-full border-2 border-[var(--color-border-subtle)] overflow-hidden cursor-pointer hover:border-[var(--color-violet)] transition-colors">
        <img src="https://i.pravatar.cc/100?img=33" alt="User Avatar" />
      </div>
    </aside>
  );
};

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Card = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn(
        "bg-[var(--color-elevated)] border-transparent ring-1 ring-white/5 rounded-md relative overflow-hidden transition-all duration-200 hover:ring-white/10",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

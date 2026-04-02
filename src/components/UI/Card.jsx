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
        "glass-panel relative overflow-hidden",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

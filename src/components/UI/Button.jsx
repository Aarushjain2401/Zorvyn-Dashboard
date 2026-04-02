import React from 'react';
import { cn } from './Card';

export const Button = React.forwardRef(({ children, className, variant = 'primary', size = 'md', ...props }, ref) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-primary)] disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-[var(--color-violet)] text-white hover:bg-[#6A5AE6] focus:ring-[var(--color-violet)] shadow-[0_4px_14px_rgba(124,110,250,0.3)]",
    secondary: "bg-[var(--color-popover)] text-white border border-[var(--color-border-subtle)] hover:bg-[#1E2840] focus:ring-gray-600",
    danger: "bg-[var(--color-rose)] text-white hover:bg-[#E63950] focus:ring-[var(--color-rose)] shadow-[0_4px_14px_rgba(255,78,106,0.2)]",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-[var(--color-popover)] focus:ring-gray-600",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10",
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyle, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

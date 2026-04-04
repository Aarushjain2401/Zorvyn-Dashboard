import React from 'react';
import { cn } from './Card';

export const Button = React.forwardRef(({ children, className, variant = 'primary', size = 'md', ...props }, ref) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-primary)] disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-[var(--color-violet)] text-white hover:brightness-110 focus:ring-[var(--color-violet)] shadow-[0_4px_14px_rgba(124,110,250,0.3)]",
    secondary: "bg-[var(--color-popover)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-elevated)] focus:ring-[var(--color-border-subtle)]",
    danger: "bg-[var(--color-rose)] text-white hover:brightness-110 focus:ring-[var(--color-rose)] shadow-[0_4px_14px_rgba(255,78,106,0.2)]",
    ghost: "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-popover)] focus:ring-[var(--color-border-subtle)]",
  };

  const sizes = {
    sm: "h-8 md:h-8 min-h-[44px] md:min-h-0 px-3 text-xs",
    md: "h-10 px-4 text-sm min-h-[44px] md:min-h-0",
    lg: "h-12 px-6 text-base min-h-[44px] md:min-h-0",
    icon: "h-10 w-10 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0",
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

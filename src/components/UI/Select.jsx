import React from 'react';
import { cn } from './Card';

export const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-none border border-[var(--color-border-subtle)] bg-[var(--color-popover)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-violet)] hover:border-[var(--color-border-subtle)] transition-colors disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";

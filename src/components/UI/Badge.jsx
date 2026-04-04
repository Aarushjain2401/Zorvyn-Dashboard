import React from 'react';
import { cn } from './Card';

export const Badge = ({ children, variant = 'neutral', className, ...props }) => {
  const variants = {
    neutral: 'bg-[var(--color-popover)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]',
    income: 'bg-[var(--color-teal)]/10 text-[var(--color-teal)] border border-[var(--color-teal)]/20',
    expense: 'bg-[var(--color-rose)]/10 text-[var(--color-rose)] border border-[var(--color-rose)]/20',
    warning: 'bg-[var(--color-amber)]/10 text-[var(--color-amber)] border border-[var(--color-amber)]/20',
    primary: 'bg-[var(--color-violet)]/10 text-[var(--color-violet)] border border-[var(--color-violet)]/20',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

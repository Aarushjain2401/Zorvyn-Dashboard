import React from 'react';
import { cn } from './Card';

export const Table = ({ children, className }) => (
  <div className="w-full overflow-auto">
    <table className={cn("w-full caption-bottom text-sm", className)}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className }) => (
  <thead className={cn("[&_tr]:border-b [&_tr]:border-[var(--color-border-subtle)]", className)}>
    {children}
  </thead>
);

export const TableBody = ({ children, className }) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className, ...props }) => (
  <tr
    className={cn(
      "border-b border-[var(--color-border-subtle)] transition-colors hover:bg-[var(--color-surface)]/50",
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className, ...props }) => (
  <th
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-[var(--color-text-secondary)] [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  >
    {children}
  </th>
);

export const TableCell = ({ children, className, ...props }) => (
  <td
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  >
    {children}
  </td>
);

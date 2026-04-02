import React from 'react';
import { RefreshCcw, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../../context/AppProvider';

export const Statusbar = () => {
  const { transactions } = useAppContext();
  
  return (
    <footer className="fixed bottom-0 right-0 h-[28px] bg-[var(--color-primary)] border-t border-[var(--color-border-subtle)] flex items-center justify-between px-4 z-30" style={{ width: 'calc(100% - 64px)' }}>
      <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-[var(--color-teal)]" />
          <span className="mt-0.5">Live Sync: Active</span>
        </div>
        <div className="flex items-center gap-1">
          <RefreshCcw className="w-3 h-3" />
          <span className="mt-0.5">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      <div className="text-[10px] text-gray-500 font-mono">
        {transactions.length} Transactions Processed
      </div>
    </footer>
  );
};

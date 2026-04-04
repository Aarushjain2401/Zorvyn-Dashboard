import React, { useState, useEffect } from 'react';
import { RefreshCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppProvider';
import { formatDistanceToNow } from 'date-fns';

export const Statusbar = () => {
  const { transactions } = useAppContext();
  const [syncState, setSyncState] = useState('active');
  const [lastSyncDtm, setLastSyncDtm] = useState(new Date());
  const [timeAgo, setTimeAgo] = useState('just now');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatDistanceToNow(lastSyncDtm, { addSuffix: true }));
    }, 10000); // tick every 10 params
    return () => clearInterval(interval);
  }, [lastSyncDtm]);
  
  return (
    <footer className="hidden md:flex fixed bottom-0 right-0 h-[28px] w-full md:w-[calc(100%-64px)] bg-[var(--color-primary)] border-t border-[var(--color-border-subtle)] items-center justify-between px-4 z-30">
      <div className="flex items-center gap-4 text-[10px] text-[var(--color-text-secondary)] font-mono">
        {syncState === 'active' ? (
          <button 
             className="flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-violet)] rounded" 
             onClick={() => setSyncState('error')}
          >
            <span className="relative flex h-2 w-2 mb-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-teal)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-teal)]"></span>
            </span>
            <span className="mt-0.5 font-medium text-[var(--color-teal)]">Live Sync: Active</span>
          </button>
        ) : (
          <button 
             className="flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-violet)] rounded" 
             onClick={() => { setSyncState('active'); setLastSyncDtm(new Date()); setTimeAgo('just now'); }}
          >
            <span className="relative flex h-2 w-2 mb-0.5">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-rose)]"></span>
            </span>
            <span className="mt-0.5 font-bold text-[var(--color-rose)]">Sync failed — click to retry</span>
          </button>
        )}
        <div className="flex items-center gap-1">
          <RefreshCcw className="w-3 h-3" />
          <span className="mt-0.5">Updated {timeAgo}</span>
        </div>
      </div>
      <div className="text-[10px] text-[var(--color-text-secondary)] font-mono">
        {transactions.length} Transactions Processed
      </div>
    </footer>
  );
};

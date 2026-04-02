import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from './Card';
import { Button } from './Button';

export const Modal = ({ isOpen, onClose, title, children, className }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className={cn(
        "relative z-50 w-full md:max-w-lg rounded-t-[16px] rounded-b-none md:rounded-md border-t md:border border-[var(--color-border-subtle)] bg-[var(--color-elevated)] p-5 md:p-6 pb-safe mb-0 md:mb-auto shadow-xl animate-in fade-in zoom-in-95 slide-in-from-bottom-5 md:slide-in-from-bottom-0 duration-200",
        className
      )}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { subDays } from 'date-fns';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const AppContext = createContext();

const generateSeedData = () => {
  const data = [];
  const categories = ['SaaS', 'Payroll', 'Marketing', 'Infrastructure', 'Office', 'Consulting'];
  const now = new Date();
  
  let tempId = 1;
  // Generate 4 transactions per month for 6 months (24 total)
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 4; j++) {
      const d = subDays(now, (i * 30) + (j * 7) + Math.random() * 5);
      const isIncome = (j === 0); 
      const category = isIncome ? 'Revenue' : categories[Math.floor(Math.random() * categories.length)]; 
      
      const rawAmount = isIncome ? (12000 + (Math.random() * 8000)) : (800 + (Math.random() * 4000));
      
      data.push({
        id: uuidv4(),
        description: isIncome ? 'SaaS Subscription Revenue' : `${category} Services`,
        amount: Math.round(rawAmount * 100) / 100,
        type: isIncome ? 'income' : 'expense',
        category: category,
        date: d.toISOString(),
      });
    }
  }
  return data.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const CURRENCY_CONFIG = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 84.2
};

export const AppProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('zorvyn_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved transactions');
      }
    }
    return generateSeedData();
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem('zorvyn_role') || 'Admin';
  });

  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('zorvyn_currency') || 'USD';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('zorvyn_theme') || 'dark';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const [rates, setRates] = useState(CURRENCY_CONFIG);
  const [ratesLastUpdated, setRatesLastUpdated] = useState(null);

  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'info') => {
    const id = uuidv4();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // Unusual Spending Detector
  useEffect(() => {
    if (transactions.length > 0) {
      // Find average expense
      const expenses = transactions.filter(t => t.type === 'expense');
      if (expenses.length > 5) {
        const avg = expenses.reduce((acc, t) => acc + t.amount, 0) / expenses.length;
        const recentHitter = expenses.find(t => new Date(t.date) > subDays(new Date(), 7) && t.amount > avg * 3);
        if (recentHitter) {
           setTimeout(() => {
             addToast(`Unusual spending detected: ${formatCurrency(recentHitter.amount)} at ${recentHitter.category}`, 'warning');
           }, 1500);
        }
      }
    }
  }, []);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          // Hard fallback for INR just in case the API returns an anomaly
          if (data.rates.INR < 10) data.rates.INR = 84.2;
          setRates(prev => ({ ...prev, ...data.rates }));
          setRatesLastUpdated(new Date());
        }
      })
      .catch(err => console.error("Could not fetch realtime rates:", err));
  }, []);

  const openModal = (transaction = null) => {
    setEditingData(transaction);
    setIsModalOpen(true);
  };

  useEffect(() => {
    localStorage.setItem('zorvyn_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('zorvyn_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('zorvyn_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('zorvyn_theme', theme);
    const root = document.documentElement;
    
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      root.setAttribute('data-theme', mediaQuery.matches ? 'dark' : 'light');
      
      const listener = (e) => root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const globalMetrics = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;
    
    // Normalize global burn rate across standard 6 month tracking
    const burnRate = totalExpense / 6; 
    const runway = burnRate > 0 ? (balance > 0 ? balance / burnRate : 0).toFixed(1) : (totalIncome > 0 ? 99 : 0);
    
    return { totalIncome, totalExpense, balance, savingsRate, burnRate, runway };
  }, [transactions]);

  const addTransaction = (t) => {
    setTransactions([{ ...t, id: uuidv4() }, ...transactions]);
  };

  const editTransaction = (id, updated) => {
    setTransactions(transactions.map(t => t.id === id ? { ...t, ...updated } : t));
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const formatCurrency = (val) => {
    const rate = rates[currency] || 1.0;
    const converted = val * rate;
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(converted);
  };

  const formatCompactCurrency = (val) => {
    const rate = rates[currency] || 1.0;
    const converted = val * rate;
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    // For INR under 1000, show as plain number (₹999) without decimals, else use compact display. The Indian locale handles Lakhs (L) and Crores (Cr).
    const isSmallINR = currency === 'INR' && converted < 1000;
    const options = isSmallINR 
      ? { style: 'currency', currency: currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }
      : { style: 'currency', currency: currency, notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 };
    
    let formatted = new Intl.NumberFormat(locale, options).format(converted);
    if (currency !== 'INR') {
        formatted = formatted.replace('K', 'k');
    } else {
        // En-IN sometimes formats thousands with 'T'. Replace with 'K'.
        formatted = formatted.replace('T', 'K');
    }
    return formatted;
  };

  return (
    <AppContext.Provider value={{
      transactions,
      globalMetrics,
      role,
      setRole,
      currency,
      setCurrency,
      theme,
      setTheme,
      formatCurrency,
      formatCompactCurrency,
      currencyRate: rates[currency] || 1.0,
      ratesLastUpdated,
      isModalOpen,
      setIsModalOpen,
      editingData,
      openModal,
      addTransaction,
      editTransaction,
      addToast,
      deleteTransaction
    }}>
      {children}
      {/* Global Toast Container */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto flex items-center gap-3 bg-[var(--color-elevated)] border border-[var(--color-border-subtle)] shadow-[0_8px_30px_rgba(0,0,0,0.3)] p-3 pr-4 rounded-xl slide-in-from-bottom-5 fade-in duration-300 min-w-[280px] max-w-[340px]">
             {t.type === 'warning' && <div className="w-8 h-8 rounded-full bg-[var(--color-amber)]/10 flex items-center justify-center shrink-0"><AlertCircle className="w-4 h-4 text-[var(--color-amber)]" /></div>}
             {t.type === 'success' && <div className="w-8 h-8 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4 text-[var(--color-teal)]" /></div>}
             {t.type === 'info' && <div className="w-8 h-8 rounded-full bg-[var(--color-violet)]/10 flex items-center justify-center shrink-0"><Info className="w-4 h-4 text-[var(--color-violet)]" /></div>}
             <p className="text-xs font-medium text-[var(--color-text-primary)] flex-1 leading-snug">{t.msg}</p>
             <button onClick={() => removeToast(t.id)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"><X className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

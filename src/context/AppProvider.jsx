import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { subDays } from 'date-fns';

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
  INR: 83.2
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

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          setRates(prev => ({ ...prev, ...data.rates }));
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
    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(converted);
    return formatted;
  };

  const formatCompactCurrency = (val) => {
    const rate = rates[currency] || 1.0;
    const converted = val * rate;
    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, notation: 'compact', compactDisplay: 'short' }).format(converted);
    return formatted.replace('K', 'k');
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
      isModalOpen,
      setIsModalOpen,
      editingData,
      openModal,
      addTransaction,
      editTransaction,
      deleteTransaction
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

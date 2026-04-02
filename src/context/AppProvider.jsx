import React, { createContext, useContext, useState, useEffect } from 'react';
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
      
      data.push({
        id: uuidv4(),
        description: isIncome ? 'SaaS Subscription Revenue' : `${category} Services`,
        amount: isIncome ? (12000 + (Math.random() * 8000)) : (800 + (Math.random() * 4000)),
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
    const converted = val * CURRENCY_CONFIG[currency];
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 2 }).format(converted);
  };

  return (
    <AppContext.Provider value={{
      transactions,
      role,
      setRole,
      currency,
      setCurrency,
      theme,
      setTheme,
      formatCurrency,
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

import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppProvider';
import { Card } from '../components/UI/Card';
import { Bar } from 'react-chartjs-2';
import { Target, AlertTriangle, TrendingDown, DollarSign, Activity, Percent } from 'lucide-react';

export const Insights = () => {
  const { transactions, formatCurrency } = useAppContext();

  const metrics = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const burnRate = totalExpense / 6; 
    const runway = totalExpense > 0 ? (totalIncome / burnRate).toFixed(1) : 0;
    
    return { totalIncome, totalExpense, burnRate, runway };
  }, [transactions]);

  const expenses = transactions.filter(t => t.type === 'expense');
  const catTotals = useMemo(() => {
    return Object.entries(expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount; return acc;
    }, {})).sort((a,b) => b[1] - a[1]);
  }, [expenses]);

  const barData = useMemo(() => {
    const acc = {};
    transactions.forEach(t => {
      const m = new Date(t.date).toLocaleString('en-US', { month: 'short' });
      if (!acc[m]) acc[m] = { income: 0, expense: 0 };
      if (t.type === 'income') acc[m].income += t.amount;
      else acc[m].expense += t.amount;
    });
    const mths = Object.keys(acc);
    return {
      labels: mths.slice(-6),
      datasets: [
        { label: 'Income', data: mths.slice(-6).map(m => acc[m].income), backgroundColor: 'rgba(0, 212, 170, 0.8)', borderRadius: 4 },
        { label: 'Expense', data: mths.slice(-6).map(m => acc[m].expense), backgroundColor: 'rgba(255, 78, 106, 0.8)', borderRadius: 4 }
      ]
    };
  }, [transactions]);

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] tracking-wide">Financial Insights</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { icon: TrendingDown, label: 'Monthly Burn Rate', val: formatCurrency(metrics.burnRate), c: 'rose' },
          { icon: Activity, label: 'Estimated Runway', val: `${metrics.runway} Months`, c: 'teal' },
          { icon: Percent, label: 'Highest Expense Category', val: catTotals[0]?.[0] || 'N/A', c: 'amber' },
          { icon: Target, label: 'Capital Efficiency', val: 'High', c: 'violet' },
          { icon: AlertTriangle, label: 'Anomalies Detected', val: '0', c: 'teal' },
          { icon: DollarSign, label: 'Total Capital Processed', val: formatCurrency(metrics.totalIncome + metrics.totalExpense), c: 'violet' }
        ].map((m, i) => (
          <Card key={i} className="p-5 flex items-center justify-between group hover:bg-[var(--color-popover)] transition-colors">
            <div className="flex flex-col">
               <span className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">{m.label}</span>
               <span className="text-xl font-mono text-[var(--color-text-primary)] tracking-tight">{m.val}</span>
            </div>
            <div className={`w-12 h-12 rounded-xl bg-[var(--color-${m.c})]/10 flex items-center justify-center text-[var(--color-${m.c})]`}>
              <m.icon className="w-5 h-5" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <h3 className="text-base font-semibold mb-4 text-[var(--color-text-primary)]">6-Month Cash Flow Analysis</h3>
          <div className="h-[300px] flex items-center justify-center">
             {transactions.length > 0 ? (
               <Bar data={barData} options={{ 
                 responsive: true, 
                 maintainAspectRatio: false, 
                 plugins: {
                   tooltip: {
                     callbacks: {
                       label: function(context) {
                         let label = context.dataset.label || '';
                         if (label) { label += ': '; }
                         if (context.parsed.y !== null) { label += formatCurrency(context.parsed.y); }
                         return label;
                       }
                     }
                   }
                 },
                 scales: { 
                   x: { grid: { display:false } }, 
                   y: { 
                     grid: { color: '#1E2840' },
                     ticks: { callback: function(value) { return formatCurrency(value); } }
                   } 
                 } 
               }} />
             ) : <span className="text-[var(--color-text-secondary)] text-sm font-sans tracking-tight">No data available</span>}
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
           <h3 className="text-base font-semibold mb-6 text-[var(--color-text-primary)]">Expense Distribution Breakdown</h3>
           <div className="flex-1 overflow-y-auto space-y-5 pr-2">
              {catTotals.map(([cat, amt]) => {
                 const pct = metrics.totalExpense ? (amt / metrics.totalExpense) * 100 : 0;
                 return (
                   <div key={cat} className="text-sm">
                     <div className="flex justify-between mb-2">
                       <span className="text-gray-300 font-medium">{cat}</span>
                       <span className="font-mono text-gray-400">{formatCurrency(amt)} <span className="text-[10px] ml-1">({pct.toFixed(1)}%)</span></span>
                     </div>
                     <div className="w-full h-1.5 bg-[var(--color-elevated)] border border-[var(--color-border-subtle)] rounded-full overflow-hidden">
                       <div className="h-full bg-[var(--color-rose)] rounded-full" style={{ width: `${pct}%` }}></div>
                     </div>
                   </div>
                 );
              })}
           </div>
        </Card>
      </div>
    </div>
  );
};

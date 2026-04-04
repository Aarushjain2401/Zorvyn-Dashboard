import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppProvider';
import { Card } from '../components/UI/Card';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement, LineController, BarController, DoughnutController } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { ArrowUpRight, ArrowDownRight, Landmark, BadgePercent, TrendingUp, TrendingDown, Shield, Layers, Hourglass, Gauge, ChevronRight, Activity, Search, Download, Info, Sparkles, Inbox, PieChart } from 'lucide-react';

const useInView = (options) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, options);
    const curr = ref.current;
    if (curr) observer.observe(curr);
    return () => { if (curr) observer.unobserve(curr); };
  }, [options]);
  return [ref, isInView];
};

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler, LineController, BarController, DoughnutController);
ChartJS.defaults.color = '#8B949E';
ChartJS.defaults.font.family = "'Geist', sans-serif";

export const Overview = () => {
  const { transactions, globalMetrics, formatCurrency, formatCompactCurrency, openModal } = useAppContext();
  const [period, setPeriod] = useState('All');
  const [donutType, setDonutType] = useState('expense');
  const [txFilter, setTxFilter] = useState('All');
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const filterCats = ['All', 'Income', 'Expense', 'Payroll', 'Marketing'];

  // Simulation of loading states
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  // Lazy loading views
  const [chartsRef, chartsInView] = useInView({ threshold: 0.1 });
  const [bottomRef, bottomInView] = useInView({ threshold: 0.1 });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case '1': setPeriod('1W'); break;
        case '2': setPeriod('1M'); break;
        case '3': setPeriod('6M'); break;
        case '4': setPeriod('1Y'); break;
        case '5': setPeriod('All'); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const metrics = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;
    return { balance, totalIncome, totalExpense, savingsRate };
  }, [transactions]);

  // Combine Bar/Line Chart Data (Income/Expense bars overlaid with Balance line)
  const comboChartData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let runningBalance = 0;
    const labels = [];
    const incomeData = [];
    const expenseData = [];
    const balanceData = [];
    
    // Aggregate by month for the chart
    const monthlyAcc = {};
    sorted.forEach(t => {
      const d = new Date(t.date);
      const m = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      if (!monthlyAcc[m]) monthlyAcc[m] = { income: 0, expense: 0, dateObj: d };
      if (t.type === 'income') monthlyAcc[m].income += t.amount;
      else monthlyAcc[m].expense += t.amount;
    });

    const sortedMonths = Object.keys(monthlyAcc).sort((a,b) => monthlyAcc[a].dateObj - monthlyAcc[b].dateObj);
    
    sortedMonths.forEach(m => {
      labels.push(m);
      incomeData.push(monthlyAcc[m].income);
      expenseData.push(monthlyAcc[m].expense);
      runningBalance += monthlyAcc[m].income - monthlyAcc[m].expense;
      balanceData.push(runningBalance);
    });

    const datasets = [
      {
        type: 'line',
        label: 'Cumulative Balance',
        data: balanceData,
        borderColor: '#6366F1',
        borderWidth: 2.5,
        tension: 0.1,
        pointBackgroundColor: '#6366F1',
        pointBorderColor: '#FFF',
        pointBorderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        fill: false,
        yAxisID: 'y1',
      },
      {
        type: 'bar',
        label: 'Income',
        data: incomeData,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 4,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
        yAxisID: 'y',
      },
      {
        type: 'bar',
        label: 'Expenses',
        data: expenseData,
        backgroundColor: 'rgba(244, 63, 94, 0.7)',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 4,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
        yAxisID: 'y',
      }
    ];

    if (compareEnabled) {
      datasets.push({
        type: 'line',
        label: 'Prev. Balance',
        data: balanceData.map(val => val * 0.75),
        borderColor: 'rgba(99, 102, 241, 0.4)',
        borderDash: [5, 5],
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 0,
        fill: false,
        yAxisID: 'y1',
      });
      datasets.push({
        type: 'bar',
        label: 'Prev. Income',
        data: incomeData.map(val => val * 0.8),
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 4,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
        yAxisID: 'y',
      });
      datasets.push({
        type: 'bar',
        label: 'Prev. Expenses',
        data: expenseData.map(val => val * 0.85),
        backgroundColor: 'rgba(244, 63, 94, 0.2)',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 4,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
        yAxisID: 'y',
      });
    }


    return { labels, datasets };
  }, [transactions, compareEnabled]);

  const comboOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1500, easing: 'easeOutQuart' },
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true, font: { family: "'Geist', sans-serif" } } },
        tooltip: { 
          mode: 'index', 
          intersect: false,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#94A3B8',
          titleFont: { size: 12, weight: 'normal', family: "'Geist', sans-serif" },
          bodyColor: '#FFFFFF',
          bodyFont: { size: 13, weight: '600', family: "'Geist Mono', monospace" },
          padding: 12,
          cornerRadius: 8,
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          boxPadding: 4,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) { label += ': '; }
              if (context.parsed.y !== null) { 
                label += formatCurrency(context.parsed.y); 
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 11 } } },
        y: { 
          type: 'linear', display: true, position: 'left', 
          grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
          border: { display: false },
          ticks: { color: '#94A3B8', font: { size: 11 }, callback: function(value) { return formatCompactCurrency(value); } }
        },
        y1: { type: 'linear', display: false, position: 'right', grid: { drawOnChartArea: false } },
      }
  };

  // Donut Chart Data
  const targetTransactions = transactions.filter(t => t.type === donutType);
  const baseExpenses = donutType === 'expense' ? { 'Infrastructure': 0, 'Payroll': 0, 'Marketing': 0, 'Office': 0, 'SaaS': 0, 'Consulting': 0 } : {};
  const catTotalsRaw = targetTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount; return acc;
  }, baseExpenses);
  
  const catTotals = Object.entries(catTotalsRaw).sort((a,b) => b[1] - a[1]);
  const totalForDonut = targetTransactions.reduce((acc, t) => acc + t.amount, 0);

  const CAT_COLORS = {
    'Infrastructure': '#6366F1', 'Payroll': '#10B981', 'Marketing': '#F59E0B', 
    'Office': '#D97706', 'SaaS': '#3B82F6', 'Consulting': '#059669', 'Revenue': '#10B981'
  };

  const donutConfig = {
    labels: catTotals.map(c => c[0]),
    datasets: [{
      data: catTotals.map(c => c[1]),
      backgroundColor: catTotals.map(c => CAT_COLORS[c[0]] || '#F43F5E'),
      borderWidth: 0,
      cutout: '75%',
    }]
  };

  const recentTx = [...transactions]
    .filter(t => {
      if (txFilter !== 'All') {
        if (txFilter === 'Income' && t.type !== 'income') return false;
        if (txFilter === 'Expense' && t.type !== 'expense') return false;
        if (txFilter !== 'Income' && txFilter !== 'Expense' && t.category !== txFilter) return false;
      }
      if (txSearchQuery) {
        const q = txSearchQuery.toLowerCase();
        if (!t.description.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const KPICard = ({ title, value, badgeColor, icon: Icon, changeStr, isPositive, delay, isHero }) => {
    const sparkData = useMemo(() => Array.from({length: 10}, () => Math.random() * (isPositive ? 10 : 5) + (isPositive ? 8 : 4)), [isPositive]);
    const chartColor = badgeColor === 'violet' ? '#6366F1' : badgeColor === 'teal' ? '#10B981' : badgeColor === 'rose' ? '#F43F5E' : '#F59E0B';
    const chartBg = badgeColor === 'violet' ? 'rgba(99,102,241,0.15)' : badgeColor === 'teal' ? 'rgba(16,185,129,0.15)' : badgeColor === 'rose' ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)';
    const chartData = { labels: Array(10).fill(''), datasets: [{ data: sparkData, borderColor: chartColor, borderWidth: 1.5, backgroundColor: chartBg, fill: true, pointRadius: 0, tension: 0.4 }] };
    const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } }, layout: { padding: 0 } };

    return (
      <Card className={`fade-in-up stagger-${delay} flex flex-col justify-between group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${isHero ? 'p-6 lg:p-8 bg-gradient-to-br from-[var(--color-elevated)] to-[var(--color-violet)]/10 border-[var(--color-violet)]/30 min-h-[200px]' : 'p-[14px] md:p-5 h-full'}`}>
        {isLoading ? (
          <div className="animate-pulse flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-2">
              <div className="h-4 bg-[var(--color-border-subtle)] rounded-full w-24"></div>
              <div className="w-[38px] h-[38px] bg-[var(--color-border-subtle)] rounded-full"></div>
            </div>
            <div className="h-8 bg-[var(--color-border-subtle)] rounded-full w-32 mb-1"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-2 group relative">
               <div className="flex items-center gap-1.5">
                 <span className={`font-semibold text-[var(--color-text-secondary)] brightness-110 font-sans ${isHero ? 'text-lg' : 'text-sm md:text-[17px]'}`}>{title}</span>
                 {title === "Savings Rate" && (
                   <div className="relative group/tooltip flex items-center">
                     <Info className="w-3.5 h-3.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer" />
                     <div className="absolute opacity-0 group-hover/tooltip:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[var(--color-elevated)] border border-[var(--color-border-subtle)] p-2 rounded-lg text-[10px] text-[var(--color-text-secondary)] font-mono shadow-xl pointer-events-none z-50 text-center">
                       ((Income - Expense) / Income) * 100
                     </div>
                   </div>
                 )}
               </div>
               <div className={`rounded-xl flex items-center justify-center bg-[var(--color-popover)] shrink-0 ${isHero ? 'w-12 h-12 border border-[var(--color-border-subtle)]/50 shadow-sm' : 'w-[38px] h-[38px] md:w-8 md:h-8 min-w-[38px] md:min-w-[32px]'}`}>
                 <Icon className={isHero ? 'w-6 h-6' : 'w-4 h-4'} style={{ color: `var(--color-${badgeColor})`}} />
               </div>
            </div>
            <div className={`font-mono tracking-tight text-[var(--color-text-primary)] mb-1 ${isHero ? 'text-[32px] md:text-[44px] font-bold' : value.length > 8 ? 'text-[16px] md:text-[20px]' : 'text-[18px] md:text-[28px]'}`}>{value}</div>
            <div className="flex justify-between items-end mt-1">
               <div className="flex items-center gap-1.5">
                 <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--color-${isPositive ? 'teal' : 'rose'})]/10 text-[var(--color-${isPositive ? 'teal' : 'rose'})]`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {changeStr}
                 </div>
                 <span className="text-[9px] text-[var(--color-text-secondary)] font-medium bg-[var(--color-popover)] px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)]/50 hidden lg:block">vs last month</span>
               </div>
               <div className={`${isHero ? 'w-32 h-10' : 'w-20 h-8'} opacity-80`}>
                 <Line data={chartData} options={chartOpts} />
               </div>
            </div>
          </>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-in-up">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight">Overview</h1>
          <p className="hidden md:block text-sm text-[var(--color-text-secondary)] mt-2 font-medium">Consolidated ledger overview</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center bg-[var(--color-elevated)] border border-[var(--color-border-subtle)] p-1.5 rounded-lg overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full">
             {['1W', '1M', '6M', '1Y', 'All'].map((p, idx) => (
               <div key={p} className="relative group">
                 <button 
                    onClick={() => setPeriod(p)} 
                    className={`px-5 py-2.5 text-[13px] font-semibold rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-text-primary)] ${period === p ? 'bg-[var(--color-violet)] text-white shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-popover)]'}`}
                 >
                   {p}
                 </button>
                 <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[var(--color-popover)] text-[10px] text-[var(--color-text-primary)] px-2 py-0.5 rounded-md shadow-[0_4px_16px_rgba(0,0,0,0.4)] border border-[var(--color-border-subtle)] pointer-events-none whitespace-nowrap z-50">Press {idx + 1}</div>
               </div>
             ))}
          </div>
          <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest font-semibold pr-1">
             {period === '1W' ? 'Last 7 days' : period === '1M' ? 'Last month' : period === '6M' ? 'Last 6 months' : period === '1Y' ? 'Last year' : 'Oct 2025 — Mar 2026 (Full Data)'}
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
         <div className="lg:col-span-2">
           <KPICard title="Net Balance" value={formatCompactCurrency(metrics.balance)} badgeColor="violet" icon={Landmark} changeStr="4.2%" isPositive={true} delay={1} isHero={true} />
         </div>
         <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-5">
           <KPICard title="Total Income" value={formatCompactCurrency(metrics.totalIncome)} badgeColor="teal" icon={TrendingUp} changeStr="12.1%" isPositive={true} delay={2} />
           <KPICard title="Total Expenses" value={formatCompactCurrency(metrics.totalExpense)} badgeColor="rose" icon={TrendingDown} changeStr="2.4%" isPositive={false} delay={3} />
           <KPICard title="Savings Rate" value={`${metrics.savingsRate}%`} badgeColor="amber" icon={Shield} changeStr="1.2%" isPositive={true} delay={4} />
         </div>
      </div>

      {/* Chart Row (1.7 : 1 ratio) */}
      <div className="flex flex-col lg:flex-row gap-5 max-w-full overflow-hidden">
         <Card className="flex-[1.7] p-4 md:p-5 fade-in-up stagger-4 flex flex-col h-[280px] md:h-[400px] overflow-hidden">
           <div className="flex justify-between items-center mb-4">
             <div>
               <h3 className="text-[13px] md:text-base font-semibold">Cash Flow</h3>
               <span className="hidden md:block text-xs text-[var(--color-text-secondary)] mt-0.5">Income vs Expense overlaid with Net Balance</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="text-xs font-medium text-[var(--color-text-secondary)]">Compare</span>
               <button onClick={() => setCompareEnabled(!compareEnabled)} className={`w-8 h-4 rounded-full transition-colors relative ${compareEnabled ? 'bg-[var(--color-violet)]' : 'bg-[var(--color-border-subtle)]'}`}>
                 <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${compareEnabled ? 'translate-x-4' : 'translate-x-0'}`}></span>
               </button>
             </div>
           </div>
           <div className="flex-1 min-h-[180px] md:min-h-[300px] flex items-center justify-center max-w-full overflow-hidden">
             {transactions.length > 0 ? <Bar data={comboChartData} options={comboOptions} /> : (
               <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)] opacity-60 fade-in-up">
                 <Inbox className="w-10 h-10 mb-2" />
                 <span className="text-sm font-medium">No cash flow data</span>
               </div>
             )}
           </div>
         </Card>

         <Card className="flex-[1] p-4 md:p-5 fade-in-up stagger-5 flex flex-col h-auto md:h-[400px] overflow-hidden">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-[13px] md:text-base font-semibold">Distribution</h3>
             <div className="flex bg-[var(--color-primary)] border border-[var(--color-border-subtle)] rounded-lg p-0.5 min-h-[44px] md:min-h-0 items-center">
               <button onClick={() => setDonutType('expense')} className={`px-3 py-2 md:py-0.5 min-h-[36px] md:min-h-0 text-[10px] font-semibold rounded-md transition-colors ${donutType === 'expense' ? 'bg-[var(--color-rose)] text-white' : 'text-[var(--color-text-secondary)] opacity-50 hover:opacity-100 hover:text-[var(--color-text-primary)]'}`}>Expense</button>
               <button onClick={() => setDonutType('income')} className={`px-3 py-2 md:py-0.5 min-h-[36px] md:min-h-0 text-[10px] font-semibold rounded-md transition-colors ${donutType === 'income' ? 'bg-[var(--color-teal)] text-white' : 'text-[var(--color-text-secondary)] opacity-50 hover:opacity-100 hover:text-[var(--color-text-primary)]'}`}>Income</button>
             </div>
           </div>
           <div className="relative w-[140px] h-[140px] md:max-w-[180px] md:w-full md:aspect-square md:h-auto mx-auto mb-6 flex items-center justify-center">
             {transactions.length > 0 ? (
                <>
                  <Doughnut data={donutConfig} options={{ plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(context) { return ' ' + context.label + ': ' + formatCurrency(context.parsed); } } } }, maintainAspectRatio: false }} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-3 text-center">
                    <span className="text-[8px] md:text-[9px] text-[var(--color-text-secondary)] font-sans uppercase tracking-widest mb-0.5">Total</span>
                    <span className="text-[11px] md:text-[13px] font-mono font-semibold text-[var(--color-text-primary)] truncate max-w-[85%]">{formatCurrency(totalForDonut)}</span>
                  </div>
                 </>
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-secondary)] opacity-60 absolute inset-0 fade-in-up">
                 <PieChart className="w-8 h-8 mb-2" />
                 <span className="text-xs font-medium">No data</span>
               </div>
             )}
           </div>
           
           <div className="flex-1 space-y-3 pr-2 overflow-y-auto scrollbar-thin">
              {catTotals.map(([cat, amt], i) => {
                 const MOCK_LIMITS = { 'SaaS': 25000, 'Payroll': 65000, 'Marketing': 15000, 'Infrastructure': 20000, 'Office': 5000, 'Consulting': 12000, 'Revenue': 500000 };
                 const isExpense = donutType === 'expense';
                 const limit = isExpense ? (MOCK_LIMITS[cat] || (amt * 1.5)) : (amt * 1.25);
                 const budgetPct = Math.min((amt / limit) * 100, 100);
                 const isOverBudget = isExpense && (amt > limit);
                 
                 return (
                   <div key={cat} className="text-xs group">
                     <div className="flex justify-between items-center mb-1.5 gap-2">
                       <div className="flex items-center gap-1.5 min-w-0">
                         <span className="text-[var(--color-text-primary)] truncate max-w-[80px] sm:max-w-full font-medium">{cat}</span>
                         {isOverBudget && <span className="text-[8px] bg-[var(--color-rose)]/10 text-[var(--color-rose)] px-1 py-0.5 rounded uppercase tracking-widest font-bold">Over Budget</span>}
                       </div>
                       <span className="font-mono text-[var(--color-text-secondary)] shrink-0 text-[10px] sm:text-xs">
                         <span className={isOverBudget ? 'text-[var(--color-rose)] font-semibold' : 'text-[var(--color-text-primary)]'}>{formatCompactCurrency(amt)}</span>
                         <span className="opacity-50"> / {formatCompactCurrency(limit)}</span>
                       </span>
                     </div>
                     <div className="w-full h-1.5 bg-[var(--color-border-subtle)] rounded-full overflow-hidden flex">
                       <div className={`h-full rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-[var(--color-rose)]' : ''}`} style={{ width: `${budgetPct}%`, backgroundColor: isOverBudget ? undefined : donutConfig.datasets[0].backgroundColor[i] }}></div>
                     </div>
                   </div>
                 );
              })}
           </div>
         </Card>
      </div>

      {/* Bottom Row */}
      <div className="flex flex-col lg:flex-row gap-5 pb-5">
         {/* Recent Transactions (Left) */}
         <Card className="flex-[1.7] p-5 fade-in-up stagger-5 flex flex-col h-full hover:shadow-xl transition-all duration-300">
           <div className="flex items-center justify-between mb-3 relative">
             <h3 className="text-base font-semibold">Recent Transactions</h3>
             <div className="flex items-center gap-3">
               <div className="relative">
                 <button onClick={() => setExportOpen(!exportOpen)} className="text-xs flex items-center gap-1 font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                   <Download className="w-3.5 h-3.5" /> Export
                 </button>
                 {exportOpen && (
                   <div className="absolute right-0 top-full mt-2 w-32 bg-[var(--color-elevated)] border border-[var(--color-border-subtle)] shadow-xl z-50 rounded-lg overflow-hidden">
                     <button className="w-full text-left px-3 py-2 text-[10px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-popover)] hover:text-[var(--color-text-primary)] transition-colors" onClick={() => setExportOpen(false)}>Export as CSV</button>
                     <button className="w-full text-left px-3 py-2 text-[10px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-popover)] hover:text-[var(--color-text-primary)] transition-colors border-t border-[var(--color-border-subtle)]" onClick={() => setExportOpen(false)}>Export as PDF</button>
                   </div>
                 )}
               </div>
               <Link to="/transactions" className="text-xs font-medium text-[var(--color-brand)] hover:text-[var(--color-text-primary)] transition-colors">View All</Link>
             </div>
           </div>
           
           {/* Filters & Search */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--color-border-subtle)]/50">
             <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
             {filterCats.map(cat => (
               <button 
                 key={cat} 
                 onClick={() => setTxFilter(cat)}
                 className={`px-3 py-1.5 text-[10px] font-semibold border rounded-md uppercase tracking-wider transition-colors shrink-0 
                   ${cat === 'All' && txFilter === 'All' ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)] border-[var(--color-text-primary)]' : 
                   cat === 'Income' && txFilter === 'Income' ? 'bg-[var(--color-teal)] text-[#0F172A] border-[var(--color-teal)]' :
                   cat === 'Expense' && txFilter === 'Expense' ? 'bg-[var(--color-rose)] text-[#0F172A] border-[var(--color-rose)]' :
                   cat === 'Payroll' && txFilter === 'Payroll' ? 'bg-[var(--color-violet)] text-white border-[var(--color-violet)]' :
                   txFilter === cat ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)] border-[var(--color-text-primary)]' :
                   'bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-popover)]'}`}
               >
                 {cat}
               </button>
             ))}
             </div>
             
             <div className="relative shrink-0">
               <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
               <input 
                 type="text" 
                 placeholder="Search" 
                 value={txSearchQuery}
                 onChange={(e) => setTxSearchQuery(e.target.value)}
                 className="w-full md:w-[150px] pl-8 pr-3 py-1.5 bg-[var(--color-popover)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-primary)] rounded-md placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[var(--color-violet)] focus:ring-1 focus:ring-[var(--color-violet)] transition-all shadow-sm"
               />
             </div>
           </div>
           
           <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin flex-1">
             {recentTx.map((t, index) => (
               <div key={t.id} className={`flex justify-between items-center group hover:bg-[var(--color-popover)] rounded-lg transition-colors py-2 px-3 border border-transparent hover:border-[var(--color-border-subtle)]/50 ${index === 4 ? 'hidden md:flex' : ''}`}>
                 <div className="flex items-center gap-3">
                   <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]/30 ${t.type === 'income' ? 'bg-[var(--color-teal)]/10 text-[var(--color-teal)]' : 'bg-[var(--color-popover)]'}`}>
                     {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                   </div>
                   <div className="flex flex-col">
                     <span className="text-sm font-medium leading-tight mb-0.5 text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors">{t.description}</span>
                     <span className="text-[10px] text-[var(--color-text-secondary)] flex items-center gap-1.5">
                       {t.category} <span className="w-1 h-1 rounded-full bg-[var(--color-border-subtle)]"></span> {new Date(t.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                     </span>
                   </div>
                 </div>
                 <div className="flex flex-col items-end">
                   <div className="flex items-center gap-1.5 flex-row-reverse md:flex-row">
                     <span className={`text-sm font-mono font-bold tracking-tight ${t.type === 'income' ? 'text-[var(--color-teal)]' : 'text-[var(--color-text-primary)]'}`}>
                       {t.type === 'income' ? '+' : '-'}{formatCompactCurrency(t.amount)}
                     </span>
                   </div>
                 </div>
               </div>
             ))}
             {recentTx.length === 0 && <div className="text-center py-6 text-xs text-[var(--color-text-secondary)]">No transactions found</div>}
           </div>
         </Card>

         {/* Smart Insights & Minor KPIs (Right) */}
         <div className="flex-[1] flex flex-col gap-5 fade-in-up stagger-5" ref={bottomRef}>
            <Card className="p-5 flex-1 relative overflow-hidden bg-gradient-to-br from-[var(--color-elevated)] to-[var(--color-popover)] hover:shadow-xl transition-shadow duration-300">
               <div className="flex items-center gap-2 mb-4">
                 <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-500">
                   <Sparkles className="w-3.5 h-3.5" />
                 </div>
                 <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Smart Insights</h3>
               </div>
               
               <ul className="space-y-4">
                 <li className="flex items-start gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-rose)] mt-1.5 shrink-0"></div>
                   <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                     Highest spending category is <strong className="text-[var(--color-text-primary)]">{catTotals[0]?.[0]}</strong>, making up <strong className="font-mono text-[var(--color-rose)]">{formatCompactCurrency(catTotals[0]?.[1] || 0)}</strong> of expenses.
                   </p>
                 </li>
                 <li className="flex items-start gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-teal)] mt-1.5 shrink-0"></div>
                   <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                     You saved <strong className="text-[var(--color-teal)] font-mono">{metrics.savingsRate}%</strong> of total income this period.
                   </p>
                 </li>
                 <li className="flex items-start gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-amber)] mt-1.5 shrink-0"></div>
                   <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                     {globalMetrics.runway < 12 
                        ? <>Runway is under 12 months. Consider reducing <strong className="text-[var(--color-text-primary)]">burn rate</strong> to extend capital.</>
                        : <>Financial health is stable with <strong className="text-[var(--color-text-primary)] font-mono">{globalMetrics.runway} months</strong> of runway at current burn.</>
                     }
                   </p>
                 </li>
               </ul>
            </Card>

            <div className="grid grid-cols-2 gap-4">
               {isLoading || !bottomInView ? (
                  <>
                     <Card className="h-24 animate-pulse bg-[var(--color-popover)]" />
                     <Card className="h-24 animate-pulse bg-[var(--color-popover)]" />
                  </>
               ) : (
                  [
                    { icon: Gauge, label: "Burn Rate", value: formatCompactCurrency(globalMetrics.burnRate), sub: "/month", c: 'rose' },
                    { icon: Hourglass, label: "Runway", value: `${globalMetrics.runway}`, sub: " Mths", c: 'amber' },
                  ].map((insight, idx) => (
                    <Card key={idx} className="relative py-4 px-3 flex flex-col items-center justify-center text-center group border-t-[3px] hover:-translate-y-1 hover:shadow-lg transition-all duration-300" style={{ borderTopColor: `var(--color-${insight.c})` }}>
                      <div className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">{insight.label}</div>
                      <div className="text-lg md:text-xl font-mono font-medium text-[var(--color-text-primary)] flex items-baseline">
                        {insight.value}
                        {insight.sub && <span className="text-[10px] font-sans text-[var(--color-text-secondary)] lowercase ml-0.5">{insight.sub}</span>}
                      </div>
                    </Card>
                  ))
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

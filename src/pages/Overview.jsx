import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppProvider';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement, LineController, BarController, DoughnutController } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown, Target, Box, CreditCard, ChevronRight } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler, LineController, BarController, DoughnutController);
ChartJS.defaults.color = '#8B949E';
ChartJS.defaults.font.family = "'JetBrains Mono', monospace";

export const Overview = () => {
  const { transactions, formatCurrency, openModal } = useAppContext();
  const [period, setPeriod] = useState('All');
  const [donutType, setDonutType] = useState('expense');

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

    return {
      labels,
      datasets: [
        {
          type: 'line',
          label: 'Cumulative Balance',
          data: balanceData,
          borderColor: '#7C6EFA',
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: '#7C6EFA',
          pointRadius: 3,
          yAxisID: 'y1',
        },
        {
          type: 'bar',
          label: 'Income',
          data: incomeData,
          backgroundColor: 'rgba(0, 212, 170, 0.2)',
          borderColor: '#00D4AA',
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y',
        },
        {
          type: 'bar',
          label: 'Expenses',
          data: expenseData,
          backgroundColor: 'rgba(255, 78, 106, 0.2)',
          borderColor: '#FF4E6A',
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y',
        }
      ]
    };
  }, [transactions]);

  const comboOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, usePointStyle: true } },
      tooltip: { 
        mode: 'index', 
        intersect: false,
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
      x: { grid: { display: false } },
      y: { 
        type: 'linear', display: true, position: 'left', grid: { color: '#1E2840' },
        ticks: { callback: function(value) { return formatCurrency(value); } }
      },
      y1: { type: 'linear', display: false, position: 'right', grid: { drawOnChartArea: false } }, // Hide secondary axis labels
    }
  };

  // Donut Chart Data
  const targetTransactions = transactions.filter(t => t.type === donutType);
  const catTotals = Object.entries(targetTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount; return acc;
  }, {})).sort((a,b) => b[1] - a[1]);
  
  const totalForDonut = targetTransactions.reduce((acc, t) => acc + t.amount, 0);

  const donutConfig = {
    labels: catTotals.map(c => c[0]),
    datasets: [{
      data: catTotals.map(c => c[1]),
      backgroundColor: ['#2563EB', '#059669', '#D97706', '#DC2626', '#1E40AF', '#047857', '#B45309', '#B91C1C'],
      borderWidth: 0,
      cutout: '72%',
    }]
  };

  const recentTx = [...transactions].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const KPICard = ({ title, value, badgeColor, icon: Icon, changeStr, isPositive, delay }) => (
    <Card className={`p-[14px] md:p-5 fade-in-up stagger-${delay}`}>
      <div className="flex justify-between items-start mb-2">
         <span className="text-[13px] md:text-sm font-medium text-[var(--color-text-secondary)] font-sans">{title}</span>
         <div className="w-[38px] h-[38px] md:w-8 md:h-8 min-w-[38px] md:min-w-[32px] rounded-[8px] flex items-center justify-center bg-[var(--color-popover)]">
           <Icon className="w-4 h-4" style={{ color: `var(--color-${badgeColor})`}} />
         </div>
      </div>
      <div className="text-[18px] md:text-[28px] font-mono tracking-tight text-white mb-2">{value}</div>
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--color-${isPositive ? 'teal' : 'rose'})]/10 text-[var(--color-${isPositive ? 'teal' : 'rose'})]`}>
         {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
         {changeStr} vs last
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      
      {/* Title & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-in-up">
        <div>
          <h1 className="text-[13px] md:text-2xl font-semibold text-white tracking-tight">Overview</h1>
          <p className="hidden md:block text-sm text-[var(--color-text-secondary)]">Consolidated ledger overview</p>
        </div>
        <div className="flex items-center bg-[var(--color-elevated)] border border-[var(--color-border-subtle)] p-1 rounded-full overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full">
           {['1W', '1M', '6M', '1Y', 'All'].map(p => (
             <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-1.5 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 text-xs font-medium rounded-full transition-all ${period === p ? 'bg-[var(--color-popover)] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
               {p}
             </button>
           ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
         <KPICard title="Net Balance" value={formatCurrency(metrics.balance)} badgeColor="violet" icon={Wallet} changeStr="4.2%" isPositive={true} delay={1} />
         <KPICard title="Total Income" value={formatCurrency(metrics.totalIncome)} badgeColor="teal" icon={TrendingUp} changeStr="12.1%" isPositive={true} delay={2} />
         <KPICard title="Total Expenses" value={formatCurrency(metrics.totalExpense)} badgeColor="rose" icon={TrendingDown} changeStr="2.4%" isPositive={false} delay={3} />
         <KPICard title="Savings Rate" value={`${metrics.savingsRate}%`} badgeColor="amber" icon={Target} changeStr="1.2%" isPositive={true} delay={4} />
      </div>

      {/* Chart Row (1.7 : 1 ratio) */}
      <div className="flex flex-col lg:flex-row gap-5 max-w-full overflow-hidden">
         <Card className="flex-[1.7] p-4 md:p-5 fade-in-up stagger-4 flex flex-col h-[280px] md:h-[400px] overflow-hidden">
           <div className="mb-4">
             <h3 className="text-[13px] md:text-base font-semibold">Cash Flow</h3>
             <span className="hidden md:block text-xs text-[var(--color-text-secondary)]">Income vs Expense overlaid with Net Balance</span>
           </div>
           <div className="flex-1 min-h-[180px] md:min-h-[300px] flex items-center justify-center max-w-full overflow-hidden">
             {transactions.length > 0 ? <Bar data={comboChartData} options={comboOptions} /> : <span className="text-[var(--color-text-secondary)] text-sm font-sans tracking-tight">No data available</span>}
           </div>
         </Card>

         <Card className="flex-[1] p-4 md:p-5 fade-in-up stagger-5 flex flex-col h-auto md:h-[400px] overflow-hidden">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-[13px] md:text-base font-semibold">Distribution</h3>
             <div className="flex bg-[var(--color-primary)] border border-[var(--color-border-subtle)] rounded p-0.5 min-h-[44px] md:min-h-0 items-center">
               <button onClick={() => setDonutType('expense')} className={`px-2 py-2 md:py-0.5 min-h-[36px] md:min-h-0 text-[10px] font-semibold rounded ${donutType === 'expense' ? 'bg-[var(--color-elevated)] text-white' : 'text-gray-500'}`}>Expense</button>
               <button onClick={() => setDonutType('income')} className={`px-2 py-2 md:py-0.5 min-h-[36px] md:min-h-0 text-[10px] font-semibold rounded ${donutType === 'income' ? 'bg-[var(--color-elevated)] text-white' : 'text-gray-500'}`}>Income</button>
             </div>
           </div>
           <div className="relative w-[110px] h-[110px] md:max-w-[180px] md:w-full md:aspect-square md:h-auto mx-auto mb-6 flex items-center justify-center">
             {transactions.length > 0 ? (
                <>
                  <Doughnut data={donutConfig} options={{ plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(context) { return ' ' + context.label + ': ' + formatCurrency(context.parsed); } } } }, maintainAspectRatio: false }} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-[var(--color-text-secondary)] font-sans uppercase tracking-widest">Total</span>
                    <span className="text-lg font-mono font-semibold text-white">{formatCurrency(totalForDonut)}</span>
                  </div>
                </>
             ) : <span className="text-[var(--color-text-secondary)] text-sm font-sans tracking-tight">No data</span>}
           </div>
           
           <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {catTotals.map(([cat, amt], i) => {
                 const pct = totalForDonut ? (amt / totalForDonut) * 100 : 0;
                 return (
                   <div key={cat} className="text-xs">
                     <div className="flex justify-between mb-1">
                       <span className="text-gray-300">{cat}</span>
                       <span className="font-mono text-gray-400">{pct.toFixed(0)}%</span>
                     </div>
                     <div className="w-full h-1.5 bg-[var(--color-popover)] rounded-full overflow-hidden">
                       <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: donutConfig.datasets[0].backgroundColor[i] }}></div>
                     </div>
                   </div>
                 );
              })}
           </div>
         </Card>
      </div>

      {/* Bottom Row (1 : 1.6 ratio) */}
      <div className="flex flex-col lg:flex-row gap-5 pb-5">
         <Card className="flex-[1] p-5 fade-in-up stagger-5">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-base font-semibold">Recent Transactions</h3>
             <button className="text-xs text-[var(--color-violet)] hover:text-white transition-colors">View All</button>
           </div>
           <div className="space-y-4">
             {recentTx.map((t, index) => (
               <div key={t.id} className={`flex justify-between items-center bg-[var(--color-popover)]/50 py-[8px] px-0 md:p-2.5 md:rounded-lg border-b md:border md:border-[var(--color-border-subtle)] border-gray-800 ${index === 4 ? 'hidden md:flex' : ''}`}>
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-[var(--color-elevated)] flex items-center justify-center text-gray-500 border border-[var(--color-border-subtle)]">
                     <Box className="w-3.5 h-3.5" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-sm font-medium leading-none mb-1 text-white">{t.description}</span>
                     <span className="text-[10px] text-gray-500">{t.category}</span>
                   </div>
                 </div>
                 <div className="flex flex-col items-end">
                   <span className={`text-xs font-mono font-medium ${t.type === 'income' ? 'text-[var(--color-teal)]' : 'text-[var(--color-text-primary)]'}`}>
                     {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                   </span>
                   <span className="text-[10px] text-gray-500">{new Date(t.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                 </div>
               </div>
             ))}
           </div>
         </Card>

         <div className="flex-[1.6] grid grid-cols-1 md:grid-cols-3 gap-5 fade-in-up stagger-5">
            {[
              { icon: Target, label: "Burn Rate", value: formatCurrency(metrics.totalExpense / 6), desc: "Average trailing 6 months", c: 'violet' },
              { icon: Box, label: "Total Assets", value: "32", desc: "Active monitored accounts", c: 'teal' },
              { icon: CreditCard, label: "Runway", value: "24.5", desc: "Months at current burn", c: 'amber' },
            ].map((insight, idx) => (
              <Card key={idx} className="py-[10px] px-[12px] md:p-5 flex flex-col justify-between group cursor-pointer hover:bg-[var(--color-popover)] min-h-[88px]">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div className={`w-8 h-8 rounded-lg bg-[var(--color-${insight.c})]/10 flex items-center justify-center text-[var(--color-${insight.c})]`}>
                     <insight.icon className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-sm text-[var(--color-text-secondary)] mb-1">{insight.label}</div>
                  <div className="text-2xl font-mono text-white mb-2">{insight.value}</div>
                  <div className="text-[10px] text-gray-500">{insight.desc}</div>
                </div>
              </Card>
            ))}
         </div>
      </div>
    </div>
  );
};

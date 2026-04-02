import React, { useState, useMemo } from 'react';
import { Download, Plus, Search, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppProvider';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { Select } from '../components/UI/Select';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/UI/Table';

export const Transactions = () => {
  const { transactions, role, deleteTransaction, formatCurrency, openModal } = useAppContext();
  
  // States
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [catFilter, setCatFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return ['All', ...Array.from(cats), 'General', 'Revenue', 'Payroll', 'Infrastructure', 'Marketing', 'SaaS', 'Office'];
  }, [transactions]);
  const uniqueCategories = [...new Set(categories)];

  // Processing
  const processedTransactions = useMemo(() => {
    let filtered = transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'All' || t.type === typeFilter.toLowerCase();
      const matchCat = catFilter === 'All' || t.category === catFilter;
      return matchSearch && matchType && matchCat;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (sortConfig.key === 'amount') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else if (sortConfig.key === 'date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, search, typeFilter, catFilter, sortConfig]);

  const pageCount = Math.ceil(processedTransactions.length / itemsPerPage);
  const currentData = processedTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const rows = processedTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      `"${t.description}"`,
      t.category,
      t.type,
      t.amount
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'zorvyn_transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] tracking-wide">Transactions</h1>
      </div>

      <Card className="p-6 overflow-visible border-transparent shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-9" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <div className="flex gap-2">
              <Button variant={typeFilter === 'All' ? 'primary' : 'secondary'} onClick={() => setTypeFilter('All')}>All</Button>
              <Button variant={typeFilter === 'Income' ? 'primary' : 'secondary'} onClick={() => setTypeFilter('Income')}>Income</Button>
              <Button variant={typeFilter === 'Expense' ? 'primary' : 'secondary'} onClick={() => setTypeFilter('Expense')}>Expense</Button>
            </div>
            <Select className="w-full sm:w-48" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            {role === 'Admin' && (
              <Button onClick={() => openModal()}>
                <Plus className="h-4 w-4 mr-2" /> Add 
              </Button>
            )}
          </div>
        </div>

        <div className="hidden md:block w-full overflow-x-auto pb-2 scrollbar-thin">
          <Table className="min-w-[800px]">
            <TableHeader>
            <TableRow className="border-b-[var(--color-border-subtle)] hover:bg-transparent">
              <TableHead className="cursor-pointer font-sans uppercase tracking-wider text-[10px]" onClick={() => handleSort('date')}>
                Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline w-3 h-3"/> : <ChevronDown className="inline w-3 h-3"/>)}
              </TableHead>
              <TableHead className="hidden lg:table-cell cursor-pointer font-sans uppercase tracking-wider text-[10px]" onClick={() => handleSort('description')}>
                Description {sortConfig.key === 'description' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline w-3 h-3"/> : <ChevronDown className="inline w-3 h-3"/>)}
              </TableHead>
              <TableHead className="cursor-pointer font-sans uppercase tracking-wider text-[10px]" onClick={() => handleSort('category')}>
                Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline w-3 h-3"/> : <ChevronDown className="inline w-3 h-3"/>)}
              </TableHead>
              <TableHead className="font-sans uppercase tracking-wider text-[10px]">Type</TableHead>
              <TableHead className="text-right cursor-pointer font-sans uppercase tracking-wider text-[10px]" onClick={() => handleSort('amount')}>
                Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline w-3 h-3"/> : <ChevronDown className="inline w-3 h-3"/>)}
              </TableHead>
              {role === 'Admin' && <TableHead className="text-right font-sans uppercase tracking-wider text-[10px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? currentData.map((t) => (
              <TableRow key={t.id} className="border-b-[var(--color-border-subtle)] hover:bg-[var(--color-popover)] border-b last:border-b-0">
                <TableCell className="text-sm font-medium">{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</TableCell>
                <TableCell className="hidden lg:table-cell font-semibold text-[var(--color-text-primary)]">{t.description}</TableCell>
                <TableCell>
                  <Badge variant="neutral">{t.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={t.type}>{t.type}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  <span className={t.type === 'income' ? 'text-[var(--color-teal)]' : 'text-gray-300'}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </TableCell>
                {role === 'Admin' && (
                  <TableCell className="text-right flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openModal(t)}>
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { if(window.confirm('Are you sure you want to permanently delete this transaction?')) deleteTransaction(t.id); }}>
                      <Trash2 className="w-4 h-4 text-[var(--color-rose)]" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
             )) : (
              <TableRow>
                <TableCell colSpan={role === 'Admin' ? 6 : 5} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm">No transactions match your search filters.</p>
                  </div>
                </TableCell>
              </TableRow>
             )}
          </TableBody>
        </Table>
        </div>

        {/* Mobile Cards rendering block */}
        <div className="md:hidden flex flex-col gap-3">
          {currentData.length > 0 ? currentData.map(t => (
            <div key={t.id} className="bg-[var(--color-elevated)] border border-[var(--color-border-subtle)] p-4 rounded-xl flex flex-col gap-2 relative">
              <div className="flex justify-between items-start">
                <span className="text-[12px] text-gray-500 font-medium">
                  {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                </span>
                <span className={`text-[15px] font-mono font-semibold ${t.type === 'income' ? 'text-[var(--color-teal)]' : 'text-[var(--color-text-primary)]'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
              <div className="flex justify-between items-end mt-1">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[15px] font-semibold text-[var(--color-text-primary)] leading-tight">{t.description}</span>
                  <div className="flex gap-2">
                    <Badge variant="neutral">{t.category}</Badge>
                    <Badge variant={t.type}>{t.type}</Badge>
                  </div>
                </div>
                {role === 'Admin' && (
                  <div className="flex gap-2 min-h-[44px]">
                    <Button variant="ghost" size="icon" className="w-[44px] h-[44px]" onClick={() => openModal(t)}>
                      <Edit2 className="w-[18px] h-[18px] text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-[44px] h-[44px]" onClick={() => { if(window.confirm('Delete this?')) deleteTransaction(t.id); }}>
                      <Trash2 className="w-[18px] h-[18px] text-[var(--color-rose)]" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-10 text-gray-500 bg-[var(--color-elevated)] rounded-xl border border-[var(--color-border-subtle)]">
                <p className="text-sm">No transactions found.</p>
            </div>
          )}
        </div>

        {pageCount > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className="text-xs text-gray-500 font-medium">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, processedTransactions.length)} of {processedTransactions.length}
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
              <Button variant="secondary" size="sm" disabled={currentPage === pageCount} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

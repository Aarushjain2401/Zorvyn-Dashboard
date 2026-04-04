import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppProvider';
import { Modal } from './Modal';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';

export const TransactionModal = () => {
  const { transactions, isModalOpen, setIsModalOpen, editingData, addTransaction, editTransaction } = useAppContext();
  
  const [formData, setFormData] = useState({ description: '', amount: '', type: 'expense', category: 'General', date: new Date().toISOString().split('T')[0] });
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  // Update form data when modal opens with editingData
  useEffect(() => {
    if (editingData) {
      setFormData({
        description: editingData.description,
        amount: editingData.amount,
        type: editingData.type,
        category: editingData.category,
        date: new Date(editingData.date).toISOString().split('T')[0]
      });
    } else {
      setFormData({ description: '', amount: '', type: 'expense', category: 'General', date: new Date().toISOString().split('T')[0] });
    }
  }, [editingData, isModalOpen]);

  // Extract unique categories for datalist to help user input
  const uniqueCategories = [...new Set(transactions.map(t => t.category)), 'General', 'Revenue', 'Payroll', 'Infrastructure', 'Marketing', 'SaaS', 'Office'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      description: formData.description.trim(),
      amount: Number(formData.amount),
      date: new Date(formData.date).toISOString()
    };
    if (editingData) {
      editTransaction(editingData.id, payload);
    } else {
      addTransaction(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingData ? 'Edit Transaction' : 'Add Transaction'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1 text-[var(--color-text-secondary)]">Description</label>
          <Input required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--color-text-secondary)]">Amount USD</label>
            <Input type="number" min="0" step="0.01" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--color-text-secondary)]">Date</label>
            <Input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-xs font-semibold mb-1 text-[var(--color-text-secondary)]">Type</label>
            <Input 
              required 
              value={formData.type} 
              onChange={(e) => setFormData({...formData, type: e.target.value.toLowerCase()})} 
              onFocus={() => setShowTypeDropdown(true)}
              onBlur={() => setTimeout(() => setShowTypeDropdown(false), 200)}
            />
            {showTypeDropdown && (
              <ul className="absolute z-50 w-full mt-1 bg-[var(--color-elevated)] border border-[var(--color-border-subtle)] rounded-md shadow-[0_4px_24px_rgba(0,0,0,0.5)] max-h-40 overflow-auto">
                {['expense', 'income'].map(opt => (
                  <li 
                    key={opt}
                    className="px-3 py-2 text-sm text-white hover:bg-[var(--color-primary)] cursor-pointer"
                    onClick={() => { setFormData({...formData, type: opt}); setShowTypeDropdown(false); }}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative">
            <label className="block text-xs font-semibold mb-1 text-[var(--color-text-secondary)]">Category</label>
            <Input 
              required 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})} 
              onFocus={() => setShowCatDropdown(true)}
              onBlur={() => setTimeout(() => setShowCatDropdown(false), 200)}
            />
            {showCatDropdown && (
              <ul className="absolute z-50 w-full mt-1 bg-[var(--color-elevated)] border border-[var(--color-border-subtle)] rounded-md shadow-[0_4px_24px_rgba(0,0,0,0.5)] max-h-40 overflow-auto">
                {[...new Set(uniqueCategories)].map(c => (
                  <li 
                    key={c}
                    className="px-3 py-2 text-sm text-white hover:bg-[var(--color-primary)] cursor-pointer"
                    onClick={() => { setFormData({...formData, category: c}); setShowCatDropdown(false); }}
                  >
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button type="submit">{editingData ? 'Update' : 'Add'}</Button>
        </div>
      </form>
    </Modal>
  );
};

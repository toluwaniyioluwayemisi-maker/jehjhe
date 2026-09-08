import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  Calendar,
  Search,
  Trash2,
  Edit3,
  DollarSign,
  TrendingDown,
  AlertCircle,
  FileText,
  Filter,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowUpDown,
  X,
  Clock,
  Layers,
} from 'lucide-react';
import { MiscellaneousExpense, CurrencyConfig } from '../types';
import { formatCurrency, calculateTotalMiscellaneousExpenses } from '../utils/storage';

interface MiscellaneousExpensesSectionProps {
  expenses: MiscellaneousExpense[];
  currency: CurrencyConfig;
  onSaveExpense: (expense: MiscellaneousExpense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

const COMMON_EXPENSE_SUGGESTIONS = [
  'Generator Petrol / Diesel',
  'Delivery Dispatch Maintenance',
  'Sanitation & Hygiene Supplies',
  'Factory Utility / Water Bill',
  'Marketing & Promotional Flyers',
  'Packaging Bags / Tape / Markers',
  'Cooling Refrigerator Servicing',
  'Transport / Logistics Buffer',
];

export const MiscellaneousExpensesSection: React.FC<MiscellaneousExpensesSectionProps> = ({
  expenses = [],
  currency,
  onSaveExpense,
  onDeleteExpense,
}) => {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<MiscellaneousExpense | null>(null);
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  // Filtered and Sorted Expenses
  const filteredExpenses = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const now = new Date();

    const result = safeExpenses.filter((exp) => {
      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesDesc = (exp.description || '').toLowerCase().includes(term);
        const matchesNotes = (exp.notes || '').toLowerCase().includes(term);
        if (!matchesDesc && !matchesNotes) return false;
      }

      // Date Range filter
      if (timeFilter === 'today') {
        return exp.date === todayStr;
      }
      if (timeFilter === 'week') {
        const expDate = new Date(exp.date);
        const diffDays = (now.getTime() - expDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (timeFilter === 'month') {
        const currentMonth = todayStr.slice(0, 7);
        return exp.date.startsWith(currentMonth);
      }
      if (timeFilter === 'custom') {
        if (customStartDate && exp.date < customStartDate) return false;
        if (customEndDate && exp.date > customEndDate) return false;
        return true;
      }

      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt.localeCompare(a.createdAt);
      }
      if (sortBy === 'date_asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt.localeCompare(b.createdAt);
      }
      if (sortBy === 'amount_desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount_asc') {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [safeExpenses, searchTerm, timeFilter, customStartDate, customEndDate, sortBy]);

  // Financial Metrics for current view
  const totalFilteredAmount = useMemo(() => {
    return calculateTotalMiscellaneousExpenses(filteredExpenses);
  }, [filteredExpenses]);

  const allTimeTotalAmount = useMemo(() => {
    return calculateTotalMiscellaneousExpenses(safeExpenses);
  }, [safeExpenses]);

  const highestExpense = useMemo(() => {
    if (filteredExpenses.length === 0) return 0;
    return Math.max(...filteredExpenses.map((e) => Number(e.amount) || 0));
  }, [filteredExpenses]);

  const averageExpense = useMemo(() => {
    if (filteredExpenses.length === 0) return 0;
    return totalFilteredAmount / filteredExpenses.length;
  }, [filteredExpenses, totalFilteredAmount]);

  // Open modal to Add
  const handleOpenAddModal = (presetDescription?: string) => {
    setEditingExpense(null);
    setFormDescription(presetDescription || '');
    setFormAmount('');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal to Edit
  const handleOpenEditModal = (expense: MiscellaneousExpense) => {
    setEditingExpense(expense);
    setFormDescription(expense.description);
    setFormAmount(String(expense.amount));
    setFormDate(expense.date);
    setFormNotes(expense.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim()) {
      setFormError('Please enter a description for the expense.');
      return;
    }

    const parsedAmount = parseFloat(formAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid expense amount greater than 0.');
      return;
    }

    if (!formDate) {
      setFormError('Please select a date for the expense.');
      return;
    }

    const payload: MiscellaneousExpense = {
      id: editingExpense ? editingExpense.id : `misc-exp-${Date.now()}`,
      description: formDescription.trim(),
      amount: parsedAmount,
      date: formDate,
      notes: formNotes.trim() ? formNotes.trim() : undefined,
      createdAt: editingExpense ? editingExpense.createdAt : new Date().toISOString(),
    };

    onSaveExpense(payload);
    setIsModalOpen(false);
  };

  return (
    <div id="miscellaneous-expenses-section" className="space-y-4">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DDD6CA] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0EBE1]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#F3EBE1] text-[#9A5B2D]">
                <Wallet className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#1C211E] font-display">
                Miscellaneous Business Expenses
              </h2>
            </div>
            <p className="text-xs text-[#697A6F] mt-0.5">
              Record separate business overhead expenses (fuel, logistics, utilities, repairs) distinct from per-bottle production costs
            </p>
          </div>

          <button
            id="add-misc-expense-header-btn"
            onClick={() => handleOpenAddModal()}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#45634D] hover:bg-[#3B5542] text-white text-xs font-bold shadow-2xs transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Record New Expense</span>
          </button>
        </div>

        {/* Informative Explanation Badge */}
        <div className="mt-3 p-3 rounded-xl bg-[#F9F7F2] border border-[#E6DFD3] flex items-start gap-2.5 text-xs text-[#55635B]">
          <HelpCircle className="w-4 h-4 text-[#45634D] flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[#1C211E]">How expenses connect to financials:</span>
            <p className="text-[#697A6F] leading-relaxed">
              These miscellaneous expenses are tracked separately from your unit yoghurt recipe costs. They are automatically deducted in the <strong>Cumulative Totals</strong> tab to compute your true <strong>Net Business Profit</strong> (<em>Total Revenue − Production Costs − Misc Expenses</em>).
            </p>
          </div>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {/* Total Expenses (Filtered) */}
        <div className="bg-white rounded-2xl p-4 border border-[#DDD6CA] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#697A6F] uppercase tracking-wider">
              {timeFilter === 'all' ? 'Total Expenses' : 'Filtered Expenses'}
            </span>
            <TrendingDown className="w-4 h-4 text-[#B85D19]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-extrabold text-[#1C211E]">
              {formatCurrency(totalFilteredAmount, currency.symbol)}
            </span>
          </div>
          <p className="text-[10px] text-[#8C9C92] mt-1">
            {filteredExpenses.length} expense record{filteredExpenses.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* All-Time Total */}
        <div className="bg-white rounded-2xl p-4 border border-[#DDD6CA] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#697A6F] uppercase tracking-wider">
              All-Time Overhead
            </span>
            <DollarSign className="w-4 h-4 text-[#45634D]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-extrabold text-[#55635B]">
              {formatCurrency(allTimeTotalAmount, currency.symbol)}
            </span>
          </div>
          <p className="text-[10px] text-[#8C9C92] mt-1">
            Across {safeExpenses.length} total entries
          </p>
        </div>

        {/* Average Expense */}
        <div className="bg-white rounded-2xl p-4 border border-[#DDD6CA] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#697A6F] uppercase tracking-wider">
              Average Expense
            </span>
            <Clock className="w-4 h-4 text-[#55635B]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-extrabold text-[#1C211E]">
              {formatCurrency(averageExpense, currency.symbol)}
            </span>
          </div>
          <p className="text-[10px] text-[#8C9C92] mt-1">
            Per recorded event
          </p>
        </div>

        {/* Highest Single Expense */}
        <div className="bg-[#FAF6F0] rounded-2xl p-4 border border-[#E6DAC8] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#9A5B2D] uppercase tracking-wider">
              Highest Expense
            </span>
            <AlertCircle className="w-4 h-4 text-[#9A5B2D]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-extrabold text-[#78421A]">
              {formatCurrency(highestExpense, currency.symbol)}
            </span>
          </div>
          <p className="text-[10px] text-[#9A5B2D] mt-1">
            Single largest item
          </p>
        </div>
      </div>

      {/* Quick Add Suggestions Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#DDD6CA] shadow-2xs">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-[#45634D]" />
          <span className="text-xs font-bold text-[#1C211E]">Quick Expense Categories:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_EXPENSE_SUGGESTIONS.map((preset) => (
            <button
              key={preset}
              onClick={() => handleOpenAddModal(preset)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#F4EFE6] hover:bg-[#EAE2D5] text-[#45634D] border border-[#DDD6CA] transition cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-[#45634D]" />
              <span>{preset}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DDD6CA] shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C9C92] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-misc-expenses"
              type="text"
              placeholder="Search by expense description or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#DDD6CA] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1C211E] focus:outline-none focus:ring-2 focus:ring-[#45634D] placeholder:text-[#8C9C92]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C9C92] hover:text-[#1C211E]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F4EFE6] p-1 rounded-xl border border-[#DDD6CA] flex-wrap self-start md:self-auto">
            <button
              id="filter-exp-all"
              onClick={() => setTimeFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeFilter === 'all'
                  ? 'bg-[#45634D] text-white shadow-xs'
                  : 'text-[#55635B] hover:text-[#1C211E]'
              }`}
            >
              All Time
            </button>
            <button
              id="filter-exp-today"
              onClick={() => setTimeFilter('today')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeFilter === 'today'
                  ? 'bg-[#45634D] text-white shadow-xs'
                  : 'text-[#55635B] hover:text-[#1C211E]'
              }`}
            >
              Today
            </button>
            <button
              id="filter-exp-week"
              onClick={() => setTimeFilter('week')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeFilter === 'week'
                  ? 'bg-[#45634D] text-white shadow-xs'
                  : 'text-[#55635B] hover:text-[#1C211E]'
              }`}
            >
              7 Days
            </button>
            <button
              id="filter-exp-month"
              onClick={() => setTimeFilter('month')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeFilter === 'month'
                  ? 'bg-[#45634D] text-white shadow-xs'
                  : 'text-[#55635B] hover:text-[#1C211E]'
              }`}
            >
              This Month
            </button>
            <button
              id="filter-exp-custom"
              onClick={() => setTimeFilter('custom')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeFilter === 'custom'
                  ? 'bg-[#45634D] text-white shadow-xs'
                  : 'text-[#55635B] hover:text-[#1C211E]'
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#697A6F] font-semibold flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort:
            </span>
            <select
              id="sort-expenses-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FAF8F5] border border-[#DDD6CA] text-xs font-semibold text-[#1C211E] rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#45634D] cursor-pointer"
            >
              <option value="date_desc">Newest Date First</option>
              <option value="date_asc">Oldest Date First</option>
              <option value="amount_desc">Highest Amount First</option>
              <option value="amount_asc">Lowest Amount First</option>
            </select>
          </div>
        </div>

        {/* Custom Date Picker Inputs */}
        {timeFilter === 'custom' && (
          <div className="pt-3 border-t border-[#F0EBE1] flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-[#55635B] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#45634D]" />
              From:
            </span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-[#FAF8F5] border border-[#D9D3C7] rounded-lg px-2 py-1 text-xs text-[#1C211E]"
            />
            <span className="font-semibold text-[#55635B]">To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-[#FAF8F5] border border-[#D9D3C7] rounded-lg px-2 py-1 text-xs text-[#1C211E]"
            />
            {(customStartDate || customEndDate) && (
              <button
                onClick={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
                className="text-[11px] text-[#8C9C92] hover:text-[#1C211E] underline ml-2 cursor-pointer"
              >
                Clear range
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expenses Records List / Table */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DDD6CA] shadow-2xs">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#F0EBE1]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#45634D]" />
            <h3 className="font-bold text-sm text-[#1C211E] font-display">
              Recorded Miscellaneous Expenses
            </h3>
          </div>
          <span className="text-xs text-[#697A6F] font-semibold">
            Showing {filteredExpenses.length} of {safeExpenses.length} records
          </span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E8E3D8] flex items-center justify-center mx-auto text-[#8C9C92]">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1C211E]">No miscellaneous expenses found</p>
              <p className="text-xs text-[#697A6F] mt-1 max-w-sm mx-auto">
                {searchTerm || timeFilter !== 'all'
                  ? 'No records matched your search or date filter. Try clearing filters.'
                  : 'Start recording miscellaneous overheads like fuel, transport, and repairs.'}
              </p>
            </div>
            <button
              onClick={() => handleOpenAddModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#45634D] hover:bg-[#3B5542] text-white text-xs font-bold shadow-2xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Expense</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                id={`expense-row-${exp.id}`}
                className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] hover:border-[#B2C7B7] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left info */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#EDE8DE] text-[#2F4535] border border-[#DDD6CA] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#45634D]" />
                      {exp.date}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1C211E] truncate">
                      {exp.description}
                    </h4>
                  </div>
                  {exp.notes && (
                    <p className="text-xs text-[#697A6F] pl-0.5 line-clamp-2 italic">
                      "{exp.notes}"
                    </p>
                  )}
                </div>

                {/* Right amount and actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EDE8DE]">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-[#8C9C92] block">Expense Amount</span>
                    <span className="text-sm sm:text-base font-extrabold text-[#78421A]">
                      {formatCurrency(exp.amount, currency.symbol)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Edit Button */}
                    <button
                      id={`edit-expense-btn-${exp.id}`}
                      onClick={() => handleOpenEditModal(exp)}
                      className="p-1.5 rounded-lg bg-white hover:bg-[#EAEFEA] text-[#45634D] border border-[#DDD6CA] transition cursor-pointer"
                      title="Edit Expense"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      id={`delete-expense-btn-${exp.id}`}
                      onClick={() => setDeleteConfirmId(exp.id)}
                      className="p-1.5 rounded-lg bg-white hover:bg-[#FBEAEA] text-rose-600 border border-[#DDD6CA] transition cursor-pointer"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div
            id="misc-expense-modal"
            className="bg-white rounded-2xl border border-[#DDD6CA] p-5 sm:p-6 w-full max-w-md shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#F3EBE1] text-[#9A5B2D]">
                  <Wallet className="w-4 h-4" />
                </span>
                <h3 className="text-sm sm:text-base font-bold text-[#1C211E] font-display">
                  {editingExpense ? 'Edit Miscellaneous Expense' : 'Record Miscellaneous Expense'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#8C9C92] hover:text-[#1C211E] hover:bg-[#FAF8F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-[#1C211E] block">
                  Description <span className="text-rose-500">*</span>
                </label>
                <input
                  id="expense-form-description"
                  type="text"
                  placeholder="e.g. Generator diesel fueling for production"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD6CA] rounded-xl px-3 py-2 text-xs text-[#1C211E] focus:outline-none focus:ring-2 focus:ring-[#45634D]"
                  autoFocus
                />
              </div>

              {/* Amount & Date side-by-side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1C211E] block">
                    Amount ({currency.symbol}) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9C92] font-bold">
                      {currency.symbol}
                    </span>
                    <input
                      id="expense-form-amount"
                      type="number"
                      step="any"
                      min="0.01"
                      placeholder="0.00"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#DDD6CA] rounded-xl pl-8 pr-3 py-2 text-xs text-[#1C211E] font-bold focus:outline-none focus:ring-2 focus:ring-[#45634D]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1C211E] block">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="expense-form-date"
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD6CA] rounded-xl px-3 py-2 text-xs text-[#1C211E] focus:outline-none focus:ring-2 focus:ring-[#45634D]"
                  />
                </div>
              </div>

              {/* Notes (Optional) */}
              <div className="space-y-1">
                <label className="font-bold text-[#1C211E] block">
                  Notes / Details <span className="text-[10px] font-normal text-[#8C9C92]">(Optional)</span>
                </label>
                <textarea
                  id="expense-form-notes"
                  rows={2}
                  placeholder="Additional context (e.g. receipt number, vendor, breakdown)..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD6CA] rounded-xl px-3 py-2 text-xs text-[#1C211E] focus:outline-none focus:ring-2 focus:ring-[#45634D] resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-[#F0EBE1] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-[#F4EFE6] hover:bg-[#EAE2D5] text-[#55635B] text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="save-expense-submit-btn"
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#45634D] hover:bg-[#3B5542] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  {editingExpense ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div
            id="delete-expense-confirm-modal"
            className="bg-white rounded-2xl border border-rose-200 p-5 w-full max-w-sm shadow-xl space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1C211E]">Delete Miscellaneous Expense?</h4>
                <p className="text-xs text-[#697A6F] mt-0.5">
                  This action will permanently remove this expense record from the ledger.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0EBE1] flex items-center justify-end gap-2">
              <button
                id="cancel-delete-expense-btn"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 rounded-xl bg-[#F4EFE6] hover:bg-[#EAE2D5] text-[#55635B] text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-expense-btn"
                onClick={() => {
                  onDeleteExpense(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

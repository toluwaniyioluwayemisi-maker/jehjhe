import React from 'react';
import {
  YoghurtProduct,
  OrderRecord,
  CostItem,
  MiscellaneousExpense,
  StockLogEntry,
  CurrencyConfig,
} from '../types';
import { calculateBusinessKPIs, formatCurrency } from '../utils/storage';
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Receipt,
  ArrowRight,
  Wallet,
  Calendar,
  Sparkles,
  Layers,
  ShoppingBag,
} from 'lucide-react';

interface ExecutiveDashboardProps {
  orders: OrderRecord[];
  products: YoghurtProduct[];
  costItems: CostItem[];
  expenses: MiscellaneousExpense[];
  stockLogs: StockLogEntry[];
  currency: CurrencyConfig;
  onNavigateToTab: (tab: 'costs' | 'orders' | 'daily-sales' | 'inventory' | 'expenses' | 'cumulative' | 'demo') => void;
  onOpenAddProductModal: () => void;
  onOpenNewOrderModal?: () => void;
  onOpenNewExpenseModal?: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  orders = [],
  products = [],
  costItems = [],
  expenses = [],
  stockLogs = [],
  currency,
  onNavigateToTab,
  onOpenAddProductModal,
  onOpenNewOrderModal,
  onOpenNewExpenseModal,
}) => {
  const kpis = calculateBusinessKPIs(orders, products, costItems, expenses, stockLogs);

  const isFreshAccount =
    kpis.totalOrders === 0 &&
    kpis.totalProducts === 0 &&
    kpis.expenses === 0 &&
    kpis.revenue === 0;

  return (
    <div id="executive-dashboard-view" className="space-y-5 animate-fadeIn">
      {/* Welcome / Mode Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold font-display text-[#0F172A] tracking-tight">
              Business Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
              Live Production
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time financial performance, orders, inventory, and labor metrics for Butch Master.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-dashboard-explore-demo"
            onClick={() => onNavigateToTab('demo')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] border border-[#C7D2FE] text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>Explore Demo Mode</span>
          </button>

          <button
            type="button"
            id="btn-dashboard-quick-order"
            onClick={onOpenNewOrderModal ? onOpenNewOrderModal : () => onNavigateToTab('orders')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Order</span>
          </button>
        </div>
      </div>

      {/* Fresh Account Empty State Guidance Banner */}
      {isFreshAccount && (
        <div
          id="fresh-account-welcome-card"
          className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E2E8F0] shadow-xs text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center mx-auto shadow-2xs">
            <Package className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-base sm:text-lg font-bold font-display text-[#0F172A]">
              Your Butch Master Dashboard is Ready
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Your account starts completely fresh with default zero values. As you record products,
              invoices, batches, and operational expenses, real-time analytics will automatically populate below.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              id="btn-empty-add-first-product"
              onClick={onOpenAddProductModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Product / Size</span>
            </button>

            <button
              type="button"
              id="btn-empty-record-first-order"
              onClick={onOpenNewOrderModal ? onOpenNewOrderModal : () => onNavigateToTab('orders')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] text-xs font-bold transition cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-[#059669]" />
              <span>Record First Order</span>
            </button>

            <button
              type="button"
              id="btn-empty-open-demo-mode"
              onClick={() => onNavigateToTab('demo')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] border border-[#C7D2FE] text-xs font-bold transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#6366F1]" />
              <span>Preview Demo Data</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Core Financial Performance Metric Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2 px-1">
          Financial Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Card 1: Revenue / Earnings */}
          <div
            id="metric-revenue-card"
            className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#CBD5E1] transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B]">Revenue / Earnings</span>
              <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-[#059669]" />
              </div>
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-2xl font-black font-display text-[#0F172A] tracking-tight">
                {formatCurrency(kpis.revenue, currency.symbol)}
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">Total sales income</p>
            </div>
          </div>

          {/* Card 2: Sales Value */}
          <div
            id="metric-sales-card"
            className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#CBD5E1] transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B]">Total Sales</span>
              <div className="w-7 h-7 rounded-lg bg-[#F0FDF4] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#10B981]" />
              </div>
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-2xl font-black font-display text-[#0F172A] tracking-tight">
                {formatCurrency(kpis.sales, currency.symbol)}
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                {kpis.totalBottlesSold} bottle{kpis.totalBottlesSold === 1 ? '' : 's'} sold
              </p>
            </div>
          </div>

          {/* Card 3: Total Expenses (Production COGS + Overheads) */}
          <div
            id="metric-expenses-card"
            className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-[#CBD5E1] transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B]">Total Expenses</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-2xl font-black font-display text-[#B45309] tracking-tight">
                {formatCurrency(kpis.expenses, currency.symbol)}
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">COGS + Misc overheads</p>
            </div>
          </div>

          {/* Card 4: Net Profit */}
          <div
            id="metric-profit-card"
            className="bg-gradient-to-br from-[#064E3B] to-[#047857] text-white p-4 rounded-2xl border border-[#059669] shadow-md flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#A7F3D0]">
              <span className="text-[11px] font-bold tracking-wide uppercase">
                Net Profit
              </span>
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#34D399]" />
              </div>
            </div>
            <div className="mt-2.5">
              <p className={`text-xl sm:text-2xl font-black font-display tracking-tight ${
                kpis.profit >= 0 ? 'text-white' : 'text-rose-300'
              }`}>
                {kpis.profit >= 0 ? '+' : ''}{formatCurrency(kpis.profit, currency.symbol)}
              </p>
              <p className="text-[10px] text-[#D1FAE5]/80 mt-0.5 font-medium">
                {kpis.marginPercent.toFixed(1)}% profit margin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Operational & Business Volume KPIs */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2 px-1">
          Operations, Customers & Labor
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {/* Outstanding Balance */}
          <div
            id="metric-outstanding-balance-card"
            className="bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs"
          >
            <span className="text-[11px] font-semibold text-[#64748B] block">Outstanding Balance</span>
            <p className="text-base sm:text-lg font-black font-display text-[#DC2626] mt-1.5">
              {formatCurrency(kpis.outstandingBalance, currency.symbol)}
            </p>
            <span className="text-[10px] text-[#94A3B8] mt-0.5 block">Uncollected invoices</span>
          </div>

          {/* Total Customers */}
          <div
            id="metric-total-customers-card"
            className="bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#64748B]">Total Customers</span>
              <Users className="w-3.5 h-3.5 text-[#059669]" />
            </div>
            <p className="text-base sm:text-lg font-black font-display text-[#0F172A] mt-1.5">
              {kpis.totalCustomers}
            </p>
            <span className="text-[10px] text-[#94A3B8] mt-0.5 block">Unique client accounts</span>
          </div>

          {/* Total Orders */}
          <div
            id="metric-total-orders-card"
            className="bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#64748B]">Total Orders</span>
              <Receipt className="w-3.5 h-3.5 text-[#059669]" />
            </div>
            <p className="text-base sm:text-lg font-black font-display text-[#0F172A] mt-1.5">
              {kpis.totalOrders}
            </p>
            <span className="text-[10px] text-[#94A3B8] mt-0.5 block">Recorded invoices</span>
          </div>

          {/* Total Products / Items */}
          <div
            id="metric-total-products-card"
            className="bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#64748B]">Products / Items</span>
              <Package className="w-3.5 h-3.5 text-[#059669]" />
            </div>
            <p className="text-base sm:text-lg font-black font-display text-[#0F172A] mt-1.5">
              {kpis.totalProducts}
            </p>
            <span className="text-[10px] text-[#94A3B8] mt-0.5 block">Active bottle sizes</span>
          </div>

          {/* Total Workers */}
          <div
            id="metric-total-workers-card"
            className="bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#64748B]">Total Workers</span>
              <Briefcase className="w-3.5 h-3.5 text-[#059669]" />
            </div>
            <p className="text-base sm:text-lg font-black font-display text-[#0F172A] mt-1.5">
              {kpis.totalWorkers}
            </p>
            <span className="text-[10px] text-[#94A3B8] mt-0.5 block">Active labor staff</span>
          </div>

          {/* Jobs (Completed vs Pending) */}
          <div
            id="metric-jobs-card"
            className="bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#64748B]">Production Jobs</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
            </div>
            <p className="text-base sm:text-lg font-black font-display text-[#0F172A] mt-1.5">
              {kpis.completedJobs}{' '}
              <span className="text-[11px] font-semibold text-[#94A3B8]">/ {kpis.pendingJobs} pend</span>
            </p>
            <span className="text-[10px] text-[#94A3B8] mt-0.5 block">
              {kpis.completedJobs} completed, {kpis.pendingJobs} pending
            </span>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Modules & Navigation Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div
          onClick={() => onNavigateToTab('costs')}
          className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#10B981] hover:shadow-md transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center group-hover:bg-[#059669] group-hover:text-white transition">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0F172A]">Cost & Recipe Formulas</h4>
              <p className="text-[11px] text-[#64748B]">
                {products.length} product{products.length === 1 ? '' : 's'} configured
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#059669] group-hover:translate-x-0.5 transition" />
        </div>

        <div
          onClick={() => onNavigateToTab('orders')}
          className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#10B981] hover:shadow-md transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center group-hover:bg-[#059669] group-hover:text-white transition">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0F172A]">Orders & Invoices</h4>
              <p className="text-[11px] text-[#64748B]">
                {orders.length} order{orders.length === 1 ? '' : 's'} recorded
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#059669] group-hover:translate-x-0.5 transition" />
        </div>

        <div
          onClick={() => onNavigateToTab('expenses')}
          className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#10B981] hover:shadow-md transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center group-hover:bg-[#059669] group-hover:text-white transition">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0F172A]">Miscellaneous Expenses</h4>
              <p className="text-[11px] text-[#64748B]">
                {expenses.length} overhead record{expenses.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#059669] group-hover:translate-x-0.5 transition" />
        </div>
      </div>
    </div>
  );
};

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
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DDD6CA] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold font-display text-[#1C211E] tracking-tight">
              Business Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8EFEA] text-[#2F4535] border border-[#C5D9CA]">
              Live Production
            </span>
          </div>
          <p className="text-xs text-[#697A6F] mt-0.5">
            Real-time financial performance, orders, inventory, and labor metrics for Butch Master.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-dashboard-explore-demo"
            onClick={() => onNavigateToTab('demo')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF6F0] hover:bg-[#F2ECE1] text-[#8C4E20] border border-[#E6DAC8] text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#9A5B2D]" />
            <span>Explore Demo Mode</span>
          </button>

          <button
            type="button"
            id="btn-dashboard-quick-order"
            onClick={onOpenNewOrderModal ? onOpenNewOrderModal : () => onNavigateToTab('orders')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#45634D] hover:bg-[#38533F] text-white text-xs font-bold shadow-2xs transition cursor-pointer"
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
          className="bg-white rounded-2xl p-6 sm:p-7 border border-[#DDD6CA] shadow-2xs text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#EEF4EF] text-[#45634D] flex items-center justify-center mx-auto shadow-2xs">
            <Package className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-base sm:text-lg font-bold font-display text-[#1C211E]">
              Your Butch Master Dashboard is Ready
            </h2>
            <p className="text-xs text-[#697A6F] leading-relaxed">
              Your account starts completely fresh with default zero values. As you record products,
              invoices, batches, and operational expenses, real-time analytics will automatically populate below.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              id="btn-empty-add-first-product"
              onClick={onOpenAddProductModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#45634D] hover:bg-[#38533F] text-white text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Product / Size</span>
            </button>

            <button
              type="button"
              id="btn-empty-record-first-order"
              onClick={onOpenNewOrderModal ? onOpenNewOrderModal : () => onNavigateToTab('orders')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] text-[#2F4535] border border-[#DDD6CA] text-xs font-bold transition cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Record First Order</span>
            </button>

            <button
              type="button"
              id="btn-empty-open-demo-mode"
              onClick={() => onNavigateToTab('demo')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F2ECE1] text-[#8C4E20] border border-[#E6DAC8] text-xs font-bold transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#9A5B2D]" />
              <span>Preview Demo Data</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Core Financial Performance Metric Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#697A6F] mb-2 px-1">
          Financial Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Card 1: Revenue / Earnings */}
          <div
            id="metric-revenue-card"
            className="bg-white p-4 rounded-2xl border border-[#E8E2D7] shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B786E]">Revenue / Earnings</span>
              <DollarSign className="w-4 h-4 text-[#2F6A3E]" />
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-2xl font-black font-display text-[#1C211E] tracking-tight">
                {formatCurrency(kpis.revenue, currency.symbol)}
              </p>
              <p className="text-[11px] text-[#859388] mt-0.5">Total sales income</p>
            </div>
          </div>

          {/* Card 2: Sales Value */}
          <div
            id="metric-sales-card"
            className="bg-white p-4 rounded-2xl border border-[#E8E2D7] shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B786E]">Total Sales</span>
              <ShoppingBag className="w-4 h-4 text-[#45634D]" />
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-2xl font-black font-display text-[#1C211E] tracking-tight">
                {formatCurrency(kpis.sales, currency.symbol)}
              </p>
              <p className="text-[11px] text-[#859388] mt-0.5">
                {kpis.totalBottlesSold} bottle{kpis.totalBottlesSold === 1 ? '' : 's'} sold
              </p>
            </div>
          </div>

          {/* Card 3: Total Expenses (Production COGS + Overheads) */}
          <div
            id="metric-expenses-card"
            className="bg-white p-4 rounded-2xl border border-[#E8E2D7] shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B786E]">Total Expenses</span>
              <Wallet className="w-4 h-4 text-[#8C6B3D]" />
            </div>
            <div className="mt-2.5">
              <p className="text-xl sm:text-2xl font-black font-display text-[#8C6B3D] tracking-tight">
                {formatCurrency(kpis.expenses, currency.symbol)}
              </p>
              <p className="text-[11px] text-[#859388] mt-0.5">COGS + Misc overheads</p>
            </div>
          </div>

          {/* Card 4: Net Profit */}
          <div
            id="metric-profit-card"
            className="bg-[#243328] text-white p-4 rounded-2xl border border-[#1A261E] shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[#A8D5AF]">
              <span className="text-[11px] font-bold tracking-wide uppercase">
                Net Profit
              </span>
              <TrendingUp className="w-4 h-4 text-[#A8D5AF]" />
            </div>
            <div className="mt-2.5">
              <p className={`text-xl sm:text-2xl font-black font-display tracking-tight ${
                kpis.profit >= 0 ? 'text-white' : 'text-rose-400'
              }`}>
                {kpis.profit >= 0 ? '+' : ''}{formatCurrency(kpis.profit, currency.symbol)}
              </p>
              <p className="text-[10px] text-[#879D8E] mt-0.5">
                {kpis.marginPercent.toFixed(1)}% profit margin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Operational & Business Volume KPIs */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#697A6F] mb-2 px-1">
          Operations, Customers & Labor
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {/* Outstanding Balance */}
          <div
            id="metric-outstanding-balance-card"
            className="bg-white p-3.5 rounded-2xl border border-[#E8E2D7] shadow-2xs"
          >
            <span className="text-[11px] font-semibold text-[#6B786E] block">Outstanding Balance</span>
            <p className="text-base sm:text-lg font-black font-display text-[#8A4822] mt-1.5">
              {formatCurrency(kpis.outstandingBalance, currency.symbol)}
            </p>
            <span className="text-[10px] text-[#859388] mt-0.5 block">Uncollected invoices</span>
          </div>

          {/* Total Customers */}
          <div
            id="metric-total-customers-card"
            className="bg-white p-3.5 rounded-2xl border border-[#E8E2D7] shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#6B786E]">Total Customers</span>
              <Users className="w-3.5 h-3.5 text-[#45634D]" />
            </div>
            <p className="text-base sm:text-lg font-black font-display text-[#1C211E] mt-1.5">
              {kpis.totalCustomers}
            </p>
            <span className="text-[10px] text-[#859388] mt-0.5 block">Unique client accounts</span>
          </div>

          {/* Total Orders */}
          <div
            id="metric-total-orders-card"
            className="bg-white p-3.5 rounded-2xl border border-[#E8E2D7] shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#6B786E]">Total Orders</span>
              <Receipt className="w-3.5 h-3.5 text-[#45634D]" />
            </div>
            <p className="text-base sm:text-lg font-black font-display text-[#1C211E] mt-1.5">
              {kpis.totalOrders}
            </p>
            <span className="text-[10px] text-[#859388] mt-0.5 block">Recorded invoices</span>
          </div>

          {/* Total Products / Items */}
          <div
            id="metric-total-products-card"
            className="bg-white p-3.5 rounded-2xl border border-[#E8E2D7] shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#6B786E]">Products / Items</span>
              <Package className="w-3.5 h-3.5 text-[#45634D]" />
            </div>
            <p className="text-base sm:text-lg font-black font-display text-[#1C211E] mt-1.5">
              {kpis.totalProducts}
            </p>
            <span className="text-[10px] text-[#859388] mt-0.5 block">Active bottle sizes</span>
          </div>

          {/* Total Workers */}
          <div
            id="metric-total-workers-card"
            className="bg-white p-3.5 rounded-2xl border border-[#E8E2D7] shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#6B786E]">Total Workers</span>
              <Briefcase className="w-3.5 h-3.5 text-[#45634D]" />
            </div>
            <p className="text-base sm:text-lg font-black font-display text-[#1C211E] mt-1.5">
              {kpis.totalWorkers}
            </p>
            <span className="text-[10px] text-[#859388] mt-0.5 block">Active labor staff</span>
          </div>

          {/* Jobs (Completed vs Pending) */}
          <div
            id="metric-jobs-card"
            className="bg-white p-3.5 rounded-2xl border border-[#E8E2D7] shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#6B786E]">Production Jobs</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2F6A3E]" />
            </div>
            <p className="text-base sm:text-lg font-black font-display text-[#1C211E] mt-1.5">
              {kpis.completedJobs}{' '}
              <span className="text-[11px] font-semibold text-[#859388]">/ {kpis.pendingJobs} pend</span>
            </p>
            <span className="text-[10px] text-[#859388] mt-0.5 block">
              {kpis.completedJobs} completed, {kpis.pendingJobs} pending
            </span>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Modules & Navigation Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div
          onClick={() => onNavigateToTab('costs')}
          className="bg-white p-4 rounded-2xl border border-[#E8E2D7] shadow-2xs hover:border-[#45634D] transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF4EF] text-[#34513B] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1C211E]">Cost & Recipe Formulas</h4>
              <p className="text-[11px] text-[#697A6F]">
                {products.length} product{products.length === 1 ? '' : 's'} configured
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#859388] group-hover:text-[#45634D] group-hover:translate-x-0.5 transition" />
        </div>

        <div
          onClick={() => onNavigateToTab('orders')}
          className="bg-white p-4 rounded-2xl border border-[#E8E2D7] shadow-2xs hover:border-[#45634D] transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF4EF] text-[#34513B] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1C211E]">Orders & Invoices</h4>
              <p className="text-[11px] text-[#697A6F]">
                {orders.length} order{orders.length === 1 ? '' : 's'} recorded
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#859388] group-hover:text-[#45634D] group-hover:translate-x-0.5 transition" />
        </div>

        <div
          onClick={() => onNavigateToTab('expenses')}
          className="bg-white p-4 rounded-2xl border border-[#E8E2D7] shadow-2xs hover:border-[#45634D] transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF4EF] text-[#34513B] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1C211E]">Miscellaneous Expenses</h4>
              <p className="text-[11px] text-[#697A6F]">
                {expenses.length} overhead record{expenses.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#859388] group-hover:text-[#45634D] group-hover:translate-x-0.5 transition" />
        </div>
      </div>
    </div>
  );
};

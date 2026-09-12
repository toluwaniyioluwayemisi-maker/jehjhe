import React, { useState } from 'react';
import { CurrencyConfig, YoghurtProduct, OrderRecord, CostItem, MiscellaneousExpense, StockLogEntry } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_INGREDIENTS,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_STOCK_LOGS,
  INITIAL_MISCELLANEOUS_EXPENSES,
} from '../data/initialData';
import { formatCurrency, calculateBusinessKPIs, calculateProductCost } from '../utils/storage';
import {
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Receipt,
  Package,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  Wallet,
  Layers,
  BarChart3,
  Search,
  Calendar,
  Phone,
  Milk,
  RotateCcw,
  Check,
  Zap,
} from 'lucide-react';

interface DemoModeSectionProps {
  currency: CurrencyConfig;
  onExitDemo: () => void;
}

export const DemoModeSection: React.FC<DemoModeSectionProps> = ({
  currency,
  onExitDemo,
}) => {
  // In-memory demo state isolated from Firestore
  const [demoOrders, setDemoOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [demoProducts, setDemoProducts] = useState<YoghurtProduct[]>(INITIAL_PRODUCTS);
  const [demoCostItems, setDemoCostItems] = useState<CostItem[]>(INITIAL_INGREDIENTS);
  const [demoExpenses, setDemoExpenses] = useState<MiscellaneousExpense[]>(INITIAL_MISCELLANEOUS_EXPENSES);
  const [demoStockLogs, setDemoStockLogs] = useState<StockLogEntry[]>(INITIAL_STOCK_LOGS);

  const [activeSubTab, setActiveSubTab] = useState<
    'dashboard' | 'customers' | 'products' | 'orders' | 'workers' | 'expenses' | 'analytics'
  >('dashboard');

  const [searchTerm, setSearchTerm] = useState('');

  // Deterministic KPI calculation for demo data
  const kpis = calculateBusinessKPIs(
    demoOrders,
    demoProducts,
    demoCostItems,
    demoExpenses,
    demoStockLogs
  );

  // Sample Workers data for yoghurt production
  const sampleWorkers = [
    {
      id: 'w-1',
      name: 'Chinedu Eze',
      role: 'Production Supervisor & Pasteurization Lead',
      status: 'Active',
      shiftsThisWeek: 5,
      ratePerBatch: '₦4,500',
      phone: '+234 802 334 1120',
      activeJobs: 'Batch #B-2026-042 (500L Milk Heating & Culture)',
    },
    {
      id: 'w-2',
      name: 'Amina Yusuf',
      role: 'Incubation & Quality Specialist',
      status: 'Active',
      shiftsThisWeek: 4,
      ratePerBatch: '₦3,800',
      phone: '+234 813 902 4411',
      activeJobs: 'pH Monitoring & Whey Separation (Greek Yoghurt)',
    },
    {
      id: 'w-3',
      name: 'Tunde Bakare',
      role: 'Bottling & Packaging Line Operator',
      status: 'Active',
      shiftsThisWeek: 5,
      ratePerBatch: '₦3,200',
      phone: '+234 805 771 9090',
      activeJobs: 'Induction Sealing & Labeling (30cl & 50cl Bottles)',
    },
    {
      id: 'w-4',
      name: 'Emeka Okafor',
      role: 'Logistics & Store Dispatch Clerk',
      status: 'Active',
      shiftsThisWeek: 6,
      ratePerBatch: '₦3,500',
      phone: '+234 901 228 3491',
      activeJobs: 'Cold-chain dispatch for Greenfield Mart invoice #BM-1008',
    },
    {
      id: 'w-5',
      name: 'Babatunde Alao',
      role: 'Master Electrician & Power Tech',
      status: 'Active',
      shiftsThisWeek: 4,
      ratePerBatch: '₦5,500',
      phone: '+234 802 774 2201',
      activeJobs: 'Facility 3-Phase Panel Diagnostic & Equipment Wiring',
    },
  ];

  // Derived Customers List from demo orders
  const sampleCustomers = [
    {
      name: 'Apex Industrial Estate',
      contact: 'Engr. Dapo Williams',
      phone: '+234 809 123 4567',
      location: 'Ikeja Industrial Zone, Lagos',
      totalOrders: 1,
      totalSpend: 18000,
      outstandingBalance: 0,
      status: 'Paid',
    },
    {
      name: 'Greenfield Mart',
      contact: 'Mr. Kunle Adeyemi',
      phone: '+234 803 112 4490',
      location: 'Victoria Island, Lagos',
      totalOrders: 3,
      totalSpend: 16500,
      outstandingBalance: 0,
      status: 'Paid',
    },
    {
      name: 'Mama Chichi Supermarket',
      contact: 'Mrs. Chinyere Okeke',
      phone: '+234 802 998 7712',
      location: 'Surulere, Lagos',
      totalOrders: 2,
      totalSpend: 9200,
      outstandingBalance: 0,
      status: 'Paid',
    },
    {
      name: 'Lagos Continental Cafe',
      contact: 'Chef Ronald',
      phone: '+234 818 440 2219',
      location: 'Ikoyi, Lagos',
      totalOrders: 1,
      totalSpend: 5400,
      outstandingBalance: 0,
      status: 'Paid',
    },
    {
      name: 'Chef Kalu Kitchen',
      contact: 'Kalu Uche',
      phone: '+234 903 555 8821',
      location: 'Lekki Phase 1, Lagos',
      totalOrders: 1,
      totalSpend: 4500,
      outstandingBalance: 4500,
      status: 'Pending Balance',
    },
    {
      name: 'Sunrise Organics',
      contact: 'Dr. Zainab Aliyu',
      phone: '+234 807 123 9900',
      location: 'Ikeja GRA, Lagos',
      totalOrders: 1,
      totalSpend: 3300,
      outstandingBalance: 0,
      status: 'Paid',
    },
  ];

  const handleResetDemoData = () => {
    setDemoOrders(INITIAL_ORDERS);
    setDemoProducts(INITIAL_PRODUCTS);
    setDemoCostItems(INITIAL_INGREDIENTS);
    setDemoExpenses(INITIAL_MISCELLANEOUS_EXPENSES);
    setDemoStockLogs(INITIAL_STOCK_LOGS);
  };

  return (
    <div id="demo-mode-container" className="space-y-5 animate-fadeIn">
      {/* 1. Prominent Isolation Banner */}
      <div className="bg-[#FAF6F0] rounded-2xl p-4 sm:p-5 border-2 border-[#E6DAC8] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8C4E20] text-[#FAF6F0] flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display text-[#1C211E]">
                  Demo Mode
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8C4E20] text-white">
                  Sample Data
                </span>
              </div>
              <p className="text-xs text-[#7A6451] mt-0.5">
                Explore Butch Masters with sample data. Demo data is separate from your real business data.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-reset-demo-data"
              onClick={handleResetDemoData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#F2ECE1] text-[#7A6451] border border-[#DDD6CA] text-xs font-semibold transition cursor-pointer"
              title="Reset sample values to initial state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>

            <button
              type="button"
              id="btn-exit-demo-mode"
              onClick={onExitDemo}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#243328] hover:bg-[#1A261E] text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Demo Mode</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-[#EAE2D5] text-[11px] text-[#697A6F]">
          <ShieldCheck className="w-4 h-4 text-[#45634D] shrink-0" />
          <span>
            <strong>Safe Sandbox:</strong> Any testing actions performed here are local in-memory only. No demo records will ever be saved to your Firestore database.
          </span>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs inside Demo Mode */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#DDD6CA]">
        <button
          type="button"
          id="demo-tab-dashboard"
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'dashboard'
              ? 'bg-[#243328] text-white shadow-2xs'
              : 'bg-white hover:bg-[#FAF8F5] text-[#55635B] border border-[#DDD6CA]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Executive Dashboard</span>
        </button>

        <button
          type="button"
          id="demo-tab-customers"
          onClick={() => setActiveSubTab('customers')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'customers'
              ? 'bg-[#243328] text-white shadow-2xs'
              : 'bg-white hover:bg-[#FAF8F5] text-[#55635B] border border-[#DDD6CA]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Customers & Accounts</span>
        </button>

        <button
          type="button"
          id="demo-tab-products"
          onClick={() => setActiveSubTab('products')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'products'
              ? 'bg-[#243328] text-white shadow-2xs'
              : 'bg-white hover:bg-[#FAF8F5] text-[#55635B] border border-[#DDD6CA]'
          }`}
        >
          <Milk className="w-3.5 h-3.5" />
          <span>Products & Recipes</span>
        </button>

        <button
          type="button"
          id="demo-tab-orders"
          onClick={() => setActiveSubTab('orders')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'orders'
              ? 'bg-[#243328] text-white shadow-2xs'
              : 'bg-white hover:bg-[#FAF8F5] text-[#55635B] border border-[#DDD6CA]'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Orders & Sales ({demoOrders.length})</span>
        </button>

        <button
          type="button"
          id="demo-tab-workers"
          onClick={() => setActiveSubTab('workers')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'workers'
              ? 'bg-[#243328] text-white shadow-2xs'
              : 'bg-white hover:bg-[#FAF8F5] text-[#55635B] border border-[#DDD6CA]'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Workers & Jobs ({sampleWorkers.length})</span>
        </button>

        <button
          type="button"
          id="demo-tab-expenses"
          onClick={() => setActiveSubTab('expenses')}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'expenses'
              ? 'bg-[#243328] text-white shadow-2xs'
              : 'bg-white hover:bg-[#FAF8F5] text-[#55635B] border border-[#DDD6CA]'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Expenses ({demoExpenses.length})</span>
        </button>
      </div>

      {/* 3. Sub-Tab 1: Demo Executive Dashboard */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-5">
          {/* Main Financial Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#697A6F] mb-2 px-1">
              Sample Financial Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-[#E8E2D7] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#6B786E]">Revenue / Earnings</span>
                  <DollarSign className="w-4 h-4 text-[#2F6A3E]" />
                </div>
                <p className="text-xl sm:text-2xl font-black font-display text-[#1C211E] mt-2">
                  {formatCurrency(kpis.revenue, currency.symbol)}
                </p>
                <p className="text-[11px] text-[#859388] mt-0.5">8 sample deliveries</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E8E2D7] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#6B786E]">Total Sales</span>
                  <Receipt className="w-4 h-4 text-[#45634D]" />
                </div>
                <p className="text-xl sm:text-2xl font-black font-display text-[#1C211E] mt-2">
                  {formatCurrency(kpis.sales, currency.symbol)}
                </p>
                <p className="text-[11px] text-[#859388] mt-0.5">
                  {kpis.totalBottlesSold} bottles shipped
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#E8E2D7] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#6B786E]">Total Expenses</span>
                  <Wallet className="w-4 h-4 text-[#8C6B3D]" />
                </div>
                <p className="text-xl sm:text-2xl font-black font-display text-[#8C6B3D] mt-2">
                  {formatCurrency(kpis.expenses, currency.symbol)}
                </p>
                <p className="text-[11px] text-[#859388] mt-0.5">Production + Overheads</p>
              </div>

              <div className="bg-[#243328] text-white p-4 rounded-2xl border border-[#1A261E] shadow-xs">
                <div className="flex items-center justify-between text-[#A8D5AF]">
                  <span className="text-[11px] font-bold uppercase">Net Profit</span>
                  <TrendingUp className="w-4 h-4 text-[#A8D5AF]" />
                </div>
                <p className="text-xl sm:text-2xl font-black font-display text-white mt-2">
                  +{formatCurrency(kpis.profit, currency.symbol)}
                </p>
                <p className="text-[10px] text-[#879D8E] mt-0.5">
                  {kpis.marginPercent.toFixed(1)}% net margin
                </p>
              </div>
            </div>
          </div>

          {/* Operational Metrics Row */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#697A6F] mb-2 px-1">
              Sample Operations, Accounts & Staff
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-[#E8E2D7] shadow-2xs">
                <span className="text-[11px] font-semibold text-[#6B786E] block">Outstanding Balance</span>
                <p className="text-base sm:text-lg font-black font-display text-[#8A4822] mt-1.5">
                  {formatCurrency(kpis.outstandingBalance, currency.symbol)}
                </p>
                <span className="text-[10px] text-[#859388] mt-0.5 block">1 pending invoice</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#E8E2D7] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#6B786E]">Total Customers</span>
                  <Users className="w-3.5 h-3.5 text-[#45634D]" />
                </div>
                <p className="text-base sm:text-lg font-black font-display text-[#1C211E] mt-1.5">
                  {kpis.totalCustomers}
                </p>
                <span className="text-[10px] text-[#859388] mt-0.5 block">Active supermarkets</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#E8E2D7] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#6B786E]">Total Orders</span>
                  <Receipt className="w-3.5 h-3.5 text-[#45634D]" />
                </div>
                <p className="text-base sm:text-lg font-black font-display text-[#1C211E] mt-1.5">
                  {kpis.totalOrders}
                </p>
                <span className="text-[10px] text-[#859388] mt-0.5 block">Recorded deliveries</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#E8E2D7] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#6B786E]">Products / Items</span>
                  <Package className="w-3.5 h-3.5 text-[#45634D]" />
                </div>
                <p className="text-base sm:text-lg font-black font-display text-[#1C211E] mt-1.5">
                  {kpis.totalProducts}
                </p>
                <span className="text-[10px] text-[#859388] mt-0.5 block">Active bottle sizes</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#E8E2D7] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#6B786E]">Total Workers</span>
                  <Briefcase className="w-3.5 h-3.5 text-[#45634D]" />
                </div>
                <p className="text-base sm:text-lg font-black font-display text-[#1C211E] mt-1.5">
                  {sampleWorkers.length}
                </p>
                <span className="text-[10px] text-[#859388] mt-0.5 block">Production staff</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#E8E2D7] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#6B786E]">Production Jobs</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2F6A3E]" />
                </div>
                <p className="text-base sm:text-lg font-black font-display text-[#1C211E] mt-1.5">
                  14 <span className="text-[11px] font-semibold text-[#859388]">/ 2 pend</span>
                </p>
                <span className="text-[10px] text-[#859388] mt-0.5 block">Batches & dispatches</span>
              </div>
            </div>
          </div>

          {/* Product breakdown preview */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DDD6CA] shadow-2xs space-y-3">
            <h4 className="text-sm font-bold font-display text-[#1C211E]">
              Sample Product Profit Breakdown
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {demoProducts.map((prod) => {
                const cost = calculateProductCost(prod.id, demoCostItems);
                const selling = prod.sellingPrice || 0;
                const profit = selling - cost;
                const margin = selling > 0 ? (profit / selling) * 100 : 0;

                return (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            prod.category === 'electricity'
                              ? 'bg-amber-500 text-amber-950 font-black'
                              : prod.category === 'pastries'
                              ? 'bg-orange-600 text-white'
                              : 'bg-[#1E2621] text-white'
                          }`}>
                            {prod.size}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            prod.category === 'electricity'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : prod.category === 'pastries'
                              ? 'bg-orange-100 text-orange-900'
                              : 'bg-[#E8EFEA] text-[#2F4535]'
                          }`}>
                            {prod.category === 'electricity' ? '⚡ Electricity' : prod.category === 'pastries' ? '🥐 Pastries' : '🥛 Yoghurt'}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-[#45634D]">
                          {margin.toFixed(1)}% margin
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-[#1C211E]">{prod.name}</h5>
                    </div>

                    <div className="pt-2 border-t border-[#EAE4D8] space-y-1 text-xs">
                      <div className="flex justify-between text-[#697A6F]">
                        <span>Unit Cost:</span>
                        <strong className="text-[#1C211E] font-mono">
                          {formatCurrency(cost, currency.symbol)}
                        </strong>
                      </div>
                      <div className="flex justify-between text-[#697A6F]">
                        <span>Selling Price:</span>
                        <strong className="text-[#1C211E] font-mono">
                          {formatCurrency(selling, currency.symbol)}
                        </strong>
                      </div>
                      <div className="flex justify-between text-[#2A4432] font-bold pt-1 border-t border-dashed border-[#DDD6CA]">
                        <span>Bottle Profit:</span>
                        <strong className="font-mono">
                          +{formatCurrency(profit, currency.symbol)}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. Sub-Tab 2: Demo Customers & Accounts */}
      {activeSubTab === 'customers' && (
        <div className="bg-white rounded-2xl border border-[#DDD6CA] shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#DDD6CA] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#1C211E] font-display flex items-center gap-2">
                <span>Customer Accounts & Balances</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E8EFEA] text-[#2F4535]">
                  {sampleCustomers.length} clients
                </span>
              </h3>
              <p className="text-xs text-[#697A6F] mt-0.5">
                Supermarket distribution points, catering clients, and outstanding balances.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E3D8] bg-[#FAF8F5] text-[#697A6F] font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-4">Client Name</th>
                  <th className="py-2.5 px-3">Contact Person</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3 text-center">Orders</th>
                  <th className="py-2.5 px-3 text-right">Total Invoiced</th>
                  <th className="py-2.5 px-3 text-right">Outstanding</th>
                  <th className="py-2.5 px-4 text-center">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBE3]">
                {sampleCustomers.map((cust) => (
                  <tr key={cust.name} className="hover:bg-[#FAF8F5] transition">
                    <td className="py-3 px-4 font-bold text-[#1C211E]">
                      {cust.name}
                    </td>
                    <td className="py-3 px-3 text-[#55635B]">
                      {cust.contact}
                      <span className="block text-[10px] text-[#859388]">{cust.phone}</span>
                    </td>
                    <td className="py-3 px-3 text-[#697A6F]">
                      {cust.location}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-[#1C211E]">
                      {cust.totalOrders}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#1C211E] font-mono">
                      {formatCurrency(cust.totalSpend, currency.symbol)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={cust.outstandingBalance > 0 ? 'text-[#8A4822]' : 'text-[#45634D]'}>
                        {formatCurrency(cust.outstandingBalance, currency.symbol)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cust.status === 'Paid'
                          ? 'bg-[#E8EFEA] text-[#2F4535] border border-[#C5D9CA]'
                          : 'bg-[#FAF6F0] text-[#8C4E20] border border-[#E6DAC8]'
                      }`}>
                        {cust.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Sub-Tab 3: Demo Products & Recipes */}
      {activeSubTab === 'products' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DDD6CA] shadow-2xs">
            <h3 className="text-base font-bold text-[#1C211E] font-display mb-1">
              Sample Products & Services Costing
            </h3>
            <p className="text-xs text-[#697A6F] mb-4">
              Breakdown of raw materials, electrical consumables, labour, packaging, and energy per unit.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {demoProducts.map((prod) => {
                const items = demoCostItems.filter((i) => i.productId === prod.id);
                const totalCost = calculateProductCost(prod.id, demoCostItems);
                const selling = prod.sellingPrice || 0;

                return (
                  <div
                    key={prod.id}
                    className="p-4 rounded-xl border border-[#DDD6CA] bg-[#FAF8F5] flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            prod.category === 'electricity'
                              ? 'bg-amber-500 text-amber-950 font-black'
                              : 'bg-[#2D4534] text-white'
                          }`}>
                            {prod.size}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            prod.category === 'electricity'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-[#E8EFEA] text-[#2F4535] border-[#C5D9CA]'
                          }`}>
                            {prod.category === 'electricity' ? '⚡ Electricity' : prod.category === 'pastries' ? '🥐 Pastries' : '🥛 Yoghurt'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#1C211E]">
                          {formatCurrency(selling, currency.symbol)} retail
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#1C211E]">{prod.name}</h4>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-[#EAE4D8] text-xs">
                      {items.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-[#55635B]">
                          <span className="truncate">{item.name}</span>
                          <span className="font-mono text-[#1C211E]">
                            {formatCurrency(item.unitPricePerBottle, currency.symbol)}
                          </span>
                        </div>
                      ))}
                      {items.length > 5 && (
                        <div className="text-[11px] text-[#859388] italic">
                          +{items.length - 5} additional ingredients & packaging items
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#DDD6CA] flex items-center justify-between font-bold text-xs">
                      <span className="text-[#697A6F]">Total Production Cost:</span>
                      <span className="font-mono text-[#1C211E]">
                        {formatCurrency(totalCost, currency.symbol)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. Sub-Tab 4: Demo Orders & Invoices */}
      {activeSubTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-[#DDD6CA] shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#DDD6CA] bg-[#FAF8F5]">
            <h3 className="text-base font-bold text-[#1C211E] font-display">
              Sample Confirmed Invoices
            </h3>
            <p className="text-xs text-[#697A6F] mt-0.5">
              8 recorded invoices spanning Victoria Island, Lekki, Ikoyi, and Surulere distribution points.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E3D8] bg-[#FAF8F5] text-[#697A6F] font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Bottles</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBE3]">
                {demoOrders.map((ord) => {
                  const totalBottles = ord.items.reduce((s, i) => s + i.quantity, 0);
                  const isPending = ord.referenceNumber === 'BM-1008';

                  return (
                    <tr key={ord.id} className="hover:bg-[#FAF8F5] transition">
                      <td className="py-3 px-4 font-mono font-bold text-[#1C211E]">
                        {ord.referenceNumber}
                      </td>
                      <td className="py-3 px-3 text-[#55635B]">{ord.date}</td>
                      <td className="py-3 px-3 font-semibold text-[#1C211E]">
                        {ord.customerName || 'Direct Storefront'}
                      </td>
                      <td className="py-3 px-3 text-[#55635B]">{totalBottles} bottles</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#1C211E]">
                        {formatCurrency(
                          ord.items.reduce((sum, item) => {
                            const prod = demoProducts.find((p) => p.id === item.productId);
                            return sum + item.quantity * (prod?.sellingPrice || 0);
                          }, 0),
                          currency.symbol
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          !isPending
                            ? 'bg-[#E8EFEA] text-[#2F4535] border border-[#C5D9CA]'
                            : 'bg-[#FAF6F0] text-[#8C4E20] border border-[#E6DAC8]'
                        }`}>
                          {!isPending ? 'Delivered & Paid' : 'Pending Payment'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Sub-Tab 5: Demo Workers & Production Jobs */}
      {activeSubTab === 'workers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DDD6CA] shadow-2xs">
            <h3 className="text-base font-bold text-[#1C211E] font-display mb-1">
              Active Production Staff & Daily Jobs
            </h3>
            <p className="text-xs text-[#697A6F] mb-4">
              Team members allocated across heating, incubation, bottling, and delivery routes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {sampleWorkers.map((w) => (
                <div
                  key={w.id}
                  className="p-4 rounded-xl border border-[#DDD6CA] bg-[#FAF8F5] space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-[#1C211E]">{w.name}</h4>
                      <p className="text-xs font-semibold text-[#45634D]">{w.role}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8EFEA] text-[#2F4535] border border-[#C5D9CA]">
                      {w.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#EAE4D8] space-y-1 text-xs text-[#55635B]">
                    <div className="flex items-center justify-between">
                      <span>Rate / Batch Allocation:</span>
                      <strong className="text-[#1C211E] font-mono">{w.ratePerBatch}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Phone:</span>
                      <span className="font-mono">{w.phone}</span>
                    </div>
                    <div className="pt-1.5 text-[11px] text-[#697A6F]">
                      <span className="font-bold text-[#1C211E]">Current Job: </span>
                      {w.activeJobs}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. Sub-Tab 6: Demo Miscellaneous Expenses */}
      {activeSubTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-[#DDD6CA] shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#DDD6CA] bg-[#FAF8F5]">
            <h3 className="text-base font-bold text-[#1C211E] font-display">
              Sample Miscellaneous Overheads
            </h3>
            <p className="text-xs text-[#697A6F] mt-0.5">
              Fuel for processing generators, cold room repairs, sanitation supplies, and dispatch maintenance.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E3D8] bg-[#FAF8F5] text-[#697A6F] font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEBE3]">
                {demoExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#FAF8F5] transition">
                    <td className="py-3 px-4 font-mono text-[#55635B]">{exp.date}</td>
                    <td className="py-3 px-3 font-semibold text-[#1C211E]">{exp.description}</td>
                    <td className="py-3 px-3 text-[#697A6F] capitalize">{exp.category || 'Overhead'}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#8C6B3D]">
                      {formatCurrency(exp.amount, currency.symbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Layers,
  Milk,
  Receipt,
  TrendingUp,
  TrendingDown,
  Filter,
  CheckCircle2,
  ChevronRight,
  Package,
  DollarSign,
  PieChart,
  Tag,
  Wallet,
  ArrowRight,
  Info,
  HelpCircle,
} from 'lucide-react';
import {
  OrderRecord,
  YoghurtProduct,
  CumulativeStats,
  CostItem,
  CurrencyConfig,
  MiscellaneousExpense,
} from '../types';
import {
  calculateCumulativeStats,
  formatCurrency,
  calculateOrderFinancials,
  calculateTotalMiscellaneousExpenses,
} from '../utils/storage';

interface AccumulativeRecordsSectionProps {
  orders: OrderRecord[];
  products: YoghurtProduct[];
  costItems: CostItem[];
  currency: CurrencyConfig;
  miscellaneousExpenses?: MiscellaneousExpense[];
}

export const AccumulativeRecordsSection: React.FC<AccumulativeRecordsSectionProps> = ({
  orders = [],
  products = [],
  costItems = [],
  currency,
  miscellaneousExpenses = [],
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCostItems = Array.isArray(costItems) ? costItems : [];
  const safeExpenses = Array.isArray(miscellaneousExpenses) ? miscellaneousExpenses : [];

  // Filter orders based on chosen date range
  const filteredOrders = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const now = new Date();

    return safeOrders.filter((order) => {
      if (timeFilter === 'today') {
        return order.date === todayStr;
      }
      if (timeFilter === 'week') {
        const orderDate = new Date(order.date);
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (timeFilter === 'month') {
        const currentMonth = todayStr.slice(0, 7);
        return order.date.startsWith(currentMonth);
      }
      if (timeFilter === 'custom') {
        if (customStartDate && order.date < customStartDate) return false;
        if (customEndDate && order.date > customEndDate) return false;
        return true;
      }
      return true;
    });
  }, [safeOrders, timeFilter, customStartDate, customEndDate]);

  // Filter miscellaneous expenses based on chosen date range
  const filteredExpenses = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const now = new Date();

    return safeExpenses.filter((exp) => {
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
  }, [safeExpenses, timeFilter, customStartDate, customEndDate]);

  // Calculate cumulative stats on filtered orders and filtered expenses
  const stats: CumulativeStats = useMemo(() => {
    return calculateCumulativeStats(filteredOrders, safeProducts, safeCostItems, filteredExpenses);
  }, [filteredOrders, safeProducts, safeCostItems, filteredExpenses]);

  // Group orders and expenses by date for chronological presentation with financials
  const recordsByDate = useMemo(() => {
    const map: Record<
      string,
      {
        date: string;
        orderCount: number;
        totalBottles: number;
        totalRevenue: number;
        productionCost: number;
        productionProfit: number;
        miscExpenses: number;
        netBusinessProfit: number;
        byProduct: Record<
          string,
          {
            quantity: number;
            revenue: number;
            cost: number;
            profit: number;
          }
        >;
        orders: OrderRecord[];
        expenses: MiscellaneousExpense[];
      }
    > = {};

    // Process Orders
    filteredOrders.forEach((order) => {
      const fin = calculateOrderFinancials(order, safeProducts, safeCostItems);

      if (!map[order.date]) {
        map[order.date] = {
          date: order.date,
          orderCount: 0,
          totalBottles: 0,
          totalRevenue: 0,
          productionCost: 0,
          productionProfit: 0,
          miscExpenses: 0,
          netBusinessProfit: 0,
          byProduct: {
            'normal-30cl': { quantity: 0, revenue: 0, cost: 0, profit: 0 },
            'normal-50cl': { quantity: 0, revenue: 0, cost: 0, profit: 0 },
            'greek-500ml': { quantity: 0, revenue: 0, cost: 0, profit: 0 },
          },
          orders: [],
          expenses: [],
        };
      }

      map[order.date].orderCount += 1;
      map[order.date].totalBottles += fin.totalQuantity;
      map[order.date].totalRevenue += fin.totalRevenue;
      map[order.date].productionCost += fin.totalCost;
      map[order.date].productionProfit += fin.totalProfit;
      map[order.date].orders.push(order);

      fin.items.forEach((item) => {
        if (!map[order.date].byProduct[item.productId]) {
          map[order.date].byProduct[item.productId] = { quantity: 0, revenue: 0, cost: 0, profit: 0 };
        }
        map[order.date].byProduct[item.productId].quantity += item.quantity;
        map[order.date].byProduct[item.productId].revenue += item.revenue;
        map[order.date].byProduct[item.productId].cost += item.cost;
        map[order.date].byProduct[item.productId].profit += item.profit;
      });
    });

    // Process Miscellaneous Expenses
    filteredExpenses.forEach((exp) => {
      if (!map[exp.date]) {
        map[exp.date] = {
          date: exp.date,
          orderCount: 0,
          totalBottles: 0,
          totalRevenue: 0,
          productionCost: 0,
          productionProfit: 0,
          miscExpenses: 0,
          netBusinessProfit: 0,
          byProduct: {
            'normal-30cl': { quantity: 0, revenue: 0, cost: 0, profit: 0 },
            'normal-50cl': { quantity: 0, revenue: 0, cost: 0, profit: 0 },
            'greek-500ml': { quantity: 0, revenue: 0, cost: 0, profit: 0 },
          },
          orders: [],
          expenses: [],
        };
      }
      map[exp.date].miscExpenses += Number(exp.amount) || 0;
      map[exp.date].expenses.push(exp);
    });

    // Compute Net Business Profit for each date: Revenue - Production Costs - Misc Expenses
    Object.values(map).forEach((group) => {
      group.netBusinessProfit = group.totalRevenue - group.productionCost - group.miscExpenses;
    });

    // Convert to sorted array descending by date
    return Object.values(map).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredOrders, filteredExpenses, safeProducts, safeCostItems]);

  return (
    <div id="cumulative-records-container" className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DDD6CA] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#EAEFEA] text-[#45634D]">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#1C211E] font-display">
                Cumulative Revenue & Profit Records
              </h2>
            </div>
            <p className="text-xs text-[#697A6F] mt-0.5">
              Accumulative financial summaries, revenue, production costs, miscellaneous expenses, and net profit
            </p>
          </div>

          {/* Time Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F4EFE6] p-1 rounded-xl border border-[#DDD6CA] self-start sm:self-auto flex-wrap">
            <button
              id="cum-filter-all"
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
              id="cum-filter-today"
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
              id="cum-filter-week"
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
              id="cum-filter-month"
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
              id="cum-filter-custom"
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
        </div>

        {/* Custom Date Inputs if active */}
        {timeFilter === 'custom' && (
          <div className="mt-3 pt-3 border-t border-[#F0EBE1] flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-[#55635B]">From:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-[#F9F7F2] border border-[#D9D3C7] rounded-lg px-2 py-1 text-xs text-[#1C211E]"
            />
            <span className="font-semibold text-[#55635B]">To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-[#F9F7F2] border border-[#D9D3C7] rounded-lg px-2 py-1 text-xs text-[#1C211E]"
            />
          </div>
        )}
      </div>

      {/* 5 Core Cumulative Financial Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-3.5">
        {/* 1. Total Orders & Volume */}
        <div className="bg-white rounded-2xl p-4 border border-[#DDD6CA] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#697A6F] uppercase tracking-wider">
              Total Volume
            </span>
            <Receipt className="w-4 h-4 text-[#45634D]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#1C211E]">
              {stats.totalOrders}
            </span>
            <span className="text-xs font-semibold text-[#697A6F]">orders</span>
          </div>
          <p className="text-xs font-semibold text-[#2F4535] mt-1">
            {stats.totalBottlesSold} bottles sold
          </p>
        </div>

        {/* 2. Total Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-[#DDD6CA] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#697A6F] uppercase tracking-wider">
              Total Revenue
            </span>
            <DollarSign className="w-4 h-4 text-[#45634D]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-extrabold text-[#1C211E]">
              {formatCurrency(stats.totalRevenue, currency.symbol)}
            </span>
          </div>
          <p className="text-[10px] text-[#8C9C92] mt-1">
            Avg {stats.totalOrders > 0 ? formatCurrency(stats.totalRevenue / stats.totalOrders, currency.symbol) : '₦0.00'}/ord
          </p>
        </div>

        {/* 3. Production Costs (COGS) */}
        <div className="bg-white rounded-2xl p-4 border border-[#DDD6CA] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#697A6F] uppercase tracking-wider">
              Production Costs
            </span>
            <Layers className="w-4 h-4 text-[#55635B]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-extrabold text-[#55635B]">
              {formatCurrency(stats.totalProductionCost, currency.symbol)}
            </span>
          </div>
          <p className="text-[10px] text-[#8C9C92] mt-1">
            Direct ingredient & bottle costs
          </p>
        </div>

        {/* 4. Miscellaneous Expenses */}
        <div className="bg-white rounded-2xl p-4 border border-[#DDD6CA] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#9A5B2D] uppercase tracking-wider">
              Misc Expenses
            </span>
            <Wallet className="w-4 h-4 text-[#9A5B2D]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-extrabold text-[#78421A]">
              {formatCurrency(stats.totalMiscellaneousExpenses, currency.symbol)}
            </span>
          </div>
          <p className="text-[10px] text-[#9A5B2D] mt-1">
            {filteredExpenses.length} overhead record{filteredExpenses.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* 5. Net Business Profit */}
        <div className="bg-[#EAEFEA] rounded-2xl p-4 border border-[#C2D8C7] shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#2A4432] uppercase tracking-wider">
              Net Business Profit
            </span>
            <TrendingUp className="w-4 h-4 text-[#2A4432]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span
              className={`text-lg sm:text-xl font-extrabold ${
                stats.netBusinessProfit >= 0 ? 'text-[#24422C]' : 'text-rose-700'
              }`}
            >
              {stats.netBusinessProfit >= 0 ? '+' : ''}
              {formatCurrency(stats.netBusinessProfit, currency.symbol)}
            </span>
          </div>
          <p className="text-xs font-bold text-[#34523B] mt-1">
            {stats.netBusinessMarginPercent.toFixed(1)}% net margin
          </p>
        </div>
      </div>

      {/* Financial Reconciliation & Profit Equation Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DDD6CA] shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#45634D]" />
            <h3 className="font-bold text-xs sm:text-sm text-[#1C211E] font-display">
              Financial Breakdown & Net Business Profit Equation
            </h3>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 bg-[#F4EFE6] text-[#45634D] rounded-md border border-[#DDD6CA]">
            Deterministic Calculation
          </span>
        </div>

        {/* The Equation Visual Strip */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 items-center text-xs">
          {/* Total Revenue */}
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8]">
            <span className="text-[10px] uppercase font-bold text-[#697A6F] block">1. Total Revenue</span>
            <span className="text-sm font-extrabold text-[#1C211E] block mt-0.5">
              {formatCurrency(stats.totalRevenue, currency.symbol)}
            </span>
            <span className="text-[10px] text-[#8C9C92]">From {stats.totalBottlesSold} bottles</span>
          </div>

          {/* Minus Production Costs */}
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8]">
            <span className="text-[10px] uppercase font-bold text-[#55635B] block">− Production Costs</span>
            <span className="text-sm font-extrabold text-[#55635B] block mt-0.5">
              −{formatCurrency(stats.totalProductionCost, currency.symbol)}
            </span>
            <span className="text-[10px] text-[#8C9C92]">Unit ingredients & bottles</span>
          </div>

          {/* Production Gross Profit */}
          <div className="p-3 rounded-xl bg-[#F4EFE6] border border-[#DDD6CA]">
            <span className="text-[10px] uppercase font-bold text-[#45634D] block">= Production Profit</span>
            <span className="text-sm font-extrabold text-[#2F4535] block mt-0.5">
              {formatCurrency(stats.productionProfit, currency.symbol)}
            </span>
            <span className="text-[10px] text-[#45634D] font-bold">({stats.overallMarginPercent.toFixed(1)}% margin)</span>
          </div>

          {/* Minus Misc Expenses */}
          <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E6DAC8]">
            <span className="text-[10px] uppercase font-bold text-[#9A5B2D] block">− Misc Expenses</span>
            <span className="text-sm font-extrabold text-[#78421A] block mt-0.5">
              −{formatCurrency(stats.totalMiscellaneousExpenses, currency.symbol)}
            </span>
            <span className="text-[10px] text-[#9A5B2D]">Fuel, logistics & repairs</span>
          </div>

          {/* Equals Net Business Profit */}
          <div className="p-3 rounded-xl bg-[#EAEFEA] border border-[#C2D8C7]">
            <span className="text-[10px] uppercase font-bold text-[#2A4432] block">= Net Business Profit</span>
            <span className={`text-sm font-extrabold block mt-0.5 ${stats.netBusinessProfit >= 0 ? 'text-[#24422C]' : 'text-rose-700'}`}>
              {stats.netBusinessProfit >= 0 ? '+' : ''}{formatCurrency(stats.netBusinessProfit, currency.symbol)}
            </span>
            <span className="text-[10px] text-[#2A4432] font-bold">({stats.netBusinessMarginPercent.toFixed(1)}% net)</span>
          </div>
        </div>

        {/* Clear Explanation Note */}
        <div className="pt-2 flex items-start gap-2 text-[11px] text-[#697A6F]">
          <Info className="w-3.5 h-3.5 text-[#45634D] flex-shrink-0 mt-0.5" />
          <p>
            <strong>Distinct Cost Tracking:</strong> (1) <em>Production Costs</em> are locked per order from the recipe at order time. (2) <em>Miscellaneous Expenses</em> represent independent operational overhead recorded in the Miscellaneous Expenses section.
          </p>
        </div>
      </div>

      {/* Breakdown by Specific Product and Size */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DDD6CA] shadow-2xs">
        <h3 className="font-bold text-sm text-[#1C211E] font-display mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#45634D]" />
          Cumulative Product Breakdown (Volume, Revenue & Production Profit)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {products.map((prod) => {
            const prodStats = stats.byProduct[prod.id];
            const productQty = prodStats?.quantity || 0;
            const percentage =
              stats.totalBottlesSold > 0
                ? Math.round((productQty / stats.totalBottlesSold) * 100)
                : 0;

            const prodRev = prodStats?.revenue || 0;
            const prodCost = prodStats?.cost || 0;
            const prodProfit = prodStats?.profit || 0;
            const prodMargin = prodStats?.marginPercent || 0;

            return (
              <div
                key={prod.id}
                className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1E2621] text-[#F9F7F2]">
                      {prod.size}
                    </span>
                    <span className="text-xs font-bold text-[#45634D]">{percentage}% of volume</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#1C211E]">{prod.name}</h4>
                  <p className="text-[11px] text-[#697A6F] mt-0.5">{prod.productType}</p>
                </div>

                {/* Metrics */}
                <div className="pt-2 border-t border-[#EAE4D8] space-y-1.5 text-xs bg-white p-2.5 rounded-xl border border-[#EDE8DE]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#697A6F] text-[11px]">Units Sold:</span>
                    <strong className="text-[#1C211E] font-display">{productQty} bottles</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#697A6F] text-[11px]">Revenue:</span>
                    <strong className="text-[#1C211E]">{formatCurrency(prodRev, currency.symbol)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#697A6F] text-[11px]">Production Cost:</span>
                    <span className="text-[#55635B] font-medium">{formatCurrency(prodCost, currency.symbol)}</span>
                  </div>
                  <div className="pt-1.5 border-t border-dashed border-[#EAE4D8] flex items-center justify-between">
                    <span className="text-[#45634D] font-bold text-[11px]">Production Profit:</span>
                    <div className="text-right">
                      <strong className={`font-extrabold ${prodProfit >= 0 ? 'text-[#2A4432]' : 'text-rose-700'}`}>
                        {prodProfit >= 0 ? '+' : ''}{formatCurrency(prodProfit, currency.symbol)}
                      </strong>
                      <span className="text-[10px] text-[#697A6F] block">({prodMargin.toFixed(1)}% margin)</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cumulative Records Organized by Date */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DDD6CA] shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#45634D]" />
            <h3 className="font-bold text-sm text-[#1C211E] font-display">
              Orders, Expenses & Net Profits Organized by Date
            </h3>
          </div>
          <span className="text-xs text-[#697A6F] font-medium">
            {recordsByDate.length} active day{recordsByDate.length === 1 ? '' : 's'}
          </span>
        </div>

        {recordsByDate.length === 0 ? (
          <p className="text-xs text-[#697A6F] text-center py-6">
            No order or expense records found for the selected time period.
          </p>
        ) : (
          <div className="space-y-3">
            {recordsByDate.map((group) => (
              <div
                key={group.date}
                className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E3D8] hover:border-[#B2C7B7] transition space-y-2.5"
              >
                {/* Date header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-[#EAE4D8]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-[#1C211E]">
                      {group.date}
                    </span>
                    {group.orderCount > 0 && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-[#E8EFE9] text-[#2F4535] rounded-md border border-[#C5D9CA]">
                        {group.orderCount} order{group.orderCount === 1 ? '' : 's'} • {group.totalBottles} bottles
                      </span>
                    )}
                    {group.expenses.length > 0 && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-[#FAF6F0] text-[#9A5B2D] rounded-md border border-[#E6DAC8]">
                        {group.expenses.length} misc expense{group.expenses.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold pt-1 sm:pt-0 flex-wrap">
                    <div>
                      <span className="text-[#697A6F] font-normal text-[11px]">Revenue: </span>
                      <span className="text-[#1C211E]">{formatCurrency(group.totalRevenue, currency.symbol)}</span>
                    </div>
                    {group.miscExpenses > 0 && (
                      <div>
                        <span className="text-[#9A5B2D] font-normal text-[11px]">Overhead: </span>
                        <span className="text-[#78421A]">−{formatCurrency(group.miscExpenses, currency.symbol)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[#697A6F] font-normal text-[11px]">Net Profit: </span>
                      <span className={`${group.netBusinessProfit >= 0 ? 'text-[#2A4432]' : 'text-rose-700'} font-extrabold`}>
                        {group.netBusinessProfit >= 0 ? '+' : ''}{formatCurrency(group.netBusinessProfit, currency.symbol)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Day Product breakdown if orders exist */}
                {group.orderCount > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-2 rounded-lg border border-[#EAE4D8] text-center">
                      <span className="text-[10px] text-[#697A6F] block">Normal 30cl</span>
                      <span className="font-bold text-xs text-[#1C211E]">
                        {group.byProduct['normal-30cl']?.quantity || 0} btls
                      </span>
                      <span className="text-[10px] text-[#45634D] block font-semibold">
                        +{formatCurrency(group.byProduct['normal-30cl']?.profit || 0, currency.symbol)}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-[#EAE4D8] text-center">
                      <span className="text-[10px] text-[#697A6F] block">Normal 50cl</span>
                      <span className="font-bold text-xs text-[#1C211E]">
                        {group.byProduct['normal-50cl']?.quantity || 0} btls
                      </span>
                      <span className="text-[10px] text-[#45634D] block font-semibold">
                        +{formatCurrency(group.byProduct['normal-50cl']?.profit || 0, currency.symbol)}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-[#EAE4D8] text-center">
                      <span className="text-[10px] text-[#697A6F] block">Greek 500ml</span>
                      <span className="font-bold text-xs text-[#1C211E]">
                        {group.byProduct['greek-500ml']?.quantity || 0} btls
                      </span>
                      <span className="text-[10px] text-[#45634D] block font-semibold">
                        +{formatCurrency(group.byProduct['greek-500ml']?.profit || 0, currency.symbol)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Day Miscellaneous Expense Items */}
                {group.expenses.length > 0 && (
                  <div className="bg-[#FAF6F0] p-2.5 rounded-lg border border-[#E6DAC8] space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-[#9A5B2D] uppercase tracking-wider block">
                      Day Miscellaneous Expenses ({formatCurrency(group.miscExpenses, currency.symbol)})
                    </span>
                    <div className="space-y-1">
                      {group.expenses.map((exp) => (
                        <div key={exp.id} className="flex items-center justify-between text-[11px] text-[#1C211E]">
                          <span className="truncate">• {exp.description}</span>
                          <strong className="text-[#78421A] flex-shrink-0 ml-2 font-mono">
                            {formatCurrency(exp.amount, currency.symbol)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order References that day */}
                {group.orders.length > 0 && (
                  <div className="pt-1.5 border-t border-[#F0ECE4] flex flex-wrap items-center gap-1.5 text-[11px] text-[#697A6F]">
                    <span className="font-semibold">Order Refs:</span>
                    {group.orders.map((ord) => (
                      <span
                        key={ord.id}
                        className="px-1.5 py-0.5 bg-white rounded border border-[#E0D8CC] text-[#1C211E] font-mono text-[10px]"
                      >
                        {ord.referenceNumber}
                        {ord.customerName ? ` (${ord.customerName})` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

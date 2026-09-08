import React, { useState, useMemo } from 'react';
import {
  Calendar,
  TrendingUp,
  Receipt,
  Package,
  Milk,
  ChevronDown,
  ChevronRight,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertCircle,
  Plus,
  Search,
  ExternalLink,
  Tag,
  DollarSign,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import {
  OrderRecord,
  YoghurtProduct,
  CostItem,
  CurrencyConfig,
} from '../types';
import {
  calculateOrderFinancials,
  formatCurrency,
} from '../utils/storage';

export type DailySalesFilter = 'today' | 'yesterday' | 'past7' | 'this_month' | 'custom' | 'all';

interface DailySalesTrackerSectionProps {
  orders: OrderRecord[];
  products: YoghurtProduct[];
  costItems: CostItem[];
  currency: CurrencyConfig;
  onNavigateToOrders?: () => void;
  onOpenNewOrderModal?: () => void;
}

interface ProductSalesAggregate {
  productId: string;
  productName: string;
  productType: string;
  size: string;
  bottlesSold: number;
  revenue: number;
  productionCost: number;
  profit: number;
  marginPercent: number;
}

interface DayAggregate {
  date: string;
  orderCount: number;
  bottlesSold: number;
  revenue: number;
  productionCost: number;
  profit: number;
  marginPercent: number;
  byProduct: Record<string, { quantity: number; revenue: number; cost: number; profit: number }>;
  orders: Array<{
    order: OrderRecord;
    financials: ReturnType<typeof calculateOrderFinancials>;
  }>;
}

// Safe Local YYYY-MM-DD Date Helper
function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const DailySalesTrackerSection: React.FC<DailySalesTrackerSectionProps> = ({
  orders = [],
  products = [],
  costItems = [],
  currency,
  onNavigateToOrders,
  onOpenNewOrderModal,
}) => {
  const [filterType, setFilterType] = useState<DailySalesFilter>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const [searchDayTerm, setSearchDayTerm] = useState('');

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCostItems = Array.isArray(costItems) ? costItems : [];

  const todayStr = useMemo(() => getLocalDateString(new Date()), []);
  const yesterdayStr = useMemo(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return getLocalDateString(y);
  }, []);
  const past7DaysStartStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return getLocalDateString(d);
  }, []);
  const thisMonthPrefix = useMemo(() => todayStr.slice(0, 7), [todayStr]);

  // Filter orders based on selected date filter
  const filteredOrders = useMemo(() => {
    return safeOrders.filter((order) => {
      const orderDate = order.date;
      if (!orderDate) return false;

      switch (filterType) {
        case 'today':
          return orderDate === todayStr;
        case 'yesterday':
          return orderDate === yesterdayStr;
        case 'past7':
          return orderDate >= past7DaysStartStr && orderDate <= todayStr;
        case 'this_month':
          return orderDate.startsWith(thisMonthPrefix);
        case 'custom': {
          if (customStartDate && orderDate < customStartDate) return false;
          if (customEndDate && orderDate > customEndDate) return false;
          return true;
        }
        case 'all':
        default:
          return true;
      }
    });
  }, [
    safeOrders,
    filterType,
    todayStr,
    yesterdayStr,
    past7DaysStartStr,
    thisMonthPrefix,
    customStartDate,
    customEndDate,
  ]);

  // Compute Overall Totals for the selected date range
  const summaryTotals = useMemo(() => {
    let orderCount = filteredOrders.length;
    let bottlesSold = 0;
    let revenue = 0;
    let productionCost = 0;
    let hasMissingPriceOrCost = false;

    // Standard products aggregation
    const productMap: Record<string, ProductSalesAggregate> = {
      'normal-30cl': {
        productId: 'normal-30cl',
        productName: 'Normal Yoghurt — 30cl',
        productType: 'Normal Yoghurt',
        size: '30cl',
        bottlesSold: 0,
        revenue: 0,
        productionCost: 0,
        profit: 0,
        marginPercent: 0,
      },
      'normal-50cl': {
        productId: 'normal-50cl',
        productName: 'Normal Yoghurt — 50cl',
        productType: 'Normal Yoghurt',
        size: '50cl',
        bottlesSold: 0,
        revenue: 0,
        productionCost: 0,
        profit: 0,
        marginPercent: 0,
      },
      'greek-500ml': {
        productId: 'greek-500ml',
        productName: 'Greek Yoghurt — 500ml',
        productType: 'Greek Yoghurt',
        size: '500ml',
        bottlesSold: 0,
        revenue: 0,
        productionCost: 0,
        profit: 0,
        marginPercent: 0,
      },
    };

    filteredOrders.forEach((order) => {
      const fin = calculateOrderFinancials(order, safeProducts, safeCostItems);
      if (fin.hasMissingSellingPrice || fin.hasMissingCost) {
        hasMissingPriceOrCost = true;
      }

      fin.items.forEach((item) => {
        const qty = item.quantity || 0;
        bottlesSold += qty;
        revenue += item.revenue;
        productionCost += item.cost;

        const prodKey = item.productId;
        if (!productMap[prodKey]) {
          productMap[prodKey] = {
            productId: item.productId,
            productName: item.productName,
            productType: item.productType,
            size: item.size,
            bottlesSold: 0,
            revenue: 0,
            productionCost: 0,
            profit: 0,
            marginPercent: 0,
          };
        }

        productMap[prodKey].bottlesSold += qty;
        productMap[prodKey].revenue += item.revenue;
        productMap[prodKey].productionCost += item.cost;
        productMap[prodKey].profit =
          productMap[prodKey].revenue - productMap[prodKey].productionCost;
        productMap[prodKey].marginPercent =
          productMap[prodKey].revenue > 0
            ? (productMap[prodKey].profit / productMap[prodKey].revenue) * 100
            : 0;
      });
    });

    const profit = revenue - productionCost;
    const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      orderCount,
      bottlesSold,
      revenue,
      productionCost,
      profit, // Profit before miscellaneous expenses
      marginPercent,
      hasMissingPriceOrCost,
      productBreakdown: productMap,
    };
  }, [filteredOrders, safeProducts, safeCostItems]);

  // Aggregate by Date for the Daily Sales Table (sorted latest first)
  const dailyTableData: DayAggregate[] = useMemo(() => {
    const dayMap: Record<string, DayAggregate> = {};

    filteredOrders.forEach((order) => {
      const d = order.date;
      const fin = calculateOrderFinancials(order, safeProducts, safeCostItems);

      if (!dayMap[d]) {
        dayMap[d] = {
          date: d,
          orderCount: 0,
          bottlesSold: 0,
          revenue: 0,
          productionCost: 0,
          profit: 0,
          marginPercent: 0,
          byProduct: {
            'normal-30cl': { quantity: 0, revenue: 0, cost: 0, profit: 0 },
            'normal-50cl': { quantity: 0, revenue: 0, cost: 0, profit: 0 },
            'greek-500ml': { quantity: 0, revenue: 0, cost: 0, profit: 0 },
          },
          orders: [],
        };
      }

      dayMap[d].orderCount += 1;
      dayMap[d].bottlesSold += fin.totalQuantity;
      dayMap[d].revenue += fin.totalRevenue;
      dayMap[d].productionCost += fin.totalCost;
      dayMap[d].profit += fin.totalProfit;
      dayMap[d].orders.push({ order, financials: fin });

      fin.items.forEach((item) => {
        const pKey = item.productId;
        if (!dayMap[d].byProduct[pKey]) {
          dayMap[d].byProduct[pKey] = { quantity: 0, revenue: 0, cost: 0, profit: 0 };
        }
        dayMap[d].byProduct[pKey].quantity += item.quantity;
        dayMap[d].byProduct[pKey].revenue += item.revenue;
        dayMap[d].byProduct[pKey].cost += item.cost;
        dayMap[d].byProduct[pKey].profit += item.profit;
      });
    });

    // Calculate margins and sort descending by date
    const list = Object.values(dayMap).map((day) => ({
      ...day,
      marginPercent: day.revenue > 0 ? (day.profit / day.revenue) * 100 : 0,
      orders: day.orders.sort((a, b) => b.order.createdAt.localeCompare(a.order.createdAt)),
    }));

    list.sort((a, b) => b.date.localeCompare(a.date));

    if (!searchDayTerm) return list;

    const query = searchDayTerm.toLowerCase();
    return list.filter(
      (day) =>
        day.date.toLowerCase().includes(query) ||
        day.orders.some(
          (o) =>
            o.order.referenceNumber.toLowerCase().includes(query) ||
            (o.order.customerName && o.order.customerName.toLowerCase().includes(query))
        )
    );
  }, [filteredOrders, safeProducts, safeCostItems, searchDayTerm]);

  const toggleExpandDate = (date: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const expandAllDates = () => {
    const all: Record<string, boolean> = {};
    dailyTableData.forEach((d) => {
      all[d.date] = true;
    });
    setExpandedDates(all);
  };

  const collapseAllDates = () => {
    setExpandedDates({});
  };

  // Human readable title for current date filter
  const getFilterLabel = () => {
    switch (filterType) {
      case 'today':
        return `Today (${todayStr})`;
      case 'yesterday':
        return `Yesterday (${yesterdayStr})`;
      case 'past7':
        return `Past 7 Days (${past7DaysStartStr} to ${todayStr})`;
      case 'this_month':
        return `This Month (${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`;
      case 'custom':
        if (customStartDate && customEndDate) {
          return `Range: ${customStartDate} to ${customEndDate}`;
        }
        if (customStartDate) return `From ${customStartDate}`;
        if (customEndDate) return `Up to ${customEndDate}`;
        return 'Custom Date Range';
      case 'all':
      default:
        return 'All Recorded Days';
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      // Fallback
    }
    return dateStr;
  };

  return (
    <div id="daily-sales-tracker-section" className="space-y-6">
      {/* 1. Header & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E2D7] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#EBF3ED] text-[#34523B]">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#1C211E] tracking-tight">
                  Daily Sales Tracker
                </h2>
                <p className="text-xs text-[#6B786E]">
                  Summarized sales & profitability from confirmed Orders & Invoices records
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenNewOrderModal && (
              <button
                type="button"
                id="daily-sales-record-order-btn"
                onClick={onOpenNewOrderModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#45634D] hover:bg-[#3B5542] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Order</span>
              </button>
            )}
            {onNavigateToOrders && (
              <button
                type="button"
                id="daily-sales-view-orders-btn"
                onClick={onNavigateToOrders}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F2EC] hover:bg-[#EAE5DB] text-[#243328] border border-[#DDD6CA] text-xs font-bold transition cursor-pointer"
                title="Jump to Orders & Invoices list"
              >
                <Receipt className="w-3.5 h-3.5 text-[#45634D]" />
                <span className="hidden sm:inline">All Orders</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="pt-2 border-t border-[#F0ECE4]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-[#859388] mr-1 hidden sm:inline-flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>

            <button
              type="button"
              id="filter-daily-sales-today"
              onClick={() => setFilterType('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterType === 'today'
                  ? 'bg-[#243328] text-white shadow-2xs'
                  : 'bg-[#F5F2EC] text-[#55635B] hover:bg-[#EAE5DB] hover:text-[#1C211E]'
              }`}
            >
              Today
            </button>

            <button
              type="button"
              id="filter-daily-sales-yesterday"
              onClick={() => setFilterType('yesterday')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterType === 'yesterday'
                  ? 'bg-[#243328] text-white shadow-2xs'
                  : 'bg-[#F5F2EC] text-[#55635B] hover:bg-[#EAE5DB] hover:text-[#1C211E]'
              }`}
            >
              Yesterday
            </button>

            <button
              type="button"
              id="filter-daily-sales-past7"
              onClick={() => setFilterType('past7')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterType === 'past7'
                  ? 'bg-[#243328] text-white shadow-2xs'
                  : 'bg-[#F5F2EC] text-[#55635B] hover:bg-[#EAE5DB] hover:text-[#1C211E]'
              }`}
            >
              Past 7 Days
            </button>

            <button
              type="button"
              id="filter-daily-sales-this-month"
              onClick={() => setFilterType('this_month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterType === 'this_month'
                  ? 'bg-[#243328] text-white shadow-2xs'
                  : 'bg-[#F5F2EC] text-[#55635B] hover:bg-[#EAE5DB] hover:text-[#1C211E]'
              }`}
            >
              This Month
            </button>

            <button
              type="button"
              id="filter-daily-sales-custom"
              onClick={() => setFilterType('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterType === 'custom'
                  ? 'bg-[#243328] text-white shadow-2xs'
                  : 'bg-[#F5F2EC] text-[#55635B] hover:bg-[#EAE5DB] hover:text-[#1C211E]'
              }`}
            >
              Custom Date Range
            </button>

            <button
              type="button"
              id="filter-daily-sales-all"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ml-auto ${
                filterType === 'all'
                  ? 'bg-[#3A4E3F] text-white'
                  : 'text-[#6B786E] hover:text-[#1C211E] hover:bg-[#F5F2EC]'
              }`}
              title="Show all recorded sales across all dates"
            >
              All Days ({safeOrders.length})
            </button>
          </div>

          {/* Custom Date Range Inputs */}
          {filterType === 'custom' && (
            <div
              id="custom-date-inputs-panel"
              className="mt-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E2D7] flex flex-wrap items-center gap-3 animate-fadeIn"
            >
              <div className="flex items-center gap-2">
                <label htmlFor="custom-start-date" className="text-xs font-semibold text-[#55635B]">
                  From:
                </label>
                <input
                  id="custom-start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#DDD6CA] bg-white text-xs font-medium text-[#1C211E] focus:outline-hidden focus:ring-2 focus:ring-[#45634D]"
                />
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="custom-end-date" className="text-xs font-semibold text-[#55635B]">
                  To:
                </label>
                <input
                  id="custom-end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#DDD6CA] bg-white text-xs font-medium text-[#1C211E] focus:outline-hidden focus:ring-2 focus:ring-[#45634D]"
                />
              </div>

              {(customStartDate || customEndDate) && (
                <button
                  type="button"
                  id="custom-date-clear-btn"
                  onClick={() => {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="text-xs text-[#859388] hover:text-[#1C211E] underline cursor-pointer"
                >
                  Clear dates
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (For Selected Date / Range) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B786E]">
              Selected Scope:
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EBF3ED] text-[#2F6A3E] text-xs font-bold border border-[#D4E8D9]">
              {getFilterLabel()}
            </span>
          </div>
          <span className="text-xs text-[#859388]">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Card 1: Orders */}
          <div
            id="kpi-orders-count"
            className="bg-white p-4 rounded-2xl border border-[#E8E2D7] shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B786E]">Total Orders</span>
              <Receipt className="w-4 h-4 text-[#859388]" />
            </div>
            <p className="text-2xl font-black text-[#1C211E] mt-2">
              {summaryTotals.orderCount}
            </p>
            <p className="text-[11px] text-[#859388] mt-0.5">Invoices recorded</p>
          </div>

          {/* Card 2: Bottles Sold */}
          <div
            id="kpi-bottles-sold"
            className="bg-white p-4 rounded-2xl border border-[#E8E2D7] shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B786E]">Bottles Sold</span>
              <Milk className="w-4 h-4 text-[#45634D]" />
            </div>
            <p className="text-2xl font-black text-[#1C211E] mt-2">
              {summaryTotals.bottlesSold}
            </p>
            <p className="text-[11px] text-[#859388] mt-0.5">Units dispatched</p>
          </div>

          {/* Card 3: Total Revenue */}
          <div
            id="kpi-total-revenue"
            className="bg-white p-4 rounded-2xl border border-[#E8E2D7] shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B786E]">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-[#2F6A3E]" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-[#1C211E] mt-2 tracking-tight">
              {formatCurrency(summaryTotals.revenue, currency.symbol)}
            </p>
            <p className="text-[11px] text-[#859388] mt-0.5">Gross sales value</p>
          </div>

          {/* Card 4: Total Production Cost */}
          <div
            id="kpi-production-cost"
            className="bg-white p-4 rounded-2xl border border-[#E8E2D7] shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B786E]">Production Cost</span>
              <Package className="w-4 h-4 text-[#8C6B3D]" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-[#1C211E] mt-2 tracking-tight">
              {formatCurrency(summaryTotals.productionCost, currency.symbol)}
            </p>
            <p className="text-[11px] text-[#859388] mt-0.5">Direct bottle COGS</p>
          </div>

          {/* Card 5: Profit Before Misc. Expenses */}
          <div
            id="kpi-profit-before-misc"
            className="col-span-2 md:col-span-1 bg-[#243328] text-white p-4 rounded-2xl border border-[#1A261E] shadow-xs"
          >
            <div className="flex items-center justify-between text-[#A8D5AF]">
              <span className="text-[11px] font-bold tracking-wide uppercase">
                Profit (Before Misc)
              </span>
              <TrendingUp className="w-4 h-4 text-[#A8D5AF]" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
              {formatCurrency(summaryTotals.profit, currency.symbol)}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#34483B] text-[#A8D5AF]">
                {summaryTotals.marginPercent.toFixed(1)}% margin
              </span>
              <span className="text-[10px] text-[#879D8E] truncate">Excludes overhead</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Product Breakdown Section */}
      <div
        id="daily-sales-product-breakdown"
        className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E2D7] shadow-2xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#45634D]" />
            <h3 className="text-sm sm:text-base font-bold text-[#1C211E]">
              Product Breakdown ({getFilterLabel()})
            </h3>
          </div>
          <span className="text-xs text-[#859388]">Bottles sold by yoghurt size</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          {products.length === 0 ? (
            <div className="col-span-full py-6 text-center text-xs text-[#859388] bg-[#FAF8F5] rounded-xl border border-dashed border-[#DDD6CA]">
              No products configured yet. Add yoghurt products to see individual size breakdowns.
            </div>
          ) : (
            products.map((prod) => {
              const p = summaryTotals.productBreakdown[prod.id] || {
                bottlesSold: 0,
                revenue: 0,
                productionCost: 0,
                profit: 0,
                marginPercent: 0,
              };
              const share =
                summaryTotals.bottlesSold > 0
                  ? ((p.bottlesSold / summaryTotals.bottlesSold) * 100).toFixed(0)
                  : '0';

              return (
                <div
                  key={prod.id}
                  id={`product-card-${prod.id}`}
                  className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8E2D7] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1C211E] truncate max-w-[170px]" title={prod.name}>
                        {prod.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAE5DB] text-[#45634D]">
                        {share}% of sold
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#1C211E]">
                        {p.bottlesSold}
                      </span>
                      <span className="text-xs text-[#6B786E] font-medium">bottles sold</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E8E2D7] space-y-1 text-xs">
                    <div className="flex justify-between text-[#55635B]">
                      <span>Revenue:</span>
                      <span className="font-semibold text-[#1C211E]">
                        {formatCurrency(p.revenue, currency.symbol)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#55635B]">
                      <span>Cost:</span>
                      <span className="font-semibold text-[#8C6B3D]">
                        {formatCurrency(p.productionCost, currency.symbol)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#2F6A3E] font-bold pt-0.5">
                      <span>Profit:</span>
                      <span>
                        {formatCurrency(p.profit, currency.symbol)} ({p.marginPercent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Daily Sales Table Section */}
      <div className="bg-white rounded-2xl border border-[#E8E2D7] shadow-2xs overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-4 sm:p-5 border-b border-[#E8E2D7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5]">
          <div>
            <h3 className="text-base font-bold text-[#1C211E] flex items-center gap-2">
              <span>Daily Sales Ledger</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#EAE5DB] text-[#45634D]">
                {dailyTableData.length} {dailyTableData.length === 1 ? 'day' : 'days'}
              </span>
            </h3>
            <p className="text-xs text-[#6B786E] mt-0.5">
              Day-by-day orders, quantities, revenue, production costs, and profit
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search within filtered days */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#859388]" />
              <input
                id="search-daily-ledger-input"
                type="text"
                placeholder="Search date or invoice..."
                value={searchDayTerm}
                onChange={(e) => setSearchDayTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-[#DDD6CA] bg-white text-xs text-[#1C211E] placeholder:text-[#859388] focus:outline-hidden focus:ring-2 focus:ring-[#45634D]"
              />
            </div>

            {dailyTableData.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="btn-expand-all-days"
                  onClick={expandAllDates}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F5F2EC] text-[#55635B] border border-[#DDD6CA] text-xs font-semibold transition cursor-pointer"
                  title="Expand all days to see invoices"
                >
                  Expand
                </button>
                <button
                  type="button"
                  id="btn-collapse-all-days"
                  onClick={collapseAllDates}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F5F2EC] text-[#55635B] border border-[#DDD6CA] text-xs font-semibold transition cursor-pointer"
                  title="Collapse all rows"
                >
                  Collapse
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table Content */}
        {dailyTableData.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F2EC] flex items-center justify-center mx-auto text-[#859388]">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#1C211E]">
              No sales records found for {getFilterLabel().toLowerCase()}
            </h4>
            <p className="text-xs text-[#6B786E] max-w-md mx-auto">
              There are no confirmed orders dated in this period. You can switch to another filter
              or record a new invoice.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                id="empty-state-view-all-btn"
                onClick={() => setFilterType('all')}
                className="px-3 py-1.5 rounded-xl bg-[#F5F2EC] hover:bg-[#EAE5DB] text-[#243328] text-xs font-bold transition cursor-pointer"
              >
                Show All Days
              </button>
              {onOpenNewOrderModal && (
                <button
                  type="button"
                  id="empty-state-record-order-btn"
                  onClick={onOpenNewOrderModal}
                  className="px-3 py-1.5 rounded-xl bg-[#45634D] hover:bg-[#3B5542] text-white text-xs font-bold transition cursor-pointer"
                >
                  Record Order
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="daily-sales-table" className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E2D7] bg-[#FAF8F5] text-[11px] font-bold text-[#55635B] uppercase tracking-wider">
                  <th className="py-3 px-4 w-8"></th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4 text-center">Bottles Sold</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                  <th className="py-3 px-4 text-right">Production Cost</th>
                  <th className="py-3 px-4 text-right">Profit (Before Misc)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE4] text-xs">
                {dailyTableData.map((day) => {
                  const isExpanded = !!expandedDates[day.date];
                  const isToday = day.date === todayStr;
                  const isYesterday = day.date === yesterdayStr;

                  return (
                    <React.Fragment key={day.date}>
                      {/* Main Day Summary Row */}
                      <tr
                        id={`row-day-${day.date}`}
                        onClick={() => toggleExpandDate(day.date)}
                        className={`hover:bg-[#FAF8F5] transition cursor-pointer ${
                          isExpanded ? 'bg-[#FAF8F5]' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 text-[#859388]">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[#45634D]" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#859388]" />
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1C211E]">
                              {formatDateDisplay(day.date)}
                            </span>
                            {isToday && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF3ED] text-[#2F6A3E] border border-[#D4E8D9]">
                                Today
                              </span>
                            )}
                            {isYesterday && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5F2EC] text-[#6B786E]">
                                Yesterday
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#859388] font-mono">{day.date}</span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-[#F5F2EC] text-[#1C211E] font-bold text-xs">
                            {day.orderCount}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-black text-[#1C211E] text-sm">
                              {day.bottlesSold}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-[#859388] mt-0.5">
                              {day.byProduct['normal-30cl']?.quantity > 0 && (
                                <span title="30cl">
                                  30c:{day.byProduct['normal-30cl'].quantity}
                                </span>
                              )}
                              {day.byProduct['normal-50cl']?.quantity > 0 && (
                                <span title="50cl">
                                  50c:{day.byProduct['normal-50cl'].quantity}
                                </span>
                              )}
                              {day.byProduct['greek-500ml']?.quantity > 0 && (
                                <span title="Greek 500ml">
                                  Gr:{day.byProduct['greek-500ml'].quantity}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-[#1C211E]">
                          {formatCurrency(day.revenue, currency.symbol)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-medium text-[#8C6B3D]">
                          {formatCurrency(day.productionCost, currency.symbol)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span
                              className={`font-black text-sm ${
                                day.profit >= 0 ? 'text-[#2F6A3E]' : 'text-[#A03232]'
                              }`}
                            >
                              {formatCurrency(day.profit, currency.symbol)}
                            </span>
                            <span className="text-[10px] font-semibold text-[#859388]">
                              {day.marginPercent.toFixed(1)}% margin
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Orders Drawer for this Day */}
                      {isExpanded && (
                        <tr
                          id={`expanded-day-orders-${day.date}`}
                          className="bg-[#F8F6F1] border-b border-[#E8E2D7]"
                        >
                          <td colSpan={7} className="py-3 px-4 sm:px-8">
                            <div className="bg-white rounded-xl p-3 sm:p-4 border border-[#DDD6CA] space-y-3 shadow-2xs">
                              <div className="flex items-center justify-between border-b border-[#F0ECE4] pb-2">
                                <span className="text-xs font-bold text-[#243328] flex items-center gap-1.5">
                                  <Receipt className="w-3.5 h-3.5 text-[#45634D]" />
                                  Itemized Orders for {day.date} ({day.orders.length})
                                </span>
                                <span className="text-[11px] text-[#859388]">
                                  Historical selling-price & cost snapshots applied
                                </span>
                              </div>

                              <div className="space-y-2">
                                {day.orders.map(({ order, financials }) => (
                                  <div
                                    key={order.id}
                                    id={`order-card-${order.id}`}
                                    className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E8E2D7] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-[#1C211E] bg-white px-1.5 py-0.5 rounded border border-[#E8E2D7]">
                                          {order.referenceNumber}
                                        </span>
                                        {order.customerName && (
                                          <span className="font-medium text-[#55635B]">
                                            • {order.customerName}
                                          </span>
                                        )}
                                      </div>

                                      {/* Order Items Breakdown */}
                                      <div className="flex flex-wrap gap-1.5 text-[11px] text-[#6B786E]">
                                        {financials.items.map((item, idx) => (
                                          <span
                                            key={idx}
                                            className="px-2 py-0.5 rounded bg-white border border-[#E8E2D7]"
                                          >
                                            <strong className="text-[#1C211E]">
                                              {item.quantity}x
                                            </strong>{' '}
                                            {item.productName}{' '}
                                            <span className="text-[#859388]">
                                              (@ {formatCurrency(item.unitPrice, currency.symbol)}
                                              )
                                            </span>
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Order Financials */}
                                    <div className="flex items-center gap-4 text-right self-end sm:self-auto">
                                      <div>
                                        <span className="block text-[10px] text-[#859388]">
                                          Bottles
                                        </span>
                                        <span className="font-bold text-[#1C211E]">
                                          {financials.totalQuantity}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="block text-[10px] text-[#859388]">
                                          Revenue
                                        </span>
                                        <span className="font-bold text-[#1C211E]">
                                          {formatCurrency(financials.totalRevenue, currency.symbol)}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="block text-[10px] text-[#859388]">
                                          Cost
                                        </span>
                                        <span className="font-medium text-[#8C6B3D]">
                                          {formatCurrency(financials.totalCost, currency.symbol)}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="block text-[10px] text-[#859388]">
                                          Profit
                                        </span>
                                        <span className="font-black text-[#2F6A3E]">
                                          {formatCurrency(financials.totalProfit, currency.symbol)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Informational Financial Note */}
        <div className="p-3 bg-[#F5F2EC] border-t border-[#E8E2D7] flex items-center justify-between text-[11px] text-[#6B786E]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#45634D]"></span>
            <span>
              <strong>Note on Profit:</strong> &ldquo;Profit before miscellaneous expenses&rdquo;
              is calculated as Total Revenue minus Direct Production Costs (using historical
              per-bottle snapshots). Miscellaneous general expenses are managed separately in the
              Cumulative Totals section.
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

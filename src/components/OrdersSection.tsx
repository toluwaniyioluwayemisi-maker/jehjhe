import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Calendar,
  FileText,
  Trash2,
  Edit2,
  Filter,
  CheckCircle,
  Package,
  Milk,
  Receipt,
  Download,
  Clock,
  ArrowUpDown,
  Tag,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Printer,
} from 'lucide-react';
import { OrderRecord, YoghurtProduct, CostItem, CurrencyConfig } from '../types';
import { calculateOrderFinancials, formatCurrency } from '../utils/storage';
import { OrderModal } from './OrderModal';

interface OrdersSectionProps {
  orders: OrderRecord[];
  products: YoghurtProduct[];
  costItems: CostItem[];
  currency: CurrencyConfig;
  onSaveOrder: (order: OrderRecord, deductStock: boolean) => void;
  onDeleteOrder: (orderId: string) => void;
  onOpenPriceModal?: () => void;
  onNavigateToDailySales?: () => void;
}

export const OrdersSection: React.FC<OrdersSectionProps> = ({
  orders = [],
  products = [],
  costItems = [],
  currency,
  onSaveOrder,
  onDeleteOrder,
  onOpenPriceModal,
  onNavigateToDailySales,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'this_week' | 'this_month'
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'revenue_desc' | 'profit_desc' | 'bottles_desc'>('date_desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<OrderRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCostItems = Array.isArray(costItems) ? costItems : [];

  // Generate next recommended invoice number
  const nextSuggestedRef = useMemo(() => {
    const year = new Date().getFullYear();
    const count = safeOrders.length + 1;
    const padded = String(count).padStart(3, '0');
    return `INV-${year}-${padded}`;
  }, [safeOrders]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const now = new Date();

    const result = safeOrders.filter((order) => {
      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesRef = order.referenceNumber.toLowerCase().includes(term);
        const matchesCustomer = (order.customerName || '').toLowerCase().includes(term);
        const matchesNotes = (order.notes || '').toLowerCase().includes(term);
        const matchesProduct = (order.items || []).some((item) =>
          item.productName.toLowerCase().includes(term)
        );
        if (!matchesRef && !matchesCustomer && !matchesNotes && !matchesProduct) {
          return false;
        }
      }

      // Product filter
      if (productFilter !== 'all') {
        const hasProduct = (order.items || []).some((it) => it.productId === productFilter);
        if (!hasProduct) return false;
      }

      // Date filter
      if (dateFilter === 'today') {
        if (order.date !== todayStr) return false;
      } else if (dateFilter === 'this_week') {
        const orderDate = new Date(order.date);
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7 || diffDays < 0) return false;
      } else if (dateFilter === 'this_month') {
        const currentMonth = todayStr.slice(0, 7);
        if (!order.date.startsWith(currentMonth)) return false;
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
      if (sortBy === 'revenue_desc') {
        const revA = calculateOrderFinancials(a, safeProducts, safeCostItems).totalRevenue;
        const revB = calculateOrderFinancials(b, safeProducts, safeCostItems).totalRevenue;
        return revB - revA;
      }
      if (sortBy === 'profit_desc') {
        const profA = calculateOrderFinancials(a, safeProducts, safeCostItems).totalProfit;
        const profB = calculateOrderFinancials(b, safeProducts, safeCostItems).totalProfit;
        return profB - profA;
      }
      if (sortBy === 'bottles_desc') {
        const bottlesA = (a.items || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0);
        const bottlesB = (b.items || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0);
        return bottlesB - bottlesA;
      }
      return 0;
    });
  }, [safeOrders, searchTerm, productFilter, dateFilter, sortBy, safeProducts, safeCostItems]);

  // Aggregate totals for selection
  const selectionFinancials = useMemo(() => {
    let totalBottles = 0;
    let totalRevenue = 0;
    let totalCost = 0;
    let hasMissingPrices = false;

    filteredOrders.forEach((order) => {
      const fin = calculateOrderFinancials(order, products, costItems);
      totalBottles += fin.totalQuantity;
      totalRevenue += fin.totalRevenue;
      totalCost += fin.totalCost;
      if (fin.hasMissingSellingPrice || fin.hasMissingCost) {
        hasMissingPrices = true;
      }
    });

    const totalProfit = totalRevenue - totalCost;
    const marginPercent = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalBottles,
      totalRevenue,
      totalCost,
      totalProfit,
      marginPercent,
      hasMissingPrices,
    };
  }, [filteredOrders, products, costItems]);

  return (
    <div id="orders-section-container" className="space-y-4">
      {/* Top Banner & Action */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DDD6CA] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#EAEFEA] text-[#45634D]">
                <Receipt className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#1C211E] font-display">
                Orders, Invoices & Profit Records
              </h2>
            </div>
            <p className="text-xs text-[#697A6F] mt-0.5">
              Track customer orders, automatic revenue calculations, production costs, and order profits
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {onNavigateToDailySales && (
              <button
                type="button"
                id="orders-jump-daily-sales-btn"
                onClick={onNavigateToDailySales}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EFE9DF] text-[#243328] border border-[#DDD6CA] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="View Daily Sales Tracker and day-by-day sales summary"
              >
                <Calendar className="w-3.5 h-3.5 text-[#45634D]" />
                <span>Daily Sales Tracker</span>
              </button>
            )}
            {onOpenPriceModal && (
              <button
                type="button"
                id="orders-edit-selling-prices-btn"
                onClick={onOpenPriceModal}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EFE9DF] text-[#243328] border border-[#DDD6CA] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Change or update standard bottle selling prices"
              >
                <Tag className="w-3.5 h-3.5 text-[#45634D]" />
                <span>Selling Prices</span>
              </button>
            )}
            <button
              id="record-new-order-btn"
              onClick={() => {
                setEditingOrder(null);
                setIsModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#45634D] hover:bg-[#344E3B] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Record Order / Invoice
            </button>
          </div>
        </div>

        {/* 4 Core Financial Summary Cards */}
        <div className="mt-4 pt-4 border-t border-[#F0EBE1] grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Total Orders */}
          <div className="p-3 bg-[#FAF8F4] border border-[#E8E3D8] rounded-xl">
            <span className="text-[10px] font-bold text-[#697A6F] uppercase tracking-wider block">
              Orders Recorded
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-[#1C211E]">{filteredOrders.length}</span>
              <span className="text-xs text-[#697A6F]">({selectionFinancials.totalBottles} bottles)</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="p-3 bg-[#FAF8F4] border border-[#E8E3D8] rounded-xl">
            <span className="text-[10px] font-bold text-[#697A6F] uppercase tracking-wider block">
              Total Revenue
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-[#1C211E]">
                {formatCurrency(selectionFinancials.totalRevenue, currency.symbol)}
              </span>
            </div>
          </div>

          {/* Total Production Cost */}
          <div className="p-3 bg-[#FAF8F4] border border-[#E8E3D8] rounded-xl">
            <span className="text-[10px] font-bold text-[#697A6F] uppercase tracking-wider block">
              Production Cost
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-[#55635B]">
                {formatCurrency(selectionFinancials.totalCost, currency.symbol)}
              </span>
            </div>
          </div>

          {/* Total Net Profit */}
          <div className="p-3 bg-[#EAEFEA] border border-[#C2D8C7] rounded-xl">
            <span className="text-[10px] font-bold text-[#2A4432] uppercase tracking-wider block">
              Net Profit ({selectionFinancials.marginPercent.toFixed(1)}%)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className={`text-xl font-extrabold ${
                  selectionFinancials.totalProfit >= 0 ? 'text-[#24422C]' : 'text-rose-700'
                }`}
              >
                {selectionFinancials.totalProfit >= 0 ? '+' : ''}
                {formatCurrency(selectionFinancials.totalProfit, currency.symbol)}
              </span>
            </div>
          </div>
        </div>

        {selectionFinancials.hasMissingPrices && (
          <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-1.5 text-[11px] text-amber-800">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
            <span>
              Some historical orders have unconfigured selling prices or cost items. Their calculations reflect configured items only.
            </span>
          </div>
        )}
      </div>

      {/* Filter, Search, and Sort Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#DDD6CA] shadow-2xs space-y-2.5">
        <div className="flex flex-col md:flex-row gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C9C92] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-orders-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice #, customer name, notes, products..."
              className="w-full pl-9 pr-3 py-2 bg-[#F9F7F2] border border-[#D9D3C7] rounded-xl text-xs text-[#1C211E] focus:outline-none focus:ring-2 focus:ring-[#45634D] font-medium"
            />
          </div>

          {/* Product Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <select
              id="filter-order-product-select"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="bg-[#F9F7F2] border border-[#D9D3C7] rounded-xl px-2.5 py-2 text-xs text-[#1C211E] font-medium focus:outline-none focus:ring-2 focus:ring-[#45634D] cursor-pointer"
            >
              <option value="all">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Date Filter */}
            <select
              id="filter-order-date-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[#F9F7F2] border border-[#D9D3C7] rounded-xl px-2.5 py-2 text-xs text-[#1C211E] font-medium focus:outline-none focus:ring-2 focus:ring-[#45634D] cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this_week">Past 7 Days</option>
              <option value="this_month">This Month</option>
            </select>

            {/* Sort Options */}
            <select
              id="sort-orders-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#F9F7F2] border border-[#D9D3C7] rounded-xl px-2.5 py-2 text-xs text-[#1C211E] font-medium focus:outline-none focus:ring-2 focus:ring-[#45634D] cursor-pointer"
            >
              <option value="date_desc">Newest Date</option>
              <option value="date_asc">Oldest Date</option>
              <option value="revenue_desc">Highest Revenue</option>
              <option value="profit_desc">Highest Profit</option>
              <option value="bottles_desc">Most Bottles</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-[11px] text-[#697A6F] px-1">
          <span>
            Showing <strong className="text-[#1C211E]">{filteredOrders.length}</strong> order{filteredOrders.length === 1 ? '' : 's'}
          </span>
          <span>
            Total Selected Revenue:{' '}
            <strong className="text-[#1C211E]">
              {formatCurrency(selectionFinancials.totalRevenue, currency.symbol)}
            </strong>
          </span>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-[#D9D3C7]">
            <Receipt className="w-10 h-10 text-[#A6B8AC] mx-auto mb-2" />
            <h3 className="font-bold text-sm text-[#1C211E]">No orders found</h3>
            <p className="text-xs text-[#697A6F] mt-1 max-w-sm mx-auto">
              {searchTerm || productFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search query or filters above.'
                : 'Click "Record Order / Invoice" to enter your first customer order.'}
            </p>
            {!searchTerm && productFilter === 'all' && (
              <button
                onClick={() => {
                  setEditingOrder(null);
                  setIsModalOpen(true);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-[#45634D] text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Record First Order
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((order) => {
            const fin = calculateOrderFinancials(order, products, costItems);

            return (
              <div
                key={order.id}
                id={`order-card-${order.id}`}
                className="bg-white rounded-2xl p-4 sm:p-4.5 border border-[#DDD6CA] shadow-2xs hover:border-[#B2C7B7] transition"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-[#F0EBE1]">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs sm:text-sm px-2.5 py-1 bg-[#1E2621] text-[#F9F7F2] rounded-lg tracking-wider">
                        {order.referenceNumber}
                      </span>
                      <span className="text-xs font-semibold text-[#55635B] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#738B7B]" />
                        {order.date}
                      </span>
                      {order.customerName && (
                        <span className="text-xs font-semibold text-[#2F4535] bg-[#E8EFEA] px-2 py-0.5 rounded-md border border-[#C8DACD]">
                          {order.customerName}
                        </span>
                      )}
                    </div>

                    {order.customerPhone && (
                      <p className="text-[11px] text-[#697A6F] mt-1">
                        Contact: {order.customerPhone}
                      </p>
                    )}
                  </div>

                  {/* Right Header: Financial Highlights & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
                    <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1 rounded-xl border border-[#E2DDD3]">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-[#697A6F]">Profit</div>
                        <div
                          className={`text-xs sm:text-sm font-extrabold ${
                            fin.totalProfit >= 0 ? 'text-[#2A4432]' : 'text-rose-700'
                          }`}
                        >
                          {fin.totalProfit >= 0 ? '+' : ''}
                          {formatCurrency(fin.totalProfit, currency.symbol)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        id={`view-order-${order.id}-btn`}
                        onClick={() => setSelectedReceipt(order)}
                        className="p-1.5 rounded-lg text-[#55635B] hover:text-[#1C211E] hover:bg-[#F3EFE6] transition cursor-pointer"
                        title="View Financial Breakdown"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        id={`edit-order-${order.id}-btn`}
                        onClick={() => {
                          setEditingOrder(order);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-[#55635B] hover:text-[#1C211E] hover:bg-[#F3EFE6] transition cursor-pointer"
                        title="Edit Order"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        id={`delete-order-${order.id}-btn`}
                        onClick={() => setDeleteConfirmId(order.id)}
                        className="p-1.5 rounded-lg text-[#9B1C1C] hover:bg-[#FDE8E8] transition cursor-pointer"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items and Financials Grid */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#697A6F] uppercase tracking-wider mb-1.5">
                    <span>Order Items & Calculations:</span>
                    <span>Total: {fin.totalQuantity} bottles</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {fin.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EBE5DB] text-xs space-y-1.5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-[#1C211E] leading-tight">{item.productName}</p>
                            <p className="text-[10px] text-[#697A6F]">
                              {item.size} • {item.quantity} bottle{item.quantity === 1 ? '' : 's'}
                            </p>
                          </div>
                          <span className="font-bold text-xs px-1.5 py-0.5 bg-white text-[#1C211E] rounded border border-[#DDD6CA]">
                            ×{item.quantity}
                          </span>
                        </div>

                        <div className="pt-1.5 border-t border-[#EAE4D8] space-y-0.5 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[#697A6F]">Revenue:</span>
                            <span className="font-bold text-[#1C211E]">
                              {formatCurrency(item.revenue, currency.symbol)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#697A6F]">Cost:</span>
                            <span className="font-medium text-[#55635B]">
                              {formatCurrency(item.cost, currency.symbol)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-0.5 border-t border-dashed border-[#EAE4D8]">
                            <span className="text-[#45634D] font-bold">Profit:</span>
                            <span
                              className={`font-extrabold ${
                                item.profit >= 0 ? 'text-[#2A4432]' : 'text-rose-700'
                              }`}
                            >
                              {item.profit >= 0 ? '+' : ''}
                              {formatCurrency(item.profit, currency.symbol)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall Order Summary Bar */}
                <div className="mt-3 pt-2.5 border-t border-[#F0EBE1] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[#697A6F] text-[11px]">Total Revenue: </span>
                      <strong className="text-[#1C211E]">
                        {formatCurrency(fin.totalRevenue, currency.symbol)}
                      </strong>
                    </div>
                    <span>•</span>
                    <div>
                      <span className="text-[#697A6F] text-[11px]">Total Cost: </span>
                      <span className="text-[#55635B] font-semibold">
                        {formatCurrency(fin.totalCost, currency.symbol)}
                      </span>
                    </div>
                    <span>•</span>
                    <div>
                      <span className="text-[#697A6F] text-[11px]">Margin: </span>
                      <strong className="text-[#2A4432]">{fin.marginPercent.toFixed(1)}%</strong>
                    </div>
                  </div>

                  {fin.missingItemsNotice && (
                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      {fin.missingItemsNotice}
                    </span>
                  )}
                </div>

                {order.notes && (
                  <div className="mt-2 text-[11px] text-[#697A6F] bg-[#FAF8F5] p-2 rounded-lg border border-[#EFECE6]">
                    <strong>Notes:</strong> {order.notes}
                  </div>
                )}

                {/* Delete Confirmation Banner */}
                {deleteConfirmId === order.id && (
                  <div className="mt-3 p-3 bg-[#FDE8E8] border border-[#F8B4B4] rounded-xl flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#9B1C1C] font-semibold">
                      Delete order reference <strong>{order.referenceNumber}</strong>?
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onDeleteOrder(order.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-2.5 py-1 bg-[#9B1C1C] text-white font-bold rounded-lg hover:bg-[#771D1D] transition cursor-pointer"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 bg-white text-[#55635B] font-medium rounded-lg border border-[#D9D3C7] hover:bg-[#F3EFE6] transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Order Entry Modal */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOrder(null);
        }}
        onSaveOrder={onSaveOrder}
        editingOrder={editingOrder}
        products={products}
        costItems={costItems}
        currency={currency}
        nextSuggestedRef={nextSuggestedRef}
      />

      {/* Receipt / Invoice & Financial Breakdown Viewer Modal */}
      {selectedReceipt && (() => {
        const fin = calculateOrderFinancials(selectedReceipt, products, costItems);

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-[#FBF9F4] text-[#1C211E] rounded-2xl w-full max-w-lg shadow-2xl border border-[#D9D3C7] overflow-hidden my-auto max-h-[90vh] flex flex-col">
              {/* Receipt Header */}
              <div className="bg-[#1E2621] text-[#F9F7F2] p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#A6C5AD] tracking-wider block">
                    Butch Master Order & Financial Receipt
                  </span>
                  <h3 className="text-lg font-bold font-display">{selectedReceipt.referenceNumber}</h3>
                </div>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1 rounded-lg text-[#A1B0A6] hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Receipt Content */}
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-[#DDD6CA]">
                  <div>
                    <span className="text-[#697A6F] block text-[10px] uppercase font-bold">Order Date</span>
                    <strong className="text-[#1C211E] text-sm">{selectedReceipt.date}</strong>
                  </div>
                  <div>
                    <span className="text-[#697A6F] block text-[10px] uppercase font-bold">Customer</span>
                    <strong className="text-[#1C211E] text-sm">
                      {selectedReceipt.customerName || 'Standard Customer'}
                    </strong>
                  </div>
                  {selectedReceipt.customerPhone && (
                    <div>
                      <span className="text-[#697A6F] block text-[10px] uppercase font-bold">Contact</span>
                      <span className="font-semibold text-[#1C211E]">{selectedReceipt.customerPhone}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[#697A6F] block text-[10px] uppercase font-bold">Total Volume</span>
                    <span className="font-bold text-[#45634D] text-sm">
                      {fin.totalQuantity} bottles
                    </span>
                  </div>
                </div>

                {/* Overall Financial Cards */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 bg-white border border-[#DDD6CA] rounded-xl">
                    <span className="text-[10px] text-[#697A6F] uppercase font-bold block">Revenue</span>
                    <span className="text-sm sm:text-base font-extrabold text-[#1C211E]">
                      {formatCurrency(fin.totalRevenue, currency.symbol)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#DDD6CA] rounded-xl">
                    <span className="text-[10px] text-[#697A6F] uppercase font-bold block">Production Cost</span>
                    <span className="text-sm sm:text-base font-extrabold text-[#55635B]">
                      {formatCurrency(fin.totalCost, currency.symbol)}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#E8EFE9] border border-[#B8D1BF] rounded-xl">
                    <span className="text-[10px] text-[#2A4432] uppercase font-bold block">Order Profit</span>
                    <span
                      className={`text-sm sm:text-base font-extrabold ${
                        fin.totalProfit >= 0 ? 'text-[#24422C]' : 'text-rose-700'
                      }`}
                    >
                      {fin.totalProfit >= 0 ? '+' : ''}
                      {formatCurrency(fin.totalProfit, currency.symbol)}
                    </span>
                  </div>
                </div>

                {/* Itemized Financial Breakdown Table */}
                <div>
                  <h4 className="text-xs font-bold text-[#1C211E] uppercase tracking-wider mb-2">
                    Itemized Product Breakdown
                  </h4>
                  <div className="space-y-2">
                    {fin.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-xl border border-[#E8E3D8] text-xs space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-[#1C211E] text-sm">{item.productName}</span>
                            <span className="text-[11px] text-[#697A6F] block">
                              {item.size} • {item.quantity} bottle{item.quantity === 1 ? '' : 's'}
                            </span>
                          </div>
                          <span className="font-bold px-2 py-0.5 bg-[#F0ECE4] text-[#334237] rounded-md">
                            {item.quantity} btls
                          </span>
                        </div>

                        {/* Calculation Line */}
                        <div className="pt-2 border-t border-[#F2EDE4] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <div>
                            <span className="text-[#697A6F] block text-[10px]">Selling Price:</span>
                            <span className="font-bold text-[#1C211E]">
                              {formatCurrency(item.unitPrice, currency.symbol)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#697A6F] block text-[10px]">Unit Cost:</span>
                            <span className="font-medium text-[#55635B]">
                              {formatCurrency(item.unitCost, currency.symbol)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#697A6F] block text-[10px]">Item Revenue:</span>
                            <span className="font-bold text-[#1C211E]">
                              {formatCurrency(item.revenue, currency.symbol)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#45634D] block text-[10px] font-bold">Item Profit:</span>
                            <span
                              className={`font-extrabold ${
                                item.profit >= 0 ? 'text-[#2A4432]' : 'text-rose-700'
                              }`}
                            >
                              {item.profit >= 0 ? '+' : ''}
                              {formatCurrency(item.profit, currency.symbol)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {fin.missingItemsNotice && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>{fin.missingItemsNotice}</span>
                  </div>
                )}

                {selectedReceipt.notes && (
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E3D8] text-xs">
                    <span className="font-bold text-[#55635B] block mb-0.5">Identification Notes:</span>
                    <p className="text-[#1C211E]">{selectedReceipt.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#E8E3D8]">
                  <div className="text-[11px] text-[#697A6F]">
                    Profit Margin: <strong className="text-[#2A4432]">{fin.marginPercent.toFixed(1)}%</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedReceipt(null)}
                      className="px-4 py-2 bg-[#45634D] text-white font-bold text-xs rounded-xl hover:bg-[#344E3B] transition cursor-pointer"
                    >
                      Close Receipt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

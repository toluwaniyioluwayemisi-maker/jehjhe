import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Hash,
  User,
  FileText,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Tag,
  DollarSign,
} from 'lucide-react';
import { OrderRecord, OrderItem, YoghurtProduct, CostItem, CurrencyConfig } from '../types';
import { calculateProductCost, formatCurrency } from '../utils/storage';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveOrder: (order: OrderRecord, deductStock: boolean) => void;
  editingOrder?: OrderRecord | null;
  products: YoghurtProduct[];
  costItems: CostItem[];
  currency: CurrencyConfig;
  nextSuggestedRef?: string;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSaveOrder,
  editingOrder,
  products,
  costItems,
  currency,
  nextSuggestedRef = 'INV-2026-001',
}) => {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [deductStock, setDeductStock] = useState(true);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingOrder) {
        setReferenceNumber(editingOrder.referenceNumber);
        setOrderDate(editingOrder.date);
        setCustomerName(editingOrder.customerName || '');
        setCustomerPhone(editingOrder.customerPhone || '');
        setNotes(editingOrder.notes || '');
        setItems(
          editingOrder.items.map((it) => {
            const prod = products.find((p) => p.id === it.productId);
            const currentCost = calculateProductCost(it.productId, costItems);
            return {
              ...it,
              unitPrice:
                typeof it.unitPrice === 'number'
                  ? it.unitPrice
                  : prod?.sellingPrice ?? 0,
              unitCost:
                typeof it.unitCost === 'number' ? it.unitCost : currentCost,
            };
          })
        );
        setDeductStock(false); // Don't re-deduct on edit by default
      } else {
        setReferenceNumber(nextSuggestedRef);
        setOrderDate(new Date().toISOString().slice(0, 10));
        setCustomerName('');
        setCustomerPhone('');
        setNotes('');
        setDeductStock(true);
        // Initialize with default 0 quantities with current unit costs and selling prices
        setItems(
          products.map((p) => {
            const currentCost = calculateProductCost(p.id, costItems);
            const sellingPrice = typeof p.sellingPrice === 'number' ? p.sellingPrice : 0;
            return {
              productId: p.id,
              productName: p.name,
              productType: p.productType,
              size: p.size,
              quantity: 0,
              unitPrice: sellingPrice,
              unitCost: currentCost,
            };
          })
        );
      }
      setErrorMsg(null);
    }
  }, [isOpen, editingOrder, products, costItems, nextSuggestedRef]);

  if (!isOpen) return null;

  const handleQuantityChange = (productId: string, newQty: number) => {
    const qty = Math.max(0, Math.floor(newQty || 0));
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const handleUnitPriceChange = (productId: string, newPriceStr: string) => {
    const parsed = parseFloat(newPriceStr);
    const validPrice = !isNaN(parsed) && parsed >= 0 ? parsed : 0;
    setItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, unitPrice: validPrice } : item))
    );
  };

  // Live order calculations
  let totalBottles = 0;
  let totalRevenue = 0;
  let totalCost = 0;
  let hasMissingPrices = false;

  items.forEach((item) => {
    const qty = Number(item.quantity) || 0;
    const price = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
    const cost = typeof item.unitCost === 'number' ? item.unitCost : 0;

    totalBottles += qty;
    totalRevenue += qty * price;
    totalCost += qty * cost;

    if (qty > 0 && (price <= 0 || cost <= 0)) {
      hasMissingPrices = true;
    }
  });

  const totalProfit = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanRef = referenceNumber.trim();
    if (!cleanRef) {
      setErrorMsg('Please enter an order or invoice reference number.');
      return;
    }

    const validItems = items.filter((it) => Number(it.quantity) > 0);
    if (validItems.length === 0) {
      setErrorMsg('Please specify a quantity of at least 1 bottle for at least one yoghurt product.');
      return;
    }

    // Ensure unit price and unit cost snapshots are stored precisely on each item
    const finalizedItems: OrderItem[] = validItems.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      const snapshotCost =
        typeof it.unitCost === 'number' && it.unitCost > 0
          ? it.unitCost
          : calculateProductCost(it.productId, costItems);
      const snapshotPrice =
        typeof it.unitPrice === 'number' && it.unitPrice > 0
          ? it.unitPrice
          : prod?.sellingPrice ?? 0;

      return {
        ...it,
        unitPrice: snapshotPrice,
        unitCost: snapshotCost,
      };
    });

    const orderToSave: OrderRecord = {
      id: editingOrder ? editingOrder.id : `ord-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      referenceNumber: cleanRef,
      date: orderDate || new Date().toISOString().slice(0, 10),
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      notes: notes.trim() || undefined,
      items: finalizedItems,
      createdAt: editingOrder ? editingOrder.createdAt : new Date().toISOString(),
    };

    onSaveOrder(orderToSave, deductStock);
    onClose();
  };

  return (
    <div
      id="order-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="order-modal-card"
        className="bg-[#FBF9F4] text-[#1C211E] rounded-2xl w-full max-w-xl shadow-2xl border border-[#D9D3C7] overflow-hidden my-auto max-h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#1E2621] text-[#F9F7F2] px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-display">
              {editingOrder ? 'Edit Order / Invoice' : 'Record New Order / Invoice'}
            </h2>
            <p className="text-xs text-[#A1B0A6]">
              Enter order details, yoghurt quantities, and view live revenue & profit
            </p>
          </div>
          <button
            id="close-order-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A1B0A6] hover:text-white hover:bg-[#2B362F] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-[#FDE8E8] border border-[#F8B4B4] text-[#9B1C1C] rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Reference and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#354139] mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#45634D]" />
                Invoice / Order Ref *
              </label>
              <input
                id="order-ref-input"
                type="text"
                required
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. INV-2026-004"
                className="w-full bg-white text-[#1C211E] px-3 py-2 rounded-xl border border-[#D1CABF] focus:outline-none focus:ring-2 focus:ring-[#45634D] text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#354139] mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#45634D]" />
                Order Date *
              </label>
              <input
                id="order-date-input"
                type="date"
                required
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full bg-white text-[#1C211E] px-3 py-2 rounded-xl border border-[#D1CABF] focus:outline-none focus:ring-2 focus:ring-[#45634D] text-sm font-medium"
              />
            </div>
          </div>

          {/* Customer info (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#354139] mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#45634D]" />
                Customer / Outlet Name
              </label>
              <input
                id="order-customer-input"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Mama Titi Store or Walk-in"
                className="w-full bg-white text-[#1C211E] px-3 py-2 rounded-xl border border-[#D1CABF] focus:outline-none focus:ring-2 focus:ring-[#45634D] text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#354139] mb-1 text-[#354139]">
                Phone / Contact
              </label>
              <input
                id="order-phone-input"
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 0803-000-0000"
                className="w-full bg-white text-[#1C211E] px-3 py-2 rounded-xl border border-[#D1CABF] focus:outline-none focus:ring-2 focus:ring-[#45634D] text-sm font-medium"
              />
            </div>
          </div>

          {/* Yoghurt Products Ordered with Live Financials */}
          <div className="pt-2 border-t border-[#E8E3D8]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#1C211E] uppercase tracking-wider">
                Yoghurt Quantities & Financials
              </label>
              <span className="text-xs font-bold px-2 py-0.5 bg-[#E8EFE9] text-[#2C4834] rounded-md border border-[#C5D9CA]">
                Total: {totalBottles} bottle{totalBottles === 1 ? '' : 's'}
              </span>
            </div>

            <div className="space-y-2.5">
              {products.map((prod) => {
                const currentItem = items.find((i) => i.productId === prod.id);
                const currentQty = currentItem ? currentItem.quantity : 0;
                const unitPrice =
                  currentItem && typeof currentItem.unitPrice === 'number'
                    ? currentItem.unitPrice
                    : prod.sellingPrice ?? 0;
                const unitCost =
                  currentItem && typeof currentItem.unitCost === 'number'
                    ? currentItem.unitCost
                    : calculateProductCost(prod.id, costItems);

                const itemRevenue = currentQty * unitPrice;
                const itemCost = currentQty * unitCost;
                const itemProfit = itemRevenue - itemCost;

                return (
                  <div
                    key={prod.id}
                    className="p-3 rounded-xl bg-white border border-[#DDD6CA] shadow-2xs hover:border-[#45634D] transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-[#1C211E]">{prod.name}</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-[#F1EFEA] text-[#55635B] rounded border border-[#DDD6CA]">
                            {prod.size}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#697A6F] mt-0.5">
                          <span>Selling: <strong className="text-[#1C211E]">{formatCurrency(unitPrice, currency.symbol)}</strong></span>
                          <span>•</span>
                          <span>Cost: <strong className="text-[#1C211E]">{formatCurrency(unitCost, currency.symbol)}</strong></span>
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(prod.id, currentQty - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#EFECE6] hover:bg-[#DDD6CA] text-[#1C211E] font-bold text-sm transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentQty === 0 ? '' : currentQty}
                          onChange={(e) => handleQuantityChange(prod.id, parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="w-14 text-center bg-[#FAF8F5] border border-[#D1CABF] rounded-lg py-1 px-1 text-sm font-bold text-[#1C211E] focus:outline-none focus:ring-2 focus:ring-[#45634D]"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(prod.id, currentQty + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#45634D] hover:bg-[#344E3B] text-white font-bold text-sm transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Active item calculation preview if quantity > 0 */}
                    {currentQty > 0 && (
                      <div className="pt-2 border-t border-[#F2ECE1] flex items-center justify-between text-xs bg-[#FAF8F5] p-2 rounded-lg">
                        <div>
                          <span className="text-[#697A6F] text-[11px]">Revenue: </span>
                          <span className="font-bold text-[#1C211E]">{formatCurrency(itemRevenue, currency.symbol)}</span>
                          <span className="text-[#8C9C92] text-[10px] ml-1">({currentQty} × {formatCurrency(unitPrice, currency.symbol)})</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#697A6F] text-[11px]">Profit: </span>
                          <span className={`font-bold ${itemProfit >= 0 ? 'text-[#2F4535]' : 'text-rose-700'}`}>
                            {itemProfit >= 0 ? '+' : ''}{formatCurrency(itemProfit, currency.symbol)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Financial Summary Box */}
          {totalBottles > 0 && (
            <div className="p-3.5 rounded-xl bg-[#242D27] text-white border border-[#344037] shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-[#A8C7AF] uppercase tracking-wider font-bold">
                <span>Order Financial Summary</span>
                <span>{totalBottles} bottles</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#344037] text-center">
                <div>
                  <span className="text-[10px] text-[#A1B0A6] uppercase block">Revenue</span>
                  <span className="font-extrabold text-sm sm:text-base text-white">
                    {formatCurrency(totalRevenue, currency.symbol)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A1B0A6] uppercase block">Production Cost</span>
                  <span className="font-extrabold text-sm sm:text-base text-[#CBD8CE]">
                    {formatCurrency(totalCost, currency.symbol)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#A1B0A6] uppercase block">Order Profit</span>
                  <span className={`font-extrabold text-sm sm:text-base ${totalProfit >= 0 ? 'text-[#8CE29C]' : 'text-rose-400'}`}>
                    {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit, currency.symbol)}
                  </span>
                </div>
              </div>

              {hasMissingPrices && (
                <p className="text-[11px] text-amber-300 font-medium pt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  Some items lack configured selling prices or costs.
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#354139] mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#45634D]" />
              Order Notes / Identification Details (Optional)
            </label>
            <input
              id="order-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid in cash, chilled delivery required"
              className="w-full bg-white text-[#1C211E] px-3 py-2 rounded-xl border border-[#D1CABF] focus:outline-none focus:ring-2 focus:ring-[#45634D] text-xs font-medium"
            />
          </div>

          {/* Deduct Stock Checkbox */}
          {!editingOrder && (
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F0F5F1] border border-[#CDE1D2] text-[#2D4534] text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={deductStock}
                onChange={(e) => setDeductStock(e.target.checked)}
                className="w-4 h-4 rounded text-[#45634D] focus:ring-[#45634D] border-[#B2CBB7] accent-[#45634D]"
              />
              <span>Automatically deduct ordered bottles from Current Stock</span>
            </label>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E3D8]">
            <button
              id="cancel-order-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#EDE9E1] hover:bg-[#DDD6CA] text-[#424F46] font-semibold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-order-submit-btn"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#45634D] hover:bg-[#344E3B] text-white font-bold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {editingOrder ? 'Update Order Record' : 'Save Order Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

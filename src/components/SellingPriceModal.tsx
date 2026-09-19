import React, { useState, useEffect } from 'react';
import {
  X,
  Tag,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Milk,
  Sparkles,
  Info,
  DollarSign,
  Zap,
} from 'lucide-react';
import { YoghurtProduct, CostItem, CurrencyConfig } from '../types';
import { formatCurrency, calculateProductCost } from '../utils/storage';

interface SellingPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: YoghurtProduct[];
  costItems: CostItem[];
  currency: CurrencyConfig;
  onUpdatePrices: (updatedProducts: YoghurtProduct[]) => void;
  selectedProductId?: string;
}

export const SellingPriceModal: React.FC<SellingPriceModalProps> = ({
  isOpen,
  onClose,
  products,
  costItems,
  currency,
  onUpdatePrices,
  selectedProductId,
}) => {
  // Local state for prices of each product
  const [priceMap, setPriceMap] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initialMap: Record<string, string> = {};
      products.forEach((p) => {
        initialMap[p.id] =
          typeof p.sellingPrice === 'number' && p.sellingPrice > 0
            ? String(p.sellingPrice)
            : '';
      });
      setPriceMap(initialMap);
      setSuccessMsg(null);
    }
  }, [isOpen, products]);

  if (!isOpen) return null;

  const handlePriceChange = (productId: string, value: string) => {
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPriceMap((prev) => ({
        ...prev,
        [productId]: value,
      }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated = products.map((prod) => {
      const rawVal = priceMap[prod.id];
      const parsed = parseFloat(rawVal);
      const newPrice = !isNaN(parsed) && parsed >= 0 ? parsed : 0;
      return {
        ...prod,
        sellingPrice: newPrice,
      };
    });

    onUpdatePrices(updated);
    setSuccessMsg('Selling prices saved successfully!');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div
      id="selling-price-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="selling-price-modal-card"
        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-[#E2E8F0] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A] font-display leading-tight">
                Product Selling Prices
              </h2>
              <p className="text-xs text-[#64748B]">
                Configure standard selling prices per bottle for accurate revenue & profit calculations
              </p>
            </div>
          </div>
          <button
            id="close-selling-price-modal-btn"
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl text-xs text-[#64748B] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#059669] mt-0.5 flex-shrink-0" />
            <span>
              Selling prices are used to automatically calculate item revenue and order profit. When orders are recorded, prices are locked to preserve historical record integrity.
            </span>
          </div>

          {successMsg && (
            <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl flex items-center gap-2 text-xs font-bold text-[#065F46]">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-3.5">
            {products.map((prod) => {
              const unitCost = calculateProductCost(prod.id, costItems);
              const isGreek = prod.productType.toLowerCase().includes('greek');
              const isElectricity = (prod.category || 'yoghurt') === 'electricity';
              const isPastries = (prod.category || 'yoghurt') === 'pastries';
              const rawInput = priceMap[prod.id] || '';
              const enteredPrice = parseFloat(rawInput) || 0;
              const hasInput = rawInput.trim() !== '';
              const unitProfit = enteredPrice - unitCost;
              const profitMargin = enteredPrice > 0 ? (unitProfit / enteredPrice) * 100 : 0;
              const isBelowCost = hasInput && enteredPrice > 0 && enteredPrice < unitCost;

              const isHighlighted = selectedProductId === prod.id;

              return (
                <div
                  key={prod.id}
                  id={`price-config-card-${prod.id}`}
                  className={`border rounded-xl p-3.5 sm:p-4 bg-white shadow-xs transition ${
                    isHighlighted
                      ? 'border-[#059669] ring-2 ring-[#059669]/20 bg-[#F0FDF4]'
                      : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                          isElectricity
                            ? 'bg-amber-100 text-amber-700'
                            : isGreek
                            ? 'bg-[#ECFDF5] text-[#059669]'
                            : isPastries
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isElectricity ? <Zap className="w-3.5 h-3.5 fill-amber-700" /> : isGreek ? <Sparkles className="w-3.5 h-3.5" /> : <Milk className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-xs sm:text-sm text-[#0F172A]">
                            {prod.name}
                          </h3>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            isElectricity
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isPastries
                              ? 'bg-orange-100 text-orange-900'
                              : 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                          }`}>
                            {isElectricity ? '⚡ Electricity' : isPastries ? 'Pastries' : 'Yoghurt'}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#64748B]">
                          Unit / Size: <strong className="text-[#0F172A]">{prod.size}</strong>
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569]">
                      Cost: {formatCurrency(unitCost, currency.symbol)}
                    </span>
                  </div>

                  {/* Input and Live Margin Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-2 border-t border-[#F1F5F9]">
                    <div>
                      <label
                        htmlFor={`input-selling-price-${prod.id}`}
                        className="block text-[11px] font-bold text-[#475569] mb-1"
                      >
                        Selling Price per Unit ({currency.symbol})
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">
                          {currency.symbol}
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          id={`input-selling-price-${prod.id}`}
                          placeholder="e.g. 700.00"
                          value={priceMap[prod.id] || ''}
                          onChange={(e) => handlePriceChange(prod.id, e.target.value)}
                          className={`w-full pl-8 pr-3 py-2 text-xs sm:text-sm font-bold bg-[#F8FAFC] rounded-xl border focus:outline-none focus:ring-2 transition ${
                            isBelowCost
                              ? 'border-amber-400 focus:ring-amber-300 text-amber-900'
                              : 'border-[#CBD5E1] focus:ring-[#059669]/30 focus:border-[#059669] text-[#0F172A]'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Live Profit Preview Box */}
                    <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                          Unit Profit
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-extrabold ${
                            !hasInput || enteredPrice === 0
                              ? 'text-[#94A3B8]'
                              : unitProfit >= 0
                              ? 'text-[#059669]'
                              : 'text-rose-600'
                          }`}
                        >
                          {!hasInput || enteredPrice === 0
                            ? 'Not configured'
                            : formatCurrency(unitProfit, currency.symbol)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                          Margin
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-extrabold ${
                            !hasInput || enteredPrice === 0
                              ? 'text-[#94A3B8]'
                              : profitMargin >= 0
                              ? 'text-[#059669]'
                              : 'text-rose-600'
                          }`}
                        >
                          {!hasInput || enteredPrice === 0
                            ? '—'
                            : `${profitMargin.toFixed(1)}%`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isBelowCost && (
                    <p className="text-[11px] text-amber-700 font-medium mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      Selling price is lower than the unit production cost ({formatCurrency(unitCost, currency.symbol)}).
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
            <button
              type="button"
              id="cancel-selling-price-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-selling-price-btn"
              className="px-5 py-2 text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Selling Prices</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

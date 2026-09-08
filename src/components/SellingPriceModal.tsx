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
        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-xl border border-[#DDD6CA] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#EDE8DE] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAEFEA] text-[#45634D] flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1C211E] font-display leading-tight">
                Product Selling Prices
              </h2>
              <p className="text-xs text-[#697A6F]">
                Configure standard selling prices per bottle for accurate revenue & profit calculations
              </p>
            </div>
          </div>
          <button
            id="close-selling-price-modal-btn"
            onClick={onClose}
            className="p-1.5 text-[#697A6F] hover:text-[#1C211E] hover:bg-[#EAE4D8] rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="bg-[#FAF8F4] border border-[#E2DDD3] p-3 rounded-xl text-xs text-[#5D6D62] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#45634D] mt-0.5 flex-shrink-0" />
            <span>
              Selling prices are used to automatically calculate item revenue and order profit. When orders are recorded, prices are locked to preserve historical record integrity.
            </span>
          </div>

          {successMsg && (
            <div className="p-3 bg-[#E8EFE9] border border-[#B8D1BF] rounded-xl flex items-center gap-2 text-xs font-bold text-[#2A4432]">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-3.5">
            {products.map((prod) => {
              const unitCost = calculateProductCost(prod.id, costItems);
              const isGreek = prod.productType.toLowerCase().includes('greek');
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
                  className={`border rounded-xl p-3.5 sm:p-4 bg-white shadow-2xs transition ${
                    isHighlighted
                      ? 'border-[#45634D] ring-2 ring-[#45634D]/25 bg-[#FAFBF9]'
                      : 'border-[#DDD6CA] hover:border-[#B8CBBF]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                          isGreek
                            ? 'bg-[#EEF4EF] text-[#45634D]'
                            : 'bg-[#F0ECE4] text-[#3D4B42]'
                        }`}
                      >
                        {isGreek ? <Sparkles className="w-3.5 h-3.5" /> : <Milk className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-[#1C211E]">
                          {prod.name}
                        </h3>
                        <span className="text-[11px] text-[#697A6F]">
                          Size: <strong className="text-[#1C211E]">{prod.size}</strong>
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#F0EBE1] text-[#55635B]">
                      Production Cost: {formatCurrency(unitCost, currency.symbol)}
                    </span>
                  </div>

                  {/* Input and Live Margin Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-2 border-t border-[#F2EFE8]">
                    <div>
                      <label
                        htmlFor={`input-selling-price-${prod.id}`}
                        className="block text-[11px] font-bold text-[#55635B] mb-1"
                      >
                        Selling Price per Bottle ({currency.symbol})
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#697A6F]">
                          {currency.symbol}
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          id={`input-selling-price-${prod.id}`}
                          placeholder="e.g. 700.00"
                          value={priceMap[prod.id] || ''}
                          onChange={(e) => handlePriceChange(prod.id, e.target.value)}
                          className={`w-full pl-8 pr-3 py-2 text-xs sm:text-sm font-bold bg-[#FAF8F5] rounded-xl border focus:outline-none focus:ring-2 transition ${
                            isBelowCost
                              ? 'border-amber-400 focus:ring-amber-300 text-amber-900'
                              : 'border-[#D5CEC2] focus:ring-[#45634D]/30 focus:border-[#45634D] text-[#1C211E]'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Live Profit Preview Box */}
                    <div className="p-2.5 rounded-xl bg-[#F7F5F0] border border-[#E5E0D6] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#697A6F] block">
                          Unit Profit
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-extrabold ${
                            !hasInput || enteredPrice === 0
                              ? 'text-[#8C9C92]'
                              : unitProfit >= 0
                              ? 'text-[#2A4432]'
                              : 'text-rose-700'
                          }`}
                        >
                          {!hasInput || enteredPrice === 0
                            ? 'Not configured'
                            : formatCurrency(unitProfit, currency.symbol)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#697A6F] block">
                          Margin
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-extrabold ${
                            !hasInput || enteredPrice === 0
                              ? 'text-[#8C9C92]'
                              : profitMargin >= 0
                              ? 'text-[#2A4432]'
                              : 'text-rose-700'
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
          <div className="pt-3 border-t border-[#EDE8DE] flex items-center justify-end gap-2.5">
            <button
              type="button"
              id="cancel-selling-price-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#55635B] hover:text-[#1C211E] hover:bg-[#F2ECE1] rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-selling-price-btn"
              className="px-5 py-2 text-xs font-bold text-white bg-[#45634D] hover:bg-[#38533F] rounded-xl shadow-2xs transition cursor-pointer flex items-center gap-1.5"
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

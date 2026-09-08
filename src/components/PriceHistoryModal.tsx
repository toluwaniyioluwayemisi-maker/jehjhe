import React from 'react';
import { CostItem, CurrencyConfig, YoghurtProduct } from '../types';
import { formatCurrency } from '../utils/storage';
import { X, History, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

interface PriceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  costItem: CostItem | null;
  product: YoghurtProduct;
  currency: CurrencyConfig;
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  isOpen,
  onClose,
  costItem,
  product,
  currency,
}) => {
  if (!isOpen || !costItem) return null;

  const history = costItem.priceHistory && costItem.priceHistory.length > 0
    ? costItem.priceHistory
    : [
        {
          price: costItem.unitPricePerBottle,
          effectiveDate: costItem.lastUpdated,
          reason: 'Current active unit price',
        },
      ];

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1C211E]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-[#E2DDD3] relative animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EDE8DE]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EEF4EF] text-[#45634D] flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C241E] font-display">
                Price History Log
              </h3>
              <p className="text-xs text-[#637268]">
                {costItem.name} — {product.size} bottle
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#7C8B81] hover:text-[#2A342D] hover:bg-[#F2EEE4] rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Price Highlight */}
        <div className="my-4 p-3.5 bg-[#EEF4EF] border border-[#CAD8CD] rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#45634D]">
              Current Active Unit Price
            </div>
            <div className="text-lg font-extrabold text-[#1C241E] font-display">
              {formatCurrency(costItem.unitPricePerBottle, currency.symbol)}
              <span className="text-xs font-normal text-[#5B6C60] ml-1">/ bottle</span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-[#45634D] text-white text-[11px] font-bold rounded-md">
            Active
          </span>
        </div>

        {/* History Timeline */}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          <div className="text-xs font-bold uppercase tracking-wider text-[#69796F]">
            Recorded Price Adjustments
          </div>

          {history.map((record, index) => (
            <div
              key={index}
              className="p-3 bg-[#FAF8F4] border border-[#E8E3D8] rounded-xl text-xs flex items-start justify-between gap-3"
            >
              <div>
                <div className="font-bold text-[#2A332D] text-sm font-display">
                  {formatCurrency(record.price, currency.symbol)} / bottle
                </div>
                {record.reason && (
                  <div className="text-[#607065] text-xs mt-0.5">
                    {record.reason}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-[11px] text-[#86968B] mt-1">
                  <Calendar className="w-3 h-3 text-[#86968B]" />
                  <span>{formatDate(record.effectiveDate)}</span>
                </div>
              </div>

              {index === 0 && (
                <span className="text-[10px] font-semibold text-[#45634D] bg-[#E2EDE5] px-2 py-0.5 rounded-full flex-shrink-0">
                  Latest
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Historical Price Notice */}
        <div className="mt-4 pt-3 border-t border-[#EDE8DE] text-[11px] text-[#69796F] leading-relaxed">
          <strong>Historical Integrity:</strong> Whenever unit prices are edited, previous rates are preserved in this log so future order tracking can accurately calculate past batch margins.
        </div>

        {/* Close Button */}
        <div className="mt-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#45634D] hover:bg-[#3B5542] text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close Price History
          </button>
        </div>
      </div>
    </div>
  );
};

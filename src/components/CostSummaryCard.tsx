import React from 'react';
import { YoghurtProduct, CostItem, CurrencyConfig } from '../types';
import { calculateProductCost, formatCurrency } from '../utils/storage';
import { Plus, HelpCircle, Layers, Tag, TrendingUp, AlertCircle, Edit3 } from 'lucide-react';

interface CostSummaryCardProps {
  product: YoghurtProduct;
  costItems: CostItem[];
  currency: CurrencyConfig;
  onOpenAddModal: () => void;
  onOpenPriceModal?: () => void;
}

export const CostSummaryCard: React.FC<CostSummaryCardProps> = ({
  product,
  costItems = [],
  currency,
  onOpenAddModal,
  onOpenPriceModal,
}) => {
  if (!product) {
    return (
      <div className="bg-[#242D27] text-[#F9F7F2] rounded-2xl p-6 shadow-sm border border-[#344037] text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#344037] text-[#A8C7AF] flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">No Bottle Size Selected</h3>
          <p className="text-xs text-[#CBD8CE] max-w-sm mx-auto mt-1">
            Configure or select a yoghurt product / bottle size to calculate production costs, selling prices, and profit margins.
          </p>
        </div>
      </div>
    );
  }

  const safeCostItems = Array.isArray(costItems) ? costItems : [];
  const productCostItems = safeCostItems.filter((i) => i.productId === product.id);
  const totalCost = calculateProductCost(product.id, safeCostItems);
  const sellingPrice = typeof product.sellingPrice === 'number' ? product.sellingPrice : 0;
  const hasSellingPrice = sellingPrice > 0;
  const unitProfit = sellingPrice - totalCost;
  const marginPercent = hasSellingPrice ? (unitProfit / sellingPrice) * 100 : 0;

  return (
    <div className="bg-[#242D27] text-[#F9F7F2] rounded-2xl p-5 sm:p-6 shadow-sm border border-[#344037] relative overflow-hidden">
      {/* Decorative soft tint */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-[#45634D]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Product & Tag row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase bg-[#45634D] text-[#F9F7F2] border border-[#5C7E65]">
              {product.size}
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight">
              {product.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#A8B8AC] bg-[#1B231E] px-2.5 py-1 rounded-full border border-[#2D3930]">
              <Layers className="w-3.5 h-3.5 text-[#86AE8E]" />
              <span>{productCostItems.length} cost items</span>
            </div>
            {onOpenPriceModal && (
              <button
                type="button"
                id="edit-selling-price-top-btn"
                onClick={onOpenPriceModal}
                className="flex items-center gap-1 text-xs font-semibold text-[#CBD8CE] hover:text-white bg-[#1B231E] hover:bg-[#2F3E33] px-2.5 py-1 rounded-full border border-[#3A4A3E] transition cursor-pointer"
              >
                <Tag className="w-3 h-3 text-[#86AE8E]" />
                <span>Edit Prices</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Core Financial Metric Blocks */}
        <div className="my-4 pt-2 border-t border-[#344037] grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* 1. Production Cost */}
          <div className="p-3.5 rounded-xl bg-[#1B221D] border border-[#2F3C32]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#A8C7AF] mb-1">
              Unit Production Cost
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                {formatCurrency(totalCost, currency.symbol)}
              </span>
              <span className="text-xs text-[#8DA092]">/ bottle</span>
            </div>
            <p className="text-[10px] text-[#788C7D] mt-1">Exact cost for 1 bottle</p>
          </div>

          {/* 2. Selling Price */}
          <div className="p-3.5 rounded-xl bg-[#1B221D] border border-[#2F3C32] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#CBD8CE]">
                  Selling Price
                </span>
                {onOpenPriceModal && (
                  <button
                    type="button"
                    id="cost-summary-edit-price-btn"
                    onClick={onOpenPriceModal}
                    className="px-2.5 py-0.5 rounded-md bg-[#2F4234] hover:bg-[#3D5643] text-[11px] font-bold text-[#A8D5AF] hover:text-white border border-[#486650] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    title={`Edit selling price for ${product.name}`}
                  >
                    <Edit3 className="w-3 h-3 text-[#A8D5AF]" />
                    <span>Change Price</span>
                  </button>
                )}
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                {hasSellingPrice ? (
                  <>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                      {formatCurrency(sellingPrice, currency.symbol)}
                    </span>
                    <span className="text-xs text-[#8DA092]">/ bottle</span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-amber-300">Not configured</span>
                )}
              </div>
            </div>
            <p className="text-[10px] text-[#788C7D] mt-1">Configured retail price</p>
          </div>

          {/* 3. Expected Unit Profit */}
          <div className="p-3.5 rounded-xl bg-[#1B221D] border border-[#2F3C32] flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#CBD8CE]">
                Expected Unit Profit
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                {hasSellingPrice ? (
                  <>
                    <span
                      className={`text-2xl sm:text-3xl font-extrabold font-display tracking-tight ${
                        unitProfit >= 0 ? 'text-[#8CE29C]' : 'text-rose-400'
                      }`}
                    >
                      {formatCurrency(unitProfit, currency.symbol)}
                    </span>
                    <span className="text-xs font-semibold text-[#A8C7AF]">
                      ({marginPercent.toFixed(1)}%)
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-[#788C7D]">Configure price</span>
                )}
              </div>
            </div>
            <p className="text-[10px] text-[#788C7D] mt-1">Per single bottle sold</p>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#CBD8CE]">
            <HelpCircle className="w-4 h-4 text-[#86AE8E] flex-shrink-0" />
            <span className="leading-snug">
              Unit prices represent your direct calculated cost for one <strong>{product.size}</strong> bottle.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPriceModal && (
              <button
                type="button"
                id="edit-selling-price-action-btn"
                onClick={onOpenPriceModal}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B221D] hover:bg-[#2D3930] text-[#CBD8CE] hover:text-white font-bold text-xs border border-[#3A4A3E] transition cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-[#86AE8E]" />
                <span>Adjust Selling Prices</span>
              </button>
            )}

            {/* Add Cost Item Button */}
            <button
              id="add-cost-item-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#45634D] hover:bg-[#3B5542] active:bg-[#324938] text-[#F9F7F2] font-bold text-xs shadow-xs transition-all cursor-pointer border border-[#5C7E65]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Cost Item</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

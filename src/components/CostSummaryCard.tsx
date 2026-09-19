import React from 'react';
import { YoghurtProduct, CostItem, CurrencyConfig } from '../types';
import { calculateProductCost, formatCurrency } from '../utils/storage';
import { Plus, HelpCircle, Layers, Tag, TrendingUp, AlertCircle, Edit3, Zap } from 'lucide-react';

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
      <div className="bg-gradient-to-br from-[#062D22] to-[#0A3D30] text-white rounded-2xl p-6 shadow-sm border border-[#17624F] text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#0E4939] text-[#34D399] flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">No Bottle Size Selected</h3>
          <p className="text-xs text-[#A7F3D0]/80 max-w-sm mx-auto mt-1">
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
    <div className="bg-gradient-to-br from-[#062D22] via-[#0A3D30] to-[#0D4B3B] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-[#17624F] relative overflow-hidden">
      {/* Decorative soft tint */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Product & Tag row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase bg-[#0E4D3B] text-[#D1FAE5] border border-[#1F6E56]">
              {product.size}
            </span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide flex items-center gap-1 border ${
              product.category === 'electricity'
                ? 'bg-amber-400 text-amber-950 border-amber-300'
                : product.category === 'pastries'
                ? 'bg-amber-100 text-amber-900 border-amber-200'
                : 'bg-[#0E4434] text-[#A7F3D0] border-[#18624E]'
            }`}>
              {product.category === 'electricity' && <Zap className="w-3 h-3 fill-amber-950" />}
              <span>{product.category === 'electricity' ? 'Electricity Service' : product.category === 'pastries' ? 'Pastries' : 'Yoghurt'}</span>
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight">
              {product.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#A7F3D0] bg-[#07241C] px-2.5 py-1 rounded-full border border-[#145341]">
              <Layers className="w-3.5 h-3.5 text-[#34D399]" />
              <span>{productCostItems.length} cost items</span>
            </div>
            {onOpenPriceModal && (
              <button
                type="button"
                id="edit-selling-price-top-btn"
                onClick={onOpenPriceModal}
                className="flex items-center gap-1 text-xs font-semibold text-[#D1FAE5] hover:text-white bg-[#07241C] hover:bg-[#0E4032] px-2.5 py-1 rounded-full border border-[#185E4A] transition cursor-pointer"
              >
                <Tag className="w-3 h-3 text-[#34D399]" />
                <span>Edit Prices</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Core Financial Metric Blocks */}
        <div className="my-4 pt-2 border-t border-[#165644] grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* 1. Production Cost */}
          <div className="p-3.5 rounded-xl bg-[#052119]/80 border border-[#165643] backdrop-blur-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#A7F3D0] mb-1">
              Unit Production Cost
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                {formatCurrency(totalCost, currency.symbol)}
              </span>
              <span className="text-xs text-[#A7F3D0]/70">/ bottle</span>
            </div>
            <p className="text-[10px] text-[#A7F3D0]/60 mt-1">Exact cost for 1 bottle</p>
          </div>

          {/* 2. Selling Price */}
          <div className="p-3.5 rounded-xl bg-[#052119]/80 border border-[#165643] backdrop-blur-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#D1FAE5]">
                  Selling Price
                </span>
                {onOpenPriceModal && (
                  <button
                    type="button"
                    id="cost-summary-edit-price-btn"
                    onClick={onOpenPriceModal}
                    className="px-2.5 py-0.5 rounded-md bg-[#0E4435] hover:bg-[#145C47] text-[11px] font-bold text-[#6EE7B7] hover:text-white border border-[#1A6D55] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    title={`Edit selling price for ${product.name}`}
                  >
                    <Edit3 className="w-3 h-3 text-[#34D399]" />
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
                    <span className="text-xs text-[#A7F3D0]/70">/ bottle</span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-amber-300">Not configured</span>
                )}
              </div>
            </div>
            <p className="text-[10px] text-[#A7F3D0]/60 mt-1">Configured retail price</p>
          </div>

          {/* 3. Expected Unit Profit */}
          <div className="p-3.5 rounded-xl bg-[#052119]/80 border border-[#165643] backdrop-blur-xs flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#D1FAE5]">
                Expected Unit Profit
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                {hasSellingPrice ? (
                  <>
                    <span
                      className={`text-2xl sm:text-3xl font-extrabold font-display tracking-tight ${
                        unitProfit >= 0 ? 'text-[#34D399]' : 'text-rose-400'
                      }`}
                    >
                      {formatCurrency(unitProfit, currency.symbol)}
                    </span>
                    <span className="text-xs font-semibold text-[#A7F3D0]">
                      ({marginPercent.toFixed(1)}%)
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-bold text-[#A7F3D0]/60">Configure price</span>
                )}
              </div>
            </div>
            <p className="text-[10px] text-[#A7F3D0]/60 mt-1">Per single bottle sold</p>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#D1FAE5]/90">
            <HelpCircle className="w-4 h-4 text-[#34D399] flex-shrink-0" />
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
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#082E23] hover:bg-[#0E4434] text-[#D1FAE5] hover:text-white font-bold text-xs border border-[#185E4B] transition cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Adjust Selling Prices</span>
              </button>
            )}

            {/* Add Cost Item Button */}
            <button
              id="add-cost-item-btn"
              onClick={onOpenAddModal}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] active:bg-[#047857] text-white font-bold text-xs shadow-sm transition-all cursor-pointer border border-[#34D399]/40"
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

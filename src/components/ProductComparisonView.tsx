import React, { useState } from 'react';
import { YoghurtProduct, CostItem, CurrencyConfig } from '../types';
import { formatCurrency, calculateProductCost } from '../utils/storage';
import { ArrowRight, Sparkles, Milk, ChevronRight, Layers, Tag, TrendingUp, Zap } from 'lucide-react';

interface ProductComparisonViewProps {
  products: YoghurtProduct[];
  costItems: CostItem[];
  currency: CurrencyConfig;
  onSelectProduct: (productId: string) => void;
  onOpenPriceModal?: () => void;
}

export const ProductComparisonView: React.FC<ProductComparisonViewProps> = ({
  products = [],
  costItems = [],
  currency,
  onSelectProduct,
  onOpenPriceModal,
}) => {
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedProductId((prev) => (prev === id ? null : id));
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const safeCostItems = Array.isArray(costItems) ? costItems : [];

  return (
    <div className="bg-white rounded-2xl border border-[#E2DDD3] p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#EDE8DE]">
        <div>
          <h3 className="text-base font-bold text-[#1C241E] font-display flex items-center gap-2">
            <span>All Yoghurt Products, Costs & Selling Prices</span>
          </h3>
          <p className="text-xs text-[#5D6D62]">
            Compare total unit production costs, selling prices, and projected profit margins across all bottle sizes
          </p>
        </div>

        {onOpenPriceModal && (
          <button
            type="button"
            onClick={onOpenPriceModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F4] hover:bg-[#EAE4D8] text-[#3D4C42] border border-[#DDD6CA] rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-auto"
          >
            <Tag className="w-3.5 h-3.5 text-[#45634D]" />
            <span>Configure Selling Prices</span>
          </button>
        )}
      </div>

      {safeProducts.length === 0 ? (
        <div className="py-8 px-4 text-center bg-[#FAF8F4] rounded-xl border border-dashed border-[#DDD6CA] space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#EAE5DB] text-[#45634D] flex items-center justify-center mx-auto">
            <Milk className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-[#1C211E]">No Products Available</h4>
          <p className="text-xs text-[#6B786E] max-w-sm mx-auto">
            Add yoghurt products using the &quot;+ Add Size&quot; button above to track ingredients, production costs, and compare margins.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {safeProducts.map((prod) => {
            const prodItems = safeCostItems.filter((i) => i.productId === prod.id);
            const totalCost = calculateProductCost(prod.id, safeCostItems);
            const sellingPrice = typeof prod.sellingPrice === 'number' ? prod.sellingPrice : 0;
            const hasSellingPrice = sellingPrice > 0;
            const unitProfit = sellingPrice - totalCost;
            const marginPercent = hasSellingPrice ? (unitProfit / sellingPrice) * 100 : 0;
            const isGreek = prod.productType.toLowerCase().includes('greek');
            const isElectricity = (prod.category || 'yoghurt') === 'electricity';
            const isPastries = (prod.category || 'yoghurt') === 'pastries';
            const isExpanded = expandedProductId === prod.id;

            return (
              <div
                key={prod.id}
                id={`comparison-card-${prod.id}`}
                className="border border-[#E2DDD3] rounded-xl p-4 bg-[#FAF8F4] hover:bg-[#F6F3EC] transition flex flex-col justify-between"
              >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {isElectricity ? (
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                        <Zap className="w-4 h-4 fill-amber-700" />
                      </div>
                    ) : isGreek ? (
                      <div className="w-8 h-8 rounded-lg bg-[#EEF4EF] text-[#45634D] flex items-center justify-center font-bold text-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    ) : isPastries ? (
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center font-bold text-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[#EAE6DD] text-[#3D4B42] flex items-center justify-center font-bold text-xs">
                        <Milk className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-[#1C241E] leading-tight font-display">
                        {prod.name || prod.productType}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-semibold text-[#637368]">
                          {prod.size}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          isElectricity
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : isPastries
                            ? 'bg-orange-100 text-orange-900'
                            : 'bg-[#EAEFEA] text-[#2F4535]'
                        }`}>
                          {isElectricity ? '⚡ Electricity' : isPastries ? 'Pastries' : 'Yoghurt'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#E4DFD3] text-[#4E5C53]">
                    {prod.size}
                  </span>
                </div>

                {/* Financial Summary Grid */}
                <div className="mt-3 p-3 bg-white border border-[#E2DDD3] rounded-xl shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#6F7F74]">
                      Production Cost:
                    </span>
                    <span className="text-sm font-extrabold text-[#1C241E] font-display">
                      {formatCurrency(totalCost, currency.symbol)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#6F7F74]">
                      Selling Price:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold text-[#1C241E] font-display">
                        {hasSellingPrice ? (
                          formatCurrency(sellingPrice, currency.symbol)
                        ) : (
                          <span className="text-amber-700 text-xs font-bold">Not configured</span>
                        )}
                      </span>
                      {onOpenPriceModal && (
                        <button
                          type="button"
                          id={`comparison-edit-price-btn-${prod.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPriceModal();
                          }}
                          className="text-[10px] font-bold text-[#3B5441] hover:text-[#1F3124] hover:underline bg-[#E2ECE4] hover:bg-[#D5E3D8] px-1.5 py-0.5 rounded cursor-pointer border border-[#BFD3C3]"
                          title={`Edit selling price for ${prod.name}`}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EDE8DE] flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#45634D]">
                      Unit Profit:
                    </span>
                    <div className="text-right">
                      <span
                        className={`text-sm font-extrabold font-display ${
                          hasSellingPrice && unitProfit >= 0 ? 'text-[#2F4535]' : 'text-rose-700'
                        }`}
                      >
                        {hasSellingPrice
                          ? `${unitProfit >= 0 ? '+' : ''}${formatCurrency(unitProfit, currency.symbol)}`
                          : '—'}
                      </span>
                      {hasSellingPrice && (
                        <span className="text-[10px] text-[#697A6F] block">
                          {marginPercent.toFixed(1)}% margin
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Breakdown Toggle */}
                <div className="mt-3">
                  <button
                    id={`toggle-breakdown-btn-${prod.id}`}
                    onClick={() => toggleExpand(prod.id)}
                    className="w-full flex items-center justify-between text-xs font-bold text-[#3D4C42] hover:text-[#1C241E] py-1 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide' : 'Show'} Itemized Costs ({prodItems.length})</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-1.5 pt-2 border-t border-[#E2DDD3] max-h-52 overflow-y-auto pr-1">
                      {prodItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs py-1 border-b border-[#EDE8DE] last:border-0"
                        >
                          <span className="text-[#3D4B42] truncate pr-2" title={item.name}>
                            {item.name}
                          </span>
                          <span className="font-bold text-[#1C241E] flex-shrink-0 font-display">
                            {formatCurrency(item.unitPricePerBottle, currency.symbol)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Manage Link */}
              <div className="mt-4 pt-3 border-t border-[#E2DDD3]">
                <button
                  id={`select-and-manage-btn-${prod.id}`}
                  onClick={() => onSelectProduct(prod.id)}
                  className="w-full py-2.5 bg-[#45634D] hover:bg-[#3B5542] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Manage {prod.size} Costs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};

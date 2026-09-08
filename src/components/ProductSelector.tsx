import React from 'react';
import { YoghurtProduct, CostItem, CurrencyConfig } from '../types';
import { calculateProductCost, formatCurrency } from '../utils/storage';
import { Milk, Sparkles, CheckCircle2, Tag, Edit3, Plus } from 'lucide-react';

interface ProductSelectorProps {
  products: YoghurtProduct[];
  selectedProductId: string;
  onSelectProduct: (productId: string) => void;
  costItems: CostItem[];
  currency: CurrencyConfig;
  onOpenPriceModal?: () => void;
  onOpenAddProductModal?: () => void;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products = [],
  selectedProductId,
  onSelectProduct,
  costItems = [],
  currency,
  onOpenPriceModal,
  onOpenAddProductModal,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#5E6B63] flex items-center gap-1.5">
          <span>Yoghurt Products & Bottle Sizes</span>
        </label>
        <div className="flex items-center gap-2">
          {onOpenAddProductModal && (
            <button
              type="button"
              id="selector-add-new-product-btn"
              onClick={onOpenAddProductModal}
              className="flex items-center gap-1 text-xs font-bold text-[#344E3B] hover:text-[#1E2E23] bg-[#E8EFEA] hover:bg-[#DDE7DF] px-2.5 py-1 rounded-lg border border-[#C5D7C9] transition cursor-pointer"
              title="Add a new bottle size or product line"
            >
              <Plus className="w-3.5 h-3.5 text-[#45634D]" />
              <span>Add Size</span>
            </button>
          )}
          {onOpenPriceModal && products.length > 0 && (
            <button
              type="button"
              id="selector-edit-prices-btn"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPriceModal();
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-[#344E3B] hover:text-[#1E2E23] bg-[#E8EFEA] hover:bg-[#DDE7DF] px-2.5 py-1 rounded-lg border border-[#C5D7C9] transition cursor-pointer"
              title="Edit product selling prices per bottle"
            >
              <Tag className="w-3.5 h-3.5 text-[#45634D]" />
              <span>Edit Selling Prices</span>
            </button>
          )}
          <span className="text-[11px] text-[#7A8A80] font-medium hidden sm:inline">
            {products.length} {products.length === 1 ? 'Size' : 'Sizes'} Configured
          </span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-[#DDD7CC] text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF4EF] text-[#34513B] flex items-center justify-center mx-auto">
            <Milk className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1C211E]">No Products Configured Yet</h4>
            <p className="text-xs text-[#697A6F] max-w-sm mx-auto mt-0.5">
              Add your yoghurt products or bottle sizes (e.g. 30cl, 50cl, 500ml) to start calculating recipes, ingredient costs, and selling margins.
            </p>
          </div>
          {onOpenAddProductModal && (
            <button
              type="button"
              id="selector-empty-add-product-btn"
              onClick={onOpenAddProductModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#45634D] hover:bg-[#38533F] text-white text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Product / Size</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {(products || []).map((prod) => {
            const isSelected = prod.id === selectedProductId;
            const totalCost = calculateProductCost(prod.id, costItems);
            const isGreek = prod.productType.toLowerCase().includes('greek');

            return (
              <button
                key={prod.id}
                id={`product-tab-${prod.id}`}
                onClick={() => onSelectProduct(prod.id)}
                className={`relative text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#EEF4EF] border-[#45634D] shadow-xs ring-2 ring-[#45634D]/25'
                    : 'bg-white hover:bg-[#FAF8F4] border-[#E2DDD3] hover:border-[#C8C2B5] text-[#2A332D]'
                }`}
              >
                {/* Top Row: Type & Size Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      {isGreek ? (
                        <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-[#3E5C46]' : 'text-[#728577]'}`} />
                      ) : (
                        <Milk className={`w-3.5 h-3.5 ${isSelected ? 'text-[#3E5C46]' : 'text-[#8E9C92]'}`} />
                      )}
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${
                        isSelected ? 'text-[#2E4635]' : 'text-[#606E65]'
                      }`}>
                        {prod.productType}
                      </span>
                    </div>
                    <h3 className={`text-base font-bold leading-snug mt-0.5 font-display ${
                      isSelected ? 'text-[#1C241E]' : 'text-[#2D3630]'
                    }`}>
                      {prod.size} Bottle
                    </h3>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                      isSelected
                        ? 'bg-[#45634D] text-white shadow-xs'
                        : 'bg-[#F0ECE1] text-[#556359] border border-[#E0D9CB]'
                    }`}
                  >
                    {prod.size}
                  </span>
                </div>

                {/* Bottom Row: Cost, Selling Price and Profit per bottle */}
                <div className="pt-2 border-t border-[#DCD6C9]/70 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] uppercase font-semibold text-[#66756B]">Cost / btl:</span>
                    <span className={`font-bold font-display ${isSelected ? 'text-[#223528]' : 'text-[#3A453E]'}`}>
                      {formatCurrency(totalCost, currency.symbol)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] uppercase font-semibold text-[#66756B]">Selling:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#1C211E]">
                        {typeof prod.sellingPrice === 'number' && prod.sellingPrice > 0
                          ? formatCurrency(prod.sellingPrice, currency.symbol)
                          : <span className="text-[10px] text-amber-700 font-semibold">Not set</span>}
                      </span>
                      {onOpenPriceModal && (
                        <span
                          id={`edit-price-tag-${prod.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPriceModal();
                          }}
                          className="text-[10px] font-bold text-[#3B5441] hover:text-[#1F3124] hover:underline bg-[#E2ECE4] hover:bg-[#D5E3D8] px-1.5 py-0.5 rounded cursor-pointer border border-[#BFD3C3]"
                          title={`Edit selling price for ${prod.name}`}
                        >
                          Edit
                        </span>
                      )}
                    </div>
                  </div>

                  {typeof prod.sellingPrice === 'number' && prod.sellingPrice > 0 && (
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-dashed border-[#DCD6C9]/70">
                      <span className="text-[10px] uppercase font-bold text-[#45634D]">Profit:</span>
                      <span className="font-extrabold text-[#2F4535]">
                        +{formatCurrency(prod.sellingPrice - totalCost, currency.symbol)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Active Selection Check Icon */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#45634D]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

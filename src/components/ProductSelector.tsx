import React, { useState, useMemo } from 'react';
import { YoghurtProduct, CostItem, CurrencyConfig, ServiceCategory } from '../types';
import { calculateProductCost, formatCurrency } from '../utils/storage';
import { Milk, Sparkles, CheckCircle2, Tag, Edit3, Plus, Zap, Filter } from 'lucide-react';

interface ProductSelectorProps {
  products: YoghurtProduct[];
  selectedProductId: string;
  onSelectProduct: (productId: string) => void;
  costItems: CostItem[];
  currency: CurrencyConfig;
  onOpenPriceModal?: () => void;
  onOpenAddProductModal?: () => void;
  onEditProduct?: (product: YoghurtProduct) => void;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products = [],
  selectedProductId,
  onSelectProduct,
  costItems = [],
  currency,
  onOpenPriceModal,
  onOpenAddProductModal,
  onEditProduct,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | ServiceCategory>('all');

  const categoryCounts = useMemo(() => {
    const counts = { all: products.length, yoghurt: 0, pastries: 0, electricity: 0 };
    products.forEach((p) => {
      const cat = p.category || 'yoghurt';
      if (cat in counts) {
        counts[cat]++;
      }
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategoryFilter === 'all') return products;
    return products.filter((p) => (p.category || 'yoghurt') === selectedCategoryFilter);
  }, [products, selectedCategoryFilter]);

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[#5E6B63] flex items-center gap-1.5">
          <span>Services & Product Lines</span>
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenAddProductModal && (
            <button
              type="button"
              id="selector-add-new-product-btn"
              onClick={onOpenAddProductModal}
              className="flex items-center gap-1 text-xs font-bold text-[#065F46] hover:text-[#047857] bg-[#ECFDF5] hover:bg-[#D1FAE5] px-2.5 py-1.5 rounded-lg border border-[#A7F3D0] transition cursor-pointer shadow-2xs"
              title="Add a new service, bottle size, or category"
            >
              <Plus className="w-3.5 h-3.5 text-[#059669]" />
              <span>Add Service / Size</span>
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
              className="flex items-center gap-1.5 text-xs font-bold text-[#065F46] hover:text-[#047857] bg-[#ECFDF5] hover:bg-[#D1FAE5] px-2.5 py-1.5 rounded-lg border border-[#A7F3D0] transition cursor-pointer shadow-2xs"
              title="Edit selling prices"
            >
              <Tag className="w-3.5 h-3.5 text-[#059669]" />
              <span>Edit Selling Prices</span>
            </button>
          )}
          <span className="text-[11px] text-[#64748B] font-medium hidden sm:inline">
            {products.length} {products.length === 1 ? 'Service' : 'Services'} Configured
          </span>
        </div>
      </div>

      {/* Category Filter Bar */}
      {products.length > 0 && (
        <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0] overflow-x-auto">
          <button
            type="button"
            id="product-filter-all"
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedCategoryFilter === 'all'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <span>All Services</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedCategoryFilter === 'all' ? 'bg-white/25 text-white' : 'bg-[#E2E8F0] text-[#475569]'
            }`}>
              {categoryCounts.all}
            </span>
          </button>

          <button
            type="button"
            id="product-filter-electricity"
            onClick={() => setSelectedCategoryFilter('electricity')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedCategoryFilter === 'electricity'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-900 hover:text-amber-950 bg-amber-50/80 border border-amber-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Electricity</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedCategoryFilter === 'electricity' ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-900'
            }`}>
              {categoryCounts.electricity}
            </span>
          </button>

          <button
            type="button"
            id="product-filter-yoghurt"
            onClick={() => setSelectedCategoryFilter('yoghurt')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedCategoryFilter === 'yoghurt'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Milk className="w-3.5 h-3.5 text-[#059669]" />
            <span>Yoghurt</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedCategoryFilter === 'yoghurt' ? 'bg-white/25 text-white' : 'bg-[#E2E8F0] text-[#475569]'
            }`}>
              {categoryCounts.yoghurt}
            </span>
          </button>

          <button
            type="button"
            id="product-filter-pastries"
            onClick={() => setSelectedCategoryFilter('pastries')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedCategoryFilter === 'pastries'
                ? 'bg-[#D97706] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Pastries</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedCategoryFilter === 'pastries' ? 'bg-white/25 text-white' : 'bg-[#E2E8F0] text-[#475569]'
            }`}>
              {categoryCounts.pastries}
            </span>
          </button>
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-[#CBD5E1] text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center mx-auto">
            <Milk className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0F172A]">No Services or Products Configured Yet</h4>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-0.5">
              Add your services and products (e.g. Electricity, Yoghurt 30cl, 50cl, 500ml) to start calculating costs, jobs, and margins.
            </p>
          </div>
          {onOpenAddProductModal && (
            <button
              type="button"
              id="selector-empty-add-product-btn"
              onClick={onOpenAddProductModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Service / Product</span>
            </button>
          )}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] text-center space-y-2">
          <p className="text-xs text-[#64748B]">
            No services found in category <span className="font-bold text-[#0F172A] capitalize">{selectedCategoryFilter}</span>.
          </p>
          {onOpenAddProductModal && (
            <button
              type="button"
              onClick={onOpenAddProductModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#059669] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#047857]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add {selectedCategoryFilter === 'electricity' ? 'Electricity Service' : 'Service in this Category'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {filteredProducts.map((prod) => {
            const isSelected = prod.id === selectedProductId;
            const totalCost = calculateProductCost(prod.id, costItems);
            const isGreek = prod.productType.toLowerCase().includes('greek');
            const isElectricity = (prod.category || 'yoghurt') === 'electricity';
            const isPastries = (prod.category || 'yoghurt') === 'pastries';

            return (
              <div
                key={prod.id}
                id={`product-tab-${prod.id}`}
                onClick={() => onSelectProduct(prod.id)}
                className={`relative text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? isElectricity
                      ? 'bg-amber-50/90 border-amber-400 shadow-xs ring-2 ring-amber-400/30'
                      : 'bg-[#F0FDF4] border-[#10B981] shadow-xs ring-2 ring-[#10B981]/25'
                    : 'bg-white hover:bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1] text-[#0F172A]'
                }`}
              >
                {/* Top Row: Type & Category Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      {isElectricity ? (
                        <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                      ) : isGreek ? (
                        <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-[#059669]' : 'text-[#64748B]'}`} />
                      ) : isPastries ? (
                        <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                      ) : (
                        <Milk className={`w-3.5 h-3.5 ${isSelected ? 'text-[#059669]' : 'text-[#64748B]'}`} />
                      )}
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${
                        isElectricity
                          ? 'text-amber-800'
                          : isSelected
                          ? 'text-[#065F46]'
                          : 'text-[#64748B]'
                      }`}>
                        {prod.productType}
                      </span>
                    </div>
                    <h3 className={`text-base font-bold leading-snug mt-0.5 font-display ${
                      isSelected ? 'text-[#0F172A]' : 'text-[#1E293B]'
                    }`}>
                      {prod.name || `${prod.size} Unit`}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {/* Category Tag */}
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide rounded-md border ${
                        isElectricity
                          ? 'bg-amber-50 text-amber-900 border-amber-200'
                          : isPastries
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {isElectricity ? '⚡ Electricity' : isPastries ? '🥐 Pastries' : '🥛 Yoghurt'}
                    </span>

                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                        isSelected
                          ? isElectricity
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-[#059669] text-white shadow-xs'
                          : 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]'
                      }`}
                    >
                      {prod.size}
                    </span>
                  </div>
                </div>

                {/* Description if any */}
                {prod.description && (
                  <p className="text-[11px] text-[#64748B] line-clamp-1 mb-2">
                    {prod.description}
                  </p>
                )}

                {/* Bottom Row: Cost, Selling Price and Profit */}
                <div className="pt-2 border-t border-[#E2E8F0] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] uppercase font-semibold text-[#64748B]">Cost / Unit:</span>
                    <span className={`font-bold font-display ${isSelected ? 'text-[#065F46]' : 'text-[#334155]'}`}>
                      {formatCurrency(totalCost, currency.symbol)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] uppercase font-semibold text-[#64748B]">Selling:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#0F172A]">
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
                          className="text-[10px] font-bold text-[#065F46] hover:text-[#047857] hover:underline bg-[#ECFDF5] hover:bg-[#D1FAE5] px-1.5 py-0.5 rounded cursor-pointer border border-[#A7F3D0]"
                          title={`Edit selling price for ${prod.name}`}
                        >
                          Price
                        </span>
                      )}
                    </div>
                  </div>

                  {typeof prod.sellingPrice === 'number' && prod.sellingPrice > 0 && (
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-dashed border-[#E2E8F0]">
                      <span className="text-[10px] uppercase font-bold text-[#059669]">Profit:</span>
                      <span className="font-extrabold text-[#059669]">
                        +{formatCurrency(prod.sellingPrice - totalCost, currency.symbol)}
                      </span>
                    </div>
                  )}

                  {/* Edit Service Action Button */}
                  {onEditProduct && (
                    <div className="pt-1.5 flex justify-end">
                      <button
                        type="button"
                        id={`edit-service-btn-${prod.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProduct(prod);
                        }}
                        className="text-[10px] font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#CBD5E1] transition cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3 text-[#059669]" />
                        <span>Edit Service</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Active Selection Check Icon */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5">
                    <CheckCircle2 className={`w-4 h-4 ${isElectricity ? 'text-amber-600' : 'text-[#059669]'}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

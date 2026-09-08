import React, { useState } from 'react';
import { YoghurtProduct, CurrencyConfig } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialData';
import { X, Plus, Sparkles, Package, DollarSign, Tag, CheckCircle2 } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (product: YoghurtProduct) => void;
  onQuickLoadStandardProducts?: (products: YoghurtProduct[]) => void;
  currency: CurrencyConfig;
  existingProductIds?: string[];
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSaveProduct,
  onQuickLoadStandardProducts,
  currency,
  existingProductIds = [],
}) => {
  const [productType, setProductType] = useState('Normal Yoghurt');
  const [size, setSize] = useState('');
  const [customName, setCustomName] = useState('');
  const [category, setCategory] = useState<'yoghurt' | 'pastries'>('yoghurt');
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resolvedName =
    customName.trim() ||
    (size ? `${productType} — ${size}` : productType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!size.trim()) {
      setError('Please provide a size or packaging format (e.g. 30cl, 50cl, 500ml, 1 Liter).');
      return;
    }

    const priceNum = parseFloat(sellingPrice);
    if (sellingPrice.trim() && (isNaN(priceNum) || priceNum < 0)) {
      setError('Selling price must be a valid positive number or left blank.');
      return;
    }

    const generatedId = `${productType.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${size.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const newProduct: YoghurtProduct = {
      id: generatedId,
      productType: productType.trim(),
      size: size.trim(),
      name: resolvedName,
      category,
      sellingPrice: !isNaN(priceNum) && priceNum > 0 ? priceNum : 0,
      description: description.trim() || undefined,
    };

    onSaveProduct(newProduct);
    onClose();
  };

  const handleQuickLoad = () => {
    if (onQuickLoadStandardProducts) {
      onQuickLoadStandardProducts(INITIAL_PRODUCTS);
      onClose();
    }
  };

  return (
    <div
      id="add-product-modal-backdrop"
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="add-product-modal-content"
        className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-[#D9D3C7] space-y-5 animate-in fade-in duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EAE4D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#EEF4EF] text-[#34513B] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1C211E] font-display">
                Add New Product / Bottle Size
              </h3>
              <p className="text-xs text-[#697A6F]">
                Configure yoghurt product sizes to track recipe ingredient costs and selling margins.
              </p>
            </div>
          </div>
          <button
            id="close-add-product-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#697A6F] hover:text-[#1C211E] hover:bg-[#F4EFE6] rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Setup Option if standard products not loaded */}
        {existingProductIds.length === 0 && onQuickLoadStandardProducts && (
          <div className="p-3.5 bg-[#FAF6F0] rounded-xl border border-[#E6DAC8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C4E20]">
                <Sparkles className="w-3.5 h-3.5 text-[#9A5B2D]" />
                <span>Quick Setup: 3 Standard Butch Master Sizes</span>
              </div>
              <p className="text-[11px] text-[#7A6451] mt-0.5">
                Load 30cl, 50cl Normal Yoghurt and 500ml Greek Yoghurt with preset recommended selling prices.
              </p>
            </div>
            <button
              type="button"
              id="btn-quick-setup-standard-products"
              onClick={handleQuickLoad}
              className="px-3 py-2 bg-[#2D4534] hover:bg-[#223528] text-white rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shadow-2xs"
            >
              Add 3 Standard Sizes
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Product Type & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#47574B] font-bold uppercase tracking-wider text-[10px] mb-1">
                Product Type
              </label>
              <select
                id="input-product-type"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9D3C7] bg-white text-[#1C211E] font-medium focus:ring-2 focus:ring-[#45634D] focus:outline-hidden"
              >
                <option value="Normal Yoghurt">Normal Yoghurt</option>
                <option value="Greek Yoghurt">Greek Yoghurt</option>
                <option value="Flavoured Yoghurt">Flavoured Yoghurt</option>
                <option value="Pastries">Pastries / Snacks</option>
                <option value="Beverage">Other Beverage</option>
              </select>
            </div>

            <div>
              <label className="block text-[#47574B] font-bold uppercase tracking-wider text-[10px] mb-1">
                Size / Packaging Format *
              </label>
              <input
                id="input-product-size"
                type="text"
                placeholder="e.g. 30cl, 50cl, 500ml, 1 Liter"
                value={size}
                onChange={(e) => {
                  setSize(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#D9D3C7] bg-white text-[#1C211E] font-medium focus:ring-2 focus:ring-[#45634D] focus:outline-hidden"
                required
              />
            </div>
          </div>

          {/* Product Name Display / Override */}
          <div>
            <label className="block text-[#47574B] font-bold uppercase tracking-wider text-[10px] mb-1">
              Display Name (Optional Customization)
            </label>
            <input
              id="input-product-display-name"
              type="text"
              placeholder={resolvedName}
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D9D3C7] bg-white text-[#1C211E] font-medium focus:ring-2 focus:ring-[#45634D] focus:outline-hidden"
            />
            <p className="text-[11px] text-[#697A6F] mt-1">
              Will display in invoices and reports as:{' '}
              <span className="font-bold text-[#1C211E]">{resolvedName}</span>
            </p>
          </div>

          {/* Selling Price & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#47574B] font-bold uppercase tracking-wider text-[10px] mb-1">
                Selling Price ({currency.symbol})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#697A6F]">
                  {currency.symbol}
                </span>
                <input
                  id="input-product-selling-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D9D3C7] bg-white text-[#1C211E] font-medium focus:ring-2 focus:ring-[#45634D] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#47574B] font-bold uppercase tracking-wider text-[10px] mb-1">
                Category
              </label>
              <select
                id="input-product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as 'yoghurt' | 'pastries')}
                className="w-full px-3 py-2 rounded-xl border border-[#D9D3C7] bg-white text-[#1C211E] font-medium focus:ring-2 focus:ring-[#45634D] focus:outline-hidden"
              >
                <option value="yoghurt">Yoghurt Line</option>
                <option value="pastries">Pastries / Bakery Line</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#47574B] font-bold uppercase tracking-wider text-[10px] mb-1">
              Notes / Description (Optional)
            </label>
            <input
              id="input-product-notes"
              type="text"
              placeholder="e.g. Standard batch packaging with tamper-evident seal"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D9D3C7] bg-white text-[#1C211E] font-medium focus:ring-2 focus:ring-[#45634D] focus:outline-hidden"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#EAE4D8] flex items-center justify-end gap-2.5">
            <button
              type="button"
              id="cancel-add-product-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F4EFE6] hover:bg-[#EAE2D5] text-[#55635B] font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-add-product-btn"
              className="px-5 py-2 rounded-xl bg-[#45634D] hover:bg-[#38533F] text-white font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

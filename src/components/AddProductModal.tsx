import React, { useState, useEffect } from 'react';
import { YoghurtProduct, CurrencyConfig, ServiceCategory, SERVICE_CATEGORIES } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialData';
import { X, Plus, Sparkles, Package, DollarSign, Tag, CheckCircle2, Zap, Save } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (product: YoghurtProduct) => void;
  onQuickLoadStandardProducts?: (products: YoghurtProduct[]) => void;
  currency: CurrencyConfig;
  existingProductIds?: string[];
  editingProduct?: YoghurtProduct | null;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSaveProduct,
  onQuickLoadStandardProducts,
  currency,
  existingProductIds = [],
  editingProduct = null,
}) => {
  const [productType, setProductType] = useState('Normal Yoghurt');
  const [size, setSize] = useState('');
  const [customName, setCustomName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('yoghurt');
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setProductType(editingProduct.productType || 'Normal Yoghurt');
        setSize(editingProduct.size || '');
        setCustomName(editingProduct.name || '');
        setCategory(editingProduct.category || 'yoghurt');
        setSellingPrice(
          typeof editingProduct.sellingPrice === 'number' && editingProduct.sellingPrice > 0
            ? String(editingProduct.sellingPrice)
            : ''
        );
        setDescription(editingProduct.description || '');
      } else {
        setProductType('Normal Yoghurt');
        setSize('');
        setCustomName('');
        setCategory('yoghurt');
        setSellingPrice('');
        setDescription('');
      }
      setError(null);
    }
  }, [isOpen, editingProduct]);

  if (!isOpen) return null;

  const resolvedName =
    customName.trim() ||
    (size ? `${productType} — ${size}` : productType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!size.trim()) {
      setError('Please provide a size, unit or billing format (e.g. 30cl, 50cl, Per Month, Job Service).');
      return;
    }

    const priceNum = parseFloat(sellingPrice);
    if (sellingPrice.trim() && (isNaN(priceNum) || priceNum < 0)) {
      setError('Selling price must be a valid positive number or left blank.');
      return;
    }

    const productId = editingProduct
      ? editingProduct.id
      : `${category === 'electricity' ? 'elec' : productType.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${size.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const productPayload: YoghurtProduct = {
      id: productId,
      productType: productType.trim(),
      size: size.trim(),
      name: resolvedName,
      category,
      sellingPrice: !isNaN(priceNum) && priceNum > 0 ? priceNum : 0,
      description: description.trim() || undefined,
    };

    onSaveProduct(productPayload);
    onClose();
  };

  const handleQuickLoad = () => {
    if (onQuickLoadStandardProducts) {
      onQuickLoadStandardProducts(INITIAL_PRODUCTS);
      onClose();
    }
  };

  const handleApplyElectricityPreset = (presetType: 'monthly' | 'maintenance' | 'wiring') => {
    setCategory('electricity');
    if (presetType === 'monthly') {
      setProductType('Industrial Electricity & Cold-Chain Power');
      setSize('Monthly Run / Billing');
      setCustomName('Industrial 3-Phase Electricity & Cold-Chain Power');
      setSellingPrice('45000');
      setDescription('Dedicated 3-phase grid power supply, backup diesel synchronization, and cold-chain chilling line feed');
    } else if (presetType === 'maintenance') {
      setProductType('Electrical Maintenance & Generator Service');
      setSize('Per Service Job');
      setCustomName('Electrical Maintenance & Generator Phasing');
      setSellingPrice('18500');
      setDescription('Certified electrical check, surge suppressor inspection, and distribution board calibration');
    } else {
      setProductType('Cold Room Electrical Installation');
      setSize('Per Project');
      setCustomName('Cold Storage Wiring & Electrical Inspection');
      setSellingPrice('35000');
      setDescription('Heavy-duty cabling, isolation switchgear, and safety breaker testing for dairy facilities');
    }
    setError(null);
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
        className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-[#E2E8F0] space-y-5 animate-in fade-in duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              category === 'electricity'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-[#ECFDF5] text-[#059669]'
            }`}>
              {category === 'electricity' ? <Zap className="w-5 h-5" /> : <Package className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] font-display">
                {editingProduct ? 'Edit Service / Product' : 'Add New Service / Product'}
              </h3>
              <p className="text-xs text-[#64748B]">
                {editingProduct
                  ? 'Update category, pricing and configuration for this service or product.'
                  : 'Configure services and product lines (Yoghurt, Pastries, or Electricity) to track costs and profits.'}
              </p>
            </div>
          </div>
          <button
            id="close-add-product-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Electricity Quick Presets (Available when creating or selecting Electricity) */}
        {!editingProduct && (
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                <span>Quick Preset: Electricity Category Services</span>
              </div>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                1-Click Load
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyElectricityPreset('monthly')}
                className="text-[11px] font-medium px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-300 transition cursor-pointer"
              >
                ⚡ 3-Phase Industrial Power
              </button>
              <button
                type="button"
                onClick={() => handleApplyElectricityPreset('maintenance')}
                className="text-[11px] font-medium px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-300 transition cursor-pointer"
              >
                ⚡ Generator & Phasing Service
              </button>
              <button
                type="button"
                onClick={() => handleApplyElectricityPreset('wiring')}
                className="text-[11px] font-medium px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-300 transition cursor-pointer"
              >
                ⚡ Cold Storage Wiring
              </button>
            </div>
          </div>
        )}

        {/* Quick Setup Option if standard products not loaded */}
        {!editingProduct && existingProductIds.length === 0 && onQuickLoadStandardProducts && (
          <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#059669]">
                <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Quick Setup: 3 Standard Butch Master Sizes</span>
              </div>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Load 30cl, 50cl Normal Yoghurt and 500ml Greek Yoghurt with preset recommended selling prices.
              </p>
            </div>
            <button
              type="button"
              id="btn-quick-setup-standard-products"
              onClick={handleQuickLoad}
              className="px-3 py-2 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shadow-xs"
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
          {/* Category & Product Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#475569] font-bold uppercase tracking-wider text-[10px] mb-1">
                Service / Product Category *
              </label>
              <select
                id="input-product-category"
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value as ServiceCategory;
                  setCategory(newCat);
                  if (newCat === 'electricity' && (!productType || productType === 'Normal Yoghurt')) {
                    setProductType('Industrial Electricity & Cold-Chain Power');
                    if (!size) setSize('Monthly Run / Billing');
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] font-medium focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
              >
                <option value="yoghurt">🥛 Yoghurt Line</option>
                <option value="pastries">🥐 Pastries / Bakery Line</option>
                <option value="electricity">⚡ Electricity / Electrical Services</option>
              </select>
            </div>

            <div>
              <label className="block text-[#475569] font-bold uppercase tracking-wider text-[10px] mb-1">
                Product / Service Type
              </label>
              <select
                id="input-product-type"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] font-medium focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
              >
                {category === 'electricity' ? (
                  <>
                    <option value="Industrial Electricity & Cold-Chain Power">Industrial Electricity & Cold-Chain Power</option>
                    <option value="Electrical Maintenance & Generator Service">Electrical Maintenance & Generator Service</option>
                    <option value="Cold Room Electrical Installation">Cold Room Electrical Installation</option>
                    <option value="Solar & Inverter Backup System">Solar & Inverter Backup System</option>
                    <option value="General Electrical Utility">General Electrical Utility</option>
                  </>
                ) : (
                  <>
                    <option value="Normal Yoghurt">Normal Yoghurt</option>
                    <option value="Greek Yoghurt">Greek Yoghurt</option>
                    <option value="Flavoured Yoghurt">Flavoured Yoghurt</option>
                    <option value="Pastries">Pastries / Snacks</option>
                    <option value="Beverage">Other Beverage</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Size / Billing Unit & Selling Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#475569] font-bold uppercase tracking-wider text-[10px] mb-1">
                {category === 'electricity' ? 'Billing Unit / Service Format *' : 'Size / Packaging Format *'}
              </label>
              <input
                id="input-product-size"
                type="text"
                placeholder={category === 'electricity' ? 'e.g. Monthly Run, Per Job, 3-Phase Unit' : 'e.g. 30cl, 50cl, 500ml, 1 Liter'}
                value={size}
                onChange={(e) => {
                  setSize(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] font-medium focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-[#475569] font-bold uppercase tracking-wider text-[10px] mb-1">
                Selling Price ({currency.symbol})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#64748B]">
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
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] font-medium focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Product Name Display / Override */}
          <div>
            <label className="block text-[#475569] font-bold uppercase tracking-wider text-[10px] mb-1">
              Display Name (Optional Customization)
            </label>
            <input
              id="input-product-display-name"
              type="text"
              placeholder={resolvedName}
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] font-medium focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
            />
            <p className="text-[11px] text-[#64748B] mt-1">
              Will display in invoices and records as:{' '}
              <span className="font-bold text-[#0F172A]">{resolvedName}</span>
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#475569] font-bold uppercase tracking-wider text-[10px] mb-1">
              Notes / Description (Optional)
            </label>
            <input
              id="input-product-notes"
              type="text"
              placeholder={category === 'electricity' ? 'e.g. 3-phase grid tariff, generator diesel share and maintenance' : 'e.g. Standard batch packaging with tamper-evident seal'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] font-medium focus:ring-2 focus:ring-[#059669] focus:outline-hidden"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
            <button
              type="button"
              id="cancel-add-product-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-add-product-btn"
              className={`px-5 py-2 rounded-xl text-white font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5 ${
                category === 'electricity'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-[#059669] hover:bg-[#047857]'
              }`}
            >
              {editingProduct ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editingProduct ? 'Save Service Changes' : 'Add Service / Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

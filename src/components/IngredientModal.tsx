import React, { useState, useEffect } from 'react';
import { CostItem, YoghurtProduct, CurrencyConfig, STANDARD_COST_ITEMS } from '../types';
import { formatCurrency } from '../utils/storage';
import { X, Check, Tag, AlertCircle, Sparkles } from 'lucide-react';

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    productId: string;
    name: string;
    unitPricePerBottle: number;
    notes?: string;
    changeReason?: string;
  }) => void;
  costItemToEdit: CostItem | null;
  currentProduct: YoghurtProduct;
  allProducts: YoghurtProduct[];
  currency: CurrencyConfig;
  prefillName?: string;
}

export const IngredientModal: React.FC<IngredientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  costItemToEdit,
  currentProduct,
  allProducts,
  currency,
  prefillName,
}) => {
  const [name, setName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(currentProduct.id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (costItemToEdit) {
      setName(costItemToEdit.name);
      setUnitPrice(costItemToEdit.unitPricePerBottle.toString());
      setNotes(costItemToEdit.notes || '');
      setChangeReason('');
      setSelectedProductId(costItemToEdit.productId);
      setError(null);
    } else {
      setName(prefillName || '');
      setUnitPrice('');
      setNotes('');
      setChangeReason('');
      setSelectedProductId(currentProduct.id);
      setError(null);
    }
  }, [costItemToEdit, currentProduct, isOpen, prefillName]);

  if (!isOpen) return null;

  const isEditing = !!costItemToEdit;
  const numPrice = parseFloat(unitPrice) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter or select the cost item name (e.g. Milk, Sugar, Bottle)');
      return;
    }

    if (unitPrice.trim() === '' || isNaN(Number(unitPrice)) || Number(unitPrice) < 0) {
      setError('Please enter a valid unit price for one bottle (e.g. 50 or 180.00)');
      return;
    }

    onSave({
      id: costItemToEdit?.id,
      productId: selectedProductId,
      name: name.trim(),
      unitPricePerBottle: Number(unitPrice),
      notes: notes.trim() || undefined,
      changeReason: changeReason.trim() || undefined,
    });

    onClose();
  };

  const selectedProduct = allProducts.find((p) => p.id === selectedProductId) || currentProduct;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1C211E]/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="cost-item-modal"
        className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#E2DDD3] animate-fadeIn relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EDE8DE]">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#1C241E] font-display">
              {isEditing ? 'Edit Unit Price & Details' : 'Add Cost Item'}
            </h3>
            <p className="text-xs text-[#5D6D62]">
              For {selectedProduct.name}
            </p>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className="p-2 text-[#7C8B81] hover:text-[#2A342D] hover:bg-[#FAF8F4] rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mt-3 p-3 bg-[#FDF2F2] border border-[#F2C5C5] rounded-xl text-xs text-[#8A2525] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#A83232] flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Target Product / Size selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5D6D62] mb-1.5">
              Yoghurt Product & Bottle Size
            </label>
            <select
              id="modal-product-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#FAF8F4] border border-[#DDD7CC] rounded-xl text-sm font-semibold text-[#1C241E] focus:outline-none focus:ring-2 focus:ring-[#45634D] focus:bg-white transition cursor-pointer"
            >
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cost Item Name / Standard items quick selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5D6D62]">
                Cost Item Name <span className="text-[#A83232]">*</span>
              </label>
              <span className="text-[11px] text-[#45634D] font-medium">
                Standard or Custom
              </span>
            </div>

            <input
              id="modal-item-name-input"
              type="text"
              required
              placeholder="e.g. Milk, Sugar, Culture / Starter, Energy, Bottle"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#DDD7CC] rounded-xl text-sm text-[#1C241E] focus:outline-none focus:ring-2 focus:ring-[#45634D] focus:bg-white transition"
            />

            {/* Quick standard tags suggestions */}
            <div className="mt-2 flex flex-wrap gap-1">
              {STANDARD_COST_ITEMS.slice(0, 6).map((stdName) => (
                <button
                  type="button"
                  key={stdName}
                  onClick={() => setName(stdName)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition cursor-pointer ${
                    name === stdName
                      ? 'bg-[#45634D] text-white border-[#45634D]'
                      : 'bg-[#F2EFE9] text-[#4E5C53] border-[#E0DBD0] hover:bg-[#E8E4DB]'
                  }`}
                >
                  {stdName}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Price for ONE Bottle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5D6D62]">
                Unit Price for 1 Bottle ({currency.symbol}) <span className="text-[#A83232]">*</span>
              </label>
              <span className="text-[11px] text-[#45634D] font-semibold">
                Single bottle portion
              </span>
            </div>

            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5D6D62] font-bold text-base">
                {currency.symbol}
              </div>
              <input
                id="modal-unit-price-input"
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                required
                placeholder="0.00"
                value={unitPrice}
                onChange={(e) => {
                  setUnitPrice(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full pl-9 pr-4 py-3 bg-[#FAF8F4] border-2 border-[#DDD7CC] rounded-xl text-lg font-bold text-[#1C241E] focus:outline-none focus:ring-2 focus:ring-[#45634D] focus:border-[#45634D] focus:bg-white transition"
              />
            </div>
            <p className="text-[11px] text-[#728277] mt-1">
              Enter your calculated cost for this item for one <strong>{selectedProduct.size}</strong> bottle.
            </p>
          </div>

          {/* If editing, optional reason */}
          {isEditing && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5D6D62] mb-1.5">
                Reason for Price Change (Optional)
              </label>
              <input
                id="modal-reason-input"
                type="text"
                placeholder="e.g. Supplier milk price increase, new bottle distributor"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FAF8F4] border border-[#DDD7CC] rounded-xl text-xs text-[#1C241E] focus:outline-none focus:ring-2 focus:ring-[#45634D] focus:bg-white transition"
              />
            </div>
          )}

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5D6D62] mb-1.5">
              Optional Note / Supplier Reference
            </label>
            <input
              id="modal-notes-input"
              type="text"
              placeholder="e.g. 50g per bottle, Batch A supplier"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#FAF8F4] border border-[#DDD7CC] rounded-xl text-xs text-[#1C241E] focus:outline-none focus:ring-2 focus:ring-[#45634D] focus:bg-white transition"
            />
          </div>

          {/* Live Preview Box */}
          <div className="bg-[#EEF4EF] border border-[#CAD8CD] rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-[#2E4635] font-semibold">Preview Unit Cost:</span>
            <span className="text-[#1C241E] font-extrabold text-sm font-display">
              {formatCurrency(numPrice, currency.symbol)} <span className="font-normal text-xs text-[#5D6D62]">/ bottle</span>
            </span>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-[#EDE8DE] flex items-center justify-end gap-2">
            <button
              id="cancel-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#F0ECE1] hover:bg-[#E4DFD3] text-[#4E5C53] text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-cost-item-btn"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#45634D] hover:bg-[#3B5542] active:bg-[#324938] text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isEditing ? 'Save Price Changes' : 'Record Cost Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

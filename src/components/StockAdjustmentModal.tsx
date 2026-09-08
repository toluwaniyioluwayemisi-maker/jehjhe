import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Package, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { YoghurtProduct, StockLogEntry } from '../types';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: YoghurtProduct[];
  defaultProductId?: string;
  defaultMode?: 'batch_production' | 'manual_adjustment' | 'damage_loss';
  onSaveLog: (log: Omit<StockLogEntry, 'id' | 'createdAt'>) => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  products,
  defaultProductId,
  defaultMode = 'batch_production',
  onSaveLog,
}) => {
  const [selectedProductId, setSelectedProductId] = useState(defaultProductId || products[0]?.id || 'normal-30cl');
  const [changeType, setChangeType] = useState<'batch_production' | 'manual_adjustment' | 'damage_loss'>(defaultMode);
  const [quantity, setQuantity] = useState<number>(30);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (defaultProductId) setSelectedProductId(defaultProductId);
      setChangeType(defaultMode);
      setQuantity(defaultMode === 'batch_production' ? 30 : 5);
      setDate(new Date().toISOString().slice(0, 10));
      setNotes(defaultMode === 'batch_production' ? 'Fresh production batch' : '');
      setErrorMsg(null);
    }
  }, [isOpen, defaultProductId, defaultMode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const qty = Math.floor(Number(quantity));
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg('Please enter a valid bottle quantity greater than 0.');
      return;
    }

    // Determine final signed quantity
    const finalQuantity = changeType === 'damage_loss' ? -qty : qty;

    onSaveLog({
      date: date || new Date().toISOString().slice(0, 10),
      productId: selectedProductId,
      changeType,
      quantityChange: finalQuantity,
      notes: notes.trim() || (changeType === 'batch_production' ? 'Production batch' : undefined),
    });

    onClose();
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div
      id="stock-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="stock-modal-card"
        className="bg-[#FBF9F4] text-[#1C211E] rounded-2xl w-full max-w-md shadow-2xl border border-[#D9D3C7] overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="bg-[#1E2621] text-[#F9F7F2] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#45634D] flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display">
                {changeType === 'batch_production'
                  ? 'Record Production Batch'
                  : changeType === 'damage_loss'
                  ? 'Record Loss / Damage'
                  : 'Adjust Stock On Hand'}
              </h2>
              <p className="text-xs text-[#A1B0A6]">
                Update inventory count for specific yoghurt size
              </p>
            </div>
          </div>
          <button
            id="close-stock-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A1B0A6] hover:text-white hover:bg-[#2B362F] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-[#FDE8E8] border border-[#F8B4B4] text-[#9B1C1C] rounded-xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Action Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-[#354139] mb-1.5 uppercase tracking-wider">
              Operation Type
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-[#EBE6DC] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setChangeType('batch_production');
                  if (!notes) setNotes('Fresh production batch');
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  changeType === 'batch_production'
                    ? 'bg-[#45634D] text-white shadow-xs'
                    : 'text-[#55635B] hover:text-[#1C211E]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Batch +
              </button>
              <button
                type="button"
                onClick={() => {
                  setChangeType('manual_adjustment');
                  setNotes('Manual inventory count check');
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  changeType === 'manual_adjustment'
                    ? 'bg-[#45634D] text-white shadow-xs'
                    : 'text-[#55635B] hover:text-[#1C211E]'
                }`}
              >
                Add Stock
              </button>
              <button
                type="button"
                onClick={() => {
                  setChangeType('damage_loss');
                  setNotes('Spoiled or damaged bottle');
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  changeType === 'damage_loss'
                    ? 'bg-[#9B1C1C] text-white shadow-xs'
                    : 'text-[#55635B] hover:text-[#1C211E]'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                Loss / Damage
              </button>
            </div>
          </div>

          {/* Product Selector */}
          <div>
            <label className="block text-xs font-bold text-[#354139] mb-1">
              Select Yoghurt Product & Size *
            </label>
            <select
              id="stock-product-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-white text-[#1C211E] px-3 py-2 rounded-xl border border-[#D1CABF] focus:outline-none focus:ring-2 focus:ring-[#45634D] text-xs font-bold cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.productType} — {p.size})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-[#354139] mb-1">
              {changeType === 'damage_loss' ? 'Bottles to Remove *' : 'Bottles Produced / Added *'}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="stock-qty-input"
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="flex-1 bg-white text-[#1C211E] px-3 py-2 rounded-xl border border-[#D1CABF] focus:outline-none focus:ring-2 focus:ring-[#45634D] text-base font-bold text-center"
              />
              <span className="text-xs font-bold text-[#55635B] px-3 py-2 bg-[#EFECE6] rounded-xl border border-[#D9D3C7]">
                Bottles
              </span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-[#697A6F] font-semibold">Quick add:</span>
              {[10, 25, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuantity(preset)}
                  className="px-2 py-0.5 bg-[#FAF8F5] hover:bg-[#EAE5DB] text-[#45634D] font-bold text-[11px] rounded-md border border-[#D9D3C7] cursor-pointer"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-[#354139] mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#45634D]" />
              Date of Production / Adjustment *
            </label>
            <input
              id="stock-date-input"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white text-[#1C211E] px-3 py-2 rounded-xl border border-[#D1CABF] focus:outline-none focus:ring-2 focus:ring-[#45634D] text-xs font-medium"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#354139] mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#45634D]" />
              Batch Notes / Reason
            </label>
            <input
              id="stock-notes-input"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Morning batch #085, or weekly fridge audit"
              className="w-full bg-white text-[#1C211E] px-3 py-2 rounded-xl border border-[#D1CABF] focus:outline-none focus:ring-2 focus:ring-[#45634D] text-xs font-medium"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E3D8]">
            <button
              id="cancel-stock-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#EDE9E1] hover:bg-[#DDD6CA] text-[#424F46] font-semibold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-stock-log-btn"
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer ${
                changeType === 'damage_loss'
                  ? 'bg-[#9B1C1C] hover:bg-[#771D1D]'
                  : 'bg-[#45634D] hover:bg-[#344E3B]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {changeType === 'batch_production'
                ? 'Record Production'
                : changeType === 'damage_loss'
                ? 'Deduct Damaged Bottles'
                : 'Save Stock Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

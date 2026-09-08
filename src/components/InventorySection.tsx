import React, { useState } from 'react';
import {
  Package,
  Plus,
  Minus,
  Calendar,
  History,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  TrendingUp,
  Layers,
  Milk,
} from 'lucide-react';
import { InventoryStockRecord, StockLogEntry, YoghurtProduct } from '../types';
import { StockAdjustmentModal } from './StockAdjustmentModal';

interface InventorySectionProps {
  inventory: InventoryStockRecord[];
  stockLogs: StockLogEntry[];
  products: YoghurtProduct[];
  onAddStockLog: (log: Omit<StockLogEntry, 'id' | 'createdAt'>) => void;
  onDeleteStockLog: (logId: string) => void;
  onDirectStockUpdate: (productId: string, newStock: number) => void;
}

export const InventorySection: React.FC<InventorySectionProps> = ({
  inventory = [],
  stockLogs = [],
  products = [],
  onAddStockLog,
  onDeleteStockLog,
  onDirectStockUpdate,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('normal-30cl');
  const [modalMode, setModalMode] = useState<'batch_production' | 'manual_adjustment' | 'damage_loss'>('batch_production');
  const [editingDirectId, setEditingDirectId] = useState<string | null>(null);
  const [directInputValue, setDirectInputValue] = useState<string>('');
  const [deleteConfirmLogId, setDeleteConfirmLogId] = useState<string | null>(null);

  const safeInventory = Array.isArray(inventory) ? inventory : [];
  const safeStockLogs = Array.isArray(stockLogs) ? stockLogs : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const totalStockAll = safeInventory.reduce((sum, item) => sum + (Number(item.currentStock) || 0), 0);

  const openLogModal = (productId: string, mode: 'batch_production' | 'manual_adjustment' | 'damage_loss') => {
    setSelectedProductId(productId);
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleStartDirectEdit = (item: InventoryStockRecord) => {
    setEditingDirectId(item.productId);
    setDirectInputValue(String(item.currentStock));
  };

  const handleSaveDirectEdit = (productId: string) => {
    const val = parseInt(directInputValue);
    if (!isNaN(val) && val >= 0) {
      onDirectStockUpdate(productId, val);
    }
    setEditingDirectId(null);
  };

  return (
    <div id="inventory-section-container" className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DDD6CA] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#EAEFEA] text-[#45634D]">
                <Package className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#1C211E] font-display">
                Inventory & Stock Records
              </h2>
            </div>
            <p className="text-xs text-[#697A6F] mt-0.5">
              Live on-hand bottle quantities for Normal Yoghurt (30cl, 50cl) & Greek Yoghurt (500ml)
            </p>
          </div>

          <button
            id="record-production-batch-btn"
            onClick={() => openLogModal(products[0]?.id || 'normal-30cl', 'batch_production')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#45634D] hover:bg-[#344E3B] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Production Batch
          </button>
        </div>

        {/* Aggregate Stats */}
        <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-[#55635B]">
            <span className="font-bold text-[#1C211E]">{totalStockAll}</span> Total Bottles In Stock
          </div>
          <span className="text-[#D1CABF]">•</span>
          <div className="flex items-center gap-1.5 text-[#55635B]">
            <span>3 Active Products & Sizes</span>
          </div>
        </div>
      </div>

      {/* 3 Product Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {safeProducts.map((prod) => {
          const stockRecord = safeInventory.find((inv) => inv.productId === prod.id) || {
            productId: prod.id,
            productName: prod.name,
            productType: prod.productType,
            size: prod.size,
            currentStock: 0,
            lastUpdated: new Date().toISOString(),
          };

          const isNormal = prod.productType === 'Normal Yoghurt';
          const isDirectEditing = editingDirectId === prod.id;

          return (
            <div
              key={prod.id}
              id={`inventory-card-${prod.id}`}
              className="bg-white rounded-2xl p-4 sm:p-4.5 border border-[#DDD6CA] shadow-2xs flex flex-col justify-between hover:border-[#45634D] transition"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#F0EBE1] text-[#45634D] uppercase tracking-wider text-[10px]">
                        {prod.productType}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#1E2621] text-[#F9F7F2] text-[10px]">
                        {prod.size}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-[#1C211E] mt-1 font-display">
                      {prod.name}
                    </h3>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#DDD6CA] flex items-center justify-center text-[#45634D]">
                    <Milk className="w-4 h-4" />
                  </div>
                </div>

                {/* Main Stock Display */}
                <div className="my-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-[#697A6F] block uppercase tracking-wider">
                      Current Stock
                    </span>
                    {isDirectEditing ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="number"
                          min="0"
                          value={directInputValue}
                          onChange={(e) => setDirectInputValue(e.target.value)}
                          className="w-20 px-2 py-1 bg-white border border-[#45634D] rounded-lg text-base font-bold text-[#1C211E] focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveDirectEdit(prod.id)}
                          className="px-2 py-1 bg-[#45634D] text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-extrabold text-[#1C211E]">
                          {stockRecord.currentStock}
                        </span>
                        <span className="text-xs font-bold text-[#55635B]">bottles</span>
                      </div>
                    )}
                  </div>

                  {!isDirectEditing && (
                    <button
                      onClick={() => handleStartDirectEdit(stockRecord)}
                      className="text-[11px] text-[#45634D] font-bold underline hover:text-[#344E3B] cursor-pointer"
                      title="Direct count edit"
                    >
                      Set count
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons for this product */}
              <div className="space-y-2 pt-2 border-t border-[#F0EBE1]">
                <button
                  id={`batch-btn-${prod.id}`}
                  onClick={() => openLogModal(prod.id, 'batch_production')}
                  className="w-full py-2 px-3 rounded-xl bg-[#45634D] hover:bg-[#344E3B] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Add Production Batch
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => openLogModal(prod.id, 'manual_adjustment')}
                    className="py-1.5 px-2 rounded-lg bg-[#FAF8F5] hover:bg-[#EAE5DB] text-[#424F46] font-semibold text-[11px] border border-[#DDD6CA] transition cursor-pointer"
                  >
                    Adjust Count
                  </button>
                  <button
                    onClick={() => openLogModal(prod.id, 'damage_loss')}
                    className="py-1.5 px-2 rounded-lg bg-[#FAF8F5] hover:bg-[#FDE8E8] text-[#9B1C1C] font-semibold text-[11px] border border-[#DDD6CA] transition cursor-pointer"
                  >
                    - Loss / Damage
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock History & Production Logs */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DDD6CA] shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#45634D]" />
            <h3 className="font-bold text-sm text-[#1C211E] font-display">
              Production & Inventory Log History
            </h3>
          </div>
          <span className="text-xs text-[#697A6F]">
            {safeStockLogs.length} logged event{safeStockLogs.length === 1 ? '' : 's'}
          </span>
        </div>

        {safeStockLogs.length === 0 ? (
          <p className="text-xs text-[#697A6F] text-center py-6">
            No stock logs recorded yet. Use the buttons above to log batches or adjustments.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E3D8] text-[#697A6F] font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-2 pl-1">Date</th>
                  <th className="pb-2">Product & Size</th>
                  <th className="pb-2">Event Type</th>
                  <th className="pb-2 text-right">Quantity Change</th>
                  <th className="pb-2 pl-3">Notes</th>
                  <th className="pb-2 pr-1 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE1]">
                {safeStockLogs.map((log) => {
                  const prod = safeProducts.find((p) => p.id === log.productId);
                  const isPositive = log.quantityChange > 0;

                  return (
                    <tr key={log.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-2.5 pl-1 font-medium text-[#55635B] whitespace-nowrap">
                        {log.date}
                      </td>
                      <td className="py-2.5 font-bold text-[#1C211E]">
                        {prod ? prod.name : log.productId}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            log.changeType === 'batch_production'
                              ? 'bg-[#E8EFEA] text-[#2F4535]'
                              : log.changeType === 'damage_loss'
                              ? 'bg-[#FDE8E8] text-[#9B1C1C]'
                              : 'bg-[#F0EBE1] text-[#424F46]'
                          }`}
                        >
                          {log.changeType === 'batch_production'
                            ? 'Batch Production'
                            : log.changeType === 'damage_loss'
                            ? 'Loss / Spoilage'
                            : 'Manual Adjustment'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-extrabold">
                        <span
                          className={
                            isPositive ? 'text-[#2F4535]' : 'text-[#9B1C1C]'
                          }
                        >
                          {isPositive ? `+${log.quantityChange}` : log.quantityChange} bottles
                        </span>
                      </td>
                      <td className="py-2.5 pl-3 text-[#697A6F] text-[11px]">
                        {log.notes || '—'}
                      </td>
                      <td className="py-2.5 pr-1 text-right">
                        <button
                          id={`delete-stock-log-${log.id}-btn`}
                          onClick={() => setDeleteConfirmLogId(log.id)}
                          className="p-1 text-[#9B1C1C] hover:bg-[#FDE8E8] rounded transition cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        products={products}
        defaultProductId={selectedProductId}
        defaultMode={modalMode}
        onSaveLog={onAddStockLog}
      />

      {/* Delete Stock Log Confirmation Modal */}
      {deleteConfirmLogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div
            id="delete-stock-log-modal"
            className="bg-white rounded-2xl border border-rose-200 p-5 w-full max-w-sm shadow-xl space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1C211E]">Delete Stock Log Entry?</h4>
                <p className="text-xs text-[#697A6F] mt-0.5">
                  Are you sure you want to permanently remove this inventory adjustment record?
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0EBE1] flex items-center justify-end gap-2">
              <button
                id="cancel-delete-stock-log-btn"
                onClick={() => setDeleteConfirmLogId(null)}
                className="px-3.5 py-2 rounded-xl bg-[#F4EFE6] hover:bg-[#EAE2D5] text-[#55635B] text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-stock-log-btn"
                onClick={() => {
                  onDeleteStockLog(deleteConfirmLogId);
                  setDeleteConfirmLogId(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Yes, Delete Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

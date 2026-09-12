import React, { useState } from 'react';
import { CostItem, CurrencyConfig, YoghurtProduct, STANDARD_COST_ITEMS } from '../types';
import { formatCurrency, calculateProductCost } from '../utils/storage';
import {
  Edit3,
  Trash2,
  Search,
  AlertCircle,
  Clock,
  PlusCircle,
  Check,
  X,
  History,
  Tag,
  Plus,
} from 'lucide-react';

interface IngredientListProps {
  product: YoghurtProduct;
  costItems: CostItem[];
  currency: CurrencyConfig;
  onEditCostItem: (item: CostItem) => void;
  onQuickUpdatePrice: (itemId: string, newPrice: number, changeReason?: string) => void;
  onDeleteCostItem: (itemId: string) => void;
  onOpenAddModal: (prefillName?: string) => void;
  onViewPriceHistory: (item: CostItem) => void;
}

export const IngredientList: React.FC<IngredientListProps> = ({
  product,
  costItems = [],
  currency,
  onEditCostItem,
  onQuickUpdatePrice,
  onDeleteCostItem,
  onOpenAddModal,
  onViewPriceHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Inline price quick-edit state
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlinePriceInput, setInlinePriceInput] = useState<string>('');
  const [inlineReasonInput, setInlineReasonInput] = useState<string>('');

  const safeCostItems = Array.isArray(costItems) ? costItems : [];
  const productCostItems = product ? safeCostItems.filter((i) => i.productId === product.id) : [];
  const totalCost = product ? calculateProductCost(product.id, safeCostItems) : 0;

  if (!product) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center border border-[#E8E2D7] text-[#55635B]">
        No service or product selected. Please select or create a service from the selector above.
      </div>
    );
  }

  const filteredItems = productCostItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Find standard items not yet added to this product (if any)
  const existingNames = new Set(productCostItems.map((i) => i.name.toLowerCase()));
  const missingStandardItems = STANDARD_COST_ITEMS.filter(
    (name) => !existingNames.has(name.toLowerCase())
  );

  const startInlineEdit = (item: CostItem) => {
    setInlineEditingId(item.id);
    setInlinePriceInput(item.unitPricePerBottle.toString());
    setInlineReasonInput('');
  };

  const cancelInlineEdit = () => {
    setInlineEditingId(null);
    setInlinePriceInput('');
    setInlineReasonInput('');
  };

  const saveInlineEdit = (itemId: string) => {
    const num = parseFloat(inlinePriceInput);
    if (isNaN(num) || num < 0) {
      alert('Please enter a valid unit price (e.g. 50 or 120.50)');
      return;
    }
    onQuickUpdatePrice(itemId, num, inlineReasonInput.trim() || 'Unit price updated');
    cancelInlineEdit();
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header with Search & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="text-base font-bold text-[#1C241E] flex items-center gap-2 font-display">
            <span>Cost & Ingredients Breakdown</span>
            <span className="px-2.5 py-0.5 bg-[#E2EDE5] text-[#2E4635] text-xs font-bold rounded-full">
              {productCostItems.length} Items
            </span>
          </h3>
          <p className="text-xs text-[#5D6D62] mt-0.5">
            Unit cost per single bottle for {product.name}
          </p>
        </div>

        {/* Search Bar */}
        {productCostItems.length > 0 && (
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-[#7E8E84] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="cost-search-input"
              type="text"
              placeholder="Search cost items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white border border-[#E2DDD3] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#45634D] focus:border-[#45634D] placeholder-[#8E9C92] text-[#1C241E]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E9C92] hover:text-[#2A332D] text-xs p-1"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Missing standard items quick-adder pills (if any standard cost item was deleted or missing) */}
      {missingStandardItems.length > 0 && (
        <div className="bg-[#FAF8F4] border border-[#E8E3D8] rounded-xl p-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5D6D62] mb-1.5 flex items-center gap-1.5">
            <span>Standard Cost Items Available to Add:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missingStandardItems.map((name) => (
              <button
                key={name}
                id={`add-standard-pill-${name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onOpenAddModal(name)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#EEF4EF] text-[#2E4635] border border-[#D5DDD7] hover:border-[#45634D] rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#45634D]" />
                <span>{name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {productCostItems.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-[#DDD7CC] rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#EEF4EF] text-[#45634D] flex items-center justify-center mx-auto mb-3">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[#1C241E]">No cost items recorded yet</h4>
          <p className="text-xs text-[#5D6D62] max-w-xs mx-auto mt-1 mb-4">
            Add Milk, Sugar, Culture, Energy, Bottle, and other cost items for {product.name}.
          </p>
          <button
            id="empty-add-cost-item-btn"
            onClick={() => onOpenAddModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#45634D] hover:bg-[#3B5542] text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Add First Cost Item
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white border border-[#E2DDD3] rounded-xl p-6 text-center text-xs text-[#637268]">
          No cost items match &quot;{searchTerm}&quot;.
        </div>
      ) : (
        /* Cost Items Cards List */
        <div className="space-y-2.5">
          {filteredItems.map((item, index) => {
            const costShare = totalCost > 0 ? ((item.unitPricePerBottle / totalCost) * 100).toFixed(1) : '0';
            const isDeleting = deletingId === item.id;
            const isInlineEditing = inlineEditingId === item.id;
            const hasHistory = Array.isArray(item.priceHistory) && item.priceHistory.length > 1;

            return (
              <div
                key={item.id}
                id={`cost-card-${item.id}`}
                className={`bg-white border transition-all duration-150 rounded-xl p-4 shadow-2xs group ${
                  isInlineEditing
                    ? 'border-[#45634D] ring-2 ring-[#45634D]/20 bg-[#FAF9F6]'
                    : 'border-[#E2DDD3] hover:border-[#BAC9BE]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Item details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#8E9C92] font-mono w-5">
                        #{index + 1}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-[#1C241E] tracking-tight truncate font-display">
                        {item.name}
                      </h4>
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-[#F0EFEA] text-[#4E5C53] rounded-md">
                        {costShare}% of bottle cost
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-[#5D6D62] mt-1 line-clamp-2 pl-7">
                        {item.notes}
                      </p>
                    )}

                    {/* Progress bar of bottle cost contribution */}
                    <div className="mt-2.5 pl-7 pr-2">
                      <div className="w-full bg-[#EAE6DD] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#45634D] h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(2, Number(costShare)))}%` }}
                        />
                      </div>
                    </div>

                    {/* Timestamp & History link */}
                    <div className="flex items-center gap-3 text-[11px] text-[#7A8A80] mt-2 pl-7 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#7A8A80]" />
                        <span>Updated: {formatDate(item.lastUpdated)}</span>
                      </div>

                      <button
                        onClick={() => onViewPriceHistory(item)}
                        className="inline-flex items-center gap-1 text-[#45634D] hover:text-[#2E4635] hover:underline font-semibold cursor-pointer"
                        title="View Historical Price Changes"
                      >
                        <History className="w-3 h-3" />
                        <span>{hasHistory ? `${item.priceHistory?.length} price records` : 'Price log'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right: Unit Price & Actions */}
                  <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-[#6D7D73]">
                        Unit Price
                      </div>
                      <div className="text-base sm:text-lg font-extrabold text-[#1C241E] tracking-tight font-display">
                        {formatCurrency(item.unitPricePerBottle, currency.symbol)}
                      </div>
                      <div className="text-[10px] text-[#637268] font-medium">
                        for 1 bottle
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 mt-3">
                      {/* Inline Quick Price Edit Button */}
                      <button
                        id={`quick-edit-price-btn-${item.id}`}
                        onClick={() => {
                          if (isInlineEditing) {
                            cancelInlineEdit();
                          } else {
                            startInlineEdit(item);
                          }
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                          isInlineEditing
                            ? 'bg-[#45634D] text-white border-[#45634D]'
                            : 'bg-[#FAF8F4] hover:bg-[#EEF4EF] text-[#2E4635] border-[#D5DDD7]'
                        }`}
                        title="Quick edit unit price"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isInlineEditing ? 'Editing' : 'Edit Price'}</span>
                      </button>

                      {/* Full modal edit button */}
                      <button
                        id={`edit-item-modal-btn-${item.id}`}
                        onClick={() => onEditCostItem(item)}
                        className="p-1.5 text-[#5D6D62] hover:text-[#1C241E] hover:bg-[#FAF8F4] rounded-lg transition cursor-pointer border border-transparent hover:border-[#D5DDD7]"
                        title="Full item details & rename"
                      >
                        <Tag className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        id={`delete-cost-item-btn-${item.id}`}
                        onClick={() => setDeletingId(item.id)}
                        className="p-1.5 text-[#8E9C92] hover:text-[#A83232] hover:bg-[#FBEAEA] rounded-lg transition cursor-pointer"
                        title="Delete cost item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Quick Price Editor Form */}
                {isInlineEditing && (
                  <div className="mt-3 pt-3 border-t border-[#D5DDD7] bg-[#EEF4EF] p-3 rounded-xl animate-fadeIn">
                    <div className="text-xs font-bold text-[#2E4635] mb-2 flex items-center justify-between">
                      <span>Update Unit Price for 1 {product.size} Bottle</span>
                      <span className="text-[11px] font-normal text-[#5D6D62]">
                        Previous: {formatCurrency(item.unitPricePerBottle, currency.symbol)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-[#5D6D62]">
                          {currency.symbol}
                        </span>
                        <input
                          id={`inline-price-input-${item.id}`}
                          type="number"
                          step="any"
                          min="0"
                          autoFocus
                          placeholder="0.00"
                          value={inlinePriceInput}
                          onChange={(e) => setInlinePriceInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveInlineEdit(item.id);
                            if (e.key === 'Escape') cancelInlineEdit();
                          }}
                          className="w-full pl-7 pr-3 py-2 bg-white border border-[#CAD8CD] rounded-lg text-sm font-bold text-[#1C241E] focus:outline-none focus:ring-2 focus:ring-[#45634D]"
                        />
                      </div>

                      <input
                        id={`inline-reason-input-${item.id}`}
                        type="text"
                        placeholder="Reason for change (optional, e.g. supplier hike)"
                        value={inlineReasonInput}
                        onChange={(e) => setInlineReasonInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveInlineEdit(item.id);
                          if (e.key === 'Escape') cancelInlineEdit();
                        }}
                        className="w-full px-3 py-2 bg-white border border-[#CAD8CD] rounded-lg text-xs text-[#1C241E] focus:outline-none focus:ring-2 focus:ring-[#45634D]"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-2.5">
                      <button
                        onClick={cancelInlineEdit}
                        className="px-3 py-1.5 bg-white hover:bg-[#FAF8F4] text-[#5D6D62] text-xs font-semibold rounded-lg border border-[#CAD8CD] transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        id={`save-inline-price-btn-${item.id}`}
                        onClick={() => saveInlineEdit(item.id)}
                        className="px-3.5 py-1.5 bg-[#45634D] hover:bg-[#3B5542] text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Save New Price</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm Delete Banner */}
                {isDeleting && (
                  <div className="mt-3 pt-3 border-t border-[#F2C5C5] bg-[#FDF2F2] p-2.5 rounded-lg flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#8A2525]">
                      <AlertCircle className="w-4 h-4 text-[#A83232] flex-shrink-0" />
                      <span>Delete &quot;{item.name}&quot; from {product.size}?</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        id={`confirm-delete-btn-${item.id}`}
                        onClick={() => {
                          onDeleteCostItem(item.id);
                          setDeletingId(null);
                        }}
                        className="px-2.5 py-1 bg-[#A83232] hover:bg-[#8A2525] text-white rounded-md text-xs font-bold transition cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        id={`cancel-delete-btn-${item.id}`}
                        onClick={() => setDeletingId(null)}
                        className="px-2 py-1 bg-white hover:bg-[#FAF8F4] text-[#4E5C53] border border-[#E2DDD3] rounded-md text-xs transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
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

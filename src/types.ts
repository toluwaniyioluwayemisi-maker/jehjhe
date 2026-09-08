export interface YoghurtProduct {
  id: string;
  productType: string; // 'Normal Yoghurt' | 'Greek Yoghurt'
  size: string;        // '30cl' | '50cl' | '500ml'
  name: string;        // 'Normal Yoghurt — 30cl'
  category: 'yoghurt' | 'pastries';
  description?: string;
  sellingPrice?: number; // Selling price per bottle (e.g. 700, 1000, 1800)
}

export interface PriceHistoryRecord {
  price: number;
  effectiveDate: string; // ISO date string
  reason?: string;
}

export interface CostItem {
  id: string;
  productId: string;           // Associated yoghurt product/size ID ('normal-30cl', 'normal-50cl', 'greek-500ml')
  name: string;                // Name of cost item (e.g. Milk, Sugar, Culture / Starter, Energy, Water, Bottle, Equipment Depreciation, Labour, Rent, Miscellaneous)
  unitPricePerBottle: number;  // Cost for ONE single bottle
  notes?: string;
  lastUpdated: string;         // ISO date string
  priceHistory?: PriceHistoryRecord[]; // Historical price points
}

// Alias for seamless compatibility
export type IngredientCost = CostItem;

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

export const STANDARD_COST_ITEMS: string[] = [
  'Milk',
  'Sugar',
  'Culture / Starter',
  'Energy',
  'Water',
  'Bottle',
  'Equipment Depreciation',
  'Labour',
  'Rent',
  'Miscellaneous',
];

// ============================================================================
// Orders & Invoice Records
// ============================================================================

export interface OrderItem {
  productId: string; // 'normal-30cl' | 'normal-50cl' | 'greek-500ml'
  productName: string; // e.g. 'Normal Yoghurt — 30cl'
  productType: string; // 'Normal Yoghurt' | 'Greek Yoghurt'
  size: string; // '30cl' | '50cl' | '500ml'
  quantity: number;
  unitPrice?: number; // Selling price per bottle at time order was recorded
  unitCost?: number;  // Unit production cost per bottle at time order was recorded
}

export interface OrderRecord {
  id: string;
  referenceNumber: string; // Order / Invoice reference (e.g. "INV-001", "ORD-2026-089")
  date: string; // YYYY-MM-DD
  customerName?: string; // Optional identifying customer or outlet name
  customerPhone?: string;
  notes?: string; // Additional identification or delivery notes
  items: OrderItem[];
  createdAt: string; // ISO timestamp
  paymentStatus?: 'paid' | 'pending' | 'partial';
  amountPaid?: number;
  workerName?: string;
  workerStatus?: 'pending' | 'completed';
}

// Itemized Financial Computation Result
export interface ItemFinancials {
  productId: string;
  productName: string;
  productType: string;
  size: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  revenue: number;
  cost: number;
  profit: number;
  marginPercent: number;
  isSellingPriceMissing: boolean;
  isCostMissing: boolean;
}

// Complete Order Financial Breakdown
export interface OrderFinancialSummary {
  orderId: string;
  referenceNumber: string;
  date: string;
  customerName?: string;
  totalQuantity: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  marginPercent: number;
  items: ItemFinancials[];
  hasMissingSellingPrice: boolean;
  hasMissingCost: boolean;
  missingItemsNotice?: string;
}

// ============================================================================
// Inventory & Stock Records
// ============================================================================

export interface InventoryStockRecord {
  productId: string; // 'normal-30cl' | 'normal-50cl' | 'greek-500ml'
  productName: string;
  productType: string;
  size: string;
  currentStock: number; // Bottles on hand
  lastUpdated: string; // ISO timestamp
}

export interface StockLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  productId: string;
  changeType: 'batch_production' | 'manual_adjustment' | 'damage_loss';
  quantityChange: number; // e.g. +50 bottles produced or -2 bottles damaged
  notes?: string;
  createdAt: string; // ISO timestamp
}

// ============================================================================
// Miscellaneous Business Expenses
// ============================================================================

export interface MiscellaneousExpense {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string; // ISO timestamp
}

// ============================================================================
// Cumulative Order & Financial Summaries
// ============================================================================

export interface ProductCumulativeBreakdown {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
  marginPercent: number;
  hasMissingPrices: boolean;
}

export interface CumulativeStats {
  totalOrders: number;
  totalBottlesSold: number;
  totalRevenue: number;
  totalProductionCost: number; // Direct production cost (COGS)
  totalCost: number;           // Kept for backward compatibility (= totalProductionCost)
  totalMiscellaneousExpenses: number; // Separate miscellaneous overhead / OPEX
  productionProfit: number;    // Total Revenue - Total Production Cost (Gross Profit)
  totalProfit: number;         // Kept for backward compatibility (= productionProfit)
  netBusinessProfit: number;   // Total Revenue - Total Production Cost - Total Miscellaneous Expenses
  overallMarginPercent: number;// (Production Profit / Total Revenue) * 100
  netBusinessMarginPercent: number; // (Net Business Profit / Total Revenue) * 100
  hasMissingPrices: boolean;
  byProductType: {
    normalYoghurt: number;
    greekYoghurt: number;
  };
  bySize: {
    '30cl': number;
    '50cl': number;
    '500ml': number;
  };
  byProduct: Record<string, ProductCumulativeBreakdown>;
}

// ============================================================================
// Cloud Synchronization & Persistence Status
// ============================================================================

export type CloudConnectionState = 'not_configured' | 'connecting' | 'connected' | 'offline' | 'error';

export interface CloudSyncInfo {
  state: CloudConnectionState;
  isConfigured: boolean;
  userEmail?: string | null;
  lastSyncedAt?: string | null;
  errorMessage?: string | null;
  missingEnvVars?: string[];
}




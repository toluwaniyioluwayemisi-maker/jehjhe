import {
  YoghurtProduct,
  CostItem,
  CurrencyConfig,
  OrderRecord,
  InventoryStockRecord,
  StockLogEntry,
  MiscellaneousExpense,
  CumulativeStats,
  OrderFinancialSummary,
  ItemFinancials,
  ProductCumulativeBreakdown,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_INGREDIENTS,
  DEFAULT_CURRENCIES,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_STOCK_LOGS,
  INITIAL_MISCELLANEOUS_EXPENSES,
} from '../data/initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'butchmaster_products_v2',
  COST_ITEMS: 'butchmaster_cost_items_v2',
  CURRENCY: 'butchmaster_currency_v2',
  ORDERS: 'butchmaster_orders_v2',
  INVENTORY: 'butchmaster_inventory_v2',
  STOCK_LOGS: 'butchmaster_stock_logs_v2',
  MISC_EXPENSES: 'butchmaster_misc_expenses_v2',
  // legacy keys for fallback
  LEGACY_INGREDIENTS: 'butchmaster_ingredients_v1',
};

export function getStoredProducts(): YoghurtProduct[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.map((p: YoghurtProduct) => ({
          ...p,
          sellingPrice: typeof p.sellingPrice === 'number' && p.sellingPrice >= 0 ? p.sellingPrice : 0,
        }));
      }
    }
  } catch (e) {
    console.error('Error reading products from storage:', e);
  }
  return [];
}

export function saveProducts(products: YoghurtProduct[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving products to storage:', e);
  }
}

export function updateProductSellingPrice(
  products: YoghurtProduct[],
  productId: string,
  newSellingPrice: number
): YoghurtProduct[] {
  const updated = products.map((p) =>
    p.id === productId ? { ...p, sellingPrice: Math.max(0, newSellingPrice) } : p
  );
  saveProducts(updated);
  return updated;
}

export function getStoredCostItems(): CostItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COST_ITEMS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading cost items from storage:', e);
  }
  return [];
}

export function saveCostItems(costItems: CostItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COST_ITEMS, JSON.stringify(costItems));
  } catch (e) {
    console.error('Error saving cost items to storage:', e);
  }
}

// Backward compatibility alias
export const getStoredIngredients = getStoredCostItems;
export const saveIngredients = saveCostItems;

export function getStoredCurrency(): CurrencyConfig {
  try {
    const code = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    if (code) {
      const found = DEFAULT_CURRENCIES.find((c) => c.code === code);
      if (found) return found;
    }
  } catch (e) {
    console.error('Error reading currency from storage:', e);
  }
  return DEFAULT_CURRENCIES[0]; // Default NGN (₦)
}

export function saveCurrency(code: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, code);
  } catch (e) {
    console.error('Error saving currency to storage:', e);
  }
}

// ============================================================================
// Orders Storage
// ============================================================================

export function getStoredOrders(): OrderRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading orders from storage:', e);
  }
  return [];
}

export function saveOrders(orders: OrderRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving orders to storage:', e);
  }
}

// ============================================================================
// Inventory & Stock Storage
// ============================================================================

export function getStoredInventory(): InventoryStockRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading inventory from storage:', e);
  }
  return [];
}

export function saveInventory(inventory: InventoryStockRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  } catch (e) {
    console.error('Error saving inventory to storage:', e);
  }
}

export function getStoredStockLogs(): StockLogEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STOCK_LOGS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stock logs from storage:', e);
  }
  return [];
}

export function saveStockLogs(logs: StockLogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving stock logs to storage:', e);
  }
}

// ============================================================================
// Miscellaneous Expenses Storage
// ============================================================================

export function getStoredMiscellaneousExpenses(): MiscellaneousExpense[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MISC_EXPENSES);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading miscellaneous expenses from storage:', e);
  }
  return [];
}

export function saveMiscellaneousExpenses(expenses: MiscellaneousExpense[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MISC_EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving miscellaneous expenses to storage:', e);
  }
}

export function resetToDefaultData(): {
  products: YoghurtProduct[];
  costItems: CostItem[];
  orders: OrderRecord[];
  inventory: InventoryStockRecord[];
  stockLogs: StockLogEntry[];
  miscellaneousExpenses: MiscellaneousExpense[];
} {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.COST_ITEMS, JSON.stringify(INITIAL_INGREDIENTS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
    localStorage.setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify(INITIAL_STOCK_LOGS));
    localStorage.setItem(STORAGE_KEYS.MISC_EXPENSES, JSON.stringify(INITIAL_MISCELLANEOUS_EXPENSES));
  } catch (e) {
    console.error('Error resetting data:', e);
  }
  return {
    products: INITIAL_PRODUCTS,
    costItems: INITIAL_INGREDIENTS,
    orders: INITIAL_ORDERS,
    inventory: INITIAL_INVENTORY,
    stockLogs: INITIAL_STOCK_LOGS,
    miscellaneousExpenses: INITIAL_MISCELLANEOUS_EXPENSES,
  };
}

export function formatCurrency(amount: number, symbol: string = '₦'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol}0.00`;
  }
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Deterministic calculation of total production unit cost for one bottle of a given product.
 */
export function calculateProductCost(productId: string, costItems: CostItem[] = []): number {
  if (!Array.isArray(costItems)) return 0;
  return costItems
    .filter((item) => item.productId === productId)
    .reduce((sum, item) => {
      const val = Number(item.unitPricePerBottle);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
}

/**
 * Creates an updated price record with historical price logging.
 */
export function updateCostItemWithHistory(
  existingItem: CostItem,
  newUnitPrice: number,
  notes?: string,
  changeReason?: string
): CostItem {
  const previousPrice = Number(existingItem.unitPricePerBottle) || 0;
  const priceChanged = previousPrice !== newUnitPrice;
  const history = Array.isArray(existingItem.priceHistory) ? [...existingItem.priceHistory] : [];

  if (priceChanged) {
    history.unshift({
      price: newUnitPrice,
      effectiveDate: new Date().toISOString(),
      reason: changeReason || 'Price updated by owner',
    });
  }

  return {
    ...existingItem,
    unitPricePerBottle: newUnitPrice,
    notes: notes !== undefined ? notes : existingItem.notes,
    lastUpdated: new Date().toISOString(),
    priceHistory: history,
  };
}

/**
 * Deterministic calculation of complete financial details for an individual order.
 * - Revenue: Quantity * Unit Selling Price
 * - Cost: Quantity * Unit Production Cost (snapshotted at order creation time)
 * - Profit: Total Revenue - Total Production Cost
 * - Margin %: (Profit / Revenue) * 100
 * Handles missing prices safely without producing erroneous or misleading numbers.
 */
export function calculateOrderFinancials(
  order: OrderRecord,
  products: YoghurtProduct[] = [],
  costItems: CostItem[] = []
): OrderFinancialSummary {
  let totalQuantity = 0;
  let totalRevenue = 0;
  let totalCost = 0;
  let hasMissingSellingPrice = false;
  let hasMissingCost = false;

  const safeProducts = Array.isArray(products) ? products : [];
  const safeCostItems = Array.isArray(costItems) ? costItems : [];
  const safeItems = Array.isArray(order?.items) ? order.items : [];

  const itemFinancials: ItemFinancials[] = safeItems.map((item) => {
    const qty = Number(item.quantity) || 0;
    totalQuantity += qty;

    const matchedProduct = safeProducts.find((p) => p.id === item.productId);

    // 1. Effective Unit Selling Price: Prefer item's snapshotted price, fallback to product configured price
    let effectiveUnitPrice = 0;
    if (typeof item.unitPrice === 'number') {
      effectiveUnitPrice = item.unitPrice;
    } else if (matchedProduct && typeof matchedProduct.sellingPrice === 'number') {
      effectiveUnitPrice = matchedProduct.sellingPrice;
    }

    // 2. Effective Unit Production Cost: Prefer item's snapshotted cost, fallback to current cost items sum
    let effectiveUnitCost = 0;
    if (typeof item.unitCost === 'number') {
      effectiveUnitCost = item.unitCost;
    } else {
      effectiveUnitCost = calculateProductCost(item.productId, safeCostItems);
    }

    const isSellingPriceMissing = effectiveUnitPrice <= 0 && qty > 0;
    const isCostMissing = effectiveUnitCost <= 0 && qty > 0;

    if (isSellingPriceMissing) hasMissingSellingPrice = true;
    if (isCostMissing) hasMissingCost = true;

    // Item totals
    const revenue = qty * effectiveUnitPrice;
    const cost = qty * effectiveUnitCost;
    const profit = revenue - cost;
    const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;

    totalRevenue += revenue;
    totalCost += cost;

    return {
      productId: item.productId,
      productName: item.productName || matchedProduct?.name || 'Yoghurt',
      productType: item.productType || matchedProduct?.productType || 'Yoghurt',
      size: item.size || matchedProduct?.size || '',
      quantity: qty,
      unitPrice: effectiveUnitPrice,
      unitCost: effectiveUnitCost,
      revenue,
      cost,
      profit,
      marginPercent,
      isSellingPriceMissing,
      isCostMissing,
    };
  });

  const totalProfit = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  let missingItemsNotice: string | undefined = undefined;
  if (hasMissingSellingPrice && hasMissingCost) {
    missingItemsNotice = 'Selling prices and production costs are not fully configured for items in this order.';
  } else if (hasMissingSellingPrice) {
    missingItemsNotice = 'Selling price is missing or not configured for some items.';
  } else if (hasMissingCost) {
    missingItemsNotice = 'Production cost breakdown has not been set up for some items.';
  }

  return {
    orderId: order?.id || '',
    referenceNumber: order?.referenceNumber || '',
    date: order?.date || '',
    customerName: order?.customerName,
    totalQuantity,
    totalRevenue,
    totalCost,
    totalProfit,
    marginPercent,
    items: itemFinancials,
    hasMissingSellingPrice,
    hasMissingCost,
    missingItemsNotice,
  };
}

/**
 * Computes cumulative deterministic statistics and financial summaries from recorded orders and miscellaneous expenses.
 */
export function calculateCumulativeStats(
  orders: OrderRecord[] = [],
  products: YoghurtProduct[] = [],
  costItems: CostItem[] = [],
  miscellaneousExpenses: MiscellaneousExpense[] = []
): CumulativeStats {
  let totalBottlesSold = 0;
  let totalRevenue = 0;
  let totalProductionCost = 0;
  let hasMissingPrices = false;

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCostItems = Array.isArray(costItems) ? costItems : [];
  const safeExpenses = Array.isArray(miscellaneousExpenses) ? miscellaneousExpenses : [];

  const byProductType = {
    normalYoghurt: 0,
    greekYoghurt: 0,
  };

  const bySize = {
    '30cl': 0,
    '50cl': 0,
    '500ml': 0,
  };

  const byProduct: Record<string, ProductCumulativeBreakdown> = {};

  // Initialize breakdown for all known products
  safeProducts.forEach((p) => {
    byProduct[p.id] = {
      productId: p.id,
      productName: p.name,
      quantity: 0,
      revenue: 0,
      cost: 0,
      profit: 0,
      marginPercent: 0,
      hasMissingPrices: false,
    };
  });

  safeOrders.forEach((order) => {
    const fin = calculateOrderFinancials(order, safeProducts, safeCostItems);
    if (fin.hasMissingSellingPrice || fin.hasMissingCost) {
      hasMissingPrices = true;
    }

    fin.items.forEach((item) => {
      const qty = item.quantity;
      totalBottlesSold += qty;
      totalRevenue += item.revenue;
      totalProductionCost += item.cost;

      // Group by Product Type
      const typeLower = (item.productType || '').toLowerCase();
      if (typeLower.includes('greek')) {
        byProductType.greekYoghurt += qty;
      } else {
        byProductType.normalYoghurt += qty;
      }

      // Group by Bottle Size
      const sizeLower = (item.size || '').toLowerCase();
      if (sizeLower.includes('30cl') || sizeLower === '30cl') {
        bySize['30cl'] += qty;
      } else if (sizeLower.includes('50cl') || sizeLower === '50cl') {
        bySize['50cl'] += qty;
      } else if (sizeLower.includes('500') || sizeLower.includes('500ml') || sizeLower === '500ml') {
        bySize['500ml'] += qty;
      }

      // Group by Product ID
      if (!byProduct[item.productId]) {
        byProduct[item.productId] = {
          productId: item.productId,
          productName: item.productName,
          quantity: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
          marginPercent: 0,
          hasMissingPrices: false,
        };
      }

      const prodRecord = byProduct[item.productId];
      prodRecord.quantity += qty;
      prodRecord.revenue += item.revenue;
      prodRecord.cost += item.cost;
      prodRecord.profit = prodRecord.revenue - prodRecord.cost;
      prodRecord.marginPercent =
        prodRecord.revenue > 0 ? (prodRecord.profit / prodRecord.revenue) * 100 : 0;
      if (item.isSellingPriceMissing || item.isCostMissing) {
        prodRecord.hasMissingPrices = true;
      }
    });
  });

  // Calculate separate miscellaneous overhead / OPEX total
  const totalMiscellaneousExpenses = safeExpenses.reduce((sum, exp) => {
    const val = Number(exp.amount);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  // Production Profit = Total Revenue − Production Costs
  const productionProfit = totalRevenue - totalProductionCost;
  const overallMarginPercent = totalRevenue > 0 ? (productionProfit / totalRevenue) * 100 : 0;

  // Net Business Profit = Total Revenue − Production Costs − Miscellaneous Expenses
  const netBusinessProfit = totalRevenue - totalProductionCost - totalMiscellaneousExpenses;
  const netBusinessMarginPercent = totalRevenue > 0 ? (netBusinessProfit / totalRevenue) * 100 : 0;

  return {
    totalOrders: safeOrders.length,
    totalBottlesSold,
    totalRevenue,
    totalProductionCost,
    totalCost: totalProductionCost, // backward compatibility
    totalMiscellaneousExpenses,
    productionProfit,
    totalProfit: productionProfit, // backward compatibility
    netBusinessProfit,
    overallMarginPercent,
    netBusinessMarginPercent,
    hasMissingPrices,
    byProductType,
    bySize,
    byProduct,
  };
}

export function calculateTotalMiscellaneousExpenses(expenses: MiscellaneousExpense[] = []): number {
  if (!Array.isArray(expenses)) return 0;
  return expenses.reduce((sum, item) => {
    const val = Number(item.amount);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
}

export interface BusinessKPIs {
  revenue: number;
  sales: number;
  expenses: number;
  productionCost: number;
  miscExpenses: number;
  profit: number;
  outstandingBalance: number;
  totalCustomers: number;
  totalOrders: number;
  totalProducts: number;
  totalWorkers: number;
  completedJobs: number;
  pendingJobs: number;
  totalBottlesSold: number;
  marginPercent: number;
}

/**
 * Calculates high-level executive dashboard business metrics.
 * When collections are empty, returns deterministic zero/empty metrics.
 */
export function calculateBusinessKPIs(
  orders: OrderRecord[] = [],
  products: YoghurtProduct[] = [],
  costItems: CostItem[] = [],
  expenses: MiscellaneousExpense[] = [],
  stockLogs: StockLogEntry[] = []
): BusinessKPIs {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCostItems = Array.isArray(costItems) ? costItems : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeLogs = Array.isArray(stockLogs) ? stockLogs : [];

  let totalRevenue = 0;
  let totalProductionCost = 0;
  let totalBottlesSold = 0;
  let totalAmountPaid = 0;
  const customerNamesSet = new Set<string>();
  let pendingOrdersCount = 0;
  let completedOrdersCount = 0;

  safeOrders.forEach((order) => {
    if (order.customerName && order.customerName.trim()) {
      customerNamesSet.add(order.customerName.trim().toLowerCase());
    }

    const fin = calculateOrderFinancials(order, safeProducts, safeCostItems);
    totalRevenue += fin.totalRevenue;
    totalProductionCost += fin.totalCost;
    totalBottlesSold += fin.totalQuantity;

    // Payment status
    const isPaid = order.paymentStatus !== 'pending' && order.paymentStatus !== 'partial';
    const paid = typeof order.amountPaid === 'number'
      ? order.amountPaid
      : (isPaid ? fin.totalRevenue : 0);
    totalAmountPaid += Math.max(0, paid);

    if (order.paymentStatus === 'pending' || fin.totalRevenue > paid) {
      pendingOrdersCount++;
    } else {
      completedOrdersCount++;
    }
  });

  const totalMiscExpenses = safeExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const totalExpenses = totalProductionCost + totalMiscExpenses;
  const netProfit = totalRevenue - totalExpenses;
  const outstandingBalance = Math.max(0, totalRevenue - totalAmountPaid);
  const marginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Jobs: batch production logs + order fulfillment
  const completedBatchJobs = safeLogs.filter((l) => l.changeType === 'batch_production').length;
  const completedJobs = completedOrdersCount + completedBatchJobs;
  const pendingJobs = pendingOrdersCount;

  // Active workers count: count unique workers identified in cost items or staff roles
  const workerItems = safeCostItems.filter((i) =>
    i.name.toLowerCase().includes('labour') ||
    i.name.toLowerCase().includes('labor') ||
    i.name.toLowerCase().includes('worker') ||
    i.name.toLowerCase().includes('staff')
  );
  const totalWorkers = workerItems.length > 0 ? workerItems.length : (safeOrders.length > 0 ? 1 : 0);

  return {
    revenue: totalRevenue,
    sales: totalRevenue,
    expenses: totalExpenses,
    productionCost: totalProductionCost,
    miscExpenses: totalMiscExpenses,
    profit: netProfit,
    outstandingBalance,
    totalCustomers: customerNamesSet.size,
    totalOrders: safeOrders.length,
    totalProducts: safeProducts.length,
    totalWorkers,
    completedJobs,
    pendingJobs,
    totalBottlesSold,
    marginPercent,
  };
}


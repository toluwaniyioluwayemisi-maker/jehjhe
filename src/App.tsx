/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  getStoredProducts,
  getStoredCostItems,
  saveCostItems,
  saveProducts,
  getStoredCurrency,
  saveCurrency,
  getStoredOrders,
  saveOrders,
  getStoredInventory,
  saveInventory,
  getStoredStockLogs,
  saveStockLogs,
  getStoredMiscellaneousExpenses,
  saveMiscellaneousExpenses,
  resetToDefaultData,
  updateCostItemWithHistory,
} from './utils/storage';
import {
  getCurrentUser,
  subscribeToAuthState,
  logOutFirebase,
  loadUserDataFromFirestore,
  saveUserProduct,
  saveUserProductsBatch,
  saveUserCostItem,
  deleteUserCostItem,
  saveUserOrder,
  deleteUserOrder,
  saveUserInventoryBatch,
  saveUserStockLog,
  saveUserExpense,
  deleteUserExpense,
  saveUserSettings,
} from './utils/firebase';
import type { User } from 'firebase/auth';
import {
  YoghurtProduct,
  CostItem,
  CurrencyConfig,
  OrderRecord,
  InventoryStockRecord,
  StockLogEntry,
  MiscellaneousExpense,
} from './types';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { ProductSelector } from './components/ProductSelector';
import { CostSummaryCard } from './components/CostSummaryCard';
import { IngredientList } from './components/IngredientList';
import { IngredientModal } from './components/IngredientModal';
import { ProductComparisonView } from './components/ProductComparisonView';
import { PriceHistoryModal } from './components/PriceHistoryModal';
import { OrdersSection } from './components/OrdersSection';
import { InventorySection } from './components/InventorySection';
import { MiscellaneousExpensesSection } from './components/MiscellaneousExpensesSection';
import { AccumulativeRecordsSection } from './components/AccumulativeRecordsSection';
import { SellingPriceModal } from './components/SellingPriceModal';
import { DailySalesTrackerSection } from './components/DailySalesTrackerSection';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { DemoModeSection } from './components/DemoModeSection';
import { AddProductModal } from './components/AddProductModal';
import {
  LayoutDashboard,
  Layers,
  Plus,
  BarChart3,
  Receipt,
  Package,
  LineChart,
  Wallet,
  Tag,
  Calendar,
  Loader2,
  Milk,
  Cloud,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);

  const [products, setProducts] = useState<YoghurtProduct[]>(() => getStoredProducts());
  const [costItems, setCostItems] = useState<CostItem[]>(() => getStoredCostItems());
  const [orders, setOrders] = useState<OrderRecord[]>(() => getStoredOrders());
  const [inventory, setInventory] = useState<InventoryStockRecord[]>(() => getStoredInventory());
  const [stockLogs, setStockLogs] = useState<StockLogEntry[]>(() => getStoredStockLogs());
  const [expenses, setExpenses] = useState<MiscellaneousExpense[]>(() => getStoredMiscellaneousExpenses());
  const [currency, setCurrency] = useState<CurrencyConfig>(() => getStoredCurrency());

  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    const prods = getStoredProducts();
    return prods.length > 0 ? prods[0].id : 'normal-30cl';
  });

  // Navigation Tab: 'dashboard' | 'costs' | 'orders' | 'daily-sales' | 'inventory' | 'expenses' | 'cumulative'
  const [mainTab, setMainTab] = useState<'dashboard' | 'costs' | 'orders' | 'daily-sales' | 'inventory' | 'expenses' | 'cumulative'>('dashboard');

  // Demo Mode State (Isolated client-side sample data)
  const [isDemoModeActive, setIsDemoModeActive] = useState<boolean>(false);

  // Add/Edit Product Modal State
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<YoghurtProduct | null>(null);

  // Sub-view Tab for Costs: 'manage' or 'overview'
  const [costSubTab, setCostSubTab] = useState<'manage' | 'overview'>('manage');

  // Cost Modal State
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [costItemToEdit, setCostItemToEdit] = useState<CostItem | null>(null);
  const [prefillName, setPrefillName] = useState<string | undefined>(undefined);

  // Price History Modal State
  const [historyModalItem, setHistoryModalItem] = useState<CostItem | null>(null);

  // Selling Price Modal State
  const [isSellingPriceModalOpen, setIsSellingPriceModalOpen] = useState(false);
  const [sellingPriceTargetProductId, setSellingPriceTargetProductId] = useState<string | undefined>(undefined);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);

      if (user) {
        setIsDataLoading(true);
        try {
          const userData = await loadUserDataFromFirestore(user.uid);
          setProducts(userData.products);
          setCostItems(userData.costItems);
          setOrders(userData.orders);
          setInventory(userData.inventory);
          setStockLogs(userData.stockLogs);
          setExpenses(userData.miscellaneousExpenses);
          setCurrency(userData.currency);

          // Update local storage backup
          saveProducts(userData.products);
          saveCostItems(userData.costItems);
          saveOrders(userData.orders);
          saveInventory(userData.inventory);
          saveStockLogs(userData.stockLogs);
          saveMiscellaneousExpenses(userData.miscellaneousExpenses);
          saveCurrency(userData.currency.code);

          if (userData.products.length > 0) {
            setSelectedProductId((prev) =>
              userData.products.some((p) => p.id === prev) ? prev : userData.products[0].id
            );
          }
        } catch (err) {
          console.error('Failed to load user workspace from Firestore:', err);
        } finally {
          setIsDataLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Storage Persistence Effects
  useEffect(() => {
    saveCostItems(costItems);
  }, [costItems]);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveInventory(inventory);
  }, [inventory]);

  useEffect(() => {
    saveStockLogs(stockLogs);
  }, [stockLogs]);

  useEffect(() => {
    saveMiscellaneousExpenses(expenses);
  }, [expenses]);

  const handleCurrencyChange = (newCurrency: CurrencyConfig) => {
    setCurrency(newCurrency);
    saveCurrency(newCurrency.code);
    if (currentUser) {
      saveUserSettings(currentUser.uid, newCurrency);
    }
  };

  const handleResetData = () => {
    const defaultData = resetToDefaultData();
    setProducts(defaultData.products);
    setCostItems(defaultData.costItems);
    setOrders(defaultData.orders);
    setInventory(defaultData.inventory);
    setStockLogs(defaultData.stockLogs);
    setExpenses(defaultData.miscellaneousExpenses);
    if (defaultData.products.length > 0) {
      setSelectedProductId(defaultData.products[0].id);
    }
    if (currentUser) {
      saveUserProductsBatch(currentUser.uid, defaultData.products);
      saveUserInventoryBatch(currentUser.uid, defaultData.inventory);
      for (const item of defaultData.costItems) {
        saveUserCostItem(currentUser.uid, item);
      }
    }
  };

  const handleImportData = (data: {
    products: YoghurtProduct[];
    costItems: CostItem[];
    orders?: OrderRecord[];
    inventory?: InventoryStockRecord[];
    stockLogs?: StockLogEntry[];
    miscellaneousExpenses?: MiscellaneousExpense[];
  }) => {
    setProducts(data.products);
    setCostItems(data.costItems);
    saveProducts(data.products);
    saveCostItems(data.costItems);

    if (data.orders) {
      setOrders(data.orders);
      saveOrders(data.orders);
    }
    if (data.inventory) {
      setInventory(data.inventory);
      saveInventory(data.inventory);
    }
    if (data.stockLogs) {
      setStockLogs(data.stockLogs);
      saveStockLogs(data.stockLogs);
    }
    if (data.miscellaneousExpenses) {
      setExpenses(data.miscellaneousExpenses);
      saveMiscellaneousExpenses(data.miscellaneousExpenses);
    }
    if (data.products.length > 0) {
      setSelectedProductId(data.products[0].id);
    }

    if (currentUser) {
      saveUserProductsBatch(currentUser.uid, data.products);
      for (const c of data.costItems) {
        saveUserCostItem(currentUser.uid, c);
      }
      if (data.orders) {
        for (const o of data.orders) {
          saveUserOrder(currentUser.uid, o);
        }
      }
      if (data.inventory) {
        saveUserInventoryBatch(currentUser.uid, data.inventory);
      }
      if (data.stockLogs) {
        for (const l of data.stockLogs) {
          saveUserStockLog(currentUser.uid, l);
        }
      }
      if (data.miscellaneousExpenses) {
        for (const exp of data.miscellaneousExpenses) {
          saveUserExpense(currentUser.uid, exp);
        }
      }
    }
  };

  const handleOpenSellingPrices = (targetProductId?: string) => {
    setSellingPriceTargetProductId(targetProductId || selectedProductId);
    setIsSellingPriceModalOpen(true);
  };

  const handleUpdateSellingPrices = (updatedProducts: YoghurtProduct[]) => {
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    if (currentUser) {
      saveUserProductsBatch(currentUser.uid, updatedProducts);
    }
  };

  const handleSaveProduct = (newProduct: YoghurtProduct) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === newProduct.id);
      if (exists) {
        return prev.map((p) => (p.id === newProduct.id ? newProduct : p));
      }
      return [...prev, newProduct];
    });
    setSelectedProductId(newProduct.id);
    if (currentUser) {
      saveUserProduct(currentUser.uid, newProduct);
    }
  };

  const handleQuickLoadStandardProducts = (standardProducts: YoghurtProduct[]) => {
    setProducts(standardProducts);
    saveProducts(standardProducts);
    if (standardProducts.length > 0) {
      setSelectedProductId(standardProducts[0].id);
    }
    if (currentUser) {
      saveUserProductsBatch(currentUser.uid, standardProducts);
    }
  };

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // ==========================================================================
  // Cost Item Handlers
  // ==========================================================================
  const handleSaveCostItem = (data: {
    id?: string;
    productId: string;
    name: string;
    unitPricePerBottle: number;
    notes?: string;
    changeReason?: string;
  }) => {
    let savedItem: CostItem;
    if (data.id) {
      setCostItems((prev) =>
        prev.map((item) => {
          if (item.id === data.id) {
            savedItem = updateCostItemWithHistory(
              item,
              data.unitPricePerBottle,
              data.notes,
              data.changeReason || 'Updated in cost editor'
            );
            return savedItem;
          }
          return item;
        })
      );
    } else {
      savedItem = {
        id: `cost-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: data.productId,
        name: data.name,
        unitPricePerBottle: data.unitPricePerBottle,
        notes: data.notes,
        lastUpdated: new Date().toISOString(),
        priceHistory: [
          {
            price: data.unitPricePerBottle,
            effectiveDate: new Date().toISOString(),
            reason: data.changeReason || 'Initial cost item setup',
          },
        ],
      };
      setCostItems((prev) => [savedItem, ...prev]);
    }

    if (currentUser && savedItem!) {
      saveUserCostItem(currentUser.uid, savedItem!);
    }
  };

  const handleQuickUpdatePrice = (itemId: string, newPrice: number, changeReason?: string) => {
    let updatedItem: CostItem | undefined;
    setCostItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          updatedItem = updateCostItemWithHistory(item, newPrice, item.notes, changeReason || 'Inline price update');
          return updatedItem;
        }
        return item;
      })
    );
    if (currentUser && updatedItem) {
      saveUserCostItem(currentUser.uid, updatedItem);
    }
  };

  const handleDeleteCostItem = (itemId: string) => {
    setCostItems((prev) => prev.filter((i) => i.id !== itemId));
    if (currentUser) {
      deleteUserCostItem(currentUser.uid, itemId);
    }
  };

  const handleOpenEditCost = (item: CostItem) => {
    setCostItemToEdit(item);
    setPrefillName(undefined);
    setIsCostModalOpen(true);
  };

  const handleOpenAddCost = (namePrefill?: string) => {
    setCostItemToEdit(null);
    setPrefillName(namePrefill);
    setIsCostModalOpen(true);
  };

  // ==========================================================================
  // Order Handlers
  // ==========================================================================
  const handleSaveOrder = (orderToSave: OrderRecord, deductStock: boolean) => {
    setOrders((prev) => {
      const existsIndex = prev.findIndex((o) => o.id === orderToSave.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = orderToSave;
        return updated;
      }
      return [orderToSave, ...prev];
    });

    if (currentUser) {
      saveUserOrder(currentUser.uid, orderToSave);
    }

    // Optionally deduct stock quantities from inventory on-hand
    if (deductStock) {
      let updatedInventoryList: InventoryStockRecord[] = [];
      setInventory((prevInv) => {
        const newInv = [...prevInv];
        orderToSave.items.forEach((item) => {
          const invIndex = newInv.findIndex((inv) => inv.productId === item.productId);
          if (invIndex >= 0) {
            newInv[invIndex] = {
              ...newInv[invIndex],
              currentStock: Math.max(0, newInv[invIndex].currentStock - item.quantity),
              lastUpdated: new Date().toISOString(),
            };
          }
        });
        updatedInventoryList = newInv;
        return newInv;
      });

      // Log stock dispatch entries
      const newLogs: StockLogEntry[] = orderToSave.items.map((item) => ({
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        date: orderToSave.date,
        productId: item.productId,
        changeType: 'manual_adjustment',
        quantityChange: -item.quantity,
        notes: `Order ${orderToSave.referenceNumber} dispatch`,
        createdAt: new Date().toISOString(),
      }));
      setStockLogs((prev) => [...newLogs, ...prev]);

      if (currentUser) {
        saveUserInventoryBatch(currentUser.uid, updatedInventoryList);
        for (const log of newLogs) {
          saveUserStockLog(currentUser.uid, log);
        }
      }
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (currentUser) {
      deleteUserOrder(currentUser.uid, orderId);
    }
  };

  // ==========================================================================
  // Inventory Handlers
  // ==========================================================================
  const handleAddStockLog = (logData: Omit<StockLogEntry, 'id' | 'createdAt'>) => {
    const newLog: StockLogEntry = {
      ...logData,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    setStockLogs((prev) => [newLog, ...prev]);

    let updatedInventoryList: InventoryStockRecord[] = [];
    setInventory((prevInv) => {
      const result = prevInv.map((item) => {
        if (item.productId === logData.productId) {
          const updatedStock = Math.max(0, item.currentStock + logData.quantityChange);
          return {
            ...item,
            currentStock: updatedStock,
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      });
      updatedInventoryList = result;
      return result;
    });

    if (currentUser) {
      saveUserStockLog(currentUser.uid, newLog);
      saveUserInventoryBatch(currentUser.uid, updatedInventoryList);
    }
  };

  const handleDeleteStockLog = (logId: string) => {
    setStockLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  const handleDirectStockUpdate = (productId: string, newStock: number) => {
    const currentItem = inventory.find((i) => i.productId === productId);
    const prevStock = currentItem ? currentItem.currentStock : 0;
    const diff = newStock - prevStock;

    let updatedInventoryList: InventoryStockRecord[] = [];
    setInventory((prevInv) => {
      const result = prevInv.map((item) =>
        item.productId === productId
          ? { ...item, currentStock: newStock, lastUpdated: new Date().toISOString() }
          : item
      );
      updatedInventoryList = result;
      return result;
    });

    let adjustmentLog: StockLogEntry | undefined;
    if (diff !== 0) {
      adjustmentLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        date: new Date().toISOString().slice(0, 10),
        productId,
        changeType: 'manual_adjustment',
        quantityChange: diff,
        notes: `Direct stock count update (${prevStock} -> ${newStock})`,
        createdAt: new Date().toISOString(),
      };
      setStockLogs((prev) => [adjustmentLog!, ...prev]);
    }

    if (currentUser) {
      saveUserInventoryBatch(currentUser.uid, updatedInventoryList);
      if (adjustmentLog) {
        saveUserStockLog(currentUser.uid, adjustmentLog);
      }
    }
  };

  // ==========================================================================
  // Miscellaneous Expenses Handlers
  // ==========================================================================
  const handleSaveExpense = (expenseToSave: MiscellaneousExpense) => {
    setExpenses((prev) => {
      const existsIndex = prev.findIndex((e) => e.id === expenseToSave.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = expenseToSave;
        return updated;
      }
      return [expenseToSave, ...prev];
    });

    if (currentUser) {
      saveUserExpense(currentUser.uid, expenseToSave);
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    if (currentUser) {
      deleteUserExpense(currentUser.uid, expenseId);
    }
  };

  const handleSignOut = async () => {
    await logOutFirebase();
    setCurrentUser(null);
  };

  // 1. Initial Authentication Loading Screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F7F4EE] flex flex-col items-center justify-center p-6 text-[#1C211E]">
        <div className="w-16 h-16 rounded-2xl bg-[#45634D] text-[#F9F7F2] flex items-center justify-center shadow-md mb-4 animate-pulse">
          <Milk className="w-9 h-9" />
        </div>
        <h2 className="text-xl font-bold tracking-tight font-display text-[#1C211E] mb-1">
          Butch Master
        </h2>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#55635B] mt-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#45634D]" />
          <span>Connecting to Butch Master Cloud...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Experience (Redirected to login/signup screen, unless user chose Demo Mode)
  if (!currentUser && !isDemoModeActive) {
    return <AuthScreen onExploreDemo={() => setIsDemoModeActive(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1C211E] pb-24 font-sans antialiased">
      {/* Top Header */}
      <Header
        currentCurrency={currency}
        onCurrencyChange={handleCurrencyChange}
        onResetData={handleResetData}
        products={products}
        costItems={costItems}
        orders={orders}
        inventory={inventory}
        stockLogs={stockLogs}
        miscellaneousExpenses={expenses}
        onImportData={handleImportData}
        onOpenSellingPrices={() => handleOpenSellingPrices()}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenSignIn={() => setIsDemoModeActive(false)}
      />

      {/* Cloud Synchronizing Indicator Bar */}
      {isDataLoading && (
        <div className="bg-[#45634D] text-[#E8F3EB] px-4 py-1.5 text-xs flex items-center justify-center gap-2 shadow-inner">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Syncing workspace with Firestore cloud records...</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-5">
        {/* Main Navigation Segmented Control */}
        <nav
          id="main-app-nav-bar"
          aria-label="Application Modules"
          className="bg-[#EAE5DB] p-1.5 rounded-2xl border border-[#D9D3C7] shadow-2xs flex items-center gap-1 overflow-x-auto"
        >
          <button
            id="nav-tab-dashboard"
            onClick={() => {
              setIsDemoModeActive(false);
              setMainTab('dashboard');
            }}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              mainTab === 'dashboard' && !isDemoModeActive
                ? 'bg-white text-[#1C211E] shadow-xs'
                : 'text-[#55635B] hover:text-[#1C211E]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#45634D]" />
            <span>Dashboard</span>
          </button>

          <button
            id="nav-tab-costs"
            onClick={() => {
              setIsDemoModeActive(false);
              setMainTab('costs');
            }}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              mainTab === 'costs' && !isDemoModeActive
                ? 'bg-white text-[#1C211E] shadow-xs'
                : 'text-[#55635B] hover:text-[#1C211E]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#45634D]" />
            <span>Cost & Ingredients</span>
          </button>

          <button
            id="nav-tab-orders"
            onClick={() => {
              setIsDemoModeActive(false);
              setMainTab('orders');
            }}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              mainTab === 'orders' && !isDemoModeActive
                ? 'bg-white text-[#1C211E] shadow-xs'
                : 'text-[#55635B] hover:text-[#1C211E]'
            }`}
          >
            <Receipt className="w-4 h-4 text-[#45634D]" />
            <span>Orders & Invoices</span>
          </button>

          <button
            id="nav-tab-daily-sales"
            onClick={() => {
              setIsDemoModeActive(false);
              setMainTab('daily-sales');
            }}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              mainTab === 'daily-sales' && !isDemoModeActive
                ? 'bg-white text-[#1C211E] shadow-xs'
                : 'text-[#55635B] hover:text-[#1C211E]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#45634D]" />
            <span>Daily Sales</span>
          </button>

          <button
            id="nav-tab-inventory"
            onClick={() => {
              setIsDemoModeActive(false);
              setMainTab('inventory');
            }}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              mainTab === 'inventory' && !isDemoModeActive
                ? 'bg-white text-[#1C211E] shadow-xs'
                : 'text-[#55635B] hover:text-[#1C211E]'
            }`}
          >
            <Package className="w-4 h-4 text-[#45634D]" />
            <span>Inventory</span>
          </button>

          <button
            id="nav-tab-expenses"
            onClick={() => {
              setIsDemoModeActive(false);
              setMainTab('expenses');
            }}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              mainTab === 'expenses' && !isDemoModeActive
                ? 'bg-white text-[#1C211E] shadow-xs'
                : 'text-[#55635B] hover:text-[#1C211E]'
            }`}
          >
            <Wallet className="w-4 h-4 text-[#45634D]" />
            <span>Misc Expenses</span>
          </button>

          <button
            id="nav-tab-cumulative"
            onClick={() => {
              setIsDemoModeActive(false);
              setMainTab('cumulative');
            }}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              mainTab === 'cumulative' && !isDemoModeActive
                ? 'bg-white text-[#1C211E] shadow-xs'
                : 'text-[#55635B] hover:text-[#1C211E]'
            }`}
          >
            <LineChart className="w-4 h-4 text-[#45634D]" />
            <span>Cumulative Totals</span>
          </button>

          <button
            id="nav-tab-demo-mode"
            onClick={() => setIsDemoModeActive((prev) => !prev)}
            className={`min-w-[110px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
              isDemoModeActive
                ? 'bg-[#8C4E20] text-white shadow-xs'
                : 'bg-[#FAF6F0] hover:bg-[#F2ECE1] text-[#8C4E20] border border-[#E6DAC8]'
            }`}
            title="Explore sample data without touching your real business records"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isDemoModeActive ? 'text-white' : 'text-[#9A5B2D]'}`} />
            <span>{isDemoModeActive ? 'Exit Demo' : 'Demo Mode'}</span>
          </button>
        </nav>

        {/* If Demo Mode is active, render isolated DemoModeSection */}
        {isDemoModeActive ? (
          <DemoModeSection
            currency={currency}
            onExitDemo={() => setIsDemoModeActive(false)}
          />
        ) : (
          <>
            {/* 0. Executive Dashboard Section */}
            {mainTab === 'dashboard' && (
              <ExecutiveDashboard
                orders={orders}
                products={products}
                costItems={costItems}
                expenses={expenses}
                stockLogs={stockLogs}
                currency={currency}
                onNavigateToTab={(tab) => {
                  if (tab === 'demo') {
                    setIsDemoModeActive(true);
                  } else {
                    setMainTab(tab);
                  }
                }}
                onOpenAddProductModal={() => {
                  setEditingProduct(null);
                  setIsAddProductModalOpen(true);
                }}
                onOpenNewOrderModal={() => setMainTab('orders')}
                onOpenNewExpenseModal={() => setMainTab('expenses')}
              />
            )}

            {/* 1. Cost & Ingredients Section */}
            {mainTab === 'costs' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Sub-view toggle between Single Product and All Sizes Overview */}
            <div className="flex items-center justify-between border-b border-[#E8E2D7] pb-3">
              <div className="flex items-center gap-1.5 bg-[#EAE6DD] p-1 rounded-xl">
                <button
                  id="view-manage-tab-btn"
                  onClick={() => setCostSubTab('manage')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    costSubTab === 'manage'
                      ? 'bg-white text-[#1C241E] shadow-2xs'
                      : 'text-[#5A695F] hover:text-[#1C241E]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-[#45634D]" />
                  <span>Single Product View</span>
                </button>

                <button
                  id="view-overview-tab-btn"
                  onClick={() => setCostSubTab('overview')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    costSubTab === 'overview'
                      ? 'bg-white text-[#1C241E] shadow-2xs'
                      : 'text-[#5A695F] hover:text-[#1C241E]'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[#5A695F]" />
                  <span>All Sizes Comparison</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="toolbar-selling-prices-btn"
                  onClick={() => handleOpenSellingPrices()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#243328] border border-[#DDD6CA] text-xs font-bold shadow-2xs transition cursor-pointer"
                  title="Configure and edit yoghurt selling prices per bottle"
                >
                  <Tag className="w-3.5 h-3.5 text-[#45634D]" />
                  <span>Selling Prices</span>
                </button>
                <button
                  id="header-quick-add-btn"
                  onClick={() => handleOpenAddCost()}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#45634D] hover:bg-[#3B5542] text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>New Cost Item</span>
                </button>
              </div>
            </div>

            {costSubTab === 'manage' ? (
              <>
                {/* Product & Size Selector */}
                <section aria-label="Product and Size Selection">
                  <ProductSelector
                    products={products}
                    selectedProductId={selectedProductId}
                    onSelectProduct={setSelectedProductId}
                    costItems={costItems}
                    currency={currency}
                    onOpenPriceModal={() => handleOpenSellingPrices(selectedProductId)}
                    onOpenAddProductModal={() => {
                      setEditingProduct(null);
                      setIsAddProductModalOpen(true);
                    }}
                    onEditProduct={(prod) => {
                      setEditingProduct(prod);
                      setIsAddProductModalOpen(true);
                    }}
                  />
                </section>

                {/* Total Cost Summary Card */}
                {currentProduct && (
                  <section aria-label="Cost Summary">
                    <CostSummaryCard
                      product={currentProduct}
                      costItems={costItems}
                      currency={currency}
                      onOpenAddModal={() => handleOpenAddCost()}
                      onOpenPriceModal={() => handleOpenSellingPrices(currentProduct.id)}
                    />
                  </section>
                )}

                {/* Cost Items List */}
                {currentProduct && (
                  <section aria-label="Cost & Ingredients List">
                    <IngredientList
                      product={currentProduct}
                      costItems={costItems}
                      currency={currency}
                      onEditCostItem={handleOpenEditCost}
                      onQuickUpdatePrice={handleQuickUpdatePrice}
                      onDeleteCostItem={handleDeleteCostItem}
                      onOpenAddModal={handleOpenAddCost}
                      onViewPriceHistory={(item) => setHistoryModalItem(item)}
                    />
                  </section>
                )}
              </>
            ) : (
              /* All Sizes Overview */
              <section aria-label="All Sizes Comparison">
                <ProductComparisonView
                  products={products}
                  costItems={costItems}
                  currency={currency}
                  onSelectProduct={(id) => {
                    setSelectedProductId(id);
                    setCostSubTab('manage');
                  }}
                  onOpenPriceModal={() => handleOpenSellingPrices()}
                />
              </section>
            )}
          </div>
        )}

        {/* 2. Orders & Invoices Section */}
        {mainTab === 'orders' && (
          <section aria-label="Orders and Invoices Management" className="animate-fadeIn">
            <OrdersSection
              orders={orders}
              products={products}
              costItems={costItems}
              currency={currency}
              onSaveOrder={handleSaveOrder}
              onDeleteOrder={handleDeleteOrder}
              onOpenPriceModal={() => handleOpenSellingPrices()}
              onNavigateToDailySales={() => setMainTab('daily-sales')}
            />
          </section>
        )}

        {/* 2b. Daily Sales Tracker Section */}
        {mainTab === 'daily-sales' && (
          <section aria-label="Daily Sales Tracker" className="animate-fadeIn">
            <DailySalesTrackerSection
              orders={orders}
              products={products}
              costItems={costItems}
              currency={currency}
              onNavigateToOrders={() => setMainTab('orders')}
              onOpenNewOrderModal={() => setMainTab('orders')}
            />
          </section>
        )}

        {/* 3. Inventory & Stock Records Section */}
        {mainTab === 'inventory' && (
          <section aria-label="Inventory and Stock Records" className="animate-fadeIn">
            <InventorySection
              inventory={inventory}
              stockLogs={stockLogs}
              products={products}
              onAddStockLog={handleAddStockLog}
              onDeleteStockLog={handleDeleteStockLog}
              onDirectStockUpdate={handleDirectStockUpdate}
            />
          </section>
        )}

        {/* 4. Miscellaneous Expenses Section */}
        {mainTab === 'expenses' && (
          <section aria-label="Miscellaneous Business Expenses" className="animate-fadeIn">
            <MiscellaneousExpensesSection
              expenses={expenses}
              currency={currency}
              onSaveExpense={handleSaveExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          </section>
        )}

        {/* 5. Cumulative Records Section */}
        {mainTab === 'cumulative' && (
          <section aria-label="Cumulative Records & Analytics" className="animate-fadeIn">
            <AccumulativeRecordsSection
              orders={orders}
              products={products}
              costItems={costItems}
              currency={currency}
              miscellaneousExpenses={expenses}
            />
          </section>
        )}
          </>
        )}
      </main>

      {/* Add / Edit Cost Item Modal */}
      {currentProduct && (
        <IngredientModal
          isOpen={isCostModalOpen}
          onClose={() => {
            setIsCostModalOpen(false);
            setCostItemToEdit(null);
            setPrefillName(undefined);
          }}
          onSave={handleSaveCostItem}
          costItemToEdit={costItemToEdit}
          currentProduct={currentProduct}
          allProducts={products}
          currency={currency}
          prefillName={prefillName}
        />
      )}

      {/* Price History Log Modal */}
      {currentProduct && historyModalItem && (
        <PriceHistoryModal
          isOpen={!!historyModalItem}
          onClose={() => setHistoryModalItem(null)}
          costItem={historyModalItem}
          product={currentProduct}
          currency={currency}
        />
      )}

      {/* Selling Price Management Modal */}
      <SellingPriceModal
        isOpen={isSellingPriceModalOpen}
        onClose={() => {
          setIsSellingPriceModalOpen(false);
          setSellingPriceTargetProductId(undefined);
        }}
        products={products}
        costItems={costItems}
        currency={currency}
        onUpdatePrices={handleUpdateSellingPrices}
        selectedProductId={sellingPriceTargetProductId}
      />

      {/* Add / Edit Product Modal */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSaveProduct={handleSaveProduct}
        onQuickLoadStandardProducts={handleQuickLoadStandardProducts}
        currency={currency}
        existingProductIds={products.map((p) => p.id)}
        editingProduct={editingProduct}
      />

      {/* Mobile Floating Action Button (for Cost Items when in costs tab) */}
      {mainTab === 'costs' && (
        <div className="fixed bottom-5 right-5 sm:hidden z-20">
          <button
            id="mobile-fab-add-cost-item"
            onClick={() => handleOpenAddCost()}
            className="w-14 h-14 rounded-full bg-[#45634D] hover:bg-[#3B5542] active:bg-[#324938] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ring-4 ring-[#F9F7F2]"
            title="Add Cost Item"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>
      )}
    </div>
  );
}


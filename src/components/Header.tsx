import React, { useState } from 'react';
import { Milk, RefreshCw, Download, Upload, Check, ChevronDown, Database, Cloud, CloudOff, Tag, LogOut, LogIn, User as UserIcon } from 'lucide-react';
import {
  CurrencyConfig,
  YoghurtProduct,
  CostItem,
  OrderRecord,
  InventoryStockRecord,
  StockLogEntry,
  MiscellaneousExpense,
} from '../types';
import { DEFAULT_CURRENCIES } from '../data/initialData';
import { isFirebaseConfigured } from '../utils/firebase';
import { CloudSyncModal } from './CloudSyncModal';

interface HeaderProps {
  currentCurrency: CurrencyConfig;
  onCurrencyChange: (currency: CurrencyConfig) => void;
  onResetData: () => void;
  products: YoghurtProduct[];
  costItems: CostItem[];
  orders?: OrderRecord[];
  inventory?: InventoryStockRecord[];
  stockLogs?: StockLogEntry[];
  miscellaneousExpenses?: MiscellaneousExpense[];
  onOpenSellingPrices?: () => void;
  currentUser?: {
    email?: string | null;
    displayName?: string | null;
    uid?: string;
  } | null;
  onSignOut?: () => void;
  onOpenSignIn?: () => void;
  onImportData: (data: {
    products: YoghurtProduct[];
    costItems: CostItem[];
    orders?: OrderRecord[];
    inventory?: InventoryStockRecord[];
    stockLogs?: StockLogEntry[];
    miscellaneousExpenses?: MiscellaneousExpense[];
  }) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCurrency,
  onCurrencyChange,
  onResetData,
  products,
  costItems,
  orders = [],
  inventory = [],
  stockLogs = [],
  miscellaneousExpenses = [],
  onOpenSellingPrices,
  currentUser,
  onSignOut,
  onOpenSignIn,
  onImportData,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCloudSync, setShowCloudSync] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const firebaseConfigured = isFirebaseConfigured();

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExport = () => {
    const backupData = {
      version: '2.6',
      exportDate: new Date().toISOString(),
      businessName: 'Butch Master',
      currency: currentCurrency.code,
      products,
      costItems,
      orders,
      inventory,
      stockLogs,
      miscellaneousExpenses,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `butch-master-data-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Business & cost data exported successfully');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          const importedItems = parsed.costItems || parsed.ingredients;
          if (parsed && Array.isArray(parsed.products) && Array.isArray(importedItems)) {
            onImportData({
              products: parsed.products,
              costItems: importedItems,
              orders: Array.isArray(parsed.orders) ? parsed.orders : undefined,
              inventory: Array.isArray(parsed.inventory) ? parsed.inventory : undefined,
              stockLogs: Array.isArray(parsed.stockLogs) ? parsed.stockLogs : undefined,
              miscellaneousExpenses: Array.isArray(parsed.miscellaneousExpenses) ? parsed.miscellaneousExpenses : undefined,
            });
            showToast('Backup restored successfully!');
            setShowSettings(false);
          } else {
            alert('Invalid backup file structure.');
          }
        } catch {
          alert('Could not parse JSON backup file.');
        }
      };
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#1E2621] text-[#F9F7F2] shadow-sm border-b border-[#2A342E]">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#45634D] flex items-center justify-center shadow-inner text-[#F9F7F2] font-bold ring-1 ring-[#5E8367]">
              <Milk className="w-5 h-5 text-[#F9F7F2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight font-display text-white">
                  Butch Master
                </h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-[#2E3C32] text-[#A6C5AD] border border-[#3D4E42] rounded-md tracking-wider">
                  Yoghurt & Pastries
                </span>
              </div>
              <p className="text-xs text-[#A1B0A6] font-medium">
                Cost & Ingredients Management
              </p>
            </div>
          </div>

          {/* Currency & Settings Controls */}
          <div className="flex items-center gap-2">
            {/* Selling Prices Quick Access Button */}
            {onOpenSellingPrices && (
              <button
                id="header-selling-prices-btn"
                onClick={onOpenSellingPrices}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#34483B] hover:bg-[#405A49] text-[#E8F3EB] hover:text-white text-xs font-semibold border border-[#486852] transition-colors cursor-pointer shadow-2xs"
                title="Manage and edit yoghurt bottle selling prices"
              >
                <Tag className="w-3.5 h-3.5 text-[#97D4A2]" />
                <span className="hidden sm:inline">Selling Prices</span>
              </button>
            )}

            {/* Cloud Persistence Status Button */}
            <button
              id="header-cloud-sync-btn"
              onClick={() => setShowCloudSync(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2B362F] hover:bg-[#344239] text-[#CBD8CE] text-xs font-semibold border border-[#3B4A3F] transition-colors cursor-pointer"
              title="Cloud Persistence & Synchronization Status"
            >
              {firebaseConfigured ? (
                <Cloud className="w-3.5 h-3.5 text-[#87B090]" />
              ) : (
                <CloudOff className="w-3.5 h-3.5 text-[#D99A26]" />
              )}
              <span className="hidden sm:inline">
                {firebaseConfigured ? 'Cloud Sync' : 'Local Storage'}
              </span>
            </button>

            {/* Currency Selector */}
            <div className="relative">
              <select
                id="currency-select"
                aria-label="Select Currency"
                value={currentCurrency.code}
                onChange={(e) => {
                  const curr = DEFAULT_CURRENCIES.find((c) => c.code === e.target.value);
                  if (curr) onCurrencyChange(curr);
                }}
                className="bg-[#2B362F] hover:bg-[#344239] text-[#E6EFE8] text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#3B4A3F] focus:outline-none focus:ring-2 focus:ring-[#5C8366] appearance-none pr-7 cursor-pointer transition-colors"
              >
                {DEFAULT_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code} className="bg-[#1E2621] text-white">
                    {curr.symbol} {curr.code}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#A1B0A6] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Settings Toggle */}
            <button
              id="header-settings-toggle"
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg bg-[#2B362F] hover:bg-[#344239] text-[#CBD8CE] border border-[#3B4A3F] transition-colors cursor-pointer"
              title="Backup & Settings"
            >
              <RefreshCw className={`w-4 h-4 ${showSettings ? 'text-[#87B090] rotate-180' : ''} transition-transform duration-300`} />
            </button>

            {/* Authenticated User Session Badge & Sign Out */}
            {currentUser && (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-[#2E3C32]">
                <div className="hidden lg:flex flex-col items-end text-right">
                  <span className="text-[11px] font-semibold text-[#E6EFE8] max-w-[140px] truncate" title={currentUser.email || undefined}>
                    {currentUser.email || 'Business Owner'}
                  </span>
                  <span className="text-[9px] text-[#87B090] font-medium uppercase tracking-wider">
                    Cloud Active
                  </span>
                </div>
                {onSignOut && (
                  <button
                    id="header-signout-btn"
                    onClick={onSignOut}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#2B362F] hover:bg-[#3D2626] text-[#CBD8CE] hover:text-[#FCA5A5] text-xs font-semibold border border-[#3B4A3F] hover:border-[#653333] transition-colors cursor-pointer"
                    title="Sign Out of Butch Master"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                )}
              </div>
            )}

            {/* Unauthenticated / Demo Mode Sign In Shortcut */}
            {!currentUser && onOpenSignIn && (
              <button
                id="header-signin-shortcut-btn"
                onClick={onOpenSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#45634D] hover:bg-[#38523F] text-white text-xs font-bold border border-[#52775C] transition-colors cursor-pointer shadow-xs"
                title="Sign in to your account"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Settings Drawer */}
        {showSettings && (
          <div className="mt-3 pt-3 border-t border-[#2E3C32] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Selling Prices Drawer Button */}
            {onOpenSellingPrices && (
              <button
                id="drawer-selling-prices-btn"
                onClick={() => {
                  onOpenSellingPrices();
                  setShowSettings(false);
                }}
                className="sm:col-span-2 flex items-center justify-between p-2.5 rounded-lg bg-[#253229] hover:bg-[#2C3B30] text-[#D8E6DB] border border-[#3A4E40] transition font-medium cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#87B090]" />
                  <span>Configure Product Selling Prices (30cl, 50cl, 500ml)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#3A6B48] text-white">
                  Edit Prices
                </span>
              </button>
            )}

            {/* Cloud Persistence Drawer Button */}
            <button
              id="drawer-cloud-sync-btn"
              onClick={() => {
                setShowCloudSync(true);
                setShowSettings(false);
              }}
              className="sm:col-span-2 flex items-center justify-between p-2.5 rounded-lg bg-[#253229] hover:bg-[#2C3B30] text-[#D8E6DB] border border-[#3A4E40] transition font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-[#87B090]" />
                <span>Cloud Persistence & Firestore Sync</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                firebaseConfigured ? 'bg-[#3A6B48] text-white' : 'bg-[#D99A26] text-white'
              }`}>
                {firebaseConfigured ? 'Connected' : 'Local Storage Only'}
              </span>
            </button>

            <button
              id="export-backup-btn"
              onClick={handleExport}
              className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-[#2B362F] hover:bg-[#344239] text-[#E6EFE8] border border-[#3B4A3F] transition font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#87B090]" />
              Export Cost Backup (JSON)
            </button>

            <label
              id="import-backup-label"
              className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-[#2B362F] hover:bg-[#344239] text-[#E6EFE8] border border-[#3B4A3F] cursor-pointer transition font-medium text-center"
            >
              <Upload className="w-3.5 h-3.5 text-[#87B090]" />
              Import / Restore Backup
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>

            <div className="sm:col-span-2 flex items-center justify-between pt-1">
              {!showResetConfirm ? (
                <button
                  id="reset-sample-data-btn"
                  onClick={() => setShowResetConfirm(true)}
                  className="text-[#96A89C] hover:text-[#E28383] transition text-[11px] underline cursor-pointer"
                >
                  Reset all costs to Butch Master standard defaults
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-[#3A1F1F] border border-[#5E2B2B] p-2 rounded-lg w-full justify-between">
                  <span className="text-[#F2B0B0] text-[11px]">Are you sure you want to reset all unit prices?</span>
                  <div className="flex items-center gap-2">
                    <button
                      id="confirm-reset-btn"
                      onClick={() => {
                        onResetData();
                        setShowResetConfirm(false);
                        setShowSettings(false);
                        showToast('Reset to default standard costs');
                      }}
                      className="px-2.5 py-1 bg-[#A83232] hover:bg-[#C23C3C] text-white rounded text-[11px] font-semibold cursor-pointer"
                    >
                      Yes, Reset
                    </button>
                    <button
                      id="cancel-reset-btn"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2 py-1 bg-[#2B362F] hover:bg-[#344239] text-[#CBD8CE] rounded text-[11px] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {notification && (
          <div className="mt-2 p-2 bg-[#2E3C32] border border-[#4E6754] text-[#D3E8D7] rounded-lg text-xs flex items-center gap-2 animate-fadeIn">
            <Check className="w-3.5 h-3.5 text-[#87B090] flex-shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Cloud Persistence & Migration Modal */}
        <CloudSyncModal
          isOpen={showCloudSync}
          onClose={() => setShowCloudSync(false)}
          products={products}
          costItems={costItems}
          orders={orders}
          inventory={inventory}
          stockLogs={stockLogs}
          miscellaneousExpenses={miscellaneousExpenses}
          currency={currentCurrency}
        />
      </div>
    </header>
  );
};

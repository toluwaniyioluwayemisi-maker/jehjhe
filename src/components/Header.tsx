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
    <header className="sticky top-0 z-30 bg-gradient-to-r from-[#06241D] via-[#09352A] to-[#0A3D30] text-white shadow-sm border-b border-[#144E3F]">
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-md text-white font-bold ring-2 ring-[#34D399]/30">
              <Milk className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight font-display text-white">
                  Butch Master
                </h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-[#0C382C] text-[#6EE7B7] border border-[#165443] rounded-md tracking-wider">
                  Yoghurt & Pastries
                </span>
              </div>
              <p className="text-xs text-[#A7F3D0]/90 font-medium">
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
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0F4738] hover:bg-[#155A48] text-[#ECFDF5] hover:text-white text-xs font-semibold border border-[#1C6652] transition-colors cursor-pointer shadow-xs"
                title="Manage and edit yoghurt bottle selling prices"
              >
                <Tag className="w-3.5 h-3.5 text-[#34D399]" />
                <span className="hidden sm:inline">Selling Prices</span>
              </button>
            )}

            {/* Cloud Persistence Status Button */}
            <button
              id="header-cloud-sync-btn"
              onClick={() => setShowCloudSync(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#082E24] hover:bg-[#0E3E31] text-[#D1FAE5] text-xs font-semibold border border-[#165443] transition-colors cursor-pointer"
              title="Cloud Persistence & Synchronization Status"
            >
              {firebaseConfigured ? (
                <Cloud className="w-3.5 h-3.5 text-[#34D399]" />
              ) : (
                <CloudOff className="w-3.5 h-3.5 text-[#FBBF24]" />
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
                className="bg-[#082E24] hover:bg-[#0E3E31] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#165443] focus:outline-none focus:ring-2 focus:ring-[#10B981] appearance-none pr-7 cursor-pointer transition-colors"
              >
                {DEFAULT_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code} className="bg-[#06241D] text-white">
                    {curr.symbol} {curr.code}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#A7F3D0] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Settings Toggle */}
            <button
              id="header-settings-toggle"
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg bg-[#082E24] hover:bg-[#0E3E31] text-[#D1FAE5] border border-[#165443] transition-colors cursor-pointer"
              title="Backup & Settings"
            >
              <RefreshCw className={`w-4 h-4 ${showSettings ? 'text-[#34D399] rotate-180' : ''} transition-transform duration-300`} />
            </button>

            {/* Cloud Storage Status Indicator */}
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-[#165443]">
              <button
                type="button"
                id="header-cloud-status-badge"
                onClick={() => setShowCloudSync(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#082E24] hover:bg-[#0E3E31] text-[#D1FAE5] text-xs font-semibold border border-[#165443] transition cursor-pointer"
                title="Firestore Cloud Storage Connected"
              >
                <Cloud className="w-3.5 h-3.5 text-[#34D399]" />
                <span className="hidden sm:inline text-[11px] text-white">Cloud Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Settings Drawer */}
        {showSettings && (
          <div className="mt-3 pt-3 border-t border-[#144E3F] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Selling Prices Drawer Button */}
            {onOpenSellingPrices && (
              <button
                id="drawer-selling-prices-btn"
                onClick={() => {
                  onOpenSellingPrices();
                  setShowSettings(false);
                }}
                className="sm:col-span-2 flex items-center justify-between p-2.5 rounded-lg bg-[#0A352A] hover:bg-[#0F4436] text-[#E6F4EE] border border-[#185544] transition font-medium cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Configure Product Selling Prices (30cl, 50cl, 500ml)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#059669] text-white">
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
              className="sm:col-span-2 flex items-center justify-between p-2.5 rounded-lg bg-[#0A352A] hover:bg-[#0F4436] text-[#E6F4EE] border border-[#185544] transition font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Cloud Persistence & Firestore Sync</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                firebaseConfigured ? 'bg-[#059669] text-white' : 'bg-[#D97706] text-white'
              }`}>
                {firebaseConfigured ? 'Connected' : 'Local Storage Only'}
              </span>
            </button>

            <button
              id="export-backup-btn"
              onClick={handleExport}
              className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-[#082E24] hover:bg-[#0E3E31] text-white border border-[#165443] transition font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#34D399]" />
              Export Cost Backup (JSON)
            </button>

            <label
              id="import-backup-label"
              className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-[#082E24] hover:bg-[#0E3E31] text-white border border-[#165443] cursor-pointer transition font-medium text-center"
            >
              <Upload className="w-3.5 h-3.5 text-[#34D399]" />
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
                  className="text-[#99F6E4]/80 hover:text-[#FCA5A5] transition text-[11px] underline cursor-pointer"
                >
                  Reset all costs to Butch Master standard defaults
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-[#450A0A] border border-[#7F1D1D] p-2 rounded-lg w-full justify-between">
                  <span className="text-[#FECACA] text-[11px]">Are you sure you want to reset all unit prices?</span>
                  <div className="flex items-center gap-2">
                    <button
                      id="confirm-reset-btn"
                      onClick={() => {
                        onResetData();
                        setShowResetConfirm(false);
                        setShowSettings(false);
                        showToast('Reset to default standard costs');
                      }}
                      className="px-2.5 py-1 bg-[#DC2626] hover:bg-[#EF4444] text-white rounded text-[11px] font-semibold cursor-pointer"
                    >
                      Yes, Reset
                    </button>
                    <button
                      id="cancel-reset-btn"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2 py-1 bg-[#082E24] hover:bg-[#0E3E31] text-[#D1FAE5] rounded text-[11px] cursor-pointer"
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
          <div className="mt-2 p-2.5 bg-[#064E3B] border border-[#059669] text-[#D1FAE5] rounded-xl text-xs flex items-center gap-2 animate-fadeIn shadow-md">
            <Check className="w-3.5 h-3.5 text-[#34D399] flex-shrink-0" />
            <span className="font-semibold">{notification}</span>
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

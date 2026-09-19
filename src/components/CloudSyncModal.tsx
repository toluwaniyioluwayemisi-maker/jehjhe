import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudOff,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  X,
  ArrowRight,
  Info,
  Server,
  Lock,
  LogIn,
  LogOut,
  UserCheck,
} from 'lucide-react';
import {
  isFirebaseConfigured,
  getMissingFirebaseVariables,
  getFirebaseEnvConfig,
  migrateLocalDataToFirestore,
  testFirestoreConnection,
  signInWithGoogle,
  logOutFirebase,
  subscribeToAuthState,
  getCurrentUser,
  type MigrationPayload,
  type MigrationResult,
} from '../utils/firebase';
import type { User } from 'firebase/auth';
import type {
  CostItem,
  YoghurtProduct,
  OrderRecord,
  InventoryStockRecord,
  StockLogEntry,
  MiscellaneousExpense,
  CurrencyConfig,
} from '../types';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: YoghurtProduct[];
  costItems: CostItem[];
  orders: OrderRecord[];
  inventory: InventoryStockRecord[];
  stockLogs: StockLogEntry[];
  miscellaneousExpenses: MiscellaneousExpense[];
  currency: CurrencyConfig;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  products,
  costItems,
  orders,
  inventory,
  stockLogs,
  miscellaneousExpenses,
  currency,
}) => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [missingVars, setMissingVars] = useState<string[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [connectionTested, setConnectionTested] = useState<boolean | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const configured = isFirebaseConfigured();
      setIsConfigured(configured);
      setMissingVars(getMissingFirebaseVariables());
      setMigrationResult(null);
      setConnectionTested(null);
      setAuthError(null);

      if (configured) {
        setCurrentUser(getCurrentUser());
        const unsubscribe = subscribeToAuthState((user) => {
          setCurrentUser(user);
        });
        return () => unsubscribe();
      } else {
        setCurrentUser(null);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalLocalRecords =
    products.length +
    costItems.length +
    orders.length +
    inventory.length +
    stockLogs.length +
    miscellaneousExpenses.length;

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTested(null);
    try {
      const connected = await testFirestoreConnection();
      setConnectionTested(connected);
    } catch {
      setConnectionTested(false);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSignInGoogle = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(msg);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOutFirebase();
      setCurrentUser(null);
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const handleMigrate = async () => {
    if (!isConfigured) return;

    setIsMigrating(true);
    setMigrationResult(null);
    setAuthError(null);
    const payload: MigrationPayload = {
      products,
      costItems,
      orders,
      inventory,
      stockLogs,
      miscellaneousExpenses,
      currency,
    };
    try {
      const result = await migrateLocalDataToFirestore(payload);
      setMigrationResult(result);
    } catch (err) {
      setMigrationResult({
        success: false,
        counts: { costItems: 0, products: 0, orders: 0, inventory: 0, stockLogs: 0, miscellaneousExpenses: 0, settings: 0 },
        timestamp: new Date().toISOString(),
        errorMessage: err instanceof Error ? err.message : 'Unknown migration error',
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const envConfig = getFirebaseEnvConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        id="cloud-sync-modal"
        className="bg-[#F9F7F2] rounded-2xl border border-[#D5DDD7] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-[#1E2621] text-[#F9F7F2] px-6 py-4 flex items-center justify-between border-b border-[#2E3C32]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#45634D] flex items-center justify-center text-white ring-1 ring-[#6E9576]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white">
                Cloud Persistence & Database Sync
              </h2>
              <p className="text-xs text-[#A1B0A6]">
                Firebase Firestore status & local data migration
              </p>
            </div>
          </div>
          <button
            id="close-cloud-sync-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A1B0A6] hover:text-white hover:bg-[#2B362F] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-[#1C211E] text-xs">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              isConfigured
                ? 'bg-[#EBF3ED] border-[#BCD4C3] text-[#23432B]'
                : 'bg-[#FFF9EC] border-[#E8D9B6] text-[#7A5813]'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {isConfigured ? (
                <Cloud className="w-5 h-5 text-[#3A6B48]" />
              ) : (
                <CloudOff className="w-5 h-5 text-[#A6781D]" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">
                  {isConfigured ? 'Firebase Cloud Configured' : 'Local Storage Mode Active (Safe)'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isConfigured
                      ? 'bg-[#3A6B48] text-white'
                      : 'bg-[#D99A26] text-white'
                  }`}
                >
                  {isConfigured ? 'Ready to Sync' : 'Credentials Needed'}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {isConfigured
                  ? 'Cloud database environment parameters are detected. You can safely transfer local records to Firestore.'
                  : 'All Butch Master records are currently saved reliably in browser localStorage on this device. To enable multi-device sync, real Firebase credentials must be provided.'}
              </p>
            </div>
          </div>

          {/* Records Summary Table */}
          <div className="bg-white rounded-xl border border-[#E3DDD1] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
              <span className="font-bold text-[#1C211E] text-xs flex items-center gap-1.5">
                <Server className="w-4 h-4 text-[#45634D]" />
                Local Records Ready for Cloud Persistence
              </span>
              <span className="text-[11px] font-bold text-[#45634D] bg-[#EBF3ED] px-2 py-0.5 rounded-full">
                {totalLocalRecords} total items
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-lg bg-[#F9F7F2] border border-[#EBE5DA]">
                <p className="text-[10px] text-[#697A6F] font-medium">Cost Items</p>
                <p className="text-sm font-bold text-[#1C211E]">{costItems.length} records</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F9F7F2] border border-[#EBE5DA]">
                <p className="text-[10px] text-[#697A6F] font-medium">Products & Prices</p>
                <p className="text-sm font-bold text-[#1C211E]">{products.length} products</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F9F7F2] border border-[#EBE5DA]">
                <p className="text-[10px] text-[#697A6F] font-medium">Orders / Invoices</p>
                <p className="text-sm font-bold text-[#1C211E]">{orders.length} orders</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F9F7F2] border border-[#EBE5DA]">
                <p className="text-[10px] text-[#697A6F] font-medium">Inventory Balances</p>
                <p className="text-sm font-bold text-[#1C211E]">{inventory.length} sizes</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F9F7F2] border border-[#EBE5DA]">
                <p className="text-[10px] text-[#697A6F] font-medium">Stock Audit Logs</p>
                <p className="text-sm font-bold text-[#1C211E]">{stockLogs.length} entries</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F9F7F2] border border-[#EBE5DA]">
                <p className="text-[10px] text-[#697A6F] font-medium">Misc Expenses</p>
                <p className="text-sm font-bold text-[#1C211E]">{miscellaneousExpenses.length} entries</p>
              </div>
            </div>
          </div>

          {/* Historical Snapshot & Financial Integrity Guarantee */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E3DDD1] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#45634D] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-[#1C211E] text-xs">Financial Snapshot Integrity Guaranteed</h4>
              <p className="text-[11px] text-[#55635B] leading-relaxed">
                Order records lock fixed historical selling prices and production costs at invoice creation.
                Cloud synchronization will preserve these immutable snapshots without recalculating historical records.
              </p>
            </div>
          </div>

          {/* Environment Variables Requirement Section */}
          {!isConfigured ? (
            <div className="bg-white rounded-xl border border-[#E3DDD1] p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-[#9A3412]">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="font-bold text-xs">Required Firebase Configuration Variables</h4>
              </div>
              <p className="text-[11px] text-[#55635B]">
                To connect to Firebase, obtain your web app credentials from the Firebase Console and configure the following environment variables:
              </p>
              <div className="bg-[#1C211E] text-[#D8E2DC] p-3 rounded-lg font-mono text-[11px] space-y-1 overflow-x-auto">
                {missingVars.map((v) => (
                  <div key={v} className="flex items-center gap-2">
                    <span className="text-[#E28383] font-bold">•</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-[#F0EBE1] text-[11px] text-[#697A6F] flex items-center justify-between">
                <span>Companion variables:</span>
                <span className="font-mono text-[10px]">STORAGE_BUCKET, MESSAGING_SENDER_ID, DATABASE_ID</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#CDE0D2] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#2E5738]">
                  <CheckCircle2 className="w-4 h-4 text-[#3A6B48]" />
                  <h4 className="font-bold text-xs">Firebase Web Environment Configured</h4>
                </div>
                <span className="text-[10px] font-mono bg-[#EBF3ED] text-[#2E5738] px-2 py-0.5 rounded font-semibold">
                  Project: {envConfig.projectId || 'Connected'}
                </span>
              </div>
              <p className="text-[11px] text-[#55635B]">
                Database: <code className="bg-[#F0EBE1] px-1 py-0.5 rounded font-mono text-[10px]">{envConfig.firestoreDatabaseId || '(default)'}</code>
              </p>
            </div>
          )}

          {/* Cloud Database Storage Info Panel */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E3DDD1] space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#45634D] flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-bold text-[#1C211E] text-xs">Direct Business Cloud Storage</h4>
                  <p className="text-[11px] text-[#55635B] leading-relaxed">
                    Firestore security rules configured in <code className="bg-[#F0EBE1] px-1 py-0.5 rounded font-mono text-[10px]">firestore.rules</code> provide direct cloud persistence for the Butch Masters workspace without requiring personal user login.
                  </p>
                </div>
              </div>
            </div>

            {isConfigured && (
              <div className="pt-2 border-t border-[#F0EBE1] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#3A6B48]" />
                  <span className="text-[#23432B] font-medium">
                    Workspace: <strong className="font-semibold">Butch Masters Main Database</strong>
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-[#EBF3ED] text-[#2E5738] px-2 py-0.5 rounded-full">
                  Online & Sync Ready
                </span>
              </div>
            )}

            {authError && (
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}
          </div>

          {/* Migration Action Area */}
          <div className="pt-2 border-t border-[#E3DDD1] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#697A6F]">
                {isConfigured
                  ? 'Safe migration: Copies local records to Firestore without deleting browser storage.'
                  : 'Migration is disabled until Firebase variables are provided.'}
              </span>
              {isConfigured && (
                <button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="text-[11px] font-semibold text-[#45634D] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isTestingConnection ? 'animate-spin' : ''}`} />
                  Test Connection
                </button>
              )}
            </div>

            {connectionTested !== null && (
              <div
                className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-2 ${
                  connectionTested
                    ? 'bg-[#EBF3ED] text-[#23432B]'
                    : 'bg-rose-50 text-rose-800'
                }`}
              >
                {connectionTested ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3A6B48]" />
                    <span>Firestore connection successfully verified!</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Firestore server is currently unreachable. Check project credentials.</span>
                  </>
                )}
              </div>
            )}

            {migrationResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                  migrationResult.success
                    ? 'bg-[#EBF3ED] text-[#23432B] border border-[#BCD4C3]'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {migrationResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-[#3A6B48] flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <p className="font-bold">
                    {migrationResult.success
                      ? 'Local Data Successfully Migrated to Cloud!'
                      : 'Migration Encountered an Error'}
                  </p>
                  {migrationResult.success ? (
                    <p className="text-[11px] opacity-90">
                      Uploaded {migrationResult.counts.costItems} cost items, {migrationResult.counts.products} products, {migrationResult.counts.orders} orders, {migrationResult.counts.inventory} inventory balances, {migrationResult.counts.stockLogs} stock logs, and {migrationResult.counts.miscellaneousExpenses} expenses to Firestore.
                    </p>
                  ) : (
                    <p className="text-[11px]">{migrationResult.errorMessage}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#EDE7DC] px-6 py-3.5 border-t border-[#D5DDD7] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#697A6F] text-[11px]">
            <Info className="w-3.5 h-3.5 text-[#45634D]" />
            <span>Local records remain completely safe & accessible</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="close-cloud-sync-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#F0EBE1] text-[#55635B] text-xs font-bold border border-[#D5DDD7] transition cursor-pointer"
            >
              Close
            </button>
            <button
              id="start-migration-btn"
              onClick={handleMigrate}
              disabled={!isConfigured || isMigrating}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer ${
                isConfigured && !isMigrating
                  ? 'bg-[#45634D] hover:bg-[#38523F] text-white'
                  : 'bg-[#C5CEC8] text-[#7A8A7F] cursor-not-allowed'
              }`}
            >
              {isMigrating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Migrating to Firestore...
                </>
              ) : (
                <>
                  <span>Migrate to Cloud</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

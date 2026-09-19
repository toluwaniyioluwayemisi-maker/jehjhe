import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  type Firestore,
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  getAuth,
  type Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from 'firebase/auth';
import appletConfig from '@/firebase-applet-config.json';
import {
  DEFAULT_CURRENCIES,
  INITIAL_PRODUCTS,
  INITIAL_INGREDIENTS,
  INITIAL_INVENTORY,
  INITIAL_ORDERS,
  INITIAL_STOCK_LOGS,
  INITIAL_MISCELLANEOUS_EXPENSES,
} from '../data/initialData';
import {
  getStoredProducts,
  getStoredCostItems,
  getStoredOrders,
  getStoredInventory,
  getStoredStockLogs,
  getStoredMiscellaneousExpenses,
} from './storage';
import type {
  CostItem,
  YoghurtProduct,
  OrderRecord,
  InventoryStockRecord,
  StockLogEntry,
  MiscellaneousExpense,
  CurrencyConfig,
  CloudSyncInfo,
} from '../types';

// ============================================================================
// Firebase Configuration & Environment Detection
// ============================================================================

export interface FirebaseEnvConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

/**
 * Safely sanitizes environment variable strings:
 * - Trims accidental leading/trailing whitespace
 * - Strips accidental wrapping single/double quotes from copy-pasting
 * - Treats 'undefined', 'null', and empty strings as undefined
 */
function sanitizeEnvValue(val: unknown): string | undefined {
  if (typeof val !== 'string') return undefined;
  const trimmed = val.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
    return undefined;
  }
  // Strip enclosing single or double quotes
  return trimmed.replace(/^["'](.*)["']$/, '$1').trim() || undefined;
}

export function getFirebaseEnvConfig(): FirebaseEnvConfig {
  const cfg = (appletConfig || {}) as Record<string, string>;
  const envApiKey = sanitizeEnvValue(import.meta.env.VITE_FIREBASE_API_KEY);
  const envAuthDomain = sanitizeEnvValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
  const envProjectId = sanitizeEnvValue(import.meta.env.VITE_FIREBASE_PROJECT_ID);
  const envStorageBucket = sanitizeEnvValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
  const envMessagingSenderId = sanitizeEnvValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
  const envAppId = sanitizeEnvValue(import.meta.env.VITE_FIREBASE_APP_ID);
  const envDatabaseId = sanitizeEnvValue(import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID);

  return {
    apiKey: envApiKey || cfg.apiKey,
    authDomain: envAuthDomain || cfg.authDomain,
    projectId: envProjectId || cfg.projectId,
    storageBucket: envStorageBucket || cfg.storageBucket,
    messagingSenderId: envMessagingSenderId || cfg.messagingSenderId,
    appId: envAppId || cfg.appId,
    firestoreDatabaseId: envDatabaseId || cfg.firestoreDatabaseId || '(default)',
  };
}

export function getMissingFirebaseVariables(): string[] {
  const config = getFirebaseEnvConfig();
  const missing: string[] = [];
  if (!config.apiKey) missing.push('VITE_FIREBASE_API_KEY');
  if (!config.authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!config.projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!config.appId) missing.push('VITE_FIREBASE_APP_ID');
  return missing;
}

export function isFirebaseConfigured(): boolean {
  return getMissingFirebaseVariables().length === 0;
}

// ============================================================================
// Lazy Initialization
// ============================================================================

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;
let cachedAuth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    return null;
  }
  if (!cachedApp) {
    const existing = getApps();
    if (existing.length > 0) {
      cachedApp = existing[0];
    } else {
      const config = getFirebaseEnvConfig();
      cachedApp = initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
      });
    }
  }
  return cachedApp;
}

export function getFirebaseDb(): Firestore | null {
  if (!cachedDb) {
    const app = getFirebaseApp();
    if (app) {
      const config = getFirebaseEnvConfig();
      const databaseId = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
        ? config.firestoreDatabaseId
        : undefined;
      cachedDb = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
    }
  }
  return cachedDb;
}

export function getFirebaseAuth(): Auth | null {
  if (!cachedAuth) {
    const app = getFirebaseApp();
    if (app) {
      cachedAuth = getAuth(app);
    }
  }
  return cachedAuth;
}

// ============================================================================
// Standardized Firestore Error Handling
// ============================================================================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const auth = getFirebaseAuth();
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================================================
// Connection Testing
// ============================================================================

export async function testFirestoreConnection(): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'settings', 'config'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: Client is offline or Firestore is unreachable.');
      return false;
    }
    // If it reached Firestore but doc does not exist or permission denied, connection was verified
    return true;
  }
}

// ============================================================================
// Authentication Helpers
// ============================================================================

export function getCurrentUser(): User | null {
  const auth = getFirebaseAuth();
  return auth?.currentUser || null;
}

export async function signInWithGoogle(): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase Authentication is not configured yet.');
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error?.code === 'auth/unauthorized-domain') {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'current-domain';
      const enrichedErr = new Error(
        `Domain "${hostname}" is not authorized for OAuth operations in Firebase project "${auth.app.options.projectId}". Please add "${hostname}" and "localhost" to Firebase Console → Authentication → Settings → Authorized domains.`
      );
      Object.assign(enrichedErr, { code: 'auth/unauthorized-domain', hostname });
      throw enrichedErr;
    }
    throw err;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase Authentication is not configured yet.');
  }
  try {
    const credential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error?.code === 'auth/operation-not-allowed') {
      const enrichedErr = new Error(
        'Email/Password sign-in is not enabled in Firebase Console for this project. Please sign in using "Continue with Google", or enable Email/Password provider in Firebase Console → Authentication → Sign-in method.'
      );
      Object.assign(enrichedErr, { code: 'auth/operation-not-allowed' });
      throw enrichedErr;
    }
    throw err;
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase Authentication is not configured yet.');
  }
  try {
    const credential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error?.code === 'auth/operation-not-allowed') {
      const enrichedErr = new Error(
        'Email/Password sign-up is not enabled in Firebase Console for this project. Please sign in using "Continue with Google", or enable Email/Password provider in Firebase Console → Authentication → Sign-in method.'
      );
      Object.assign(enrichedErr, { code: 'auth/operation-not-allowed' });
      throw enrichedErr;
    }
    throw err;
  }
}

export async function logOutFirebase(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth) {
    await firebaseSignOut(auth);
  }
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// ============================================================================
// Butch Masters Business Cloud Data Operations (Firestore)
// ============================================================================

export const BUTCH_MASTERS_WORKSPACE_ID = 'butch_masters_main';

export interface UserBusinessData {
  products: YoghurtProduct[];
  costItems: CostItem[];
  orders: OrderRecord[];
  inventory: InventoryStockRecord[];
  stockLogs: StockLogEntry[];
  miscellaneousExpenses: MiscellaneousExpense[];
  currency: CurrencyConfig;
}

/**
 * Loads the Butch Masters business workspace from Firestore.
 * When opening for the first time with an empty database:
 * - Products, Cost Items, and Inventory initialize from baseline catalogue.
 * - Orders, Stock Logs, and Expenses start as empty lists (no fake business records).
 */
export async function loadUserDataFromFirestore(workspaceId: string = BUTCH_MASTERS_WORKSPACE_ID): Promise<UserBusinessData> {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Database connection is unavailable');
  }

  try {
    const [prodSnap, costSnap, orderSnap, invSnap, logSnap, expSnap, settingsSnap] = await Promise.all([
      getDocs(collection(db, 'users', workspaceId, 'products')),
      getDocs(collection(db, 'users', workspaceId, 'cost_items')),
      getDocs(collection(db, 'users', workspaceId, 'orders')),
      getDocs(collection(db, 'users', workspaceId, 'inventory')),
      getDocs(collection(db, 'users', workspaceId, 'stock_logs')),
      getDocs(collection(db, 'users', workspaceId, 'miscellaneous_expenses')),
      getDoc(doc(db, 'users', workspaceId, 'settings', 'config')),
    ]);

    let products: YoghurtProduct[] = prodSnap.docs.map((d) => d.data() as YoghurtProduct);
    let costItems: CostItem[] = costSnap.docs.map((d) => d.data() as CostItem);
    let orders: OrderRecord[] = orderSnap.docs.map((d) => d.data() as OrderRecord);
    let inventory: InventoryStockRecord[] = invSnap.docs.map((d) => d.data() as InventoryStockRecord);
    let stockLogs: StockLogEntry[] = logSnap.docs.map((d) => d.data() as StockLogEntry);
    let miscellaneousExpenses: MiscellaneousExpense[] = expSnap.docs.map((d) => d.data() as MiscellaneousExpense);

    // If new cloud workspace, initialize product catalogue definitions
    if (products.length === 0) {
      const storedProds = getStoredProducts();
      const storedCosts = getStoredCostItems();
      const storedInv = getStoredInventory();

      products = storedProds.length > 0 ? storedProds : INITIAL_PRODUCTS;
      costItems = storedCosts.length > 0 ? storedCosts : INITIAL_INGREDIENTS;
      inventory = storedInv.length > 0 ? storedInv : INITIAL_INVENTORY;

      // Real transactional records start fresh without fake business data
      orders = getStoredOrders();
      stockLogs = getStoredStockLogs();
      miscellaneousExpenses = getStoredMiscellaneousExpenses();

      // Seed product catalog definitions to Firestore in background
      saveUserProductsBatch(products, workspaceId).catch((err) => {
        console.warn('[Firestore] Product catalog provisioning:', err);
      });
      for (const item of costItems) {
        saveUserCostItem(item, workspaceId).catch(() => {});
      }
      saveUserInventoryBatch(inventory, workspaceId).catch(() => {});
    }

    // Update business root document with lastActive timestamp
    const businessRef = doc(db, 'users', workspaceId);
    setDoc(businessRef, {
      workspaceId,
      businessName: 'Butch Masters',
      lastActive: new Date().toISOString(),
    }, { merge: true }).catch((e) => {
      console.warn('[Firestore] Failed to update workspace lastActive:', e);
    });

    let currency: CurrencyConfig = DEFAULT_CURRENCIES[0];
    if (settingsSnap.exists()) {
      const sData = settingsSnap.data();
      currency = {
        code: sData.currencyCode || 'NGN',
        symbol: sData.currencySymbol || '₦',
        name: sData.currencyName || 'Nigerian Naira',
      };
    }

    return {
      products,
      costItems,
      orders,
      inventory,
      stockLogs,
      miscellaneousExpenses,
      currency,
    };
  } catch (error) {
    console.error(`[Firestore] Failed to load data for workspace ${workspaceId}:`, error);
    const storedProds = getStoredProducts();
    const storedCosts = getStoredCostItems();
    const storedInv = getStoredInventory();
    return {
      products: storedProds.length > 0 ? storedProds : INITIAL_PRODUCTS,
      costItems: storedCosts.length > 0 ? storedCosts : INITIAL_INGREDIENTS,
      orders: getStoredOrders(),
      inventory: storedInv.length > 0 ? storedInv : INITIAL_INVENTORY,
      stockLogs: getStoredStockLogs(),
      miscellaneousExpenses: getStoredMiscellaneousExpenses(),
      currency: DEFAULT_CURRENCIES[0],
    };
  }
}

export async function saveUserProduct(
  arg1: string | YoghurtProduct,
  arg2?: YoghurtProduct | string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const workspaceId = typeof arg1 === 'string' ? arg1 : (typeof arg2 === 'string' ? arg2 : BUTCH_MASTERS_WORKSPACE_ID);
  const product = typeof arg1 === 'object' ? (arg1 as YoghurtProduct) : (typeof arg2 === 'object' ? (arg2 as YoghurtProduct) : null);
  if (!product) return;
  try {
    await setDoc(doc(db, 'users', workspaceId, 'products', product.id), product, { merge: true });
  } catch (err) {
    console.error(`Failed to save product ${product.id} to Firestore:`, err);
  }
}

export async function saveUserProductsBatch(
  arg1: string | YoghurtProduct[],
  arg2?: YoghurtProduct[] | string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const workspaceId = typeof arg1 === 'string' ? arg1 : (typeof arg2 === 'string' ? arg2 : BUTCH_MASTERS_WORKSPACE_ID);
  const products = Array.isArray(arg1) ? arg1 : (Array.isArray(arg2) ? arg2 : []);
  if (products.length === 0) return;
  try {
    const batch = writeBatch(db);
    for (const p of products) {
      batch.set(doc(db, 'users', workspaceId, 'products', p.id), p, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.error('Failed to batch save products to Firestore:', err);
  }
}

export async function saveUserCostItem(
  arg1: string | CostItem,
  arg2?: CostItem | string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const workspaceId = typeof arg1 === 'string' ? arg1 : (typeof arg2 === 'string' ? arg2 : BUTCH_MASTERS_WORKSPACE_ID);
  const item = typeof arg1 === 'object' ? (arg1 as CostItem) : (typeof arg2 === 'object' ? (arg2 as CostItem) : null);
  if (!item) return;
  try {
    await setDoc(doc(db, 'users', workspaceId, 'cost_items', item.id), item, { merge: true });
  } catch (err) {
    console.error(`Failed to save cost item ${item.id} to Firestore:`, err);
  }
}

export async function deleteUserCostItem(
  arg1: string,
  arg2?: string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const workspaceId = arg2 ? arg1 : BUTCH_MASTERS_WORKSPACE_ID;
  const itemId = arg2 ? arg2 : arg1;
  try {
    await deleteDoc(doc(db, 'users', workspaceId, 'cost_items', itemId));
  } catch (err) {
    console.error(`Failed to delete cost item ${itemId} from Firestore:`, err);
  }
}

export async function saveUserOrder(
  arg1: string | OrderRecord,
  arg2?: OrderRecord | string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const workspaceId = typeof arg1 === 'string' ? arg1 : (typeof arg2 === 'string' ? arg2 : BUTCH_MASTERS_WORKSPACE_ID);
  const order = typeof arg1 === 'object' ? (arg1 as OrderRecord) : (typeof arg2 === 'object' ? (arg2 as OrderRecord) : null);
  if (!order) return;
  try {
    await setDoc(doc(db, 'users', workspaceId, 'orders', order.id), order, { merge: true });
  } catch (err) {
    console.error(`Failed to save order ${order.id} to Firestore:`, err);
  }
}

export async function deleteUserOrder(
  arg1: string,
  arg2?: string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const workspaceId = arg2 ? arg1 : BUTCH_MASTERS_WORKSPACE_ID;
  const orderId = arg2 ? arg2 : arg1;
  try {
    await deleteDoc(doc(db, 'users', workspaceId, 'orders', orderId));
  } catch (err) {
    console.error(`Failed to delete order ${orderId} from Firestore:`, err);
  }
}

export async function saveUserInventoryBatch(
  arg1: string | InventoryStockRecord[],
  arg2?: InventoryStockRecord[] | string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const workspaceId = typeof arg1 === 'string' ? arg1 : (typeof arg2 === 'string' ? arg2 : BUTCH_MASTERS_WORKSPACE_ID);
  const inventory = Array.isArray(arg1) ? arg1 : (Array.isArray(arg2) ? arg2 : []);
  if (inventory.length === 0) return;
  try {
    const batch = writeBatch(db);
    for (const inv of inventory) {
      batch.set(doc(db, 'users', workspaceId, 'inventory', inv.productId), inv, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.error('Failed to save inventory to Firestore:', err);
  }
}

export async function saveUserStockLog(
  arg1: string | StockLogEntry,
  arg2?: StockLogEntry | string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const workspaceId = typeof arg1 === 'string' ? arg1 : (typeof arg2 === 'string' ? arg2 : BUTCH_MASTERS_WORKSPACE_ID);
  const log = typeof arg1 === 'object' ? (arg1 as StockLogEntry) : (typeof arg2 === 'object' ? (arg2 as StockLogEntry) : null);
  if (!log) return;
  try {
    await setDoc(doc(db, 'users', workspaceId, 'stock_logs', log.id), log, { merge: true });
  } catch (err) {
    console.error(`Failed to save stock log ${log.id} to Firestore:`, err);
  }
}

export async function saveUserExpense(
  arg1: string | MiscellaneousExpense,
  arg2?: MiscellaneousExpense | string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const workspaceId = typeof arg1 === 'string' ? arg1 : (typeof arg2 === 'string' ? arg2 : BUTCH_MASTERS_WORKSPACE_ID);
  const expense = typeof arg1 === 'object' ? (arg1 as MiscellaneousExpense) : (typeof arg2 === 'object' ? (arg2 as MiscellaneousExpense) : null);
  if (!expense) return;
  try {
    await setDoc(doc(db, 'users', workspaceId, 'miscellaneous_expenses', expense.id), expense, { merge: true });
  } catch (err) {
    console.error(`Failed to save expense ${expense.id} to Firestore:`, err);
  }
}

export async function deleteUserExpense(
  arg1: string,
  arg2?: string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const workspaceId = arg2 ? arg1 : BUTCH_MASTERS_WORKSPACE_ID;
  const expenseId = arg2 ? arg2 : arg1;
  try {
    await deleteDoc(doc(db, 'users', workspaceId, 'miscellaneous_expenses', expenseId));
  } catch (err) {
    console.error(`Failed to delete expense ${expenseId} from Firestore:`, err);
  }
}

export async function saveUserSettings(
  arg1: string | CurrencyConfig,
  arg2?: CurrencyConfig | string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const workspaceId = typeof arg1 === 'string' ? arg1 : (typeof arg2 === 'string' ? arg2 : BUTCH_MASTERS_WORKSPACE_ID);
  const currency = typeof arg1 === 'object' ? (arg1 as CurrencyConfig) : (typeof arg2 === 'object' ? (arg2 as CurrencyConfig) : null);
  if (!currency) return;
  try {
    await setDoc(doc(db, 'users', workspaceId, 'settings', 'config'), {
      businessName: 'Butch Master',
      currencyCode: currency.code,
      currencySymbol: currency.symbol,
      currencyName: currency.name,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Failed to save settings to Firestore:', err);
  }
}

// ============================================================================
// Cloud Data Migration & Synchronization
// ============================================================================

export interface MigrationPayload {
  costItems: CostItem[];
  products: YoghurtProduct[];
  orders: OrderRecord[];
  inventory: InventoryStockRecord[];
  stockLogs: StockLogEntry[];
  miscellaneousExpenses: MiscellaneousExpense[];
  currency: CurrencyConfig;
}

export interface MigrationResult {
  success: boolean;
  counts: {
    costItems: number;
    products: number;
    orders: number;
    inventory: number;
    stockLogs: number;
    miscellaneousExpenses: number;
    settings: number;
  };
  timestamp: string;
  errorMessage?: string;
}

/**
 * Safely transfers all local records into Firestore for the target user without deleting local data.
 * All historical order snapshot calculations and timestamps are preserved.
 */
export async function migrateLocalDataToFirestore(payload: MigrationPayload, targetUserId?: string): Promise<MigrationResult> {
  const db = getFirebaseDb();
  if (!db) {
    return {
      success: false,
      counts: { costItems: 0, products: 0, orders: 0, inventory: 0, stockLogs: 0, miscellaneousExpenses: 0, settings: 0 },
      timestamp: new Date().toISOString(),
      errorMessage: 'Firebase is not configured. Missing environment variables: ' + getMissingFirebaseVariables().join(', '),
    };
  }

  const currentAuth = getFirebaseAuth();
  const userId = targetUserId || currentAuth?.currentUser?.uid || BUTCH_MASTERS_WORKSPACE_ID;

  if (!userId) {
    return {
      success: false,
      counts: { costItems: 0, products: 0, orders: 0, inventory: 0, stockLogs: 0, miscellaneousExpenses: 0, settings: 0 },
      timestamp: new Date().toISOString(),
      errorMessage: 'Firestore workspace is not specified.',
    };
  }

  try {
    // 0. Ensure root user document exists
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      userId,
      lastActive: new Date().toISOString(),
    }, { merge: true });

    // 1. Migrate Cost Items in batches
    if (payload.costItems && payload.costItems.length > 0) {
      const costBatch = writeBatch(db);
      for (const item of payload.costItems) {
        const ref = doc(db, 'users', userId, 'cost_items', item.id);
        costBatch.set(ref, {
          id: item.id,
          name: item.name,
          productId: item.productId,
          unitPricePerBottle: item.unitPricePerBottle,
          notes: item.notes || '',
          lastUpdated: item.lastUpdated || new Date().toISOString(),
          priceHistory: item.priceHistory || [],
        }, { merge: true });
      }
      await costBatch.commit();
    }

    // 2. Migrate Products
    if (payload.products && payload.products.length > 0) {
      const prodBatch = writeBatch(db);
      for (const prod of payload.products) {
        const ref = doc(db, 'users', userId, 'products', prod.id);
        prodBatch.set(ref, {
          id: prod.id,
          name: prod.name,
          size: prod.size,
          productType: prod.productType || 'Standard',
          category: prod.category || 'yoghurt',
          description: prod.description || '',
          sellingPrice: prod.sellingPrice ?? 0,
        }, { merge: true });
      }
      await prodBatch.commit();
    }

    // 3. Migrate Orders (CRITICAL: Locks exact historical snapshots)
    if (payload.orders && payload.orders.length > 0) {
      const orderBatch = writeBatch(db);
      for (const ord of payload.orders) {
        const ref = doc(db, 'users', userId, 'orders', ord.id);
        orderBatch.set(ref, {
          id: ord.id,
          referenceNumber: ord.referenceNumber,
          date: ord.date,
          customerName: ord.customerName || '',
          customerPhone: ord.customerPhone || '',
          notes: ord.notes || '',
          items: ord.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productType: item.productType,
            size: item.size,
            quantity: item.quantity,
            unitPrice: item.unitPrice ?? 0,
            unitCost: item.unitCost ?? 0,
          })),
          createdAt: ord.createdAt || new Date().toISOString(),
        }, { merge: true });
      }
      await orderBatch.commit();
    }

    // 4. Migrate Inventory Balances
    if (payload.inventory && payload.inventory.length > 0) {
      const invBatch = writeBatch(db);
      for (const inv of payload.inventory) {
        const ref = doc(db, 'users', userId, 'inventory', inv.productId);
        invBatch.set(ref, {
          productId: inv.productId,
          productName: inv.productName,
          productType: inv.productType,
          size: inv.size,
          currentStock: inv.currentStock,
          lastUpdated: inv.lastUpdated || new Date().toISOString(),
        }, { merge: true });
      }
      await invBatch.commit();
    }

    // 5. Migrate Stock Logs (Audit records)
    if (payload.stockLogs && payload.stockLogs.length > 0) {
      const logBatch = writeBatch(db);
      for (const log of payload.stockLogs) {
        const ref = doc(db, 'users', userId, 'stock_logs', log.id);
        logBatch.set(ref, {
          id: log.id,
          date: log.date,
          productId: log.productId,
          changeType: log.changeType,
          quantityChange: log.quantityChange,
          notes: log.notes || '',
          createdAt: log.createdAt || new Date().toISOString(),
        }, { merge: true });
      }
      await logBatch.commit();
    }

    // 6. Migrate Miscellaneous Expenses
    if (payload.miscellaneousExpenses && payload.miscellaneousExpenses.length > 0) {
      const expBatch = writeBatch(db);
      for (const exp of payload.miscellaneousExpenses) {
        const ref = doc(db, 'users', userId, 'miscellaneous_expenses', exp.id);
        expBatch.set(ref, {
          id: exp.id,
          description: exp.description,
          amount: exp.amount,
          date: exp.date,
          notes: exp.notes || '',
          createdAt: exp.createdAt || new Date().toISOString(),
        }, { merge: true });
      }
      await expBatch.commit();
    }

    // 7. Migrate Settings
    const settingsRef = doc(db, 'users', userId, 'settings', 'config');
    await setDoc(settingsRef, {
      businessName: 'Butch Master',
      currencyCode: payload.currency.code,
      currencySymbol: payload.currency.symbol,
      currencyName: payload.currency.name,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return {
      success: true,
      counts: {
        costItems: payload.costItems?.length || 0,
        products: payload.products?.length || 0,
        orders: payload.orders?.length || 0,
        inventory: payload.inventory?.length || 0,
        stockLogs: payload.stockLogs?.length || 0,
        miscellaneousExpenses: payload.miscellaneousExpenses?.length || 0,
        settings: 1,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
}

/**
 * Reads all business collections from Firestore for the given user.
 */
export async function fetchAllDataFromFirestore(targetUserId?: string): Promise<MigrationPayload | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const currentAuth = getFirebaseAuth();
  const userId = targetUserId || currentAuth?.currentUser?.uid || BUTCH_MASTERS_WORKSPACE_ID;

  if (!userId) return null;

  try {
    const data = await loadUserDataFromFirestore(userId);
    return {
      costItems: data.costItems,
      products: data.products,
      orders: data.orders,
      inventory: data.inventory,
      stockLogs: data.stockLogs,
      miscellaneousExpenses: data.miscellaneousExpenses,
      currency: data.currency,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}`);
  }
}

/**
 * Returns current Cloud Sync diagnostic status.
 */
export function getCloudSyncStatus(): CloudSyncInfo {
  const isConfigured = isFirebaseConfigured();
  const missing = getMissingFirebaseVariables();
  if (!isConfigured) {
    return {
      state: 'not_configured',
      isConfigured: false,
      missingEnvVars: missing,
      errorMessage: `Firebase environment variables missing: ${missing.join(', ')}`,
    };
  }
  return {
    state: 'connected',
    isConfigured: true,
    missingEnvVars: [],
  };
}


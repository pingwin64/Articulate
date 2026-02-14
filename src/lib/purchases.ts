import type { PurchasesPackage } from 'react-native-purchases';
import { useSettingsStore } from './store/settings';

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? '';
const ENTITLEMENT_ID = 'Articulate Pro';

let isInitialized = false;
let Purchases: any = null;
let LOG_LEVEL: any = null;

try {
  const mod = require('react-native-purchases');
  Purchases = mod.default;
  LOG_LEVEL = mod.LOG_LEVEL;
} catch {
  // Native module not available — purchases disabled
}

export async function initPurchases(): Promise<void> {
  if (!Purchases || isInitialized) return;

  Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  await Purchases.configure({ apiKey: API_KEY });
  isInitialized = true;

  // Persist RevenueCat app_user_id as deviceUserId for server-side identification
  try {
    const rcUserId = await Purchases.getAppUserID();
    if (rcUserId) {
      useSettingsStore.setState({ deviceUserId: rcUserId });
    }
  } catch {
    // Falls back to existing UUID stored in MMKV
  }

  Purchases.addCustomerInfoUpdateListener((info: any) => {
    const isPremium = !!info.entitlements.active[ENTITLEMENT_ID];
    const store = useSettingsStore.getState();
    if (store.isPremium !== isPremium) {
      useSettingsStore.setState({ isPremium });
    }
  });

  await checkEntitlement();
}

export async function checkEntitlement(): Promise<boolean> {
  if (!Purchases) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    const isPremium = !!info.entitlements.active[ENTITLEMENT_ID];
    useSettingsStore.setState({ isPremium });
    return isPremium;
  } catch {
    return false;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  if (!Purchases) return false;
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPremium = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    useSettingsStore.setState({ isPremium });
    return isPremium;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'userCancelled' in error && error.userCancelled) {
      return false;
    }
    throw error;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!Purchases) return false;
  try {
    const info = await Purchases.restorePurchases();
    const isPremium = !!info.entitlements.active[ENTITLEMENT_ID];
    useSettingsStore.setState({ isPremium });
    return isPremium;
  } catch {
    return false;
  }
}

export const CONSUMABLE_PRODUCTS = {
  STREAK_RESTORE_FREE: 'streak_restore_199',
  STREAK_RESTORE_PRO: 'streak_restore_099',
} as const;

export async function purchaseConsumable(productId: string): Promise<boolean> {
  if (!Purchases) return false;
  try {
    const products = await Purchases.getProducts([productId]);
    if (products.length === 0) throw new Error(`Product ${productId} not found`);
    await Purchases.purchaseStoreProduct(products[0]);
    return true;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'userCancelled' in error && error.userCancelled) {
      return false;
    }
    throw error;
  }
}

export async function getOfferings(): Promise<PurchasesPackage[]> {
  if (!Purchases) return [];
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current?.availablePackages) {
      return offerings.current.availablePackages;
    }
    return [];
  } catch {
    return [];
  }
}

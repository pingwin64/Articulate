import Purchases, {
  LOG_LEVEL,
  type PurchasesPackage,
  type CustomerInfo,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { useSettingsStore } from './store/settings';

const API_KEY = 'test_ytkjVCdVydzdJOcBDhNqDIcpIqt';
const ENTITLEMENT_ID = 'Articulate Pro';

let isInitialized = false;

export async function initPurchases(): Promise<void> {
  if (isInitialized) return;

  Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  await Purchases.configure({ apiKey: API_KEY });
  isInitialized = true;

  // Listen for customer info changes (e.g. renewal, expiration)
  Purchases.addCustomerInfoUpdateListener((info: CustomerInfo) => {
    const isPremium = !!info.entitlements.active[ENTITLEMENT_ID];
    const store = useSettingsStore.getState();
    if (store.isPremium !== isPremium) {
      useSettingsStore.setState({ isPremium });
    }
  });

  // Check entitlement on init
  await checkEntitlement();
}

export async function checkEntitlement(): Promise<boolean> {
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
  try {
    const info = await Purchases.restorePurchases();
    const isPremium = !!info.entitlements.active[ENTITLEMENT_ID];
    useSettingsStore.setState({ isPremium });
    return isPremium;
  } catch {
    return false;
  }
}

export async function getOfferings(): Promise<PurchasesPackage[]> {
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

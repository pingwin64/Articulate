// Stub for react-native-mmkv in test environment
const store = new Map<string, string>();

export class MMKV {
  constructor(_opts?: any) {}
  getString(key: string) { return store.get(key); }
  set(key: string, value: string) { store.set(key, value); }
  remove(key: string) { store.delete(key); }
  clearAll() { store.clear(); }
}

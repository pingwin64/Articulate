import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSettingsStore } from '../lib/store/settings';
import { Paywall } from '../components/Paywall';
import type { PaywallContext } from '../lib/store/settings';

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ context?: string }>();
  const { setPaywallContext } = useSettingsStore();

  const handleDismiss = () => {
    setPaywallContext(null);
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <Paywall
      visible={true}
      inline
      onDismiss={handleDismiss}
      context={(params.context as PaywallContext) ?? null}
    />
  );
}

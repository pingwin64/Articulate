/**
 * Shared edge function fetch wrapper.
 * Adds x-user-id header for server-side rate limiting and analytics.
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';
import { useSettingsStore } from './store/settings';

export class RateLimitError extends Error {
  retryAfter: number;
  constructor(retryAfter: number) {
    super('Rate limit exceeded. Please try again later.');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class PremiumRequiredError extends Error {
  constructor() {
    super('This feature requires a premium subscription.');
    this.name = 'PremiumRequiredError';
  }
}

const FETCH_TIMEOUT_MS = 30000;

export async function callEdgeFunction(
  action: string,
  payload: Record<string, unknown>
): Promise<Response> {
  const userId = useSettingsStore.getState().deviceUserId || 'anonymous';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'x-user-id': userId,
      },
      body: JSON.stringify({ action, ...payload }),
      signal: controller.signal,
    });

    if (response.status === 429) {
      const body = await response.json().catch(() => null);
      throw new RateLimitError(body?.retryAfter ?? 3600);
    }

    if (response.status === 403) {
      throw new PremiumRequiredError();
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

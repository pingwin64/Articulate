import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const REVENUECAT_WEBHOOK_SECRET = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Events that grant premium access
const PREMIUM_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "SUBSCRIPTION_EXTENDED",
  "NON_RENEWING_PURCHASE",
  "PRODUCT_CHANGE",
]);

// Events that revoke premium access
const REVOKE_EVENTS = new Set([
  "EXPIRATION",
  "REFUND",
]);

// Grace period: still premium until expires_at
const GRACE_EVENTS = new Set(["CANCELLATION", "BILLING_ISSUE"]);

Deno.serve(async (req: Request) => {
  // Only allow POST
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // Verify webhook secret (required — reject all requests if not configured)
  if (!REVENUECAT_WEBHOOK_SECRET) {
    console.error("REVENUECAT_WEBHOOK_SECRET not configured");
    return json({ error: "Webhook not configured" }, 500);
  }
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (token !== REVENUECAT_WEBHOOK_SECRET) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await req.json();
    const event = body?.event;

    if (!event) {
      return json({ error: "No event in payload" }, 400);
    }

    const eventType: string = event.type ?? "";
    const appUserId: string = event.app_user_id ?? "";
    const originalAppUserId: string = event.original_app_user_id ?? "";
    const productId: string = event.product_id ?? "";
    const expirationAtMs: number | null = event.expiration_at_ms ?? null;

    if (!appUserId && !originalAppUserId) {
      return json({ error: "No user ID in event" }, 400);
    }

    const expiresAt = expirationAtMs
      ? new Date(expirationAtMs).toISOString()
      : null;

    // Determine premium status based on event type
    let isPremium: boolean;
    if (PREMIUM_EVENTS.has(eventType)) {
      isPremium = true;
    } else if (REVOKE_EVENTS.has(eventType)) {
      isPremium = false;
    } else if (GRACE_EVENTS.has(eventType)) {
      // Cancelled/billing issue — still premium until expiration
      isPremium = expiresAt ? new Date(expiresAt) > new Date() : false;
    } else {
      // Unknown event type — log it but don't fail
      console.log(`Unknown RevenueCat event type: ${eventType}`);
      return json({ status: "ignored", eventType });
    }

    // Upsert for both app_user_id and original_app_user_id (handles aliases)
    const userIds = [appUserId, originalAppUserId].filter(Boolean);
    const uniqueIds = [...new Set(userIds)];

    for (const userId of uniqueIds) {
      const { error } = await supabase
        .from("user_subscriptions")
        .upsert(
          {
            rc_user_id: userId,
            is_premium: isPremium,
            product_id: productId || null,
            expires_at: expiresAt,
            last_event_type: eventType,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "rc_user_id" }
        );

      if (error) {
        console.error(`Failed to upsert subscription for ${userId}:`, error);
      }
    }

    return json({
      status: "ok",
      eventType,
      userIds: uniqueIds,
      isPremium,
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return json(
      { error: err instanceof Error ? err.message : "Internal error" },
      500
    );
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

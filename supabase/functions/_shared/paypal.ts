// Minimal PayPal REST client for Orders v2 (Sandbox / Live).

const MODE = (Deno.env.get("PAYPAL_MODE") ?? "sandbox").toLowerCase();
const BASE =
  MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

let cachedToken: { value: string; expires_at: number } | null = null;

export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expires_at > now + 30_000) {
    return cachedToken.value;
  }
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  if (!clientId || !secret) {
    throw new Error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET no configurados");
  }
  const basic = btoa(`${clientId}:${secret}`);
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error(`PayPal auth falló: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  cachedToken = {
    value: json.access_token,
    expires_at: now + (json.expires_in ?? 3000) * 1000,
  };
  return cachedToken.value;
}

export async function createOrder(opts: {
  amountUsd: number;
  referenceId: string;
  description: string;
}): Promise<{ id: string; status: string; raw: unknown }> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: opts.referenceId,
          description: opts.description.slice(0, 127),
          amount: {
            currency_code: "USD",
            value: opts.amountUsd.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: "MoodleMoot Perú 2026",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    }),
  });
  const raw = await res.json();
  if (!res.ok) {
    throw new Error(
      `PayPal create order falló: ${res.status} ${JSON.stringify(raw)}`,
    );
  }
  return { id: raw.id, status: raw.status, raw };
}

export async function captureOrder(
  orderId: string,
): Promise<{ status: string; captureId: string | null; raw: any }> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const raw = await res.json();
  if (!res.ok) {
    throw new Error(
      `PayPal capture falló: ${res.status} ${JSON.stringify(raw)}`,
    );
  }
  const captureId =
    raw?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
  return { status: raw.status, captureId, raw };
}

export async function verifyWebhookSignature(
  headers: Headers,
  rawBody: string,
): Promise<boolean> {
  const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
  if (!webhookId || webhookId === "pending") {
    // Fail-closed: sin webhook_id configurado, rechazar todo (no aceptar eventos forjados).
    console.error("PAYPAL_WEBHOOK_ID no configurado — rechazando webhook");
    return false;
  }
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  });
  if (!res.ok) return false;
  const j = await res.json();
  return j.verification_status === "SUCCESS";
}

// Firma HMAC del ticket_id para QR seguro.
const enc = new TextEncoder();

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32); // 128 bits es suficiente
}

export async function signTicket(ticketId: string): Promise<string> {
  const secret = Deno.env.get("TICKET_SIGNING_SECRET");
  if (!secret) throw new Error("TICKET_SIGNING_SECRET no configurado");
  return await hmac(secret, ticketId);
}

export async function verifyTicket(
  ticketId: string,
  signature: string,
): Promise<boolean> {
  const expected = await signTicket(ticketId);
  // comparación constante simple
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

export function ticketCheckInUrl(
  origin: string,
  ticketId: string,
  signature: string,
): string {
  const o = origin.replace(/\/$/, "");
  return `${o}/panel/check-in?t=${encodeURIComponent(ticketId)}&s=${signature}`;
}

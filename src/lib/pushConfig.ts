// Clave VAPID pública (puede ir en el bundle sin riesgo).
export const VAPID_PUBLIC_KEY =
  "BJ5GzaCrloyK6HEVyiafseHaVvY5-PDUZCfEkIetpOwCPCx4BGYtBvpcN4wf57hZkUGrhcbYU_ylA2HCBVXwAH0";

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

export function isPreviewOrIframe(): boolean {
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const h = window.location.hostname;
  return h.includes("lovableproject.com") || h.includes("id-preview--") || h.includes("lovable.app");
}

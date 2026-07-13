import { corsHeaders } from "../_shared/cors.ts";

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID") ?? "";
  const mode = (Deno.env.get("PAYPAL_MODE") ?? "sandbox").toLowerCase();
  return new Response(
    JSON.stringify({ clientId, mode, currency: "USD" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});

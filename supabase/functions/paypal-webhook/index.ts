import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyWebhookSignature } from "../_shared/paypal.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const raw = await req.text();
    const ok = await verifyWebhookSignature(req.headers, raw);
    if (!ok) {
      console.warn("Webhook firma inválida");
      return new Response("invalid signature", { status: 401, headers: corsHeaders });
    }
    const evt = JSON.parse(raw);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const type = evt?.event_type as string;
    const resource = evt?.resource ?? {};
    const orderId =
      resource?.supplementary_data?.related_ids?.order_id ??
      resource?.id ??
      null;

    if (!orderId) {
      console.log("Webhook sin orderId", type);
      return new Response("ok", { headers: corsHeaders });
    }

    const newStatus =
      type === "PAYMENT.CAPTURE.COMPLETED"
        ? "completed"
        : type === "PAYMENT.CAPTURE.DENIED"
          ? "denied"
          : type === "PAYMENT.CAPTURE.REFUNDED"
            ? "refunded"
            : null;

    if (newStatus) {
      await supabase
        .from("payments")
        .update({ status: newStatus, raw_payload: evt as any })
        .eq("provider_order_id", orderId);

      if (newStatus === "refunded") {
        const { data: pay } = await supabase
          .from("payments")
          .select("registration_id")
          .eq("provider_order_id", orderId)
          .maybeSingle();
        if (pay?.registration_id) {
          await supabase
            .from("event_registrations")
            .update({ payment_status: "refunded" })
            .eq("id", pay.registration_id);
        }
      }
    }
    return new Response("ok", { headers: corsHeaders });
  } catch (e) {
    console.error(e);
    return new Response("error", { status: 500, headers: corsHeaders });
  }
});

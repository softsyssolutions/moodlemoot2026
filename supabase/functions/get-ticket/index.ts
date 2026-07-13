import { createClient } from "npm:@supabase/supabase-js@2";
import QRCode from "npm:qrcode@1.5.4";
import { corsHeaders } from "../_shared/cors.ts";
import { signTicket, ticketCheckInUrl } from "../_shared/ticket.ts";

const PUBLIC_SITE = Deno.env.get("PUBLIC_SITE_URL") ?? "https://moodlemootperu.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const ticketId = url.searchParams.get("t");
    if (!ticketId) return json({ error: "ticket_id requerido" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: reg, error } = await supabase
      .from("event_registrations")
      .select("ticket_id, full_name, email, category, amount_paid, payment_status, coupon_code, created_at")
      .eq("ticket_id", ticketId)
      .maybeSingle();
    if (error) throw error;
    if (!reg) return json({ error: "ticket no encontrado" }, 404);

    let qrDataUrl: string | null = null;
    let checkInUrl: string | null = null;
    if (reg.payment_status === "paid") {
      const sig = await signTicket(reg.ticket_id);
      checkInUrl = ticketCheckInUrl(PUBLIC_SITE, reg.ticket_id, sig);
      qrDataUrl = await QRCode.toDataURL(checkInUrl, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 360,
      });
    }

    // Solo exponer email parcial por privacidad
    const emailMasked = reg.email.replace(/^(.).+(@.+)$/, "$1***$2");

    return json({
      ticket_id: reg.ticket_id,
      full_name: reg.full_name,
      email_masked: emailMasked,
      category: reg.category,
      amount_paid: Number(reg.amount_paid),
      payment_status: reg.payment_status,
      coupon_code: reg.coupon_code,
      qr_data_url: qrDataUrl,
      check_in_url: checkInUrl,
    });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

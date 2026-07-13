import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { createOrder } from "../_shared/paypal.ts";

const BASE_PRICE = 157;

interface Body {
  full_name: string;
  email: string;
  whatsapp: string;
  role_title: string;
  institution: string;
  institution_type: string;
  attendance_type: string;
  country: string;
  city: string;
  consent: boolean;
  coupon_code?: string | null;
  id_card_url?: string | null;
  event_id?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;

    // Validación básica
    const required: (keyof Body)[] = [
      "full_name","email","whatsapp","role_title","institution",
      "institution_type","attendance_type","country","city",
    ];
    for (const f of required) {
      if (!body[f] || String(body[f]).trim().length < 2) {
        return json({ error: `Campo inválido: ${f}` }, 400);
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return json({ error: "Email inválido" }, 400);
    }
    if (!body.consent) return json({ error: "Debes aceptar las comunicaciones" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Evento activo
    let eventId = body.event_id ?? null;
    if (!eventId) {
      const { data: ev } = await supabase
        .from("events")
        .select("id")
        .in("status", ["published", "live"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      eventId = ev?.id ?? null;
    }

    // Cupón
    let discount = 0;
    let category = "full";
    let requiresIdCard = false;
    let couponCode: string | null = null;
    if (body.coupon_code && body.coupon_code.trim()) {
      const { data: cd, error: cerr } = await supabase.rpc("validate_coupon", {
        _code: body.coupon_code,
      });
      if (cerr) throw cerr;
      const row = (cd as any[])?.[0];
      if (!row?.valid) {
        return json({ error: `Cupón inválido (${row?.reason ?? "not_found"})` }, 400);
      }
      discount = row.discount_percent ?? 0;
      category = row.category ?? "full";
      requiresIdCard = !!row.requires_id_card;
      couponCode = body.coupon_code.toUpperCase();
    }

    if (requiresIdCard && !body.id_card_url) {
      return json({ error: "Este cupón requiere foto del carné" }, 400);
    }

    const total = +(BASE_PRICE * (1 - discount / 100)).toFixed(2);

    // FREE (EDU100): insertar registro, marcar pagado y emitir ticket inmediatamente
    if (total === 0) {
      const { data: reg, error: regErr } = await supabase
        .from("event_registrations")
        .insert({
          event_id: eventId,
          full_name: body.full_name.trim(),
          email: body.email.trim().toLowerCase(),
          whatsapp: body.whatsapp,
          role_title: body.role_title,
          institution: body.institution,
          institution_type: body.institution_type,
          attendance_type: body.attendance_type,
          country: body.country,
          city: body.city,
          consent: body.consent,
          category,
          coupon_code: couponCode,
          id_card_url: body.id_card_url ?? null,
          amount_paid: 0,
          currency: "USD",
          payment_status: "paid",
          paid_at: new Date().toISOString(),
        })
        .select("id, ticket_id")
        .single();
      if (regErr) throw regErr;

      if (couponCode) await supabase.rpc("increment_coupon_use", { _code: couponCode });
      fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/issue-ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ registration_id: reg.id }),
      }).catch((e) => console.error("issue-ticket trigger", e));

      return json({
        free: true,
        registration_id: reg.id,
        ticket_id: reg.ticket_id,
        total: 0,
      });
    }

    // Pago con PayPal: NO insertamos registro hasta confirmar el pago en capture-paypal-order
    const tempRef = crypto.randomUUID();
    const order = await createOrder({
      amountUsd: total,
      referenceId: tempRef,
      description: `MoodleMoot Perú 2026 — ${body.email.trim().toLowerCase()}`,
    });

    return json({
      free: false,
      paypal_order_id: order.id,
      total,
      category,
      event_id: eventId,
      coupon_code: couponCode,
    });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

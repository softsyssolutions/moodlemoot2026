import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import { corsHeaders } from "../_shared/cors.ts";
import { captureOrder } from "../_shared/paypal.ts";

const BASE_PRICE = 157;

const RegistrationSchema = z.object({
  full_name: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(255),
  whatsapp: z.string().trim().min(4).max(40),
  role_title: z.string().trim().min(2).max(150),
  institution: z.string().trim().min(2).max(200),
  institution_type: z.enum(["privada", "publica", "universidad", "otra"]),
  attendance_type: z.enum(["presencial", "virtual", "hibrido"]),
  country: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  consent: z.literal(true),
  coupon_code: z.string().trim().max(60).nullable().optional(),
  id_card_url: z.string().trim().max(500).nullable().optional(),
  event_id: z.string().uuid().nullable().optional(),
  category: z.enum(["full", "staff50", "edu100"]).nullable().optional(),
});

const BodySchema = z.object({
  order_id: z.string().trim().min(3).max(100),
  registration: RegistrationSchema,
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: "Datos inválidos", details: parsed.error.flatten().fieldErrors }, 400);
    }
    const { order_id, registration: reg } = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Re-validate coupon server-side to compute expected price/category
    let serverCategory = "full";
    let serverCouponCode: string | null = null;
    let expectedAmount = BASE_PRICE;
    if (reg.coupon_code && reg.coupon_code.trim()) {
      const { data: cd, error: cerr } = await supabase.rpc("validate_coupon", {
        _code: reg.coupon_code,
      });
      if (cerr) throw cerr;
      const row = (cd as any[])?.[0];
      if (!row?.valid) {
        return json({ error: `Cupón inválido (${row?.reason ?? "not_found"})` }, 400);
      }
      const discount = row.discount_percent ?? 0;
      serverCategory = row.category ?? "full";
      serverCouponCode = reg.coupon_code.toUpperCase();
      expectedAmount = +(BASE_PRICE * (1 - discount / 100)).toFixed(2);
    }

    // Capturar pago en PayPal
    const cap = await captureOrder(order_id);
    const paid = cap.status === "COMPLETED";

    if (!paid) {
      // No insertamos nada si no se completó
      return json({ paid: false, status: cap.status }, 200);
    }

    const amount = Number(
      cap.raw?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?? 0,
    );

    // Verify captured amount matches the server-recomputed expected amount.
    // Allow tiny rounding tolerance.
    if (Math.abs(amount - expectedAmount) > 0.01) {
      console.error("amount mismatch", { amount, expectedAmount, serverCouponCode });
      return json({ error: "Monto pagado no coincide con el esperado" }, 400);
    }

    // Insertar registro SOLO ahora que el pago está confirmado
    const { data: newReg, error: regErr } = await supabase
      .from("event_registrations")
      .insert({
        event_id: reg.event_id ?? null,
        full_name: reg.full_name.trim(),
        email: reg.email.trim().toLowerCase(),
        whatsapp: reg.whatsapp,
        role_title: reg.role_title,
        institution: reg.institution,
        institution_type: reg.institution_type,
        attendance_type: reg.attendance_type,
        country: reg.country,
        city: reg.city,
        consent: reg.consent,
        category: serverCategory,
        coupon_code: serverCouponCode,
        id_card_url: reg.id_card_url ?? null,
        amount_paid: amount,
        currency: "USD",
        payment_status: "paid",
        paid_at: new Date().toISOString(),
      })
      .select("id, ticket_id")
      .single();
    if (regErr) throw regErr;

    // Registrar payment ya completado
    await supabase.from("payments").insert({
      registration_id: newReg.id,
      provider: "paypal",
      provider_order_id: order_id,
      provider_capture_id: cap.captureId,
      amount,
      currency: "USD",
      status: "completed",
      raw_payload: cap.raw as any,
    });

    // Only increment coupon use if the coupon was actually applied (server-validated)
    if (serverCouponCode) {
      await supabase.rpc("increment_coupon_use", { _code: serverCouponCode });
    }

    // Disparar issue-ticket
    fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/issue-ticket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({ registration_id: newReg.id }),
    }).catch((e) => console.error("issue-ticket trigger", e));

    return json({
      paid: true,
      registration_id: newReg.id,
      ticket_id: newReg.ticket_id,
      amount,
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

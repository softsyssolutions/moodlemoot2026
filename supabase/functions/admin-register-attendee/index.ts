import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { corsHeaders } from "../_shared/cors.ts";

const Schema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255).transform((v) => v.toLowerCase()),
  whatsapp: z.string().trim().min(4).max(30),
  role_title: z.string().trim().min(1).max(120),
  institution: z.string().trim().min(1).max(160),
  institution_type: z.enum(["privada", "publica", "universidad", "otra"]).default("otra"),
  attendance_type: z.enum(["presencial", "virtual", "hibrido"]).default("presencial"),
  country: z.string().trim().min(2).max(80),
  city: z.string().trim().min(1).max(80),
  category: z.enum(["full", "edu100", "staff50", "education", "staff"]).default("full"),
  payment_method: z.enum(["paypal", "transferencia", "efectivo", "cortesia", "otro"]).default("transferencia"),
  amount_paid: z.number().min(0).default(0),
  currency: z.string().trim().length(3).default("USD"),
  coupon_code: z.string().trim().max(64).optional().nullable(),
  internal_notes: z.string().trim().max(2000).optional().nullable(),
  event_id: z.string().uuid().optional().nullable(),
  send_email: z.boolean().default(true),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
    if (!jwt) return json({ error: "No autorizado" }, 401);

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userRes, error: uErr } = await userClient.auth.getUser();
    if (uErr || !userRes.user) return json({ error: "Sesión inválida" }, 401);
    const uid = userRes.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isStaff } = await admin.rpc("is_staff_or_above", { _user_id: uid });
    if (!isStaff) return json({ error: "Se requiere staff/admin" }, 403);

    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return json({ error: "validation", details: parsed.error.flatten() }, 400);
    }
    const d = parsed.data;

    // Resolve active event if not provided
    let event_id = d.event_id ?? null;
    if (!event_id) {
      const { data: ev } = await admin
        .from("events")
        .select("id")
        .in("status", ["published", "live"])
        .order("start_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      event_id = ev?.id ?? null;
    }

    // Upsert registration by (event_id, email)
    const payload = {
      event_id,
      full_name: d.full_name,
      email: d.email,
      whatsapp: d.whatsapp,
      role_title: d.role_title,
      institution: d.institution,
      institution_type: d.institution_type,
      attendance_type: d.attendance_type,
      country: d.country,
      city: d.city,
      consent: true,
      category: d.category,
      payment_status: "paid",
      amount_paid: d.amount_paid,
      currency: d.currency,
      coupon_code: d.coupon_code ?? null,
      internal_notes: d.internal_notes ?? null,
      payment_method: d.payment_method,
      is_manual: true,
      registered_by: uid,
      paid_at: new Date().toISOString(),
    };

    const { data: upserted, error: dbErr } = await admin
      .from("event_registrations")
      .upsert(payload, { onConflict: "event_id,email" })
      .select()
      .single();
    if (dbErr) return json({ error: dbErr.message }, 400);

    // Optionally send ticket email
    if (d.send_email) {
      try {
        const r = await fetch(`${SUPABASE_URL}/functions/v1/issue-ticket`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SERVICE_KEY}`,
          },
          body: JSON.stringify({ registration_id: upserted.id }),
        });
        if (!r.ok) console.error("issue-ticket failed", r.status, await r.text());
      } catch (e) {
        console.error("issue-ticket error", e);
      }
    }

    return json({ ok: true, registration: upserted });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { corsHeaders } from "../_shared/cors.ts";

const emptyToUndef = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const RowSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255).transform((v) => v.toLowerCase()),
  whatsapp: z.preprocess(emptyToUndef, z.string().trim().max(40).optional().nullable()),
  role_title: z.preprocess(emptyToUndef, z.string().trim().max(160).optional().default("—")),
  institution: z.preprocess(emptyToUndef, z.string().trim().max(200).optional().default("—")),
  institution_type: z.preprocess(emptyToUndef, z.enum(["privada", "publica", "universidad", "otra"]).default("otra")),
  attendance_type: z.preprocess(emptyToUndef, z.enum(["presencial", "virtual", "hibrido"]).default("presencial")),
  country: z.preprocess(emptyToUndef, z.string().trim().max(120).default("Perú")),
  city: z.preprocess(emptyToUndef, z.string().trim().max(120).default("Lima")),
  category: z.preprocess(emptyToUndef, z.enum(["full", "edu100", "staff50", "education", "staff"]).default("full")),
  payment_status: z.preprocess(emptyToUndef, z.enum(["pending", "paid"]).default("paid")),
  payment_method: z.preprocess(emptyToUndef, z.enum(["paypal", "transferencia", "efectivo", "cortesia", "otro"]).default("transferencia")),
  amount_paid: z.number().min(0).default(0),
  currency: z.preprocess(emptyToUndef, z.string().trim().length(3).default("USD")),
  coupon_code: z.preprocess(emptyToUndef, z.string().trim().max(64).optional().nullable()),
  internal_notes: z.preprocess(emptyToUndef, z.string().trim().max(4000).optional().nullable()),
});

const Schema = z.object({
  rows: z.array(z.record(z.any())).min(1).max(1000),
  event_id: z.string().uuid().optional().nullable(),
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

    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "validation", details: parsed.error.flatten() }, 400);

    let event_id = parsed.data.event_id ?? null;
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

    const errors: { index: number; email?: string; error: string }[] = [];
    const valid: Record<string, unknown>[] = [];
    parsed.data.rows.forEach((raw, i) => {
      // Coerce amount_paid to number if string
      if (typeof raw.amount_paid === "string") {
        const n = Number((raw.amount_paid as string).replace(",", "."));
        if (!Number.isNaN(n)) raw.amount_paid = n;
      }
      const r = RowSchema.safeParse(raw);
      if (!r.success) {
        errors.push({ index: i, email: (raw as any).email, error: JSON.stringify(r.error.flatten().fieldErrors) });
        return;
      }
      valid.push({
        event_id,
        consent: true,
        is_manual: true,
        registered_by: uid,
        paid_at: r.data.payment_status === "paid" ? new Date().toISOString() : null,
        ...r.data,
      });
    });

    let created = 0;
    let updated = 0;
    if (valid.length > 0) {
      // Detect existing by (event_id, email) to count created vs updated
      const emails = valid.map((v) => v.email as string);
      const { data: existing } = await admin
        .from("event_registrations")
        .select("email")
        .eq("event_id", event_id!)
        .in("email", emails);
      const existingSet = new Set((existing ?? []).map((r: any) => r.email));

      // De-dup within the same batch to avoid "ON CONFLICT DO UPDATE affects row twice"
      const dedup = new Map<string, Record<string, unknown>>();
      for (const v of valid) dedup.set(`${event_id}|${v.email}`, v);
      const toUpsert = Array.from(dedup.values());

      const { error: upErr } = await admin
        .from("event_registrations")
        .upsert(toUpsert, { onConflict: "event_id,email" });
      if (upErr) return json({ error: upErr.message }, 400);

      for (const v of valid) {
        if (existingSet.has(v.email as string)) updated++;
        else created++;
      }
    }

    return json({ ok: true, created, updated, errors });
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

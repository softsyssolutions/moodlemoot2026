import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { corsHeaders } from "../_shared/cors.ts";

const Schema = z.object({
  id: z.string().uuid(),
  patch: z.object({
    full_name: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().email().max(255).optional().transform((v) => v?.toLowerCase()),
    whatsapp: z.string().trim().min(4).max(30).optional(),
    role_title: z.string().trim().min(1).max(120).optional(),
    institution: z.string().trim().min(1).max(160).optional(),
    institution_type: z.enum(["privada", "publica", "universidad", "otra"]).optional(),
    attendance_type: z.enum(["presencial", "virtual", "hibrido"]).optional(),
    country: z.string().trim().min(2).max(80).optional(),
    city: z.string().trim().min(1).max(80).optional(),
    category: z.enum(["full", "edu100", "staff50", "education", "staff"]).optional(),
    payment_status: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
    payment_method: z.enum(["paypal", "transferencia", "efectivo", "cortesia", "otro"]).optional(),
    amount_paid: z.number().min(0).optional(),
    currency: z.string().trim().length(3).optional(),
    coupon_code: z.string().trim().max(64).nullable().optional(),
    internal_notes: z.string().trim().max(2000).nullable().optional(),
    checked_in: z.boolean().optional(),
  }),
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

    const patch: Record<string, unknown> = {
      ...parsed.data.patch,
      last_edited_by: uid,
      last_edited_at: new Date().toISOString(),
    };
    // Strip undefined
    for (const k of Object.keys(patch)) if (patch[k] === undefined) delete patch[k];

    const { data, error } = await admin
      .from("event_registrations")
      .update(patch)
      .eq("id", parsed.data.id)
      .select()
      .single();
    if (error) return json({ error: error.message }, 400);

    return json({ ok: true, registration: data });
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

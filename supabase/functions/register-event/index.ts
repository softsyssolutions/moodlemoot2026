import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BREVO_REGISTRATION_LIST_ID = 117;
const GATEWAY_URL = "https://connector-gateway.lovable.dev/brevo";

const Schema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255).transform((v) => v.toLowerCase()),
  whatsapp: z.string().trim().regex(/^\+\d{8,15}$/, "WhatsApp must be in E.164 format"),
  whatsapp_country_code: z.string().trim().length(2).optional(),
  whatsapp_dial_code: z.string().trim().regex(/^\d{1,4}$/).optional(),
  role_title: z.string().trim().min(2).max(120),
  institution: z.string().trim().min(2).max(160),
  institution_type: z.enum(["privada", "publica", "universidad", "otra"]),
  attendance_type: z.enum(["presencial", "virtual", "hibrido"]),
  country: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  consent: z.literal(true),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "validation", details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const data = parsed.data;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Resolve active event
    const { data: ev } = await supabase
      .from("events")
      .select("id")
      .in("status", ["published", "live"])
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const event_id = ev?.id ?? null;

    // Strip extra fields not stored in the DB table
    const { whatsapp_country_code, whatsapp_dial_code, ...dbData } = data;

    // Upsert registration
    const { error: dbErr } = await supabase
      .from("event_registrations")
      .upsert(
        { event_id, ...dbData },
        { onConflict: "event_id,email", ignoreDuplicates: false },
      );

    if (dbErr) {
      console.error("DB error:", dbErr);
      // continue — still try to push to Brevo
    }

    // Sync to Brevo
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

    if (LOVABLE_API_KEY && BREVO_API_KEY) {
      const attributes: Record<string, string> = {
        FIRSTNAME: data.full_name,
        WHATSAPP: data.whatsapp || "",
        WHATSAPP_NUMBER: data.whatsapp || "",
        CARGO: data.role_title || "",
        INSTITUCION: data.institution || "",
        EMPRESA: data.institution || "",
        MODALIDAD: data.attendance_type || "",
      };

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": BREVO_API_KEY,
      };

      const res = await fetch(`${GATEWAY_URL}/contacts`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: data.email,
          attributes,
          listIds: [BREVO_REGISTRATION_LIST_ID],
          updateEnabled: true,
        }),
      });

      // UPSERT forzado: si POST no responde 2xx (duplicate_parameter u otro), PUT con payload COMPLETO.
      if (!res.ok) {
        const errBody = await res.text();
        console.warn("Brevo POST contacts failed → forzando PUT", res.status, errBody);
        const putRes = await fetch(
          `${GATEWAY_URL}/contacts/${encodeURIComponent(data.email)}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({
              attributes,
              listIds: [BREVO_REGISTRATION_LIST_ID],
            }),
          },
        );
        const putBody = await putRes.text();
        console.log("Brevo PUT /contacts/{email}", putRes.status, putBody);
      }
    } else {
      console.warn("Brevo credentials missing — skipped CRM sync");
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("register-event error:", e);
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/brevo";
const BREVO_LIST_ID = 116;

const BodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurado");
    if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY no configurado");

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ ok: false, error: "Datos inválidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const { name, email } = parsed.data;

    const brevoHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": BREVO_API_KEY,
    };

    // Try create
    let res = await fetch(`${GATEWAY_URL}/contacts`, {
      method: "POST",
      headers: brevoHeaders,
      body: JSON.stringify({
        email,
        attributes: { FIRSTNAME: name },
        listIds: [BREVO_LIST_ID],
        updateEnabled: true,
      }),
    });

    if (!res.ok && res.status !== 204) {
      const errBody = await res.text();
      // If duplicate, ensure on list via PUT
      if (res.status === 400 && errBody.includes("duplicate_parameter")) {
        const putRes = await fetch(
          `${GATEWAY_URL}/contacts/${encodeURIComponent(email)}`,
          {
            method: "PUT",
            headers: brevoHeaders,
            body: JSON.stringify({
              attributes: { FIRSTNAME: name },
              listIds: [BREVO_LIST_ID],
            }),
          },
        );
        if (!putRes.ok && putRes.status !== 204) {
          const t = await putRes.text();
          throw new Error(`Brevo PUT falló [${putRes.status}]: ${t}`);
        }
      } else {
        throw new Error(`Brevo POST falló [${res.status}]: ${errBody}`);
      }
    }

    // Save locally
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await supabase
      .from("notification_subscribers")
      .upsert({ name, email }, { onConflict: "email" });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("subscribe-notifications error:", error);
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

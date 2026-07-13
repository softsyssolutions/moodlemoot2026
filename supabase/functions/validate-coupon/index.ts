import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const BASE_PRICE = 157;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ error: "Código requerido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data, error } = await supabase.rpc("validate_coupon", { _code: code });
    if (error) throw error;
    const row = (data as any[])?.[0];
    if (!row?.valid) {
      return new Response(
        JSON.stringify({
          valid: false,
          reason: row?.reason ?? "not_found",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const discount = row.discount_percent ?? 0;
    const total = +(BASE_PRICE * (1 - discount / 100)).toFixed(2);
    return new Response(
      JSON.stringify({
        valid: true,
        code: code.toUpperCase(),
        category: row.category,
        discount_percent: discount,
        requires_id_card: row.requires_id_card,
        base_price: BASE_PRICE,
        total,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

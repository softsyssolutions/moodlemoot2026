import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) return json({ error: "No autorizado" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Sesión inválida" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isAdmin, error: roleErr } = await admin.rpc("is_admin", { _user_id: userData.user.id });
    if (roleErr) return json({ error: "Error verificando permisos" }, 500);
    if (!isAdmin) return json({ error: "No autorizado" }, 403);

    const body = await req.json().catch(() => ({}));
    const path = typeof body?.path === "string" ? body.path : "";
    if (!path || path.includes("..") || path.startsWith("/")) {
      return json({ error: "Ruta inválida" }, 400);
    }

    const { data: signed, error: signErr } = await admin.storage
      .from("education-ids")
      .createSignedUrl(path, 3600);
    if (signErr || !signed?.signedUrl) {
      return json({ error: signErr?.message ?? "No se pudo firmar la URL" }, 500);
    }

    return json({ url: signed.signedUrl });
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

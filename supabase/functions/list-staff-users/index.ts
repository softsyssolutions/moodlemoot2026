import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "No autorizado." }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Sesión inválida." }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isAdmin, error: roleErr } = await admin.rpc("is_admin", { _user_id: userData.user.id });
    if (roleErr) return json({ error: "No se pudo verificar permisos.", detail: roleErr.message }, 500);
    if (!isAdmin) return json({ error: "Solo administradores pueden listar staff." }, 403);

    const { data: roles, error: rolesErr } = await admin
      .from("user_roles")
      .select("user_id, role, created_at")
      .eq("role", "staff");
    if (rolesErr) return json({ error: rolesErr.message }, 500);

    const users = await Promise.all(
      (roles ?? []).map(async (r) => {
        const { data: u } = await admin.auth.admin.getUserById(r.user_id);
        return {
          user_id: r.user_id,
          email: u?.user?.email ?? "—",
          full_name: (u?.user?.user_metadata as any)?.full_name ?? "",
          created_at: u?.user?.created_at ?? r.created_at,
        };
      })
    );

    users.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return json({ users, caller_id: userData.user.id });
  } catch (e) {
    return json({ error: "Error interno.", detail: (e as Error).message }, 500);
  }
});

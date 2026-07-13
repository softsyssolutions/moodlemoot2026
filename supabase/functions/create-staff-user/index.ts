import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BodySchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "No autorizado: falta token." }, 401);
    }

    // Verify caller identity
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ error: "Sesión inválida." }, 401);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Check admin role via RPC
    const { data: isAdmin, error: roleErr } = await admin.rpc("is_admin", { _user_id: userData.user.id });
    if (roleErr) return json({ error: "No se pudo verificar permisos.", detail: roleErr.message }, 500);
    if (!isAdmin) return json({ error: "Solo administradores pueden crear personal de staff." }, 403);

    const raw = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return json({ error: "Datos inválidos.", details: parsed.error.flatten().fieldErrors }, 400);
    }
    const { full_name, email, password } = parsed.data;

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });
    if (createErr || !created?.user) {
      const msg = createErr?.message ?? "Error desconocido";
      const friendly = /already/i.test(msg) ? "El correo ya está registrado." : msg;
      return json({ error: friendly }, 400);
    }

    const { error: roleInsertErr } = await admin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "staff" });

    if (roleInsertErr && !/duplicate|unique/i.test(roleInsertErr.message)) {
      return json({ error: "Usuario creado pero falló asignación de rol.", detail: roleInsertErr.message }, 500);
    }

    return json({ user_id: created.user.id, email: created.user.email });
  } catch (e) {
    return json({ error: "Error interno.", detail: (e as Error).message }, 500);
  }
});

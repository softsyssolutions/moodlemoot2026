import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
const ALLOWED_EXT = ["jpg", "jpeg", "png", "pdf"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    // Optional auth: if a JWT is present we scope by user_id, else by a random anon id.
    // The purchase flow is public, so authentication is not required.
    let ownerId = "anon";
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    if (token && token !== anonKey) {
      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: userData } = await authClient.auth.getUser(token);
      if (userData?.user?.id) ownerId = userData.user.id;
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return json({ error: "Archivo requerido" }, 400);
    if (file.size > MAX_BYTES) return json({ error: "Archivo > 5MB" }, 400);
    if (!ALLOWED.includes(file.type)) {
      return json({ error: "Tipo no permitido. Sube una imagen JPG/PNG o un PDF" }, 400);
    }

    const supabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const ext = (file.name.includes(".") ? file.name.split(".").pop() : "bin")!
      .toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return json({ error: "Extensión no permitida. Usa .jpg, .png o .pdf" }, 400);
    }
    const path = `uploads/${ownerId}/${crypto.randomUUID()}.${ext}`;
    const buf = new Uint8Array(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from("education-ids")
      .upload(path, buf, { contentType: file.type, upsert: false });
    if (error) throw error;

    return json({ ok: true, path });
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

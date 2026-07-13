import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "No autorizado" }, 401);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: u } = await anon.auth.getUser();
    if (!u?.user) return json({ error: "No autorizado" }, 401);
    const { data: staff } = await admin.rpc("is_staff", { _user_id: u.user.id });
    if (!staff) return json({ error: "Solo staff" }, 403);

    const { type, portal_id, publish = true } = await req.json();
    if (!type || !portal_id || (type !== "speaker" && type !== "sponsor")) {
      return json({ error: "Parámetros inválidos" }, 400);
    }

    const portalTable = type === "speaker" ? "speaker_portal" : "sponsor_portal";
    const { data: portal, error: pe } = await admin.from(portalTable).select("*").eq("id", portal_id).maybeSingle();
    if (pe || !portal) return json({ error: "Portal no encontrado" }, 404);

    const { data: vals } = await admin
      .from("requirement_values")
      .select("value_text, value_url, file_url, requirement:event_requirements(key)")
      .eq("portal_type", type)
      .eq("portal_id", portal_id);

    const byKey: Record<string, { text?: string; url?: string; file?: string }> = {};
    for (const v of (vals ?? []) as any[]) {
      const k = v.requirement?.key;
      if (!k) continue;
      byKey[k] = { text: v.value_text ?? undefined, url: v.value_url ?? undefined, file: v.file_url ?? undefined };
    }

    if (publish) {
      if (type === "speaker") {
        const socials: Record<string, string> = {};
        if (byKey.linkedin?.url) socials.linkedin = byKey.linkedin.url;
        if (byKey.socials?.url) socials.website = byKey.socials.url;
        const row = {
          event_id: portal.event_id,
          name: byKey.full_name?.text ?? portal.name,
          title: byKey.job_title?.text ?? null,
          bio: byKey.bio?.text ?? null,
          photo_url: byKey.photo?.file ?? null,
          socials,
          visible: true,
        };
        // Upsert by (event_id, name)
        const { data: existing } = await admin
          .from("event_speakers")
          .select("id")
          .eq("event_id", portal.event_id)
          .eq("name", row.name)
          .maybeSingle();
        if (existing?.id) await admin.from("event_speakers").update(row).eq("id", existing.id);
        else await admin.from("event_speakers").insert(row);
      } else {
        const row = {
          event_id: portal.event_id,
          name: byKey.company_name?.text ?? portal.name,
          logo_url: byKey.logo?.file ?? null,
          website_url: byKey.website?.url ?? null,
          description: byKey.description?.text ?? null,
          visible: true,
        };
        const { data: existing } = await admin
          .from("event_sponsors")
          .select("id")
          .eq("event_id", portal.event_id)
          .eq("name", row.name)
          .maybeSingle();
        if (existing?.id) await admin.from("event_sponsors").update(row).eq("id", existing.id);
        else await admin.from("event_sponsors").insert(row);
      }
    }

    await admin.from(portalTable).update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: u.user.id,
    }).eq("id", portal_id);

    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

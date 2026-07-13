import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:info@moodlemootperu.com";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validar admin
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "No autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: userId });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Permisos insuficientes" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { title, body: msg, url, icon_url, target = "all", event_id = null } = body ?? {};
    if (!title || !msg) {
      return new Response(JSON.stringify({ error: "Título y cuerpo son obligatorios." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Crear campaña
    const { data: campaign, error: campErr } = await supabase
      .from("push_campaigns")
      .insert({
        title,
        body: msg,
        url: url ?? null,
        icon_url: icon_url ?? null,
        target,
        event_id,
        created_by: userId,
        status: "sending",
      })
      .select()
      .single();
    if (campErr) throw campErr;

    // Buscar suscripciones activas
    let query = supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .is("revoked_at", null);

    if (target === "event" && event_id) query = query.eq("event_id", event_id);
    if (target === "self") query = query.eq("user_id", userId);

    const { data: subs, error: subsErr } = await query;
    if (subsErr) throw subsErr;

    const payload = JSON.stringify({
      title,
      body: msg,
      url: url ?? "/",
      icon: icon_url ?? "/icons/icon-512.png",
      tag: `mm-${campaign.id}`,
      timestamp: Date.now(),
      requireInteraction: true,
    });

    let sent = 0;
    let failed = 0;
    const revoked: string[] = [];

    await Promise.all(
      (subs ?? []).map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload
          );
          sent++;
        } catch (err: any) {
          failed++;
          const status = err?.statusCode;
          if (status === 404 || status === 410) revoked.push(s.id);
          console.warn("push fail:", status, err?.body);
        }
      })
    );

    if (revoked.length) {
      await supabase
        .from("push_subscriptions")
        .update({ revoked_at: new Date().toISOString() })
        .in("id", revoked);
    }

    await supabase
      .from("push_campaigns")
      .update({
        status: "sent",
        sent_count: sent,
        failed_count: failed,
        sent_at: new Date().toISOString(),
      })
      .eq("id", campaign.id);

    return new Response(JSON.stringify({ ok: true, sent, failed, campaign_id: campaign.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-push-campaign error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

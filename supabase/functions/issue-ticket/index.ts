import { createClient } from "npm:@supabase/supabase-js@2";
import QRCode from "npm:qrcode@1.5.4";
import { corsHeaders } from "../_shared/cors.ts";
import { signTicket, ticketCheckInUrl } from "../_shared/ticket.ts";

const PUBLIC_SITE = Deno.env.get("PUBLIC_SITE_URL") ?? "https://moodlemootperu.com";
const SENDER_EMAIL = Deno.env.get("EMAIL_SENDER") ?? "no-reply@moodlemootperu.com";
const SENDER_NAME = "MoodleMoot Perú 2026";
const BREVO_GATEWAY = "https://connector-gateway.lovable.dev/brevo";

// Mapping categoría → lista Brevo
function listIdsFor(category: string): number[] {
  if (category === "edu100" || category === "education") return [119];
  if (category === "staff50" || category === "staff") return [118];
  return [117]; // full / general
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    // Internal-only endpoint: require service role bearer token
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";
    if (!token || token !== serviceKey) {
      return json({ error: "No autorizado" }, 401);
    }

    const { registration_id } = await req.json();
    if (!registration_id) return json({ error: "registration_id requerido" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: reg, error } = await supabase
      .from("event_registrations")
      .select("id, ticket_id, full_name, email, whatsapp, role_title, institution, institution_type, attendance_type, country, city, category, amount_paid, payment_status, id_card_url, coupon_code")
      .eq("id", registration_id)
      .single();
    if (error || !reg) return json({ error: "registration no encontrada" }, 404);
    if (reg.payment_status !== "paid") {
      return json({ error: "registration no está pagada" }, 400);
    }
    if (reg.category === "edu100" && !reg.id_card_url) {
      return json({ error: "EDU100 requiere carné cargado" }, 400);
    }

    const sig = await signTicket(reg.ticket_id);
    const checkInUrl = ticketCheckInUrl(PUBLIC_SITE, reg.ticket_id, sig);

    const qrDataUrl: string = await QRCode.toDataURL(checkInUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320,
    });
    const qrBase64 = qrDataUrl.split(",")[1];

    // Subir QR a Storage para usar URL absoluta en el HTML del correo
    // (Gmail no muestra de forma fiable src="cid:..." desde Brevo API).
    let qrPublicUrl = "";
    try {
      const qrBytes = Uint8Array.from(atob(qrBase64), (c) => c.charCodeAt(0));
      const storagePath = `tickets/${reg.ticket_id}.png`;
      const { error: upErr } = await supabase.storage
        .from("event-images")
        .upload(storagePath, qrBytes, {
          contentType: "image/png",
          upsert: true,
        });
      if (upErr) console.error("QR upload error", upErr);
      const { data: pub } = supabase.storage.from("event-images").getPublicUrl(storagePath);
      qrPublicUrl = pub.publicUrl;
    } catch (e) {
      console.error("QR storage upload failed", e);
    }


    const html = `
<!doctype html><html lang="es"><body style="font-family:-apple-system,system-ui,Segoe UI,Roboto,sans-serif;background:#f5f6f8;margin:0;padding:24px;color:#0f172a">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#002B5B;color:#fff;padding:24px 28px">
      <div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;opacity:.7">Tu ticket</div>
      <div style="font-size:22px;font-weight:700;margin-top:4px">MoodleMoot Perú 2026</div>
    </div>
    <div style="padding:28px">
      <p style="margin:0 0 8px">Hola <strong>${escapeHtml(reg.full_name)}</strong>,</p>
      <p style="margin:0 0 20px;color:#475569">Tu inscripción está confirmada. Presenta este código QR en la entrada del evento.</p>
      <div style="text-align:center;padding:20px;background:#fafafa;border:1px solid #eef0f3;border-radius:12px">
        <img src="${qrPublicUrl}" alt="QR ticket" width="240" height="240" style="display:block;margin:0 auto" />
        <div style="margin-top:14px;font-family:ui-monospace,Menlo,monospace;font-size:18px;font-weight:700;letter-spacing:.08em">${reg.ticket_id}</div>
      </div>
      <table style="width:100%;margin-top:24px;font-size:14px;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#64748b">Categoría</td><td style="padding:6px 0;text-align:right;font-weight:600">${categoryLabel(reg.category)}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b">Monto pagado</td><td style="padding:6px 0;text-align:right;font-weight:600">USD ${Number(reg.amount_paid).toFixed(2)}</td></tr>
        ${reg.coupon_code ? `<tr><td style="padding:6px 0;color:#64748b">Cupón</td><td style="padding:6px 0;text-align:right;font-weight:600">${reg.coupon_code}</td></tr>` : ""}
      </table>
      <p style="margin:24px 0 0;font-size:13px;color:#94a3b8">Si no encuentras este correo en tu bandeja de entrada, revisa la carpeta de spam.</p>
    </div>
    <div style="background:#fafafa;padding:16px 28px;font-size:12px;color:#94a3b8;border-top:1px solid #eef0f3">MoodleMoot Perú 2026 · ${escapeHtml(SENDER_EMAIL)}</div>
  </div>
</body></html>`;

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const brevoKey = Deno.env.get("BREVO_API_KEY");

    if (lovableKey && brevoKey) {
      // 1) Email transaccional con ticket adjunto
      const r = await fetch(`${BREVO_GATEWAY}/smtp/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": brevoKey,
        },
        body: JSON.stringify({
          sender: { name: SENDER_NAME, email: SENDER_EMAIL },
          to: [{ email: reg.email, name: reg.full_name }],
          subject: `Tu ticket MoodleMoot Perú 2026 — ${reg.ticket_id}`,
          htmlContent: html,
          attachment: [
            { name: `${reg.ticket_id}.png`, content: qrBase64 },
          ],
          headers: { "X-Ticket-Id": reg.ticket_id },
        }),
      });
      if (!r.ok) {
        console.error("Brevo smtp error", r.status, await r.text());
      }

      // 2) Upsert de contacto en Brevo + asignación a lista por categoría
      try {
        const listIds = listIdsFor(reg.category);
        const attributes = {
          FIRSTNAME: reg.full_name || "",
          WHATSAPP: reg.whatsapp || "",
          WHATSAPP_NUMBER: reg.whatsapp || "",
          CARGO: reg.role_title || "",
          INSTITUCION: reg.institution || "",
          EMPRESA: reg.institution || "",
          MODALIDAD: reg.attendance_type || "",
        };

        const brevoHeaders = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": brevoKey,
        };

        // Paso A: POST /contacts con updateEnabled (upsert nativo)
        const cr = await fetch(`${BREVO_GATEWAY}/contacts`, {
          method: "POST",
          headers: brevoHeaders,
          body: JSON.stringify({ email: reg.email, attributes, listIds, updateEnabled: true }),
        });
        const crText = await cr.text();
        console.log("Brevo POST /contacts", cr.status, crText);

        // Paso B: si POST falló, PUT por email
        if (!cr.ok) {
          const ur = await fetch(`${BREVO_GATEWAY}/contacts/${encodeURIComponent(reg.email)}`, {
            method: "PUT",
            headers: brevoHeaders,
            body: JSON.stringify({ attributes, listIds }),
          });
          const urText = await ur.text();
          console.log("Brevo PUT /contacts/{email}", ur.status, urText);
        }

        // Paso C: garantizar membresía en lista
        for (const listId of listIds) {
          const ar = await fetch(`${BREVO_GATEWAY}/contacts/lists/${listId}/contacts/add`, {
            method: "POST",
            headers: brevoHeaders,
            body: JSON.stringify({ emails: [reg.email] }),
          });
          const arText = await ar.text();
          console.log(`Brevo add to list ${listId}`, ar.status, arText);
        }
      } catch (e) {
        console.error("Brevo contact upsert failed", e);
      }
    } else {
      console.warn("Brevo no configurado: ticket no enviado por email ni contacto creado");
    }

    return json({
      ok: true,
      ticket_id: reg.ticket_id,
      check_in_url: checkInUrl,
    });
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
function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function categoryLabel(_c: string) {
  // Etiqueta unificada para todos los tickets, sin importar el cupón aplicado.
  return "Entrada General";
}

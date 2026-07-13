import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/brevo';
const SENDER_EMAIL = 'info@moodlemootperu.com';
const SENDER_NAME = 'MoodleMoot Perú';
const REPLY_TO = 'info@moodlemootperu.com';

const BodySchema = z.object({
  email: z.string().email(),
  nombre_completo: z.string().min(1).max(200),
  titulo_ponencia: z.string().min(1).max(500),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
    if (!LOVABLE_API_KEY || !BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email, nombre_completo, titulo_ponencia } = parsed.data;
    const firstName = nombre_completo.split(' ')[0];

    const htmlContent = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a2238;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f6f8;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,43,91,0.08);">
        <tr><td style="background:linear-gradient(135deg,#002B5B 0%,#0B1631 100%);padding:32px 32px 28px;color:#ffffff;">
          <div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#F98012;font-weight:700;margin-bottom:8px;">Postulación de Speaker</div>
          <h1 style="margin:0;font-size:26px;line-height:1.2;font-weight:800;">¡Hemos recibido tu postulación!</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.55;">Hola <strong>${escapeHtml(firstName)}</strong>,</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3a4358;">
            ¡Gracias por postularte como speaker en <strong>MoodleMoot Perú</strong>! Hemos recibido correctamente tu propuesta y nuestro comité académico la estará evaluando en los próximos días.
          </p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7ef;border-left:4px solid #F98012;border-radius:8px;margin:20px 0;">
            <tr><td style="padding:16px 18px;">
              <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#F98012;font-weight:700;margin-bottom:6px;">Tu propuesta</div>
              <div style="font-size:15px;font-weight:600;color:#002B5B;line-height:1.4;">${escapeHtml(titulo_ponencia)}</div>
            </td></tr>
          </table>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3a4358;">
            Nos pondremos en contacto contigo a este mismo correo para informarte el resultado de la evaluación.
          </p>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#3a4358;">
            ¿Tienes alguna pregunta? Escríbenos a
            <a href="mailto:${REPLY_TO}" style="color:#F98012;font-weight:600;text-decoration:none;">${REPLY_TO}</a>.
          </p>
          <p style="margin:28px 0 0;font-size:15px;color:#3a4358;">Un saludo,<br/><strong style="color:#002B5B;">Equipo MoodleMoot Perú</strong></p>
        </td></tr>
        <tr><td style="background:#f5f6f8;padding:18px 32px;text-align:center;font-size:12px;color:#7a8499;">
          Este correo confirma la recepción de tu postulación como speaker.<br/>
          © ${new Date().getFullYear()} MoodleMoot Perú
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    const resp = await fetch(`${GATEWAY_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email, name: nombre_completo }],
        replyTo: { email: REPLY_TO, name: SENDER_NAME },
        subject: 'Hemos recibido tu postulación – MoodleMoot Perú',
        htmlContent,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('Brevo error', resp.status, text);
      return new Response(JSON.stringify({ error: 'Email send failed', detail: text }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json();
    return new Response(JSON.stringify({ ok: true, messageId: data.messageId ?? null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-speaker-proposal-confirmation error', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c] as string));
}

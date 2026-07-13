import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/brevo';
const SENDER = { name: 'MoodleMoot Perú', email: 'info@moodlemootperu.com' };

const ADMIN_EMAILS = [
  'jimi@buendata.com',
  'hernan@industriaelearning.com.pe',
  'rafael@industriaelearning.com.pe',
  'dayana@industriaelearning.com.pe',
];

const Body = z.object({
  type: z.enum(['speaker', 'sponsor']),
  portal_id: z.string().uuid(),
  origin: z.string().url().optional(),
});

// Invoked server-side from portal-save (no user JWT).
// Verified by requiring the service role key in header for direct calls;
// but since it's called via supabase.functions.invoke from another edge fn
// using service role, we just accept internal calls and re-check state.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    if (!LOVABLE_API_KEY || !BREVO_API_KEY) return json({ error: 'Email no configurado' }, 500);
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Datos inválidos' }, 400);
    const { type, portal_id, origin } = parsed.data;

    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const table = type === 'speaker' ? 'speaker_portal' : 'sponsor_portal';
    const { data: p } = await sb.from(table).select('id,name,email,admin_notified_at,event_id').eq('id', portal_id).maybeSingle();
    if (!p) return json({ error: 'No encontrado' }, 404);
    if (p.admin_notified_at) return json({ ok: true, skipped: 'already_notified' });

    const base = (origin ?? 'https://moodlemootperu.com').replace(/\/$/, '');
    const panelUrl = `${base}/panel/${type === 'speaker' ? 'speakers' : 'sponsors'}`;
    const rolLabel = type === 'speaker' ? 'ponente' : 'sponsor';

    const html = `<!doctype html><html><body style="margin:0;font-family:-apple-system,Segoe UI,sans-serif;background:#f5f6f8;padding:32px;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,43,91,0.08);">
        <div style="background:linear-gradient(135deg,#002B5B,#0B1631);color:#fff;padding:24px 32px;">
          <div style="font-size:11px;letter-spacing:2px;color:#F98012;font-weight:700;text-transform:uppercase;">Listo para revisar</div>
          <h1 style="margin:8px 0 0;font-size:20px;">Un ${rolLabel} completó su ficha</h1>
        </div>
        <div style="padding:24px 32px;color:#1a2238;font-size:15px;line-height:1.6;">
          <p><strong>${escapeHtml(p.name)}</strong> (${escapeHtml(p.email)}) terminó de llenar todos los requisitos.</p>
          <p>Revisa la información en el panel y, si todo está correcto, aprueba y publica su ficha en la web del evento.</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${panelUrl}" style="background:#F98012;color:#fff;text-decoration:none;padding:12px 26px;border-radius:10px;font-weight:700;display:inline-block;">Abrir panel de ${type === 'speaker' ? 'Speakers' : 'Sponsors'}</a>
          </div>
        </div>
        <div style="background:#f5f6f8;padding:14px;text-align:center;font-size:12px;color:#7a8499;">© ${new Date().getFullYear()} MoodleMoot Perú</div>
      </div></body></html>`;

    const r = await fetch(`${GATEWAY_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: SENDER,
        to: ADMIN_EMAILS.map((email) => ({ email })),
        subject: `[MoodleMoot] ${p.name} completó su ficha de ${rolLabel}`,
        htmlContent: html,
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error('brevo error', t);
      return json({ error: 'No se pudo enviar' }, 500);
    }
    await sb.from(table).update({ admin_notified_at: new Date().toISOString() }).eq('id', portal_id);
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});

function escapeHtml(s: string) { return s.replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c] as string)); }
function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

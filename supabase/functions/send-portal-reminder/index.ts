import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/brevo';
const SENDER = { name: 'MoodleMoot Perú', email: 'info@moodlemootperu.com' };

const Body = z.object({
  type: z.enum(['speaker', 'sponsor']),
  portal_ids: z.array(z.string().uuid()).min(1).max(50),
  origin: z.string().url(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    if (!LOVABLE_API_KEY || !BREVO_API_KEY) return json({ error: 'Email no configurado' }, 500);

    const auth = req.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) return json({ error: 'No autorizado' }, 401);
    const sbAuth = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: user } = await sbAuth.auth.getUser();
    if (!user?.user) return json({ error: 'No autorizado' }, 401);
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: staff } = await sb.rpc('is_staff', { _user_id: user.user.id });
    if (!staff) return json({ error: 'Requiere permisos de staff' }, 403);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Datos inválidos' }, 400);
    const { type, portal_ids, origin } = parsed.data;
    const table = type === 'speaker' ? 'speaker_portal' : 'sponsor_portal';
    const { data: portals } = await sb.from(table).select('id,name,email,token,event_id').in('id', portal_ids);
    if (!portals?.length) return json({ error: 'No hay portales' }, 404);

    let sent = 0; const failed: string[] = [];
    for (const p of portals) {
      const link = `${origin.replace(/\/$/, '')}/portal/${type}/${p.token}`;
      const html = renderEmail(type, p.name, link);
      try {
        const r = await fetch(`${GATEWAY_URL}/smtp/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'X-Connection-Api-Key': BREVO_API_KEY,
          },
          body: JSON.stringify({
            sender: SENDER,
            to: [{ email: p.email, name: p.name }],
            subject: type === 'speaker' ? 'Completa tu ficha de ponente – MoodleMoot Perú' : 'Completa tu ficha de sponsor – MoodleMoot Perú',
            htmlContent: html,
          }),
        });
        if (!r.ok) { failed.push(p.email); } else { sent++; }
      } catch { failed.push(p.email); }
    }
    return json({ ok: true, sent, failed });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});

function renderEmail(type: 'speaker' | 'sponsor', name: string, link: string) {
  const rolLabel = type === 'speaker' ? 'ponente' : 'sponsor';
  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,sans-serif;background:#f5f6f8;padding:32px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,43,91,0.08);">
    <div style="background:linear-gradient(135deg,#002B5B,#0B1631);color:#fff;padding:28px 32px;">
      <div style="font-size:11px;letter-spacing:2px;color:#F98012;font-weight:700;text-transform:uppercase;">Portal de ${rolLabel}</div>
      <h1 style="margin:8px 0 0;font-size:22px;">Hola ${escapeHtml(name.split(' ')[0])}, faltan algunos datos</h1>
    </div>
    <div style="padding:28px 32px;color:#1a2238;font-size:15px;line-height:1.6;">
      <p>Preparamos un portal privado para que completes tu información como ${rolLabel} de <strong>MoodleMoot Perú</strong>. Solo toma unos minutos y puedes guardarlo por partes.</p>
      <div style="text-align:center;margin:24px 0;"><a href="${link}" style="background:#F98012;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;display:inline-block;">Abrir mi portal</a></div>
      <p style="font-size:13px;color:#7a8499;">Si el botón no funciona, copia y pega este enlace:<br/><span style="word-break:break-all;">${link}</span></p>
    </div>
    <div style="background:#f5f6f8;padding:14px;text-align:center;font-size:12px;color:#7a8499;">© ${new Date().getFullYear()} MoodleMoot Perú</div>
  </div></body></html>`;
}

function escapeHtml(s: string) { return s.replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c] as string)); }

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

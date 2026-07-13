import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const Body = z.object({
  token: z.string().min(10).max(120),
  type: z.enum(['speaker', 'sponsor']),
  requirement_id: z.string().uuid(),
  value_text: z.string().max(5000).optional().nullable(),
  value_url: z.string().max(500).optional().nullable(),
  is_delegated: z.boolean().optional(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Datos inválidos', detail: parsed.error.flatten() }, 400);
    const { token, type, requirement_id, value_text, value_url, is_delegated } = parsed.data;

    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const table = type === 'speaker' ? 'speaker_portal' : 'sponsor_portal';
    const { data: portal } = await sb.from(table).select('id,event_id,closed,status').eq('token', token).maybeSingle();
    if (!portal) return json({ error: 'Enlace no encontrado' }, 404);
    if (portal.closed) return json({ error: 'Enlace cerrado' }, 403);

    const { data: reqRow } = await sb.from('event_requirements').select('id,type,config,is_required').eq('id', requirement_id).eq('event_id', portal.event_id).eq('entity', type).maybeSingle();
    if (!reqRow) return json({ error: 'Requisito inválido' }, 400);

    // Server-side validation by type
    const cfg = (reqRow.config ?? {}) as { max?: number; expected?: string };
    if (value_text && cfg.max && value_text.length > cfg.max) {
      return json({ error: `Máximo ${cfg.max} caracteres.` }, 400);
    }
    if (reqRow.type === 'acceptance' && value_text && cfg.expected && value_text.trim().toUpperCase() !== cfg.expected.toUpperCase()) {
      return json({ error: `Escribe "${cfg.expected}" para confirmar.` }, 400);
    }
    if (reqRow.type === 'url' && value_url) {
      try { new URL(value_url); } catch { return json({ error: 'URL inválida (debe iniciar con https://)' }, 400); }
    }

    const completed = is_delegated === true
      || (reqRow.type === 'url' ? !!value_url : !!(value_text && value_text.trim().length));

    const { error: upErr } = await sb.from('requirement_values').upsert({
      portal_type: type,
      portal_id: portal.id,
      requirement_id,
      value_text: value_text ?? null,
      value_url: value_url ?? null,
      is_delegated: !!is_delegated,
      completed,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'portal_type,portal_id,requirement_id' });
    if (upErr) return json({ error: upErr.message }, 500);

    await sb.from(table).update({
      last_activity_at: new Date().toISOString(),
      status: portal.status === 'invited' ? 'in_progress' : portal.status,
    }).eq('id', portal.id);

    // If just reached 100%, notify admins (once)
    if (completed) {
      const [{ data: reqs }, { data: vals }, { data: fresh }] = await Promise.all([
        sb.from('event_requirements').select('id').eq('event_id', portal.event_id).eq('entity', type).eq('active', true),
        sb.from('requirement_values').select('requirement_id,completed').eq('portal_type', type).eq('portal_id', portal.id),
        sb.from(table).select('admin_notified_at').eq('id', portal.id).maybeSingle(),
      ]);
      const total = reqs?.length ?? 0;
      const activeIds = new Set((reqs ?? []).map((r: any) => r.id));
      const done = (vals ?? []).filter((v: any) => v.completed && activeIds.has(v.requirement_id)).length;
      if (total > 0 && done >= total && !fresh?.admin_notified_at) {
        await sb.from(table).update({ completed_at: new Date().toISOString() }).eq('id', portal.id);
        // Fire and forget
        sb.functions.invoke('notify-admins-portal-complete', {
          body: { type, portal_id: portal.id, origin: req.headers.get('origin') ?? undefined },
        }).catch((e) => console.error('notify error', e));
      }
    }

    return json({ ok: true, completed });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
    const fd = await req.formData();
    const token = String(fd.get('token') ?? '');
    const type = String(fd.get('type') ?? '');
    const requirement_id = String(fd.get('requirement_id') ?? '');
    const file = fd.get('file') as File | null;
    if (!token || !type || !requirement_id || !file) return json({ error: 'Datos incompletos' }, 400);
    if (type !== 'speaker' && type !== 'sponsor') return json({ error: 'Tipo inválido' }, 400);

    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const table = type === 'speaker' ? 'speaker_portal' : 'sponsor_portal';
    const { data: portal } = await sb.from(table).select('id,event_id,closed').eq('token', token).maybeSingle();
    if (!portal) return json({ error: 'Enlace no encontrado' }, 404);
    if (portal.closed) return json({ error: 'Enlace cerrado' }, 403);

    const { data: reqRow } = await sb.from('event_requirements').select('id,type,config').eq('id', requirement_id).eq('event_id', portal.event_id).eq('entity', type).maybeSingle();
    if (!reqRow || reqRow.type !== 'file') return json({ error: 'Requisito no acepta archivos' }, 400);

    const cfg = (reqRow.config ?? {}) as { accept?: string; maxMB?: number };
    const maxBytes = (cfg.maxMB ?? 10) * 1024 * 1024;
    if (file.size === 0) return json({ error: 'El archivo está vacío.' }, 400);
    if (file.size > maxBytes) {
      return json({ error: `El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Máximo permitido: ${cfg.maxMB ?? 10} MB.` }, 400);
    }
    if (cfg.accept) {
      const accepts = cfg.accept.split(',').map((s) => s.trim().toLowerCase());
      const name = file.name.toLowerCase();
      const mime = (file.type || '').toLowerCase();
      const ok = accepts.some((a) => {
        if (a.startsWith('.')) return name.endsWith(a);
        if (a.endsWith('/*')) return mime.startsWith(a.slice(0, -1));
        return mime === a;
      });
      if (!ok) return json({ error: `Formato no permitido. Se acepta: ${cfg.accept}` }, 400);
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
    const path = `${type}/${portal.id}/${requirement_id}-${crypto.randomUUID()}.${ext}`;
    const buf = new Uint8Array(await file.arrayBuffer());
    const { error: upErr } = await sb.storage.from('portal-uploads').upload(path, buf, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });
    if (upErr) return json({ error: 'No pudimos guardar el archivo: ' + upErr.message }, 500);

    const { data: signed } = await sb.storage.from('portal-uploads').createSignedUrl(path, 60 * 60 * 24 * 365);

    await sb.from('requirement_values').upsert({
      portal_type: type,
      portal_id: portal.id,
      requirement_id,
      file_url: path,
      file_name: file.name,
      file_size: file.size,
      is_delegated: false,
      completed: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'portal_type,portal_id,requirement_id' });

    await sb.from(table).update({ last_activity_at: new Date().toISOString(), status: 'in_progress' }).eq('id', portal.id);

    // Notify admins if this upload just completed the portal
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
      sb.functions.invoke('notify-admins-portal-complete', {
        body: { type, portal_id: portal.id, origin: req.headers.get('origin') ?? undefined },
      }).catch((e) => console.error('notify error', e));
    }

    return json({ ok: true, path, signed_url: signed?.signedUrl ?? null, file_name: file.name });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

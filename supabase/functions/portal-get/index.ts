import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    let token: string | null = null;
    let type: string | null = null;
    if (req.method === 'POST') {
      const b = await req.json().catch(() => ({}));
      token = b?.token ?? null; type = b?.type ?? null;
    } else {
      const url = new URL(req.url);
      token = url.searchParams.get('token');
      type = url.searchParams.get('type');
    }
    if (!token || !type || (type !== 'speaker' && type !== 'sponsor')) {
      return json({ error: 'Enlace inválido' }, 400);
    }
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const table = type === 'speaker' ? 'speaker_portal' : 'sponsor_portal';

    const { data: portal, error: pErr } = await sb.from(table).select('*').eq('token', token).maybeSingle();
    if (pErr || !portal) return json({ error: 'Enlace no encontrado' }, 404);
    if (portal.closed) return json({ error: 'Este enlace ha sido cerrado por el organizador.' }, 403);

    const [{ data: reqs }, { data: values }, { data: overrides }, { data: ev }] = await Promise.all([
      sb.from('event_requirements').select('*').eq('event_id', portal.event_id).eq('entity', type).eq('active', true).order('order_index'),
      sb.from('requirement_values').select('*').eq('portal_type', type).eq('portal_id', portal.id),
      sb.from('requirement_overrides').select('*').eq('portal_type', type).eq('portal_id', portal.id),
      sb.from('events').select('id,name,brand_logo_url,brand_color').eq('id', portal.event_id).maybeSingle(),
    ]);

    // Sign file paths so the browser can preview/download private uploads
    const signedValues = await Promise.all((values ?? []).map(async (v: any) => {
      if (!v.file_url) return v;
      const { data: s } = await sb.storage.from('portal-uploads').createSignedUrl(v.file_url, 60 * 60 * 6);
      return { ...v, file_path: v.file_url, file_url: s?.signedUrl ?? null };
    }));

    return json({
      portal: {
        id: portal.id, name: portal.name, email: portal.email, whatsapp: portal.whatsapp,
        status: portal.status, closed: portal.closed,
      },
      event: ev,
      requirements: reqs ?? [],
      values: signedValues,
      overrides: overrides ?? [],
    });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

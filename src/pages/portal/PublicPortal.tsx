import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Upload, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type Requirement = {
  id: string; key: string; label: string; help: string | null;
  type: "short_text" | "long_text" | "file" | "url" | "country" | "acceptance";
  is_required: boolean; publishes_to_web: boolean; allow_delegate: boolean;
  order_index: number; config: any;
};
type Value = {
  requirement_id: string; value_text: string | null; value_url: string | null;
  file_url: string | null; file_name: string | null; is_delegated: boolean; completed: boolean;
};

export default function PublicPortal({ entity }: { entity: "speaker" | "sponsor" }) {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portal, setPortal] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [reqs, setReqs] = useState<Requirement[]>([]);
  const [values, setValues] = useState<Record<string, Value>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const { data, error: err } = await supabase.functions.invoke("portal-get", {
      body: { token, type: entity },
    });
    if (err || (data as any)?.error) { setError(((data as any)?.error) ?? "No pudimos cargar tu portal."); setLoading(false); return; }
    setPortal((data as any).portal);
    setEvent((data as any).event);
    setReqs((data as any).requirements);
    const vmap: Record<string, Value> = {};
    for (const v of (data as any).values as Value[]) vmap[v.requirement_id] = v;
    setValues(vmap);
    const d: Record<string, string> = {};
    for (const r of (data as any).requirements as Requirement[]) {
      const v = vmap[r.id];
      d[r.id] = v?.value_text ?? v?.value_url ?? "";
    }
    setDrafts(d);
    setLoading(false);
  }, [token, entity]);

  useEffect(() => { load(); }, [load]);

  const applicable = useMemo(() => reqs.filter((r) => true), [reqs]);
  const completedCount = useMemo(() => applicable.filter((r) => values[r.id]?.completed).length, [applicable, values]);
  const pct = applicable.length ? Math.round((completedCount / applicable.length) * 100) : 0;

  const saveField = async (r: Requirement, extra: Partial<{ value_text: string; value_url: string; is_delegated: boolean }> = {}) => {
    if (!token) return;
    setSavingId(r.id);
    const body: any = { token, type: entity, requirement_id: r.id };
    if (r.type === "url") body.value_url = extra.value_url ?? drafts[r.id] ?? "";
    else if (r.type !== "file") body.value_text = extra.value_text ?? drafts[r.id] ?? "";
    if (extra.is_delegated !== undefined) body.is_delegated = extra.is_delegated;
    const { data, error: err } = await supabase.functions.invoke("portal-save", { body });
    setSavingId(null);
    if (err || (data as any)?.error) {
      toast.error((data as any)?.error ?? "No pudimos guardar");
      return;
    }
    toast.success("Guardado");
    load();
  };

  const uploadFile = async (r: Requirement, file: File) => {
    if (!token) return;
    setSavingId(r.id);
    const fd = new FormData();
    fd.append("token", token);
    fd.append("type", entity);
    fd.append("requirement_id", r.id);
    fd.append("file", file);
    const { data, error: err } = await supabase.functions.invoke("portal-upload", { body: fd });
    setSavingId(null);
    if (err || (data as any)?.error) {
      const msg = (data as any)?.error ?? "No pudimos subir el archivo";
      toast.error(msg);
      return;
    }
    toast.success("Archivo subido");
    load();
  };

  const markDelegated = async (r: Requirement) => {
    await saveField(r, { is_delegated: true, value_text: "__delegated__" });
  };

  const saveAllAndSubmit = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      // Save any pending drafts that differ from stored values
      for (const r of reqs) {
        if (r.type === "file") continue;
        const draft = drafts[r.id] ?? "";
        const stored = r.type === "url" ? (values[r.id]?.value_url ?? "") : (values[r.id]?.value_text ?? "");
        if (draft === stored) continue;
        if (!draft.trim()) continue;
        const body: any = { token, type: entity, requirement_id: r.id };
        if (r.type === "url") body.value_url = draft;
        else body.value_text = draft;
        const { data, error: err } = await supabase.functions.invoke("portal-save", { body });
        if (err || (data as any)?.error) {
          toast.error(`${r.label}: ${(data as any)?.error ?? "no se pudo guardar"}`);
          setSubmitting(false);
          return;
        }
      }
      await load();
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-brand-orange" /></div>;
  if (error) return (
    <div className="min-h-screen grid place-items-center p-6">
      <Card className="p-8 max-w-md text-center space-y-3">
        <div className="text-xl font-bold text-destructive">Enlace inválido</div>
        <p className="text-sm text-muted-foreground">{error}</p>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#002B5B] to-[#0B1631] text-white">
        <div className="max-w-3xl mx-auto px-4 py-8 flex items-center gap-4">
          {event?.brand_logo_url && <img src={event.brand_logo_url} alt="" className="h-12 w-12 rounded-lg bg-white p-1 object-contain" />}
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase font-bold text-brand-orange">
              Portal de {entity === "speaker" ? "Ponente" : "Sponsor"}
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold">Hola {portal?.name?.split(" ")[0]}</h1>
            <p className="text-sm text-white/80">{event?.name}</p>
          </div>
        </div>
      </div>

      {/* Progress sticky */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-semibold">{completedCount} de {applicable.length} requisitos completos</span>
            <span className="text-brand-orange font-bold">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
      </div>

      {/* Fields */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {submitted && (
          <Card className="p-5 bg-emerald-50 border-emerald-200 text-emerald-900 flex gap-3">
            <CheckCircle2 className="h-6 w-6 shrink-0 mt-0.5 text-emerald-600" />
            <div className="text-sm">
              <div className="font-bold text-base mb-1">¡Información enviada!</div>
              Recibimos tus datos correctamente. Nuestro equipo los revisará y se pondrá en contacto contigo si necesitamos algo adicional. Puedes seguir editando o volver más tarde con este mismo enlace.
            </div>
          </Card>
        )}

        {portal?.status === "approved" && (
          <Card className="p-4 bg-green-50 border-green-200 text-green-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" /> Tu ficha ya fue aprobada y publicada. Puedes seguir actualizando datos.
          </Card>
        )}
        <Card className="p-4 bg-brand-orange/5 border-brand-orange/30 text-sm flex gap-3">
          <Sparkles className="h-5 w-5 text-brand-orange shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-[#002B5B]">Tip</div>
            Si no cuentas con algún diseño, video o archivo solicitado, marca <strong>"No lo tengo, agréguenlo ustedes"</strong> y nuestro equipo lo produce por ti.
          </div>
        </Card>

        {applicable.map((r) => {
          const v = values[r.id];
          const done = !!v?.completed;
          return (
            <Card key={r.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Label className="text-base font-semibold">{r.label}</Label>
                    {r.is_required && <Badge variant="secondary" className="text-[10px]">Obligatorio</Badge>}
                    {r.publishes_to_web && <Badge className="text-[10px] bg-emerald-100 text-emerald-800 hover:bg-emerald-100">🌐 Se publica en la web</Badge>}
                  </div>
                  {r.help && <p className="text-xs text-muted-foreground mt-1">{r.help}</p>}
                </div>
                {done && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
              </div>

              {r.type === "short_text" && (
                <Input
                  value={drafts[r.id] ?? ""}
                  maxLength={r.config?.max ?? 500}
                  onChange={(e) => setDrafts({ ...drafts, [r.id]: e.target.value })}
                  onBlur={() => (drafts[r.id] ?? "") !== (v?.value_text ?? "") && saveField(r)}
                />
              )}
              {r.type === "long_text" && (
                <div>
                  <Textarea
                    rows={4}
                    value={drafts[r.id] ?? ""}
                    maxLength={r.config?.max ?? 2000}
                    onChange={(e) => setDrafts({ ...drafts, [r.id]: e.target.value })}
                    onBlur={() => (drafts[r.id] ?? "") !== (v?.value_text ?? "") && saveField(r)}
                  />
                  <div className="text-[11px] text-muted-foreground text-right mt-1">
                    {(drafts[r.id] ?? "").length}/{r.config?.max ?? 2000}
                  </div>
                </div>
              )}
              {r.type === "url" && (
                <Input
                  type="url" placeholder="https://…"
                  value={drafts[r.id] ?? ""}
                  onChange={(e) => setDrafts({ ...drafts, [r.id]: e.target.value })}
                  onBlur={() => (drafts[r.id] ?? "") !== (v?.value_url ?? "") && saveField(r)}
                />
              )}
              {r.type === "country" && (
                <Input
                  placeholder="Ej: Perú"
                  value={drafts[r.id] ?? ""}
                  onChange={(e) => setDrafts({ ...drafts, [r.id]: e.target.value })}
                  onBlur={() => (drafts[r.id] ?? "") !== (v?.value_text ?? "") && saveField(r)}
                />
              )}
              {r.type === "acceptance" && (
                <Input
                  placeholder={`Escribe ${r.config?.expected ?? "ACEPTO"}`}
                  value={drafts[r.id] ?? ""}
                  onChange={(e) => setDrafts({ ...drafts, [r.id]: e.target.value })}
                  onBlur={() => (drafts[r.id] ?? "") !== (v?.value_text ?? "") && saveField(r)}
                />
              )}
              {r.type === "file" && (
                <div className="space-y-2">
                  {v?.file_url && !v.is_delegated && (
                    <div className="rounded-md border bg-muted/30 p-2 flex items-center gap-3">
                      {/\.(png|jpe?g|webp|gif)$/i.test(v.file_name ?? "") ? (
                        <img src={v.file_url} alt={v.file_name ?? "vista previa"} className="h-20 w-20 rounded object-cover border" />
                      ) : (
                        <div className="h-20 w-20 rounded border flex items-center justify-center bg-white text-xs text-muted-foreground">PDF</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium truncate flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {v.file_name}
                        </div>
                        <a href={v.file_url} target="_blank" rel="noreferrer" className="text-[11px] text-brand-orange inline-flex items-center gap-1 mt-1">
                          <ExternalLink className="h-3 w-3" /> Ver / descargar
                        </a>
                      </div>
                    </div>
                  )}
                  {v?.is_delegated && (
                    <div className="text-xs bg-brand-orange/10 text-brand-orange rounded px-3 py-2">
                      Delegado al equipo del evento.
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex items-center gap-2 border rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-muted">
                      <Upload className="h-4 w-4" /> Subir archivo
                      <input
                        type="file"
                        accept={r.config?.accept ?? undefined}
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && uploadFile(r, e.target.files[0])}
                      />
                    </label>
                    {r.allow_delegate && (
                      <Button type="button" variant="outline" size="sm" onClick={() => markDelegated(r)}>
                        No lo tengo, agréguenlo ustedes
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {savingId === r.id && <div className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Guardando…</div>}
            </Card>
          );
        })}

        <div className="pt-4 pb-2">
          <Button
            onClick={saveAllAndSubmit}
            disabled={submitting}
            className="w-full h-14 text-base font-bold bg-brand-orange hover:bg-brand-orange/90 text-white shadow-lg"
          >
            {submitting ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Guardando y enviando…</> : <>Guardar y enviar información</>}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Tus cambios también se guardan automáticamente al salir de cada campo. Puedes cerrar esta página y volver más tarde con el mismo enlace.
          </p>
        </div>
      </div>
    </div>
  );
}

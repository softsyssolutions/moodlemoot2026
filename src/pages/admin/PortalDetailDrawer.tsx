import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, Send, Copy, ExternalLink, BellRing, Loader2, Download, FileText, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

type Entity = "speaker" | "sponsor";
type Portal = any;

export default function PortalDetailDrawer({
  open,
  onOpenChange,
  entity,
  portal,
  onChanged,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  entity: Entity;
  portal: Portal | null;
  onChanged: () => void;
}) {
  const [reqs, setReqs] = useState<any[]>([]);
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<null | "invite" | "remind">(null);

  useEffect(() => {
    if (!open || !portal) return;
    (async () => {
      setLoading(true);
      const [{ data: rs }, { data: vs }] = await Promise.all([
        supabase.from("event_requirements").select("*").eq("event_id", portal.event_id).eq("entity", entity).eq("active", true).order("order_index"),
        supabase.from("requirement_values").select("*").eq("portal_type", entity).eq("portal_id", portal.id),
      ]);
      setReqs(rs ?? []);
      const map: Record<string, any> = {};
      // Sign private storage paths so images render
      const signed = await Promise.all(((vs ?? []) as any[]).map(async (v) => {
        if (!v.file_url) return v;
        const { data: s } = await supabase.storage.from("portal-uploads").createSignedUrl(v.file_url, 60 * 60);
        return { ...v, file_path: v.file_url, file_url: s?.signedUrl ?? null };
      }));
      for (const v of signed) map[v.requirement_id] = v;
      setValues(map);
      setLoading(false);
    })();
  }, [open, portal, entity]);

  if (!portal) return null;

  const totalReq = reqs.length;
  const doneList = reqs.filter((r) => values[r.id]?.completed);
  const pendingList = reqs.filter((r) => !values[r.id]?.completed);
  const done = doneList.length;
  const pct = totalReq ? Math.round((done / totalReq) * 100) : 0;
  const link = `${window.location.origin}/portal/${entity}/${portal.token}`;

  const status = portal.approved_at
    ? { label: "Aprobado", cls: "bg-emerald-100 text-emerald-800" }
    : done >= totalReq && totalReq > 0
    ? { label: "Listo para revisar", cls: "bg-amber-100 text-amber-800" }
    : portal.invitation_sent_at
    ? { label: "En progreso", cls: "bg-sky-100 text-sky-800" }
    : { label: "Sin invitar", cls: "bg-slate-100 text-slate-700" };

  const sendInvite = async () => {
    setSending("invite");
    const { data, error } = await supabase.functions.invoke("send-portal-invitation", {
      body: { type: entity, portal_ids: [portal.id], origin: window.location.origin },
    });
    setSending(null);
    if (error || (data as any)?.error) return toast.error((data as any)?.error ?? "No pudimos enviar");
    toast.success(`Enlace enviado a ${portal.email}`);
    onChanged();
  };

  const sendReminder = async () => {
    setSending("remind");
    const { data, error } = await supabase.functions.invoke("send-portal-reminder", {
      body: { type: entity, portal_ids: [portal.id], origin: window.location.origin },
    });
    setSending(null);
    if (error || (data as any)?.error) return toast.error((data as any)?.error ?? "No pudimos enviar");
    toast.success("Recordatorio enviado");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalle del {entity === "speaker" ? "speaker" : "sponsor"}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex items-center gap-3">
          <Avatar className="h-14 w-14"><AvatarFallback>{portal.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
          <div className="min-w-0 flex-1">
            <div className="font-semibold truncate flex items-center gap-2">
              {portal.name}
              <Badge className={`text-[10px] ${status.cls} hover:${status.cls}`}>{status.label}</Badge>
            </div>
            <div className="text-xs text-muted-foreground truncate">{portal.email}</div>
            {portal.whatsapp && <div className="text-xs text-muted-foreground">WhatsApp: {portal.whatsapp}</div>}
          </div>
        </div>

        <div className="mt-5 rounded-lg border p-4 bg-gradient-to-br from-brand-orange/5 to-transparent">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm font-semibold">{done} de {totalReq} requisitos completados</span>
            <span className="text-2xl font-bold text-brand-orange">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
          <p className="text-[11px] text-muted-foreground mt-2">
            {portal.invitation_sent_at
              ? `Última invitación: ${new Date(portal.invitation_sent_at).toLocaleString("es-PE")} · ${portal.invitation_count ?? 1} envío(s)`
              : "Aún no se ha enviado el enlace por correo."}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button
            onClick={sendInvite}
            disabled={sending !== null}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white"
          >
            {sending === "invite" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
            {portal.invitation_sent_at ? "Reenviar enlace" : "Enviar enlace"}
          </Button>
          <Button variant="outline" onClick={() => { navigator.clipboard.writeText(link); toast.success("Enlace copiado"); }}>
            <Copy className="h-4 w-4 mr-1" /> Copiar
          </Button>
          <Button variant="outline" onClick={() => window.open(link, "_blank")}>
            <ExternalLink className="h-4 w-4 mr-1" /> Abrir portal
          </Button>
          {portal.invitation_sent_at && done < totalReq && (
            <Button variant="outline" onClick={sendReminder} disabled={sending !== null}>
              {sending === "remind" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <BellRing className="h-4 w-4 mr-1" />}
              Recordatorio
            </Button>
          )}
        </div>

        <Separator className="my-5" />

        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Ya completado ({doneList.length})
              </h3>
              {doneList.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Todavía no ha llenado ningún requisito.</p>
              ) : (
                <ul className="space-y-2">
                  {doneList.map((r) => {
                    const v = values[r.id];
                    return (
                      <li key={r.id} className="rounded-md border p-3 bg-emerald-50/40">
                        <div className="text-sm font-medium">{r.label}</div>
                        <ValuePreview v={v} />
                        <div className="text-[10px] text-muted-foreground mt-1">
                          Actualizado {new Date(v.updated_at).toLocaleString("es-PE")}
                          {v.is_delegated && " · Delegado al equipo"}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-amber-700">
                <Clock className="h-4 w-4" /> Pendiente ({pendingList.length})
              </h3>
              {pendingList.length === 0 ? (
                <p className="text-xs text-emerald-700 italic">¡Todo listo! Puedes aprobar y publicar.</p>
              ) : (
                <ul className="space-y-1.5">
                  {pendingList.map((r) => (
                    <li key={r.id} className="text-sm rounded-md border px-3 py-2 bg-amber-50/40 flex items-center justify-between gap-2">
                      <span>{r.label}{r.is_required && <span className="text-destructive"> *</span>}</span>
                      <Badge variant="outline" className="text-[10px]">{typeLabel(r.type)}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ValuePreview({ v }: { v: any }) {
  if (v.file_url) {
    const isImg = /\.(png|jpe?g|webp|gif|svg)$/i.test(v.file_name || v.file_url);
    return (
      <div className="mt-2 flex items-center gap-3">
        {isImg ? (
          <img src={v.file_url} alt={v.file_name || "archivo"} className="h-14 w-14 rounded object-cover border" />
        ) : (
          <div className="h-14 w-14 rounded border flex items-center justify-center bg-muted"><FileText className="h-6 w-6 text-muted-foreground" /></div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-xs truncate">{v.file_name || "archivo"}</div>
          <a href={v.file_url} target="_blank" rel="noreferrer" className="text-xs text-brand-orange inline-flex items-center gap-1 mt-1">
            <Download className="h-3 w-3" /> Descargar
          </a>
        </div>
      </div>
    );
  }
  if (v.value_url) {
    return (
      <a href={v.value_url} target="_blank" rel="noreferrer" className="mt-1 text-xs text-brand-orange inline-flex items-center gap-1 break-all">
        <LinkIcon className="h-3 w-3" /> {v.value_url}
      </a>
    );
  }
  if (v.value_text) {
    return <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{v.value_text}</p>;
  }
  return <p className="mt-1 text-xs text-muted-foreground italic">Marcado como completo sin contenido.</p>;
}

function typeLabel(t: string) {
  switch (t) {
    case "short_text": return "Texto";
    case "long_text": return "Texto largo";
    case "url": return "Enlace";
    case "file": return "Archivo";
    case "image": return "Imagen";
    default: return t;
  }
}

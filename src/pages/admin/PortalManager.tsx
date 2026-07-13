import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveEvent } from "@/hooks/useActiveEvent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, Link as LinkIcon, Copy, Mail, Trash2, ExternalLink, CheckCircle2, MessageCircle, Settings2, ShieldCheck, Send, BellRing } from "lucide-react";
import { toast } from "sonner";
import RequirementsManager from "./RequirementsManager";
import PortalDetailDrawer from "./PortalDetailDrawer";

type Entity = "speaker" | "sponsor";

type Portal = {
  id: string; token: string; name: string; email: string; whatsapp: string | null;
  status: string; closed: boolean; order_index: number; approved_at: string | null;
  invitation_sent_at: string | null; invitation_count: number;
  completed_at: string | null; admin_notified_at: string | null;
};

export default function PortalManager({ entity }: { entity: Entity }) {
  const { event } = useActiveEvent();
  const [portals, setPortals] = useState<Portal[]>([]);
  const [reqs, setReqs] = useState<any[]>([]);
  const [values, setValues] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"todos" | "incompletos" | "completos">("todos");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "" });
  const [reqOpen, setReqOpen] = useState(false);
  const [detailPortal, setDetailPortal] = useState<Portal | null>(null);

  const label = entity === "speaker" ? "Speakers" : "Sponsors";
  const singular = entity === "speaker" ? "speaker" : "sponsor";
  const table = entity === "speaker" ? "speaker_portal" : "sponsor_portal";

  const load = async () => {
    if (!event) return;
    setLoading(true);
    const [{ data: ps }, { data: rs }] = await Promise.all([
      supabase.from(table as any).select("*").eq("event_id", event.id).order("order_index").order("created_at"),
      supabase.from("event_requirements").select("*").eq("event_id", event.id).eq("entity", entity).eq("active", true).order("order_index"),
    ]);
    setPortals((ps ?? []) as any);
    setReqs((rs ?? []) as any);
    if (ps?.length) {
      const { data: vs } = await supabase
        .from("requirement_values")
        .select("*")
        .eq("portal_type", entity)
        .in("portal_id", ps.map((p: any) => p.id));
      const vmap: Record<string, any[]> = {};
      for (const v of (vs ?? []) as any[]) {
        vmap[v.portal_id] = vmap[v.portal_id] || [];
        vmap[v.portal_id].push(v);
      }
      setValues(vmap);
    } else setValues({});
    setLoading(false);
  };

  useEffect(() => { load(); }, [event, entity]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return portals.filter((p) => {
      const done = countDone(values[p.id], reqs);
      const total = reqs.length;
      const isDone = total > 0 && done >= total;
      if (tab === "incompletos" && isDone) return false;
      if (tab === "completos" && !isDone) return false;
      if (q && !(p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [portals, values, reqs, tab, search]);

  const incompleteCount = useMemo(() => portals.filter((p) => countDone(values[p.id], reqs) < reqs.length).length, [portals, values, reqs]);

  const createPortal = async () => {
    if (!event) return;
    if (!form.name.trim() || !form.email.trim()) { toast.error("Nombre y email son obligatorios"); return; }
    setBusy(true);
    const token = randomToken();
    const { error } = await supabase.from(table as any).insert({
      event_id: event.id,
      token,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      whatsapp: form.whatsapp.trim() || null,
      status: "invited",
      order_index: portals.length,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`${label.slice(0, -1)} creado`);
    setForm({ name: "", email: "", whatsapp: "" });
    setOpen(false);
    load();
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/portal/${entity}/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Enlace copiado");
  };

  const copyWhatsApp = (p: Portal) => {
    const url = `${window.location.origin}/portal/${entity}/${p.token}`;
    const msg = `Hola ${p.name.split(" ")[0]}, aquí está tu portal privado para completar tu información como ${singular} de MoodleMoot Perú: ${url}`;
    const wa = `https://wa.me/${(p.whatsapp || "").replace(/[^\d]/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(wa, "_blank");
  };

  const remove = async (p: Portal) => {
    if (!confirm(`¿Eliminar a ${p.name}? Esta acción borra sus datos cargados.`)) return;
    const { error } = await supabase.from(table as any).delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    load();
  };

  const sendReminders = async (ids: string[]) => {
    if (!ids.length) return;
    const { data, error } = await supabase.functions.invoke("send-portal-reminder", {
      body: { type: entity, portal_ids: ids, origin: window.location.origin },
    });
    if (error || (data as any)?.error) return toast.error((data as any)?.error ?? "No pudimos enviar");
    toast.success(`Recordatorio enviado a ${(data as any).sent} ${label.toLowerCase()}`);
  };

  const sendInvitations = async (ids: string[]) => {
    if (!ids.length) return;
    const { data, error } = await supabase.functions.invoke("send-portal-invitation", {
      body: { type: entity, portal_ids: ids, origin: window.location.origin },
    });
    if (error || (data as any)?.error) return toast.error((data as any)?.error ?? "No pudimos enviar");
    toast.success(`Invitación enviada a ${(data as any).sent} ${label.toLowerCase()}`);
    load();
  };

  const approve = async (p: Portal) => {
    if (!confirm(`¿Aprobar a ${p.name} y publicar su ficha en la web del evento?`)) return;
    const { data, error } = await supabase.functions.invoke("portal-approve", {
      body: { type: entity, portal_id: p.id, publish: true },
    });
    if (error || (data as any)?.error) return toast.error((data as any)?.error ?? "No pudimos aprobar");
    toast.success("Aprobado y publicado en la web");
    load();
  };

  const totalReq = reqs.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{label}</h1>
          <p className="text-sm text-muted-foreground">
            {portals.length} en total · {incompleteCount} incompletos
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setReqOpen(true)}>
            <Settings2 className="h-4 w-4 mr-2" /> Gestionar requisitos ({totalReq})
          </Button>
          {(() => {
            const uninvited = portals.filter((p) => !p.invitation_sent_at);
            return uninvited.length > 0 ? (
              <Button
                onClick={() => sendInvitations(uninvited.map((p) => p.id))}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white"
              >
                <Send className="h-4 w-4 mr-2" /> Enviar enlace a {uninvited.length} sin invitar
              </Button>
            ) : null;
          })()}
          <Button variant="outline" onClick={() => sendReminders(portals.filter((p) => countDone(values[p.id], reqs) < reqs.length && p.invitation_sent_at).map((p) => p.id))} disabled={!incompleteCount}>
            <Mail className="h-4 w-4 mr-2" /> Recordar incompletos
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nuevo {singular}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="incompletos">Incompletos</TabsTrigger>
            <TabsTrigger value="completos">Completos</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input className="max-w-xs" placeholder="Buscar por nombre o email" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          {portals.length === 0 ? `Aún no hay ${label.toLowerCase()}. Crea el primero.` : "Sin resultados con estos filtros."}
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((p, i) => {
            const done = countDone(values[p.id], reqs);
            const pct = totalReq ? Math.round((done / totalReq) * 100) : 0;
            const isDone = totalReq > 0 && done >= totalReq;
            return (
              <Card
                key={p.id}
                className="p-4 flex flex-wrap md:flex-nowrap items-center gap-4 hover:border-brand-orange/60 hover:shadow-sm transition cursor-pointer"
                onClick={() => setDetailPortal(p)}
              >
                <div className="text-xs text-muted-foreground w-8">#{i + 1}</div>
                <Avatar className="h-11 w-11">
                  <AvatarFallback>{p.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate flex items-center gap-2 flex-wrap">
                    {p.name}
                    {p.approved_at && <Badge className="text-[10px] bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Aprobado</Badge>}
                    {isDone && !p.approved_at && <Badge className="text-[10px] bg-amber-100 text-amber-800 hover:bg-amber-100">Listo para revisar</Badge>}
                    {p.status === "invited" && !isDone && <Badge variant="outline" className="text-[10px]">Invitado</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{p.email}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {p.invitation_sent_at
                      ? <>Enlace enviado {timeAgo(p.invitation_sent_at)}{p.invitation_count > 1 ? ` · ${p.invitation_count} envíos` : ""}</>
                      : <span className="text-brand-orange">Sin enviar enlace</span>}
                  </div>
                </div>
                <div className="w-40">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={isDone ? "text-emerald-600 font-semibold" : "text-brand-orange font-semibold"}>{done}/{totalReq}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant={p.invitation_sent_at ? "outline" : "default"}
                    onClick={() => sendInvitations([p.id])}
                    title={p.invitation_sent_at ? "Reenviar enlace por correo" : "Enviar enlace por correo"}
                    className={p.invitation_sent_at ? "" : "bg-brand-orange hover:bg-brand-orange/90 text-white"}
                  >
                    <Send className="h-4 w-4 mr-1" /> {p.invitation_sent_at ? "Reenviar enlace" : "Enviar enlace"}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => copyLink(p.token)} title="Copiar enlace privado">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  {p.whatsapp && (
                    <Button size="icon" variant="ghost" onClick={() => copyWhatsApp(p)} title="Enviar por WhatsApp">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {!isDone && p.invitation_sent_at && (
                    <Button size="icon" variant="ghost" onClick={() => sendReminders([p.id])} title="Enviar recordatorio">
                      <BellRing className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => setDetailPortal(p)} title="Ver detalle (llenado/pendiente)">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  {isDone && !p.approved_at && (
                    <Button size="sm" onClick={() => approve(p)} className="bg-emerald-600 hover:bg-emerald-700 text-white" title="Aprobar y publicar en la web">
                      <ShieldCheck className="h-4 w-4 mr-1" /> Aprobar
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => remove(p)} title="Eliminar">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo {singular}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Nombre *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">Se le enviará el enlace privado a este correo.</p>
            </div>
            <div>
              <Label>WhatsApp (opcional)</Label>
              <Input placeholder="+51 999 999 999" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            </div>
            <p className="text-xs text-muted-foreground">
              El resto de datos (biografía, foto, presentación, etc.) los completa el {singular} en su portal privado.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={createPortal} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Crear y generar enlace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {event && (
        <RequirementsManager
          open={reqOpen}
          onOpenChange={setReqOpen}
          entity={entity}
          eventId={event.id}
          onSaved={load}
        />
      )}

      <PortalDetailDrawer
        open={!!detailPortal}
        onOpenChange={(v) => !v && setDetailPortal(null)}
        entity={entity}
        portal={detailPortal}
        onChanged={load}
      />
    </div>
  );
}

function countDone(vs: any[] | undefined, reqs: any[]): number {
  if (!vs) return 0;
  const active = new Set(reqs.map((r) => r.id));
  return vs.filter((v) => v.completed && active.has(v.requirement_id)).length;
}

function randomToken(len = 32) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => alphabet[n % alphabet.length]).join("");
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "hace un momento";
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} d`;
}

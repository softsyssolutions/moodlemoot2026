import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Download, Loader2, Search, Eye, CheckCircle2, XCircle, Clock, Send, Users, FileCheck2, Sparkles, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Eje = "tecnologias_emergentes" | "experiencias_aprendizaje" | "nuevos_modelos_gestion";
type Estado = "pendiente" | "revisado" | "aprobado" | "publicado" | "rechazado";

type Proposal = {
  id: string;
  event_id: string | null;
  nombre_completo: string;
  email: string;
  whatsapp: string;
  cargo: string;
  institucion_empresa: string;
  pais: string;
  eje_tematico: Eje;
  titulo_ponencia: string;
  resumen_abstract: string;
  modalidad: "presencial" | "virtual";
  enlace_respaldo: string | null;
  estado: Estado;
  published_speaker_id: string | null;
  created_at: string;
};

const ESTADOS: { value: "todos" | Estado; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "revisado", label: "Revisados" },
  { value: "aprobado", label: "Aprobados" },
  { value: "publicado", label: "Publicados" },
  { value: "rechazado", label: "Rechazados" },
];

const EJES_FILTER = [
  { value: "todos", label: "Todos los ejes" },
  { value: "tecnologias_emergentes", label: "Tec. Emergentes" },
  { value: "experiencias_aprendizaje", label: "Exp. Aprendizaje" },
  { value: "nuevos_modelos_gestion", label: "Nuevos Modelos" },
] as const;

const EJE_LABEL: Record<Eje, string> = {
  tecnologias_emergentes: "Tecnologías Emergentes",
  experiencias_aprendizaje: "Experiencias de Aprendizaje",
  nuevos_modelos_gestion: "Nuevos Modelos de Gestión",
};

const ejeBadge = (eje: Eje) => {
  const map: Record<Eje, string> = {
    tecnologias_emergentes: "bg-orange-100 text-orange-800 border-orange-200",
    experiencias_aprendizaje: "bg-blue-100 text-blue-900 border-blue-200",
    nuevos_modelos_gestion: "bg-slate-200 text-slate-800 border-slate-300",
  };
  return <Badge variant="outline" className={map[eje]}>{EJE_LABEL[eje]}</Badge>;
};

const estadoBadge = (estado: Estado) => {
  const map: Record<Estado, string> = {
    pendiente: "bg-amber-100 text-amber-800 border-amber-200",
    revisado: "bg-blue-100 text-blue-800 border-blue-200",
    aprobado: "bg-emerald-100 text-emerald-800 border-emerald-200",
    publicado: "bg-[#002B5B] text-white border-[#002B5B]",
    rechazado: "bg-rose-100 text-rose-800 border-rose-200",
  };
  return <Badge variant="outline" className={map[estado]}>{estado}</Badge>;
};

export default function SpeakerProposals() {
  const [items, setItems] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("todos");
  const [ejeFilter, setEjeFilter] = useState<string>("todos");
  const [active, setActive] = useState<Proposal | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("speaker_proposals")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("No se pudieron cargar las postulaciones");
    setItems((data ?? []) as Proposal[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("speaker_proposals_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "speaker_proposals" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (filter !== "todos" && it.estado !== filter) return false;
      if (ejeFilter !== "todos" && it.eje_tematico !== ejeFilter) return false;
      if (!q) return true;
      return (
        it.nombre_completo.toLowerCase().includes(q) ||
        it.email.toLowerCase().includes(q) ||
        it.institucion_empresa.toLowerCase().includes(q) ||
        it.titulo_ponencia.toLowerCase().includes(q)
      );
    });
  }, [items, search, filter, ejeFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: items.length };
    for (const it of items) c[it.estado] = (c[it.estado] || 0) + 1;
    c.aprobados_sin_publicar = items.filter((i) => i.estado === "aprobado").length;
    return c;
  }, [items]);

  const stats = [
    { key: "todos", label: "Total", value: counts.todos ?? 0, icon: Users, color: "text-slate-700", bg: "bg-slate-100", ring: "ring-slate-200" },
    { key: "pendiente", label: "Pendientes", value: counts.pendiente ?? 0, icon: Clock, color: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200" },
    { key: "revisado", label: "Revisados", value: counts.revisado ?? 0, icon: Eye, color: "text-blue-700", bg: "bg-blue-50", ring: "ring-blue-200" },
    { key: "aprobado", label: "Aprobados", value: counts.aprobado ?? 0, icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" },
    { key: "aprobado", label: "Sin publicar", value: counts.aprobados_sin_publicar ?? 0, icon: AlertCircle, color: "text-[#F98012]", bg: "bg-orange-50", ring: "ring-orange-200" },
    { key: "publicado", label: "Publicados", value: counts.publicado ?? 0, icon: Sparkles, color: "text-white", bg: "bg-[#002B5B]", ring: "ring-[#002B5B]/40", inverted: true },
    { key: "rechazado", label: "Rechazados", value: counts.rechazado ?? 0, icon: XCircle, color: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200" },
  ] as const;

  const exportExcel = () => {
    if (filtered.length === 0) {
      toast.info("No hay postulaciones para exportar");
      return;
    }
    const rows = filtered.map((p) => ({
      Nombre: p.nombre_completo,
      Email: p.email,
      WhatsApp: p.whatsapp,
      Cargo: p.cargo,
      "Institución / Empresa": p.institucion_empresa,
      País: p.pais,
      "Eje temático": EJE_LABEL[p.eje_tematico],
      "Título Ponencia": p.titulo_ponencia,
      "Resumen / Abstract": p.resumen_abstract,
      Modalidad: p.modalidad,
      "Enlace Respaldo": p.enlace_respaldo || "",
      Estado: p.estado,
      "Fecha postulación": new Date(p.created_at).toLocaleString("es-PE"),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = Object.keys(rows[0]).map((k) => ({ wch: Math.min(60, Math.max(14, k.length + 2)) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Speakers");
    const ts = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `speakers-postulaciones-${ts}.xlsx`);
    toast.success("Lista exportada");
  };

  const ensurePortalEntry = async (p: Proposal) => {
    if (!p.event_id) return;
    const { data: existing } = await supabase
      .from("speaker_portal")
      .select("id")
      .eq("event_id", p.event_id)
      .eq("email", p.email.toLowerCase())
      .maybeSingle();
    if (existing?.id) return;
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const arr = new Uint32Array(32);
    crypto.getRandomValues(arr);
    const token = Array.from(arr, (n) => alphabet[n % alphabet.length]).join("");
    await supabase.from("speaker_portal").insert({
      event_id: p.event_id,
      token,
      name: p.nombre_completo,
      email: p.email.toLowerCase(),
      whatsapp: p.whatsapp || null,
      status: "invited",
    });
  };

  const updateEstado = async (id: string, estado: Estado) => {
    setUpdating(true);
    const { error } = await supabase.from("speaker_proposals").update({ estado }).eq("id", id);
    if (!error && estado === "aprobado") {
      const p = items.find((x) => x.id === id);
      if (p) {
        await ensurePortalEntry(p);
        // Auto-publish approved speakers so they show up on the site
        await publicarSpeaker(p, { silent: true });
      }
    }
    setUpdating(false);
    if (error) return toast.error("No se pudo actualizar");
    toast.success(estado === "aprobado" ? "Aprobado, publicado y portal creado" : "Estado actualizado");
    setActive((a) => (a ? { ...a, estado } : a));
    load();
  };

  const publicarSpeaker = async (p: Proposal, opts: { silent?: boolean } = {}) => {
    if (!p.event_id) {
      if (!opts.silent) toast.error("Esta postulación no tiene un evento asociado. Asígnale uno antes de publicar.");
      return;
    }
    if (!opts.silent) setUpdating(true);
    let speakerId = p.published_speaker_id;
    if (!speakerId) {
      const { data, error } = await supabase
        .from("event_speakers")
        .insert({
          event_id: p.event_id,
          name: p.nombre_completo,
          title: p.cargo,
          org: p.institucion_empresa,
          bio: p.resumen_abstract,
          visible: true,
        })
        .select("id")
        .single();
      if (error || !data) {
        if (!opts.silent) setUpdating(false);
        console.error(error);
        if (!opts.silent) toast.error("No se pudo crear el speaker publicado");
        return;
      }
      speakerId = data.id;
    }
    const { error: upErr } = await supabase
      .from("speaker_proposals")
      .update({ estado: "publicado", published_speaker_id: speakerId })
      .eq("id", p.id);
    if (!opts.silent) setUpdating(false);
    if (upErr) {
      if (!opts.silent) toast.error("Speaker creado, pero no se pudo marcar como publicado");
      return;
    }
    if (!opts.silent) toast.success("Speaker publicado en el sitio");
    setActive((a) => (a ? { ...a, estado: "publicado", published_speaker_id: speakerId } : a));
    if (!opts.silent) load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Postulaciones de Speakers</h2>
          <p className="text-sm text-muted-foreground">{counts.todos ?? 0} en total</p>
        </div>
        <Button onClick={exportExcel} className="bg-[#F98012] hover:bg-[#F98012]/90 text-white">
          <Download className="h-4 w-4 mr-2" /> Exportar Lista de Speakers
        </Button>
      </div>

      {/* Dashboard de stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          const isActive = filter === s.key;
          return (
            <button
              key={i}
              onClick={() => setFilter(s.key)}
              className={cn(
                "text-left rounded-xl p-3 transition-all ring-1 hover:shadow-md hover:-translate-y-0.5",
                s.bg,
                s.ring,
                isActive && "shadow-lg ring-2 ring-[#F98012]"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={cn("h-4 w-4", s.color)} />
                <span className={cn("text-2xl font-black leading-none", s.color)}>{s.value}</span>
              </div>
              <div className={cn("text-[11px] uppercase tracking-wider font-semibold", s.color, "opacity-90")}>
                {s.label}
              </div>
            </button>
          );
        })}
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nombre, email, institución o título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {ESTADOS.map((e) => (
              <Button
                key={e.value}
                size="sm"
                variant={filter === e.value ? "default" : "outline"}
                onClick={() => setFilter(e.value)}
                className={filter === e.value ? "bg-[#002B5B] hover:bg-[#002B5B]/90" : ""}
              >
                {e.label}
                <span className="ml-1.5 text-xs opacity-70">({counts[e.value] ?? 0})</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 -mt-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground self-center mr-1">Eje:</span>
          {EJES_FILTER.map((e) => (
            <Button
              key={e.value}
              size="sm"
              variant={ejeFilter === e.value ? "default" : "outline"}
              onClick={() => setEjeFilter(e.value)}
              className={ejeFilter === e.value ? "bg-[#F98012] hover:bg-[#F98012]/90 text-white" : ""}
            >
              {e.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            No hay postulaciones que coincidan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Eje</TableHead>
                  <TableHead>Modalidad</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => setActive(p)}>
                    <TableCell className="font-medium">{p.nombre_completo}</TableCell>
                    <TableCell className="text-sm">{p.email}</TableCell>
                    <TableCell className="text-sm">{p.pais}</TableCell>
                    <TableCell>{ejeBadge(p.eje_tematico)}</TableCell>
                    <TableCell className="text-sm capitalize">{p.modalidad}</TableCell>
                    <TableCell className="text-sm max-w-[260px] truncate">{p.titulo_ponencia}</TableCell>
                    <TableCell>{estadoBadge(p.estado)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("es-PE")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        {p.estado === "aprobado" && (
                          <Button
                            size="sm"
                            disabled={updating}
                            onClick={(e) => { e.stopPropagation(); publicarSpeaker(p); }}
                            className="bg-[#002B5B] hover:bg-[#002B5B]/90 text-white h-8"
                          >
                            <Send className="h-3.5 w-3.5 mr-1" /> Publicar
                          </Button>
                        )}
                        {p.estado === "publicado" && (
                          <Badge variant="outline" className="bg-[#002B5B]/5 text-[#002B5B] border-[#002B5B]/30">
                            <FileCheck2 className="h-3 w-3 mr-1" /> Publicado
                          </Badge>
                        )}
                        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setActive(p); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle>{active.nombre_completo}</SheetTitle>
                <SheetDescription>{active.cargo} · {active.institucion_empresa}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5 text-sm">
                <div className="flex items-center gap-2">{estadoBadge(active.estado)}<span className="text-xs text-muted-foreground">· {new Date(active.created_at).toLocaleString("es-PE")}</span></div>
                <Section label="Email">{active.email}</Section>
                <Section label="WhatsApp">{active.whatsapp}</Section>
                <Section label="País">{active.pais}</Section>
                <Section label="Eje temático">{ejeBadge(active.eje_tematico)}</Section>
                <Section label="Modalidad"><span className="capitalize">{active.modalidad}</span></Section>
                <Section label="Título de la ponencia">{active.titulo_ponencia}</Section>
                <Section label="Resumen / Abstract"><p className="whitespace-pre-wrap leading-relaxed">{active.resumen_abstract}</p></Section>
                {active.enlace_respaldo && (
                  <Section label="Enlace de respaldo">
                    <a href={active.enlace_respaldo} target="_blank" rel="noreferrer" className="text-[#F98012] underline break-all">
                      {active.enlace_respaldo}
                    </a>
                  </Section>
                )}

                {active.estado === "aprobado" && (
                  <div className="pt-4 border-t">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Publicar en el sitio</div>
                    <Button
                      disabled={updating}
                      onClick={() => publicarSpeaker(active)}
                      className="w-full bg-[#002B5B] hover:bg-[#002B5B]/90 text-white"
                    >
                      <Send className="h-4 w-4 mr-2" /> Publicar como speaker
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Se creará automáticamente en la sección pública de Speakers del evento.
                    </p>
                  </div>
                )}

                {active.estado === "publicado" && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <FileCheck2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Este speaker ya está publicado en el sitio.</span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Cambiar estado</div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" disabled={updating} onClick={() => updateEstado(active.id, "pendiente")}>
                      <Clock className="h-4 w-4 mr-1.5" />Pendiente
                    </Button>
                    <Button size="sm" variant="outline" disabled={updating} onClick={() => updateEstado(active.id, "revisado")}>
                      <Eye className="h-4 w-4 mr-1.5" />Revisado
                    </Button>
                    <Button size="sm" disabled={updating} onClick={() => updateEstado(active.id, "aprobado")} className="bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />Aprobar
                    </Button>
                    <Button size="sm" variant="destructive" disabled={updating} onClick={() => updateEstado(active.id, "rechazado")}>
                      <XCircle className="h-4 w-4 mr-1.5" />Rechazar
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
    <div>{children}</div>
  </div>
);

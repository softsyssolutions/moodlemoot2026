import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, DollarSign, Loader2, Check, X, FileText, Download, MapPin, Video } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useActiveEvent } from "@/hooks/useActiveEvent";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend,
  PieChart, Pie, Cell,
} from "recharts";

const categoryLabel = (c: string | null | undefined): string => {
  const v = (c ?? "").toLowerCase();
  if (v === "full") return "Pagado Completo";
  if (v === "staff50" || v === "staff") return "Invitado Especial";
  if (v === "edu100" || v === "education") return "Cupón Gratis (EDU)";
  return c ?? "—";
};

type Reg = {
  id: string;
  ticket_id: string;
  full_name: string;
  email: string;
  whatsapp: string | null;
  role_title: string | null;
  institution: string | null;
  category: string;
  amount_paid: number;
  payment_status: string;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
  paid_at: string | null;
  id_card_url: string | null;
  id_card_status: string;
  attendance_type: string | null;
  coupon_code: string | null;
};

const formatTxDate = (iso: string | null): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-PE", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
};

const CATS: { key: string; label: string; match: (c: string) => boolean }[] = [
  { key: "full", label: "Entradas Pagadas", match: (c) => c === "full" },
  { key: "staff50", label: "Entradas Invitado Especial (50%)", match: (c) => c === "staff50" || c === "staff" },
  { key: "edu100", label: "Entradas Cupón Gratis", match: (c) => c === "edu100" || c === "education" },
];

export default function AdminDashboard() {
  const { event } = useActiveEvent();
  const { isAdmin, isStaff, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [regs, setRegs] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [masterFilter, setMasterFilter] = useState<"todos" | "pagados_completo" | "con_descuento" | "gratis_todos" | "gratis_auditar" | "gratis_aprobados">("todos");
  

  const load = async () => {
    let query = supabase
      .from("event_registrations")
      .select("id, ticket_id, full_name, email, whatsapp, role_title, institution, category, amount_paid, payment_status, checked_in, checked_in_at, created_at, paid_at, id_card_url, id_card_status, attendance_type, coupon_code, event_id")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (event?.id) {
      query = query.eq("event_id", event.id);
    }
    const { data, error } = await query;
    if (error) {
      console.warn("[dashboard] load error", error);
      setLoadError(error.message ?? "No se pudieron cargar los registrados.");
      setLoading(false);
      return;
    }
    setLoadError(null);
    setRegs((data as unknown as Reg[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    // Esperar a que la autenticación valide el rol antes de consultar (evita 0 falsos por RLS).
    if (authLoading) return;
    if (!isStaff && !isAdmin) {
      setLoading(false);
      return;
    }
    load();
    const ch = supabase
      .channel("dashboard-regs")
      .on("postgres_changes", { event: "*", schema: "public", table: "event_registrations" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "check_in_events" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isStaff, isAdmin, event?.id]);

  const paid = useMemo(() => regs.filter(r => r.payment_status === "paid"), [regs]);
  const attended = useMemo(() => paid.filter(r => r.checked_in), [paid]);
  const revenue = useMemo(() => paid.reduce((s, r) => s + Number(r.amount_paid || 0), 0), [paid]);
  const pct = paid.length ? Math.round((attended.length / paid.length) * 100) : 0;
  const presentialAttended = useMemo(
    () => attended.filter(r => {
      const m = (r.attendance_type ?? "").toLowerCase();
      return m !== "virtual";
    }).length,
    [attended],
  );
  const virtualAttended = useMemo(
    () => attended.filter(r => (r.attendance_type ?? "").toLowerCase() === "virtual").length,
    [attended],
  );
  const presentialRegistered = useMemo(
    () => paid.filter(r => (r.attendance_type ?? "").toLowerCase() !== "virtual").length,
    [paid],
  );
  const virtualRegistered = useMemo(
    () => paid.filter(r => (r.attendance_type ?? "").toLowerCase() === "virtual").length,
    [paid],
  );
  const presentialPct = presentialRegistered ? Math.round((presentialAttended / presentialRegistered) * 100) : 0;
  const virtualPct = virtualRegistered ? Math.round((virtualAttended / virtualRegistered) * 100) : 0;

  const catStats = CATS.map(c => {
    const list = paid.filter(r => c.match(r.category));
    const att = list.filter(r => r.checked_in).length;
    return {
      key: c.key,
      label: c.label,
      total: list.length,
      attended: att,
      pct: list.length ? Math.round((att / list.length) * 100) : 0,
    };
  });

  // Buckets de 15 min de check-ins (últimas 24h o todo si <)
  const buckets = useMemo(() => {
    const map = new Map<string, number>();
    attended.forEach(r => {
      if (!r.checked_in_at) return;
      const d = new Date(r.checked_in_at);
      d.setSeconds(0, 0);
      const m = d.getMinutes();
      d.setMinutes(m - (m % 15));
      const k = d.toISOString();
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({ t: new Date(k).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }), checkins: v }));
  }, [attended]);

  const eduPending = regs.filter(r => (r.category === "edu100" || r.category === "education") && r.payment_status === "paid");

  // Modalidad: regla logística → híbridos cuentan como presenciales en aforo.
  const modalityStats = useMemo(() => {
    let presencial = 0, virtual = 0, hibrido = 0;
    paid.forEach(r => {
      const m = (r.attendance_type ?? "").toLowerCase();
      if (m === "virtual") virtual++;
      else if (m === "hibrido" || m === "híbrido") hibrido++;
      else presencial++;
    });
    return [
      { key: "presencial", name: "Presenciales (+ híbridos)", value: presencial + hibrido, hibridos: hibrido, color: "hsl(var(--brand-orange))" },
      { key: "virtual", name: "Virtuales", value: virtual, hibridos: 0, color: "hsl(var(--brand-navy))" },
    ];
  }, [paid]);
  const modalityTotal = modalityStats.reduce((s, m) => s + m.value, 0);

  // Estado derivado del ticket
  const ticketState = (r: Reg): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    if (r.payment_status !== "paid") return { label: "Pendiente pago", variant: "outline" };
    if ((r.category === "edu100" || r.category === "education") && r.id_card_status === "pending")
      return { label: "Por auditar", variant: "secondary" };
    if (r.id_card_status === "rejected") return { label: "Rechazado", variant: "destructive" };
    return { label: "Emitido", variant: "default" };
  };

  const masterRows = useMemo(() => {
    // Solo se listan inscripciones efectivamente pagadas (incluye EDU100 con monto 0).
    return regs.filter(r => r.payment_status === "paid").filter(r => {
      switch (masterFilter) {
        case "pagados_completo":
          return r.category === "full";
        case "con_descuento":
          return r.category === "staff50" || r.category === "staff";
        case "gratis_todos":
          return r.category === "edu100" || r.category === "education";
        case "gratis_auditar":
          return (r.category === "edu100" || r.category === "education") && r.id_card_status === "pending";
        case "gratis_aprobados":
          return (r.category === "edu100" || r.category === "education") && r.id_card_status === "approved";
        default:
          return true;
      }
    });
  }, [regs, masterFilter]);

  const modalityBadge = (m: string | null) => {
    const v = (m ?? "").toLowerCase();
    const label = v ? v.charAt(0).toUpperCase() + v.slice(1) : "—";
    const variant: "default" | "secondary" | "outline" =
      v === "virtual" ? "secondary" : v === "hibrido" || v === "híbrido" ? "outline" : "default";
    return <Badge variant={variant}>{label}</Badge>;
  };

  const openIdCard = async (path: string | null) => {
    if (!path) {
      toast({ title: "Sin archivo", description: "Este registro no tiene carné subido.", variant: "destructive" });
      return;
    }
    const { data, error } = await supabase.functions.invoke("get-id-card-url", { body: { path } });
    if (error || !data?.url) {
      toast({ title: "No se pudo abrir el carné", description: error?.message ?? "Permisos insuficientes", variant: "destructive" });
      return;
    }
    window.open(data.url as string, "_blank", "noopener,noreferrer");
  };

  const setIdStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("event_registrations")
      .update({ id_card_status: status })
      .eq("id", id);
    if (error) {
      toast({ title: "Error al actualizar carné", description: error.message, variant: "destructive" });
    } else {
      toast({ title: status === "approved" ? "Carné aprobado" : "Carné rechazado" });
      load();
    }
  };

  const modalityCsvLabel = (m: string | null) => {
    const v = (m ?? "").toLowerCase();
    if (v === "virtual") return "Virtual";
    if (v === "hibrido" || v === "híbrido") return "Híbrido";
    if (v === "presencial") return "Presencial";
    return "—";
  };

  const exportMasterToExcel = () => {
    if (masterRows.length === 0) return;
    const rows = masterRows.map(r => ({
      "ID Registro": r.id,
      "Ticket": r.ticket_id,
      "Nombre Completo": r.full_name,
      "Email": r.email,
      "WhatsApp": r.whatsapp ?? "",
      "Cargo / Rol": r.role_title ?? "",
      "Institución / Empresa": r.institution ?? "",
      "Modalidad": modalityCsvLabel(r.attendance_type),
      "Categoría": categoryLabel(r.category),
      "Cupón Aplicado": r.coupon_code ?? "",
      "Monto Pagado (USD)": Number(r.amount_paid || 0),
      "Fecha de Transacción": formatTxDate(r.paid_at ?? r.created_at),
      "Estado del Ticket": ticketState(r).label,
    }));
    const ws = XLSX.utils.json_to_sheet(rows, {
      header: [
        "ID Registro","Ticket","Nombre Completo","Email","WhatsApp",
        "Cargo / Rol","Institución / Empresa","Modalidad","Categoría",
        "Cupón Aplicado","Monto Pagado (USD)","Fecha de Transacción","Estado del Ticket",
      ],
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrados");
    const slug = (event as any)?.slug ?? "moodlemoot_2026";
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `registrados_${slug}_${date}_${masterFilter}.xlsx`);
    toast({ title: "Lista exportada", description: `${masterRows.length} registro(s) descargados en Excel.` });
  };


  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard ejecutivo</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {event ? `${event.name} · ${event.edition ?? ""}` : "Sin evento activo"} · datos en tiempo real
        </p>
      </div>

      {loadError && (
        <Card className="p-4 border-destructive/40 bg-destructive/5">
          <div className="text-sm font-medium text-destructive">No se pudieron cargar los registrados</div>
          <div className="text-xs text-muted-foreground mt-1">{loadError}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Verifica que tu cuenta tenga rol de staff o admin. Los datos siguen guardados en la base.
          </div>
        </Card>
      )}

      {isAdmin && (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {(() => {
            const totalAttended = presentialAttended + virtualAttended;
            const totalRegistered = paid.length;
            const totalPct = totalRegistered ? Math.round((totalAttended / totalRegistered) * 100) : 0;
            return (
              <Kpi
                label="Inscritos Totales"
                value={totalRegistered}
                icon={Users}
                sublabel={`${totalAttended} asistiendo · ${totalPct}% de asistencia global`}
              />
            );
          })()}
          <Kpi
            label="Asistentes Presenciales"
            value={`${presentialAttended} / ${presentialRegistered}`}
            icon={MapPin}
            sublabel={`${presentialPct}% del aforo físico confirmado`}
          />
          <Kpi
            label="Asistentes Virtuales"
            value={`${virtualAttended} / ${virtualRegistered}`}
            icon={Video}
            sublabel={`${virtualPct}% de la comunidad online`}
          />
          <Kpi label="Ingresos Totales" value={`USD ${revenue.toFixed(2)}`} icon={DollarSign} />
        </div>
      )}

      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-3">
        {catStats.map(c => (
          <Card key={c.key} className="p-4 sm:p-5">
            <div className="text-[11px] sm:text-xs uppercase tracking-wider text-muted-foreground">{c.label}</div>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <div className="text-xl sm:text-2xl font-bold">{c.attended} / {c.total}</div>
              <Badge variant="secondary">{c.pct}%</Badge>
            </div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${c.pct}%` }} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-3 sm:p-5">
        <div className="flex flex-col gap-3 mb-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-medium">Registrados del evento</div>
            <div className="text-xs text-muted-foreground">
              Listado maestro con filtros rápidos. {masterRows.length} registro(s) visibles.
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {([
              ["todos", "Todos"],
              ["pagados_completo", "Pagados Completo"],
              ["con_descuento", "Con Descuento"],
              ["gratis_todos", "Gratis (Todos)"],
              ["gratis_auditar", "Gratis (Por Auditar)"],
              ["gratis_aprobados", "Gratis (Aprobados)"],
            ] as const).map(([key, label]) => (
              <Button
                key={key}
                size="sm"
                variant={masterFilter === key ? "default" : "outline"}
                onClick={() => setMasterFilter(key)}
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                {label}
              </Button>
            ))}
            <Button
              size="sm"
              variant="default"
              onClick={exportMasterToExcel}
              disabled={masterRows.length === 0}
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              <Download className="w-3 h-3" /> Exportar
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <div className="min-w-[720px] px-3 sm:px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Categoría / Cupón</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Fecha de transacción</TableHead>
                <TableHead>Modalidad</TableHead>
                <TableHead>Estado Ticket</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {masterRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                    Sin registros para este filtro.
                  </TableCell>
                </TableRow>
              )}
              {masterRows.map(r => {
                const st = ticketState(r);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.full_name}</TableCell>
                    <TableCell className="text-xs">{r.email}</TableCell>
                    <TableCell className="text-xs">
                      <div>{categoryLabel(r.category)}</div>
                      {r.coupon_code ? <div className="text-muted-foreground">{r.coupon_code}</div> : null}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      USD {Number(r.amount_paid || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                      {formatTxDate(r.paid_at ?? r.created_at)}
                    </TableCell>
                    <TableCell>{modalityBadge(r.attendance_type)}</TableCell>
                    <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </div>
        </div>
      </Card>


      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="text-sm font-medium mb-3">Check-ins por intervalos de 15 min</div>
          <div className="h-64">
            {buckets.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Aún no hay check-ins registrados.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={buckets}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="t" fontSize={11} />
                  <YAxis allowDecimals={false} fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="checkins" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-medium mb-3">Inscritos vs. presentes por categoría</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catStats}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="label" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Inscritos" fill="hsl(var(--muted-foreground))" />
                <Bar dataKey="attended" name="Presentes" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-medium">Inscritos por modalidad</div>
            <div className="text-xs text-muted-foreground">
              Los híbridos se suman al aforo presencial para logística operativa.
            </div>
          </div>
          <Badge variant="outline">{modalityTotal} pagados</Badge>
        </div>
        <div className="h-72">
          {modalityTotal === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Aún no hay inscritos pagados.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modalityStats}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  label={(d: any) => `${d.name}: ${d.value}`}
                >
                  {modalityStats.map((m) => (
                    <Cell key={m.key} fill={m.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, _name: any, entry: any) => {
                    const hib = entry?.payload?.hibridos ?? 0;
                    return hib > 0 ? [`${value} (incluye ${hib} híbridos)`, entry.payload.name] : [value, entry.payload.name];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-medium">Auditoría de carnés (EDU100)</div>
            <div className="text-xs text-muted-foreground">Aprueba o rechaza la documentación enviada por estudiantes/docentes.</div>
          </div>
          <Badge variant="outline">{eduPending.filter(r => r.id_card_status === "pending").length} pendientes</Badge>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Modalidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Carné</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eduPending.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">Sin registros EDU100.</TableCell></TableRow>
              )}
              {eduPending.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.ticket_id}</TableCell>
                  <TableCell>{r.full_name}</TableCell>
                  <TableCell className="text-xs">{r.email}</TableCell>
                  <TableCell>{modalityBadge(r.attendance_type)}</TableCell>
                  <TableCell>
                    <Badge variant={r.id_card_status === "approved" ? "default" : r.id_card_status === "rejected" ? "destructive" : "secondary"}>
                      {r.id_card_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {r.id_card_url ? (
                      <Button size="sm" variant="outline" onClick={() => openIdCard(r.id_card_url)}>
                        <FileText className="w-3 h-3" /> Ver documento
                      </Button>
                    ) : <span className="text-xs text-muted-foreground">Sin archivo</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <AuditDecision
                      status={r.id_card_status}
                      onApprove={() => setIdStatus(r.id, "approved")}
                      onReject={() => setIdStatus(r.id, "rejected")}
                    />
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      </Card>

      
    </div>
  );
}

function Kpi({ label, value, icon: Icon, sublabel }: { label: string; value: string | number; icon: any; sublabel?: string }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className="rounded-lg bg-primary/10 text-primary p-3"><Icon className="h-5 w-5" /></div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
        {sublabel ? <div className="text-[11px] text-green-600 mt-0.5 font-medium">{sublabel}</div> : null}
      </div>
    </Card>
  );
}



function AuditDecision({
  status,
  onApprove,
  onReject,
}: {
  status: string;
  onApprove: () => void;
  onReject: () => void;
}) {
  const isApproved = status === "approved";
  const isRejected = status === "rejected";

  const approveCls = isApproved
    ? "bg-green-600 text-white border-green-600 hover:bg-green-700"
    : isRejected
    ? "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
    : "bg-transparent text-green-700 border-green-500 hover:bg-green-50";

  const rejectCls = isRejected
    ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
    : isApproved
    ? "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
    : "bg-transparent text-red-700 border-red-500 hover:bg-red-50";

  return (
    <div className="inline-flex gap-2">
      <button
        type="button"
        onClick={onApprove}
        aria-pressed={isApproved}
        className={`inline-flex items-center gap-1 h-8 px-3 rounded-md border text-xs font-medium transition-colors ${approveCls}`}
      >
        <Check className="w-3 h-3" /> Aprobar
      </button>
      <button
        type="button"
        onClick={onReject}
        aria-pressed={isRejected}
        className={`inline-flex items-center gap-1 h-8 px-3 rounded-md border text-xs font-medium transition-colors ${rejectCls}`}
      >
        <X className="w-3 h-3" /> Rechazar
      </button>
    </div>
  );
}


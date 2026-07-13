import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Upload, Download, Search, Pencil, Trash2, Eye } from "lucide-react";
import * as XLSX from "xlsx";
import AttendeeFormDialog from "@/components/admin/AttendeeFormDialog";
import AttendeeImportDialog from "@/components/admin/AttendeeImportDialog";
import AttendeeDetailDrawer from "@/components/admin/AttendeeDetailDrawer";

export type Attendee = {
  id: string;
  ticket_id: string;
  event_id: string | null;
  full_name: string;
  email: string;
  whatsapp: string | null;
  role_title: string | null;
  institution: string | null;
  institution_type: string | null;
  attendance_type: string | null;
  country: string | null;
  city: string | null;
  category: string;
  amount_paid: number;
  currency: string;
  payment_status: string;
  payment_method: string | null;
  is_manual: boolean;
  checked_in: boolean;
  checked_in_at: string | null;
  coupon_code: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string | null;
  last_edited_at: string | null;
  registered_by: string | null;
  last_edited_by: string | null;
  id_card_url: string | null;
};

const categoryLabel = (c: string) => {
  if (c === "edu100" || c === "education") return "EDU (gratis)";
  if (c === "staff50" || c === "staff") return "50%";
  return "Completo";
};

const paymentMethodLabel = (m: string | null) => {
  switch (m) {
    case "paypal": return "PayPal";
    case "transferencia": return "Transferencia";
    case "efectivo": return "Efectivo";
    case "cortesia": return "Cortesía";
    case "otro": return "Otro";
    default: return "—";
  }
};

const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-PE", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return "—"; }
};

export default function AttendeesPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"confirmados" | "abandonos">("confirmados");
  const [rows, setRows] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [checkinFilter, setCheckinFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Attendee | null>(null);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [viewing, setViewing] = useState<Attendee | null>(null);

  const load = async () => {
    setLoading(true);
    const statuses = tab === "confirmados" ? ["paid"] : ["pending", "failed"];
    const { data, error } = await supabase
      .from("event_registrations")
      .select("*")
      .in("payment_status", statuses)
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setRows((data as Attendee[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [tab]);

  useEffect(() => {
    const ch = supabase
      .channel("attendees-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "event_registrations" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [tab]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (methodFilter !== "all" && (r.payment_method ?? "paypal") !== methodFilter) return false;
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      if (checkinFilter === "in" && !r.checked_in) return false;
      if (checkinFilter === "out" && r.checked_in) return false;
      if (!t) return true;
      return (
        r.full_name?.toLowerCase().includes(t) ||
        r.email?.toLowerCase().includes(t) ||
        r.ticket_id?.toLowerCase().includes(t) ||
        (r.institution ?? "").toLowerCase().includes(t) ||
        (r.whatsapp ?? "").toLowerCase().includes(t)
      );
    });
  }, [rows, q, methodFilter, categoryFilter, checkinFilter]);

  const exportCsv = () => {
    const data = filtered.map((r) => ({
      ticket: r.ticket_id,
      nombre: r.full_name,
      email: r.email,
      whatsapp: r.whatsapp,
      institucion: r.institution,
      pais: r.country,
      ciudad: r.city,
      categoria: r.category,
      metodo_pago: r.payment_method,
      monto: r.amount_paid,
      moneda: r.currency,
      estado_pago: r.payment_status,
      registro_manual: r.is_manual ? "sí" : "no",
      cupon: r.coupon_code,
      check_in: r.checked_in ? "sí" : "no",
      creado: r.created_at,
      notas_internas: r.internal_notes,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistentes");
    XLSX.writeFile(wb, `asistentes-${tab}-${Date.now()}.xlsx`);
  };

  const removeAttendee = async (r: Attendee) => {
    if (!confirm(`¿Eliminar el registro de ${r.full_name}? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from("event_registrations").delete().eq("id", r.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Registro eliminado" });
      load();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Asistentes</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona pagos confirmados, registros manuales y carritos abandonados.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={exportCsv}><Download className="w-4 h-4" /> Exportar</Button>
          <Button variant="outline" onClick={() => setImporting(true)}><Upload className="w-4 h-4" /> Importar</Button>
          <Button onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> Registrar manualmente</Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="confirmados">Confirmados</TabsTrigger>
          <TabsTrigger value="abandonos">Abandono de carrito</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <Card className="p-4 space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Buscar por nombre, email, ticket, institución…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Categoría" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="full">Completo</SelectItem>
                  <SelectItem value="staff50">50% (staff)</SelectItem>
                  <SelectItem value="edu100">EDU (gratis)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[170px]"><SelectValue placeholder="Método de pago" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los métodos</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="cortesia">Cortesía</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
              {tab === "confirmados" && (
                <Select value={checkinFilter} onValueChange={setCheckinFilter}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Check-in" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="in">Presentes</SelectItem>
                    <SelectItem value="out">Pendientes</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <div className="text-sm text-muted-foreground ml-auto">
                {filtered.length} de {rows.length}
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Asistente</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Registrado</TableHead>
                    {tab === "confirmados" && <TableHead>Check-in</TableHead>}
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow><TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="w-4 h-4 animate-spin inline" />
                    </TableCell></TableRow>
                  )}
                  {!loading && filtered.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-sm text-muted-foreground">
                      Sin resultados.
                    </TableCell></TableRow>
                  )}
                  {filtered.map((r) => (
                    <TableRow key={r.id} className="cursor-pointer" onClick={() => setViewing(r)}>
                      <TableCell className="font-mono text-xs">{r.ticket_id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{r.full_name}</div>
                        <div className="text-xs text-muted-foreground">{r.email}</div>
                        {r.institution && <div className="text-xs text-muted-foreground">{r.institution}</div>}
                      </TableCell>
                      <TableCell><Badge variant="outline">{categoryLabel(r.category)}</Badge></TableCell>
                      <TableCell>
                        <div className="text-sm">{paymentMethodLabel(r.payment_method)}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.currency} {Number(r.amount_paid).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {r.is_manual
                          ? <Badge variant="secondary">Manual</Badge>
                          : <Badge variant="outline">Web</Badge>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(r.created_at)}</TableCell>
                      {tab === "confirmados" && (
                        <TableCell>
                          {r.checked_in
                            ? <Badge>Presente</Badge>
                            : <Badge variant="secondary">Pendiente</Badge>}
                        </TableCell>
                      )}
                      <TableCell className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => setViewing(r)} title="Ver detalle">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditing(r)} title="Editar">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removeAttendee(r)} title="Eliminar">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <AttendeeFormDialog
        open={creating}
        onOpenChange={setCreating}
        onSaved={load}
      />
      <AttendeeFormDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        attendee={editing ?? undefined}
        onSaved={load}
      />
      <AttendeeImportDialog
        open={importing}
        onOpenChange={setImporting}
        onDone={load}
      />
      <AttendeeDetailDrawer
        attendee={viewing}
        onClose={() => setViewing(null)}
        onEdit={(r) => { setViewing(null); setEditing(r); }}
      />
    </div>
  );
}

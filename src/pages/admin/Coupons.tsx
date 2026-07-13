import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Loader2,
  Copy,
  Link2,
  Ban,
  Download,
  Ticket as TicketIcon,
  Search,
} from "lucide-react";
import { toast } from "sonner";

type Coupon = {
  id: string;
  code: string;
  category: string;
  discount_percent: number;
  requires_id_card: boolean;
  active: boolean;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  created_at: string;
};

// Alfabeto sin caracteres confusos (sin 0/O, 1/I, L)
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomCode(length = 6): string {
  let out = "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) {
    out += ALPHABET[arr[i] % ALPHABET.length];
  }
  return out;
}

function buildPublicLink(code: string): string {
  return `${window.location.origin}/?coupon=${encodeURIComponent(code)}`;
}

type StatusFilter = "all" | "active" | "used" | "expired" | "inactive";

function couponStatus(c: Coupon): StatusFilter {
  if (!c.active) return "inactive";
  if (c.expires_at && new Date(c.expires_at) < new Date()) return "expired";
  if (c.max_uses != null && c.uses_count >= c.max_uses) return "used";
  return "active";
}

export default function AdminCoupons() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState<"single" | "bulk">("single");

  // Form
  const [prefix, setPrefix] = useState("");
  const [discount, setDiscount] = useState<number>(100);
  const [category, setCategory] = useState<string>("full");
  const [requiresIdCard, setRequiresIdCard] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(10);
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Error al cargar cupones");
    } else {
      setItems((data ?? []) as Coupon[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase();
    return items.filter((c) => {
      if (q && !c.code.toUpperCase().includes(q)) return false;
      if (statusFilter !== "all" && couponStatus(c) !== statusFilter) return false;
      return true;
    });
  }, [items, search, statusFilter]);

  const resetForm = () => {
    setPrefix("");
    setDiscount(100);
    setCategory("full");
    setRequiresIdCard(false);
    setExpiresAt("");
    setQuantity(10);
    setNote("");
    setLastGenerated([]);
  };

  const openCreate = (m: "single" | "bulk") => {
    resetForm();
    setMode(m);
    setOpenModal(true);
  };

  const handleGenerate = async () => {
    if (discount < 1 || discount > 100) {
      toast.error("El descuento debe estar entre 1 y 100");
      return;
    }
    const qty = mode === "single" ? 1 : Math.max(1, Math.min(500, quantity));
    setSubmitting(true);
    try {
      // Generar códigos únicos localmente
      const codes = new Set<string>();
      const cleanPrefix = prefix.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
      while (codes.size < qty) {
        const c = (cleanPrefix ? `${cleanPrefix}-` : "") + randomCode(6);
        codes.add(c);
      }
      const codeList = Array.from(codes);

      // Verificar duplicados contra DB
      const { data: existing } = await supabase
        .from("coupons")
        .select("code")
        .in("code", codeList);
      if (existing && existing.length > 0) {
        const taken = new Set(existing.map((e: any) => e.code));
        // Regenerar los duplicados
        for (let i = 0; i < codeList.length; i++) {
          while (taken.has(codeList[i])) {
            codeList[i] = (cleanPrefix ? `${cleanPrefix}-` : "") + randomCode(7);
          }
        }
      }

      const rows = codeList.map((code) => ({
        code,
        category,
        discount_percent: discount,
        requires_id_card: requiresIdCard,
        active: true,
        max_uses: 1,
        uses_count: 0,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      }));

      const { error } = await supabase.from("coupons").insert(rows);
      if (error) throw error;

      setLastGenerated(codeList);
      toast.success(
        qty === 1
          ? `Cupón ${codeList[0]} creado`
          : `${qty} cupones generados`
      );
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Error al generar cupones");
    } finally {
      setSubmitting(false);
    }
  };

  const exportCsv = (codes: string[]) => {
    const header = "code,link,discount_percent,category,expires_at\n";
    const body = codes
      .map(
        (c) =>
          `${c},${buildPublicLink(c)},${discount},${category},${expiresAt || ""}`
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cupones-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = async (text: string, label = "Copiado") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(label);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const deactivate = async (c: Coupon) => {
    if (!confirm(`¿Desactivar el cupón ${c.code}?`)) return;
    const { error } = await supabase
      .from("coupons")
      .update({ active: false })
      .eq("id", c.id);
    if (error) {
      toast.error("Error al desactivar");
    } else {
      toast.success("Cupón desactivado");
      load();
    }
  };

  const reactivate = async (c: Coupon) => {
    const { error } = await supabase
      .from("coupons")
      .update({ active: true })
      .eq("id", c.id);
    if (error) {
      toast.error("Error al activar");
    } else {
      toast.success("Cupón activado");
      load();
    }
  };

  const renderStatus = (c: Coupon) => {
    const s = couponStatus(c);
    if (s === "active")
      return <Badge className="bg-emerald-500 hover:bg-emerald-500">Activo</Badge>;
    if (s === "used")
      return <Badge variant="secondary">Usado</Badge>;
    if (s === "expired")
      return <Badge variant="destructive">Expirado</Badge>;
    return <Badge variant="outline">Inactivo</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Cupones</h1>
          <p className="text-sm text-muted-foreground">
            Genera códigos personalizados de un solo uso para repartir a invitados.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openCreate("single")}>
            <Plus className="h-4 w-4 mr-2" /> Nuevo cupón
          </Button>
          <Button onClick={() => openCreate("bulk")}>
            <TicketIcon className="h-4 w-4 mr-2" /> Generar lote
          </Button>
        </div>
      </div>

      <Card className="p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="used">Usados</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {filtered.length} de {items.length}
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No hay cupones que coincidan.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Carné</TableHead>
                <TableHead>Expira</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                  <TableCell>{c.discount_percent}%</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {c.uses_count}
                    {c.max_uses != null ? ` / ${c.max_uses}` : ""}
                  </TableCell>
                  <TableCell>{c.requires_id_card ? "Sí" : "No"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.expires_at
                      ? new Date(c.expires_at).toLocaleDateString("es-PE")
                      : "—"}
                  </TableCell>
                  <TableCell>{renderStatus(c)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Copiar código"
                        onClick={() => copy(c.code, `Código ${c.code} copiado`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Copiar link directo"
                        onClick={() =>
                          copy(buildPublicLink(c.code), "Link copiado")
                        }
                      >
                        <Link2 className="h-4 w-4" />
                      </Button>
                      {c.active ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Desactivar"
                          onClick={() => deactivate(c)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => reactivate(c)}
                        >
                          Activar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {mode === "single" ? "Nuevo cupón personalizado" : "Generar lote de cupones"}
            </DialogTitle>
            <DialogDescription>
              {mode === "single"
                ? "Crea un código único de un solo uso para enviar a una persona."
                : "Genera varios códigos únicos de un solo uso de golpe."}
            </DialogDescription>
          </DialogHeader>

          {lastGenerated.length === 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Descuento (%)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Categoría</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">full</SelectItem>
                      <SelectItem value="edu100">edu100</SelectItem>
                      <SelectItem value="edu50">edu50</SelectItem>
                      <SelectItem value="vip">vip</SelectItem>
                      <SelectItem value="speaker">speaker</SelectItem>
                      <SelectItem value="sponsor">sponsor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Prefijo (opcional)</Label>
                  <Input
                    placeholder="VIP, EDU…"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Expira el (opcional)</Label>
                  <Input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>

              {mode === "bulk" && (
                <div>
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo 500 por lote.
                  </p>
                </div>
              )}

              {mode === "single" && (
                <div>
                  <Label>Nota interna (opcional)</Label>
                  <Input
                    placeholder="Para quién es este cupón…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Solo para tu referencia (no se guarda en la base).
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label>Requiere foto de carné</Label>
                  <p className="text-xs text-muted-foreground">
                    Útil para cupones educativos.
                  </p>
                </div>
                <Switch checked={requiresIdCard} onCheckedChange={setRequiresIdCard} />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleGenerate} disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Generar
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border bg-muted/30 max-h-64 overflow-auto p-3 font-mono text-sm space-y-1">
                {lastGenerated.map((c) => (
                  <div key={c} className="flex items-center justify-between gap-2">
                    <span>{c}</span>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copy(c, `Código ${c} copiado`)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copy(buildPublicLink(c), "Link copiado")}
                      >
                        <Link2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => exportCsv(lastGenerated)}
                >
                  <Download className="h-4 w-4 mr-2" /> Exportar CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    copy(lastGenerated.join("\n"), "Todos los códigos copiados")
                  }
                >
                  <Copy className="h-4 w-4 mr-2" /> Copiar todos
                </Button>
                <Button onClick={() => setOpenModal(false)}>Listo</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

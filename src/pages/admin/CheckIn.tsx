import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QrCode, Check, Loader2, Camera, X, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Html5Qrcode } from "html5-qrcode";

type Reg = {
  id: string;
  ticket_id: string;
  full_name: string;
  email: string;
  category: string;
  checked_in: boolean;
  payment_status: string;
};

const catLabel = (c: string) => {
  if (c === "edu100" || c === "education") return "EDU";
  if (c === "staff50" || c === "staff") return "50%";
  return "Full";
};

export default function CheckIn() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: "success" | "duplicate" | "error";
    title: string;
    name?: string;
    detail?: string;
  } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const showResult = (r: NonNullable<typeof scanResult>) => {
    setScanResult(r);
    setTimeout(() => setScanResult(null), 3000);
  };

  const search = async (term: string) => {
    setLoading(true);
    const tterm = term.trim();
    let query = supabase
      .from("event_registrations")
      .select("id, ticket_id, full_name, email, category, checked_in, payment_status")
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false })
      .limit(50);
    if (tterm) {
      query = query.or(`ticket_id.ilike.%${tterm}%,full_name.ilike.%${tterm}%,email.ilike.%${tterm}%`);
    }
    const { data, error } = await query;
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setRows((data as Reg[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(() => search(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const ch = supabase
      .channel("checkin-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "event_registrations" }, () => search(q))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [q]);

  const doCheckin = async (r: Reg) => {
    if (r.checked_in) {
      showResult({ status: "duplicate", title: "Ya estaba registrado", name: r.full_name, detail: `${catLabel(r.category)} · ${r.ticket_id}` });
      return;
    }
    const now = new Date().toISOString();
    const { error: e1 } = await supabase
      .from("event_registrations")
      .update({ checked_in: true, checked_in_at: now, checked_in_by: user?.id ?? null })
      .eq("id", r.id);
    if (e1) {
      showResult({ status: "error", title: "No se pudo registrar", detail: e1.message });
      return;
    }
    await supabase.from("check_in_events").insert({
      registration_id: r.id,
      checked_in_by: user?.id ?? null,
      category: r.category,
    });
    showResult({ status: "success", title: "Entrada confirmada", name: r.full_name, detail: `${catLabel(r.category)} · ${r.ticket_id}` });
    search(q);
  };

  const startScanner = async () => {
    setScanning(true);
    setTimeout(async () => {
      try {
        const s = new Html5Qrcode("qr-reader");
        scannerRef.current = s;
        await s.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 240 },
          async (decoded) => {
            // Extract ticket id from URL (?t=XXXX) or plain text
            let ticket = decoded;
            try {
              const u = new URL(decoded);
              ticket = u.searchParams.get("t") ?? decoded;
            } catch { /* not a URL */ }
            await s.stop();
            scannerRef.current = null;
            setScanning(false);
            setQ(ticket);
            // Auto check-in si lo encuentra
            const { data } = await supabase
              .from("event_registrations")
              .select("id, ticket_id, full_name, email, category, checked_in, payment_status")
              .eq("ticket_id", ticket)
              .eq("payment_status", "paid")
              .maybeSingle();
            if (data) doCheckin(data as Reg);
            else showResult({ status: "error", title: "Ticket no encontrado", detail: ticket });
          },
          () => {},
        );
      } catch (e: any) {
        toast({ title: "No se pudo iniciar la cámara", description: e?.message ?? "", variant: "destructive" });
        setScanning(false);
      }
    }, 50);
  };

  const stopScanner = async () => {
    try { await scannerRef.current?.stop(); } catch { /* ignore */ }
    scannerRef.current = null;
    setScanning(false);
  };

  const total = rows.length;
  const present = useMemo(() => rows.filter(r => r.checked_in).length, [rows]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Check-in</h1>
          <p className="text-sm text-muted-foreground">Busca por nombre, email o ticket. {present}/{total} presentes.</p>
        </div>
        <Button onClick={scanning ? stopScanner : startScanner} variant={scanning ? "outline" : "default"}>
          {scanning ? <><X className="w-4 h-4" /> Detener</> : <><Camera className="w-4 h-4" /> Escanear QR</>}
        </Button>
      </div>

      {scanning && (
        <Card className="p-4">
          <div id="qr-reader" className="max-w-sm mx-auto" />
          <p className="text-xs text-center text-muted-foreground mt-2">Apunta la cámara al QR del asistente.</p>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="MM26-XXXX, nombre o email…"
            autoFocus
          />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={5} className="text-center py-6"><Loader2 className="w-4 h-4 animate-spin inline" /></TableCell></TableRow>
              )}
              {!loading && rows.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">Sin resultados.</TableCell></TableRow>
              )}
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.ticket_id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{r.full_name}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{catLabel(r.category)}</Badge></TableCell>
                  <TableCell>
                    {r.checked_in
                      ? <Badge variant="default"><Check className="w-3 h-3" /> Presente</Badge>
                      : <Badge variant="secondary">Pendiente</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" disabled={r.checked_in} onClick={() => doCheckin(r)}>
                      Check-in
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {scanResult && (
        <button
          type="button"
          onClick={() => setScanResult(null)}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center text-white p-6 animate-in fade-in duration-200 ${
            scanResult.status === "success"
              ? "bg-emerald-600"
              : scanResult.status === "duplicate"
              ? "bg-amber-500"
              : "bg-red-600"
          }`}
          aria-label="Cerrar resultado"
        >
          {scanResult.status === "success" ? (
            <CheckCircle2 className="w-32 h-32 mb-4 drop-shadow-lg" strokeWidth={1.5} />
          ) : scanResult.status === "duplicate" ? (
            <AlertTriangle className="w-32 h-32 mb-4 drop-shadow-lg" strokeWidth={1.5} />
          ) : (
            <XCircle className="w-32 h-32 mb-4 drop-shadow-lg" strokeWidth={1.5} />
          )}
          <div className="text-3xl sm:text-4xl font-bold text-center">{scanResult.title}</div>
          {scanResult.name && (
            <div className="mt-3 text-xl sm:text-2xl text-center font-medium">{scanResult.name}</div>
          )}
          {scanResult.detail && (
            <div className="mt-1 text-sm sm:text-base text-center opacity-90">{scanResult.detail}</div>
          )}
          <div className="mt-6 text-xs opacity-80">Toca para cerrar</div>
        </button>
      )}
    </div>
  );
}

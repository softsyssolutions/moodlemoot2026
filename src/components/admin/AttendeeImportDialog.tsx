import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onDone: () => void;
};

const TEMPLATE_HEADERS = [
  "full_name", "email", "whatsapp", "role_title", "institution",
  "institution_type", "attendance_type", "country", "city",
  "category", "payment_status", "payment_method", "amount_paid", "currency",
  "coupon_code", "internal_notes",
];

const TEMPLATE_EXAMPLE = [
  {
    full_name: "Juan Pérez",
    email: "juan@example.com",
    whatsapp: "+51987654321",
    role_title: "Docente",
    institution: "Universidad ABC",
    institution_type: "universidad",
    attendance_type: "presencial",
    country: "Perú",
    city: "Lima",
    category: "full",
    payment_status: "paid",
    payment_method: "transferencia",
    amount_paid: 157,
    currency: "USD",
    coupon_code: "",
    internal_notes: "Pagó por transferencia BCP el 15/03",
  },
];

const BATCH_SIZE = 400;

export default function AttendeeImportDialog({ open, onOpenChange, onDone }: Props) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<{ created: number; updated: number; errors: any[] } | null>(null);

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(TEMPLATE_EXAMPLE, { header: TEMPLATE_HEADERS });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistentes");
    XLSX.writeFile(wb, "plantilla-asistentes.xlsx");
  };

  const parseFile = async (f: File) => {
    setFile(f);
    setResult(null);
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: "" });
    setPreview(rows);
  };

  const runImport = async () => {
    if (!preview.length) return;
    setBusy(true);
    setResult(null);
    const totals = { created: 0, updated: 0, errors: [] as any[] };
    const total = preview.length;
    setProgress({ done: 0, total });
    try {
      for (let i = 0; i < preview.length; i += BATCH_SIZE) {
        const chunk = preview.slice(i, i + BATCH_SIZE);
        const { data, error } = await supabase.functions.invoke("admin-import-attendees", {
          body: { rows: chunk },
        });
        if (error) {
          const detail = (error as any)?.context?.text
            ? await (error as any).context.text().catch(() => "")
            : "";
          throw new Error(`${error.message}${detail ? ` — ${detail}` : ""}`);
        }
        totals.created += data?.created ?? 0;
        totals.updated += data?.updated ?? 0;
        if (Array.isArray(data?.errors)) {
          totals.errors.push(
            ...data.errors.map((e: any) => ({ ...e, index: (e.index ?? 0) + i })),
          );
        }
        setProgress({ done: Math.min(i + BATCH_SIZE, total), total });
      }
      setResult(totals);
      toast({
        title: "Importación completada",
        description: `Creados: ${totals.created}, actualizados: ${totals.updated}, errores: ${totals.errors.length}`,
      });
      onDone();
    } catch (e: any) {
      toast({ title: "Error al importar", description: e?.message ?? "No se pudo importar", variant: "destructive" });
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const close = () => {
    setFile(null); setPreview([]); setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : close())}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar asistentes desde Excel / CSV</DialogTitle>
          <DialogDescription>
            Descarga la plantilla, complétala y súbela aquí. Se identificarán duplicados por email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4" /> Descargar plantilla
            </Button>
            <label className="inline-flex items-center gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md px-3 h-9 text-sm cursor-pointer">
              <Upload className="w-4 h-4" />
              {file ? file.name : "Seleccionar archivo (.xlsx, .csv)"}
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])}
              />
            </label>
          </div>

          {preview.length > 0 && (
            <div className="border rounded-md overflow-x-auto max-h-64">
              <table className="text-xs w-full">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    {Object.keys(preview[0]).map((k) => (
                      <th key={k} className="p-2 text-left font-medium">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-t">
                      {Object.keys(preview[0]).map((k) => (
                        <td key={k} className="p-2 truncate max-w-[160px]">{String(row[k] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 20 && (
                <div className="p-2 text-xs text-muted-foreground text-center">
                  … y {preview.length - 20} filas más
                </div>
              )}
            </div>
          )}

          {result && (
            <div className="text-sm space-y-1 p-3 rounded-md bg-muted">
              <div>✓ Creados: <strong>{result.created}</strong></div>
              <div>↻ Actualizados: <strong>{result.updated}</strong></div>
              {result.errors?.length > 0 && (
                <div className="text-destructive">
                  ✗ Errores: <strong>{result.errors.length}</strong>
                  <ul className="list-disc ml-5 mt-1">
                    {result.errors.slice(0, 5).map((e, i) => (
                      <li key={i}>Fila {e.index + 1} ({e.email}): {e.error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {progress && (
            <div className="text-xs text-muted-foreground mr-auto">
              Procesando {progress.done} / {progress.total}…
            </div>
          )}
          <Button variant="outline" onClick={close} disabled={busy}>Cerrar</Button>
          <Button onClick={runImport} disabled={!preview.length || busy}>
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Importar {preview.length > 0 ? `(${preview.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

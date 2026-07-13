import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pencil, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Attendee } from "@/pages/admin/Attendees";

type AuditEntry = {
  id: string;
  action: string;
  changed_at: string;
  changed_by: string | null;
  changes: any;
};

type Props = {
  attendee: Attendee | null;
  onClose: () => void;
  onEdit: (a: Attendee) => void;
};

const fmt = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-PE", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
};

const fieldLabels: Record<string, string> = {
  full_name: "Nombre", email: "Email", whatsapp: "WhatsApp",
  role_title: "Cargo", institution: "Institución", institution_type: "Tipo inst.",
  attendance_type: "Modalidad", country: "País", city: "Ciudad",
  category: "Categoría", payment_status: "Estado pago", payment_method: "Método pago",
  amount_paid: "Monto", currency: "Moneda", coupon_code: "Cupón",
  internal_notes: "Notas internas", checked_in: "Check-in", is_manual: "Manual",
};

export default function AttendeeDetailDrawer({ attendee, onClose, onEdit }: Props) {
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [emailMap, setEmailMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!attendee) { setAudit([]); return; }
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("registration_audit_log")
        .select("id, action, changed_at, changed_by, changes")
        .eq("registration_id", attendee.id)
        .order("changed_at", { ascending: false })
        .limit(100);
      const entries = (data as AuditEntry[]) ?? [];
      setAudit(entries);

      const ids = Array.from(new Set([
        attendee.registered_by,
        attendee.last_edited_by,
        ...entries.map((e) => e.changed_by),
      ].filter(Boolean))) as string[];
      if (ids.length) {
        const { data: emails } = await supabase.rpc("get_user_emails", { _ids: ids });
        const m: Record<string, string> = {};
        (emails as any[])?.forEach((e) => { m[e.id] = e.email; });
        setEmailMap(m);
      }
      setLoading(false);
    })();
  }, [attendee]);

  if (!attendee) return null;

  return (
    <Sheet open={!!attendee} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between gap-2">
            <span>{attendee.full_name}</span>
            <Button size="sm" variant="outline" onClick={() => onEdit(attendee)}>
              <Pencil className="w-3.5 h-3.5" /> Editar
            </Button>
          </SheetTitle>
          <SheetDescription className="font-mono text-xs">{attendee.ticket_id}</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant={attendee.payment_status === "paid" ? "default" : "secondary"}>{attendee.payment_status}</Badge>
            <Badge variant="outline">{attendee.category}</Badge>
            {attendee.is_manual && <Badge variant="secondary">Registro manual</Badge>}
            {attendee.checked_in && <Badge>Presente</Badge>}
          </div>

          <Row label="Email" value={attendee.email} />
          <Row label="WhatsApp" value={attendee.whatsapp ?? "—"} />
          <Row label="Cargo" value={attendee.role_title ?? "—"} />
          <Row label="Institución" value={attendee.institution ?? "—"} />
          <Row label="País / Ciudad" value={`${attendee.country ?? "—"} · ${attendee.city ?? "—"}`} />
          <Row label="Modalidad" value={attendee.attendance_type ?? "—"} />
          <Row label="Método de pago" value={attendee.payment_method ?? "—"} />
          <Row label="Monto" value={`${attendee.currency} ${Number(attendee.amount_paid).toFixed(2)}`} />
          {attendee.coupon_code && <Row label="Cupón" value={attendee.coupon_code} />}
          {attendee.internal_notes && (
            <div className="rounded-md bg-muted p-3">
              <div className="text-xs text-muted-foreground mb-1">Notas internas</div>
              <div className="whitespace-pre-wrap">{attendee.internal_notes}</div>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-xs">
            <Row label="Creado" value={fmt(attendee.created_at)} />
            <Row label="Actualizado" value={fmt(attendee.updated_at)} />
            <Row label="Registrado por" value={attendee.registered_by ? (emailMap[attendee.registered_by] ?? "—") : "Web pública"} />
            <Row label="Última edición" value={attendee.last_edited_by ? `${emailMap[attendee.last_edited_by] ?? "—"} · ${fmt(attendee.last_edited_at)}` : "—"} />
          </div>

          <Separator />

          <div>
            <div className="font-semibold mb-2">Historial de cambios</div>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {!loading && audit.length === 0 && (
              <div className="text-xs text-muted-foreground">Sin historial disponible.</div>
            )}
            <ul className="space-y-3">
              {audit.map((e) => (
                <li key={e.id} className="border-l-2 border-muted pl-3">
                  <div className="text-xs text-muted-foreground">
                    {fmt(e.changed_at)} · {e.changed_by ? (emailMap[e.changed_by] ?? "usuario") : "sistema"} · {e.action}
                  </div>
                  {e.action === "update" && (
                    <ul className="mt-1 text-xs space-y-0.5">
                      {Object.entries(e.changes || {}).map(([k, v]: [string, any]) => (
                        <li key={k}>
                          <strong>{fieldLabels[k] ?? k}:</strong>{" "}
                          <span className="line-through text-muted-foreground">{String(v?.old ?? "—")}</span>{" → "}
                          <span>{String(v?.new ?? "—")}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {e.action === "create" && (
                    <div className="text-xs text-muted-foreground">Registro creado.</div>
                  )}
                  {e.action === "delete" && (
                    <div className="text-xs text-destructive">Registro eliminado.</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

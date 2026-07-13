import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Attendee } from "@/pages/admin/Attendees";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  attendee?: Attendee;
  onSaved: () => void;
};

const empty = {
  full_name: "",
  email: "",
  whatsapp: "",
  role_title: "",
  institution: "",
  institution_type: "otra" as const,
  attendance_type: "presencial" as const,
  country: "Perú",
  city: "Lima",
  category: "full" as const,
  payment_status: "paid" as const,
  payment_method: "transferencia" as const,
  amount_paid: 0,
  currency: "USD",
  coupon_code: "",
  internal_notes: "",
  send_email: true,
};

export default function AttendeeFormDialog({ open, onOpenChange, attendee, onSaved }: Props) {
  const { toast } = useToast();
  const editing = !!attendee;
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (attendee) {
      setForm({
        full_name: attendee.full_name ?? "",
        email: attendee.email ?? "",
        whatsapp: attendee.whatsapp ?? "",
        role_title: attendee.role_title ?? "",
        institution: attendee.institution ?? "",
        institution_type: (attendee.institution_type ?? "otra") as any,
        attendance_type: (attendee.attendance_type ?? "presencial") as any,
        country: attendee.country ?? "Perú",
        city: attendee.city ?? "Lima",
        category: attendee.category as any,
        payment_status: attendee.payment_status as any,
        payment_method: (attendee.payment_method ?? "transferencia") as any,
        amount_paid: Number(attendee.amount_paid ?? 0),
        currency: attendee.currency ?? "USD",
        coupon_code: attendee.coupon_code ?? "",
        internal_notes: attendee.internal_notes ?? "",
        send_email: false,
      });
    } else {
      setForm(empty);
    }
  }, [attendee, open]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.full_name.trim() || !form.email.trim() || !form.whatsapp.trim()) {
      toast({ title: "Faltan datos", description: "Nombre, email y WhatsApp son obligatorios.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const patch = {
          full_name: form.full_name,
          email: form.email,
          whatsapp: form.whatsapp,
          role_title: form.role_title || "—",
          institution: form.institution || "—",
          institution_type: form.institution_type,
          attendance_type: form.attendance_type,
          country: form.country,
          city: form.city,
          category: form.category,
          payment_status: form.payment_status,
          payment_method: form.payment_method,
          amount_paid: Number(form.amount_paid) || 0,
          currency: form.currency,
          coupon_code: form.coupon_code || null,
          internal_notes: form.internal_notes || null,
        };
        const { error } = await supabase.functions.invoke("admin-update-attendee", {
          body: { id: attendee!.id, patch },
        });
        if (error) throw error;
        toast({ title: "Asistente actualizado" });
      } else {
        const { error } = await supabase.functions.invoke("admin-register-attendee", {
          body: {
            ...form,
            role_title: form.role_title || "—",
            institution: form.institution || "—",
            amount_paid: Number(form.amount_paid) || 0,
            coupon_code: form.coupon_code || null,
            internal_notes: form.internal_notes || null,
          },
        });
        if (error) throw error;
        toast({ title: "Asistente registrado", description: form.send_email ? "Correo con ticket enviado." : "Registro creado sin envío de correo." });
      }
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "No se pudo guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar asistente" : "Registrar asistente manualmente"}</DialogTitle>
          <DialogDescription>
            {editing ? "Modifica los datos del registro. Los cambios quedan en el historial." : "Crea un registro pagado sin pasar por PayPal (transferencia, cortesía, efectivo, etc.)."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nombre completo *">
            <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
          </Field>
          <Field label="Email *">
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="WhatsApp *">
            <Input placeholder="+51987654321" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          </Field>
          <Field label="Cargo / rol">
            <Input value={form.role_title} onChange={(e) => set("role_title", e.target.value)} />
          </Field>
          <Field label="Institución">
            <Input value={form.institution} onChange={(e) => set("institution", e.target.value)} />
          </Field>
          <Field label="Tipo de institución">
            <Select value={form.institution_type} onValueChange={(v) => set("institution_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="privada">Privada</SelectItem>
                <SelectItem value="publica">Pública</SelectItem>
                <SelectItem value="universidad">Universidad</SelectItem>
                <SelectItem value="otra">Otra</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Modalidad">
            <Select value={form.attendance_type} onValueChange={(v) => set("attendance_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="hibrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="País">
            <Input value={form.country} onChange={(e) => set("country", e.target.value)} />
          </Field>
          <Field label="Ciudad">
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Categoría">
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Completo</SelectItem>
                <SelectItem value="staff50">50% (staff)</SelectItem>
                <SelectItem value="edu100">EDU (gratis)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Método de pago">
            <Select value={form.payment_method} onValueChange={(v) => set("payment_method", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="cortesia">Cortesía</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {editing && (
            <Field label="Estado del pago">
              <Select value={form.payment_status} onValueChange={(v) => set("payment_status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Pagado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field label="Monto pagado">
            <Input type="number" step="0.01" min="0" value={form.amount_paid}
              onChange={(e) => set("amount_paid", e.target.value)} />
          </Field>
          <Field label="Moneda">
            <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="PEN">PEN</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Cupón usado (opcional)">
            <Input value={form.coupon_code} onChange={(e) => set("coupon_code", e.target.value.toUpperCase())} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Notas internas (solo staff)">
              <Textarea
                rows={3}
                placeholder="Ej: pagó por Yape a la cuenta X, invitado especial de patrocinador…"
                value={form.internal_notes}
                onChange={(e) => set("internal_notes", e.target.value)}
              />
            </Field>
          </div>
          {!editing && (
            <div className="md:col-span-2 flex items-center gap-2">
              <Checkbox
                id="send_email"
                checked={form.send_email}
                onCheckedChange={(v) => set("send_email", !!v)}
              />
              <Label htmlFor="send_email" className="cursor-pointer">
                Enviar correo de confirmación con ticket QR
              </Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editing ? "Guardar cambios" : "Registrar asistente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

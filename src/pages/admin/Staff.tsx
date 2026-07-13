import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, UserPlus, KeyRound, Trash2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type StaffUser = {
  user_id: string;
  email: string;
  full_name: string;
  created_at: string;
};

export default function AdminStaff() {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [callerId, setCallerId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [pwTarget, setPwTarget] = useState<StaffUser | null>(null);
  const [removeTarget, setRemoveTarget] = useState<StaffUser | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("list-staff-users", { body: {} });
    if (error || (data as any)?.error) {
      toast({
        title: "No se pudo cargar el staff",
        description: (data as any)?.error ?? error?.message ?? "Error desconocido",
        variant: "destructive",
      });
      setStaff([]);
    } else {
      setStaff(((data as any)?.users ?? []) as StaffUser[]);
      setCallerId(((data as any)?.caller_id ?? null) as string | null);
    }
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Solo administradores pueden ver esta sección.
      </div>
    );
  }

  const fmtDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return "—"; }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Personal de Staff
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gestiona el acceso del equipo de puerta. Puedes crear, restablecer clave o quitar acceso.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
          <UserPlus className="w-4 h-4" /> Agregar Personal de Staff
        </Button>
      </div>

      <Card className="p-3 sm:p-5">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : staff.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-10">
            Aún no hay personal de staff. Crea el primero con el botón superior.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Alta</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((s) => (
                    <TableRow key={s.user_id}>
                      <TableCell className="font-medium">
                        {s.full_name || "—"}
                        {s.user_id === callerId && (
                          <Badge variant="outline" className="ml-2 text-[10px]">Tú</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">{s.email}</TableCell>
                      <TableCell className="text-xs">{fmtDate(s.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setPwTarget(s)}>
                            <KeyRound className="w-3 h-3" /> Cambiar clave
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRemoveTarget(s)}
                            disabled={s.user_id === callerId}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" /> Quitar acceso
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {staff.map((s) => (
                <div key={s.user_id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{s.full_name || "—"}</div>
                      <div className="text-xs text-muted-foreground truncate">{s.email}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Alta: {fmtDate(s.created_at)}</div>
                    </div>
                    {s.user_id === callerId && <Badge variant="outline" className="text-[10px] shrink-0">Tú</Badge>}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setPwTarget(s)}>
                      <KeyRound className="w-3 h-3" /> Clave
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-destructive hover:text-destructive"
                      onClick={() => setRemoveTarget(s)}
                      disabled={s.user_id === callerId}
                    >
                      <Trash2 className="w-3 h-3" /> Quitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <AddStaffModal open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) load(); }} />
      <ChangePasswordModal
        target={pwTarget}
        onClose={(refresh) => { setPwTarget(null); if (refresh) load(); }}
      />
      <RemoveRoleDialog
        target={removeTarget}
        onClose={(refresh) => { setRemoveTarget(null); if (refresh) load(); }}
      />
    </div>
  );
}

function AddStaffModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => { setFullName(""); setEmail(""); setPassword(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) return toast({ title: "Nombre inválido", variant: "destructive" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast({ title: "Correo inválido", variant: "destructive" });
    if (password.length < 8) return toast({ title: "Contraseña muy corta", description: "Mínimo 8 caracteres.", variant: "destructive" });

    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("create-staff-user", {
      body: { full_name: fullName.trim(), email: email.trim(), password },
    });
    setSubmitting(false);

    if (error || (data as any)?.error) {
      toast({ title: "Error al crear staff", description: (data as any)?.error ?? error?.message ?? "No se pudo crear.", variant: "destructive" });
      return;
    }
    toast({ title: "Staff creado correctamente", description: `${email} con rol de staff.` });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!submitting) { onOpenChange(o); if (!o) reset(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Personal de Staff</DialogTitle>
          <DialogDescription>
            Crea una cuenta con rol de staff para el equipo de puerta. El acceso es inmediato.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="staff-name">Nombre Completo</Label>
            <Input id="staff-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej. María Pérez" autoComplete="off" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-email">Correo Electrónico</Label>
            <Input id="staff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@evento.com" autoComplete="off" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-password">Contraseña</Label>
            <Input id="staff-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancelar</Button>
            <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</> : <><UserPlus className="w-4 h-4" /> Crear Staff</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ChangePasswordModal({
  target, onClose,
}: { target: StaffUser | null; onClose: (refresh: boolean) => void }) {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!target) setPassword(""); }, [target]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    if (password.length < 8) {
      toast({ title: "Contraseña muy corta", description: "Mínimo 8 caracteres.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("update-staff-user", {
      body: { user_id: target.user_id, action: "reset_password", password },
    });
    setSubmitting(false);
    if (error || (data as any)?.error) {
      toast({ title: "No se pudo cambiar la clave", description: (data as any)?.error ?? error?.message, variant: "destructive" });
      return;
    }
    toast({ title: "Contraseña actualizada", description: `Nueva clave activa para ${target.email}.` });
    onClose(true);
  };

  return (
    <Dialog open={!!target} onOpenChange={(o) => { if (!o && !submitting) onClose(false); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogDescription>
            {target ? <>Define una nueva contraseña para <span className="font-medium">{target.email}</span>.</> : null}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-pw">Nueva contraseña</Label>
            <Input id="new-pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)} disabled={submitting}>Cancelar</Button>
            <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><KeyRound className="w-4 h-4" /> Guardar</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RemoveRoleDialog({
  target, onClose,
}: { target: StaffUser | null; onClose: (refresh: boolean) => void }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const confirm = async () => {
    if (!target) return;
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("update-staff-user", {
      body: { user_id: target.user_id, action: "remove_role" },
    });
    setSubmitting(false);
    if (error || (data as any)?.error) {
      toast({ title: "No se pudo quitar el acceso", description: (data as any)?.error ?? error?.message, variant: "destructive" });
      return;
    }
    toast({ title: "Acceso removido", description: `${target.email} ya no es staff.` });
    onClose(true);
  };

  return (
    <AlertDialog open={!!target} onOpenChange={(o) => { if (!o && !submitting) onClose(false); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Quitar acceso de staff?</AlertDialogTitle>
          <AlertDialogDescription>
            {target ? <>Se removerá el rol de staff de <span className="font-medium">{target.email}</span>. La cuenta no se elimina; solo perderá el acceso al panel.</> : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirm} disabled={submitting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {submitting ? "Removiendo..." : "Sí, quitar acceso"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

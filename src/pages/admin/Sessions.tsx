import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveEvent } from "@/hooks/useActiveEvent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

type Session = {
  id: string;
  event_id: string;
  day: string | null;
  start_time: string | null;
  end_time: string | null;
  room: string | null;
  type: string | null;
  title: string;
  description: string | null;
  speaker_id: string | null;
  visible: boolean;
};

type Speaker = { id: string; name: string };

const schema = z.object({
  title: z.string().trim().min(1, "Título requerido").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  day: z.string().trim().optional().or(z.literal("")),
  start_time: z.string().trim().optional().or(z.literal("")),
  end_time: z.string().trim().optional().or(z.literal("")),
  room: z.string().trim().max(120).optional().or(z.literal("")),
  type: z.string().trim().optional().or(z.literal("")),
  speaker_id: z.string().optional().or(z.literal("")),
  visible: z.boolean().default(true),
});

const empty = {
  title: "", description: "", day: "", start_time: "", end_time: "",
  room: "", type: "talk", speaker_id: "", visible: true,
};

const TYPES = [
  { value: "keynote", label: "Keynote" },
  { value: "talk", label: "Charla" },
  { value: "workshop", label: "Taller" },
  { value: "panel", label: "Panel" },
  { value: "break", label: "Descanso" },
];

export default function AdminSessions() {
  const { event } = useActiveEvent();
  const [items, setItems] = useState<Session[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Session | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!event) return;
    setLoading(true);
    const [{ data: sess }, { data: sp }] = await Promise.all([
      supabase.from("event_sessions").select("*").eq("event_id", event.id)
        .order("day", { nullsFirst: false }).order("start_time", { nullsFirst: false }),
      supabase.from("event_speakers").select("id,name").eq("event_id", event.id).order("name"),
    ]);
    setItems((sess ?? []) as Session[]);
    setSpeakers((sp ?? []) as Speaker[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [event]);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (s: Session) => {
    setEditing(s);
    setForm({
      title: s.title,
      description: s.description ?? "",
      day: s.day ?? "",
      start_time: s.start_time ?? "",
      end_time: s.end_time ?? "",
      room: s.room ?? "",
      type: s.type ?? "talk",
      speaker_id: s.speaker_id ?? "",
      visible: s.visible,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!event) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    const d = parsed.data;
    const payload = {
      event_id: event.id,
      title: d.title,
      description: d.description || null,
      day: d.day || null,
      start_time: d.start_time || null,
      end_time: d.end_time || null,
      room: d.room || null,
      type: d.type || null,
      speaker_id: d.speaker_id || null,
      visible: d.visible,
    };
    const { error } = editing
      ? await supabase.from("event_sessions").update(payload).eq("id", editing.id)
      : await supabase.from("event_sessions").insert(payload);
    setBusy(false);
    if (error) return toast.error("Error al guardar: " + error.message);
    toast.success("Sesión guardada");
    setOpen(false);
    load();
  };

  const remove = async (s: Session) => {
    if (!confirm(`¿Eliminar "${s.title}"?`)) return;
    const { error } = await supabase.from("event_sessions").delete().eq("id", s.id);
    if (error) return toast.error("Error");
    toast.success("Sesión eliminada");
    load();
  };

  const toggleVisible = async (s: Session) => {
    await supabase.from("event_sessions").update({ visible: !s.visible }).eq("id", s.id);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sesiones</h1>
          <p className="text-sm text-muted-foreground">{items.length} en total</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nueva sesión</Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          Aún no hay sesiones. Crea la primera.
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((s) => {
            const speaker = speakers.find((sp) => sp.id === s.speaker_id);
            return (
              <Card key={s.id} className="p-4 flex items-center gap-4">
                <div className="text-xs text-muted-foreground w-24 shrink-0">
                  <div>{s.day ?? "—"}</div>
                  <div>{s.start_time?.slice(0,5)}{s.end_time ? ` - ${s.end_time.slice(0,5)}` : ""}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{s.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {[s.type, s.room, speaker?.name].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <Switch checked={s.visible} onCheckedChange={() => toggleVisible(s)} />
                <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(s)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar sesión" : "Nueva sesión"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Día</Label>
                <Input type="date" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} />
              </div>
              <div>
                <Label>Inicio</Label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div>
                <Label>Fin</Label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Sala</Label>
                <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Ponente</Label>
              <Select value={form.speaker_id || "none"} onValueChange={(v) => setForm({ ...form, speaker_id: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Sin ponente" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin ponente</SelectItem>
                  {speakers.map((sp) => <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.visible} onCheckedChange={(v) => setForm({ ...form, visible: v })} />
              <Label>Visible en el sitio</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

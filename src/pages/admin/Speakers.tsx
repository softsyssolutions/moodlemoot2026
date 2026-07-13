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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

type Speaker = {
  id: string;
  event_id: string;
  name: string;
  title: string | null;
  org: string | null;
  bio: string | null;
  photo_url: string | null;
  socials: { linkedin?: string; twitter?: string; website?: string };
  order_index: number;
  visible: boolean;
};

const schema = z.object({
  name: z.string().trim().min(1, "Nombre requerido").max(120),
  title: z.string().trim().max(200).optional().or(z.literal("")),
  org: z.string().trim().max(200).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  photo_url: z.string().trim().max(500).url("URL inválida").optional().or(z.literal("")),
  linkedin: z.string().trim().max(500).url("URL inválida").optional().or(z.literal("")),
  twitter: z.string().trim().max(500).url("URL inválida").optional().or(z.literal("")),
  website: z.string().trim().max(500).url("URL inválida").optional().or(z.literal("")),
  order_index: z.coerce.number().int().min(0).default(0),
  visible: z.boolean().default(true),
});

const empty = {
  name: "", title: "", org: "", bio: "", photo_url: "",
  linkedin: "", twitter: "", website: "",
  order_index: 0, visible: true,
};

export default function AdminSpeakers() {
  const { event } = useActiveEvent();
  const [items, setItems] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Speaker | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!event) return;
    setLoading(true);
    const { data } = await supabase
      .from("event_speakers")
      .select("*")
      .eq("event_id", event.id)
      .order("order_index")
      .order("created_at");
    setItems((data ?? []) as Speaker[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [event]);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (s: Speaker) => {
    setEditing(s);
    setForm({
      name: s.name,
      title: s.title ?? "",
      org: s.org ?? "",
      bio: s.bio ?? "",
      photo_url: s.photo_url ?? "",
      linkedin: s.socials?.linkedin ?? "",
      twitter: s.socials?.twitter ?? "",
      website: s.socials?.website ?? "",
      order_index: s.order_index,
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
      name: d.name,
      title: d.title || null,
      org: d.org || null,
      bio: d.bio || null,
      photo_url: d.photo_url || null,
      socials: {
        linkedin: d.linkedin || undefined,
        twitter: d.twitter || undefined,
        website: d.website || undefined,
      },
      order_index: d.order_index,
      visible: d.visible,
    };
    const { error } = editing
      ? await supabase.from("event_speakers").update(payload).eq("id", editing.id)
      : await supabase.from("event_speakers").insert(payload);
    setBusy(false);
    if (error) return toast.error("Error al guardar: " + error.message);
    toast.success("Ponente guardado");
    setOpen(false);
    load();
  };

  const remove = async (s: Speaker) => {
    if (!confirm(`¿Eliminar a ${s.name}?`)) return;
    const { error } = await supabase.from("event_speakers").delete().eq("id", s.id);
    if (error) return toast.error("Error al eliminar");
    toast.success("Ponente eliminado");
    load();
  };

  const toggleVisible = async (s: Speaker) => {
    const { error } = await supabase
      .from("event_speakers")
      .update({ visible: !s.visible })
      .eq("id", s.id);
    if (error) return toast.error("Error");
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Speakers publicados</h2>
          <p className="text-sm text-muted-foreground">{items.length} en total</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nuevo speaker</Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          Aún no hay ponentes. Crea el primero.
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((s) => (
            <Card key={s.id} className="p-4 flex items-center gap-4">
              <Avatar className="h-12 w-12">
                {s.photo_url && <AvatarImage src={s.photo_url} alt={s.name} />}
                <AvatarFallback>{s.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{s.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {[s.title, s.org].filter(Boolean).join(" · ")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Visible</span>
                <Switch checked={s.visible} onCheckedChange={() => toggleVisible(s)} />
              </div>
              <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(s)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar ponente" : "Nuevo ponente"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Nombre *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Cargo</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Organización</Label>
                <Input value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Biografía</Label>
                <Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>URL de foto</Label>
                <Input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://…" />
              </div>
              <div>
                <Label>LinkedIn</Label>
                <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://…" />
              </div>
              <div>
                <Label>Twitter / X</Label>
                <Input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} placeholder="https://…" />
              </div>
              <div>
                <Label>Sitio web</Label>
                <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://…" />
              </div>
              <div>
                <Label>Orden</Label>
                <Input type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Switch checked={form.visible} onCheckedChange={(v) => setForm({ ...form, visible: v })} />
                <Label>Visible en el sitio</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

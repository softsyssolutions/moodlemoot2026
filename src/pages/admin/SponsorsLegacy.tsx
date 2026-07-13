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

type Sponsor = {
  id: string;
  event_id: string;
  name: string;
  tier: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  order_index: number;
  visible: boolean;
};

const schema = z.object({
  name: z.string().trim().min(1, "Nombre requerido").max(120),
  tier: z.string().trim().min(1).max(50),
  logo_url: z.string().trim().url("URL inválida").max(500).optional().or(z.literal("")),
  website_url: z.string().trim().url("URL inválida").max(500).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  order_index: z.coerce.number().int().min(0).default(0),
  visible: z.boolean().default(true),
});

const TIERS = [
  { value: "platinum", label: "Platinum" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "bronze", label: "Bronze" },
  { value: "partner", label: "Partner" },
];

const empty = {
  name: "", tier: "gold", logo_url: "", website_url: "", description: "",
  order_index: 0, visible: true,
};

export default function AdminSponsors() {
  const { event } = useActiveEvent();
  const [items, setItems] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!event) return;
    setLoading(true);
    const { data } = await supabase
      .from("event_sponsors")
      .select("*")
      .eq("event_id", event.id)
      .order("tier")
      .order("order_index");
    setItems((data ?? []) as Sponsor[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [event]);

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (s: Sponsor) => {
    setEditing(s);
    setForm({
      name: s.name,
      tier: s.tier,
      logo_url: s.logo_url ?? "",
      website_url: s.website_url ?? "",
      description: s.description ?? "",
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
      tier: d.tier,
      logo_url: d.logo_url || null,
      website_url: d.website_url || null,
      description: d.description || null,
      order_index: d.order_index,
      visible: d.visible,
    };
    const { error } = editing
      ? await supabase.from("event_sponsors").update(payload).eq("id", editing.id)
      : await supabase.from("event_sponsors").insert(payload);
    setBusy(false);
    if (error) return toast.error("Error: " + error.message);
    toast.success("Sponsor guardado");
    setOpen(false);
    load();
  };

  const remove = async (s: Sponsor) => {
    if (!confirm(`¿Eliminar a ${s.name}?`)) return;
    await supabase.from("event_sponsors").delete().eq("id", s.id);
    toast.success("Eliminado");
    load();
  };

  const toggleVisible = async (s: Sponsor) => {
    await supabase.from("event_sponsors").update({ visible: !s.visible }).eq("id", s.id);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sponsors</h1>
          <p className="text-sm text-muted-foreground">{items.length} en total</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nuevo sponsor</Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          Aún no hay sponsors.
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((s) => (
            <Card key={s.id} className="p-4 flex items-center gap-4">
              <div className="h-12 w-20 rounded bg-muted flex items-center justify-center overflow-hidden">
                {s.logo_url
                  ? <img src={s.logo_url} alt={s.name} className="max-h-full max-w-full object-contain" />
                  : <span className="text-xs text-muted-foreground">Sin logo</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{s.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{s.tier}</div>
              </div>
              <Switch checked={s.visible} onCheckedChange={() => toggleVisible(s)} />
              <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(s)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar sponsor" : "Nuevo sponsor"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Nombre *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tier</Label>
                <Select value={form.tier} onValueChange={(v) => setForm({ ...form, tier: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIERS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Orden</Label>
                <Input type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>URL del logo</Label>
              <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://…" />
            </div>
            <div>
              <Label>Sitio web</Label>
              <Input value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://…" />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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

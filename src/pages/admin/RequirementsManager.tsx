import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

type Entity = "speaker" | "sponsor";

const TYPES: { value: string; label: string }[] = [
  { value: "short_text", label: "Texto corto" },
  { value: "long_text", label: "Texto largo" },
  { value: "url", label: "Enlace / URL" },
  { value: "file", label: "Archivo" },
  { value: "country", label: "País" },
  { value: "acceptance", label: "Aceptación" },
];

export default function RequirementsManager({
  open, onOpenChange, entity, eventId, onSaved,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  entity: Entity; eventId: string; onSaved: () => void;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("event_requirements")
      .select("*")
      .eq("event_id", eventId)
      .eq("entity", entity)
      .order("order_index");
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { if (open) load(); }, [open, entity, eventId]);

  const add = () => {
    setItems([...items, {
      __new: true,
      id: `tmp-${Date.now()}`,
      event_id: eventId, entity, key: `campo_${items.length + 1}`,
      label: "Nuevo requisito", help: "",
      type: "short_text", is_required: false, publishes_to_web: false,
      allow_delegate: false, active: true, order_index: items.length, config: {},
    }]);
  };

  const update = (id: string, patch: any) =>
    setItems(items.map((it) => (it.id === id ? { ...it, ...patch, __dirty: true } : it)));

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...items];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setItems(next.map((it, i) => ({ ...it, order_index: i, __dirty: true })));
  };

  const remove = async (it: any) => {
    if (it.__new) return setItems(items.filter((x) => x.id !== it.id));
    if (!confirm(`¿Eliminar "${it.label}"? Los datos cargados por speakers/sponsors se conservarán pero dejarán de contarse.`)) return;
    const { error } = await supabase.from("event_requirements").delete().eq("id", it.id);
    if (error) return toast.error(error.message);
    load();
  };

  const save = async () => {
    setSaving(true);
    for (const it of items) {
      if (!it.__dirty && !it.__new) continue;
      const payload = {
        event_id: eventId, entity, key: it.key || null, label: it.label,
        help: it.help || null, type: it.type, is_required: !!it.is_required,
        publishes_to_web: !!it.publishes_to_web, allow_delegate: !!it.allow_delegate,
        active: it.active !== false, order_index: it.order_index, config: it.config ?? {},
      };
      if (it.__new) {
        const { error } = await supabase.from("event_requirements").insert(payload);
        if (error) { toast.error(error.message); setSaving(false); return; }
      } else {
        const { error } = await supabase.from("event_requirements").update(payload).eq("id", it.id);
        if (error) { toast.error(error.message); setSaving(false); return; }
      }
    }
    setSaving(false);
    toast.success("Requisitos guardados");
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar requisitos · {entity === "speaker" ? "Speakers" : "Sponsors"}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="space-y-2">
            {items.map((it, idx) => (
              <Card key={it.id} className="p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex flex-col gap-0.5 pt-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <button onClick={() => move(idx, -1)} disabled={idx === 0} className="disabled:opacity-30">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="disabled:opacity-30">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 grid gap-2 md:grid-cols-2">
                    <div>
                      <Label className="text-xs">Etiqueta visible</Label>
                      <Input value={it.label} onChange={(e) => update(it.id, { label: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Tipo de campo</Label>
                      <Select value={it.type} onValueChange={(v) => update(it.id, { type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs">Ayuda / instrucción (opcional)</Label>
                      <Textarea rows={2} value={it.help ?? ""} onChange={(e) => update(it.id, { help: e.target.value })} />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 md:col-span-2 text-sm">
                      <label className="flex items-center gap-2">
                        <Switch checked={!!it.is_required} onCheckedChange={(v) => update(it.id, { is_required: v })} />
                        Obligatorio
                      </label>
                      <label className="flex items-center gap-2">
                        <Switch checked={!!it.publishes_to_web} onCheckedChange={(v) => update(it.id, { publishes_to_web: v })} />
                        Se publica en la web
                      </label>
                      <label className="flex items-center gap-2">
                        <Switch checked={!!it.allow_delegate} onCheckedChange={(v) => update(it.id, { allow_delegate: v })} />
                        Delegable
                      </label>
                      <label className="flex items-center gap-2 ml-auto">
                        <Switch checked={it.active !== false} onCheckedChange={(v) => update(it.id, { active: v })} />
                        Activo
                      </label>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(it)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
            <Button variant="outline" onClick={add} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Agregar requisito
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

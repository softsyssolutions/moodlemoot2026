import { useEffect, useState } from "react";
import { useActiveEvent } from "@/hooks/useActiveEvent";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const STATUSES = [
  { value: "draft", label: "Borrador (oculto al público)" },
  { value: "published", label: "Publicado" },
  { value: "live", label: "En vivo" },
  { value: "archived", label: "Archivado" },
];

export default function AdminEvent() {
  const { event, loading, refetch } = useActiveEvent();
  const [form, setForm] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (event) setForm({ ...event });
  }, [event]);

  if (loading || !form) {
    return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  const save = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("events")
      .update({
        name: form.name,
        edition: form.edition || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: form.status,
        location: form.location || null,
        hero_title: form.hero_title || null,
        hero_subtitle: form.hero_subtitle || null,
        about_text: form.about_text || null,
        brand_logo_url: form.brand_logo_url || null,
        brand_color: form.brand_color || null,
      })
      .eq("id", form.id);
    setBusy(false);
    if (error) return toast.error("Error: " + error.message);
    toast.success("Evento actualizado");
    refetch();
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Evento</h1>
        <p className="text-sm text-muted-foreground">Edita los metadatos del evento activo.</p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Nombre</Label>
            <Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Edición</Label>
            <Input value={form.edition ?? ""} onChange={(e) => setForm({ ...form, edition: e.target.value })} />
          </div>
          <div>
            <Label>Fecha inicio</Label>
            <Input type="date" value={form.start_date ?? ""} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div>
            <Label>Fecha fin</Label>
            <Input type="date" value={form.end_date ?? ""} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label>Lugar</Label>
            <Input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label>Estado</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Título Hero</Label>
            <Input value={form.hero_title ?? ""} onChange={(e) => setForm({ ...form, hero_title: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label>Subtítulo Hero</Label>
            <Input value={form.hero_subtitle ?? ""} onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label>Texto About</Label>
            <Textarea rows={4} value={form.about_text ?? ""} onChange={(e) => setForm({ ...form, about_text: e.target.value })} />
          </div>
          <div>
            <Label>URL del logo</Label>
            <Input value={form.brand_logo_url ?? ""} onChange={(e) => setForm({ ...form, brand_logo_url: e.target.value })} />
          </div>
          <div>
            <Label>Color de marca</Label>
            <Input value={form.brand_color ?? ""} onChange={(e) => setForm({ ...form, brand_color: e.target.value })} placeholder="#F98012" />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={save} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Guardar cambios
          </Button>
        </div>
      </Card>
    </div>
  );
}

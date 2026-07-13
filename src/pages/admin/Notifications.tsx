import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BellRing, Send, Loader2, Users, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type Target = "all" | "event" | "self";
type Campaign = {
  id: string;
  title: string;
  body: string;
  url: string | null;
  target: string;
  status: string;
  sent_count: number;
  failed_count: number;
  created_at: string;
  sent_at: string | null;
};

export default function AdminNotifications() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("https://moodlemootperu.com/");
  const [target, setTarget] = useState<Target>("all");
  const [sending, setSending] = useState(false);

  const [subsCount, setSubsCount] = useState<number>(0);
  const [history, setHistory] = useState<Campaign[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadCount = async () => {
    const { count } = await supabase
      .from("push_subscriptions")
      .select("id", { count: "exact", head: true })
      .is("revoked_at", null);
    setSubsCount(count ?? 0);
  };
  const loadHistory = async () => {
    setLoadingHistory(true);
    const { data } = await supabase
      .from("push_campaigns")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setHistory((data as Campaign[]) ?? []);
    setLoadingHistory(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadCount();
    loadHistory();
  }, [isAdmin]);

  const send = async (forceSelf = false) => {
    if (!title.trim() || !body.trim()) {
      toast({ title: "Faltan datos", description: "Título y mensaje son obligatorios.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-push-campaign", {
        body: {
          title: title.trim(),
          body: body.trim(),
          url: url.trim() || null,
          target: forceSelf ? "self" : target,
        },
      });
      if (error) throw error;
      toast({
        title: forceSelf ? "Prueba enviada" : "Campaña enviada",
        description: `Enviadas: ${data?.sent ?? 0} · Fallidas: ${data?.failed ?? 0}`,
      });
      await loadHistory();
      await loadCount();
    } catch (e: any) {
      toast({
        title: "No se pudo enviar",
        description: e?.message ?? "Error al enviar la campaña.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <Helmet><title>Notificaciones Push · MoodleMoot Perú</title></Helmet>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BellRing className="w-6 h-6 text-brand-orange" /> Notificaciones Push
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Redacta y envía notificaciones a los dispositivos suscritos. Solo funcionará para usuarios
          que hayan aceptado el permiso desde el sitio publicado.
        </p>
      </div>

      <Card className="p-5 flex items-center gap-4">
        <Users className="w-8 h-8 text-brand-orange" />
        <div>
          <div className="text-2xl font-bold">{subsCount}</div>
          <div className="text-sm text-muted-foreground">dispositivos suscritos activos</div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">Nueva campaña</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="t">Título (máx 50)</Label>
            <Input id="t" maxLength={50} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Agenda publicada" />
            <p className="text-xs text-muted-foreground mt-1">{title.length}/50</p>
          </div>
          <div>
            <Label htmlFor="u">URL al hacer clic</Label>
            <Input id="u" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://moodlemootperu.com/..." />
          </div>
        </div>

        <div>
          <Label htmlFor="b">Mensaje (máx 150)</Label>
          <Textarea id="b" maxLength={150} rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Ej: Ya puedes ver el cronograma completo del MoodleMoot Perú 2026." />
          <p className="text-xs text-muted-foreground mt-1">{body.length}/150</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Segmento</Label>
            <Select value={target} onValueChange={(v) => setTarget(v as Target)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los suscriptores</SelectItem>
                <SelectItem value="event">Por evento activo</SelectItem>
                <SelectItem value="self">Solo a mí (test)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Vista previa */}
        <div>
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Vista previa</Label>
          <div className="mt-2 border rounded-xl p-4 bg-muted/40 flex gap-3 max-w-md">
            <div className="w-10 h-10 rounded-md bg-brand-orange flex items-center justify-center flex-shrink-0">
              <BellRing className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">{title || "Título de la notificación"}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{body || "Mensaje breve de la notificación..."}</div>
              <div className="text-[10px] text-muted-foreground mt-1">moodlemootperu.com · ahora</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" onClick={() => send(true)} disabled={sending}>
            {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Enviar prueba (solo a mí)
          </Button>
          <Button onClick={() => send(false)} disabled={sending} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
            {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Enviar campaña
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-lg mb-3">Historial</h2>
        {loadingHistory ? (
          <div className="text-sm text-muted-foreground">Cargando historial...</div>
        ) : history.length === 0 ? (
          <div className="text-sm text-muted-foreground">Aún no se ha enviado ninguna campaña.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Enviadas</TableHead>
                <TableHead className="text-right">Fallidas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-xs">{new Date(c.created_at).toLocaleString("es-PE")}</TableCell>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell><Badge variant="outline">{c.target}</Badge></TableCell>
                  <TableCell>
                    {c.status === "sent" ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle2 className="w-3 h-3" /> enviado</span>
                    ) : c.status === "failed" ? (
                      <span className="inline-flex items-center gap-1 text-destructive text-xs"><XCircle className="w-3 h-3" /> fallida</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{c.status}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{c.sent_count}</TableCell>
                  <TableCell className="text-right">{c.failed_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

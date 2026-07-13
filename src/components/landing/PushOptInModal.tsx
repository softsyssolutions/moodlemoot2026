import { Bell, BellRing, Share, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePushSubscription } from "@/hooks/usePushSubscription";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIPad = /iPad/.test(ua) || (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1);
  return /iPhone|iPod/.test(ua) || isIPad;
}

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.matchMedia?.("(display-mode: standalone)").matches || (window.navigator as any).standalone === true);
}

export default function PushOptInModal({ open, onOpenChange }: Props) {
  const { subscribe, loading, isSupported, isPreview, permission } = usePushSubscription();
  const { toast } = useToast();
  const needsIosInstall = isIOSDevice() && !isStandaloneMode();

  const handleActivate = async () => {
    try {
      await subscribe();
      toast({
        title: "Notificaciones activadas",
        description: "Te avisaremos sobre la agenda, sorteos y novedades del evento.",
      });
      onOpenChange(false);
    } catch (e: any) {
      toast({
        title: "No se pudo activar",
        description: e?.message ?? "Inténtalo nuevamente en unos momentos.",
        variant: "destructive",
      });
    }
  };

  const blocked = permission === "denied";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-full bg-brand-orange/15 flex items-center justify-center mb-2">
            <BellRing className="w-7 h-7 text-brand-orange" />
          </div>
          <DialogTitle className="text-center text-2xl">Recibe las últimas noticias</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Te enviaremos avisos breves cuando se publique nueva agenda, se anuncien speakers, sorteos
            o cuando inicien las transmisiones del evento.
          </DialogDescription>
        </DialogHeader>

        <ul className="text-sm text-muted-foreground space-y-2 my-4">
          <li className="flex items-start gap-2">
            <Bell className="w-4 h-4 mt-0.5 text-brand-orange flex-shrink-0" />
            <span>Solo notificaciones importantes, sin spam.</span>
          </li>
          <li className="flex items-start gap-2">
            <Bell className="w-4 h-4 mt-0.5 text-brand-orange flex-shrink-0" />
            <span>Puedes desactivarlas en cualquier momento desde tu navegador.</span>
          </li>
        </ul>

        {needsIosInstall && (
          <div className="rounded-lg border border-brand-orange/30 bg-brand-orange/5 p-3 text-sm mb-3">
            <p className="font-semibold text-foreground mb-2">
              En iPhone primero instala la app
            </p>
            <ol className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-brand-orange">1.</span>
                <span className="flex items-center gap-1 flex-wrap">
                  Pulsa <Share className="inline w-3.5 h-3.5" /> <strong>Compartir</strong> en Safari.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-brand-orange">2.</span>
                <span className="flex items-center gap-1 flex-wrap">
                  Elige <Plus className="inline w-3.5 h-3.5" /> <strong>Añadir a pantalla de inicio</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-brand-orange">3.</span>
                <span>Abre la app desde el icono y vuelve aquí para activar.</span>
              </li>
            </ol>
          </div>
        )}
        {!isSupported && !needsIosInstall && (
          <p className="text-xs text-destructive text-center mb-2">
            Tu navegador no soporta notificaciones web.
          </p>
        )}
        {isPreview && (
          <p className="text-xs text-muted-foreground text-center mb-2">
            Para probar: abre esta función directamente en moodlemootperu.com.
          </p>
        )}
        {blocked && (
          <p className="text-xs text-destructive text-center mb-2">
            Las notificaciones están bloqueadas. Habilítalas en la configuración del navegador.
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleActivate}
            disabled={loading || !isSupported || isPreview || blocked || needsIosInstall}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white"
          >
            <BellRing className="w-4 h-4 mr-2" />
            {loading ? "Activando..." : "Activar notificaciones"}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {needsIosInstall ? "Entendido" : "Ahora no"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

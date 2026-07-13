import { useEffect, useState } from "react";
import { Download, X, Share, Plus, ChevronRight, MonitorDown, MousePointerClick } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function FloatingInstallPwa() {
  const { canShow, isIOS, isDesktop, canPrompt, collapsed, promptInstall, collapse, expand } =
    usePwaInstall();
  const [iosOpen, setIosOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [androidOpen, setAndroidOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 1200);
    return () => clearTimeout(t);
  }, []);

  if (!canShow || !mounted) return null;

  const handleInstall = async () => {
    // Siempre intentamos abrir primero el diálogo nativo "Instalar".
    // Si Chrome lo emitió antes de montar React, promptInstall también usa el evento capturado globalmente.
    const openedNativePrompt = await promptInstall();
    if (openedNativePrompt || canPrompt) {
      return;
    }

    // iOS Safari nunca expone el prompt nativo → instrucciones manuales.
    if (isIOS) {
      setIosOpen(true);
      return;
    }

    // En escritorio/Android no mostramos modal: si el navegador no entregó
    // beforeinstallprompt, no existe una API web que fuerce la instalación.
  };



  return (
    <>
      {/* Contenedor deslizable pegado al borde izquierdo */}
      <div
        className={`fixed left-0 bottom-6 z-40 flex items-stretch transition-transform duration-300 ease-out ${
          collapsed ? "-translate-x-[calc(100%-26px)]" : "translate-x-0"
        }`}
        aria-hidden={false}
      >
        {/* Pill principal: en colapsado actúa como handle (click = expand) */}
        <div className="relative">
          {/* Onditas rojas sutiles cuando está colapsado, para recordar al usuario */}
          {collapsed && (
            <>
              <span
                aria-hidden
                className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-red-500/40 motion-safe:animate-ping"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500/70"
              />
            </>
          )}
          <button
            type="button"
            onClick={collapsed ? expand : handleInstall}
            aria-label={collapsed ? "Mostrar botón instalar app" : "Instalar app"}
            className={`relative group flex items-center gap-2 h-11 pl-3 pr-4 rounded-r-full ${
              collapsed ? "" : "rounded-l-full"
            } bg-brand-navy text-white shadow-[0_10px_30px_-8px_hsl(var(--brand-navy)/0.6)] hover:shadow-[0_14px_36px_-8px_hsl(var(--brand-navy)/0.8)] transition-all duration-300 active:scale-95 ${
              collapsed ? "" : "motion-safe:animate-[button-nudge_6s_ease-in-out_infinite]"
            }`}
          >
            <Download className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2.25} />
            <span className="text-sm font-semibold whitespace-nowrap">
              {isDesktop && !canPrompt ? "Instalar en escritorio" : "Instalar app"}
            </span>
            {collapsed && (
              <ChevronRight className="w-3.5 h-3.5 -ml-1 opacity-90" strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Botón cerrar (colapsar) — visible solo cuando está expandido */}
        {!collapsed && (
          <button
            type="button"
            onClick={collapse}
            aria-label="Ocultar"
            className="ml-1.5 self-center flex items-center justify-center w-6 h-6 rounded-full bg-background/80 backdrop-blur text-muted-foreground hover:text-foreground hover:bg-background transition-colors shadow-sm"
          >
            <X className="w-3 h-3" strokeWidth={2.5} />
          </button>
        )}
      </div>



      {/* Instrucciones iOS */}
      <Dialog open={iosOpen} onOpenChange={setIosOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-brand-orange/15 flex items-center justify-center mb-2">
              <Download className="w-7 h-7 text-brand-orange" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Añade un acceso rápido en tu iPhone
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              No instalas nada pesado: es solo un acceso directo en tu pantalla de inicio.
              No ocupa espacio y te permite recibir las notificaciones del evento (agenda,
              speakers, sorteos y transmisiones en vivo) directamente en tu celular.
            </DialogDescription>
          </DialogHeader>

          <ol className="space-y-3 text-sm text-foreground my-4">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-orange text-white text-xs font-bold flex-shrink-0">
                1
              </span>
              <span className="flex items-center gap-2 flex-wrap">
                Toca el icono <Share className="inline w-4 h-4 text-brand-navy" />
                <strong>Compartir</strong> en la barra inferior de Safari.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-orange text-white text-xs font-bold flex-shrink-0">
                2
              </span>
              <span className="flex items-center gap-2 flex-wrap">
                Desplázate y elige <Plus className="inline w-4 h-4 text-brand-navy" />{" "}
                <strong>Añadir a pantalla de inicio</strong>.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-orange text-white text-xs font-bold flex-shrink-0">
                3
              </span>
              <span>
                Abre la app desde el icono recién creado y activa las notificaciones.
              </span>
            </li>
          </ol>

          <p className="text-xs text-muted-foreground text-center">
            Si no ves el botón Compartir, asegúrate de estar usando Safari (no Chrome ni
            otra app dentro de iOS).
          </p>
        </DialogContent>
      </Dialog>

      {/* Instrucciones escritorio (cuando el navegador no expone beforeinstallprompt) */}
      <Dialog open={desktopOpen} onOpenChange={setDesktopOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-brand-orange/15 flex items-center justify-center mb-2">
              <MonitorDown className="w-7 h-7 text-brand-orange" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Crea un acceso directo en tu escritorio
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              No es una app pesada ni ocupa espacio en tu computador: es solo un acceso
              rápido que abre MoodleMoot Perú en su propia ventana. Te sirve sobre todo
              para recibir las notificaciones del evento (agenda, speakers, sorteos y
              transmisiones en vivo) y estar al día en todo momento.
            </DialogDescription>
          </DialogHeader>

          <ol className="space-y-3 text-sm text-foreground my-4">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-orange text-white text-xs font-bold flex-shrink-0">
                1
              </span>
              <span className="flex items-center gap-2 flex-wrap">
                Busca el icono <MonitorDown className="inline w-4 h-4 text-brand-navy" />
                <strong>Instalar</strong> al final de la barra de direcciones (a la
                derecha de la URL).
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-orange text-white text-xs font-bold flex-shrink-0">
                2
              </span>
              <span className="flex items-center gap-2 flex-wrap">
                Haz clic <MousePointerClick className="inline w-4 h-4 text-brand-navy" />
                y confirma <strong>Instalar</strong> en el diálogo del navegador.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-orange text-white text-xs font-bold flex-shrink-0">
                3
              </span>
              <span>
                Si no ves el icono, abre el menú ⋮ del navegador →{" "}
                <strong>Instalar MoodleMoot Perú…</strong> o <strong>Apps → Instalar
                esta página como app</strong>.
              </span>
            </li>
          </ol>

          <p className="text-xs text-muted-foreground text-center">
            Funciona en Chrome, Edge, Brave y Opera. Safari de escritorio aún no soporta
            instalar apps web.
          </p>
        </DialogContent>
      </Dialog>

      {/* Instrucciones Android (cuando no se disparó beforeinstallprompt) */}
      <Dialog open={androidOpen} onOpenChange={setAndroidOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-brand-orange/15 flex items-center justify-center mb-2">
              <Download className="w-7 h-7 text-brand-orange" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Añade un acceso rápido en tu móvil
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              No instalas una app pesada ni ocupa espacio: es solo un acceso directo en
              tu pantalla de inicio. Lo necesitas para recibir las notificaciones del
              evento (agenda, speakers, sorteos y transmisiones) y enterarte de todo al
              instante.
            </DialogDescription>
          </DialogHeader>

          <ol className="space-y-3 text-sm text-foreground my-4">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-orange text-white text-xs font-bold flex-shrink-0">1</span>
              <span>Abre el menú ⋮ de tu navegador (Chrome, Edge, Brave o Samsung Internet).</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-orange text-white text-xs font-bold flex-shrink-0">2</span>
              <span>Elige <strong>Instalar app</strong> o <strong>Añadir a pantalla de inicio</strong>.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-orange text-white text-xs font-bold flex-shrink-0">3</span>
              <span>Confirma y abre la app desde el icono recién creado.</span>
            </li>
          </ol>

          <p className="text-xs text-muted-foreground text-center">
            Si usas Firefox o un navegador dentro de otra app (Instagram, Facebook…), abre primero esta página en Chrome.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}

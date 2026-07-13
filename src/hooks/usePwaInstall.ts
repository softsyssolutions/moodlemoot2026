import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    __mmDeferredInstallPrompt?: Event;
  }
}

const COLLAPSE_KEY = "mm-pwa-install-collapsed";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const nav = navigator as Navigator & { maxTouchPoints?: number };
  const isIPad =
    /iPad/.test(ua) ||
    (navigator.platform === "MacIntel" && (nav.maxTouchPoints ?? 0) > 1);
  return /iPhone|iPod/.test(ua) || isIPad;
}

function isDesktopDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(ua);
  const wide = window.matchMedia?.("(min-width: 1024px)").matches ?? false;
  return !isMobileUA && wide;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia?.("(display-mode: standalone)").matches;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  const iosStandalone = nav.standalone === true;
  return Boolean(mq || iosStandalone);
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

export function usePwaInstall() {
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());
  const [isIOS, setIsIOS] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [collapsed, setCollapsed] = useState<boolean>(() => readCollapsed());

  useEffect(() => {
    setIsIOS(isIOSDevice());
    setIsDesktop(isDesktopDevice());
    const initialInstalled = isStandalone();
    setInstalled(initialInstalled);

    if (window.__mmDeferredInstallPrompt) {
      setDeferred(window.__mmDeferredInstallPrompt as BIPEvent);
    }

    const onBIP = (e: Event) => {
      e.preventDefault();
      window.__mmDeferredInstallPrompt = e;
      setDeferred(e as BIPEvent);
      // Si veníamos de una recarga post-desinstalación, limpiamos la marca.
      try { sessionStorage.removeItem("mm-pwa-retry"); } catch { /* noop */ }
    };
    const onPromptReady = () => {
      if (window.__mmDeferredInstallPrompt) {
        setDeferred(window.__mmDeferredInstallPrompt as BIPEvent);
      }
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      window.__mmDeferredInstallPrompt = undefined;
    };
    const onDisplay = () => {
      const nowInstalled = isStandalone();
      setInstalled((prev) => {
        // Transición instalado -> desinstalado: recargamos UNA vez para que
        // el navegador vuelva a emitir beforeinstallprompt en esta pestaña.
        if (prev && !nowInstalled) {
          try {
            const already = sessionStorage.getItem("mm-pwa-uninstall-reload");
            if (!already) {
              sessionStorage.setItem("mm-pwa-uninstall-reload", "1");
              setTimeout(() => {
                try { window.location.reload(); } catch { /* noop */ }
              }, 50);
            }
          } catch { /* noop */ }
        }
        if (nowInstalled) {
          try { sessionStorage.removeItem("mm-pwa-uninstall-reload"); } catch { /* noop */ }
        }
        return nowInstalled;
      });
    };

    const onResize = () => setIsDesktop(isDesktopDevice());

    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("mm-beforeinstallprompt-ready", onPromptReady);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("resize", onResize);
    const mq = window.matchMedia?.("(display-mode: standalone)");
    mq?.addEventListener?.("change", onDisplay);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("mm-beforeinstallprompt-ready", onPromptReady);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("resize", onResize);
      mq?.removeEventListener?.("change", onDisplay);
    };
  }, []);


  const promptInstall = useCallback(async () => {
    const promptEvent = deferred ?? (window.__mmDeferredInstallPrompt as BIPEvent | undefined);
    if (!promptEvent) return false;
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
      }
      setDeferred(null);
      window.__mmDeferredInstallPrompt = undefined;
      return choice.outcome === "accepted";
    } catch {
      return false;
    }
  }, [deferred]);

  const collapse = useCallback(() => {
    try { localStorage.setItem(COLLAPSE_KEY, "1"); } catch { /* noop */ }
    setCollapsed(true);
  }, []);

  const expand = useCallback(() => {
    try { localStorage.removeItem(COLLAPSE_KEY); } catch { /* noop */ }
    setCollapsed(false);
  }, []);

  // Visible si NO está instalada. Si no hay prompt nativo, mostramos instrucciones.
  const canShow = !installed;

  return {
    installed,
    isIOS,
    isDesktop,
    canPrompt: Boolean(deferred),
    canShow,
    collapsed,
    promptInstall,
    collapse,
    expand,
  };
}


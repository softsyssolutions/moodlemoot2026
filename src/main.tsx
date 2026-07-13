import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

declare global {
  interface Window {
    __mmSplashReady?: Promise<void>;
    __mmSplashDuration?: number;
    __mmMetrics?: { splashStart: number; fcp?: number; lcp?: number; hydrate?: number };
    __mmDeferredInstallPrompt?: Event;
  }
}

// Captura temprana del prompt nativo de instalación.
// React se monta después del splash; sin esto Chrome puede emitir
// `beforeinstallprompt` antes de que el botón exista y el evento se pierde.
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  window.__mmDeferredInstallPrompt = event;
  window.dispatchEvent(new CustomEvent("mm-beforeinstallprompt-ready"));
});

const mount = () => {
  const t = performance.now();
  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>,
  );
  if (window.__mmMetrics) {
    window.__mmMetrics.hydrate = performance.now() - t;
    // eslint-disable-next-line no-console
    console.info("[metrics] React hydrate", Math.round(window.__mmMetrics.hydrate), "ms");
  }
};

// Defer hydration until splash finishes so the animation gets the CPU.
if (window.__mmSplashReady) {
  window.__mmSplashReady.then(mount);
} else {
  mount();
}

// === Service Worker para Web Push ===
// Solo en producción: NUNCA en iframes ni en dominios de preview de Lovable.
if ("serviceWorker" in navigator) {
  const inIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();
  const h = window.location.hostname;
  const isPreview = h.includes("lovableproject.com") || h.includes("id-preview--");

  if (inIframe || isPreview) {
    // Limpieza defensiva en preview
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    }).catch(() => {});
  } else {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .catch((err) => console.warn("[sw] registro falló:", err));
    });
  }
}

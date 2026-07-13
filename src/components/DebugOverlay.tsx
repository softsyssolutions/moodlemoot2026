import { useEffect, useRef, useState } from "react";

/**
 * DebugOverlay — panel flotante para iPhone/iPad que muestra métricas de carga
 * (FCP, LCP, splash, hidratación) y diagnostica si el scroll funciona.
 *
 * Se activa cuando:
 *  - URL contiene ?debug=1
 *  - localStorage["mm_debug"] === "1"
 *  - User-agent es iPhone/iPad (auto, sin tocar nada)
 *
 * Para apagarlo: añadir ?debug=0 o ejecutar localStorage.setItem("mm_debug","0").
 */
export default function DebugOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(true);
  const [, force] = useState(0);
  const dataRef = useRef({
    fcp: 0,
    lcp: 0,
    splash: 0,
    hydrate: 0,
    scrollY: 0,
    maxScrollY: 0,
    touches: 0,
    bodyOverflow: "",
    htmlOverflow: "",
    splashInDom: false,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const debugParam = params.get("debug");
    if (debugParam === "0") localStorage.removeItem("mm_debug");
    else if (debugParam === "1") localStorage.setItem("mm_debug", "1");
    const stored = localStorage.getItem("mm_debug") === "1";
    const on = debugParam === "1" || stored;
    setEnabled(on);
    if (!on) return;

    const tick = () => {
      const m = (window as Window & typeof globalThis).__mmMetrics ?? { splashStart: 0 };
      const d = dataRef.current;
      d.fcp = m.fcp ?? 0;
      d.lcp = m.lcp ?? 0;
      d.splash = (window as Window & typeof globalThis).__mmSplashDuration ?? 0;
      d.hydrate = m.hydrate ?? 0;
      d.scrollY = window.scrollY;
      d.maxScrollY = Math.max(d.maxScrollY, window.scrollY);
      d.bodyOverflow = getComputedStyle(document.body).overflow;
      d.htmlOverflow = getComputedStyle(document.documentElement).overflow;
      d.splashInDom = !!document.getElementById("mm-splash");
      force((n) => (n + 1) % 1000);
    };
    const onScroll = () => {
      dataRef.current.scrollY = window.scrollY;
      dataRef.current.maxScrollY = Math.max(dataRef.current.maxScrollY, window.scrollY);
    };
    const onTouch = () => {
      dataRef.current.touches += 1;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    const id = window.setInterval(tick, 500);
    tick();

    // Log inicial al activar
    console.info("[debug] modo activo", { viewport: { w: innerWidth, h: innerHeight } });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", onTouch);
      window.clearInterval(id);
    };
  }, []);

  if (!enabled) return null;
  const d = dataRef.current;
  const ms = (n: number) => (n ? `${Math.round(n)}ms` : "—");
  const scrollOK = d.maxScrollY > 4 ? "✅" : "⏳";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 8,
        left: 8,
        zIndex: 100000,
        fontFamily: "ui-monospace, SFMono-Regular, monospace",
        fontSize: 11,
        lineHeight: 1.35,
        color: "#e8f0ff",
        background: "rgba(11,22,49,.92)",
        border: "1px solid rgba(249,128,18,.5)",
        borderRadius: 8,
        padding: open ? "8px 10px" : "4px 8px",
        maxWidth: "min(86vw, 280px)",
        backdropFilter: "blur(6px)",
        pointerEvents: "auto",
      }}
      onClick={() => setOpen((v) => !v)}
      aria-label="Panel de depuración MoodleMoot"
    >
      <div style={{ fontWeight: 700, color: "#F98012" }}>
        🐛 MM Debug {open ? "▾" : "▸"}
      </div>
      {open && (
        <div style={{ marginTop: 4 }}>
          <div>FCP: {ms(d.fcp)}</div>
          <div>LCP: {ms(d.lcp)}</div>
          <div>Splash: {ms(d.splash)}</div>
          <div>Hydrate: {ms(d.hydrate)}</div>
          <div>Scroll Y: {Math.round(d.scrollY)} (max {Math.round(d.maxScrollY)}) {scrollOK}</div>
          <div>Touches: {d.touches}</div>
          <div>body.overflow: {d.bodyOverflow || "—"}</div>
          <div>html.overflow: {d.htmlOverflow || "—"}</div>
          <div>#mm-splash en DOM: {d.splashInDom ? "sí" : "no"}</div>
          <div style={{ opacity: 0.7, marginTop: 4 }}>tap para colapsar · ?debug=0 para apagar</div>
        </div>
      )}
    </div>
  );
}

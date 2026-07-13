import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const SHOW_AT = 380;
const HIDE_AT = 320;

const FloatingRegisterCta = () => {
  // CTA de registro oculto globalmente
  return null;
  // eslint-disable-next-line no-unreachable
  const [show, setShow] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const { pathname } = useLocation();
  const hidden = pathname.startsWith("/panel") || pathname.startsWith("/auth");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduceMotion(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    let ticking = false;
    let current = false;

    const update = () => {
      const y = window.scrollY;
      // Hysteresis: distinct thresholds prevent flicker near the boundary
      if (!current && y > SHOW_AT) {
        current = true;
        setShow(true);
      } else if (current && y < HIDE_AT) {
        current = false;
        setShow(false);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (hidden) return null;

  return (
    <button
      onClick={() => window.dispatchEvent(new Event("open-event-registration"))}
      aria-label="Regístrate al evento"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      style={{
        willChange: reduceMotion ? "auto" : "transform, opacity",
        transitionProperty: reduceMotion ? "opacity" : "opacity, transform",
        transitionDuration: reduceMotion ? "200ms" : "500ms",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      className={`lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 h-12 px-6 rounded-full bg-brand-orange text-white font-bold text-sm uppercase tracking-wider shadow-[0_10px_30px_-8px_rgba(249,128,18,0.6)] hover:bg-brand-orange/90 ${
        show
          ? `opacity-100 translate-x-[-50%] ${reduceMotion ? "" : "translate-y-0"}`
          : `opacity-0 translate-x-[-50%] ${reduceMotion ? "" : "translate-y-4"} pointer-events-none`
      }`}
    >
      Regístrate →
    </button>
  );
};

export default FloatingRegisterCta;

import { useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";

const VISIBLE_MS = 8000;
const HIDDEN_MS = 20000;

const FloatingControls = () => {
  const [armed, setArmed] = useState(false);
  const [show, setShow] = useState(false);
  const hoverRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let current = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (!current && y > 380) {
        current = true;
        setArmed(true);
      } else if (current && y < 320) {
        current = false;
        setArmed(false);
        setShow(false);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!armed) return;
    let cancelled = false;
    const cycle = (visible: boolean) => {
      if (cancelled) return;
      // when hovered, keep visible
      if (!visible && hoverRef.current) {
        timerRef.current = setTimeout(() => cycle(false), 1000);
        return;
      }
      setShow(visible);
      timerRef.current = setTimeout(
        () => cycle(!visible),
        visible ? VISIBLE_MS : HIDDEN_MS
      );
    };
    cycle(true);
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [armed]);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      onMouseEnter={() => {
        hoverRef.current = true;
        setShow(true);
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
      }}
      className={`fixed bottom-40 right-6 z-40 w-10 h-10 rounded-full bg-background/70 backdrop-blur-md border border-foreground/15 text-foreground/70 shadow-md flex items-center justify-center hover:text-foreground hover:border-foreground/30 hover:bg-background/90 transition-all duration-500 ease-out ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="Subir"
      title="Subir"
    >
      <ChevronUp className="w-4 h-4" strokeWidth={1.75} />
    </button>
  );
};

export default FloatingControls;

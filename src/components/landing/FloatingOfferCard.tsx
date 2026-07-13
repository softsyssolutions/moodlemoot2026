import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { X, ArrowUpRight, Clock } from "lucide-react";
import { useOfferCountdown } from "@/hooks/useOfferCountdown";
import { usePricingStage } from "@/hooks/usePricingStage";

const STORAGE_KEY = "mmpe26.offerCardDismissed";
const VISIBLE_MS = 14000;
const HIDDEN_MS = 10000;

const wasDismissedThisSession = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const markDismissedThisSession = () => {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore
  }
};

const FloatingOfferCard = () => {
  const { pathname } = useLocation();
  const { daysLeft, expired } = useOfferCountdown();
  const { current, savings } = usePricingStage();
  const [show, setShow] = useState(false);
  const [armed, setArmed] = useState(false);
  const dismissedRef = useRef(wasDismissedThisSession());

  const hidden =
    expired ||
    current.discount === 0 ||
    pathname.startsWith("/panel") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/ticket") ||
    pathname.startsWith("/admin");

  // arming: only start the cycle after 8s OR scroll > 600
  useEffect(() => {
    if (hidden) return;
    if (dismissedRef.current) return;
    if (wasDismissedThisSession()) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const arm = () => {
      if (dismissedRef.current) return;
      if (wasDismissedThisSession()) return;
      setArmed(true);
    };

    timeoutId = setTimeout(arm, 8000);
    const onScroll = () => {
      if (window.scrollY > 600) arm();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("scroll", onScroll);
    };
  }, [hidden]);

  // appear/disappear cycle
  useEffect(() => {
    if (!armed || hidden) return;
    if (dismissedRef.current) return;
    if (wasDismissedThisSession()) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const cycle = (visible: boolean) => {
      if (cancelled) return;
      if (dismissedRef.current) return;
      if (wasDismissedThisSession()) return;
      setShow(visible);
      timer = setTimeout(() => cycle(!visible), visible ? VISIBLE_MS : HIDDEN_MS);
    };
    cycle(true);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [armed, hidden]);

  if (hidden) return null;

  const dismiss = () => {
    dismissedRef.current = true;
    markDismissedThisSession();
    setShow(false);
    setArmed(false);
  };

  const openModal = () => {
    window.dispatchEvent(new Event("open-ticket-purchase"));
  };

  return (
    <div
      className={`hidden lg:block fixed bottom-28 right-6 z-40 w-[340px] transition-all duration-500 ease-out ${
        show
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 translate-y-6 scale-95 pointer-events-none"
      }`}
      role="complementary"
      aria-label="Oferta early bird"
      aria-hidden={!show}
    >
      {/* outer glow halo to make it pop */}
      <div className="pointer-events-none absolute -inset-3 rounded-3xl bg-brand-orange/40 blur-2xl animate-pulse [animation-duration:2.5s]" />

      <div className="relative rounded-2xl bg-gradient-to-br from-brand-orange via-brand-orange to-[#d96a00] text-white p-6 shadow-[0_30px_80px_-10px_rgba(249,128,18,0.85)] ring-2 ring-white/30">
        {/* shimmer accent */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />

        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/25 hover:bg-black/40 flex items-center justify-center transition-colors backdrop-blur-sm"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-brand-orange text-[11px] font-extrabold uppercase tracking-[0.18em] shadow-md">
          <Clock className="w-3.5 h-3.5" />
          {current.discount}% OFF · {current.labelEs}
        </div>

        <div className="mt-4 font-display font-extrabold text-4xl leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
          Quedan {daysLeft} {daysLeft === 1 ? "día" : "días"}
        </div>
        <div className="mt-2 text-[15px] text-white/95 font-medium">
          Ahorra <span className="font-bold">USD {savings}</span> hoy · paga <span className="font-bold">USD {current.price}</span>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-white text-brand-orange font-extrabold text-base hover:gap-3 transition-all shadow-[0_10px_24px_-6px_rgba(0,0,0,0.3)]"
        >
          Aprovechar oferta
          <ArrowUpRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FloatingOfferCard;

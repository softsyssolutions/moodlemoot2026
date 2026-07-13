import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Bell, BellRing, Download, Mic, Sparkles, Ticket } from "lucide-react";
import { EVENT } from "@/data/event";
import { useTranslation } from "@/i18n/LanguageContext";
import logoDark from "@/assets/brand/moodlemoot-logo-negativo.png";
import logoLight from "@/assets/brand/moodlemoot-logo.png";
import logoUmchDark from "@/assets/brand/logo-umch-white.png";
import logoUmchLight from "@/assets/brand/logo-umch.png";
import logoIndustriaeDark from "@/assets/brand/logo-industriae-white.png";
import logoIndustriaeLight from "@/assets/brand/logo-industriae.png";
import FloatingShapes from "./FloatingShapes";
import NeuralCanvas from "./NeuralCanvas";
import PushOptInModal from "./PushOptInModal";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import brochureAsset from "@/assets/brochure.pdf.asset.json";
import { useOfferCountdown, BASE_PRICE, OFFER_PRICE, OFFER_SAVINGS, OFFER_DISCOUNT } from "@/hooks/useOfferCountdown";

// Feature flags — poner en true para reactivar el CTA correspondiente
const SHOW_REGISTER_CTA = false;

const pad = (n: number) => String(n).padStart(2, "0");

const Hero = () => {
  const { locale } = useTranslation();
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [pushOpen, setPushOpen] = useState(false);
  const { isSubscribed, permission } = usePushSubscription();
  const { daysLeft, expired: offerExpired } = useOfferCountdown();

  useEffect(() => {
    setMounted(true);
    const target = new Date(EVENT.startDate).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return setT({ d: 0, h: 0, m: 0, s: 0 });
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    const onOpenPush = () => setPushOpen(true);
    window.addEventListener("open-push-optin", onOpenPush);
    return () => {
      clearInterval(id);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("open-push-optin", onOpenPush);
    };
  }, []);

  // parallax factors
  const py1 = scrollY * 0.18;
  const py2 = scrollY * 0.32;

  return (
    <section
      id="inicio"
      className="relative w-full flex flex-col bg-gradient-to-br from-[#f4f4f4] via-[#e6e6e6] to-[#d4d4d4] text-[hsl(var(--brand-dark))] dark:bg-brand-ink dark:bg-none dark:text-white overflow-hidden pt-16 md:pt-20 min-h-screen lg:min-h-screen pb-2"
    >
      {/* Background video — YouTube embed contained to hero */}
      <div
        aria-hidden
        className="absolute inset-0 w-full h-full overflow-hidden opacity-15 mix-blend-multiply dark:opacity-40 dark:mix-blend-normal pointer-events-none"
        style={{ transform: `translate3d(0, ${py2}px, 0) scale(1.05)` }}
      >
        <iframe
          src="https://www.youtube.com/embed/uFG8--B69uU?autoplay=1&mute=1&loop=1&playlist=uFG8--B69uU&controls=0&showinfo=0&modestbranding=1&playsinline=1&rel=0&disablekb=1&iv_load_policy=3"
          title="Hero background"
          allow="autoplay; encrypted-media"
          frameBorder={0}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] h-[56.25vw] min-w-full min-h-full"
        />
      </div>
      {/* Overlay — light */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/30 to-white/70 dark:hidden" />
      {/* Overlay — dark */}
      <div className="absolute inset-0 hidden dark:block bg-gradient-to-b from-brand-ink/85 via-brand-ink/65 to-brand-ink/95" />
      {/* Radial vignette */}
      <div className="absolute inset-0 [background:radial-gradient(120%_80%_at_50%_30%,transparent_0%,hsl(0_0%_85%/0.6)_85%)] dark:[background:radial-gradient(120%_80%_at_50%_30%,transparent_0%,hsl(var(--brand-ink)/0.7)_85%)]" />

      {/* Tech grid lines */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18] dark:opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--brand-dark) / 0.7) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand-dark) / 0.7) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 35%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 35%, transparent 80%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 hidden dark:block opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--brand-orange) / 0.6) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--brand-orange) / 0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 35%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 35%, transparent 80%)",
        }}
      />

      {/* Neural network particle layer (más sutil en claro) */}
      <NeuralCanvas className="opacity-30 dark:opacity-90 mix-blend-multiply dark:mix-blend-normal" />

      {/* Decorative brand shapes */}
      <FloatingShapes
        items={[
          { shape: "semicircles", className: "top-24 -left-10 w-44 md:w-64 dark:invert", opacity: 0.14, anim: "floaty" },
          { shape: "quarter", className: "bottom-10 left-8 w-24 md:w-36", opacity: 0.7, anim: "floaty-rev" },
          { shape: "hex", className: "top-1/3 right-10 w-28 md:w-40 dark:invert", opacity: 0.16, anim: "floaty-rev" },
        ]}
      />

      {/* Logo MoodleMoot protagónico + organizadores debajo */}
      <div className="relative z-10 container mx-auto px-6 sm:px-8 lg:px-12 pt-2 md:pt-4 lg:pt-6 flex flex-col items-center gap-3 md:gap-4">
        <picture
          className={`block transition-all duration-1000 ease-out ${
            mounted ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-4 blur-sm"
          }`}
          style={{ filter: "drop-shadow(0 0 32px hsl(var(--brand-orange) / 0.55))" }}
        >
          <img
            src={logoLight}
            alt="MoodleMoot Perú 2026"
            className="h-14 sm:h-20 md:h-24 lg:h-28 w-auto block dark:hidden"
          />
          <img
            src={logoDark}
            alt="MoodleMoot Perú 2026"
            className="h-14 sm:h-20 md:h-24 lg:h-28 w-auto hidden dark:block"
          />
        </picture>
        <div className="flex items-center justify-center flex-wrap gap-8 sm:gap-14 md:gap-20 lg:gap-24">
          <div
            className={`transition-all duration-1000 delay-300 ease-out ${
              mounted ? "opacity-95 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <img
              src={logoUmchLight}
              alt="Universidad Marcelino Champagnat"
              className="h-10 sm:h-14 md:h-20 lg:h-24 w-auto object-contain block dark:hidden"
            />
            <img
              src={logoUmchDark}
              alt="Universidad Marcelino Champagnat"
              className="h-10 sm:h-14 md:h-20 lg:h-24 w-auto object-contain hidden dark:block"
            />
          </div>
          <div
            className={`transition-all duration-1000 delay-500 ease-out ${
              mounted ? "opacity-95 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <img
              src={logoIndustriaeLight}
              alt="Industriae"
              className="h-8 sm:h-10 md:h-14 lg:h-16 w-auto object-contain block dark:hidden"
            />
            <img
              src={logoIndustriaeDark}
              alt="Industriae"
              className="h-8 sm:h-10 md:h-14 lg:h-16 w-auto object-contain hidden dark:block"
            />
          </div>
        </div>
      </div>

      <div
        className="relative z-10 flex-1 container mx-auto px-6 sm:px-8 lg:px-12 pt-4 md:pt-6 lg:pt-8 pb-4 grid lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 items-start"
        style={{ transform: `translate3d(0, ${-py1}px, 0)` }}
      >
        <div className="lg:col-span-7">

          <div
            className={`text-sm sm:text-base uppercase tracking-[0.3em] text-brand-orange mb-5 flex items-center gap-3 font-bold transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <span className="w-8 h-px bg-brand-orange" />
            <span>{locale === "es" ? "CUARTA EDICIÓN · 2026" : "FOURTH EDITION · 2026"}</span>
          </div>

          <h1
            className={`text-display text-[clamp(1.85rem,4.6vw,3.75rem)] leading-[1.05] text-[hsl(var(--brand-dark))] dark:text-white transition-all duration-1000 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {locale === "es" ? (
              <>
                <span className="block">Retos y oportunidades</span>
                <span className="block">en la educación</span>
                <span className="block text-brand-orange [text-shadow:0_0_42px_hsl(var(--brand-orange)/0.45)]">
                  exponencial.
                </span>
              </>
            ) : (
              <>
                <span className="block">Challenges and opportunities</span>
                <span className="block">in exponential</span>
                <span className="block text-brand-orange [text-shadow:0_0_42px_hsl(var(--brand-orange)/0.45)]">
                  education.
                </span>
              </>
            )}
          </h1>

          <p
            className={`mt-4 max-w-2xl text-lg md:text-xl text-[hsl(var(--brand-dark))]/80 dark:text-white/85 leading-relaxed transition-all duration-1000 delay-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {EVENT.tagline[locale]}
          </p>

          <div
            className={`mt-8 flex flex-col gap-4 transition-all duration-1000 delay-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {/* Live status pill — outside the buttons */}
            <div className="inline-flex items-center gap-2.5 self-start text-sm uppercase tracking-[0.25em] text-[hsl(var(--brand-dark))]/85 dark:text-white/85 font-semibold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-80 animate-ping" />
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60 animate-ping [animation-delay:0.4s]" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_14px_3px_rgba(239,68,68,0.85)]" />
              </span>
              <span>{locale === "es" ? "Inscripciones abiertas" : "Registration open"}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {SHOW_REGISTER_CTA && (
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event("open-event-registration"))}
                  className="group relative inline-flex items-center gap-3 bg-brand-orange text-white px-7 h-12 shape-brand-sm font-bold tracking-wide hover:gap-4 transition-all overflow-hidden shadow-[0_10px_40px_-10px_hsl(var(--brand-orange)/0.7)]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Sparkles className="w-4 h-4 relative" />
                  <span className="relative">{locale === "es" ? "Regístrate al evento" : "Register for the event"}</span>
                  <ArrowUpRight className="w-5 h-5 transition-transform group-hover:rotate-45 relative" />
                </button>
              )}
              <div className="flex flex-col items-start gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new Event("open-ticket-purchase"))}
                    className="group relative inline-flex items-center gap-3 bg-brand-orange text-white pl-5 pr-3 h-14 shape-brand-sm font-bold tracking-wide hover:gap-4 transition-all overflow-hidden shadow-[0_10px_40px_-10px_hsl(var(--brand-orange)/0.7)]"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <Ticket className="w-4 h-4 relative" />
                    <span className="relative">{locale === "es" ? "Asegura tu entrada" : "Get your ticket"}</span>
                    {!offerExpired && (
                      <span className="relative flex flex-col items-end leading-tight">
                        <span className="line-through decoration-2 text-white/75 text-[11px] font-semibold">USD {BASE_PRICE.toFixed(2)}</span>
                        <span className="text-white text-base font-extrabold">USD {OFFER_PRICE.toFixed(2)}</span>
                      </span>
                    )}
                    {!offerExpired && (
                      <span className="relative inline-flex items-center justify-center h-7 px-2.5 rounded-full bg-white text-brand-orange text-[11px] font-extrabold tracking-tight shadow-md">
                        -{OFFER_DISCOUNT}%
                      </span>
                    )}
                    <ArrowUpRight className="w-5 h-5 transition-transform group-hover:rotate-45 relative" />
                  </button>
                </div>
                {!offerExpired && (
                  <span className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-orange">
                    {locale === "es"
                      ? `🔥 Ahorras USD ${OFFER_SAVINGS.toFixed(2)} · termina el 15 de julio · quedan ${daysLeft} ${daysLeft === 1 ? "día" : "días"}`
                      : `🔥 Save USD ${OFFER_SAVINGS.toFixed(2)} · ends July 15 · ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`}
                  </span>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Right: ficha técnica — con logos universitarios encima */}
        <div
          className={`lg:col-span-5 lg:pl-10 xl:pl-12 lg:border-l lg:border-[hsl(var(--brand-dark))]/15 dark:lg:border-white/15 transition-all duration-1000 delay-500 ${
            mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
          }`}
        >

          <div className="space-y-4 rounded-2xl lg:bg-transparent">
            <Field label={locale === "es" ? "Fecha" : "Dates"} value={EVENT.dateLabel[locale]} />
            <Field label={locale === "es" ? "Lugar" : "Where"} value={EVENT.venue[locale]} sub={EVENT.city} />
            <div className="grid grid-cols-2 gap-4">
              <Field label={locale === "es" ? "Formato" : "Format"} value={EVENT.format[locale]} />
              <Field
                label={locale === "es" ? "Hashtag" : "Hashtag"}
                value={EVENT.hashtag}
              />
            </div>
          </div>


          {/* Countdown */}
          <div className="mt-6 pt-4 border-t border-[hsl(var(--brand-dark))]/15 dark:border-white/15">
            <div className="text-base uppercase tracking-[0.25em] text-[hsl(var(--brand-dark))]/60 dark:text-white/60 mb-3">
              {locale === "es" ? "Cuenta regresiva" : "Countdown"}
            </div>
            <div className="grid grid-cols-4 gap-2 font-display font-bold text-4xl sm:text-5xl tabular-nums">
              {[
                { v: t.d, l: locale === "es" ? "días" : "days" },
                { v: t.h, l: "hrs" },
                { v: t.m, l: "min" },
                { v: t.s, l: "seg" },
              ].map((b, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-brand-orange leading-none [text-shadow:0_0_28px_hsl(var(--brand-orange)/0.55)]">
                    {pad(b.v)}
                  </span>
                  <span className="font-normal text-base uppercase tracking-widest text-[hsl(var(--brand-dark))]/70 dark:text-white/70 mt-1.5">{b.l}</span>
                </div>
              ))}
            </div>

            {/* Botón: recibir notificaciones */}
            <button
              type="button"
              onClick={() => setPushOpen(true)}
              className="mt-5 group inline-flex items-center gap-2.5 px-5 h-11 shape-brand-sm border border-brand-orange/40 bg-white/40 dark:bg-white/5 backdrop-blur-sm text-[hsl(var(--brand-dark))] dark:text-white hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-all motion-safe:animate-button-nudge motion-safe:hover:[animation-play-state:paused]"
            >
              {isSubscribed && permission === "granted" ? (
                <>
                  <BellRing className="w-4 h-4 text-brand-orange group-hover:text-white" />
                  <span className="font-semibold text-sm">{locale === "es" ? "Notificaciones activas" : "Notifications on"}</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-80 animate-ping" />
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60 animate-ping [animation-delay:0.4s]" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_14px_3px_rgba(239,68,68,0.85)]" />
                  </span>
                  <Bell className="w-4 h-4 text-brand-orange group-hover:text-white" />
                  <span className="font-semibold text-sm">{locale === "es" ? "Recibir últimas noticias" : "Get the latest news"}</span>
                </>
              )}
            </button>

          </div>

        </div>
      </div>

      <PushOptInModal open={pushOpen} onOpenChange={setPushOpen} />
    </section>
  );
};

const Field = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div>
    <div className="text-sm uppercase tracking-[0.25em] text-[hsl(var(--brand-dark))]/70 dark:text-white/70 mb-1.5">{label}</div>
    <div className="font-display font-bold text-lg md:text-xl leading-snug text-[hsl(var(--brand-dark))] dark:text-white">{value}</div>
    {sub && <div className="text-lg md:text-xl text-[hsl(var(--brand-dark))]/80 dark:text-white/80 mt-1.5">{sub}</div>}
  </div>
);

export default Hero;

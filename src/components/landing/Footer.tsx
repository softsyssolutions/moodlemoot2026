import { useEffect, useState } from "react";
import { ArrowUpRight, Bell, Mail, Hash, Ticket, Mic } from "lucide-react";
import { EVENT } from "@/data/event";

import { useTranslation } from "@/i18n/LanguageContext";
import logo from "@/assets/brand/moodlemoot-logo.png";

// Feature flag — poner en true para reactivar el CTA "Inscríbete"
const SHOW_REGISTER_CTA = false;

const Footer = () => {
  const { locale } = useTranslation();
  const tag = EVENT.hashtag.replace(/^#/, "");

  const [showMobileBell, setShowMobileBell] = useState(false);
  useEffect(() => {
    let current = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (!current && y > 380) { current = true; setShowMobileBell(true); }
      else if (current && y < 320) { current = false; setShowMobileBell(false); }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openPush = () => window.dispatchEvent(new Event("open-push-optin"));
  const bellLabel = locale === "es" ? "Recibir notificaciones" : "Get notifications";

  return (
    <>
      {/* Hashtag flotante + campanita (desktop) */}
      <div className="hidden md:flex fixed left-4 bottom-24 z-30 items-center gap-2">
        <a
          href={`https://twitter.com/search?q=${encodeURIComponent(EVENT.hashtag)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${locale === "es" ? "Comparte con" : "Share with"} ${EVENT.hashtag}`}
          className="group flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/90 backdrop-blur-md border border-secondary-foreground/15 text-secondary-foreground shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
        >
          <Hash className="w-3.5 h-3.5 text-primary group-hover:text-primary-foreground transition-colors" />
          <span className="font-mono text-sm tracking-wider">{tag}</span>
        </a>
        <button
          type="button"
          onClick={openPush}
          aria-label={bellLabel}
          title={bellLabel}
          className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-brand-orange text-white shadow-[0_8px_24px_-6px_hsl(var(--brand-orange)/0.8)] hover:scale-110 active:scale-95 transition-transform"
        >
          <Bell className="w-4 h-4 motion-safe:animate-[bell-wiggle_3.5s_ease-in-out_infinite] origin-top" />
        </button>
      </div>

      {/* Campanita flotante (mobile) — aparece al hacer scroll, encima del chatbot */}
      <button
        type="button"
        onClick={openPush}
        aria-label={bellLabel}
        title={bellLabel}
        aria-hidden={!showMobileBell}
        tabIndex={showMobileBell ? 0 : -1}
        className={`md:hidden fixed right-6 bottom-24 z-40 inline-flex items-center justify-center h-11 w-11 rounded-full bg-brand-orange text-white shadow-[0_10px_28px_-8px_hsl(var(--brand-orange)/0.8)] transition-all duration-500 ease-out ${
          showMobileBell
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <Bell className="w-5 h-5 motion-safe:animate-[bell-wiggle_3.5s_ease-in-out_infinite] origin-top" />
      </button>

      <footer className="bg-secondary text-secondary-foreground pt-20 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-sm opacity-15 pointer-events-none" />
        {/* Glows naranja decorativos */}
        <div className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          {/* Banda de compra de entrada */}
          <div className="mb-12 rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.6)]">
            <div className="text-center md:text-left">
              <div className="text-xs uppercase tracking-[0.25em] text-primary-foreground/85 font-mono">
                {locale === "es" ? "Entradas abiertas" : "Tickets open"}
              </div>
              <div className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mt-1">
                {locale === "es" ? "Asegura tu lugar ahora" : "Secure your spot now"}
              </div>
              <div className="text-primary-foreground/85 text-sm mt-1">
                {EVENT.dateLabel[locale]} · {EVENT.city}
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-ticket-purchase"))}
              className="group inline-flex items-center justify-center gap-2.5 bg-white text-brand-ink h-14 px-8 rounded-full font-bold text-base hover:gap-3.5 transition-all duration-300 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.4)] min-w-[280px]"
            >
              <Ticket className="w-5 h-5 text-primary" />
              <span>{locale === "es" ? "Comprar entrada — USD 157" : "Buy ticket — USD 157"}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>



          <div className="grid md:grid-cols-12 gap-10 mb-12">
            <div className="md:col-span-5">
              <img src={logo} alt={`${EVENT.name} ${EVENT.edition}`} className="h-12 w-auto mb-4 brightness-0 invert" />
              <p className="text-lg text-secondary-foreground/70 max-w-sm leading-relaxed">{EVENT.tagline[locale]}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-base font-mono text-secondary-foreground/70">
                <Hash className="w-3 h-3 text-primary" />
                <span className="tracking-wider">{tag}</span>
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="font-mono text-xs uppercase tracking-[0.25em] text-secondary-foreground/50 mb-3">
                {locale === "es" ? "Navegación" : "Navigation"}
              </div>
              <ul className="space-y-2 text-base">
                {[
                  ["#agenda", locale === "es" ? "Agenda" : "Agenda"],
                  ["#ponentes", locale === "es" ? "Ponentes" : "Speakers"],
                  ["#sponsors", "Sponsors"],
                  ["#beneficios", locale === "es" ? "Beneficios" : "Benefits"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <a href={href} className="hover:text-primary transition-colors underline-grow">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-4">
              <div className="font-mono text-xs uppercase tracking-[0.25em] text-secondary-foreground/50 mb-3">
                {locale === "es" ? "Contacto" : "Contact"}
              </div>
              <ul className="space-y-2 text-base">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" /> info@moodlemootperu.com
                </li>
                <li>
                  <a
                    href="https://moodle.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary inline-flex items-center gap-1"
                  >
                    moodle.org <ArrowUpRight className="w-3 h-3" />
                  </a>
                </li>
              </ul>
              {SHOW_REGISTER_CTA && (
                <a
                  href={EVENT.registerUrl}
                  className="group mt-6 inline-flex items-center gap-2.5 bg-primary text-primary-foreground px-5 h-11 rounded-sm text-sm font-medium hover:gap-3.5 transition-all duration-300 shadow-[0_12px_32px_-12px_hsl(var(--primary)/0.6)]"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  {locale === "es" ? "Inscríbete" : "Register"}
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )}
            </div>
          </div>

          <div className="border-t border-secondary-foreground/15 pt-6 flex flex-col md:flex-row justify-between gap-3 text-sm font-mono text-secondary-foreground/60">
            <div>
              © 2026 {EVENT.name}.{" "}
              {locale === "es" ? "Todos los derechos reservados." : "All rights reserved."}
            </div>
            <div>
              {EVENT.dateLabel[locale]} · {EVENT.city}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;

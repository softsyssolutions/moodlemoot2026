import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Sun,
  Moon,
  Download,
  Home,
  Calendar,
  Users,
  Star,
  Sparkles,
  MapPin,
  Newspaper,
  Globe,
  Ticket,
  Mic,
} from "lucide-react";
import brochureAsset from "@/assets/brochure.pdf.asset.json";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useTranslation } from "@/i18n/LanguageContext";
import { useTheme } from "@/hooks/useTheme";
import { EVENT } from "@/data/event";
import logoDark from "@/assets/brand/moodlemoot-logo-negativo.png";
import logoLight from "@/assets/brand/moodlemoot-logo.png";

// Feature flags — pon en true para reactivar el botón con su enlace original
const SHOW_BROCHURE = false;
const SHOW_REGISTER_CTA = false;

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { t, locale, setLocale } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Main bar (desktop): minimal
  const mainLinks = [
    { label: t.nav.inicio, href: "#inicio", icon: Home, type: "anchor" as const },
    { label: t.nav.programa, href: "#agenda", icon: Calendar, type: "anchor" as const },
    { label: "Speakers", href: "#ponentes", icon: Users, type: "anchor" as const },
    { label: t.nav.sponsors, href: "#sponsors", icon: Star, type: "anchor" as const },
    { label: t.nav.noticias, href: "/blog", icon: Newspaper, type: "route" as const },
  ];


  // Sidebar links (full set)
  const sidebarLinks = [
    { label: t.nav.inicio, href: "#inicio", icon: Home, type: "anchor" as const },
    { label: t.nav.programa, href: "#agenda", icon: Calendar, type: "anchor" as const },
    { label: t.nav.ponentes, href: "#ponentes", icon: Users, type: "anchor" as const },
    { label: t.nav.sponsors, href: "#sponsors", icon: Star, type: "anchor" as const },
    { label: t.nav.beneficios, href: "#beneficios", icon: Sparkles, type: "anchor" as const },
    { label: t.nav.lugar, href: "#lugar", icon: MapPin, type: "anchor" as const },
    { label: t.nav.noticias, href: "/blog", icon: Newspaper, type: "route" as const },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mismo comportamiento en todas las rutas: transparente arriba, cápsula al hacer scroll.
  // Las páginas no-home deben proveer un fondo oscuro detrás del navbar (ver Blog/BlogPost).
  const compact = scrolled;

  const goAnchor = (href: string) => {
    setSheetOpen(false);
    if (!isHome) {
      navigate("/");
      // wait for landing to mount, then scroll
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goRoute = (href: string) => {
    setSheetOpen(false);
    navigate(href);
  };

  return (
    <nav
      className="fixed inset-x-0 z-50 transition-all duration-500"
      style={{ top: compact ? "0.75rem" : "1.25rem" }}
    >
      <div className="container mx-auto px-4">
        <div
          className={`flex items-center justify-between h-14 md:h-16 px-4 md:px-5 transition-all duration-500 ${
            compact
              ? "rounded-full border border-white/15 bg-brand-ink/55 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
              : "rounded-none border border-transparent bg-transparent shadow-none"
          }`}
        >
          <button
            onClick={() => (isHome ? goAnchor("#inicio") : goRoute("/"))}
            className="flex items-center gap-3 group"
          >
            <img
              src={compact ? logoDark : theme === "dark" ? logoDark : logoLight}
              alt={`${EVENT.name} ${EVENT.edition}`}
              className={`w-auto transition-all duration-500 ${
                compact ? "h-8 md:h-9" : "h-12 md:h-16"
              }`}
            />
          </button>

          <div className="hidden md:flex items-center gap-7">
            {mainLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => (l.type === "anchor" ? goAnchor(l.href) : goRoute(l.href))}
                className={`text-xs uppercase tracking-[0.18em] font-medium hover:text-brand-orange underline-grow transition-colors ${
                  compact ? "text-white" : "text-[hsl(var(--brand-dark))] dark:text-white"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>


          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Brochure — siempre visible */}
            <a
              href={brochureAsset.url}
              target="_blank"
              rel="noreferrer"
              download
              aria-label="Brochure"
              className={`inline-flex items-center gap-1.5 h-9 md:h-10 px-2 md:px-3 shape-brand-sm border hover:text-brand-orange hover:border-brand-orange transition-all text-xs uppercase tracking-wider font-bold ${
                compact
                  ? "border-white/70 text-white"
                  : "border-[hsl(var(--brand-dark))]/60 text-[hsl(var(--brand-dark))] dark:border-white/70 dark:text-white"
              }`}
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Brochure</span>
            </a>

            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? t.nav.lightMode : t.nav.darkMode}
              className={`grid place-items-center w-9 h-9 md:w-10 md:h-10 shape-brand-sm border hover:text-brand-orange hover:border-brand-orange transition-all ${
                compact
                  ? "border-white/70 text-white"
                  : "border-[hsl(var(--brand-dark))]/60 text-[hsl(var(--brand-dark))] dark:border-white/70 dark:text-white"
              }`}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setLocale(locale === "es" ? "en" : "es")}
              aria-label="Language"
              className={`grid place-items-center w-9 h-9 md:w-10 md:h-10 shape-brand-sm border hover:text-brand-orange hover:border-brand-orange transition-all text-xs uppercase tracking-wider font-bold ${
                compact
                  ? "border-white/70 text-white"
                  : "border-[hsl(var(--brand-dark))]/60 text-[hsl(var(--brand-dark))] dark:border-white/70 dark:text-white"
              }`}
            >
              {locale === "es" ? "EN" : "ES"}
            </button>

            <button
              onClick={() => window.dispatchEvent(new Event("open-ticket-purchase"))}
              className="hidden md:inline-flex items-center gap-2 h-9 md:h-10 px-3 md:px-4 shape-brand-sm bg-brand-orange text-white hover:bg-brand-orange/90 transition-all text-xs uppercase tracking-wider font-bold whitespace-nowrap shadow-[0_10px_30px_-10px_hsl(var(--brand-orange)/0.7)]"
            >
              <Ticket className="w-4 h-4" />
              <span>{locale === "es" ? "Tu entrada" : "Get ticket"}</span>
              <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-full bg-white text-brand-orange text-[10px] font-extrabold tracking-tight">
                −70%
              </span>
            </button>

            {/* Sidebar trigger — siempre visible */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <button
                  aria-label={t.nav.menu}
                  className={`grid place-items-center w-10 h-10 shape-brand-sm border hover:text-brand-orange hover:border-brand-orange transition-all ${
                    compact
                      ? "border-white/70 text-white"
                      : "border-[hsl(var(--brand-dark))]/60 text-[hsl(var(--brand-dark))] dark:border-white/70 dark:text-white"
                  }`}
                >
                  <Menu className="w-4 h-4" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[88vw] sm:w-96 bg-brand-ink text-white border-l border-white/10 p-0 flex flex-col"
              >
                <SheetHeader className="p-6 border-b border-white/10">
                  <SheetTitle className="text-white text-left text-sm font-mono uppercase tracking-[0.3em]">
                    {t.nav.menu}
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-4">
                  <ul className="space-y-1">
                    {sidebarLinks.map((l) => (
                      <li key={l.href}>
                        <button
                          onClick={() =>
                            l.type === "anchor" ? goAnchor(l.href) : goRoute(l.href)
                          }
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-white/85 hover:text-brand-orange hover:bg-white/5 transition-colors group"
                        >
                          <l.icon className="w-4 h-4 text-brand-orange/80 group-hover:text-brand-orange transition-colors" />
                          <span className="text-sm tracking-wide">{l.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 border-t border-white/10 space-y-2">
                  <SheetClose asChild>
                    <a
                      href={brochureAsset.url}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="w-full inline-flex items-center justify-center gap-2 h-10 shape-brand-sm border border-white/30 text-white hover:border-brand-orange hover:text-brand-orange transition-all text-sm font-bold tracking-wide"
                    >
                      <Download className="w-4 h-4" />
                      {locale === "es" ? "Descargar Brochure" : "Download Brochure"}
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <button
                      onClick={() => window.dispatchEvent(new Event("open-speaker-proposal"))}
                      className="w-full inline-flex items-center justify-center gap-2 h-10 shape-brand-sm border border-white/30 text-white hover:border-brand-orange hover:text-brand-orange transition-all text-sm font-bold tracking-wide"
                    >
                      <Mic className="w-4 h-4" />
                      {locale === "es" ? "Postúlate como Speaker" : "Apply as Speaker"}
                    </button>
                  </SheetClose>
                  <SheetClose asChild>
                    <button
                      onClick={() => window.dispatchEvent(new Event("open-sponsor-proposal"))}
                      className="w-full inline-flex items-center justify-center gap-2 h-10 shape-brand-sm border border-white/30 text-white hover:border-brand-orange hover:text-brand-orange transition-all text-sm font-bold tracking-wide"
                    >
                      <Star className="w-4 h-4" />
                      {locale === "es" ? "Quiero ser sponsor" : "Become a sponsor"}
                    </button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      onClick={() => window.dispatchEvent(new Event("open-ticket-purchase"))}
                      className="w-full shape-brand-sm bg-brand-orange hover:bg-brand-orange/90 text-white font-bold tracking-wide"
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      {locale === "es" ? "Compra tu entrada" : "Get your ticket"}
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

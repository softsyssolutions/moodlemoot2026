import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ExternalLink, Mic } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { useTheme } from "@/hooks/useTheme";
import speakerCard from "@/assets/speaker-card-template.png";
import { SPEAKERS, SESSIONS, type Speaker as SpeakerInfo } from "@/data/event";

const ORANGE = "#F98012";
const NAVY = "#0B1631";
// Fondo claro: gris muy suave radial hacia el centro (manual gráfico MoodlePE26)
const LIGHT_BG = "radial-gradient(ellipse at center, #FFFFFF 0%, #F4F4F4 55%, #E6E6E6 100%)";
// Variante oscura: navy profundo con sutil gradiente para coherencia con el resto del modo oscuro
const DARK_BG = "linear-gradient(135deg, #0B1631 0%, #122142 50%, #0B1631 100%)";

// Tech grid + circuits background
const TECH_BG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%23F98012' stop-opacity='0.55'/><stop offset='1' stop-color='%2300C2FF' stop-opacity='0.45'/></linearGradient></defs><g fill='none' stroke='url(%23g)' stroke-width='1'><path d='M0 80 H180 L210 110 H360 L390 80 H600'/><path d='M0 180 H120 L150 210 H300 L330 180 H600'/><path d='M0 280 H220 L250 310 H440 L470 280 H600'/><path d='M0 380 H80 L110 410 H260 L290 380 H600'/><path d='M0 480 H180 L210 510 H400 L430 480 H600'/><path d='M0 560 H140 L170 530 H320'/></g><g fill='%23F98012' opacity='0.7'><circle cx='180' cy='80' r='3'/><circle cx='360' cy='110' r='3'/><circle cx='150' cy='210' r='3'/><circle cx='440' cy='310' r='3'/><circle cx='110' cy='410' r='3'/><circle cx='400' cy='510' r='3'/></g><g fill='%2300C2FF' opacity='0.6'><circle cx='390' cy='80' r='2.5'/><circle cx='330' cy='180' r='2.5'/><circle cx='250' cy='310' r='2.5'/><circle cx='290' cy='380' r='2.5'/><circle cx='210' cy='510' r='2.5'/></g></svg>\")";

const Speakers = () => {
  const { locale } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const reduce = useReducedMotion();
  const [active, setActive] = useState<SpeakerInfo | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("preview") === "1";
    const fromLs = localStorage.getItem("speakers_preview") === "1";
    if (fromUrl) localStorage.setItem("speakers_preview", "1");
    setPreviewMode(fromUrl || fromLs);
  }, []);

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  const visibleSpeakers = previewMode ? SPEAKERS : SPEAKERS.filter((s) => !s.hidden);


  return (
    <section
      id="ponentes"
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ background: isDark ? DARK_BG : LIGHT_BG }}
    >
      {/* Tech background layers */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: TECH_BG, backgroundSize: "600px 600px", mixBlendMode: isDark ? "screen" : "multiply" }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at top, rgba(249,128,18,0.18) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(0,194,255,0.10) 0%, transparent 55%)"
            : "radial-gradient(ellipse at top, rgba(249,128,18,0.12) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(11,22,49,0.10) 0%, transparent 55%)",
        }}
      />
      {/* Subtle grid */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          opacity: isDark ? 0.08 : 0.06,
          backgroundImage:
            `linear-gradient(to right, ${isDark ? "#ffffff" : NAVY} 1px, transparent 1px), linear-gradient(to bottom, ${isDark ? "#ffffff" : NAVY} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container mx-auto px-4 relative">
        <div className="mb-14 text-center">
          <div className="font-mono text-sm uppercase tracking-[0.4em] mb-3" style={{ color: ORANGE }}>
            {locale === "es" ? "Cap. 03 · Ponentes" : "Ch. 03 · Speakers"}
          </div>
          <h2 className="font-display font-black text-[clamp(2rem,4.8vw,3.75rem)] leading-[1] tracking-tight" style={{ color: isDark ? "#FFFFFF" : NAVY }}>
            {locale === "es"
              ? "Las voces que lideran a las miles de personas que cambiarán la educación."
              : "The voices leading thousands of people who will change education."}
          </h2>
        </div>

        {previewMode && (
          <div className="mb-8 flex items-center justify-center gap-3">
            <div
              className="px-4 py-2 rounded-full font-mono text-xs uppercase tracking-[0.25em] border"
              style={{ borderColor: ORANGE, color: ORANGE, background: "rgba(249,128,18,0.08)" }}
            >
              Modo editor · Mostrando ponentes ocultos
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("speakers_preview");
                setPreviewMode(false);
              }}
              className="px-3 py-2 rounded-full font-mono text-xs uppercase tracking-[0.25em] border border-white/30 text-white/70 hover:text-white hover:border-white transition"
            >
              Salir
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 md:gap-12 max-w-[1300px] mx-auto items-end">
          {visibleSpeakers.map((s) => (
            <motion.button
              key={s.id}
              onClick={() => setActive(s)}
              whileHover={
                reduce
                  ? {}
                  : {
                      scale: 1.06,
                      y: -8,
                      filter: "drop-shadow(0 25px 35px rgba(249,128,18,0.45))",
                    }
              }
              whileTap={reduce ? {} : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              className="relative focus:outline-none cursor-pointer flex flex-col items-center"
              style={{ zIndex: 1 }}
              aria-label={s.name}
            >
              <div
                className="relative w-full"
                style={
                  s.id === "s5"
                    ? { width: "calc(100% - 0.2rem)", marginLeft: "0.1rem" }
                    : s.id === "s2"
                    ? { width: "calc(100% + 0.2rem)", marginLeft: "-0.1rem" }
                    : undefined
                }
              >
                <img
                  src={s.photo ?? speakerCard}
                  alt={s.name}
                  className={`w-full h-auto object-contain pointer-events-none select-none ${s.photo ? "scale-[1.15] origin-bottom" : ""}`}
                />
                {/* Hover glow ring */}
                <motion.div
                  aria-hidden
                  className="absolute inset-x-2 inset-y-4 rounded-3xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  style={{
                    boxShadow: `0 0 0 2px ${ORANGE}, 0 0 40px ${ORANGE}66`,
                  }}
                />
                {s.hidden && (
                  <div
                    className="absolute top-2 left-2 px-2 py-1 rounded font-mono text-sm uppercase tracking-[0.2em] z-10"
                    style={{ background: "rgba(0,0,0,0.75)", color: ORANGE, border: `1px solid ${ORANGE}` }}
                  >
                    Oculto
                  </div>
                )}
              </div>
              <div className="mt-4 text-center px-1">
                <div className="font-display font-black text-lg md:text-xl leading-tight" style={{ color: isDark ? "#FFFFFF" : NAVY }}>
                  {s.name}
                </div>
                <div
                  className="font-mono font-bold text-sm md:text-base uppercase tracking-[0.2em] mt-2"
                  style={{
                    color: ORANGE,
                    textShadow: isDark
                      ? "0 1px 2px rgba(0,0,0,0.6), 0 0 12px rgba(249,128,18,0.35)"
                      : "0 1px 2px rgba(255,255,255,0.7)",
                  }}
                >
                  {s.role}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* CTA: Postúlate como Speaker */}
        <div className="mt-20 md:mt-24 flex flex-col items-center text-center gap-5">
          <div className="font-mono text-xs uppercase tracking-[0.35em]" style={{ color: ORANGE }}>
            {locale === "es" ? "¿Tienes algo que compartir?" : "Have something to share?"}
          </div>
          <h3
            className="font-display font-black text-[clamp(1.5rem,3.2vw,2.4rem)] leading-tight max-w-2xl"
            style={{ color: isDark ? "#FFFFFF" : NAVY }}
          >
            {locale === "es"
              ? "Sé parte del programa académico de MoodleMoot Perú 2026."
              : "Be part of the MoodleMoot Perú 2026 academic program."}
          </h3>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-speaker-proposal"))}
            className="group relative inline-flex items-center gap-3 px-8 h-14 rounded-full font-bold tracking-wide text-white overflow-hidden shadow-[0_20px_50px_-15px_rgba(249,128,18,0.7)] hover:scale-[1.03] transition-transform"
            style={{ background: ORANGE }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Mic className="w-5 h-5 relative" />
            <span className="relative text-base md:text-lg">
              {locale === "es" ? "Postúlate como Speaker" : "Apply as Speaker"}
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            style={{ background: "rgba(11,22,49,0.88)", backdropFilter: "blur(16px)" }}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl"
            >
              <button
                onClick={() => setActive(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full hover:scale-110 transition-transform"
                style={{ background: ORANGE, color: "white" }}
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="grid md:grid-cols-[280px_1fr]">
                <div className="p-6 flex items-center justify-center" style={{ background: "#F5F5F5" }}>
                  <img src={active.photo ?? speakerCard} alt={active.name} className="w-full h-auto" />
                </div>
                <div className="p-8 md:p-10" style={{ color: NAVY }}>
                  <h3 className="font-display font-black text-3xl md:text-4xl leading-tight mb-1">
                    {active.name}
                  </h3>
                  <div className="font-display font-semibold text-base mb-6" style={{ color: ORANGE }}>
                    {active.role}
                  </div>
                  <div className="space-y-5">
                    <div>
                      <div className="font-mono text-sm uppercase tracking-[0.25em] opacity-60 mb-2">
                        Biografía
                      </div>
                      <p className="text-xl leading-relaxed opacity-90">{active.bio}</p>
                    </div>
                    <div>
                      <div className="font-mono text-sm uppercase tracking-[0.25em] opacity-60 mb-2">
                        Participación
                      </div>
                      <p className="text-xl leading-relaxed opacity-90">{active.talk}</p>
                    </div>
                    {active.website && (
                      <div>
                        <div className="font-mono text-sm uppercase tracking-[0.25em] opacity-60 mb-2">
                          Sitio web
                        </div>
                        <a
                          href={active.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-sm uppercase tracking-[0.2em] transition-all hover:scale-[1.03]"
                          style={{ background: ORANGE, color: "white" }}
                        >
                          {active.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Speakers;

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Sparkles, Award, Gift, ArrowRight, X, Check } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import FloatingShapes from "./FloatingShapes";

// Feature flag — poner en true para reactivar el CTA "Registrarme"
const SHOW_REGISTER_CTA = false;

type Locale = "es" | "en";

interface Benefit {
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  title: { es: string; en: string };
  text: { es: string; en: string };
  long: { es: string; en: string };
  bullets: { es: string[]; en: string[] };
}

const BENEFITS_X: Benefit[] = [
  {
    number: "01",
    icon: Users,
    title: { es: "Networking real", en: "Real networking" },
    text: {
      es: "Conecta con +2,000 profesionales de toda la región en espacios diseñados para crear vínculos.",
      en: "Connect with 2,000+ professionals across the region in spaces designed to build links.",
    },
    long: {
      es: "No es un networking de tarjetas y café frío. Habilitamos cabinas privadas, salas temáticas y matchmaking guiado para que cada conversación tenga propósito y se convierta en una colaboración real.",
      en: "Not the cold-coffee, business-card kind. Private cabins, themed rooms and guided matchmaking so every conversation turns into real collaboration.",
    },
    bullets: {
      es: [
        "Cabinas 1 a 1 con videollamada integrada",
        "Salas temáticas por área de interés",
        "Directorio de asistentes y agenda de reuniones",
      ],
      en: [
        "1-on-1 cabins with built-in video calls",
        "Themed rooms by area of interest",
        "Attendee directory and meeting scheduler",
      ],
    },
  },
  {
    number: "02",
    icon: Sparkles,
    title: { es: "Conocimiento sin frontera", en: "Knowledge without borders" },
    text: {
      es: "Keynotes y talleres con líderes globales de Moodle, IA aplicada y educación digital.",
      en: "Keynotes and workshops with global leaders in Moodle, applied AI and digital education.",
    },
    long: {
      es: "Acceso directo a las personas que están definiendo el futuro de la educación digital. Casos reales, demostraciones en vivo y respuestas a tus preguntas, sin filtros corporativos.",
      en: "Direct access to the people defining the future of digital education. Real cases, live demos and answers to your questions, no corporate filters.",
    },
    bullets: {
      es: [
        "+30 sesiones entre conferencias y talleres",
        "Demos en vivo de IA aplicada al aula",
        "Q&A directo con ponentes internacionales",
      ],
      en: [
        "30+ sessions across keynotes and workshops",
        "Live demos of AI applied to the classroom",
        "Direct Q&A with international speakers",
      ],
    },
  },
  {
    number: "03",
    icon: Award,
    title: { es: "Certificado oficial", en: "Official certificate" },
    text: {
      es: "Certificado digital con valor curricular reconocido por la comunidad Moodle.",
      en: "Digital certificate with recognized academic value backed by the Moodle community.",
    },
    long: {
      es: "Al finalizar recibirás un certificado digital verificable, alineado con los estándares de la comunidad Moodle, ideal para sumar a tu hoja de vida, LinkedIn o portafolio profesional.",
      en: "You'll get a verifiable digital certificate aligned with Moodle community standards — perfect for your CV, LinkedIn or professional portfolio.",
    },
    bullets: {
      es: [
        "Verificable mediante código único",
        "Compatible con LinkedIn y portafolios",
        "Aval institucional del evento",
      ],
      en: [
        "Verifiable via unique code",
        "LinkedIn and portfolio compatible",
        "Institutional endorsement",
      ],
    },
  },
  {
    number: "04",
    icon: Gift,
    title: { es: "Recursos exclusivos", en: "Exclusive resources" },
    text: {
      es: "Acceso a grabaciones, plantillas y plugins durante un año completo.",
      en: "Access to recordings, templates and plugins for a full year.",
    },
    long: {
      es: "Llévate el evento contigo: grabaciones HD de cada sesión, plantillas listas para usar, plugins probados y materiales descargables que seguirán generando valor mucho después de que cierren las puertas.",
      en: "Take the event home: HD recordings of every session, ready-to-use templates, tested plugins and downloadable materials that keep paying off long after the doors close.",
    },
    bullets: {
      es: [
        "Grabaciones HD de todas las sesiones",
        "Biblioteca de plantillas Moodle",
        "Acceso anual al repositorio del evento",
      ],
      en: [
        "HD recordings of every session",
        "Moodle template library",
        "One-year access to the event repository",
      ],
    },
  },
];

const Benefits = () => {
  const { locale } = useTranslation();
  const [active, setActive] = useState<Benefit | null>(null);

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

  const goRegister = () => {
    const el = document.getElementById("registro");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="beneficios"
      className="py-24 md:py-32 bg-secondary text-secondary-foreground relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />
      <FloatingShapes
        items={[
          { shape: "semicircles", className: "top-20 -right-12 w-64 md:w-80 invert blur-[1.5px]", opacity: 0.08, anim: "floaty-rev" },
          { shape: "hex", className: "bottom-16 left-10 w-36 md:w-52 invert blur-[1px]", opacity: 0.1, anim: "floaty" },
          { shape: "quarter", className: "top-1/2 left-1/3 w-20 md:w-28 blur-[1px]", opacity: 0.12, anim: "floaty" },
        ]}
      />
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <div className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-3">
              {locale === "es" ? "Cap. 06 · Por qué venir" : "Ch. 06 · Why join"}
            </div>
            <h2 className="text-display text-[clamp(2rem,5vw,4rem)]">
              {locale === "es" ? "Cuatro razones. Cero excusas." : "Four reasons. Zero excuses."}
            </h2>
            <p className="text-base md:text-xl text-secondary-foreground/70 mt-4 max-w-xl">
              {locale === "es"
                ? "Pasa el cursor sobre cada bloque y haz clic para descubrir por qué esto sí cambia tu próximo año profesional."
                : "Hover each block and click to discover why this will actually change your next professional year."}
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3 self-start md:self-end">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 font-mono text-xs uppercase tracking-widest text-red-500 dark:text-red-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              {locale === "es" ? "Cupos limitados · En vivo" : "Limited seats · Live"}
            </span>
            {SHOW_REGISTER_CTA && (
              <button
                onClick={goRegister}
                className="group inline-flex items-center gap-2 h-12 px-6 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest shape-brand-sm hover:gap-3 transition-all duration-300 shadow-[0_12px_32px_-12px_hsl(var(--primary)/0.6)]"
              >
                {locale === "es" ? "Registrarme" : "Register"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-12 gap-4">
          <Card b={BENEFITS_X[0]} className="col-span-12 md:col-span-7 row-span-2 min-h-[320px]" big onClick={() => setActive(BENEFITS_X[0])} />
          <Card b={BENEFITS_X[1]} className="col-span-12 md:col-span-5 min-h-[160px]" highlight onClick={() => setActive(BENEFITS_X[1])} />
          <Card b={BENEFITS_X[2]} className="col-span-12 md:col-span-2 lg:col-span-3 min-h-[160px]" onClick={() => setActive(BENEFITS_X[2])} />
          <Card b={BENEFITS_X[3]} className="col-span-12 md:col-span-3 lg:col-span-2 min-h-[160px]" onClick={() => setActive(BENEFITS_X[3])} />
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
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-background text-foreground rounded-2xl overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setActive(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-110 transition-transform"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 md:p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <active.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <div className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
                      {active.number}
                    </div>
                    <h3 className="font-display font-black text-2xl md:text-3xl leading-tight">
                      {active.title[locale as Locale]}
                    </h3>
                  </div>
                </div>

                <p className="text-base md:text-xl leading-relaxed text-foreground/80 mb-6">
                  {active.long[locale as Locale]}
                </p>

                <ul className="space-y-2.5 mb-8">
                  {active.bullets[locale as Locale].map((it) => (
                    <li key={it} className="flex items-start gap-3 text-sm text-foreground/85">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </span>
                      {it}
                    </li>
                  ))}
                </ul>

                {SHOW_REGISTER_CTA && (
                <button
                  onClick={() => {
                    setActive(null);
                    setTimeout(goRegister, 200);
                  }}
                  className="group inline-flex items-center gap-2 h-12 px-6 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest shape-brand-sm hover:gap-3 transition-all duration-300 w-full md:w-auto justify-center md:justify-start"
                >
                  {locale === "es" ? "Quiero registrarme" : "I want to register"}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const Card = ({
  b,
  className,
  big,
  highlight,
  onClick,
}: {
  b: Benefit;
  className: string;
  big?: boolean;
  highlight?: boolean;
  onClick: () => void;
}) => {
  const { locale } = useTranslation();
  const Icon = b.icon;
  return (
    <button
      onClick={onClick}
      className={`group relative text-left p-6 md:p-8 border overflow-hidden transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-20px_hsl(var(--primary)/0.45)] ${
        highlight
          ? "bg-primary text-primary-foreground border-primary hover:border-primary-foreground/40"
          : "bg-secondary border-secondary-foreground/15 hover:border-primary"
      } ${className}`}
    >
      {/* Glow on hover */}
      <span
        className={`absolute -top-1/2 -right-1/2 w-[200%] h-[200%] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${
          highlight ? "bg-primary-foreground/10" : "bg-primary/10"
        } blur-3xl`}
      />

      <div className="relative flex items-start justify-between mb-6">
        <span
          className={`font-mono text-xs tracking-widest ${
            highlight ? "text-primary-foreground/70" : "text-primary"
          }`}
        >
          {b.number}
        </span>
        <span
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${
            highlight ? "bg-primary-foreground/15" : "bg-primary/10"
          }`}
        >
          <Icon className={`w-5 h-5 ${highlight ? "text-primary-foreground" : "text-primary"}`} />
        </span>
      </div>

      <h3
        className={`relative font-display font-bold leading-tight tracking-tight ${
          big ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"
        }`}
      >
        {b.title[locale as Locale]}
      </h3>
      <p
        className={`relative mt-3 text-xl leading-relaxed ${
          highlight ? "text-primary-foreground/85" : "text-secondary-foreground/70"
        }`}
      >
        {b.text[locale as Locale]}
      </p>

      <span
        className={`relative inline-flex items-center gap-1.5 mt-5 font-mono text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 ${
          highlight ? "text-primary-foreground" : "text-primary"
        }`}
      >
        {locale === "es" ? "Saber más" : "Learn more"}
        <ArrowRight className="w-3 h-3" />
      </span>
    </button>
  );
};

export default Benefits;

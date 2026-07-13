import { useState } from "react";
import { Cpu, Sparkles, LineChart, ArrowUpRight, Plus } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import FloatingShapes from "./FloatingShapes";

type Axis = {
  number: string;
  icon: typeof Cpu;
  title: { es: string; en: string };
  tagline: { es: string; en: string };
  items: { title: { es: string; en: string }; description: { es: string; en: string } }[];
};

const AXES_DATA: Axis[] = [
  {
    number: "01",
    icon: Cpu,
    title: { es: "Tecnologías Emergentes", en: "Emerging Technologies" },
    tagline: {
      es: "IA local, realidad extendida y automatización aplicada al LMS.",
      en: "Local AI, extended reality and automation applied to the LMS.",
    },
    items: [
      {
        title: { es: "Arquitectura de IA Local y Privacidad", en: "Local AI Architecture & Privacy" },
        description: {
          es: "Implementación de modelos de lenguaje (LLM) que corren localmente en el LMS.",
          en: "Implementation of language models (LLMs) running locally inside the LMS.",
        },
      },
      {
        title: { es: "Integración de Realidad Extendida (XR)", en: "Extended Reality (XR) Integration" },
        description: {
          es: "Uso de tecnologías de realidad aumentada y virtual dentro de Moodle.",
          en: "Use of augmented and virtual reality technologies within Moodle.",
        },
      },
      {
        title: { es: "Automatización de Evaluaciones con IA", en: "AI-Powered Assessment Automation" },
        description: {
          es: "Optimización del tiempo docente mediante evaluación automática con inteligencia artificial.",
          en: "Optimizing teacher time through automated assessment powered by AI.",
        },
      },
    ],
  },
  {
    number: "02",
    icon: Sparkles,
    title: { es: "Experiencias de Aprendizaje", en: "Learning Experiences" },
    tagline: {
      es: "Personalización, engagement y aprendizaje continuo con microcredenciales.",
      en: "Personalization, engagement and lifelong learning with micro-credentials.",
    },
    items: [
      {
        title: { es: "Personalización del Aprendizaje", en: "Learning Personalization" },
        description: {
          es: "Ajuste dinámico de contenidos y actividades según necesidades individuales.",
          en: "Dynamic adjustment of content and activities based on individual needs.",
        },
      },
      {
        title: { es: "Engagement Estudiantil 3.0", en: "Student Engagement 3.0" },
        description: {
          es: "Estrategias de gamificación y análisis de sentimientos mediante IA.",
          en: "Gamification strategies and sentiment analysis powered by AI.",
        },
      },
      {
        title: { es: "Lifelong Learning y Microcredenciales", en: "Lifelong Learning & Micro-credentials" },
        description: {
          es: "Fomento de rutas de aprendizaje continuo validadas por insignias digitales.",
          en: "Continuous learning pathways validated through digital badges.",
        },
      },
    ],
  },
  {
    number: "03",
    icon: LineChart,
    title: { es: "Nuevos Modelos de Gestión", en: "New Management Models" },
    tagline: {
      es: "Decisiones basadas en datos, sostenibilidad y transformación EdTech.",
      en: "Data-driven decisions, sustainability and EdTech transformation.",
    },
    items: [
      {
        title: { es: "Gestión Educativa Basada en Datos", en: "Data-Driven Educational Management" },
        description: {
          es: "Analítica predictiva para anticipar la deserción y optimizar recursos estratégicos.",
          en: "Predictive analytics to anticipate dropout and optimize strategic resources.",
        },
      },
      {
        title: { es: "Educación Sostenible y Digital", en: "Sustainable & Digital Education" },
        description: {
          es: "Tecnologías responsables que reducen la brecha de acceso en comunidades vulnerables.",
          en: "Responsible technologies that close the access gap in vulnerable communities.",
        },
      },
      {
        title: { es: "Transformación Organizacional EdTech", en: "EdTech Organizational Transformation" },
        description: {
          es: "Liderazgo para la migración exitosa hacia ecosistemas digitales y apropiación tecnológica.",
          en: "Leadership for successful migration toward digital ecosystems and tech adoption.",
        },
      },
    ],
  },
];

const Axes = () => {
  const { locale } = useTranslation();
  const [active, setActive] = useState<number>(0);

  return (
    <section
      id="ejes"
      className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-background via-muted/40 to-background"
    >
      {/* Subtle tech grid */}
      <div
        className="absolute inset-0 opacity-60 pointer-events-none bg-grid-sm"
        style={{
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      {/* Brand orange glow accent */}
      <div className="absolute -top-32 -right-20 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 h-[420px] w-[420px] rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
      <FloatingShapes
        items={[
          { shape: "hex", className: "top-16 left-8 w-36 md:w-48 blur-[1px]", opacity: 0.07, anim: "floaty" },
          { shape: "corner", className: "bottom-10 right-12 w-44 md:w-60 blur-[1.5px]", opacity: 0.06, anim: "floaty-rev" },
          { shape: "quarter", className: "top-1/3 right-1/4 w-16 md:w-24 blur-[1px]", opacity: 0.08, anim: "floaty" },
        ]}
      />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mb-14 md:mb-20">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-4">
            {locale === "es" ? "Cap. 02 · Ejes temáticos" : "Ch. 02 · Topics"}
          </div>
          <h2 className="text-display text-[clamp(2rem,5vw,4rem)] text-foreground">
            {locale === "es" ? "Tres ejes que definen el evento." : "Three axes that define the event."}
          </h2>
          <p className="mt-5 text-muted-foreground text-2xl md:text-[1.625rem] max-w-2xl">
            {locale === "es"
              ? "Explora cada eje para descubrir las temáticas que vertebran MoodleMoot Perú 2026. Reserva tu lugar y vive el encuentro Moodle más grande del Perú."
              : "Explore each axis to discover the topics shaping MoodleMoot Peru 2026. Reserve your spot and join Peru's largest Moodle gathering."}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
          {AXES_DATA.map((axis, idx) => {
            const Icon = axis.icon;
            const isActive = active === idx;
            return (
              <button
                key={axis.number}
                type="button"
                onClick={() => setActive(idx)}
                onMouseEnter={() => setActive(idx)}
                aria-expanded={isActive}
                className={cn(
                  "group text-left relative rounded-3xl overflow-hidden border backdrop-blur-xl",
                  "transition-[flex-grow,background-color,box-shadow,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "lg:min-h-[520px] p-8 md:p-10",
                  isActive
                    ? "lg:flex-[2.4] bg-secondary text-secondary-foreground border-secondary shadow-[0_30px_60px_-25px_hsl(215_70%_15%/0.45)]"
                    : "lg:flex-[1] bg-card/80 text-card-foreground border-border hover:bg-card hover:-translate-y-1 shadow-[0_15px_40px_-20px_hsl(215_40%_30%/0.18)]",
                )}
              >
                {/* Decorative gradient ring on active */}
                {isActive && (
                  <div className="absolute inset-0 pointer-events-none opacity-60">
                    <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
                  </div>
                )}

                {/* Big watermark number for inactive cards */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute pointer-events-none font-display font-black select-none transition-all duration-700",
                    isActive
                      ? "opacity-0 -bottom-10 right-4 text-[10rem]"
                      : "opacity-[0.07] -bottom-8 -right-2 text-[14rem] leading-none text-foreground",
                  )}
                >
                  {axis.number}
                </span>

                <div className="relative flex items-start justify-between mb-8">
                  <div
                    className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                      isActive
                        ? "bg-primary text-primary-foreground scale-110"
                        : "bg-muted text-foreground group-hover:bg-primary/15 group-hover:text-primary",
                    )}
                  >
                    <Icon className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <span
                    className={cn(
                      "font-mono text-xs tracking-[0.25em] transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {axis.number}
                  </span>
                </div>

                <h3
                  className={cn(
                    "relative font-display font-bold leading-tight mb-3 transition-all duration-500",
                    isActive ? "text-2xl md:text-[1.75rem]" : "text-xl md:text-2xl",
                  )}
                >
                  {axis.title[locale]}
                </h3>
                <p
                  className={cn(
                    "relative leading-relaxed mb-6 transition-all duration-500",
                    isActive
                      ? "text-lg md:text-xl text-secondary-foreground/80"
                      : "text-base md:text-lg text-muted-foreground",
                  )}
                >
                  {axis.tagline[locale]}
                </p>

                {/* Expandable content */}
                <div
                  className={cn(
                    "relative grid transition-all duration-500 ease-out",
                    isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <ul className="space-y-4 pt-5 border-t border-secondary-foreground/15">
                      {axis.items.map((item, i) => (
                        <li key={i} className="flex gap-4">
                          <span className="font-mono text-xs text-primary mt-1 w-6 shrink-0">
                            0{i + 1}
                          </span>
                          <div>
                            <div className="font-semibold text-lg md:text-xl leading-snug mb-1">
                              {item.title[locale]}
                            </div>
                            <p className="text-base md:text-lg text-secondary-foreground/80 leading-relaxed">
                              {item.description[locale]}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer cue */}
                <div
                  className={cn(
                    "relative flex items-center gap-2 text-xs font-mono uppercase tracking-widest mt-6 transition-opacity",
                    isActive ? "opacity-0 h-0" : "opacity-100",
                  )}
                >
                  <Plus className="h-3.5 w-3.5 text-primary" />
                  <span className="text-muted-foreground">
                    {locale === "es" ? "Ver temas" : "View topics"}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 ml-auto text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA sutil — postulación speaker */}
        <div className="mt-12 md:mt-16 flex justify-center">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-speaker-proposal"))}
            className="group inline-flex items-center gap-2 text-base md:text-lg text-foreground/80 hover:text-primary transition-colors"
          >
            <span className="font-medium">
              {locale === "es"
                ? "¿Tienes una experiencia o investigación que compartir? Postúlate como Speaker"
                : "Have an experience or research to share? Apply as Speaker"}
            </span>
            <ArrowUpRight className="w-5 h-5 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

    </section>
  );
};

export default Axes;

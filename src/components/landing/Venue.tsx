import { MapPin, Wifi } from "lucide-react";
import { EVENT } from "@/data/event";
import { useTranslation } from "@/i18n/LanguageContext";
import FloatingShapes from "./FloatingShapes";

const Venue = () => {
  const { locale } = useTranslation();
  return (
    <section id="lugar" className="py-24 md:py-32 relative overflow-hidden">
      <FloatingShapes
        items={[
          { shape: "semicircles", className: "top-10 right-0 w-56 md:w-72 blur-[2px]", opacity: 0.05, anim: "floaty-rev" },
          { shape: "quarter", className: "bottom-16 left-8 w-24 md:w-32 blur-[1px]", opacity: 0.08, anim: "floaty" },
          { shape: "hex", className: "top-1/2 left-1/2 w-28 md:w-36 blur-[1px]", opacity: 0.05, anim: "floaty" },
        ]}
      />
      <div className="container mx-auto px-4 relative">
        <div className="mb-14">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-3">{locale === "es" ? "Cap. 07 · Lugar" : "Ch. 07 · Where"}</div>
          <h2 className="text-display text-[clamp(2rem,5vw,4rem)]">
            {locale === "es" ? "Vívelo donde quieras." : "Live it from anywhere."}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-border">
          {/* Presencial */}
          <div className="bg-background p-8 md:p-12 group hover:bg-secondary hover:text-secondary-foreground transition-colors duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-primary text-primary-foreground flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="font-mono text-xs uppercase tracking-[0.25em] text-primary">{locale === "es" ? "Presencial" : "In-person"}</div>
            </div>
            <h3 className="font-display font-bold text-3xl md:text-4xl mb-4 leading-tight">{EVENT.venue[locale]}</h3>
            <p className="text-xl text-muted-foreground group-hover:text-secondary-foreground/80 leading-relaxed mb-8">
              {locale === "es"
                ? "El corazón de Lima abre sus puertas para dos días de aprendizaje, networking y café peruano sin límite."
                : "The heart of Lima opens its doors for two days of learning, networking and unlimited Peruvian coffee."}
            </p>
            <div className="space-y-2 font-mono text-lg text-muted-foreground group-hover:text-secondary-foreground/70">
              <div>{EVENT.city}</div>
              <div>14 — 15 · 09 · 2026</div>
              <div>08:00 — 20:00 PET</div>
            </div>
          </div>

          {/* Virtual */}
          <div className="bg-foreground text-background p-8 md:p-12 group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-sm bg-primary text-primary-foreground flex items-center justify-center">
                <Wifi className="w-5 h-5" />
              </div>
              <div className="font-mono text-xs uppercase tracking-[0.25em] text-primary">{locale === "es" ? "Virtual" : "Virtual"}</div>
            </div>
            <h3 className="font-display font-bold text-3xl md:text-4xl mb-4 leading-tight">
              {locale === "es" ? "Plataforma en vivo + on-demand." : "Live platform + on-demand."}
            </h3>
            <p className="text-xl text-background/70 leading-relaxed mb-8">
              {locale === "es"
                ? "Streaming HD, Q&A en vivo, salas paralelas, networking virtual y grabaciones disponibles por 12 meses."
                : "HD streaming, live Q&A, breakout rooms, virtual networking and recordings available for 12 months."}
            </p>
            <div className="space-y-2 font-mono text-lg text-background/60">
              <div>{locale === "es" ? "Acceso global" : "Global access"}</div>
              <div>{locale === "es" ? "Subtítulos ES / EN" : "Subtitles ES / EN"}</div>
              <div>{locale === "es" ? "Certificado digital incluido" : "Digital certificate included"}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Venue;

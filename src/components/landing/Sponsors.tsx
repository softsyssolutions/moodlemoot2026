import { ArrowUpRight } from "lucide-react";
import { SPONSORS } from "@/data/event";
import { useTranslation } from "@/i18n/LanguageContext";
import FloatingShapes from "./FloatingShapes";

const SponsorCard = ({ id, logo, name, url }: { id: string; logo: string; name: string; url: string }) => {
  const sizeClass =
    id === "buendata"
      ? "max-h-24 md:max-h-28"
      : id === "industriae"
      ? "max-h-20 md:max-h-24"
      : "max-h-12 md:max-h-14";
  const content = (
    <div className="group relative shrink-0 w-56 md:w-64 h-24 md:h-28 bg-background/90 backdrop-blur-sm rounded-xl border border-border/60 shadow-sm flex items-center justify-center px-6 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:border-primary/50 hover:bg-background hover:z-10">
      <img
        src={logo}
        alt={name}
        className={`${sizeClass} w-auto object-contain opacity-80 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110`}
      />
      <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-mono uppercase tracking-widest text-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity">
        {name}
      </span>
    </div>
  );
  if (url && url !== "#") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={name} className="shrink-0">
        {content}
      </a>
    );
  }
  return <div className="shrink-0">{content}</div>;
};

// CTA "Quiero ser sponsor" — abre el modal de postulación de sponsor
const SHOW_SPONSOR_CTA = true;

const Sponsors = () => {
  const { locale } = useTranslation();
  const loop = [...SPONSORS, ...SPONSORS, ...SPONSORS];
  const loopAlt = [...[...SPONSORS].reverse(), ...[...SPONSORS].reverse(), ...[...SPONSORS].reverse()];

  return (
    <section id="sponsors" className="relative py-24 md:py-32 overflow-hidden bg-secondary">
      {/* Tech background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-background" />
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary) / 0.35) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.35) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      <div className="absolute -top-32 -left-20 w-[28rem] h-[28rem] rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl" />
      <FloatingShapes
        items={[
          { shape: "corner", className: "top-16 left-10 w-44 md:w-60 invert blur-[1.5px]", opacity: 0.08, anim: "floaty" },
          { shape: "hex", className: "bottom-20 right-16 w-32 md:w-44 invert blur-[1px]", opacity: 0.1, anim: "floaty-rev" },
          { shape: "quarter", className: "top-1/3 right-1/4 w-20 md:w-28 blur-[1px]", opacity: 0.12, anim: "floaty" },
        ]}
      />

      <div className="relative container mx-auto px-4">
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 backdrop-blur border border-border shadow-sm mb-5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm font-mono uppercase tracking-[0.25em] text-foreground">
              {locale === "es" ? "Nuestros Sponsors" : "Our Sponsors"}
            </span>
            <span className="w-2 h-2 rounded-full bg-primary" />
          </div>
          <h2 className="text-display text-[clamp(2rem,5vw,4rem)] text-secondary-foreground">
            {locale === "es" ? "Quienes hacen esto posible." : "Those who make this possible."}
          </h2>
        </div>

        {/* Row 1 — left to right (visually) using reverse keyframe */}
        <div
          className="overflow-hidden py-6"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          }}
        >
          <div className="marquee-track-reverse flex items-center gap-8 hover:[animation-play-state:paused]">
            {loop.map((s, i) => (
              <SponsorCard key={`r1-${i}`} id={s.id} logo={s.logo} name={s.name} url={s.url} />
            ))}
          </div>
        </div>

        {/* Row 2 — right to left */}
        <div
          className="overflow-hidden py-6 mt-2"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          }}
        >
          <div className="marquee-track flex items-center gap-8 hover:[animation-play-state:paused]">
            {loopAlt.map((s, i) => (
              <SponsorCard key={`r2-${i}`} id={s.id} logo={s.logo} name={s.name} url={s.url} />
            ))}
        </div>

        {SHOW_SPONSOR_CTA && (
          <div className="mt-14 flex justify-center">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-sponsor-proposal"))}
              className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-mono text-xs uppercase tracking-[0.25em] shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.03] transition-all"
            >
              {locale === "es" ? "Quiero ser sponsor" : "Become a sponsor"}
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        )}
      </div>
      </div>
    </section>
  );
};

export default Sponsors;

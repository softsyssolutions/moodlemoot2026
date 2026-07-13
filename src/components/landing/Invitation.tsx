import { Download, Quote } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import rafael from "@/assets/people/rafael.png";
import FloatingShapes from "./FloatingShapes";

const Invitation = () => {
  const { locale } = useTranslation();

  return (
    <section
      id="invitacion"
      className="relative bg-gradient-to-br from-[#f4f4f4] via-[#e6e6e6] to-[#d4d4d4] text-[hsl(var(--brand-dark))] dark:bg-none dark:bg-brand-ink dark:text-white overflow-hidden py-20 md:py-28"
    >
      {/* Background ambience — light: soft warm gray · dark: navy + tech blue */}
      <div className="absolute inset-0 [background:radial-gradient(60%_70%_at_15%_40%,hsl(var(--brand-orange)/0.12),transparent_60%),radial-gradient(55%_65%_at_85%_75%,hsl(0_0%_60%/0.45),transparent_65%)] dark:[background:radial-gradient(60%_70%_at_15%_40%,hsl(var(--brand-orange)/0.18),transparent_60%),radial-gradient(50%_60%_at_85%_80%,hsl(220_90%_45%/0.2),transparent_60%)]" />
      {/* Tech grid lines */}
      <div className="absolute inset-0 bg-grid-sm opacity-60 dark:opacity-40 dark:mix-blend-overlay pointer-events-none" />
      {/* Tech circuit overlay (dark stroke in light, white stroke in dark) */}
      <div
        className="absolute inset-0 opacity-[0.07] dark:opacity-[0.08] dark:hidden pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'><g fill='none' stroke='%23212121' stroke-width='1'><path d='M0 40 H80 L100 60 H180'/><path d='M0 120 H40 L60 140 H140 L160 160 H220'/><path d='M40 0 V60 L60 80 V160'/><path d='M160 0 V40 L180 60 V140'/><circle cx='80' cy='40' r='2.5' fill='%23212121'/><circle cx='100' cy='60' r='2.5' fill='%23212121'/><circle cx='40' cy='120' r='2.5' fill='%23212121'/><circle cx='160' cy='160' r='2.5' fill='%23212121'/><circle cx='60' cy='80' r='2.5' fill='%23212121'/><circle cx='180' cy='60' r='2.5' fill='%23212121'/></g></svg>\")",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none hidden dark:block"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'><g fill='none' stroke='white' stroke-width='1'><path d='M0 40 H80 L100 60 H180'/><path d='M0 120 H40 L60 140 H140 L160 160 H220'/><path d='M40 0 V60 L60 80 V160'/><path d='M160 0 V40 L180 60 V140'/><circle cx='80' cy='40' r='2.5' fill='white'/><circle cx='100' cy='60' r='2.5' fill='white'/><circle cx='40' cy='120' r='2.5' fill='white'/><circle cx='160' cy='160' r='2.5' fill='white'/><circle cx='60' cy='80' r='2.5' fill='white'/><circle cx='180' cy='60' r='2.5' fill='white'/></g></svg>\")",
        }}
      />
      <FloatingShapes
        items={[
          { shape: "semicircles", className: "-bottom-10 -left-12 w-56 dark:invert", opacity: 0.08, anim: "floaty" },
          { shape: "hex", className: "top-10 right-8 w-28 dark:invert", opacity: 0.12, anim: "floaty-rev" },
        ]}
      />

      <div className="relative container mx-auto px-4 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left: photo with stacked layers */}
        <div className="lg:col-span-5 relative">
          <div className="group relative aspect-[4/5] max-w-md mx-auto w-[calc(70%-40px)] sm:w-[calc(100%-2rem-40px)]">
            {/* Color blocks behind - merge into photo on hover (desktop) */}
            <div className="absolute -top-4 -left-4 w-3/4 h-3/4 bg-brand-orange shape-brand-lg transition-all duration-500 ease-out lg:group-hover:top-0 lg:group-hover:left-0 lg:group-hover:w-full lg:group-hover:h-full lg:group-hover:opacity-60" />
            <div className="absolute -bottom-4 -right-4 w-2/3 h-2/3 bg-gradient-to-br from-[hsl(340_85%_55%)] to-brand-orange shape-brand-lg opacity-90 transition-all duration-500 ease-out lg:group-hover:bottom-0 lg:group-hover:right-0 lg:group-hover:w-full lg:group-hover:h-full lg:group-hover:opacity-50" />
            {/* Photo card */}
            <div className="relative w-full h-full shape-brand-lg overflow-hidden bg-gradient-to-b from-[#d4d4d4]/40 to-[#d4d4d4] dark:from-brand-ink/40 dark:to-brand-ink ring-1 ring-black/10 dark:ring-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
              <img src={rafael} alt="Dr. Rafael Martínez Campoblanco" className="w-full h-full object-cover object-top transition-transform duration-500 ease-out lg:group-hover:scale-[1.03]" />
              {/* Desktop hover overlay with name */}
              <div className="hidden lg:block absolute inset-x-5 bottom-5 opacity-0 translate-y-4 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-y-0">
                <div className="rounded-2xl px-4 py-3 bg-white/15 dark:bg-black/35 backdrop-blur-xl ring-1 ring-white/25 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-brand-orange font-bold mb-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                    {locale === "es" ? "Director del evento" : "Event director"}
                  </div>
                  <div className="font-display font-bold text-lg leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">Dr. Rafael Martínez Campoblanco</div>
                </div>
              </div>
            </div>
            {/* Mobile / tablet: glass card pinned over photo (hidden on desktop) */}
            <div className="lg:hidden absolute inset-x-3 -bottom-16 rounded-2xl px-4 py-3 bg-white/15 dark:bg-black/35 backdrop-blur-xl ring-1 ring-white/25 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
              <div className="text-[10px] uppercase tracking-[0.3em] text-brand-orange font-bold mb-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                {locale === "es" ? "Director del evento" : "Event director"}
              </div>
              <div className="font-display font-bold text-base leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">Dr. Rafael Martínez Campoblanco</div>
            </div>
          </div>
        </div>

        {/* Right: letter excerpt */}
        <div className="lg:col-span-7 mt-[40px]">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-brand-orange mb-3">
            {locale === "es" ? "Carta de invitación" : "Invitation letter"}
          </div>
          <h2 className="font-display font-bold text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight">
            {locale === "es"
              ? "Una invitación a transformar la educación digital."
              : "An invitation to transform digital education."}
          </h2>

          <div className="relative mt-8 pl-6 border-l-2 border-brand-orange/60">
            <Quote className="absolute -top-2 -left-3 w-6 h-6 text-brand-orange bg-[#e6e6e6] dark:bg-brand-ink p-1" />
            <div className="space-y-4 text-[hsl(var(--brand-dark))]/85 dark:text-white/85 text-lg md:text-xl leading-relaxed">
              <p>
                {locale === "es"
                  ? "Es un honor dirigirme a usted como Director del MoodleMoot Perú 2026, para invitarlo formalmente a participar en este evento de gran relevancia internacional."
                  : "It is an honor to address you as Director of MoodleMoot Perú 2026, to formally invite you to participate in this internationally relevant event."}
              </p>
              <p>
                {locale === "es" ? (
                  <>
                    Bajo el lema <span className="text-[hsl(var(--brand-dark))] dark:text-white font-semibold">"Retos y oportunidades en la educación exponencial"</span>, exploraremos la inteligencia artificial aplicada a la educación, el aprendizaje a lo largo de la vida y el desarrollo sostenible en el ámbito educativo.
                  </>
                ) : (
                  <>
                    Under the motto <span className="text-[hsl(var(--brand-dark))] dark:text-white font-semibold">"Challenges and opportunities in exponential education"</span>, we will explore AI applied to education, lifelong learning and sustainable development in the educational field.
                  </>
                )}
              </p>
              <p>
                {locale === "es"
                  ? "Le esperamos en Lima para hacer juntos historia en la comunidad Moodle."
                  : "We await you in Lima to make history together in the Moodle community."}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="/Carta_MoodleMoot_peru_2026.pdf"
              download="Carta_MoodleMoot_peru_2026.pdf"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-3 bg-brand-orange text-white px-7 h-12 shape-brand-sm font-bold tracking-wide hover:gap-4 transition-all shadow-[0_10px_40px_-10px_hsl(var(--brand-orange)/0.7)]"
            >
              <Download className="w-4 h-4" />
              {locale === "es" ? "Descargar carta completa" : "Download full letter"}
            </a>
            <div className="text-sm text-[hsl(var(--brand-dark))]/70 dark:text-white/70">
              <div className="font-display font-bold text-[hsl(var(--brand-dark))] dark:text-white">Dr. Rafael Martínez Campoblanco</div>
              <div>{locale === "es" ? "Director · MoodleMoot Perú 2026" : "Director · MoodleMoot Perú 2026"}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Invitation;

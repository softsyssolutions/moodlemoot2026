import { motion, useReducedMotion } from "framer-motion";
import { EVENT } from "@/data/event";
import { useTranslation } from "@/i18n/LanguageContext";
import FloatingShapes from "./FloatingShapes";
import PricingTimeline from "./PricingTimeline";

const About = () => {
  const { locale } = useTranslation();
  const reduce = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    show: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
    }),
  };

  return (
    <section id="about" className="py-28 md:py-40 relative overflow-hidden">
      <FloatingShapes
        items={[
          { shape: "semicircles", className: "top-20 -left-16 w-72 md:w-96 blur-[2px]", opacity: 0.05, anim: "floaty" },
          { shape: "hex", className: "bottom-24 right-10 w-40 md:w-56 blur-[1px]", opacity: 0.06, anim: "floaty-rev" },
          { shape: "quarter", className: "top-1/2 right-1/3 w-20 md:w-28 blur-[1px]", opacity: 0.07, anim: "floaty" },
        ]}
      />

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-15%" }}
        className="container mx-auto px-4 relative"
      >
        {/* Chapter marker — outside the card, editorial style */}
        <motion.div variants={fadeUp} custom={0} className="flex items-baseline gap-4 mb-8">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-primary">
            {locale === "es" ? "Cap. 01" : "Ch. 01"}
          </div>
          <div className="h-px flex-1 bg-border" />
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">
            {locale === "es" ? "El encuentro" : "The gathering"}
          </div>
        </motion.div>

        {/* Unified hero card */}
        <motion.div
          variants={fadeUp}
          custom={1}
          whileHover={reduce ? undefined : { y: -3 }}
          transition={{ type: "spring", stiffness: 180, damping: 24 }}
          className="relative rounded-3xl overflow-hidden border border-border/60 bg-gradient-to-br from-background via-background to-primary/[0.04] shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.25)]"
        >
          {/* glow accents */}
          <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -left-20 w-[28rem] h-[28rem] rounded-full bg-primary/[0.06] blur-3xl" />
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/[0.04]" />

          <div className="relative grid lg:grid-cols-12 gap-y-10 lg:gap-x-12 p-8 md:p-12 lg:p-16">
            {/* Left: headline + paragraph */}
            <div className="lg:col-span-7 flex flex-col">
              <motion.h2
                variants={fadeUp}
                custom={2}
                className="text-display text-[clamp(2.5rem,5.5vw,5rem)] tracking-tight leading-[0.95]"
              >
                {locale === "es" ? (
                  <>Dos días. <span className="text-primary">Una comunidad.</span> Cientos de ideas que cambian la educación.</>
                ) : (
                  <>Two days. <span className="text-primary">One community.</span> Hundreds of ideas reshaping education.</>
                )}
              </motion.h2>

              <motion.p
                variants={fadeUp}
                custom={3}
                className="mt-8 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl"
              >
                {locale === "es"
                  ? "MoodleMoot Perú reúne a quienes están construyendo el futuro del aprendizaje digital. Una sala llena de docentes, desarrolladores, diseñadores instruccionales y líderes EdTech, listos para compartir lo que funciona, lo que no, y lo que viene."
                  : "MoodleMoot Perú brings together those building the future of digital learning. A room full of educators, developers, instructional designers and EdTech leaders, ready to share what works, what doesn't, and what's next."}
              </motion.p>
            </div>

            {/* Right: pricing card embedded */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="lg:col-span-5 self-center w-full"
            >
              <PricingTimeline />
            </motion.div>

            {/* Bottom: stats strip — full width across the card */}
            <motion.div
              variants={fadeUp}
              custom={5}
              className="lg:col-span-12 mt-2 pt-8 border-t border-border/60 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4"
            >
              {EVENT.stats.map((s, i) => (
                <motion.div
                  key={s.value}
                  variants={fadeUp}
                  custom={6 + i * 0.4}
                  className="relative px-2 md:px-4 md:border-r md:border-border/60 md:last:border-r-0"
                >
                  <div className="font-display font-bold text-[clamp(2rem,3.5vw,3rem)] text-foreground tracking-tight leading-none">
                    {s.value}
                  </div>
                  <div className="font-mono text-[10px] md:text-xs uppercase tracking-[0.22em] text-muted-foreground mt-2">
                    {s.label[locale]}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default About;

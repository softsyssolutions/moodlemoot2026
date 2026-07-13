import { useTranslation } from "@/i18n/LanguageContext";

const Marquee = () => {
  const { locale } = useTranslation();
  const text = locale === "es"
    ? "TECNOLOGÍAS EMERGENTES ✦ EXPERIENCIAS DE APRENDIZAJE ✦ NUEVOS MODELOS DE GESTIÓN"
    : "EMERGING TECHNOLOGIES ✦ LEARNING EXPERIENCES ✦ NEW MANAGEMENT MODELS";

  const Group = ({ ariaHidden = false }: { ariaHidden?: boolean }) => (
    <div className="flex-shrink-0 flex items-center justify-around min-w-full px-4" aria-hidden={ariaHidden}>
      <span className="text-xl md:text-3xl font-display font-bold tracking-widest uppercase whitespace-nowrap">
        {text}
      </span>
    </div>
  );

  return (
    <section className="border-y border-brand-orange/20 bg-brand-ink text-white py-5 overflow-hidden flex w-full">
      <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite] w-max hover:[animation-play-state:paused]">
        <Group />
        <Group ariaHidden />
      </div>
    </section>
  );
};

export default Marquee;

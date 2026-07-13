import moodlemootLogo from "@/assets/brand/moodlemoot-logo.png";
import umchLogo from "@/assets/brand/logo-umch.png";
import industriaeLogo from "@/assets/brand/logo-industriae.png";
import { useTranslation } from "@/i18n/LanguageContext";

const Organizers = () => {
  const { locale } = useTranslation();
  const heading = locale === "es" ? "Organizadores" : "Organizers";

  return (
    <section id="organizan" className="py-16 md:py-24 bg-muted/40 border-y border-border">
      <div className="container mx-auto px-4 flex flex-col items-center [perspective:1200px]">
        <h2 className="text-display text-3xl md:text-5xl mb-8 md:mb-10 text-center text-foreground">
          {heading}
        </h2>
        <div
          className="relative w-full max-w-5xl rounded-[20px] overflow-hidden px-1.5 pt-1.5 pb-1.5 transition-all duration-500 ease-out hover:-translate-y-2 hover:[transform:rotateX(6deg)_rotateY(-4deg)_translateY(-8px)]"
          style={{
            backgroundImage: [
              "linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 35%)",
              "linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(255,250,210,0.75) 18%, rgba(255,255,255,0) 34%, rgba(255,255,255,0) 58%, rgba(255,240,180,0.55) 76%, rgba(255,255,255,0) 92%)",
              "radial-gradient(ellipse at 70% 115%, rgba(255,200,90,0.95) 0%, rgba(255,200,90,0) 55%)",
              "linear-gradient(160deg, #7a4a0e 0%, #d99a2b 14%, #f7d36a 28%, #fff1b0 42%, #d4972a 58%, #a06614 74%, #efc25a 88%, #6e3f0a 100%)",
            ].join(", "),
            boxShadow: [
              "inset 0 3px 4px rgba(255,255,210,0.85)",
              "inset 0 -4px 8px rgba(60,30,0,0.65)",
              "inset 0 0 0 1px rgba(110,60,8,0.6)",
              "inset 3px 0 4px rgba(255,230,160,0.4)",
              "inset -3px 0 4px rgba(60,30,0,0.4)",
              "0 30px 60px -15px rgba(150,90,15,0.7)",
              "0 8px 18px rgba(0,0,0,0.45)",
            ].join(", "),
          }}
        >
          <div
            className="relative rounded-[14px] p-6 md:p-10"
            style={{
              backgroundImage: [
                "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 30%)",
                "linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(255,245,200,0.55) 22%, rgba(255,255,255,0) 38%, rgba(255,255,255,0) 60%, rgba(255,235,170,0.45) 78%, rgba(255,255,255,0) 92%)",
                "linear-gradient(160deg, #b07a1e 0%, #f0c358 22%, #fbe79b 45%, #d49a2a 65%, #8a5612 90%)",
              ].join(", "),
              boxShadow: [
                "inset 0 2px 3px rgba(255,240,180,0.85)",
                "inset 0 -3px 6px rgba(60,30,0,0.55)",
                "inset 0 0 0 1px rgba(110,60,8,0.55)",
                "0 2px 0 rgba(255,235,170,0.35)",
              ].join(", "),
            }}
          >
            <div className="flex flex-col items-center gap-8 md:gap-10">
              {/* MoodleMoot logo - grande arriba */}
              <img
                src={moodlemootLogo}
                alt="MoodleMoot Perú 2026"
                className="block h-28 md:h-44 w-auto object-contain mix-blend-multiply drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]"
              />

              {/* Separador sutil */}
              <div
                aria-hidden
                className="w-32 md:w-48 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(80,40,0,0.45) 50%, transparent 100%)",
                }}
              />

              {/* Organizadores - dos logos balanceados abajo */}
              <div className="w-full grid grid-cols-2 gap-6 md:gap-12 items-center justify-items-center max-w-3xl">
                <img
                  src={umchLogo}
                  alt="Universidad Marcelino Champagnat"
                  className="block h-16 md:h-24 w-auto object-contain mix-blend-multiply drop-shadow-[0_2px_3px_rgba(0,0,0,0.2)]"
                />
                <img
                  src={industriaeLogo}
                  alt="Industriae Learning"
                  className="block h-16 md:h-24 w-auto object-contain mix-blend-multiply drop-shadow-[0_2px_3px_rgba(0,0,0,0.2)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Organizers;

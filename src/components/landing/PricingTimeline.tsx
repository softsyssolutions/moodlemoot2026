import { Sparkles, ArrowRight, TrendingUp } from "lucide-react";
import { usePricingStage } from "@/hooks/usePricingStage";
import { useTranslation } from "@/i18n/LanguageContext";

const PricingTimeline = () => {
  const { locale } = useTranslation();
  const { current, next, savings, regularPrice } = usePricingStage();

  const s = current;
  if (!s) return null;

  const label = locale === "es" ? s.labelEs : s.labelEn;
  const date = locale === "es" ? s.shortDateEs : s.shortDateEn;
  const desc = locale === "es" ? s.descEs : s.descEn;

  const nextDate = locale === "es"
    ? next?.shortDateEs.replace(/^Desde\s/i, "") ?? ""
    : next?.shortDateEn.replace(/^From\s/i, "") ?? "";
  const urgencyText = next
    ? locale === "es"
      ? `Sube a USD ${next.price} el ${nextDate}`
      : `Jumps to USD ${next.price} on ${nextDate}`
    : locale === "es"
      ? "Oferta por tiempo limitado"
      : "Limited-time offer";

  return (
    <div className="w-full text-left">
      <div className="relative rounded-2xl border border-brand-orange/40 bg-gradient-to-br from-brand-orange/12 via-white/[0.03] to-brand-orange/8 shadow-[0_0_40px_-12px_hsl(var(--brand-orange)/0.5)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-brand-orange/25 animate-pulse [animation-duration:3s]" />

        <div className="relative px-5 pt-4 pb-5">
          {/* Header row */}
          <div className="flex items-center gap-3">
            <span className="relative flex w-10 h-10 shrink-0 rounded-full items-center justify-center text-[11px] font-bold bg-brand-orange text-white ring-2 ring-white/20 shadow-[0_0_18px_3px_hsl(var(--brand-orange)/0.45)]">
              <span className="absolute inset-0 rounded-full bg-brand-orange/40 animate-ping" />
              <span className="relative">-{s.discount}%</span>
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.22em] font-semibold text-white">
                  {label}
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.25em] bg-brand-orange/20 text-white px-2 py-0.5 rounded-full border border-brand-orange/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                  {locale === "es" ? "Ahora" : "Now"}
                </span>
              </div>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="font-display font-bold text-2xl text-white leading-none">
                  USD {s.price}
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-brand-orange font-bold">
                  {date}
                </span>
              </div>
            </div>
          </div>

          {/* Compact savings row */}
          <div className="mt-3 flex items-center gap-3 text-[11px]">
            <span className="text-white/70">
              {locale === "es" ? "Precio regular" : "Regular"}{" "}
              <span className="line-through text-white/50">USD {regularPrice}</span>
            </span>
            <span className="text-brand-orange font-bold">
              {locale === "es" ? "Ahorras" : "Save"} USD {savings}
            </span>
          </div>

          <p className="mt-2 text-sm text-white/80 leading-snug">{desc}</p>

          {next && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-brand-orange font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>{urgencyText}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-ticket-purchase"))}
            className="mt-4 group inline-flex w-full items-center justify-center gap-2 bg-brand-orange text-white px-5 h-10 rounded-lg font-bold text-sm tracking-wide hover:gap-3 transition-all shadow-[0_10px_24px_-8px_hsl(var(--brand-orange)/0.7)]"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {locale === "es" ? "Asegura tu entrada" : "Get your ticket"}
            </span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingTimeline;

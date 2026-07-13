import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import PricingTimeline from "./PricingTimeline";

const CtaBanner = () => {
  const wrapRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
    // grid parallax offset (max ~24px)
    const ox = ((e.clientX - rect.left) / rect.width - 0.5) * 24;
    const oy = ((e.clientY - rect.top) / rect.height - 0.5) * 24;
    el.style.setProperty("--gx", `${ox}px`);
    el.style.setProperty("--gy", `${oy}px`);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Top notch */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-10">
        <div className="w-10 h-10 rounded-full bg-brand-orange shadow-[0_10px_30px_-5px_hsl(var(--brand-orange)/0.7)] flex items-center justify-center">
          <ArrowRight className="w-4 h-4 text-white rotate-90" />
        </div>
      </div>

      <div
        ref={wrapRef}
        onMouseMove={handleMove}
        className="relative bg-gradient-to-br from-[hsl(0_0%_18%)] via-[hsl(0_0%_28%)] to-[hsl(0_0%_42%)] dark:from-[hsl(0_0%_8%)] dark:via-[hsl(0_0%_14%)] dark:to-[hsl(0_0%_22%)] text-white"
        style={{ ["--mx" as any]: "50%", ["--my" as any]: "50%", ["--gx" as any]: "0px", ["--gy" as any]: "0px" }}
      >
        {/* Decorative glows */}
        <div className="absolute inset-0 [background:radial-gradient(60%_80%_at_20%_30%,rgba(255,255,255,0.10),transparent_60%),radial-gradient(50%_70%_at_85%_70%,hsl(var(--brand-orange)/0.18),transparent_60%)]" />
        {/* Tech grid — parallax con cursor */}
        <div
          className="absolute inset-0 opacity-[0.22] transition-[background-position] duration-300 ease-out [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]"
          style={{ backgroundPosition: "var(--gx) var(--gy), var(--gx) var(--gy)" }}
        />
        {/* Spotlight que sigue al cursor */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(280px circle at var(--mx) var(--my), hsl(var(--brand-orange) / 0.18), transparent 60%)",
          }}
        />

      <div className="relative container mx-auto px-4 py-10 md:py-14 text-center">
          <PricingTimeline />
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;

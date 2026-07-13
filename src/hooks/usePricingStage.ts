import { useEffect, useState } from "react";

export type PricingStage = {
  id: "launch" | "early" | "last" | "regular";
  discount: number; // 0, 30, 50, 70
  price: number; // USD rounded
  startsAt: Date;
  endsAt: Date | null;
  labelEs: string;
  labelEn: string;
  shortDateEs: string;
  shortDateEn: string;
  descEs: string;
  descEn: string;
};

const REGULAR_PRICE = 157;

const round = (n: number) => Math.round(n);

export const PRICING_STAGES: PricingStage[] = [
  {
    id: "launch",
    discount: 70,
    price: round(REGULAR_PRICE * 0.3), // 47
    startsAt: new Date("2000-01-01T00:00:00-05:00"),
    endsAt: new Date("2026-07-16T00:00:00-05:00"),
    labelEs: "Lanzamiento",
    labelEn: "Launch",
    shortDateEs: "Hasta 15 jul",
    shortDateEn: "Until Jul 15",
    descEs: "El mejor precio de todo el evento. Cupos muy limitados: la oferta cierra el 15 de julio.",
    descEn: "The lowest price of the whole event. Very limited seats — offer ends July 15.",
  },
  {
    id: "early",
    discount: 50,
    price: round(REGULAR_PRICE * 0.5), // 79
    startsAt: new Date("2026-07-16T00:00:00-05:00"),
    endsAt: new Date("2026-08-01T00:00:00-05:00"),
    labelEs: "Oferta especial",
    labelEn: "Special offer",
    shortDateEs: "Desde 16 jul",
    shortDateEn: "From Jul 16",
    descEs: "Segunda ventana de descuento. Aún ahorras la mitad sobre el precio regular.",
    descEn: "Second discount window. You still save half off the regular price.",
  },
  {
    id: "last",
    discount: 30,
    price: round(REGULAR_PRICE * 0.7), // 110
    startsAt: new Date("2026-08-01T00:00:00-05:00"),
    endsAt: new Date("2026-09-01T00:00:00-05:00"),
    labelEs: "Última llamada",
    labelEn: "Last call",
    shortDateEs: "Desde 1 ago",
    shortDateEn: "From Aug 1",
    descEs: "Última oportunidad con descuento antes de pasar al precio regular del evento.",
    descEn: "Last chance with a discount before moving to the regular event price.",
  },
  {
    id: "regular",
    discount: 0,
    price: REGULAR_PRICE,
    startsAt: new Date("2026-09-01T00:00:00-05:00"),
    endsAt: null,
    labelEs: "Precio regular",
    labelEn: "Regular price",
    shortDateEs: "Desde 1 sep",
    shortDateEn: "From Sep 1",
    descEs: "Precio oficial del evento, sin descuentos aplicados.",
    descEn: "Official event price, no discounts applied.",
  },
];

export const REGULAR_PRICE_USD = REGULAR_PRICE;

export function usePricingStage() {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const currentIndex = Math.max(
    0,
    PRICING_STAGES.findIndex(
      (s) => now >= s.startsAt && (s.endsAt === null || now < s.endsAt)
    )
  );
  const current = PRICING_STAGES[currentIndex];
  const next = PRICING_STAGES[currentIndex + 1] ?? null;
  const savings = REGULAR_PRICE - current.price;

  return {
    stages: PRICING_STAGES,
    currentIndex,
    current,
    next,
    regularPrice: REGULAR_PRICE,
    savings,
  };
}

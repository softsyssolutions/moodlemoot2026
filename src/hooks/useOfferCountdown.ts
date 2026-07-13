import { useEffect, useState } from "react";

// Fin de la oferta de lanzamiento: 15 de julio 2026, 23:59 hora Lima (UTC-5)
export const OFFER_END = new Date("2026-07-15T23:59:59-05:00");
export const BASE_PRICE = 157;
export const OFFER_DISCOUNT = 70; // %
export const OFFER_PRICE = +(BASE_PRICE * (1 - OFFER_DISCOUNT / 100)).toFixed(2); // 47.10
export const OFFER_SAVINGS = +(BASE_PRICE - OFFER_PRICE).toFixed(2);

function compute() {
  const now = Date.now();
  const diff = OFFER_END.getTime() - now;
  if (diff <= 0) return { daysLeft: 0, expired: true };
  const daysLeft = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return { daysLeft, expired: false };
}

export function useOfferCountdown() {
  const [state, setState] = useState(compute);

  useEffect(() => {
    const id = setInterval(() => setState(compute()), 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return state;
}

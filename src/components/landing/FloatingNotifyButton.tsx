import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import PushOptInModal from "./PushOptInModal";

export default function FloatingNotifyButton() {
  const [open, setOpen] = useState(false);
  const { isSupported, isSubscribed, permission } = usePushSubscription();

  // Ocultar si no hay soporte o el permiso fue denegado
  if (!isSupported || permission === "denied") return null;

  const active = isSubscribed && permission === "granted";
  const showAttention = !active;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={active ? "Notificaciones activas" : "Activar notificaciones"}
        className="group fixed left-4 bottom-32 md:bottom-56 z-50 flex items-center justify-start h-12 w-12 md:h-14 md:w-14 md:hover:w-64 overflow-hidden rounded-full bg-brand-orange text-white shadow-[0_10px_30px_-8px_hsl(var(--brand-orange)/0.7)] hover:shadow-[0_14px_36px_-8px_hsl(var(--brand-orange)/0.85)] transition-[width,box-shadow,transform] duration-500 ease-out active:scale-95"
      >
        <span className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
          <span
            className={
              showAttention
                ? "motion-safe:animate-[bell-wiggle_3.5s_ease-in-out_infinite] motion-safe:group-hover:[animation-play-state:paused] origin-top"
                : ""
            }
          >
            {active ? <BellRing className="w-5 h-5 md:w-6 md:h-6" /> : <Bell className="w-5 h-5 md:w-6 md:h-6" />}
          </span>

          {showAttention && (
            <span className="absolute top-2 right-2 md:top-2.5 md:right-2.5 flex h-3 w-3">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
            </span>
          )}
        </span>
        <span className="hidden md:inline-block whitespace-nowrap font-semibold text-sm pr-5 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 delay-100">
          {active ? "Notificaciones activas" : "Activar notificaciones"}
        </span>
      </button>

      <PushOptInModal open={open} onOpenChange={setOpen} />
    </>
  );
}

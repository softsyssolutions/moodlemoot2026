import { useEffect, useState } from "react";
import EventRegistrationModal from "@/components/landing/EventRegistrationModal";

/**
 * Listener global del evento `open-event-registration`.
 * Montado en App.tsx para que el modal funcione en cualquier ruta
 * (landing, blog, blog post, etc.).
 */
const GlobalRegistrationModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-event-registration", handler);
    return () => window.removeEventListener("open-event-registration", handler);
  }, []);

  return <EventRegistrationModal open={open} onOpenChange={setOpen} />;
};

export default GlobalRegistrationModal;

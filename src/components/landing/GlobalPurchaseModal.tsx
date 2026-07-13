import { useEffect, useState } from "react";
import PurchaseTicketModal from "@/components/landing/PurchaseTicketModal";

/**
 * Listener global del evento `open-ticket-purchase`.
 * Permite abrir el modal de compra desde cualquier punto de la app.
 */
const GlobalPurchaseModal = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-ticket-purchase", handler);
    return () => window.removeEventListener("open-ticket-purchase", handler);
  }, []);
  return <PurchaseTicketModal open={open} onOpenChange={setOpen} />;
};

export default GlobalPurchaseModal;

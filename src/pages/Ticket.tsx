import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, ArrowLeft, Download, AlertTriangle, QrCode, MapPin, BadgeCheck } from "lucide-react";
import html2canvas from "html2canvas";

import { Button } from "@/components/ui/button";

interface TicketData {
  ticket_id: string;
  full_name: string;
  email_masked: string;
  category: string;
  amount_paid: number;
  payment_status: string;
  coupon_code: string | null;
  qr_data_url: string | null;
  check_in_url: string | null;
}

const categoryLabel = (_c: string) => "Entrada General";

const Ticket = () => {
  const { ticketId } = useParams();
  const [data, setData] = useState<TicketData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-ticket?t=${encodeURIComponent(ticketId ?? "")}`;
        const r = await fetch(url, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        const json = await r.json();
        if (cancelled) return;
        if (!r.ok || json.error) throw new Error(json.error ?? "Error");
        setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "No pudimos cargar tu ticket");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ticketId]);

  const downloadPng = async () => {
    if (!printableRef.current || !data) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(printableRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `${data.ticket_id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-ink via-brand-ink to-[hsl(214_60%_15%)] text-white py-12 px-4">
      <Helmet>
        <title>Tu entrada — MoodleMoot Perú 2026</title>
        <meta name="description" content="Tu entrada digital para MoodleMoot Perú 2026. Presenta el código QR en el ingreso del evento, 18 y 19 de septiembre en Lima." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`https://moodlemootperu.com/ticket/${ticketId ?? ""}`} />
        <meta property="og:title" content="Tu entrada — MoodleMoot Perú 2026" />
        <meta property="og:description" content="Entrada digital para MoodleMoot Perú 2026. 18 y 19 de septiembre · Lima." />
        <meta property="og:url" content={`https://moodlemootperu.com/ticket/${ticketId ?? ""}`} />
      </Helmet>
      <h1 className="sr-only">Tu entrada al evento MoodleMoot Perú 2026</h1>
      <div className="max-w-xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>


        <div className="bg-white text-brand-ink rounded-3xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]">
          <div className="bg-brand-ink text-white p-6">
            <div className="text-xs uppercase tracking-[0.25em] opacity-70">Tu entrada</div>
            <div className="font-display text-2xl font-bold mt-1">MoodleMoot Perú 2026</div>
            <div className="text-sm text-white/70 mt-1">18 — 19 Septiembre · Lima</div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-orange mx-auto" />
              <p className="mt-3 text-brand-ink/60">Cargando tu ticket…</p>
            </div>
          ) : error || !data ? (
            <div className="p-10 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <h2 className="font-display text-xl font-bold mt-3">No encontramos tu ticket</h2>
              <p className="text-brand-ink/65 mt-1">{error ?? "Verifica el enlace."}</p>
            </div>
          ) : data.payment_status !== "paid" ? (
            <div className="p-10 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <h2 className="font-display text-xl font-bold mt-3">Pago pendiente</h2>
              <p className="text-brand-ink/65 mt-1">
                Aún estamos confirmando tu pago. Recarga esta página en unos segundos.
              </p>
            </div>
          ) : (
            <div className="p-8">
              {/* Nodo imprimible para descarga PNG */}
              <div ref={printableRef} className="bg-white p-6 rounded-2xl border border-black/5">
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-brand-ink/55">MoodleMoot Perú 2026</div>
                  <div className="font-display text-lg font-bold mt-1">{data.full_name}</div>
                  <div className="text-xs text-brand-ink/55 mt-0.5">{categoryLabel(data.category)} · 18–19 Sep · Lima</div>
                </div>
                {data.qr_data_url && (
                  <img src={data.qr_data_url} alt={`QR ${data.ticket_id}`} className="w-56 h-56 mx-auto mt-4" />
                )}
                <div className="mt-3 font-mono text-lg font-bold tracking-widest text-center">{data.ticket_id}</div>
                <div className="text-[11px] text-brand-ink/55 text-center mt-1">Presenta este QR en la entrada</div>
              </div>

              <dl className="mt-6 space-y-2 text-sm">
                <Row label="Email" value={data.email_masked} />
                <Row label="Monto pagado" value={`USD ${data.amount_paid.toFixed(2)}`} />
                {data.coupon_code && <Row label="Cupón" value={data.coupon_code} />}
              </dl>

              <Button
                onClick={downloadPng}
                disabled={downloading}
                className="w-full mt-6 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full h-11"
              >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Descargar ticket (PNG)
              </Button>

              {/* Guía de uso */}
              <div className="mt-8 border-t border-black/10 pt-6">
                <h3 className="font-display text-base font-bold mb-3">¿Cómo usar tu ticket?</h3>
                <ol className="space-y-3 text-sm text-brand-ink/75">
                  <Step icon={Download} text="Descarga y guarda el PNG en tu celular o imprímelo." />
                  <Step icon={QrCode} text="Presenta el código QR en el ingreso del evento para validar tu acceso." />
                  <Step icon={BadgeCheck} text="Recibe tu carné físico y disfruta MoodleMoot Perú 2026." />
                </ol>
                <p className="mt-5 text-xs text-brand-ink/55 inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Lima, Perú · 18 y 19 de septiembre 2026
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4 py-1.5 border-b border-black/5 last:border-0">
    <dt className="text-brand-ink/60">{label}</dt>
    <dd className="font-medium text-right">{value}</dd>
  </div>
);

const Step = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <li className="flex items-start gap-3">
    <span className="mt-0.5 w-7 h-7 rounded-full bg-brand-orange/15 text-brand-orange inline-flex items-center justify-center shrink-0">
      <Icon className="w-3.5 h-3.5" />
    </span>
    <span>{text}</span>
  </li>
);

export default Ticket;

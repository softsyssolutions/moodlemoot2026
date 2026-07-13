import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2, CheckCircle2, X, Send, Star, FileText } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRY_DIAL_CODES } from "@/data/countryDialCodes";
import { supabase } from "@/integrations/supabase/client";
import { useActiveEvent } from "@/hooks/useActiveEvent";
import { useTranslation } from "@/i18n/LanguageContext";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(120),
  position: z.string().trim().min(2, "Cargo requerido").max(160),
  company: z.string().trim().min(2, "Empresa requerida").max(200),
  email: z.string().trim().email("Email inválido").max(255),
  phone: z.string().trim().min(5, "Teléfono inválido").max(40),
  reason: z.string().trim().min(20, "Cuéntanos un poco más (mínimo 20 caracteres)").max(2000),
});

const emptyForm = {
  name: "",
  position: "",
  company: "",
  email: "",
  dial: "51",
  phoneLocal: "",
  reason: "",
};

const fieldCls =
  "bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus-visible:ring-[#F98012] focus-visible:ring-offset-0";
const labelCls = "text-slate-700 font-semibold text-sm mb-1.5 inline-flex items-center gap-1";
const required = <span className="text-red-500">*</span>;

export default function SponsorProposalModal() {
  const { event } = useActiveEvent();
  const { locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const handler = () => {
      setForm(emptyForm);
      setDone(false);
      setOpen(true);
    };
    window.addEventListener("open-sponsor-proposal", handler);
    return () => window.removeEventListener("open-sponsor-proposal", handler);
  }, []);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setForm(emptyForm);
      setDone(false);
    }, 250);
  };

  const submit = async () => {
    const phone = `+${form.dial} ${form.phoneLocal.trim()}`;
    const payload = {
      name: form.name.trim(),
      position: form.position.trim(),
      company: form.company.trim(),
      email: form.email.trim().toLowerCase(),
      phone,
      reason: form.reason.trim(),
    };
    const r = schema.safeParse(payload);
    if (!r.success) {
      toast.error(r.error.errors[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("sponsor_proposals").insert({
      ...payload,
      event_id: event?.id ?? null,
      locale,
    });
    setBusy(false);
    if (error) {
      toast.error("No se pudo enviar tu solicitud. Inténtalo de nuevo.");
      return;
    }
    setDone(true);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-0 w-[calc(100%-1rem)] sm:w-full">
        {/* Header */}
        <div className="relative px-5 sm:px-7 pt-6 sm:pt-7 pb-5 bg-gradient-to-br from-[#002B5B] to-[#0B1631] text-white">
          <button
            onClick={close}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-[#F98012]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#F98012] font-bold">
              Quiero ser sponsor
            </span>
          </div>
          <h2 className="font-display font-black text-2xl md:text-3xl leading-tight">
            {done ? "¡Solicitud recibida!" : "Sé parte del MoodleMoot Perú 2026"}
          </h2>
          {!done && (
            <p className="text-white/70 text-sm mt-2 max-w-lg">
              Cuéntanos sobre tu empresa y te enviaremos los planes de patrocinio con tarifas, beneficios y alcance del evento.
            </p>
          )}
        </div>

        {/* Body */}
        <div className="px-5 sm:px-7 py-6 max-h-[70vh] overflow-y-auto bg-white">
          {!done && (
            <>
              {/* Brochure placeholder */}
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-[#F98012]/30 bg-[#F98012]/5 p-3 text-slate-700">
                <FileText className="w-5 h-5 text-[#F98012] mt-0.5 shrink-0" />
                <div className="text-sm">
                  <span className="font-semibold text-[#002B5B]">Brochure de sponsors próximamente.</span>{" "}
                  Apenas esté listo te lo enviaremos con tarifas, beneficios y los distintos niveles de patrocinio.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className={labelCls}>Nombre completo {required}</Label>
                  <Input className={fieldCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ej. Ana Martínez" />
                </div>
                <div>
                  <Label className={labelCls}>Cargo {required}</Label>
                  <Input className={fieldCls} value={form.position} onChange={(e) => set("position", e.target.value)} placeholder="Ej. Gerente Comercial" />
                </div>
                <div>
                  <Label className={labelCls}>Empresa {required}</Label>
                  <Input className={fieldCls} value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Ej. Tu Empresa S.A.C." />
                </div>
                <div className="md:col-span-2">
                  <Label className={labelCls}>Email corporativo {required}</Label>
                  <Input className={fieldCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="tu@empresa.com" />
                </div>
                <div className="md:col-span-2">
                  <Label className={labelCls}>WhatsApp {required}</Label>
                  <div className="flex gap-2">
                    <Select value={form.dial} onValueChange={(v) => set("dial", v)}>
                      <SelectTrigger className={`${fieldCls} w-[140px]`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {COUNTRY_DIAL_CODES.map((c) => (
                          <SelectItem key={`${c.code}-${c.dial}`} value={c.dial}>
                            {c.flag} +{c.dial} {locale === "es" ? c.name_es : c.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      className={`${fieldCls} flex-1`}
                      value={form.phoneLocal}
                      onChange={(e) => set("phoneLocal", e.target.value.replace(/[^\d\s]/g, ""))}
                      placeholder="999 999 999"
                      inputMode="tel"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label className={labelCls}>¿Por qué quieres ser sponsor? {required}</Label>
                  <Textarea
                    className={fieldCls}
                    rows={5}
                    value={form.reason}
                    onChange={(e) => set("reason", e.target.value)}
                    placeholder="Cuéntanos qué tipo de patrocinio te interesa, tus objetivos y qué buscas lograr en el evento."
                  />
                  <div className="text-xs text-slate-500 mt-1">{form.reason.length}/2000</div>
                </div>
              </div>
            </>
          )}

          {done && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="font-display font-black text-2xl text-[#002B5B] mb-2">
                ¡Gracias por tu interés!
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Hemos recibido tu solicitud. Nuestro equipo comercial se pondrá en contacto contigo muy pronto con los planes de patrocinio.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!done ? (
          <div className="px-5 sm:px-7 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={close}
              disabled={busy}
              className="text-slate-700 hover:text-slate-900 hover:bg-slate-200"
            >
              Cancelar
            </Button>
            <Button
              onClick={submit}
              disabled={busy}
              className="bg-[#F98012] hover:bg-[#F98012]/90 text-white"
            >
              {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Enviar solicitud
            </Button>
          </div>
        ) : (
          <div className="px-5 sm:px-7 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
            <Button onClick={close} className="bg-[#002B5B] hover:bg-[#002B5B]/90 text-white">
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

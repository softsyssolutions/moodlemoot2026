import { useState, useMemo } from "react";
import { Loader2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { COUNTRY_DIAL_CODES, DEFAULT_DIAL_COUNTRY } from "@/data/countryDialCodes";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

type Status = "idle" | "loading" | "success";

const initialForm = {
  full_name: "",
  email: "",
  whatsapp_country: DEFAULT_DIAL_COUNTRY, // ISO code
  whatsapp_number: "",                    // local digits only
  role_title: "",
  institution: "",
  institution_type: "",
  attendance_type: "",
  country: "",
  city: "",
  consent: false,
};

const EventRegistrationModal = ({ open, onOpenChange }: Props) => {
  const { locale } = useTranslation();
  const { toast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<Status>("idle");

  const es = locale === "es";
  const t = (esTxt: string, enTxt: string) => (es ? esTxt : enTxt);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const close = () => {
    onOpenChange(false);
    setTimeout(() => {
      setForm(initialForm);
      setStatus("idle");
    }, 250);
  };

  const dialCountry = useMemo(
    () => COUNTRY_DIAL_CODES.find((c) => c.code === form.whatsapp_country) ?? COUNTRY_DIAL_CODES[0],
    [form.whatsapp_country],
  );
  const whatsappE164 = `+${dialCountry.dial}${form.whatsapp_number.replace(/\D/g, "")}`;

  const validate = (): string | null => {
    if (form.full_name.trim().length < 2) return t("Ingresa tu nombre completo", "Enter your full name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return t("Email inválido", "Invalid email");
    if (!/^\+\d{8,15}$/.test(whatsappE164))
      return t(
        "Ingresa un número de WhatsApp válido (8 a 15 dígitos).",
        "Enter a valid WhatsApp number (8 to 15 digits).",
      );
    if (form.role_title.trim().length < 2) return t("Ingresa tu cargo", "Enter your role");
    if (form.institution.trim().length < 2) return t("Ingresa tu institución", "Enter your institution");
    if (!form.institution_type) return t("Selecciona el tipo de institución", "Select institution type");
    if (!form.attendance_type) return t("Selecciona el tipo de asistencia", "Select attendance type");
    if (form.country.trim().length < 2) return t("Ingresa tu país", "Enter your country");
    if (form.city.trim().length < 2) return t("Ingresa tu ciudad", "Enter your city");
    if (!form.consent) return t("Debes aceptar las comunicaciones", "You must accept communications");
    return null;
  };

  // Force light styling on form controls regardless of the global theme,
  // because the modal surface is always white.
  const inputCls =
    "bg-white text-brand-ink placeholder:text-brand-ink/40 border-black/15 focus-visible:ring-brand-orange/40";
  const selectTriggerCls =
    "bg-white text-brand-ink border-black/15 focus:ring-brand-orange/40 [&>span]:text-brand-ink";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast({ title: t("Revisa el formulario", "Check the form"), description: err, variant: "destructive" });
      return;
    }
    setStatus("loading");
    try {
      const { error } = await supabase.functions.invoke("register-event", {
        body: {
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          whatsapp: whatsappE164,
          whatsapp_country_code: dialCountry.code,
          whatsapp_dial_code: dialCountry.dial,
          role_title: form.role_title.trim(),
          institution: form.institution.trim(),
          institution_type: form.institution_type,
          attendance_type: form.attendance_type,
          country: form.country.trim(),
          city: form.city.trim(),
          consent: form.consent,
        },
      });
      if (error) throw error;
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("idle");
      toast({
        title: t("No pudimos completar tu registro", "We couldn't complete your registration"),
        description: t("Inténtalo en unos segundos.", "Please try again in a few seconds."),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (status === "loading" ? null : v ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-[560px] max-h-[92vh] overflow-y-auto p-0 gap-0 bg-white text-brand-ink rounded-2xl border border-black/10">
        {status === "success" ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-brand-orange/15 flex items-center justify-center mb-4">
              <Check className="w-7 h-7 text-brand-orange" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-3">
              {t("¡Inscripción registrada!", "Registration received!")}
            </h3>
            <p className="text-brand-ink/75 leading-relaxed mb-2">
              {t(
                "Te enviaremos un correo de confirmación con todos los detalles del evento.",
                "We'll send you a confirmation email with all the event details.",
              )}
            </p>
            <p className="text-sm text-brand-ink/60 mb-6">
              {t(
                "Si no lo encuentras en tu bandeja de entrada, revisa la carpeta de spam o correo no deseado.",
                "If you don't see it in your inbox, please check your spam or junk folder.",
              )}
            </p>
            <Button onClick={close} className="bg-brand-ink text-white hover:bg-brand-ink/90 h-11 px-8 rounded-full">
              {t("Cerrar", "Close")}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="p-6 pb-2 text-left">
              <DialogTitle className="font-display text-2xl font-bold tracking-tight">
                {t("Regístrate al evento", "Register for the event")}
              </DialogTitle>
              <DialogDescription className="text-brand-ink/65">
                {t(
                  "Completa tus datos para asegurar tu participación.",
                  "Fill in your details to confirm your participation.",
                )}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="p-6 pt-4 space-y-4">
              <Field label={t("Nombre completo", "Full name")}>
                <Input className={inputCls} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} disabled={status === "loading"} />
              </Field>
              <Field label="Email">
                <Input className={inputCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} disabled={status === "loading"} />
              </Field>
              <Field label={t("WhatsApp", "WhatsApp")}>
                <div className="flex gap-2">
                  <Select
                    value={form.whatsapp_country}
                    onValueChange={(v) => set("whatsapp_country", v)}
                    disabled={status === "loading"}
                  >
                    <SelectTrigger className={`w-[150px] shrink-0 ${selectTriggerCls}`}>
                      <SelectValue>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="text-base leading-none">{dialCountry.flag}</span>
                          <span className="font-mono text-sm">+{dialCountry.dial}</span>
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-72 bg-white text-brand-ink">
                      {COUNTRY_DIAL_CODES.map((c) => (
                        <SelectItem key={c.code} value={c.code} className="text-brand-ink focus:bg-brand-orange/10 focus:text-brand-ink">
                          <span className="inline-flex items-center gap-2">
                            <span className="text-base leading-none">{c.flag}</span>
                            <span>{es ? c.name_es : c.name_en}</span>
                            <span className="font-mono text-xs text-brand-ink/55">+{c.dial}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder={t("Número sin código país", "Number without country code")}
                    value={form.whatsapp_number}
                    onChange={(e) => set("whatsapp_number", e.target.value.replace(/\D/g, "").slice(0, 14))}
                    disabled={status === "loading"}
                    className={`flex-1 ${inputCls}`}
                  />
                </div>
                <p className="mt-1 text-xs text-brand-ink/55 font-mono">
                  {t("Se enviará como", "Will be sent as")}: {whatsappE164}
                </p>
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={t("Cargo / rol", "Role / position")}>
                  <Input className={inputCls} value={form.role_title} onChange={(e) => set("role_title", e.target.value)} disabled={status === "loading"} />
                </Field>
                <Field label={t("Institución", "Institution")}>
                  <Input className={inputCls} value={form.institution} onChange={(e) => set("institution", e.target.value)} disabled={status === "loading"} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={t("Tipo de institución", "Institution type")}>
                  <Select value={form.institution_type} onValueChange={(v) => set("institution_type", v)} disabled={status === "loading"}>
                    <SelectTrigger className={selectTriggerCls}><SelectValue placeholder={t("Selecciona…", "Select…")} /></SelectTrigger>
                    <SelectContent className="bg-white text-brand-ink">
                      <SelectItem value="privada" className="text-brand-ink focus:bg-brand-orange/10 focus:text-brand-ink">{t("Privada", "Private")}</SelectItem>
                      <SelectItem value="publica" className="text-brand-ink focus:bg-brand-orange/10 focus:text-brand-ink">{t("Pública", "Public")}</SelectItem>
                      <SelectItem value="universidad" className="text-brand-ink focus:bg-brand-orange/10 focus:text-brand-ink">{t("Universidad", "University")}</SelectItem>
                      <SelectItem value="otra" className="text-brand-ink focus:bg-brand-orange/10 focus:text-brand-ink">{t("Otra", "Other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={t("Tipo de asistencia", "Attendance type")}>
                  <Select value={form.attendance_type} onValueChange={(v) => set("attendance_type", v)} disabled={status === "loading"}>
                    <SelectTrigger className={selectTriggerCls}><SelectValue placeholder={t("Selecciona…", "Select…")} /></SelectTrigger>
                    <SelectContent className="bg-white text-brand-ink">
                      <SelectItem value="presencial" className="text-brand-ink focus:bg-brand-orange/10 focus:text-brand-ink">{t("Presencial", "In-person")}</SelectItem>
                      <SelectItem value="virtual" className="text-brand-ink focus:bg-brand-orange/10 focus:text-brand-ink">{t("Virtual", "Virtual")}</SelectItem>
                      <SelectItem value="hibrido" className="text-brand-ink focus:bg-brand-orange/10 focus:text-brand-ink">{t("Híbrido", "Hybrid")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={t("País", "Country")}>
                  <Input className={inputCls} value={form.country} onChange={(e) => set("country", e.target.value)} disabled={status === "loading"} />
                </Field>
                <Field label={t("Ciudad", "City")}>
                  <Input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} disabled={status === "loading"} />
                </Field>
              </div>

              <label className="flex items-start gap-3 pt-2 cursor-pointer select-none">
                <Checkbox
                  checked={form.consent}
                  onCheckedChange={(v) => set("consent", v === true)}
                  disabled={status === "loading"}
                  className="mt-0.5"
                />
                <span className="text-sm text-brand-ink/75 leading-snug">
                  {t(
                    "Acepto recibir comunicaciones del evento por correo electrónico y WhatsApp.",
                    "I agree to receive event communications via email and WhatsApp.",
                  )}
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={close} disabled={status === "loading"}>
                  {t("Cancelar", "Cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-brand-orange text-white hover:bg-brand-orange/90 h-11 px-6 rounded-full font-semibold"
                >
                  {status === "loading" ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("Enviando…", "Sending…")}</>
                  ) : (
                    t("Enviar inscripción", "Submit registration")
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-brand-ink/85">{label}</Label>
    {children}
  </div>
);

export default EventRegistrationModal;

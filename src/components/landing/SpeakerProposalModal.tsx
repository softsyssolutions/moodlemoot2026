import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Loader2, CheckCircle2, X, ArrowRight, ArrowLeft, Mic, Clock, Info, Cpu, GraduationCap, Settings2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { supabase } from "@/integrations/supabase/client";
import { useActiveEvent } from "@/hooks/useActiveEvent";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Eje = "tecnologias_emergentes" | "experiencias_aprendizaje" | "nuevos_modelos_gestion";

const EJES: { value: Eje; title: string; icon: React.ElementType; accent: string; subtopics: string[] }[] = [
  {
    value: "tecnologias_emergentes",
    title: "Tecnologías Emergentes",
    icon: Cpu,
    accent: "#F98012",
    subtopics: [
      "Arquitectura de IA Local y Privacidad (LLM en el LMS)",
      "Integración de Realidad Extendida (XR) en Moodle",
      "Automatización de evaluaciones con IA",
    ],
  },
  {
    value: "experiencias_aprendizaje",
    title: "Experiencias de Aprendizaje",
    icon: GraduationCap,
    accent: "#002B5B",
    subtopics: [
      "Personalización del aprendizaje",
      "Engagement estudiantil 3.0 (gamificación, sentimientos)",
      "Lifelong Learning y microcredenciales",
    ],
  },
  {
    value: "nuevos_modelos_gestion",
    title: "Nuevos Modelos de Gestión",
    icon: Settings2,
    accent: "#0B1631",
    subtopics: [
      "Gobernanza y operación de plataformas educativas",
      "Analítica institucional y toma de decisiones",
      "Sostenibilidad y escalamiento de programas digitales",
    ],
  },
];

const step1Schema = z.object({
  nombre_completo: z.string().trim().min(2, "Nombre muy corto").max(120),
  email: z.string().trim().email("Email inválido").max(255),
  whatsapp: z.string().trim().min(5, "WhatsApp inválido").max(40),
  pais: z.string().trim().min(2, "País requerido").max(80),
});

const step2Schema = z.object({
  cargo: z.string().trim().min(2, "Cargo requerido").max(160),
  institucion_empresa: z.string().trim().min(2, "Institución requerida").max(200),
  eje_tematico: z.enum(["tecnologias_emergentes", "experiencias_aprendizaje", "nuevos_modelos_gestion"], {
    required_error: "Selecciona un eje temático",
  }),
  titulo_ponencia: z.string().trim().min(4, "Título muy corto").max(240),
  resumen_abstract: z.string().trim().min(20, "Mínimo 20 caracteres").max(4000, "Máximo 4000 caracteres"),
  modalidad: z.enum(["presencial", "virtual"], { required_error: "Selecciona una modalidad" }),
  enlace_respaldo: z.string().trim().max(500).url("URL inválida").optional().or(z.literal("")),
});

const emptyForm = {
  nombre_completo: "",
  email: "",
  whatsapp: "",
  pais: "",
  cargo: "",
  institucion_empresa: "",
  eje_tematico: "" as "" | Eje,
  titulo_ponencia: "",
  resumen_abstract: "",
  modalidad: "" as "" | "presencial" | "virtual",
  enlace_respaldo: "",
};

// Estilos uniformes para inputs claros (el tema global es oscuro)
const fieldCls =
  "bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus-visible:ring-[#F98012] focus-visible:ring-offset-0";
const labelCls = "text-slate-700 font-semibold text-sm mb-1.5 inline-flex items-center gap-1";
const required = <span className="text-red-500">*</span>;

export default function SpeakerProposalModal() {
  const { event } = useActiveEvent();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [tappedEje, setTappedEje] = useState<Eje | null>(null);
  const tapTimer = useRef<number | null>(null);

  const handleEjeSelect = (val: Eje) => {
    set("eje_tematico", val);
    setTappedEje(val);
    if (tapTimer.current) window.clearTimeout(tapTimer.current);
    tapTimer.current = window.setTimeout(() => setTappedEje(null), 3000);
  };


  useEffect(() => {
    const handler = () => {
      setForm(emptyForm);
      setStep(1);
      setOpen(true);
    };
    window.addEventListener("open-speaker-proposal", handler);
    return () => window.removeEventListener("open-speaker-proposal", handler);
  }, []);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const next = () => {
    if (step === 1) {
      const r = step1Schema.safeParse(form);
      if (!r.success) return toast.error(r.error.errors[0].message);
      setStep(2);
    } else if (step === 2) {
      const r = step2Schema.safeParse(form);
      if (!r.success) return toast.error(r.error.errors[0].message);
      submit();
    }
  };

  const submit = async () => {
    setBusy(true);
    const payload = {
      event_id: event?.id ?? null,
      nombre_completo: form.nombre_completo.trim(),
      email: form.email.trim().toLowerCase(),
      whatsapp: form.whatsapp.trim(),
      pais: form.pais.trim(),
      cargo: form.cargo.trim(),
      institucion_empresa: form.institucion_empresa.trim(),
      eje_tematico: form.eje_tematico as Eje,
      titulo_ponencia: form.titulo_ponencia.trim(),
      resumen_abstract: form.resumen_abstract.trim(),
      modalidad: form.modalidad as "presencial" | "virtual",
      enlace_respaldo: form.enlace_respaldo.trim() || null,
    };
    const { error } = await supabase.from("speaker_proposals").insert(payload);
    if (error) {
      setBusy(false);
      toast.error("No se pudo enviar tu postulación. Inténtalo de nuevo.");
      return;
    }
    // Envío de correo de confirmación (no bloquea el éxito si falla)
    try {
      await supabase.functions.invoke("send-speaker-proposal-confirmation", {
        body: {
          email: payload.email,
          nombre_completo: payload.nombre_completo,
          titulo_ponencia: payload.titulo_ponencia,
        },
      });
    } catch (e) {
      console.error("Error enviando correo de confirmación", e);
    }
    setBusy(false);
    setStep(3);
  };

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setForm(emptyForm);
      setStep(1);
    }, 250);
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
            <Mic className="w-4 h-4 text-[#F98012]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#F98012] font-bold">
              Postulación de Speaker
            </span>
          </div>
          <h2 className="font-display font-black text-2xl md:text-3xl leading-tight">
            {step === 3 ? "¡Postulación recibida!" : "Comparte tu propuesta"}
          </h2>

          {step === 1 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-[#F98012]/20 border border-[#F98012]/40 text-[#FFD9B8] text-xs px-3 py-1.5 rounded-md">
              <Clock className="w-3.5 h-3.5" />
              Cupos por eje temático limitados. Postula lo antes posible.
            </div>
          )}

          {step !== 3 && (
            <div className="mt-5 flex items-center gap-2">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    step >= (n as 1 | 2) ? "bg-[#F98012]" : "bg-white/20"
                  }`}
                />
              ))}
              <span className="ml-2 text-xs text-white/70 font-mono">{step}/2</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-5 sm:px-7 py-6 max-h-[70vh] overflow-y-auto bg-white">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className={labelCls}>Nombre completo {required}</Label>
                <Input className={fieldCls} value={form.nombre_completo} onChange={(e) => set("nombre_completo", e.target.value)} placeholder="Ej. Ana Martínez" />
              </div>
              <div>
                <Label className={labelCls}>Email {required}</Label>
                <Input className={fieldCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="tu@correo.com" />
              </div>
              <div>
                <Label className={labelCls}>WhatsApp {required}</Label>
                <Input className={fieldCls} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+51 999 999 999" />
              </div>
              <div className="md:col-span-2">
                <Label className={labelCls}>País {required}</Label>
                <Input className={fieldCls} value={form.pais} onChange={(e) => set("pais", e.target.value)} placeholder="Perú" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className={labelCls}>Cargo {required}</Label>
                <Input className={fieldCls} value={form.cargo} onChange={(e) => set("cargo", e.target.value)} placeholder="Ej. Directora de innovación" />
              </div>
              <div>
                <Label className={labelCls}>Institución / Empresa {required}</Label>
                <Input className={fieldCls} value={form.institucion_empresa} onChange={(e) => set("institucion_empresa", e.target.value)} placeholder="Ej. Universidad XYZ" />
              </div>

              {/* Eje temático */}
              <div className="md:col-span-2">
                <Label className={labelCls}>
                  Eje temático {required}
                  <span className="text-xs font-normal text-slate-500 ml-1 hidden sm:inline">(pasa el cursor para ver el detalle)</span>
                  <span className="text-xs font-normal text-slate-500 ml-1 sm:hidden">(toca cada tarjeta para ver el detalle)</span>
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                  {EJES.map((e) => {
                    const Icon = e.icon;
                    const selected = form.eje_tematico === e.value;
                    return (
                      <HoverCard key={e.value} openDelay={80} closeDelay={60}>
                        <HoverCardTrigger asChild>
                          <div
                            onClick={() => handleEjeSelect(e.value)}
                            className={cn(
                              "relative cursor-pointer rounded-xl border-2 p-3 transition-all",
                              selected
                                ? "border-[#F98012] bg-orange-50 ring-2 ring-[#F98012]/40 shadow-lg scale-[1.02]"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md",
                            )}
                          >
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 pointer-events-none">
                              <Info className="w-3.5 h-3.5" />
                            </div>
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center mb-2 transition-transform"
                              style={{
                                background: selected ? e.accent : `${e.accent}15`,
                                color: selected ? "#fff" : e.accent,
                              }}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className={cn("font-bold text-sm leading-tight pr-6", selected ? "text-[#F98012]" : "text-[#002B5B]")}>
                              {e.title}
                            </div>
                            {selected && (
                              <div className="absolute bottom-2 right-2 text-[#F98012]">
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                            )}

                            {/* Detalle inline para móvil (aparece al tocar y se oculta solo) */}
                            {tappedEje === e.value && (
                              <div className="sm:hidden mt-3 pt-3 border-t border-slate-200 animate-in fade-in slide-in-from-top-1">
                                <ul className="text-[11px] leading-snug space-y-1 list-disc pl-4 text-slate-700">
                                  {e.subtopics.map((s) => <li key={s}>{s}</li>)}
                                </ul>
                              </div>
                            )}

                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent side="top" className="w-72 bg-white border-slate-200 text-slate-800 z-[100] hidden sm:block">
                          <div className="font-bold text-[#002B5B] text-sm mb-2">{e.title}</div>
                          <ul className="text-xs space-y-1.5 list-disc pl-4 text-slate-700">
                            {e.subtopics.map((s) => <li key={s}>{s}</li>)}
                          </ul>
                        </HoverCardContent>
                      </HoverCard>

                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2">
                <Label className={labelCls}>Título de la ponencia {required}</Label>
                <Input className={fieldCls} value={form.titulo_ponencia} onChange={(e) => set("titulo_ponencia", e.target.value)} placeholder="Ej. IA aplicada al aula digital" />
              </div>
              <div className="md:col-span-2">
                <Label className={labelCls}>Resumen / Abstract {required}</Label>
                <Textarea
                  className={fieldCls}
                  rows={6}
                  value={form.resumen_abstract}
                  onChange={(e) => set("resumen_abstract", e.target.value)}
                  placeholder="Describe brevemente tu propuesta, objetivos y aportes. Puedes copiar y pegar tu resumen (20–4000 caracteres)."
                />
                <div className="text-xs text-slate-500 mt-1">{form.resumen_abstract.length}/4000</div>
              </div>
              <div className="md:col-span-2">
                <Label className={labelCls}>Modalidad {required}</Label>
                <RadioGroup
                  className="flex gap-6 mt-2"
                  value={form.modalidad}
                  onValueChange={(v) => set("modalidad", v)}
                >
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                    <RadioGroupItem value="presencial" id="mod-pres" className="border-slate-400 text-[#F98012]" />
                    <span>Presencial</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                    <RadioGroupItem value="virtual" id="mod-virt" className="border-slate-400 text-[#F98012]" />
                    <span>Virtual</span>
                  </label>
                </RadioGroup>
              </div>
              <div className="md:col-span-2">
                <Label className={labelCls}>Enlace de respaldo</Label>
                <Input
                  className={fieldCls}
                  value={form.enlace_respaldo}
                  onChange={(e) => set("enlace_respaldo", e.target.value)}
                  placeholder="https://..."
                />
                <div className="text-xs text-slate-500 mt-1">
                  Opcional. Pega un enlace de Drive, YouTube, presentación o portafolio que respalde tu propuesta.
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="font-display font-black text-2xl text-[#002B5B] mb-2">
                ¡Gracias por postular!
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Hemos recibido tu propuesta. Nuestro comité académico la revisará y nos pondremos en contacto contigo al correo proporcionado.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 3 && (
          <div className="px-5 sm:px-7 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => (step === 1 ? close() : setStep(1))}
              disabled={busy}
              className="text-slate-700 hover:text-slate-900 hover:bg-slate-200"
            >
              {step === 1 ? "Cancelar" : (<><ArrowLeft className="w-4 h-4 mr-2" /> Atrás</>)}
            </Button>
            <Button
              onClick={next}
              disabled={busy}
              className="bg-[#F98012] hover:bg-[#F98012]/90 text-white"
            >
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {step === 2 ? "Enviar postulación" : (<>Continuar <ArrowRight className="w-4 h-4 ml-2" /></>)}
            </Button>
          </div>
        )}
        {step === 3 && (
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

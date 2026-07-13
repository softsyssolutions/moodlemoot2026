import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Loader2, Check, Ticket as TicketIcon, Upload, Tag, X, AlertTriangle, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { COUNTRY_DIAL_CODES, DEFAULT_DIAL_COUNTRY } from "@/data/countryDialCodes";
import { checkEmail } from "@/lib/emailValidation";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };
type Step = "form" | "pay" | "processing" | "success";

const BASE_PRICE = 157;

// Promo de lanzamiento — se aplica automáticamente al abrir el modal.
// Para cambiar de fase (50%, 30%), crear el cupón en la tabla `coupons` y actualizar aquí.
const PROMO_CODE = "LANZAMIENTO70";
const PROMO_DISCOUNT_LABEL = "70% OFF";
// Cupón para sector educativo (100% OFF + carné obligatorio). Verificación posterior por admin.
const EDU_PROMO_CODE = "EDUMMOOTPE26100";

const initialForm = {
  full_name: "",
  email: "",
  whatsapp_country: DEFAULT_DIAL_COUNTRY,
  whatsapp_number: "",
  role_title: "",
  institution: "",
  institution_type: "",
  attendance_type: "",
  country: "",
  city: "",
  consent: false,
  coupon_code: "",
};

declare global {
  interface Window { paypal?: any }
}

let paypalSdkPromise: Promise<any> | null = null;
async function loadPayPal(): Promise<any> {
  if (window.paypal) return window.paypal;
  if (paypalSdkPromise) return paypalSdkPromise;
  paypalSdkPromise = (async () => {
    const { data } = await supabase.functions.invoke("paypal-config");
    if (!data?.clientId) throw new Error("PayPal no configurado");
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(data.clientId)}&currency=USD&intent=capture&disable-funding=paylater,credit`;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("No se pudo cargar PayPal"));
      document.body.appendChild(s);
    });
    return window.paypal;
  })();
  return paypalSdkPromise;
}

const PurchaseTicketModal = ({ open, onOpenChange }: Props) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState<Step>("form");

  // Coupon
  const [couponState, setCouponState] = useState<{
    status: "idle" | "checking" | "valid" | "invalid";
    discount?: number;
    total?: number;
    category?: string;
    requires_id_card?: boolean;
    reason?: string;
  }>({ status: "idle" });
  const [idFilePath, setIdFilePath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [duplicateEmailError, setDuplicateEmailError] = useState(false);
  const [eduMode, setEduMode] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);

  // Order state
  const [orderInfo, setOrderInfo] = useState<{
    registration_id?: string;
    ticket_id?: string;
    paypal_order_id?: string;
    total: number;
    free: boolean;
    category?: string;
    event_id?: string | null;
    coupon_code?: string | null;
    registrationPayload?: Record<string, unknown>;
  } | null>(null);
  const paypalContainerRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Auto-aplicar promo de lanzamiento (o ?coupon=CODE de la URL) al abrir
  useEffect(() => {
    if (!open) return;
    let codeToApply = PROMO_CODE;
    try {
      const params = new URLSearchParams(window.location.search);
      const c = params.get("coupon");
      if (c && c.trim()) codeToApply = c.trim().toUpperCase();
    } catch {
      // ignore
    }
    setForm((f) => (f.coupon_code ? f : { ...f, coupon_code: codeToApply }));
    // Validar el cupón automáticamente
    void autoApplyCoupon(codeToApply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    if (step === "processing") return;
    onOpenChange(false);
    setTimeout(() => {
      setForm(initialForm);
      setStep("form");
      setCouponState({ status: "idle" });
      setIdFilePath(null);
      setOrderInfo(null);
      setDuplicateEmailError(false);
      setEduMode(false);
      setShowCoupon(false);
    }, 250);
  };

  const enableEduMode = () => {
    setEduMode(true);
    setForm((f) => ({ ...f, coupon_code: EDU_PROMO_CODE }));
    void applyCouponCode(EDU_PROMO_CODE, { silent: true });
  };

  const disableEduMode = () => {
    setEduMode(false);
    setIdFilePath(null);
    setForm((f) => ({ ...f, coupon_code: PROMO_CODE }));
    void applyCouponCode(PROMO_CODE, { silent: true });
  };

  const dialCountry = useMemo(
    () => COUNTRY_DIAL_CODES.find((c) => c.code === form.whatsapp_country) ?? COUNTRY_DIAL_CODES[0],
    [form.whatsapp_country],
  );
  const whatsappE164 = `+${dialCountry.dial}${form.whatsapp_number.replace(/\D/g, "")}`;

  const total = couponState.status === "valid" ? couponState.total ?? BASE_PRICE : BASE_PRICE;
  const requiresIdCard = couponState.status === "valid" && !!couponState.requires_id_card;
  const isFree = total === 0;
  const isPromoAuto =
    couponState.status === "valid" && form.coupon_code.trim().toUpperCase() === PROMO_CODE;
  const hasDiscount = couponState.status === "valid" && (couponState.total ?? BASE_PRICE) < BASE_PRICE;

  const inputCls = "bg-white text-brand-ink placeholder:text-brand-ink/40 border-black/15 focus-visible:ring-brand-orange/40";
  const selectTriggerCls = "bg-white text-brand-ink border-black/15 focus:ring-brand-orange/40 [&>span]:text-brand-ink";

  const applyCouponCode = async (rawCode: string, opts?: { silent?: boolean }) => {
    const code = rawCode.trim();
    if (!code) {
      setCouponState({ status: "idle" });
      return;
    }
    setCouponState({ status: "checking" });
    try {
      const { data, error } = await supabase.functions.invoke("validate-coupon", { body: { code } });
      if (error) throw error;
      if (data?.valid) {
        setCouponState({
          status: "valid",
          discount: data.discount_percent,
          total: data.total,
          category: data.category,
          requires_id_card: data.requires_id_card,
        });
        if (!opts?.silent) {
          toast({
            title: "Cupón aplicado",
            description: `Total: USD ${Number(data.total).toFixed(2)}`,
          });
        }
      } else {
        setCouponState({ status: "invalid", reason: data?.reason ?? "not_found" });
      }
    } catch {
      setCouponState({ status: "invalid", reason: "error" });
    }
  };

  const checkCoupon = () => applyCouponCode(form.coupon_code);
  const autoApplyCoupon = (code: string) => applyCouponCode(code, { silent: true });

  const [idFileMeta, setIdFileMeta] = useState<{ name: string; size: number; type: string; previewUrl: string | null } | null>(null);
  const onIdFile = async (file: File | null) => {
    if (!file) return;

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    const ALLOWED_EXT = ["jpg", "jpeg", "png", "pdf"];
    const MAX_MB = 5;
    const sizeMB = file.size / (1024 * 1024);
    const ext = (file.name.includes(".") ? file.name.split(".").pop() : "").toLowerCase();

    // Empty file
    if (file.size === 0) {
      toast({
        title: "Archivo vacío",
        description: "El archivo seleccionado está vacío o dañado. Elige otro documento.",
        variant: "destructive",
      });
      return;
    }

    // Wrong format
    const okType = ALLOWED_TYPES.includes(file.type) && ALLOWED_EXT.includes(ext);
    if (!okType) {
      const detected = file.type || (ext ? `.${ext}` : "desconocido");
      toast({
        title: "Formato no admitido",
        description: `Recibimos "${file.name}" (${detected}). Solo se aceptan imágenes JPG, PNG o archivos PDF. Convierte tu documento e inténtalo de nuevo.`,
        variant: "destructive",
      });
      return;
    }

    // Too large
    if (file.size > MAX_MB * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: `Tu archivo pesa ${sizeMB.toFixed(1)} MB y el máximo permitido es ${MAX_MB} MB. Comprime el PDF, reduce la resolución de la foto o toma la imagen en menor calidad.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data, error } = await supabase.functions.invoke("upload-education-id", {
        body: fd,
      });

      // Try to extract server-side error message
      let serverMsg: string | null = null;
      if (error) {
        const ctx: any = (error as any).context;
        try {
          if (ctx?.json) {
            const j = await ctx.json();
            serverMsg = j?.error ?? null;
          } else if (ctx?.text) {
            const t = await ctx.text();
            try { serverMsg = JSON.parse(t)?.error ?? t; } catch { serverMsg = t; }
          }
        } catch { /* ignore */ }
        throw new Error(serverMsg ?? (error as any).message ?? "Error de red");
      }
      if (!data || (data as any).error) throw new Error((data as any)?.error ?? "Error al subir");

      setIdFilePath((data as any).path);
      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
      setIdFileMeta((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return { name: file.name, size: file.size, type: file.type, previewUrl };
      });
      toast({ title: "Carné cargado", description: "Documento recibido correctamente." });
    } catch (e: any) {
      const raw = String(e?.message ?? "");
      let title = "No pudimos subir el archivo";
      let description = raw || "Vuelve a intentarlo en unos segundos.";

      if (/failed to fetch|network|networkerror/i.test(raw)) {
        title = "Sin conexión";
        description = "No pudimos conectar con el servidor. Revisa tu internet y vuelve a intentarlo.";
      } else if (/5MB|> ?5|too large|demasiado|pesado/i.test(raw)) {
        title = "Archivo demasiado grande";
        description = `El máximo permitido es ${MAX_MB} MB. Comprime el PDF o reduce la resolución de la foto.`;
      } else if (/tipo no permitido|extensi|not allowed|mime|formato/i.test(raw)) {
        title = "Formato no admitido";
        description = "Solo se aceptan JPG, PNG o PDF. Convierte tu documento e inténtalo de nuevo.";
      } else if (/archivo requerido|required/i.test(raw)) {
        title = "Falta el archivo";
        description = "No se detectó ningún archivo. Selecciónalo de nuevo.";
      }

      toast({ title, description, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const emailCheck = useMemo(() => checkEmail(form.email), [form.email]);

  const validate = (): string | null => {
    if (form.full_name.trim().length < 2) return "Ingresa tu nombre completo";
    if (emailCheck.kind === "format") return emailCheck.message;
    if (emailCheck.kind === "hard") return emailCheck.message;
    if (!/^\+\d{8,15}$/.test(whatsappE164)) return "WhatsApp inválido (8 a 15 dígitos).";
    if (form.role_title.trim().length < 2) return "Ingresa tu cargo";
    if (form.institution.trim().length < 2) return "Ingresa tu institución";
    if (!form.institution_type) return "Selecciona tipo de institución";
    if (!form.attendance_type) return "Selecciona tipo de asistencia";
    if (form.country.trim().length < 2) return "Ingresa tu país";
    if (form.city.trim().length < 2) return "Ingresa tu ciudad";
    if (!form.consent) return "Debes aceptar las comunicaciones";
    if (requiresIdCard && !idFilePath) return "Sube tu carné para usar este cupón";
    return null;
  };

  const applyEmailSuggestion = () => {
    if (emailCheck.kind === "hard" || emailCheck.kind === "soft") {
      set("email", emailCheck.suggestion);
    }
  };

  const goToPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setDuplicateEmailError(false);
    const err = validate();
    if (err) {
      toast({ title: "Revisa el formulario", description: err, variant: "destructive" });
      return;
    }
    setStep("processing");
    // Recalcular SIEMPRE a partir del state actual para evitar valores stale
    const cleanDigits = form.whatsapp_number.replace(/\D/g, "");
    const finalWhatsapp = `+${dialCountry.dial}${cleanDigits}`;
    console.debug("[purchase] payload", {
      whatsapp: finalWhatsapp,
      attendance_type: form.attendance_type,
      institution_type: form.institution_type,
    });
    try {
      const registrationPayload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        whatsapp: finalWhatsapp,
        role_title: form.role_title.trim(),
        institution: form.institution.trim(),
        institution_type: form.institution_type,
        attendance_type: form.attendance_type,
        country: form.country.trim(),
        city: form.city.trim(),
        consent: form.consent,
        coupon_code: form.coupon_code.trim() || null,
        id_card_url: idFilePath,
      };
      const { data, error } = await supabase.functions.invoke("create-paypal-order", {
        body: registrationPayload,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setOrderInfo({
        registration_id: data.registration_id,
        ticket_id: data.ticket_id,
        paypal_order_id: data.paypal_order_id,
        total: data.total,
        free: !!data.free,
        category: data.category,
        event_id: data.event_id ?? null,
        coupon_code: data.coupon_code ?? null,
        registrationPayload,
      });
      if (data.free) {
        // Ya pagado/emitido en el backend
        setStep("success");
      } else {
        setStep("pay");
      }
    } catch (e: any) {
      console.error(e);
      setStep("form");
      const msg = String(e?.message ?? e ?? "").toLowerCase();
      const isDuplicate =
        msg.includes("duplicate") ||
        msg.includes("unique") ||
        msg.includes("event_id") ||
        msg.includes("23505") ||
        msg.includes("ya cuenta con un registro") ||
        msg.includes("already");
      if (isDuplicate) {
        setDuplicateEmailError(true);
      } else {
        toast({
          title: "No pudimos iniciar el pago",
          description: e?.message ?? "Intenta en unos segundos.",
          variant: "destructive",
        });
      }
    }
  };

  const renderButtons = useCallback(async () => {
    if (!orderInfo || orderInfo.free || !paypalContainerRef.current) return;
    const paypal = await loadPayPal();
    paypalContainerRef.current.innerHTML = "";
    paypal.Buttons({
      style: { layout: "vertical", shape: "pill", color: "gold", label: "pay" },
      createOrder: () => orderInfo.paypal_order_id,
      onApprove: async (data: any) => {
        setStep("processing");
        try {
          const { data: cap, error } = await supabase.functions.invoke("capture-paypal-order", {
            body: {
              order_id: data.orderID,
              registration: {
                ...orderInfo.registrationPayload,
                event_id: orderInfo.event_id,
                category: orderInfo.category,
                coupon_code: orderInfo.coupon_code,
              },
            },
          });
          if (error) throw error;
          if (cap?.error) throw new Error(cap.error);
          if (!cap?.paid) throw new Error("El pago no se completó");
          setOrderInfo((prev) => prev ? { ...prev, registration_id: cap.registration_id, ticket_id: cap.ticket_id } : prev);
          setStep("success");
        } catch (e: any) {
          setStep("pay");
          toast({ title: "No pudimos confirmar el pago", description: e?.message ?? "Intenta nuevamente.", variant: "destructive" });
        }
      },
      onError: (err: any) => {
        console.error("PayPal error", err);
        toast({ title: "Error en PayPal", description: "Vuelve a intentarlo.", variant: "destructive" });
      },
      onCancel: () => {
        toast({ title: "Pago cancelado" });
      },
    }).render(paypalContainerRef.current);
  }, [orderInfo, navigate, toast]);

  useEffect(() => {
    if (step === "pay") renderButtons();
  }, [step, renderButtons]);

  return (
    <Dialog open={open} onOpenChange={(v) => (step === "processing" ? null : v ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-[640px] max-h-[92vh] overflow-y-auto p-0 gap-0 bg-white text-brand-ink rounded-2xl border border-black/10">
        {/* Header */}
        <DialogHeader className="px-6 py-4 text-left border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-orange/15 flex items-center justify-center">
              <TicketIcon className="w-4.5 h-4.5 text-brand-orange" />
            </div>
            <div className="flex-1">
              <DialogTitle className="font-display text-lg font-bold tracking-tight">
                Comprar entrada
              </DialogTitle>
              <DialogDescription className="text-brand-ink/65 text-xs">
                MoodleMoot Perú 2026
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === "success" ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">¡Listo!</h3>
            <p className="text-brand-ink/80 text-sm leading-relaxed mb-6">
              ¡Pago confirmado con éxito! 🎉 Ya enviamos tus accesos y el código QR de entrada a tu correo electrónico.
              Si no lo encuentras en tu bandeja principal, por favor revisa la carpeta de Correo No Deseado o Spam.
              También puedes continuar navegando o descargar tu ticket QR directamente en esta pantalla.
            </p>
            {orderInfo?.ticket_id && (
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={() => {
                    const id = orderInfo.ticket_id;
                    onOpenChange(false);
                    setStep("form");
                    if (id) navigate(`/ticket/${id}`);
                  }}
                  className="bg-brand-orange text-white rounded-full px-8 h-12 text-base font-semibold cursor-pointer transition-colors duration-200 hover:bg-orange-600 active:bg-orange-700 focus-visible:ring-2 focus-visible:ring-brand-orange/40"
                >
                  Ver y descargar mi ticket
                </Button>
              </div>
            )}
          </div>
        ) : step === "pay" ? (
          <div className="p-6 space-y-4">
            <div className="rounded-xl bg-brand-ink/5 p-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-brand-ink/70">Entrada general</span>
                <span className="font-medium">USD {BASE_PRICE.toFixed(2)}</span>
              </div>
              {couponState.status === "valid" && (
                <div className="flex justify-between text-green-700">
                  <span>
                    {isPromoAuto
                      ? `Promo Lanzamiento (−${couponState.discount}%)`
                      : `Cupón ${form.coupon_code.toUpperCase()} (-${couponState.discount}%)`}
                  </span>
                  <span>− USD {(BASE_PRICE - (couponState.total ?? BASE_PRICE)).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between mt-2 pt-2 border-t border-black/10 font-bold">
                <span>Total</span>
                <span>USD {total.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-sm text-brand-ink/70">
              Completa tu pago con PayPal. Aceptamos tarjetas y saldo PayPal.
            </p>
            <div ref={paypalContainerRef} />
            <Button type="button" variant="ghost" onClick={() => setStep("form")} className="w-full">
              <X className="w-4 h-4" /> Volver al formulario
            </Button>
          </div>
        ) : (
          <form key={open ? "purchase-open" : "purchase-closed"} onSubmit={goToPay} className="px-6 py-4 space-y-3" autoComplete="off">
            {duplicateEmailError && (
              <div role="alert" className="rounded-xl border border-red-300 bg-red-50 text-red-800 p-3 flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <p className="text-xs leading-snug">
                  La transacción no pudo completarse ⚠️. El correo electrónico ingresado ya cuenta con un registro activo
                  para este evento. Usa un correo diferente o contacta a Soporte.
                </p>
              </div>
            )}

            {/* Banners promo + sector educativo lado a lado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {isPromoAuto && (
                <div className="rounded-xl border border-brand-orange/40 bg-gradient-to-r from-brand-orange/10 to-brand-orange/5 p-3 flex items-start gap-2">
                  <span className="text-lg leading-none">🔥</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-brand-ink text-xs leading-tight">
                      Oferta lanzamiento · {PROMO_DISCOUNT_LABEL}
                    </div>
                    <div className="text-[11px] text-brand-ink/70 mt-0.5 leading-snug">
                      <span className="line-through">USD {BASE_PRICE.toFixed(2)}</span>{" "}
                      <span className="font-bold text-brand-orange">USD {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {!eduMode ? (
                <div className="rounded-xl border border-emerald-300/70 bg-emerald-50 p-3 flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-emerald-900 text-xs leading-tight">
                      ¿Sector educativo? 100% gratis
                    </div>
                    <button
                      type="button"
                      onClick={enableEduMode}
                      className="mt-1 text-[11px] font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-900"
                    >
                      Activar con carné →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-400 bg-emerald-50 p-3 flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-emerald-900 text-xs leading-tight">
                      Modo educativo · USD 0.00
                    </div>
                    <button
                      type="button"
                      onClick={disableEduMode}
                      className="mt-1 text-[11px] text-emerald-800 underline underline-offset-2 hover:text-emerald-900"
                    >
                      Volver a promo 70%
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nombre completo">
                <Input className={inputCls} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
              </Field>
              <Field label="Email">
                <Input
                  className={inputCls}
                  type="email"
                  placeholder="único y personal"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
            </div>
            {form.email.trim().length > 0 && emailCheck.kind === "hard" && (
              <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-2.5 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div>Revisa el dominio. {emailCheck.message}</div>
                  <button type="button" onClick={applyEmailSuggestion} className="font-semibold text-red-800 underline">
                    Usar {emailCheck.suggestion}
                  </button>
                </div>
              </div>
            )}
            {form.email.trim().length > 0 && emailCheck.kind === "soft" && (
              <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div>{emailCheck.message}</div>
                  <button type="button" onClick={applyEmailSuggestion} className="font-semibold text-amber-900 underline">
                    Corregir a {emailCheck.suggestion}
                  </button>
                </div>
              </div>
            )}
            {form.email.trim().length > 0 && emailCheck.kind === "format" && (
              <p className="text-xs text-red-700">{emailCheck.message}</p>
            )}
            <Field label="WhatsApp">
              <div className="flex gap-2">
                <Select value={form.whatsapp_country} onValueChange={(v) => set("whatsapp_country", v)}>
                  <SelectTrigger className={`w-[150px] shrink-0 ${selectTriggerCls}`}>
                    <SelectValue>
                      <span className="inline-flex items-center gap-1.5">
                        <span>{dialCountry.flag}</span>
                        <span className="font-mono text-sm">+{dialCountry.dial}</span>
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-72 bg-white text-brand-ink">
                    {COUNTRY_DIAL_CODES.map((c) => (
                      <SelectItem key={c.code} value={c.code} className="text-brand-ink focus:bg-brand-orange/10 focus:text-brand-ink">
                        <span className="inline-flex items-center gap-2">
                          <span>{c.flag}</span><span>{c.name_es}</span>
                          <span className="font-mono text-xs text-brand-ink/55">+{c.dial}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="tel"
                  inputMode="numeric"
                  name="whatsapp_number"
                  autoComplete="off"
                  placeholder="Número sin código país"
                  value={form.whatsapp_number}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 14);
                    set("whatsapp_number", digits);
                  }}
                  className={`flex-1 ${inputCls}`}
                />

              </div>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Cargo / rol">
                <Input className={inputCls} value={form.role_title} onChange={(e) => set("role_title", e.target.value)} />
              </Field>
              <Field label="Institución">
                <Input className={inputCls} value={form.institution} onChange={(e) => set("institution", e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Tipo de institución">
                <Select value={form.institution_type} onValueChange={(v) => set("institution_type", v)}>
                  <SelectTrigger className={selectTriggerCls}><SelectValue placeholder="Selecciona…" /></SelectTrigger>
                  <SelectContent className="bg-white text-brand-ink">
                    <SelectItem value="privada">Privada</SelectItem>
                    <SelectItem value="publica">Pública</SelectItem>
                    <SelectItem value="universidad">Universidad</SelectItem>
                    <SelectItem value="otra">Otra</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Tipo de asistencia">
                <Select value={form.attendance_type} onValueChange={(v) => { console.debug("[purchase] attendance_type =", v); set("attendance_type", v); }}>
                  <SelectTrigger className={selectTriggerCls}><SelectValue placeholder="Selecciona…" /></SelectTrigger>
                  <SelectContent className="bg-white text-brand-ink">
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="hibrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="País">
                <Input className={inputCls} value={form.country} onChange={(e) => set("country", e.target.value)} />
              </Field>
              <Field label="Ciudad">
                <Input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} />
              </Field>
            </div>

            {/* Cupón colapsable */}
            <div>
              {!showCoupon ? (
                <button
                  type="button"
                  onClick={() => setShowCoupon(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-ink/70 hover:text-brand-orange transition-colors"
                >
                  <Tag className="w-3.5 h-3.5" />
                  ¿Tienes un cupón? Aplícalo aquí
                </button>
              ) : (
                <Field label="Cupón (opcional)">
                  <div className="flex gap-2">
                    <Input
                      className={inputCls}
                      placeholder={isPromoAuto ? "¿Tienes otro código? Reemplaza la promo" : "Ej. MIBECA2026"}
                      value={form.coupon_code}
                      onChange={(e) => {
                        set("coupon_code", e.target.value.toUpperCase());
                        if (couponState.status !== "idle") setCouponState({ status: "idle" });
                      }}
                    />
                    <Button
                      type="button"
                      onClick={checkCoupon}
                      disabled={couponState.status === "checking" || !form.coupon_code.trim()}
                      className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 border border-primary"
                    >
                      {couponState.status === "checking" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                      Aplicar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowCoupon(false)}
                      className="shrink-0 h-10 w-10 p-0"
                      aria-label="Cerrar cupón"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {couponState.status === "valid" && (
                    <p className="mt-1.5 text-xs text-green-700">
                      ✓ {couponState.discount}% de descuento · Total USD {couponState.total?.toFixed(2)}
                    </p>
                  )}
                  {couponState.status === "invalid" && (
                    <p className="mt-1.5 text-xs text-red-600">Cupón no válido ({couponState.reason})</p>
                  )}
                </Field>
              )}
            </div>

            {/* Uploader carné */}
            {requiresIdCard && (
              <div className="rounded-xl border-2 border-dashed border-brand-orange/40 bg-brand-orange/5 p-3">
                <Label className="text-xs font-medium text-brand-ink/85 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {couponState.category === "edu100"
                    ? "Carné o credencial del sector educativo (obligatorio)"
                    : "Carné de estudiante (obligatorio)"}
                </Label>
                <p className="text-[11px] text-brand-ink/65 mt-1 mb-2 leading-relaxed">
                  <span className="font-medium text-brand-ink/80">Formatos:</span> JPG, PNG o PDF · <span className="font-medium text-brand-ink/80">Máx 5 MB</span>.<br />
                  Asegúrate de que se lean tu nombre e institución. Si es PDF, una sola página es suficiente.
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf"
                  onChange={(e) => onIdFile(e.target.files?.[0] ?? null)}
                  disabled={uploading}
                  className="block w-full text-xs text-brand-ink file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-brand-ink file:text-white hover:file:bg-brand-ink/90"
                />
                {uploading && <p className="text-xs text-brand-ink/65 mt-2 inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Subiendo…</p>}
                {idFilePath && !uploading && idFileMeta && (
                  <div className="mt-2 flex items-center gap-3 rounded-md border border-green-200 bg-green-50 p-2">
                    {idFileMeta.previewUrl ? (
                      <img src={idFileMeta.previewUrl} alt="Vista previa del carné" className="h-16 w-16 rounded object-cover border border-green-300" />
                    ) : (
                      <div className="h-16 w-16 rounded border border-green-300 bg-white flex items-center justify-center text-[10px] font-bold text-brand-ink/70">PDF</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-green-800 font-medium truncate">✓ {idFileMeta.name}</p>
                      <p className="text-[11px] text-green-700/80">{(idFileMeta.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
              <Checkbox checked={form.consent} onCheckedChange={(v) => set("consent", v === true)} className="mt-0.5" />
              <span className="text-xs text-brand-ink/75 leading-snug">
                Acepto recibir comunicaciones del evento por correo electrónico y WhatsApp.
              </span>
            </label>


            <div className="flex items-center justify-between gap-3 pt-2 sticky bottom-0 bg-white -mx-6 px-6 py-3 border-t border-black/5">
              <div className="text-sm">
                <div className="text-brand-ink/60">Total a pagar</div>
                <div className="font-display font-bold text-xl flex items-baseline gap-2">
                  {hasDiscount && (
                    <span className="line-through text-sm font-normal text-brand-ink/45">
                      USD {BASE_PRICE.toFixed(2)}
                    </span>
                  )}
                  <span className={hasDiscount ? "text-brand-orange" : ""}>USD {total.toFixed(2)}</span>
                </div>
              </div>
              <div className="relative">
                {hasDiscount && !isFree && (
                  <div className="absolute -top-8 right-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-orange text-white text-[11px] font-bold shadow-md whitespace-nowrap">
                    <span>🔥</span>
                    <span>¡Aprovecha! USD {total.toFixed(2)}</span>
                    <span className="absolute -bottom-1 right-5 w-2.5 h-2.5 bg-brand-orange rotate-45" />
                  </div>
                )}
                <Button
                  type="submit"
                  className="bg-brand-orange text-white hover:bg-brand-orange/90 h-11 px-6 rounded-full font-semibold"
                >
                  {isFree ? "Confirmar entrada gratis" : "Continuar al pago"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <Label className="text-sm font-medium text-brand-ink/85">{label}</Label>
    {children}
  </div>
);

export default PurchaseTicketModal;

import { useState } from "react";
import { ArrowUpRight, Bell, CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { useTranslation } from "@/i18n/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FloatingShapes from "./FloatingShapes";

const NAME_REGEX = /^[\p{L}\p{M}'’\-\s]+$/u;

const buildSchema = (locale: "es" | "en") =>
  z.object({
    name: z
      .string()
      .trim()
      .min(2, locale === "es" ? "Ingresa al menos 2 caracteres." : "Enter at least 2 characters.")
      .max(100, locale === "es" ? "Máximo 100 caracteres." : "Max 100 characters.")
      .regex(NAME_REGEX, locale === "es"
        ? "Solo letras, espacios, guiones y apóstrofes."
        : "Only letters, spaces, hyphens and apostrophes."),
    email: z
      .string()
      .trim()
      .min(1, locale === "es" ? "Ingresa tu correo." : "Enter your email.")
      .email(locale === "es" ? "Correo no válido." : "Invalid email.")
      .max(255),
  });

const Notify = () => {
  const { locale } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState<{ name: boolean; email: boolean }>({ name: false, email: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const schema = buildSchema(locale as "es" | "en");
  const result = schema.safeParse({ name, email });
  const errors: { name?: string; email?: string } = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = issue.path[0] as "name" | "email";
      if (!errors[key]) errors[key] = issue.message;
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true });
    if (!result.success) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "subscribe-notifications",
        { body: result.data },
      );
      if (error || !data?.ok) throw new Error(error?.message || data?.error || "error");
      toast({
        title: locale === "es" ? "¡Listo!" : "Done!",
        description: locale === "es"
          ? "Quedaste en la lista, te avisaremos antes de cada actividad."
          : "You're on the list — we'll notify you before each activity.",
      });
      setName("");
      setEmail("");
      setTouched({ name: false, email: false });
      setSuccess(true);
    } catch (err) {
      console.error("[Notify] subscription error:", err);
      toast({
        title: locale === "es" ? "No pudimos registrarte" : "Subscription failed",
        description: locale === "es"
          ? "Inténtalo nuevamente en unos segundos."
          : "Please try again in a few seconds.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="registro" className="py-24 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-grain opacity-[0.12] pointer-events-none mix-blend-multiply" />
      <div className="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full bg-primary-foreground/10 blur-3xl" />
      <FloatingShapes
        items={[
          { shape: "semicircles", className: "top-12 -right-10 w-56 md:w-72 invert blur-[2px]", opacity: 0.12, anim: "floaty" },
          { shape: "hex", className: "bottom-16 right-1/4 w-32 md:w-40 invert blur-[1px]", opacity: 0.14, anim: "floaty-rev" },
          { shape: "corner", className: "top-1/3 left-12 w-36 md:w-48 invert blur-[1.5px]", opacity: 0.1, anim: "floaty" },
        ]}
      />
      <div className="container mx-auto px-4 relative grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5" />
            <span className="font-mono text-xs uppercase tracking-[0.3em]">{locale === "es" ? "Notificaciones" : "Notifications"}</span>
          </div>
          <h2 className="text-display text-[clamp(2rem,6vw,5rem)] tracking-tight leading-[0.95]">
            {locale === "es" ? "No te pierdas ninguna sesión." : "Don't miss a single session."}
          </h2>
          <p className="mt-6 text-lg md:text-2xl text-primary-foreground/85 max-w-xl">
            {locale === "es"
              ? "Te avisamos por email 30 minutos antes de cada actividad, con el link directo al stream o sala."
              : "We'll email you 30 minutes before each activity with the direct stream or room link."}
          </p>
        </div>

        <form onSubmit={submit} noValidate className="lg:col-span-5 w-full">
          <div className="bg-primary-foreground text-foreground p-2 rounded-sm flex flex-col gap-2">
            {success ? (
              <div className="p-6 flex flex-col items-center text-center gap-3">
                <CheckCircle2 className="w-12 h-12 text-primary" />
                <h3 className="text-xl font-semibold">
                  {locale === "es" ? "¡Tu suscripción fue enviada!" : "Your subscription was sent!"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {locale === "es"
                    ? "En los próximos minutos recibirás un correo de bienvenida. Te mantendremos informado de cada actividad y novedad del evento."
                    : "In the next few minutes you'll receive a welcome email. We'll keep you posted on every activity and update."}
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="mt-2 text-xs font-mono uppercase tracking-[0.2em] text-primary hover:underline"
                >
                  {locale === "es" ? "Suscribir otro correo" : "Subscribe another email"}
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    maxLength={100}
                    aria-invalid={touched.name && !!errors.name}
                    aria-describedby="notify-name-error"
                    placeholder={locale === "es" ? "Tu nombre" : "Your name"}
                    className={`bg-transparent px-4 h-12 outline-none placeholder:text-muted-foreground text-base border-b ${
                      touched.name && errors.name ? "border-destructive" : "border-border/40"
                    }`}
                    disabled={loading}
                  />
                  {touched.name && errors.name && (
                    <p id="notify-name-error" className="px-4 pt-1 text-xs text-destructive">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      maxLength={255}
                      aria-invalid={touched.email && !!errors.email}
                      aria-describedby="notify-email-error"
                      placeholder={locale === "es" ? "tu@email.com" : "you@email.com"}
                      className="flex-1 min-w-0 bg-transparent px-4 h-12 outline-none placeholder:text-muted-foreground text-base"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="h-12 px-5 bg-foreground text-background rounded-sm hover:bg-secondary transition-colors inline-flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-60 whitespace-nowrap"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {locale === "es" ? "Enviando..." : "Sending..."}
                        </>
                      ) : (
                        <>
                          {locale === "es" ? "Avísame" : "Notify me"} <ArrowUpRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                  {touched.email && errors.email && (
                    <p id="notify-email-error" className="px-4 pt-1 text-xs text-destructive">
                      {errors.email}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <p className="mt-3 text-sm text-primary-foreground/75 font-mono">
            {locale === "es" ? "Sin spam. Solo el evento." : "No spam. Just the event."}
          </p>
        </form>
      </div>
    </section>
  );
};

export default Notify;

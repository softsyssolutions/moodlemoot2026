import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "@/i18n/LanguageContext";
import { EVENT } from "@/data/event";
import { supabase } from "@/integrations/supabase/client";

interface Msg { role: "user" | "assistant"; content: string; }

const ScholarAvatar = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden>
    <g className="origin-center [transform-box:fill-box] animate-[scholar-bob_2.6s_ease-in-out_infinite]">
      <circle cx="16" cy="17" r="5.2" fill="currentColor" />
      <path d="M5 30c1.5-4.5 6-7 11-7s9.5 2.5 11 7" fill="currentColor" />
      <rect x="9.5" y="10.4" width="13" height="2" rx="0.6" fill="hsl(var(--brand-ink))" />
      <path d="M16 5.5l8 3-8 3-8-3z" fill="hsl(var(--brand-ink))" />
      <g className="origin-[24px_8.5px] animate-[tassel-sway_2.6s_ease-in-out_infinite]">
        <line x1="24" y1="8.5" x2="24" y2="13" stroke="hsl(var(--primary))" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="24" cy="13.6" r="1.1" fill="hsl(var(--primary))" />
      </g>
    </g>
    <style>{`
      @keyframes scholar-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-1.2px)} }
      @keyframes tassel-sway { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(10deg)} }
    `}</style>
  </svg>
);

const EventChatbot = () => {
  const { locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const playedRef = useRef(false);

  const welcome = locale === "es"
    ? `¡Hola! 👋 Soy el asistente Moodle, estoy listo para ayudarte. ¿Qué te gustaría saber?`
    : `Hi! 👋 I'm the Moodle assistant, ready to help. What would you like to know?`;

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: welcome }]);
      setNudge(null);
    }
  }, [open]);

  // Update welcome message when language changes (only if it's the only message shown)
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [{ role: "assistant", content: welcome }];
      }
      return prev;
    });
    setNudge(null);
  }, [locale]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) return;

    const playChime = () => {
      try {
        const AC = (window.AudioContext || (window as any).webkitAudioContext);
        if (!AC) return;
        const ctx = new AC();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(880, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        o.connect(g).connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.4);
      } catch {/* silent */}
    };

    const nudgesEs = [
      "¡Hola! 👋 ¿Te ayudo con info del MoodleMoot Perú 2026?",
      "¿Aún no aseguras tu cupo gratis? Te ayudo en 30 segundos 🎓",
      "Tengo la agenda, ponentes y más. ¿Lo vemos juntos? ✨",
      "Cupos limitados 🚀 ¿Te dejo en la lista VIP?",
    ];
    const nudgesEn = [
      "Hi! 👋 Want info about MoodleMoot Peru 2026?",
      "Haven't grabbed your free spot? I'll help in 30s 🎓",
      "I have agenda, speakers and more. Shall we? ✨",
      "Limited seats 🚀 Want me to add you to the VIP list?",
    ];
    const list = locale === "es" ? nudgesEs : nudgesEn;

    let i = 0;
    let pulseTimer: number | undefined;

    const showNudge = (withSound: boolean) => {
      setNudge(list[i % list.length]);
      setPulse(true);
      if (withSound) playChime();
      window.clearTimeout(pulseTimer);
      pulseTimer = window.setTimeout(() => setPulse(false), 4000);
      i++;
    };

    // 1st banner: silent, at 12s
    const t1 = window.setTimeout(() => {
      showNudge(false);
      // After it sits ~35s, fire next with chime, then keep cycling every 45s
      const interval = window.setInterval(() => showNudge(true), 45000);
      const t2 = window.setTimeout(() => {
        showNudge(true);
      }, 35000);
      // store cleanup on window for unmount
      (window as any).__chatNudgeCleanup = () => {
        window.clearTimeout(t2);
        window.clearInterval(interval);
      };
    }, 12000);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(pulseTimer);
      (window as any).__chatNudgeCleanup?.();
    };
  }, [open, locale]);


  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("event-chat", {
        body: { messages: next.map(({ role, content }) => ({ role, content })), locale },
      });
      if (error) throw error;
      const reply = data?.reply ?? (locale === "es" ? "No pude responder, intenta otra vez." : "I couldn't respond, try again.");
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      console.error(e);
      setMessages((m) => [...m, { role: "assistant", content: locale === "es" ? "Tuve un problema técnico 😅 Intenta de nuevo en un momento." : "I had a technical issue 😅 Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const openChat = () => { setOpen(true); setNudge(null); setPulse(false); };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex items-end gap-3">
        {nudge && !open && (
          <button
            onClick={openChat}
            className="hidden sm:flex items-center max-w-[260px] text-left text-xs leading-snug bg-card text-card-foreground border border-border rounded-2xl px-3 py-2 shadow-xl animate-fade-in hover:bg-muted transition-colors"
          >
            {nudge}
          </button>
        )}
        <button
          onClick={() => (open ? setOpen(false) : openChat())}
          className={`relative w-11 h-11 rounded-sm bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors ${pulse ? "animate-[chat-pulse_1.6s_ease-out_infinite]" : ""}`}
          aria-label="chat"
        >
          {open ? <X className="w-4 h-4" /> : <ScholarAvatar className="w-7 h-7 text-primary-foreground" />}
          {!open && nudge && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
          )}
        </button>
      </div>

      <style>{`
        @keyframes chat-pulse {
          0% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.55); }
          100% { box-shadow: 0 0 0 18px hsl(var(--primary) / 0); }
        }
      `}</style>

      {open && (
        <div className="fixed bottom-24 right-6 top-24 z-40 w-[360px] max-w-[calc(100vw-3rem)] bg-card text-card-foreground border border-border shadow-2xl flex flex-col animate-fade-in rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-secondary text-secondary-foreground">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
              <ScholarAvatar className="w-7 h-7 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-display font-bold text-sm">Asistente · {EVENT.name}</div>
              <div className="font-mono text-xs text-secondary-foreground/70 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> {locale === "es" ? "IA en línea" : "AI online"}
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed rounded-2xl break-words ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm whitespace-pre-wrap"
                    : "bg-muted text-foreground rounded-bl-sm prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_a]:text-primary [&_a]:underline [&_strong]:text-foreground"
                }`}>
                  {m.role === "assistant"
                    ? <ReactMarkdown>{m.content}</ReactMarkdown>
                    : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-2 text-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-muted-foreground">{locale === "es" ? "pensando…" : "thinking…"}</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-3 border-t border-border flex gap-2 bg-card">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder={locale === "es" ? "Escribe tu pregunta…" : "Type your question…"}
              className="flex-1 px-3 h-10 bg-muted text-foreground placeholder:text-muted-foreground rounded-full outline-none text-sm focus:ring-2 focus:ring-primary disabled:opacity-60"
            />
            <button type="submit" disabled={loading} className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default EventChatbot;

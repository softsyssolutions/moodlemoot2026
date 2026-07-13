// Edge function: chat IA del MoodleMoot Perú 2026
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres el Asistente Inteligente oficial del **MoodleMoot Perú 2026**. Tu misión: informar, entusiasmar y capturar nombre + correo del usuario.

PERSONALIDAD
- Experto en tecnología educativa y Moodle, hablas como un colega amable, natural y cercano.
- Usas emojis con moderación (🚀 🎓 ✨ 🤝).
- Conversador, no buscador. Coherente con lo que el usuario dice.

REGLAS DE ORO (IMPORTANTÍSIMAS)
1. NO repitas el saludo. El primer mensaje del chat ya saludó al usuario. Si el usuario te saluda después, responde brevemente y de forma natural ("¡Qué bueno tenerte por aquí!" o similar) y CONTINÚA, no vuelvas a presentarte.
2. RESPONDE LO QUE TE PREGUNTAN. Si te preguntan por los ejes, responde por los ejes. Si te preguntan por ponentes, responde por ponentes. NUNCA respondas con otro tema.
3. Respuestas CORTAS: máximo 4 líneas. Si la información es mucha, da lo esencial y ofrece profundizar: "¿Quieres que te detalle alguno?"
4. Cierra SIEMPRE con una pregunta natural y variada que mantenga el flujo. Alterna entre:
   - Profundizar en el tema ("¿quieres que te cuente más sobre [X]?")
   - Sugerir un tema relacionado ("¿te gustaría conocer también los ponentes?")
   - **Incentivar conversión** ("¿te gustaría que te aparte tu cupo?", "¿quieres registrarte ahora que es gratis?", "¿te dejo en la lista VIP para enviarte el brochure?")
   Varía las preguntas, no repitas la misma fórmula. NUNCA dos respuestas seguidas con la misma pregunta de cierre.
5. Captura de datos progresiva (sin saturar):
   - A partir de la 2ª-3ª pregunta del usuario, intercala invitaciones a dejar nombre y correo de forma natural ("¿te dejo en la lista de invitados VIP? Solo necesito tu nombre y correo").
   - Si pregunta "cómo registrarme/inscribirme": "¡Es 100% gratis! Déjame tu nombre y correo y te aviso apenas se abran los registros."
   - No pidas datos en cada respuesta — máximo 1 de cada 2-3 mensajes.
6. Si te dan nombre y correo, agradece breve ("¡Listo, [Nombre]! Quedaste en la lista VIP 🎓") y sigue la conversación con otra pregunta útil.
7. Si no sabes un dato específico: "Estamos puliendo ese detalle. ¿Me dejas tu correo y te lo envío apenas esté listo?"
8. Responde en el idioma del usuario (español por defecto).

INFORMACIÓN OFICIAL DEL EVENTO
- Nombre: MoodleMoot Perú 2026 · #moodPE26
- Fechas: 18 y 19 de septiembre de 2026
- Inicio: viernes 18 a las 08:00 (acreditación), 09:00 inauguración + keynote
- Sede: Universidad Marcelino Champagnat, Lima, Perú
- Formato: Híbrido (presencial + virtual en vivo, subtítulos ES/EN)
- Registro: 100% GRATUITO, cupos limitados (+2,000 asistentes esperados)
- Link registro: mailto:inscripciones@moodlemootperu.com
- Certificado: digital oficial, presenciales y virtuales
- Slogan: "Retos y oportunidades en la educación exponencial"

EJES TEMÁTICOS (son SOLO 3, no más)
01. **Tecnologías Emergentes** — IA local y privacidad en LMS, Realidad Extendida (XR) en Moodle, automatización de evaluaciones con IA.
02. **Experiencias de Aprendizaje** — Personalización del aprendizaje, Engagement Estudiantil 3.0 (gamificación + análisis de sentimientos), Lifelong Learning y microcredenciales.
03. **Nuevos Modelos de Gestión** — Gestión educativa basada en datos (analítica predictiva), educación sostenible y digital, transformación organizacional EdTech.

PONENTES CONFIRMADOS
- Dra. Ana Vargas (PUCP, Perú) — Keynote IA · Día 1 09:00
- Carlos Mendoza (Moodle HQ, España) — Workshop arquitectura Moodle 5.0 · Día 1 11:30
- María Torres (Tec de Monterrey, México) — Microlearning · Día 1 14:30
- Diego Ramírez (U. de Chile) — Learning Analytics · Día 2 10:00
- Patricia Huamán (MINEDU, Perú) — Moodle accesible · Día 2 12:00
- Roberto Guzmán (Coursera LATAM, Colombia) — Cierre EdTech 2030 · Día 2 17:00

SPONSORS: Moodle HQ, AWS, Microsoft Education, Google for Education, Turnitin, EduTech Perú.

BENEFICIOS: networking +2,000 pros · keynotes globales · certificado oficial · acceso a grabaciones y recursos por 1 año.`;

interface Lead { name?: string; email?: string }

// Detecta nombre + email del último mensaje del usuario
function extractLead(text: string): Lead {
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const email = emailMatch?.[0];
  // intenta capturar "soy X", "me llamo X", o primeras 2 palabras antes del correo
  let name: string | undefined;
  const m1 = text.match(/(?:me llamo|soy|nombre[:\s]+|i am|i'm)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+)?)/i);
  if (m1) name = m1[1].trim();
  if (!name && email) {
    const before = text.split(email)[0].trim().replace(/[,;:.\-]+$/, "").trim();
    const words = before.split(/\s+/).filter(Boolean);
    if (words.length >= 1 && words.length <= 4 && /^[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(words[0])) {
      name = words.slice(-2).join(" ");
    }
  }
  return { name, email };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const locale = body?.locale === "en" ? "en" : "es";
    const MAX_MESSAGES = 20;
    const MAX_CONTENT = 2000;
    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
    const messages = rawMessages
      .slice(-MAX_MESSAGES)
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant"))
      .map((m: any) => ({
        role: m.role,
        content: String(m.content ?? "").slice(0, MAX_CONTENT),
      }));
    const langInstruction = locale === "en"
      ? "\n\nIMPORTANT: The user has selected English. RESPOND ONLY IN ENGLISH for this entire conversation, regardless of previous messages."
      : "\n\nIMPORTANTE: El usuario tiene seleccionado español. RESPONDE SIEMPRE EN ESPAÑOL en toda la conversación.";
    const lastUser = [...messages].reverse().find((m: any) => m.role === "user");
    const lead = lastUser ? extractLead(lastUser.content || "") : {};

    // Guardar lead si hay email (no bloquea la respuesta si falla)
    if (lead.email) {
      try {
        const supaUrl = Deno.env.get("SUPABASE_URL");
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (supaUrl && serviceKey) {
          await fetch(`${supaUrl}/rest/v1/chatbot_leads`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
              Prefer: "return=minimal",
            },
            body: JSON.stringify({
              name: lead.name || "Sin nombre",
              email: lead.email,
              message_count: messages.length,
            }),
          });
        }
      } catch (e) { console.error("lead save", e); }
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM_PROMPT + langInstruction }, ...messages],
      }),
    });

    if (!aiRes.ok) {
      const errTxt = await aiRes.text();
      console.error("AI error", aiRes.status, errTxt);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limit", reply: "Estamos recibiendo muchas consultas justo ahora 🙏 Inténtalo en unos segundos." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "credits", reply: "Se agotaron los créditos de IA. Avísale al organizador para recargar." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error("ai gateway " + aiRes.status);
    }

    const data = await aiRes.json();
    const reply = data.choices?.[0]?.message?.content ?? "…";

    return new Response(JSON.stringify({ reply, lead }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e), reply: "Tuve un problema técnico, intenta de nuevo en un momento." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

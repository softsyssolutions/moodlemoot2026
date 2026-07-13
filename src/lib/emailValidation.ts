// Validación amigable de correos: detecta typos comunes en dominios populares
// y sugiere la corrección. Mensajes en español.

const CANONICAL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.es",
  "outlook.com",
  "outlook.es",
  "live.com",
  "live.com.mx",
  "msn.com",
  "yahoo.com",
  "yahoo.es",
  "yahoo.com.mx",
  "icloud.com",
  "me.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
];

// Typos exactos conocidos → corrección obligatoria
const HARD_TYPOS: Record<string, string> = {
  // gmail
  "gmil.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.om": "gmail.com",
  "gmal.com": "gmail.com",
  "gemail.com": "gmail.com",
  "gamil.com": "gmail.com",
  "ggmail.com": "gmail.com",
  // hotmail
  "hotmal.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "hotnail.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmail.cm": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "hotamil.com": "hotmail.com",
  "homail.com": "hotmail.com",
  // outlook
  "outloo.com": "outlook.com",
  "outlok.com": "outlook.com",
  "outlook.co": "outlook.com",
  "outlook.con": "outlook.com",
  "outlokk.com": "outlook.com",
  "outllok.com": "outlook.com",
  // yahoo
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yahoo.cm": "yahoo.com",
  "yhoo.com": "yahoo.com",
  // icloud
  "icloud.co": "icloud.com",
  "iclod.com": "icloud.com",
  "iclould.com": "icloud.com",
  "icloud.con": "icloud.com",
  // live / msn
  "live.co": "live.com",
  "live.con": "live.com",
  "msn.co": "msn.com",
};

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const al = a.length;
  const bl = b.length;
  if (!al) return bl;
  if (!bl) return al;
  const v0 = new Array(bl + 1);
  const v1 = new Array(bl + 1);
  for (let i = 0; i <= bl; i++) v0[i] = i;
  for (let i = 0; i < al; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < bl; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= bl; j++) v0[j] = v1[j];
  }
  return v1[bl];
}

export type EmailCheckResult =
  | { kind: "ok" }
  | { kind: "format"; message: string }
  | { kind: "hard"; suggestion: string; message: string }
  | { kind: "soft"; suggestion: string; message: string };

export function checkEmail(rawInput: string): EmailCheckResult {
  const email = (rawInput || "").trim().toLowerCase();
  if (!email) return { kind: "format", message: "Ingresa tu correo electrónico" };

  // Formato básico
  if (/\s/.test(email)) return { kind: "format", message: "El correo no puede contener espacios" };
  if ((email.match(/@/g) || []).length !== 1)
    return { kind: "format", message: "El correo debe contener un solo @" };
  if (email.includes(".."))
    return { kind: "format", message: "El correo no puede tener dos puntos seguidos" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { kind: "format", message: "Email inválido" };

  const [local, domain] = email.split("@");
  if (!local || local.startsWith(".") || local.endsWith("."))
    return { kind: "format", message: "El correo no puede empezar ni terminar con un punto" };
  if (domain.startsWith(".") || domain.endsWith("."))
    return { kind: "format", message: "El dominio del correo no es válido" };

  const tld = domain.split(".").pop() || "";
  if (tld.length < 2)
    return { kind: "format", message: "El dominio del correo no es válido" };

  // Typo exacto conocido
  if (HARD_TYPOS[domain]) {
    const suggestion = `${local}@${HARD_TYPOS[domain]}`;
    return {
      kind: "hard",
      suggestion,
      message: `¿Quisiste decir ${suggestion}?`,
    };
  }

  // Si ya es un dominio canónico, ok
  if (CANONICAL_DOMAINS.includes(domain)) return { kind: "ok" };

  // Buscar similitud cercana solo a dominios populares (evita molestar a corporativos)
  let best: { d: string; dist: number } | null = null;
  for (const cd of CANONICAL_DOMAINS) {
    const dist = levenshtein(domain, cd);
    if (best === null || dist < best.dist) best = { d: cd, dist };
  }
  if (best && best.dist > 0 && best.dist <= 2 && Math.abs(domain.length - best.d.length) <= 2) {
    const suggestion = `${local}@${best.d}`;
    return {
      kind: "soft",
      suggestion,
      message: `¿Quisiste decir ${suggestion}?`,
    };
  }

  return { kind: "ok" };
}

import buendata from "@/assets/sponsors/buendata.png";
import industriae from "@/assets/sponsors/industriae.png";
import datacurso from "@/assets/sponsors/datacurso.png";
import eduproject from "@/assets/sponsors/eduproject.png";
import ramiroGuzman from "@/assets/speakers/ramiro-guzman.png";
import hemersonCarreno from "@/assets/speakers/hemerson-carreno.png";
import rafaelMartinez from "@/assets/speakers/rafael-martinez.png";
import heidyMejia from "@/assets/speakers/heidy-mejia.png";
import hernanArregoces from "@/assets/speakers/hernan-arregoces.png";

export const EVENT = {
  name: "MoodleMoot Perú",
  edition: "2026",
  hashtag: "#moodPE26",
  startDate: "2026-09-18T08:00:00-05:00",
  endDate: "2026-09-19T18:00:00-05:00",
  dateLabel: { es: "18 — 19 Septiembre 2026", en: "September 18 — 19, 2026" },
  city: "Lima, Perú",
  format: { es: "Híbrido · Virtual + Presencial", en: "Hybrid · Virtual + In-person" },
  venue: { es: "Universidad Marcelino Champagnat", en: "Marcelino Champagnat University" },
  registerUrl: "mailto:inscripciones@moodlemootperu.com?subject=Registro%20MoodleMoot%20Per%C3%BA%202026",
  brochureUrl: "/brochure.pdf",
  slogan: {
    es: "Retos y oportunidades en la educación exponencial",
    en: "Challenges and opportunities in exponential education",
  },
  tagline: {
    es: "El encuentro Moodle más grande del Perú: educadores, desarrolladores y líderes EdTech construyendo el futuro del aprendizaje digital.",
    en: "Peru's largest Moodle gathering: educators, developers and EdTech leaders shaping the future of digital learning.",
  },
  manifesto: {
    es: "Transformando realidades en la era de la IA.",
    en: "Transforming realities in the AI era.",
  },
  stats: [
    { value: "2,000+", label: { es: "Participantes", en: "Attendees" } },
    { value: "15+", label: { es: "Países", en: "Countries" } },
    { value: "40+", label: { es: "Sesiones", en: "Sessions" } },
    { value: "2", label: { es: "Días", en: "Days" } },
  ],
} as const;

export type Locale = "es" | "en";

export interface Speaker {
  id: string;
  name: string;
  role: string;
  bio: string;
  talk: string;
  photo?: string;
  website?: string;
  hidden?: boolean;
}

// Fuente única de ponentes — compartida entre Speakers y Agenda.
// Marca `hidden: true` para ocultar al público (visibles solo en modo editor).
export const SPEAKERS: Speaker[] = [
  {
    id: "s1",
    name: "Ramiro Guzmán",
    role: "CEO · Data Curso LLC",
    bio: "CEO de Data Curso LLC. Lidera iniciativas de transformación digital en educación, con foco en analítica de aprendizaje, plataformas LMS y adopción de IA en instituciones educativas de Latinoamérica.",
    talk: "Participación destacada en MoodleMoot Perú 2026.",
    photo: ramiroGuzman,
    website: "https://datacurso.com/",
  },
  {
    id: "s3",
    name: "Rafael Martínez",
    role: "CEO · EduProject",
    bio: "CEO de EduProject. Especialista en implementación de plataformas Moodle y proyectos de transformación digital educativa, con amplia trayectoria acompañando instituciones en Latinoamérica.",
    talk: "Participación destacada en MoodleMoot Perú 2026.",
    photo: rafaelMartinez,
    website: "https://www.grupoeduproject.com/",
  },
  {
    id: "s2",
    name: "Hemerson Carreño",
    role: "CEO · Buen Data",
    bio: "CEO de Buen Data. Experto en analítica de datos y soluciones de inteligencia de negocio aplicadas a la educación, impulsando la toma de decisiones basada en datos en instituciones de Latinoamérica.",
    talk: "Participación destacada en MoodleMoot Perú 2026.",
    photo: hemersonCarreno,
    website: "https://buendata.com/",
  },
  {
    id: "s4",
    name: "Heidy Mejía",
    role: "Industria E",
    bio: "Profesional vinculada a Industria E, con experiencia en proyectos de innovación educativa y tecnología aplicada al aprendizaje.",
    talk: "Participación destacada en MoodleMoot Perú 2026.",
    photo: heidyMejia,
    website: "https://industriae.pe/",
  },
  {
    id: "s5",
    name: "Hernán Arregocés",
    role: "CEO · Industria E",
    bio: "CEO de Industria E. Líder en innovación educativa y transformación digital, impulsando soluciones tecnológicas para la educación en Latinoamérica.",
    talk: "Participación destacada en MoodleMoot Perú 2026.",
    photo: hernanArregoces,
    website: "https://industriae.pe/",
  },
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `s${i + 6}`,
    name: `Ponente ${i + 6}`,
    role: "Universidad por definir",
    bio: "Biografía pendiente.",
    talk: "Charla pendiente.",
    hidden: true,
  })),
];

export type SessionType = "conferencia" | "panel" | "taller" | "pausa" | "networking";

export interface Session {
  day: 1 | 2;
  start: string;
  end: string;
  title: { es: string; en: string };
  description?: { es: string; en: string };
  speakerId?: string;
  type: SessionType;
  location: { es: string; en: string };
}

export const SESSIONS: Session[] = [
  // ===== Día 1 — 18 Septiembre =====
  { day: 1, start: "08:00", end: "09:00", title: { es: "Registro y acreditación", en: "Check-in" }, type: "pausa", location: { es: "Lobby", en: "Lobby" } },
  { day: 1, start: "09:00", end: "09:30", title: { es: "Inauguración oficial", en: "Official opening" }, type: "conferencia", location: { es: "Auditorio principal", en: "Main auditorium" } },
  { day: 1, start: "09:30", end: "10:00", title: { es: "Conferencia 1: Educación en evolución", en: "Keynote 1: Education in evolution" }, speakerId: "s1", type: "conferencia", location: { es: "Auditorio principal", en: "Main auditorium" } },
  { day: 1, start: "10:00", end: "10:30", title: { es: "Conferencia 2: IA + Humano", en: "Keynote 2: AI + Human" }, speakerId: "s2", type: "conferencia", location: { es: "Auditorio principal", en: "Main auditorium" } },
  { day: 1, start: "10:30", end: "11:30", title: { es: "Coffee break · Networking", en: "Coffee break · Networking" }, type: "networking", location: { es: "Hall", en: "Hall" } },
  { day: 1, start: "11:30", end: "13:00", title: { es: "Bloque de ponencias 1 — Lifelong Learning", en: "Talks block 1 — Lifelong Learning" }, speakerId: "s3", type: "taller", location: { es: "Auditorio Lenguas Modernas", en: "Languages Auditorium" } },
  { day: 1, start: "13:00", end: "14:00", title: { es: "Almuerzo", en: "Lunch" }, type: "pausa", location: { es: "Terraza", en: "Terrace" } },
  { day: 1, start: "14:00", end: "14:30", title: { es: "Panel: Los nuevos escenarios del aprendizaje", en: "Panel: New learning scenarios" }, speakerId: "s4", type: "panel", location: { es: "Auditorio principal", en: "Main auditorium" } },
  { day: 1, start: "14:30", end: "15:00", title: { es: "Conferencia 3: Nuevas herramientas Moodle", en: "Keynote 3: New Moodle tools" }, speakerId: "s5", type: "conferencia", location: { es: "Auditorio principal", en: "Main auditorium" } },
  { day: 1, start: "15:00", end: "16:00", title: { es: "Coffee break · Consulta a un experto Moodle", en: "Coffee · Ask a Moodle expert" }, type: "networking", location: { es: "Hall", en: "Hall" } },
  { day: 1, start: "16:00", end: "17:30", title: { es: "Bloque de ponencias 2", en: "Talks block 2" }, type: "taller", location: { es: "Auditorios paralelos", en: "Parallel rooms" } },
  { day: 1, start: "18:00", end: "20:00", title: { es: "Cocktail de bienvenida", en: "Welcome cocktail" }, type: "networking", location: { es: "Rooftop", en: "Rooftop" } },

  // ===== Día 2 — 19 Septiembre =====
  { day: 2, start: "08:00", end: "09:00", title: { es: "Registro día 2", en: "Day 2 check-in" }, type: "pausa", location: { es: "Lobby", en: "Lobby" } },
  { day: 2, start: "09:00", end: "09:30", title: { es: "Conferencia 4: Automatización en evaluación con IA", en: "Keynote 4: AI-driven assessment" }, speakerId: "s1", type: "conferencia", location: { es: "Auditorio principal", en: "Main auditorium" } },
  { day: 2, start: "09:30", end: "10:00", title: { es: "Conferencia 5: Capacitación corporativa con Moodle Workplace", en: "Keynote 5: Corporate training with Moodle Workplace" }, speakerId: "s2", type: "conferencia", location: { es: "Auditorio principal", en: "Main auditorium" } },
  { day: 2, start: "10:00", end: "10:30", title: { es: "Panel: Visión estratégica del impacto de la IA", en: "Panel: Strategic vision on AI impact" }, speakerId: "s3", type: "panel", location: { es: "Auditorio principal", en: "Main auditorium" } },
  { day: 2, start: "10:30", end: "11:00", title: { es: "Coffee break · Networking", en: "Coffee · Networking" }, type: "networking", location: { es: "Hall", en: "Hall" } },
  { day: 2, start: "11:00", end: "13:00", title: { es: "Bloque de ponencias 3", en: "Talks block 3" }, speakerId: "s4", type: "taller", location: { es: "Auditorios paralelos", en: "Parallel rooms" } },
  { day: 2, start: "13:00", end: "14:00", title: { es: "Almuerzo", en: "Lunch" }, type: "pausa", location: { es: "Terraza", en: "Terrace" } },
  { day: 2, start: "14:00", end: "14:30", title: { es: "Panel: Transformación educativa con IA", en: "Panel: Educational transformation with AI" }, speakerId: "s5", type: "panel", location: { es: "Auditorio principal", en: "Main auditorium" } },
  { day: 2, start: "14:30", end: "15:00", title: { es: "Conferencia 6: Innovación y sostenibilidad", en: "Keynote 6: Innovation & sustainability" }, type: "conferencia", location: { es: "Auditorio principal", en: "Main auditorium" } },
  { day: 2, start: "15:00", end: "15:30", title: { es: "Coffee break · Networking", en: "Coffee · Networking" }, type: "networking", location: { es: "Hall", en: "Hall" } },
  { day: 2, start: "15:30", end: "17:00", title: { es: "Bloque de ponencias 4", en: "Talks block 4" }, type: "taller", location: { es: "Auditorios paralelos", en: "Parallel rooms" } },
  { day: 2, start: "17:30", end: "18:00", title: { es: "Conferencia 7: Educación con propósito", en: "Keynote 7: Education with purpose" }, type: "conferencia", location: { es: "Auditorio principal", en: "Main auditorium" } },
  { day: 2, start: "18:00", end: "19:00", title: { es: "Entrega de premios · Clausura", en: "Awards · Closing" }, type: "networking", location: { es: "Auditorio principal", en: "Main auditorium" } },
];

export type SponsorTier = "diamond" | "gold" | "silver" | "bronze";

export interface Sponsor {
  id: string;
  name: string;
  tier: SponsorTier;
  logo: string;
  url: string;
  description: { es: string; en: string };
}

export const SPONSORS: Sponsor[] = [
  { id: "buendata", name: "Buen Data", tier: "gold", logo: buendata, url: "https://buendata.com/", description: { es: "Moodle Premium Certified Services Provider.", en: "Moodle Premium Certified Services Provider." } },
  { id: "datacurso", name: "DataCurso", tier: "gold", logo: datacurso, url: "https://datacurso.com/", description: { es: "Formación y datos para la educación digital.", en: "Training and data for digital education." } },
  { id: "industriae", name: "Industria E", tier: "gold", logo: industriae, url: "https://industriae.pe/", description: { es: "Moodle Certified Services Provider.", en: "Moodle Certified Services Provider." } },
  { id: "eduproject", name: "Eduproject", tier: "gold", logo: eduproject, url: "https://www.grupoeduproject.com/", description: { es: "Soluciones educativas integrales.", en: "Comprehensive educational solutions." } },
];

export interface Axis {
  number: string;
  title: { es: string; en: string };
  description: { es: string; en: string };
}

export const AXES: Axis[] = [
  { number: "01", title: { es: "IA en Educación", en: "AI in Education" }, description: { es: "Generativa, tutores adaptativos, evaluación automática.", en: "Generative AI, adaptive tutors, automated assessment." } },
  { number: "02", title: { es: "Pedagogía Digital", en: "Digital Pedagogy" }, description: { es: "Diseño instruccional, microlearning, gamificación.", en: "Instructional design, microlearning, gamification." } },
  { number: "03", title: { es: "Desarrollo Moodle", en: "Moodle Development" }, description: { es: "Plugins, integraciones, arquitectura y escalabilidad.", en: "Plugins, integrations, architecture and scalability." } },
  { number: "04", title: { es: "Inclusión y Accesibilidad", en: "Inclusion & Accessibility" }, description: { es: "Educación rural, WCAG, equidad digital.", en: "Rural education, WCAG, digital equity." } },
  { number: "05", title: { es: "Analítica del Aprendizaje", en: "Learning Analytics" }, description: { es: "Dashboards, predicción, intervenciones tempranas.", en: "Dashboards, prediction, early interventions." } },
  { number: "06", title: { es: "Seguridad y Privacidad", en: "Security & Privacy" }, description: { es: "Protección de datos, compliance, ciberseguridad.", en: "Data protection, compliance, cybersecurity." } },
];

export interface Benefit {
  number: string;
  title: { es: string; en: string };
  text: { es: string; en: string };
}

export const BENEFITS: Benefit[] = [
  { number: "01", title: { es: "Networking real", en: "Real networking" }, text: { es: "Conecta con +2,000 profesionales de toda la región.", en: "Connect with 2,000+ professionals across the region." } },
  { number: "02", title: { es: "Conocimiento de frontera", en: "Cutting-edge knowledge" }, text: { es: "Keynotes y talleres con líderes globales de Moodle.", en: "Keynotes and workshops with global Moodle leaders." } },
  { number: "03", title: { es: "Certificación oficial", en: "Official certificate" }, text: { es: "Certificado digital con valor curricular reconocido.", en: "Digital certificate with recognized academic value." } },
  { number: "04", title: { es: "Recursos exclusivos", en: "Exclusive resources" }, text: { es: "Acceso a grabaciones, plantillas y plugins durante un año.", en: "Access to recordings, templates and plugins for one year." } },
];

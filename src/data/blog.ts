import heroMoodlemoot from "@/assets/blog/moodlemoot-2026-hero.jpg";
import hibridoMoodlemoot from "@/assets/blog/moodlemoot-2026-hibrido-real.jpg";
import agendaMoodlemoot from "@/assets/blog/moodlemoot-2026-agenda-real.jpg";
import logoEvento from "@/assets/blog/moodlemoot-peru-2026-logo.png";
import umchCampus from "@/assets/blog/umch-campus.jpg";
import umchFachada from "@/assets/blog/umch-fachada-licenciamiento.jpg";
import umchAula from "@/assets/blog/umch-aula.jpg";
import umchCampusWalk from "@/assets/blog/umch-campus-walk.jpg";
import umchMapa from "@/assets/blog/umch-mapa-ubicacion.jpg";
import historiaEvento from "@/assets/blog/historia-moodlemoot-portada.jpg";
import historiaCrecimiento from "@/assets/blog/historia-moodlemoot-ecuador.jpg";
import historiaNetworking from "@/assets/blog/historia-moodlemoot-sponsors.jpg";
import post1Cover from "@/assets/blog/post-1-cover.jpg";
import speakerPosterAsset from "@/assets/blog/speaker-poster-mootpe26.png.asset.json";
const convocatoriaSpeakersCover = speakerPosterAsset.url;
import guiaPaso1Asset from "@/assets/blog/guia-paso-1-speakers-tab.png.asset.json";
const guiaPaso1 = guiaPaso1Asset.url;
import guiaPaso2Asset from "@/assets/blog/guia-paso-2-boton-postulate.png.asset.json";
const guiaPaso2 = guiaPaso2Asset.url;
import guiaPaso3Asset from "@/assets/blog/guia-paso-3-formulario.png.asset.json";
const guiaPaso3 = guiaPaso3Asset.url;
import notificationsGuideAsset from "@/assets/notifications-guide.png.asset.json";
import instalacionPwaPcAsset from "@/assets/instalacion-pwa-pc.png.asset.json";
const notificationsGuide = notificationsGuideAsset.url;
const instalacionPwaPc = instalacionPwaPcAsset.url;
import sectoresAsset from "@/assets/blog/sectores-moodlemoot-peru-2026.png.asset.json";
const sectoresCover = sectoresAsset.url;

export type BlogCategoryId =
  | "announcements"
  | "venue"
  | "moodle-lms"
  | "ai-education"
  | "digital-pedagogy"
  | "case-studies"
  | "moodle-dev"
  | "community"
  | "sponsors";

export interface BlogCategory {
  id: BlogCategoryId;
  label: { es: string; en: string };
}

export const CATEGORIES: BlogCategory[] = [
  { id: "announcements", label: { es: "Anuncios del evento", en: "Event announcements" } },
  { id: "venue", label: { es: "Sede & logística", en: "Venue & logistics" } },
  { id: "moodle-lms", label: { es: "Moodle & LMS", en: "Moodle & LMS" } },
  { id: "ai-education", label: { es: "IA en educación", en: "AI in education" } },
  { id: "digital-pedagogy", label: { es: "Pedagogía digital", en: "Digital pedagogy" } },
  { id: "case-studies", label: { es: "Casos de éxito", en: "Case studies" } },
  { id: "moodle-dev", label: { es: "Desarrollo Moodle", en: "Moodle development" } },
  { id: "community", label: { es: "Comunidad", en: "Community" } },
  { id: "sponsors", label: { es: "Sponsors & alianzas", en: "Sponsors & partners" } },
];

export interface BlogFAQ {
  q: { es: string; en: string };
  a: { es: string; en: string };
}

export interface BlogSEO {
  metaTitle: { es: string; en: string };
  metaDescription: { es: string; en: string };
  keywords: string[];
}

export interface BlogPost {
  slug: string;
  title: { es: string; en: string };
  excerpt: { es: string; en: string };
  body: { es: string; en: string }; // Markdown enriquecido
  date: string; // ISO publicación
  updatedAt?: string; // ISO última actualización
  author: string;
  category: BlogCategoryId;
  tags: string[];
  cover?: string;
  readingMinutes?: number;
  seo?: BlogSEO;
  faq?: BlogFAQ[];
}

// =================== POST 1 ===================
const post1Es = `
![Logo MoodleMoot Perú 2026](${logoEvento})

**MoodleMoot Perú 2026 ya tiene fecha oficial: el 18 y 19 de septiembre, en Lima.** Después de meses de coordinación con la comunidad Moodle de Latinoamérica, sponsors internacionales y la Universidad Marcelino Champagnat (UMCH), confirmamos el encuentro más importante del ecosistema Moodle en el Perú, con formato híbrido y transmisión en vivo para toda la región.

Este artículo recoge todo lo que necesitas saber sobre la edición 2026: fechas, sede, ejes temáticos, audiencia, agenda macro, cómo registrarse y las preguntas más frecuentes que nos llegan del público.

## Fechas confirmadas: 18 y 19 de septiembre de 2026

MoodleMoot Perú 2026 se realizará los días **viernes 18 y sábado 19 de septiembre de 2026**, en horario continuo de 8:30 a 18:30 (hora de Lima, GMT-5). Son dos jornadas completas de conferencias magistrales, talleres prácticos, paneles, espacios de networking y el tradicional **Moodle Expo** con stands de sponsors y partners certificados.

La elección de las fechas no es casual: coincide con la semana posterior a las Fiestas Patrias académicas y con el cierre del ciclo lectivo en muchas universidades, lo que permite a docentes y líderes EdTech participar sin choques con sus calendarios institucionales.

## Sede oficial: Universidad Marcelino Champagnat

El evento se desarrollará en el campus de la **[Universidad Marcelino Champagnat (UMCH)](https://umch.edu.pe/)**, ubicada en Santiago de Surco, Lima. La universidad pone a disposición su auditorio principal, aulas equipadas, espacios de coworking y zonas verdes para los descansos y el networking.

Si quieres conocer en detalle por qué elegimos esta sede, su infraestructura, cómo llegar y dónde hospedarte, te invitamos a leer nuestro artículo dedicado: [Sede oficial: Universidad Marcelino Champagnat (UMCH)](/blog/sede-universidad-marcelino-champagnat-umch).

![Sala híbrida con asistentes presenciales y participantes remotos](${hibridoMoodlemoot})

## Formato híbrido: presencial + virtual sincrónico

MoodleMoot Perú 2026 es un evento **híbrido real**, no una grabación que luego se sube a YouTube. Toda conferencia, taller y panel se transmite en vivo a través de nuestra plataforma virtual desarrollada sobre Moodle, con:

- **Salas paralelas** sincrónicas con chat en vivo y Q&A integrado.
- **Networking virtual** mediante cabinas Jitsi para reuniones 1 a 1.
- **Stands virtuales** de sponsors con asesores en vivo.
- **Reproducción on-demand** durante 90 días posteriores al evento para los registrados.

La modalidad presencial está limitada al aforo de la UMCH (aproximadamente 800 asistentes simultáneos en auditorio + 600 en aulas). La modalidad virtual no tiene cupo límite.

## Ejes temáticos 2026

Esta edición se organiza en torno a cinco ejes que reflejan las prioridades actuales del ecosistema Moodle en Latinoamérica:

1. **Inteligencia Artificial aplicada a la educación.** Asistentes IA en LMS, generación automática de evaluaciones, tutorías adaptativas, analítica predictiva del aprendizaje.
2. **Moodle 5.0 y Workplace.** Novedades de la plataforma, nuevas APIs, herramientas para educación corporativa.
3. **Pedagogía digital y diseño instruccional.** Microlearning, aprendizaje basado en proyectos, evaluación auténtica en entornos virtuales.
4. **Accesibilidad e inclusión.** WCAG 2.2 en cursos Moodle, lectura fácil, diseño universal del aprendizaje.
5. **Casos de éxito de instituciones peruanas y latinoamericanas.** Ministerios de educación, universidades públicas y privadas, empresas con academias internas.

## ¿Para quién es MoodleMoot Perú 2026?

El evento está pensado para cuatro perfiles principales:

- **Docentes y profesores universitarios** que ya usan Moodle o buscan dar el salto desde otras plataformas.
- **Diseñadores instruccionales y especialistas en e-learning** que quieren actualizarse en pedagogía digital y herramientas de IA.
- **Administradores y desarrolladores de Moodle** que necesitan dominar configuración avanzada, plugins, integraciones y APIs.
- **Líderes institucionales y de RRHH** (decanos, directores académicos, gerentes de capacitación) que toman decisiones de plataforma y estrategia digital.

Esperamos más de **2,000 asistentes únicos** entre presencial y virtual, provenientes principalmente de Perú, Colombia, Ecuador, Bolivia, Chile, México, España y Argentina.

![Pantalla mostrando agenda de un encuentro Moodle](${agendaMoodlemoot})

## Agenda macro

La agenda detallada se publica el 15 de junio de 2026, pero ya podemos adelantar la estructura general:

### Día 1 — Viernes 18 de septiembre

- **08:30 — 09:30:** Acreditación y café de bienvenida.
- **09:30 — 10:30:** Keynote inaugural a cargo de Moodle HQ.
- **10:45 — 13:00:** Bloque 1 (3 salas paralelas: IA, pedagogía digital, desarrollo).
- **13:00 — 14:30:** Almuerzo y networking presencial.
- **14:30 — 17:00:** Bloque 2 (talleres prácticos hands-on).
- **17:15 — 18:30:** Panel "Moodle en la educación pública peruana".

### Día 2 — Sábado 19 de septiembre

- **09:00 — 11:00:** Bloque 3 (casos de éxito y estudios de caso).
- **11:15 — 13:00:** Moodle Expo + sesiones express en stands de sponsors.
- **13:00 — 14:30:** Almuerzo.
- **14:30 — 16:30:** Bloque 4 (Moodle Workplace, accesibilidad, integraciones).
- **16:30 — 17:30:** Keynote de cierre + anuncio de MoodleMoot Perú 2027.
- **17:30 — 18:30:** Cóctel de despedida (presencial).

## Cómo registrarse

El registro es **gratuito** tanto para asistencia presencial como virtual. La modalidad presencial requiere confirmación adicional por correo debido al cupo limitado del campus.

[Regístrate gratis al evento](#register)

Pasos:

1. Pulsa el botón de registro y completa tus datos (nombre, correo, país, perfil profesional).
2. Selecciona modalidad: presencial o virtual.
3. Indica tus áreas de interés (esto personaliza tu agenda recomendada).
4. Recibe confirmación inmediata + recordatorios por correo.

> **Tip:** Si vas a viajar desde fuera de Lima, registra tu modalidad presencial cuanto antes. Cuando se agota el aforo, los registros pasan automáticamente a la lista de espera virtual.

## Crecimiento del evento en el Perú

MoodleMoot Perú no es un evento improvisado: lleva varias ediciones consolidándose como **referente regional** del ecosistema Moodle. Para entender el contexto y la proyección, te recomendamos leer: [Historia y proyección de MoodleMoot Perú: cómo crecimos hasta 2026](/blog/historia-moodlemoot-peru-crecimiento-proyeccion-2026).

## Preguntas frecuentes

Las dudas más comunes —costo, certificación, idioma, grabaciones, hospedaje— las respondemos en la sección FAQ al final de esta página.

---

**¿Listo para asistir?** Asegura tu lugar en la edición más ambiciosa de MoodleMoot Perú hasta la fecha.

[Regístrate gratis aquí](#register)
`;

const post1En = `
![MoodleMoot Perú 2026 logo](${logoEvento})

**MoodleMoot Perú 2026 has an official date: September 18 and 19, in Lima.** After months of coordination with the Latin American Moodle community, international sponsors and Universidad Marcelino Champagnat (UMCH), we confirm the most important Moodle ecosystem gathering in Peru, in hybrid format with live streaming for the entire region.

This article gathers everything you need to know about the 2026 edition: dates, venue, themes, audience, agenda, registration and the most frequent questions we receive.

## Confirmed dates: September 18 and 19, 2026

MoodleMoot Perú 2026 will take place on **Friday September 18 and Saturday September 19, 2026**, from 8:30 AM to 6:30 PM Lima time (GMT-5). Two full days of keynotes, hands-on workshops, panels, networking and the traditional **Moodle Expo** with sponsor and certified partner booths.

The dates fit the academic calendar of most Latin American universities, allowing teachers and EdTech leaders to attend without conflicts.

## Official venue: Universidad Marcelino Champagnat

The event will be held at the **[Universidad Marcelino Champagnat (UMCH)](https://umch.edu.pe/)** campus, located in Santiago de Surco, Lima. The university provides its main auditorium, equipped classrooms, coworking spaces and green areas.

For details about the venue, infrastructure, transportation and lodging, read our dedicated article: [Official venue: Universidad Marcelino Champagnat (UMCH)](/blog/sede-universidad-marcelino-champagnat-umch).

![Hybrid hall with on-site attendees and remote participants](${hibridoMoodlemoot})

## Hybrid format: on-site + synchronous virtual

MoodleMoot Perú 2026 is a **truly hybrid event**, not a recording uploaded later. Every keynote, workshop and panel is streamed live through our virtual platform built on Moodle, with:

- **Parallel synchronous rooms** with live chat and integrated Q&A.
- **Virtual networking** via Jitsi cabins for 1-on-1 meetings.
- **Sponsor virtual booths** with live advisors.
- **On-demand replay** for 90 days after the event for registered attendees.

On-site capacity is limited to UMCH's facilities (~800 in the auditorium + 600 across classrooms). Virtual attendance is unlimited.

## 2026 themes

This edition is organized around five tracks reflecting the current priorities of the Moodle ecosystem in Latin America:

1. **AI applied to education.** AI assistants in LMS, automatic assessment generation, adaptive tutoring, predictive learning analytics.
2. **Moodle 5.0 and Workplace.** Platform updates, new APIs, corporate learning tools.
3. **Digital pedagogy and instructional design.** Microlearning, project-based learning, authentic assessment in virtual environments.
4. **Accessibility and inclusion.** WCAG 2.2 in Moodle courses, easy reading, universal design for learning.
5. **Success stories from Peruvian and Latin American institutions.** Ministries of education, public and private universities, corporate academies.

## Who is MoodleMoot Perú 2026 for?

The event targets four main profiles:

- **University teachers and professors** already using Moodle or moving from other platforms.
- **Instructional designers and e-learning specialists** seeking updates on digital pedagogy and AI tools.
- **Moodle administrators and developers** who need advanced configuration, plugins, integrations and APIs.
- **Institutional and HR leaders** (deans, academic directors, training managers) making platform and digital strategy decisions.

We expect over **2,000 unique attendees** between on-site and virtual, primarily from Peru, Colombia, Ecuador, Bolivia, Chile, Mexico, Spain and Argentina.

![Screen showing a Moodle event agenda](${agendaMoodlemoot})

## Macro agenda

The detailed agenda will be published on June 15, 2026, but here is the structure:

### Day 1 — Friday, September 18

- **08:30 — 09:30:** Check-in and welcome coffee.
- **09:30 — 10:30:** Opening keynote by Moodle HQ.
- **10:45 — 13:00:** Block 1 (3 parallel rooms: AI, digital pedagogy, development).
- **13:00 — 14:30:** Lunch and on-site networking.
- **14:30 — 17:00:** Block 2 (hands-on workshops).
- **17:15 — 18:30:** Panel "Moodle in Peruvian public education".

### Day 2 — Saturday, September 19

- **09:00 — 11:00:** Block 3 (success stories and case studies).
- **11:15 — 13:00:** Moodle Expo + express sessions at sponsor booths.
- **13:00 — 14:30:** Lunch.
- **14:30 — 16:30:** Block 4 (Moodle Workplace, accessibility, integrations).
- **16:30 — 17:30:** Closing keynote + announcement of MoodleMoot Perú 2027.
- **17:30 — 18:30:** Farewell cocktail (on-site).

## How to register

Registration is **free** for both on-site and virtual modalities. On-site requires email confirmation due to campus capacity.

[Register for the event — free](#register)

Steps:

1. Click the register button and fill in your details (name, email, country, professional profile).
2. Choose modality: on-site or virtual.
3. Pick your areas of interest (this personalizes your recommended agenda).
4. Receive immediate confirmation + email reminders.

> **Tip:** If traveling from outside Lima, register on-site as soon as possible. When capacity is reached, registrations move automatically to the virtual waitlist.

## Event growth in Peru

MoodleMoot Perú is not an improvised event: it has consolidated through several editions as a **regional reference** for the Moodle ecosystem. To understand the context, read: [History and projection of MoodleMoot Perú](/blog/historia-moodlemoot-peru-crecimiento-proyeccion-2026).

## Frequently asked questions

The most common questions —cost, certification, language, recordings, lodging— are answered in the FAQ section at the bottom of this page.

---

**Ready to attend?** Secure your spot at the most ambitious edition of MoodleMoot Perú to date.

[Register for free here](#register)
`;

// =================== POST 2 ===================
const post2Es = `
![Fachada de la Universidad Marcelino Champagnat con las letras LICENCIAMIENTO de SUNEDU](${umchFachada})

**MoodleMoot Perú 2026 se realizará en la Universidad Marcelino Champagnat (UMCH), en Santiago de Surco, Lima.** Una sede que combina infraestructura moderna, ubicación estratégica y una vocación educativa alineada con el espíritu del evento: formar comunidades de aprendizaje significativas a través de la tecnología.

En este artículo te contamos todo sobre la sede: la historia de la UMCH, su infraestructura, cómo llegar, opciones de hospedaje y por qué la elegimos como casa oficial del evento.

## Universidad Marcelino Champagnat: una breve historia

La **Universidad Marcelino Champagnat (UMCH)** es una institución educativa peruana fundada por los Hermanos Maristas, perteneciente a la **red internacional Marista** presente en más de 80 países. Lleva el nombre de **San Marcelino Champagnat (1789-1840)**, sacerdote francés y fundador del Instituto de los Hermanos Maristas, dedicado a la educación de niños y jóvenes desde el siglo XIX.

La UMCH está **licenciada por SUNEDU** —el organismo peruano que garantiza la calidad universitaria— y forma parte del sistema universitario peruano con presencia consolidada en Lima Metropolitana. Su misión articula tres pilares: **excelencia académica, formación humana integral y compromiso social**, en línea con la pedagogía marista que privilegia la cercanía con el estudiante y el aprendizaje vivencial.

> "Educar es formar buenos cristianos y honestos ciudadanos." — San Marcelino Champagnat.

## Una universidad enfocada en la educación moderna

La UMCH ofrece programas de **Pregrado, Posgrado y Programas de especialización**, con una oferta académica especialmente fuerte en **Educación, Psicología, Administración e Ingeniería**. Esto la convierte en un escenario natural para un evento como MoodleMoot Perú: la conversación sobre tecnología educativa ocurre en una universidad que la vive todos los días.

Algunas de las características que destaca la propia universidad:

- **Infraestructura moderna** con aulas digitales y laboratorios.
- **Plataforma virtual de clases** propia, complementaria a la presencialidad.
- **Pertenencia a la red internacional Marista**, con programas de intercambio estudiantil.
- **Tutoría académica de refuerzo** y horario flexible.
- **Prácticas profesionales desde los primeros ciclos**.

Estos atributos resuenan con los temas centrales de MoodleMoot: pedagogía digital, aprendizaje activo, accesibilidad y formación continua.

![Estudiantes caminando por el campus de la Universidad Marcelino Champagnat](${umchCampusWalk})

## Infraestructura del evento

El campus de la UMCH habilitará para MoodleMoot Perú 2026 los siguientes espacios:

- **Auditorio principal** (capacidad ~800 personas) para keynotes y paneles.
- **Aulas paralelas** equipadas con proyector 4K, audio profesional y conectividad 1 Gbps para los talleres hands-on.
- **Sala de prensa y zona de creadores de contenido** para medios y partners.
- **Hall central y patios** para la **Moodle Expo** con stands de sponsors.
- **Zona de coworking y silencio** para reuniones de trabajo y networking 1 a 1.
- **Cafetería ampliada** con catering durante coffee breaks y almuerzos.
- **Estacionamiento** gratuito para asistentes presenciales (sujeto a disponibilidad).

Toda la sede cuenta con **accesibilidad universal**: rampas, ascensores, baños adaptados, lazo magnético en el auditorio y soporte de intérpretes de lengua de señas peruana en las keynotes principales.

## Ubicación: Santiago de Surco, Lima

Santiago de Surco es uno de los distritos más conectados de Lima Metropolitana, en la zona sureste de la ciudad. La UMCH se encuentra en una zona residencial tranquila pero con acceso rápido a las principales vías expresas: **Panamericana Sur, Vía Evitamiento y Av. Javier Prado**.

![Mapa estilizado de la ubicación de la UMCH en Surco, Lima](${umchMapa})

### Cómo llegar

- **Desde el aeropuerto Jorge Chávez (Callao):** ~45–60 minutos en taxi/Uber, según tráfico.
- **Desde Miraflores o San Isidro:** 25–35 minutos en transporte público o privado.
- **Metropolitano:** la estación más cercana se conecta vía corredor complementario hasta Surco.
- **Transporte propio:** estacionamiento disponible dentro del campus para asistentes con registro presencial confirmado.

Recomendamos usar **Uber, Cabify, Didi o InDriver** para mayor comodidad. Habrá señalización del evento desde la puerta principal del campus.

## Hospedaje recomendado

Si viajas desde fuera de Lima o desde otro país, te recomendamos hospedarte en **Surco, Miraflores o San Borja**, distritos seguros y bien comunicados con la sede:

- **Surco** (más cerca de la sede, 5–15 min): hoteles boutique y aparts en la zona de Chacarilla y Monterrico.
- **Miraflores** (zona turística, 25–35 min): mayor oferta hotelera, restaurantes y vida nocturna; ideal si combinas el evento con turismo.
- **San Isidro** (zona financiera, 25–35 min): hoteles 4–5 estrellas para perfil corporativo.

La organización está negociando **tarifas preferenciales** con cadenas hoteleras seleccionadas. Los códigos de descuento se comunican por correo a los asistentes registrados con modalidad presencial confirmada un mes antes del evento.

## ¿Por qué la UMCH?

Elegimos la Universidad Marcelino Champagnat por una combinación de razones técnicas y simbólicas:

1. **Capacidad y modularidad de espacios.** Permite alojar simultáneamente keynote masivo + 6 salas paralelas + Moodle Expo sin saturar el flujo de asistentes.
2. **Calidad de conectividad.** Red institucional de fibra que soporta la transmisión simultánea de múltiples salas en alta definición.
3. **Cercanía pedagógica.** La UMCH practica e investiga la pedagogía digital; el discurso del evento se alinea con la cotidianidad del campus.
4. **Accesibilidad universal** integrada en infraestructura, no como añadido temporal.
5. **Ubicación estratégica** en Lima, conectada con aeropuerto, hoteles y zona turística.
6. **Compromiso institucional.** El equipo directivo de la UMCH abraza el evento como una oportunidad de proyección académica y de servicio a la comunidad educativa peruana.

## Información oficial

Para detalles institucionales, programas académicos y noticias de la propia universidad, visita el sitio oficial: [https://umch.edu.pe/](https://umch.edu.pe/).

Y si aún no conoces las fechas, ejes y agenda macro del evento, lee primero: [MoodleMoot Perú 2026: fechas confirmadas](/blog/moodlemoot-peru-2026-fechas-confirmadas).

`;

const post2En = `
![Facade of Universidad Marcelino Champagnat with the LICENCIAMIENTO letters from SUNEDU](${umchFachada})

**MoodleMoot Perú 2026 will be held at Universidad Marcelino Champagnat (UMCH), in Santiago de Surco, Lima.** A venue that combines modern infrastructure, strategic location and an educational mission aligned with the spirit of the event: building meaningful learning communities through technology.

This article covers the venue: UMCH's history, infrastructure, how to get there, lodging options and why we chose it as the official home of the event.

## Universidad Marcelino Champagnat: a brief history

**Universidad Marcelino Champagnat (UMCH)** is a Peruvian higher-education institution founded by the Marist Brothers, part of the **international Marist network** present in over 80 countries. It is named after **Saint Marcellin Champagnat (1789-1840)**, French priest and founder of the Marist Brothers, devoted to the education of children and youth since the 19th century.

UMCH is **licensed by SUNEDU** —the Peruvian agency that guarantees university quality— and is part of the Peruvian university system with consolidated presence in Metropolitan Lima. Its mission articulates three pillars: **academic excellence, integral human formation and social commitment**, in line with the Marist pedagogy that values closeness to the student and experiential learning.

> "To educate is to form good Christians and honest citizens." — Saint Marcellin Champagnat.

## A university focused on modern education

UMCH offers **undergraduate, graduate and specialization programs**, with strong academic offerings in **Education, Psychology, Business and Engineering**. This makes it a natural setting for an event like MoodleMoot Perú: the conversation on educational technology happens at a university that lives it every day.

Some of the attributes the university itself highlights:

- **Modern infrastructure** with digital classrooms and labs.
- **Own virtual classroom platform** complementing on-campus learning.
- **Membership in the international Marist network**, with student exchange programs.
- **Academic tutoring and reinforcement** and flexible scheduling.
- **Professional internships starting from the first semesters**.

These attributes resonate with MoodleMoot's central themes: digital pedagogy, active learning, accessibility and continuous education.

![Students walking through the Universidad Marcelino Champagnat campus](${umchCampusWalk})

## Event infrastructure

The UMCH campus will provide the following spaces for MoodleMoot Perú 2026:

- **Main auditorium** (~800 capacity) for keynotes and panels.
- **Parallel classrooms** equipped with 4K projector, professional audio and 1 Gbps connectivity for hands-on workshops.
- **Press room and content creator zone** for media and partners.
- **Central hall and courtyards** for the **Moodle Expo** with sponsor booths.
- **Coworking and quiet zone** for work meetings and 1-on-1 networking.
- **Expanded cafeteria** with catering during coffee breaks and lunches.
- **Free parking** for on-site attendees (subject to availability).

The entire venue is **universally accessible**: ramps, elevators, adapted bathrooms, hearing loop in the auditorium and Peruvian Sign Language interpreters during the main keynotes.

## Location: Santiago de Surco, Lima

Santiago de Surco is one of the best-connected districts of Metropolitan Lima, in the southeast. UMCH is located in a quiet residential area with quick access to the main expressways: **Panamericana Sur, Vía Evitamiento and Av. Javier Prado**.

![Stylized map showing UMCH's location in Surco, Lima](${umchMapa})

### How to get there

- **From Jorge Chávez Airport (Callao):** ~45–60 minutes by taxi/Uber depending on traffic.
- **From Miraflores or San Isidro:** 25–35 minutes by public or private transport.
- **Metropolitano:** the closest station connects to Surco via a complementary corridor.
- **Private vehicle:** parking available on campus for confirmed on-site attendees.

We recommend using **Uber, Cabify, Didi or InDriver** for convenience. Event signage will guide you from the campus main gate.

## Recommended lodging

If traveling from outside Lima or from another country, we recommend staying in **Surco, Miraflores or San Borja** — safe districts well connected to the venue:

- **Surco** (closest to the venue, 5–15 min): boutique hotels and aparts in Chacarilla and Monterrico.
- **Miraflores** (touristic area, 25–35 min): wider hotel offer, restaurants and nightlife; ideal if you combine the event with tourism.
- **San Isidro** (financial district, 25–35 min): 4–5 star hotels for corporate profiles.

The organization is negotiating **preferential rates** with selected hotel chains. Discount codes are shared by email with registered on-site attendees one month before the event.

## Why UMCH?

We chose Universidad Marcelino Champagnat for a combination of technical and symbolic reasons:

1. **Capacity and modular spaces.** Hosts a massive keynote + 6 parallel rooms + Moodle Expo without saturating the flow of attendees.
2. **Connectivity quality.** Institutional fiber network supporting simultaneous multi-room HD streaming.
3. **Pedagogical alignment.** UMCH practices and researches digital pedagogy; the event discourse aligns with daily life on campus.
4. **Universal accessibility** integrated into the infrastructure, not added temporarily.
5. **Strategic location** in Lima, connected to airport, hotels and tourist zones.
6. **Institutional commitment.** UMCH leadership embraces the event as an opportunity for academic projection and service to the Peruvian education community.

## Official information

For institutional details, academic programs and university news, visit the official site: [https://umch.edu.pe/](https://umch.edu.pe/).

And if you don't yet know the dates, themes and macro agenda of the event, read first: [MoodleMoot Perú 2026: dates confirmed](/blog/moodlemoot-peru-2026-fechas-confirmadas).

`;

// =================== POST 3 ===================
const post3Es = `
![Asistentes aplaudiendo en una edición pasada de MoodleMoot Perú](${historiaEvento})

**MoodleMoot Perú nació pequeño, como una reunión técnica de administradores de Moodle, y hoy es el principal punto de encuentro del ecosistema EdTech del país.** Esta es la historia de cómo crecimos, qué hemos aprendido en cada edición y por qué la edición 2026 representa un salto cualitativo —no solo cuantitativo— en la madurez de la comunidad Moodle peruana.

Si vas a asistir por primera vez, este artículo te ayudará a entender el contexto. Y si nos acompañas desde las primeras ediciones, esta es también tu historia.

## ¿Qué es un MoodleMoot?

Un **MoodleMoot** es un encuentro oficial reconocido por **[Moodle HQ](https://moodle.com/)** —la organización con sede en Australia que mantiene el código de Moodle— donde la comunidad local de cada país o región se reúne para compartir experiencias, casos de uso, integraciones, plugins y novedades de la plataforma. Existen MoodleMoots en más de 30 países, desde Australia hasta España, México, Colombia, Brasil y, por supuesto, Perú.

Cada MoodleMoot tiene su propia personalidad. El de Perú destaca, según la propia comunidad, por dos cosas: **el peso del componente pedagógico** (no solo técnico) y **el alcance regional latinoamericano** que ha venido sumando edición tras edición.

## Las primeras ediciones: una comunidad técnica

Las primeras ediciones de MoodleMoot Perú fueron eventos pequeños, organizados por la comunidad de **administradores y desarrolladores Moodle** de universidades peruanas que necesitaban un espacio para resolver dudas técnicas, compartir personalizaciones y debatir sobre arquitectura de plataformas. Los asistentes se contaban por decenas, las charlas eran muy técnicas y el formato era un día único en una sala universitaria.

> En esa etapa, MoodleMoot Perú era un evento de la comunidad técnica para la comunidad técnica.

Lo importante es que ese núcleo —pequeño pero comprometido— **mantuvo viva la conversación local sobre Moodle**, incluso cuando la atención mediática estaba en otras plataformas. Sin esa base, lo que vendría después no habría sido posible.

![Crecimiento del evento en cifras](${historiaCrecimiento})

## La consolidación: pedagogía + tecnología

A partir de ediciones posteriores, el evento dio un giro estratégico importante: **incluyó de forma central a docentes, diseñadores instruccionales y líderes académicos**, no solo a perfiles técnicos. La lógica es simple: Moodle no es solo software, es una plataforma pedagógica, y su éxito depende tanto de la configuración técnica como de la práctica docente que se construye encima.

Este giro multiplicó la audiencia. La estructura del evento empezó a contemplar:

- **Salas paralelas** por perfil (técnico, pedagógico, directivo).
- **Talleres prácticos** además de conferencias magistrales.
- **Casos de éxito** de instituciones peruanas y latinoamericanas.
- **Espacios de networking** dedicados.

En las ediciones más recientes, MoodleMoot Perú ya recibía asistentes desde **Colombia, Ecuador, Bolivia, Chile, México, España y Argentina**, consolidándose como un evento de **proyección regional**, no solo nacional.

## El salto digital y el formato híbrido

La pandemia fue, paradójicamente, un acelerador. La comunidad MoodleMoot Perú aprendió a operar en formato **100% virtual sincrónico** sin perder la sensación de comunidad: chats activos, sesiones de Q&A en vivo, networking por cabinas virtuales, e incluso un Moodle Expo enteramente online.

Cuando el regreso a la presencialidad fue posible, no quisimos —ni la comunidad quiso— renunciar a la audiencia virtual. La modalidad **híbrida real** se convirtió en el estándar: cada conferencia se transmite en vivo, cada taller tiene chat moderado, cada stand de sponsor tiene un espejo digital.

Esto cambió el evento de manera definitiva: hoy, **la mayoría de asistentes son virtuales**, y eso amplía dramáticamente el alcance regional. Una docente de provincia o un desarrollador de Bogotá pueden participar sin viajar.

![Networking entre profesionales en una edición pasada](${historiaNetworking})

## Crecimiento del ecosistema Moodle en el Perú

Más allá del evento, el **ecosistema Moodle peruano** ha crecido en varios frentes:

1. **Universidades públicas y privadas** que adoptaron Moodle como plataforma institucional principal.
2. **Ministerios y organismos del Estado** que lo usan para programas de capacitación masiva (educadores, funcionarios).
3. **Empresas con academias internas** que migran a Moodle Workplace para formación corporativa.
4. **Proveedores certificados Moodle** locales que ofrecen integración, hosting, soporte y desarrollo a medida.
5. **Comunidad de desarrolladores** que contribuyen plugins, traducciones y reportes de bugs al core de Moodle.

Esta densidad de actores explica por qué un MoodleMoot tiene sentido en Perú: hay con quién conversar, hay casos para mostrar y hay decisiones que se toman en estos dos días que afectan a miles de estudiantes y trabajadores.

## Proyección 2026: ¿qué cambia esta edición?

La edición 2026 es la más ambiciosa hasta la fecha. Estos son los cambios clave respecto a ediciones anteriores:

- **Sede mayor y mejor equipada:** la [Universidad Marcelino Champagnat (UMCH)](/blog/sede-universidad-marcelino-champagnat-umch) en Surco, con auditorio para 800 personas y aulas para talleres simultáneos.
- **Eje fuerte en Inteligencia Artificial:** asistentes IA en LMS, generación automática de evaluaciones, tutoría adaptativa.
- **Moodle 5.0 en vivo:** novedades de la última versión del core.
- **Más sponsors internacionales** y participación oficial de Moodle HQ.
- **Plataforma virtual mejorada:** networking 1 a 1 vía Jitsi, stands con asesores en vivo, replay 90 días.
- **Programa académico revisado por pares**, con un comité científico integrado por referentes de la región.

Esperamos superar los **2,000 asistentes únicos**, con cobertura especial para participantes de regiones del Perú y de países hermanos.

## ¿Y después de 2026?

La proyección a mediano plazo es ambiciosa pero realista:

- **2027:** consolidar la **certificación oficial Moodle** durante el evento, con exámenes presenciales en la sede.
- **2028:** lanzar una **MoodleMoot LATAM itinerante** copatrocinada por varios países, rotando sede.
- **Permanente:** sostener la **comunidad entre ediciones** con webinars trimestrales, repositorio de recursos y mentorías para nuevos administradores.

El objetivo final no es agrandar el evento por agrandarlo, sino **fortalecer la red de personas y instituciones** que hacen posible una educación digital de calidad en Perú y en la región.

## Cómo ser parte de esta historia

La forma más directa es registrarse gratis a la edición 2026. La forma siguiente: postula como ponente cuando se abra la próxima convocatoria, propón un caso de éxito, ofrécete como voluntario, sé sponsor o invita a tu institución a sumarse.

[Regístrate gratis a MoodleMoot Perú 2026](#register)

Y si ya conoces las fechas y la sede, completa la lectura con: [MoodleMoot Perú 2026: fechas confirmadas](/blog/moodlemoot-peru-2026-fechas-confirmadas) y [Sede oficial: Universidad Marcelino Champagnat (UMCH)](/blog/sede-universidad-marcelino-champagnat-umch).

---

**Una comunidad se mide por lo que construye junta.** Gracias por hacer de MoodleMoot Perú lo que es hoy. Nos vemos el 18 y 19 de septiembre de 2026 en Lima.
`;

const post3En = `
![Attendees applauding at a past edition of MoodleMoot Perú](${historiaEvento})

**MoodleMoot Perú started small —as a technical meeting of Moodle administrators— and is today the main gathering of Peru's EdTech ecosystem.** This is the story of how we grew, what we have learned in each edition, and why the 2026 edition represents a qualitative leap —not just a quantitative one— in the maturity of the Peruvian Moodle community.

If this is your first edition, this article gives you the context. If you have been with us from the beginning, this is your story too.

## What is a MoodleMoot?

A **MoodleMoot** is an official gathering recognized by **[Moodle HQ](https://moodle.com/)** —the Australian organization that maintains Moodle's source code— where the local community of each country or region meets to share experiences, use cases, integrations, plugins and platform updates. MoodleMoots exist in more than 30 countries, from Australia to Spain, Mexico, Colombia, Brazil and, of course, Peru.

Each MoodleMoot has its own personality. The Peruvian one stands out, according to the community itself, for two things: **the weight of the pedagogical component** (not only technical) and the **regional Latin American reach** that has grown edition after edition.

## The early editions: a technical community

The first editions of MoodleMoot Perú were small events organized by the community of **Moodle administrators and developers** at Peruvian universities who needed a space to solve technical doubts, share customizations and discuss platform architecture. Attendance was in the dozens, talks were highly technical and the format was a single day in a university room.

> At that stage, MoodleMoot Perú was an event by the technical community for the technical community.

What matters is that this small but committed nucleus **kept the local conversation about Moodle alive**, even when media attention was on other platforms. Without that base, what came next would not have been possible.

![Event growth in numbers](${historiaCrecimiento})

## Consolidation: pedagogy + technology

In later editions, the event made a strategic turn: **it centrally included teachers, instructional designers and academic leaders**, not just technical profiles. The logic is simple: Moodle is not only software; it is a pedagogical platform, and its success depends as much on technical configuration as on the teaching practice built on top.

This turn multiplied the audience. The structure began to include:

- **Parallel rooms** by profile (technical, pedagogical, leadership).
- **Hands-on workshops** alongside keynotes.
- **Success stories** from Peruvian and Latin American institutions.
- **Dedicated networking spaces**.

In recent editions, MoodleMoot Perú already received attendees from **Colombia, Ecuador, Bolivia, Chile, Mexico, Spain and Argentina**, consolidating as a **regional event**, not just a national one.

## The digital leap and hybrid format

The pandemic was, paradoxically, an accelerator. The community learned to operate in **100% synchronous virtual format** without losing the sense of community: active chats, live Q&A, virtual networking cabins, even a fully online Moodle Expo.

When in-person was possible again, neither we nor the community wanted to give up the virtual audience. **True hybrid** became the standard: every keynote streamed live, every workshop with moderated chat, every sponsor booth with a digital mirror.

This changed the event definitively: today, **most attendees are virtual**, dramatically widening regional reach. A teacher from a Peruvian region or a developer from Bogotá can participate without traveling.

![Networking between professionals at a past edition](${historiaNetworking})

## Growth of the Moodle ecosystem in Peru

Beyond the event, the **Peruvian Moodle ecosystem** has grown on several fronts:

1. **Public and private universities** adopting Moodle as their main institutional platform.
2. **Ministries and government agencies** using it for massive training programs (teachers, public servants).
3. **Companies with internal academies** migrating to Moodle Workplace for corporate training.
4. **Local certified Moodle providers** offering integration, hosting, support and custom development.
5. **A developer community** contributing plugins, translations and bug reports to Moodle's core.

This density of actors explains why a MoodleMoot makes sense in Peru: there is someone to talk to, there are cases to showcase, and there are decisions made during these two days that affect thousands of students and workers.

## 2026 projection: what changes this edition?

The 2026 edition is the most ambitious to date. Key changes from previous editions:

- **Larger and better-equipped venue:** [Universidad Marcelino Champagnat (UMCH)](/blog/sede-universidad-marcelino-champagnat-umch) in Surco, with an 800-seat auditorium and parallel workshop rooms.
- **Strong AI focus:** AI assistants in LMS, automatic assessment generation, adaptive tutoring.
- **Moodle 5.0 live:** updates from the latest core version.
- **More international sponsors** and official Moodle HQ participation.
- **Improved virtual platform:** 1-on-1 networking via Jitsi, booths with live advisors, 90-day replay.
- **Peer-reviewed academic program** by a scientific committee of regional references.

We expect to exceed **2,000 unique attendees**, with special coverage for participants from Peruvian regions and sister countries.

## And after 2026?

The medium-term projection is ambitious but realistic:

- **2027:** consolidate **official Moodle certification** during the event, with on-site exams.
- **2028:** launch a **rotating MoodleMoot LATAM** co-sponsored by several countries.
- **Ongoing:** sustain the **community between editions** with quarterly webinars, resource repository and mentoring for new administrators.

The ultimate goal is not to grow the event for its own sake but to **strengthen the network of people and institutions** that make quality digital education possible in Peru and the region.

## How to be part of this story

The most direct way is to register for free for the 2026 edition. Then: apply as a speaker when the next call opens, propose a success story, volunteer, become a sponsor, or invite your institution to join.

[Register for free for MoodleMoot Perú 2026](#register)

And if you already know the dates and venue, complete your reading with: [MoodleMoot Perú 2026: dates confirmed](/blog/moodlemoot-peru-2026-fechas-confirmadas) and [Official venue: Universidad Marcelino Champagnat (UMCH)](/blog/sede-universidad-marcelino-champagnat-umch).

---

**A community is measured by what it builds together.** Thank you for making MoodleMoot Perú what it is today. See you on September 18 and 19, 2026, in Lima.
`;

// =================== POST 4 ===================
const post4Es = `
![MoodleMoot Perú 2026 — Adquiere tu entrada](${hibridoMoodlemoot})

**MoodleMoot Perú 2026** no es un evento más en tu calendario: es **la inversión más estratégica del año** para todo profesional del aprendizaje digital, administrador de plataformas Moodle, docente innovador, diseñador instruccional y líder EdTech de habla hispana. Los días **18 y 19 de septiembre de 2026**, en la **Universidad Marcelino Champagnat (UMCH)** de Surco, Lima, más de **2,000 asistentes** —presenciales y virtuales— se reunirán para acelerar, durante 48 horas, lo que normalmente toma años aprender por cuenta propia.

Si estás leyendo esto, es porque algo dentro de ti ya sabe que **no puedes quedarte fuera**. Este artículo te explica por qué asistir es la decisión más rentable que tomarás este 2026, cómo asegurar tu cupo antes de que se agoten y cómo aprovechar al máximo nuestra plataforma web para no perderte absolutamente nada.

> 🎟️ **[Adquiere tu entrada para MoodleMoot Perú 2026 aquí](/#tickets)** — Cupos estrictamente limitados, aforo en proceso de agotarse.

## ¿Por qué MoodleMoot Perú 2026 es una inversión, no un gasto?

Cuando inviertes en tu entrada para **MoodleMoot Perú 2026**, no estás pagando por dos días de conferencias: estás comprando un **atajo profesional** que multiplica tu valor en el mercado EdTech. El Retorno de Inversión (ROI) se mide en:

- **Habilidades concretas y aplicables** desde el lunes siguiente al evento: configuraciones avanzadas de Moodle, integración con IA generativa, automatización de evaluaciones, gamificación efectiva y analítica del aprendizaje.
- **Red de contactos profesionales de altísimo nivel**: directores académicos, CTOs educativos, partners certificados de Moodle HQ, consultores internacionales y representantes de universidades de toda Latinoamérica.
- **Certificación profesional garantizada**, válida para horas de capacitación reconocidas en tu institución.
- **Acceso preferente** a oportunidades laborales, proyectos freelance y alianzas que solo circulan dentro de la comunidad.

En otras palabras: lo que pagas por tu entrada lo recuperas con **un solo contacto bien hecho** o **una sola implementación exitosa** en tu plataforma. ¿Aún lo ves como gasto?

Si quieres entender mejor el contexto y la magnitud de esta edición, te recomendamos leer nuestro post oficial **[MoodleMoot Perú 2026: fechas confirmadas en Lima](/blog/moodlemoot-peru-2026-fechas-confirmadas)**, donde detallamos cada track temático y la agenda macro.

## Un formato híbrido pensado para que nadie se quede afuera

Sabemos que no todos pueden viajar a Lima. Por eso, **MoodleMoot Perú 2026** se realizará en formato **híbrido de alta calidad**:

- **Modalidad presencial** en el campus de la UMCH, una de las universidades maristas más prestigiosas del país, **licenciada por SUNEDU**, con auditorios de última generación, conectividad enterprise-grade y áreas dedicadas para networking.
- **Modalidad virtual** desde nuestra plataforma Moodle oficial, con interpretación simultánea español ⇄ inglés en las keynotes internacionales y replay on-demand durante 90 días.

¿Quieres saber por qué elegimos esta sede? Lee **[Sede oficial: Universidad Marcelino Champagnat (UMCH)](/blog/sede-universidad-marcelino-champagnat-umch)** y descubre cómo Surco se convierte en el epicentro EdTech de la región durante esos dos días.

> 🎟️ **[Adquiere tu entrada para MoodleMoot Perú 2026 aquí](/#tickets)** — Solo quedan cupos para los más decididos.

## Lo que vas a vivir: talleres, networking y certificación

### Talleres prácticos exclusivos

Olvídate de las charlas plagadas de teoría: en MoodleMoot Perú 2026 **te llevas a casa código, plantillas y flujos de trabajo listos para implementar**. Algunos de los talleres confirmados:

- **Moodle 5.0 + IA generativa**: cómo automatizar feedback formativo sin perder la voz docente.
- **Diseño instruccional con H5P avanzado**: actividades interactivas que multiplican la retención.
- **Administración de plataformas a escala**: tuning de rendimiento para 10,000+ usuarios concurrentes.
- **Analítica del aprendizaje** con Moodle + Power BI / Looker Studio.
- **Plugins y desarrollo** para equipos técnicos que quieren llevar Moodle al siguiente nivel.

### Networking de alto nivel

Cada break, cada almuerzo y cada espacio de la **Moodle Expo** está diseñado para que conozcas a las personas correctas. Aquí no se viene a escuchar pasivamente: **se viene a construir alianzas**. La historia de cómo crecimos hasta este punto la contamos en detalle en **[Historia y proyección de MoodleMoot Perú: cómo crecimos hasta 2026](/blog/historia-moodlemoot-peru-crecimiento-proyeccion-2026)** — léelo y entenderás por qué esta edición marca un antes y un después.

### Certificación profesional garantizada

Todos los asistentes registrados —presencial o virtual— reciben un **certificado digital con código QR de verificación**, válido para horas de capacitación profesional. Una credencial real que suma a tu CV y a tu perfil de LinkedIn.

> 🎟️ **[Adquiere tu entrada para MoodleMoot Perú 2026 aquí](/#tickets)** — El aforo se está agotando más rápido de lo previsto.

## 🔔 No te pierdas ni una sola actualización: activa estas 2 funciones en nuestra web

Hemos preparado nuestra plataforma web para que **vivas el evento desde antes de que empiece**. Te pedimos —en serio— que tomes 30 segundos para hacer estas dos acciones técnicas. Marcan la diferencia entre **enterarte tarde** y **ser el primero en saberlo todo**:

### 1. 🔔 Activa la campanita de notificaciones

En la esquina inferior de nuestra web verás un **botón con forma de campanita**. Haz clic, acepta los permisos del navegador y listo: recibirás avisos instantáneos cada vez que:

- Confirmemos un nuevo ponente internacional.
- Liberemos cupos adicionales (cuando esto ocurra, **se agotan en menos de una hora**).
- Activemos cupones de descuento por tiempo limitado.
- Publiquemos la agenda detallada y enlaces de salas virtuales.

### 2. 💻 Instala la web como aplicación en tu computadora (PWA)

Nuestra web es una **Progressive Web App (PWA)**. Esto significa que puedes **instalarla como una aplicación nativa** en tu escritorio, sin pasar por ninguna tienda y sin ocupar espacio. Busca el botón **"Instalar en computadora"** o el ícono de instalación en la barra de tu navegador (Chrome, Edge, Brave, Safari) y tendrás MoodleMoot Perú 2026 a **un solo clic** desde tu escritorio.

**Ventajas de tener la PWA instalada:**

- Acceso inmediato a la agenda, salas virtuales, chat y notificaciones.
- Funciona también desde tu celular como app nativa.
- Cero distracciones de pestañas del navegador durante las sesiones.
- Notificaciones push incluso con el navegador cerrado.

> ⚡ **Tip de oro:** Quienes tienen la PWA instalada + notificaciones activas son siempre los primeros en aprovechar nuestros cupones flash. No es coincidencia: es estrategia.

## 🎓 Atención especial: colegios, universidades, institutos y gremio educativo

Si representas a una **institución educativa** —colegio, universidad, instituto técnico, ONG educativa o red de docentes— tenemos **grandes sorpresas preparadas exclusivamente para ti** y tu equipo.

Estamos liberando **cupones de acción rápida** con descuentos que **no veremos repetidos** en futuras ediciones. Son **estrictamente limitados** y se asignan **por orden de llegada**: los primeros en escribirnos se los llevan.

### 🚨 ¿Cómo accedo al cupón institucional?

- **Escríbenos hoy mismo** desde el formulario de contacto de la web.
- Indica nombre de tu institución, número estimado de participantes y un contacto directo.
- Nuestro equipo te responderá con el **código de cupón exclusivo** y las condiciones (ventana de validez muy corta).

⏰ **No esperes a "verlo después".** Estos cupones se agotan literalmente **en horas**, y cada año dejamos a instituciones fuera porque escribieron tarde. **No queremos que te pase a ti.**

> 🎟️ **[Adquiere tu entrada para MoodleMoot Perú 2026 aquí](/#tickets)** — Y pregunta YA por tu cupón institucional.

## Lo que pasa si decides no asistir

Seamos honestos: en septiembre de 2026, **2,000 profesionales EdTech de la región** habrán dado un salto profesional concreto. Habrán cerrado contactos, descubierto herramientas, recibido certificaciones y vuelto a sus equipos con una visión renovada.

La pregunta no es **"¿puedo permitirme asistir?"**. La pregunta real es: **"¿puedo permitirme NO asistir?"**.

Cada edición de MoodleMoot Perú ha agotado cupos antes de lo previsto. Esta —por su formato híbrido, sede premium y agenda internacional— **se está agotando aún más rápido**. Cuando cerremos inscripciones, no habrá lista de espera ni excepciones.

## Resumen: tu plan de acción en 4 pasos

1. **🎟️ Adquiere tu entrada ahora** desde [esta página](/#tickets) — antes de que se agoten los cupos disponibles.
2. **🔔 Activa la campanita de notificaciones** en nuestra web para enterarte de todo en tiempo real.
3. **💻 Instala la web como app (PWA)** en tu computadora y celular para acceso instantáneo.
4. **🎓 Si eres del gremio educativo**, escríbenos HOY por el cupón institucional exclusivo.

Nos vemos el **18 y 19 de septiembre de 2026** en la **Universidad Marcelino Champagnat**, Surco, Lima — o conectado desde donde estés. La comunidad Moodle más grande del Perú te está esperando.

> 🎟️ **[Adquiere tu entrada para MoodleMoot Perú 2026 aquí](/#tickets)** — Esta es tu señal. No la dejes pasar.
`;

const post4En = `
![MoodleMoot Perú 2026 — Get your ticket](${hibridoMoodlemoot})

**MoodleMoot Perú 2026** is not just another event on your calendar: it is **the most strategic investment of the year** for every digital learning professional, Moodle administrator, innovative teacher, instructional designer and EdTech leader. On **September 18 and 19, 2026**, at **Universidad Marcelino Champagnat (UMCH)** in Surco, Lima, more than **2,000 attendees** —on-site and virtual— will gather to accelerate, in 48 hours, what normally takes years to learn on your own.

> 🎟️ **[Get your ticket for MoodleMoot Perú 2026 here](/#tickets)** — Strictly limited capacity, filling fast.

## Why MoodleMoot Perú 2026 is an investment, not an expense

When you invest in your ticket, you are buying a **professional shortcut** that multiplies your value in the EdTech market. ROI is measured in:

- **Concrete, applicable skills** from the Monday after the event.
- **Top-tier professional networking** with academic leaders, CTOs, Moodle Certified Partners and international consultants.
- **Guaranteed professional certification**, valid for recognized training hours.
- **Preferential access** to job opportunities and partnerships shared only within the community.

Read our official post **[MoodleMoot Perú 2026: dates confirmed in Lima](/blog/moodlemoot-peru-2026-fechas-confirmadas)** and our deep-dive on **[Official venue: Universidad Marcelino Champagnat (UMCH)](/blog/sede-universidad-marcelino-champagnat-umch)**.

## What you will experience

- **Hands-on workshops**: Moodle 5.0 + generative AI, advanced H5P, performance tuning, learning analytics, plugin development.
- **High-level networking** in every break and at the Moodle Expo.
- **Digital certification with QR verification** for all attendees.

Discover **[History and projection of MoodleMoot Perú: how we grew until 2026](/blog/historia-moodlemoot-peru-crecimiento-proyeccion-2026)** to understand why this edition is a turning point.

> 🎟️ **[Get your ticket for MoodleMoot Perú 2026 here](/#tickets)**

## 🔔 Two technical actions on our website you must take

### 1. Activate the notifications bell

Click the **bell icon** in the lower corner of our website and accept browser permissions. You will instantly receive new speaker confirmations, extra ticket releases (they sell out in under an hour), flash discount coupons and detailed agenda updates.

### 2. Install the website as an app (PWA)

Our website is a **Progressive Web App**. Click **"Install on computer"** or the install icon in your browser (Chrome, Edge, Brave, Safari) and get **one-click access** from your desktop — and from your phone as a native app. No app store, no extra disk space.

> ⚡ Attendees with the PWA installed + notifications enabled are always the first to grab flash coupons. It's strategy, not luck.

## 🎓 Exclusive for schools, universities and the education sector

If you represent a **school, university, institute, educational NGO or teachers' network**, we have **major surprises prepared exclusively for you**. We are releasing **fast-action coupons** with discounts we will not repeat in future editions. **First-come, first-served.**

### How to access the institutional coupon

- Write us today via the website contact form.
- Include your institution's name, estimated number of participants and a direct contact.
- Our team will reply with the **exclusive coupon code** (very short validity window).

⏰ **Don't wait.** These coupons sell out in hours.

> 🎟️ **[Get your ticket for MoodleMoot Perú 2026 here](/#tickets)** — And ask for your institutional coupon NOW.

## Your 4-step action plan

1. **🎟️ [Get your ticket now](/#tickets)** before capacity is reached.
2. **🔔 Activate the notifications bell** on our website.
3. **💻 Install the website as a PWA** on your computer and phone.
4. **🎓 Education sector?** Write us TODAY for the institutional coupon.

See you on **September 18 and 19, 2026** at **Universidad Marcelino Champagnat**, Surco, Lima — or connected from wherever you are.

> 🎟️ **[Get your ticket for MoodleMoot Perú 2026 here](/#tickets)** — This is your sign. Don't let it pass.
`;

const post5Es = `
# No te pierdas ni una sola notificación del MoodleMoot Perú 2026

¿Te imaginas enterarte tarde de la **liberación de cupos**, de un **taller exclusivo** o del **anuncio del keynote internacional**? En un evento con aforo limitado como **MoodleMoot Perú 2026**, llegar tarde a una notificación puede significar **quedarte fuera**.

Por eso hemos integrado en nuestra web dos funcionalidades clave que te permiten **estar siempre conectado** con el evento más importante de la comunidad Moodle en el país. Aquí te las mostramos.

![Ubicación de los botones de Instalar app y Recibir últimas noticias en moodlemootperu.com](${notificationsGuide})

## Las 2 funciones que NO puedes ignorar

En la imagen superior verás **dos botones señalados con flechas rojas**. Son tu acceso directo a toda la información del evento, en tiempo real:

### 🔔 1. Recibir últimas noticias (campana de notificaciones)

Ubicado **junto a la cuenta regresiva**, en el bloque principal del Hero. Es un botón naranja con el ícono de una **campana** y el texto **"Recibir últimas noticias"**.

**¿Qué hace?**
- Activa las **notificaciones push** del navegador.
- Te avisa al instante cuando publicamos **nuevas fechas, ponentes, talleres, descuentos o cambios logísticos**.
- Funciona en **Chrome, Edge, Firefox, Safari** (escritorio y móvil compatibles).

**¿Por qué activarla?**
- Los **cupones promocionales** se anuncian primero por esta vía.
- Los **cupos liberados de última hora** (cuando alguien cancela) se notifican aquí.
- Los **horarios de talleres premium** se confirman por notificación.

> 🔔 **Haz clic en la campana y acepta los permisos del navegador.** Toma 3 segundos y te asegura no perder ninguna oportunidad.

### 📲 2. Instalar app (PWA)

En la **esquina inferior izquierda** verás el botón naranja con el ícono de descarga y el texto **"Instalar app"**.

**¿Qué hace?**
- Instala la web del MoodleMoot Perú 2026 como una **aplicación nativa** en tu celular o computadora.
- Crea un **ícono en tu pantalla de inicio** (igual que cualquier app del Play Store o App Store).
- Funciona **sin conexión** para consultar agenda, ponentes y tu entrada.
- **Más rápida** que abrir el navegador y buscar el sitio.

**¿Por qué instalarla?**
- Tendrás la **agenda offline** durante los dos días del evento.
- Acceso de **un clic** al chat en vivo, mapa virtual y stands de patrocinadores.
- Las **notificaciones llegan como en una app nativa**, incluso con el navegador cerrado.

> 📲 **Haz clic en "Instalar app"** y confirma la instalación. Aparecerá en tu escritorio o pantalla de inicio en segundos.

![Diálogo de instalación de la aplicación MoodleMoot Perú 2026 en PC](${instalacionPwaPc})

*Así se ve el diálogo de instalación en tu computadora (Chrome / Edge). Solo presiona "Instalar" y tendrás la app en tu escritorio.*

## Cómo activar ambas funciones en menos de 1 minuto

1. **Entra a [moodlemootperu.com](/)** desde el navegador de tu celular o computadora.
2. **Haz clic en el botón naranja "Instalar app"** (esquina inferior izquierda).
3. **Confirma la instalación** cuando el navegador te lo pida.
4. **Abre la app instalada** desde tu pantalla de inicio.
5. **Haz clic en la campana 🔔 "Recibir últimas noticias"** en el Hero.
6. **Acepta los permisos** de notificación del navegador.

¡Listo! Ya estás 100% conectado con el evento.

## ¿Qué tipo de notificaciones recibirás?

- 🎟️ **Liberación de nuevos cupos** y precios promocionales.
- 🎤 **Confirmación de speakers internacionales** y temas exclusivos.
- 🛠️ **Inscripción a talleres prácticos** con cupos limitados.
- 🏛️ **Información logística de la sede** (UMCH, Lima).
- 💬 **Inicio de transmisiones en vivo** y sesiones de Q&A.
- 🎁 **Cupones exclusivos** solo para suscriptores de la web.

**No spam. Solo lo importante.** Puedes desactivarlas cuando quieras desde la configuración de tu navegador.

## El evento se acerca: cupos limitados

El MoodleMoot Perú 2026 se realizará los **18 y 19 de septiembre** en la **Universidad Marcelino Champagnat** (Lima). El aforo presencial es **estrictamente limitado** y se está agotando rápidamente.

> 🎟️ **[Adquiere tu entrada para MoodleMoot Perú 2026 aquí](/#tickets)** — Cupos limitados.

Y mientras esperas tu confirmación, **instala la app y activa la campana**. Así serás el primero en enterarte de todo lo nuevo del evento.

## Conclusión

La web del MoodleMoot Perú 2026 está diseñada para que **vivas el evento desde el primer clic**. Estos dos botones — la **campana de notificaciones** y el **botón de Instalar app** — son tu canal directo con el equipo organizador y la garantía de no perderte nada.

**Actívalos hoy. Asegura tu cupo. Vive el evento Moodle más grande del Perú.**

> 🎟️ **[Adquiere tu entrada para MoodleMoot Perú 2026 aquí](/#tickets)** — Nos vemos en Lima.
`;

const post5En = `
# Never miss a notification from MoodleMoot Perú 2026

Imagine finding out late about a **seat release**, an **exclusive workshop** or the **international keynote announcement**. In a limited-capacity event like **MoodleMoot Perú 2026**, being late to a notification can mean **missing out completely**.

That's why we integrated two key features on our website to keep you **always connected** to the most important Moodle community event in the country.

![Location of Install App and Get latest news buttons on moodlemootperu.com](${notificationsGuide})

## The 2 features you can't ignore

In the image above you'll see **two buttons marked with red arrows**. They are your direct access to all event information in real time.

### 🔔 1. Get latest news (notification bell)

Located **next to the countdown timer** in the Hero block. It's an orange button with a **bell icon** and the text **"Recibir últimas noticias"** (Get latest news).

**What it does:**
- Enables **browser push notifications**.
- Instantly alerts you about **new dates, speakers, workshops, discounts or logistics changes**.
- Works on **Chrome, Edge, Firefox, Safari** (desktop and mobile).

**Why enable it:**
- **Promo coupons** are announced here first.
- **Last-minute released seats** (from cancellations) are notified here.
- **Premium workshop schedules** are confirmed by notification.

> 🔔 **Click the bell and accept browser permissions.** Takes 3 seconds and guarantees you won't miss any opportunity.

### 📲 2. Install app (PWA)

In the **bottom-left corner** you'll see the orange button with a download icon and the text **"Instalar app"**.

**What it does:**
- Installs the MoodleMoot Perú 2026 website as a **native app** on your phone or computer.
- Creates an **icon on your home screen** (just like any Play Store or App Store app).
- Works **offline** to check agenda, speakers and your ticket.
- **Faster** than opening the browser and searching for the site.

**Why install it:**
- You'll have the **offline agenda** during the two days of the event.
- **One-click access** to live chat, virtual map and sponsor booths.
- Notifications arrive **like a native app**, even with the browser closed.

> 📲 **Click "Instalar app"** and confirm the installation.

![Installation dialog of the MoodleMoot Perú 2026 app on PC](${instalacionPwaPc})

*This is how the install dialog looks on your computer (Chrome / Edge). Just press "Instalar" and the app will be on your desktop.*

## Activate both features in under 1 minute

1. Go to **[moodlemootperu.com](/)** from your phone or computer browser.
2. Click the orange **"Instalar app"** button (bottom-left).
3. Confirm the installation when your browser asks.
4. Open the installed app from your home screen.
5. Click the bell 🔔 **"Recibir últimas noticias"** in the Hero.
6. Accept the browser notification permissions.

Done! You're 100% connected to the event.

## What kind of notifications will you receive?

- 🎟️ **New seat releases** and promo prices.
- 🎤 **International speaker confirmations**.
- 🛠️ **Hands-on workshop registration** with limited spots.
- 🏛️ **Venue logistics** (UMCH, Lima).
- 💬 **Live stream and Q&A start alerts**.
- 🎁 **Exclusive coupons** only for web subscribers.

**No spam. Just what matters.**

## The event is near: limited capacity

MoodleMoot Perú 2026 takes place **September 18-19** at **Universidad Marcelino Champagnat** (Lima). In-person capacity is **strictly limited** and selling out fast.

> 🎟️ **[Get your ticket for MoodleMoot Perú 2026 here](/#tickets)** — Limited seats.

While you wait for your confirmation, **install the app and activate the bell**.

## Conclusion

The MoodleMoot Perú 2026 website is designed for you to **live the event from the first click**. These two buttons — the **notification bell** and the **Install app button** — are your direct channel with the organizing team.

**Enable them today. Secure your seat. Live the largest Moodle event in Peru.**

> 🎟️ **[Get your ticket for MoodleMoot Perú 2026 here](/#tickets)** — See you in Lima.
`;

// =================== POST 6 — Convocatoria de Speakers ===================
const post6Es = `
# ¿Quieres ser Speaker del MoodleMoot Perú 2026?

![Quieres ser speaker de MoodleMoot Perú 2026 — 18 y 19 de septiembre, UMCH](${convocatoriaSpeakersCover})

**Diligencia el formulario y envía tu propuesta.** El MoodleMoot Perú 2026 abre oficialmente su convocatoria de ponentes los días **18 y 19 de septiembre de 2026**, en la **Universidad Marcelino Champagnat (Lima)**, bajo el lema *«Retos y oportunidades de la educación exponencial»*.

Si tienes una experiencia, investigación o caso de éxito con **Moodle**, **IA aplicada a educación** o **gestión EdTech**, este es tu escenario para compartirlo con la comunidad EdTech más grande del Perú.

---

## 📋 Cómo postularte — paso a paso

Postular toma menos de **3 minutos**. Sigue estos pasos:

### Paso 1 — Entra a la página principal y ve a **SPEAKERS**

Desde la [página principal de moodlemootperu.com](/), abre la pestaña **SPEAKERS** en el menú superior.

![Paso 1 — Navega a la pestaña SPEAKERS en el menú superior](${guiaPaso1})

### Paso 2 — Haz clic en **«Postúlate como Speaker»**

Al final de la sección de ponentes encontrarás el botón naranja **«Postúlate como Speaker»**. Haz clic para abrir el formulario de postulación.

![Paso 2 — Haz clic en el botón "Postúlate como Speaker"](${guiaPaso2})

### Paso 3 — Completa tus datos y envía tu propuesta

Llena el formulario con tu **nombre completo, email, WhatsApp y país**. En el paso 2 indicarás el **título de tu ponencia, el eje temático y un breve resumen (abstract)**.

![Paso 3 — Completa el formulario de postulación como speaker](${guiaPaso3})

> 🎤 **[Postula ahora como ponente](#postular-ponente)** — Abre el formulario sin salir de este post.

---

## 🎯 Ejes temáticos 2026

Tu propuesta debe enmarcarse en uno de los **tres ejes oficiales**:

1. **Tecnologías emergentes** — IA local en LMS, realidad extendida (XR), evaluación automática con IA.
2. **Experiencias de aprendizaje** — personalización, engagement 3.0, lifelong learning y microcredenciales.
3. **Nuevos modelos de gestión** — analítica predictiva, educación sostenible y transformación organizacional EdTech.

---

## 👥 ¿A quién buscamos?

- Docentes, diseñadores instruccionales y administradores Moodle.
- Desarrolladores de plugins, LTI, H5P o Moodle Workplace.
- Investigadores en IA educativa y analítica de aprendizaje.
- Líderes EdTech de universidades, MINEDU, fuerzas armadas, banca, retail y salud.

---

## 🏅 Beneficios para ponentes seleccionados

- Espacio reservado en la **agenda oficial**.
- **Certificado oficial** como ponente del MoodleMoot Perú 2026.
- Difusión de tu perfil en redes, web y campañas push.
- **Networking** con sponsors internacionales y comunidad Moodle LATAM.
- Acceso completo a los dos días (presencial + virtual).
- **Grabación profesional** de tu sesión.

---

## 📅 Fechas clave

- **Apertura de convocatoria:** 18 de junio de 2026.
- **Cierre de postulaciones:** 31 de julio de 2026.
- **Notificación a seleccionados:** 15 de agosto de 2026.
- **Evento:** **18 y 19 de septiembre de 2026** — [UMCH, Lima](/blog/sede-universidad-marcelino-champagnat-umch).

> 🎤 **[Quiero postular como speaker](#postular-ponente)** — Cupos por eje temático limitados.

---

## 🔗 Enlaces útiles

- 📅 [Fechas confirmadas del evento](/blog/moodlemoot-peru-2026-fechas-confirmadas)
- 🎟️ [Adquiere tu entrada (inversión EdTech)](/blog/moodlemoot-peru-2026-adquiere-tu-entrada-inversion)
- 🏛️ [Conoce la sede: UMCH](/blog/sede-universidad-marcelino-champagnat-umch)
- 🔔 [Activa notificaciones y PWA](/blog/notificaciones-y-pwa-moodlemoot-peru-2026)

**Te esperamos en el escenario más importante del ecosistema Moodle del Perú.** #mootPE26
`;

const post6En = `
# Want to be a Speaker at MoodleMoot Perú 2026?

![Want to be a speaker at MoodleMoot Perú 2026 — September 18-19, UMCH](${convocatoriaSpeakersCover})

**Fill in the form and submit your proposal.** MoodleMoot Perú 2026 officially opens its speaker call for **September 18-19, 2026**, at **Universidad Marcelino Champagnat (Lima)**, under the theme *"Challenges and opportunities of exponential education"*.

If you have an experience, research project or success story with **Moodle**, **AI applied to education** or **EdTech management**, this is your stage to share it with the largest EdTech community in Peru.

---

## 📋 How to apply — step by step

It takes less than **3 minutes**. Follow these steps:

### Step 1 — Go to the home page and open **SPEAKERS**

From [moodlemootperu.com](/), open the **SPEAKERS** tab in the top menu.

![Step 1 — Navigate to the SPEAKERS tab in the top menu](${guiaPaso1})

### Step 2 — Click **"Postúlate como Speaker"**

At the end of the speakers section you'll find the orange button **"Postúlate como Speaker"**. Click it to open the application form.

![Step 2 — Click the "Postúlate como Speaker" button](${guiaPaso2})

### Step 3 — Fill in your details and submit your proposal

Complete the form with your **full name, email, WhatsApp and country**. In step 2 you'll provide your **talk title, thematic axis and short abstract**.

![Step 3 — Fill in the speaker application form](${guiaPaso3})

> 🎤 **[Apply now as a speaker](#postular-ponente)** — Opens the form without leaving this post.

---

## 🎯 Thematic axes 2026

Your proposal must fit into one of the **three official axes**:

1. **Emerging technologies** — local AI in LMS, extended reality (XR), automated AI assessment.
2. **Learning experiences** — personalization, engagement 3.0, lifelong learning and microcredentials.
3. **New management models** — predictive analytics, sustainable education and EdTech organizational transformation.

---

## 👥 Who are we looking for?

- Teachers, instructional designers and Moodle administrators.
- Plugin, LTI, H5P or Moodle Workplace developers.
- AI in education researchers and learning analytics specialists.
- EdTech leaders from universities, ministries, defense, banking, retail and healthcare.

---

## 🏅 Benefits for selected speakers

- Reserved slot in the **official agenda**.
- **Official certificate** as a MoodleMoot Perú 2026 speaker.
- Profile promotion across social media, web and push campaigns.
- **Networking** with international sponsors and the LATAM Moodle community.
- Full access to both days (in-person + virtual).
- **Professional recording** of your session.

---

## 📅 Key dates

- **Call opens:** June 18, 2026.
- **Submissions close:** July 31, 2026.
- **Selection notice:** August 15, 2026.
- **Event:** **September 18-19, 2026** — [UMCH, Lima](/blog/sede-universidad-marcelino-champagnat-umch).

> 🎤 **[I want to apply as a speaker](#postular-ponente)** — Limited slots per thematic axis.

---

## 🔗 Useful links

- 📅 [Event dates confirmed](/blog/moodlemoot-peru-2026-fechas-confirmadas)
- 🎟️ [Get your ticket (EdTech investment)](/blog/moodlemoot-peru-2026-adquiere-tu-entrada-inversion)
- 🏛️ [Meet the venue: UMCH](/blog/sede-universidad-marcelino-champagnat-umch)
- 🔔 [Enable notifications and PWA](/blog/notificaciones-y-pwa-moodlemoot-peru-2026)

**We're waiting for you on the most important stage of Peru's Moodle ecosystem.** #mootPE26
`;

// =================== POST 7 — Sectores dirigidos ===================
const post7Es = `
![Sectores participantes en MoodleMoot Perú 2026: universidades, gobierno, ONGs y empresas](${sectoresCover})

El ecosistema del aprendizaje virtual está en constante evolución, y mantenerse a la vanguardia es fundamental para cualquier organización que quiera transformar la forma en que sus personas aprenden. Con esto en mente llega el **MoodleMoot Perú 2026**, el evento de tecnología educativa más esperado de la región, organizado por la [Universidad Marcelino Champagnat](https://umch.edu.pe/) (Licenciada por SUNEDU) e **Industria e**.

Si te estás preguntando si este evento es para tu perfil o el de tu organización, la respuesta corta es **sí**. El MoodleMoot Perú 2026 está diseñado como un punto de encuentro multidisciplinario para compartir conocimiento, descubrir nuevas herramientas Moodle, conocer casos de éxito de Latinoamérica y construir redes de contacto realmente valiosas para el sector EdTech.

A continuación, los cuatro grandes sectores a los que está dirigido este evento y por qué cada uno encontrará contenido diseñado a su medida.

## 1. Instituciones académicas 🏫

El corazón de la educación. Este sector incluye **universidades, institutos de educación superior y centros de formación académica** que ya usan Moodle como su plataforma LMS o que están evaluando dar el salto desde otra herramienta.

Si tu institución busca mejorar sus metodologías de enseñanza, optimizar su campus virtual, integrar inteligencia artificial en el aula y ofrecer una experiencia de usuario excepcional a sus estudiantes, aquí encontrarás:

- Casos de éxito de universidades peruanas y latinoamericanas.
- Talleres prácticos de Moodle 5.0, plugins, analítica de aprendizaje y accesibilidad.
- Espacios con diseñadores instruccionales y líderes académicos de la región.

## 2. Agencias y entidades del sector público 🏛️

La innovación educativa también es una prioridad del Estado. El evento está dirigido a **agencias gubernamentales, ministerios y entidades del ámbito estatal** que necesitan modernizar sus procesos de capacitación interna o desplegar programas educativos masivos para la ciudadanía usando entornos virtuales de aprendizaje.

En MoodleMoot Perú 2026 encontrarás cómo instituciones públicas de la región están usando Moodle para:

- Capacitación interna a gran escala de funcionarios públicos.
- Programas de alfabetización digital y formación ciudadana.
- Plataformas oficiales de educación continua con miles de usuarios concurrentes.

## 3. ONGs y organizaciones sin fines de lucro 🤝

El impacto social y la educación van de la mano. Las **entidades sin fines de lucro dedicadas a la promoción de la educación y el desarrollo comunitario** encontrarán en el MoodleMoot un espacio ideal para descubrir cómo la tecnología puede escalar el alcance de sus proyectos, facilitando el acceso al conocimiento en comunidades vulnerables o en zonas rurales.

Este espacio está pensado especialmente para ONGs, fundaciones y proyectos de cooperación internacional que quieren:

- Diseñar programas de e-learning con bajo costo operativo.
- Aprovechar Moodle en entornos con conectividad limitada.
- Medir el impacto real de sus intervenciones educativas.

## 4. Empresas y sector privado 💼

La capacitación corporativa es clave para el éxito empresarial. Este espacio está diseñado para **organizaciones del sector privado interesadas en implementar soluciones educativas digitales**: academias corporativas, áreas de gestión humana, EdTechs y empresas que venden formación en línea.

Ya sea para el onboarding de nuevos talentos, la formación continua de colaboradores, la certificación de clientes o la venta de cursos, en MoodleMoot Perú 2026 verás cómo **Moodle Workplace** y el ecosistema Moodle se adaptan a necesidades comerciales reales, con retorno de inversión medible.

## Sé parte de la innovación educativa

MoodleMoot Perú 2026 no es solo un ciclo de conferencias: es una oportunidad para colaborar, aprender de expertos internacionales y ser parte de una comunidad global que está redefiniendo el futuro del e-learning.

No importa de qué sector provengas: si tu objetivo es transformar la manera en que las personas aprenden, este es el lugar donde debes estar.

### Explora más antes de asegurar tu cupo

- 📅 [Fechas confirmadas del evento](/blog/moodlemoot-peru-2026-fechas-confirmadas)
- 🏛️ [Conoce la sede: UMCH](/blog/sede-universidad-marcelino-champagnat-umch)
- 🎟️ [Por qué es la inversión EdTech del año](/blog/moodlemoot-peru-2026-adquiere-tu-entrada-inversion)

[Adquiere tu entrada](#tickets)

Únete a la conversación en redes sociales con el hashtag oficial: **#mootPE26**
`;

const post7En = `
![Sectors joining MoodleMoot Perú 2026: universities, government, NGOs and companies](${sectoresCover})

The virtual learning ecosystem is in constant evolution, and staying at the forefront is essential for any organization that wants to transform the way its people learn. With that in mind comes **MoodleMoot Perú 2026**, the most anticipated EdTech event in the region, organized by [Universidad Marcelino Champagnat](https://umch.edu.pe/) (Licensed by SUNEDU) and **Industria e**.

If you're wondering whether this event fits your profile or your organization's, the short answer is **yes**. MoodleMoot Perú 2026 is designed as a multidisciplinary meeting point to share knowledge, discover new Moodle tools, learn from Latin American success stories and build valuable EdTech networks.

Here are the four main sectors this event is aimed at, and why each one will find content tailored to them.

## 1. Academic institutions 🏫

The heart of education. This sector includes **universities, higher-education institutes and academic training centers** already using Moodle as their LMS or evaluating a switch from another platform.

If your institution wants to improve teaching methodologies, optimize its virtual campus, integrate AI in the classroom and deliver an outstanding user experience to students, you'll find:

- Success stories from Peruvian and Latin American universities.
- Hands-on workshops on Moodle 5.0, plugins, learning analytics and accessibility.
- Spaces with instructional designers and academic leaders from across the region.

## 2. Government agencies and public sector 🏛️

Educational innovation is also a state priority. The event is aimed at **government agencies, ministries and public entities** that need to modernize internal training or deploy massive educational programs for citizens using virtual learning environments.

At MoodleMoot Perú 2026 you'll see how public institutions in the region use Moodle for:

- Large-scale internal training for civil servants.
- Digital literacy and citizen training programs.
- Official continuous-education platforms with thousands of concurrent users.

## 3. NGOs and non-profits 🤝

Social impact and education go hand in hand. **Non-profits dedicated to promoting education and community development** will find MoodleMoot an ideal space to discover how technology can scale their projects, bringing knowledge to vulnerable communities and rural areas.

This space is designed for NGOs, foundations and international cooperation projects that want to:

- Design low-cost e-learning programs.
- Leverage Moodle in low-connectivity environments.
- Measure the real impact of their educational interventions.

## 4. Companies and private sector 💼

Corporate training is key to business success. This space is designed for **private-sector organizations implementing digital learning solutions**: corporate academies, HR teams, EdTechs and companies that sell online training.

Whether it's onboarding new talent, continuous training, customer certification or selling courses, MoodleMoot Perú 2026 shows how **Moodle Workplace** and the wider Moodle ecosystem adapt to real business needs with measurable ROI.

## Be part of the educational innovation

MoodleMoot Perú 2026 is not just a conference cycle: it's an opportunity to collaborate, learn from international experts and join a global community redefining the future of e-learning.

No matter your sector: if your goal is to transform how people learn, this is where you need to be.

### Explore more before securing your spot

- 📅 [Confirmed event dates](/blog/moodlemoot-peru-2026-fechas-confirmadas)
- 🏛️ [Meet the venue: UMCH](/blog/sede-universidad-marcelino-champagnat-umch)
- 🎟️ [Why it's the EdTech investment of the year](/blog/moodlemoot-peru-2026-adquiere-tu-entrada-inversion)

[Get your ticket](#tickets)

Join the conversation on social media with the official hashtag: **#mootPE26**
`;

export const POSTS: BlogPost[] = [
  {
    slug: "sectores-dirigidos-moodlemoot-peru-2026",
    title: {
      es: "¿Para quién es el MoodleMoot Perú 2026? Sectores que transformarán la educación digital",
      en: "Who is MoodleMoot Perú 2026 for? Sectors reshaping digital education",
    },
    excerpt: {
      es: "Universidades, gobierno, ONGs y empresas: descubre los 4 sectores a los que está dirigido el MoodleMoot Perú 2026 y qué contenido encontrará cada uno.",
      en: "Universities, government, NGOs and companies: discover the 4 sectors MoodleMoot Perú 2026 is aimed at and what each one will find.",
    },
    body: { es: post7Es, en: post7En },
    date: "2026-07-09",
    author: "Equipo MoodleMoot Perú",
    category: "community",
    tags: ["sectores", "universidades", "empresas", "ongs", "gobierno", "capacitacion", "e-learning", "moodlemoot", "2026"],
    cover: sectoresCover,
    readingMinutes: 6,
    seo: {
      metaTitle: {
        es: "¿Para quién es el MoodleMoot Perú 2026? Sectores participantes",
        en: "Who is MoodleMoot Perú 2026 for? Sectors invited",
      },
      metaDescription: {
        es: "Universidades, agencias del Estado, ONGs y empresas: los 4 sectores del MoodleMoot Perú 2026 (18-19 sept, UMCH Lima). Descubre qué encontrará cada uno.",
        en: "Universities, government agencies, NGOs and companies: the 4 sectors of MoodleMoot Perú 2026 (Sept 18-19, UMCH Lima). See what each one will find.",
      },
      keywords: [
        "MoodleMoot Perú sectores",
        "Moodle para universidades",
        "Moodle empresas Perú",
        "Moodle ONG",
        "Moodle sector público",
        "capacitación corporativa Moodle",
        "e-learning Perú 2026",
        "Moodle Workplace Latinoamérica",
      ],
    },
    faq: [
      {
        q: {
          es: "¿Sirve el MoodleMoot si mi universidad aún no usa Moodle?",
          en: "Is MoodleMoot useful if my university doesn't use Moodle yet?",
        },
        a: {
          es: "Sí. Hay tracks pensados para instituciones que están evaluando migrar a Moodle desde otra plataforma LMS, con talleres de arranque, comparativas y casos de éxito de universidades peruanas y latinoamericanas.",
          en: "Yes. There are tracks for institutions evaluating a switch to Moodle from another LMS, with onboarding workshops, comparisons and success stories from universities across Latin America.",
        },
      },
      {
        q: {
          es: "¿Hay contenido específico para empresas y áreas de RRHH?",
          en: "Is there specific content for companies and HR teams?",
        },
        a: {
          es: "Sí. Uno de los ejes cubre Moodle Workplace, academias corporativas, onboarding digital y venta de cursos en línea, con enfoque en ROI y métricas para negocio.",
          en: "Yes. One of the tracks covers Moodle Workplace, corporate academies, digital onboarding and selling courses online, with a focus on ROI and business metrics.",
        },
      },
      {
        q: {
          es: "¿El evento ofrece casos de éxito del sector público?",
          en: "Are there public-sector success stories at the event?",
        },
        a: {
          es: "Sí. Habrá paneles con ministerios y agencias del Estado que usan Moodle para capacitar funcionarios y desplegar programas ciudadanos a gran escala.",
          en: "Yes. Panels will feature ministries and public agencies using Moodle to train civil servants and deploy citizen programs at scale.",
        },
      },
      {
        q: {
          es: "¿Puede asistir mi ONG regional de forma virtual?",
          en: "Can my regional NGO attend virtually?",
        },
        a: {
          es: "Sí. El evento es 100% híbrido: puedes participar en vivo desde cualquier parte de Latinoamérica y acceder a las grabaciones on-demand después del evento.",
          en: "Yes. The event is fully hybrid: you can join live from anywhere in Latin America and access on-demand recordings afterwards.",
        },
      },
      {
        q: {
          es: "¿Dónde consigo mi entrada?",
          en: "Where can I get my ticket?",
        },
        a: {
          es: "Directamente desde este sitio con el botón 'Tu entrada' del menú superior o desde el CTA de este artículo. Los cupos presenciales en la UMCH son limitados.",
          en: "Directly on this site via the 'Get ticket' button in the top menu or the CTA in this article. In-person seats at UMCH are limited.",
        },
      },
    ],
  },
  {
    slug: "convocatoria-speakers-moodlemoot-peru-2026",
    title: {
      es: "Convocatoria de Speakers — MoodleMoot Perú 2026",
      en: "Call for Speakers — MoodleMoot Perú 2026",
    },
    excerpt: {
      es: "Postula como ponente al MoodleMoot Perú 2026 (18-19 sept, Lima). Keynotes, talleres y casos de éxito en Moodle, IA educativa y EdTech. Convocatoria abierta a LATAM.",
      en: "Apply as a speaker for MoodleMoot Perú 2026 (Sept 18-19, Lima). Keynotes, workshops and success stories on Moodle, AI in education and EdTech. Open call across LATAM.",
    },
    body: { es: post6Es, en: post6En },
    date: "2026-06-18",
    author: "Equipo MoodleMoot Perú",
    category: "announcements",
    tags: ["convocatoria", "speakers", "ponentes", "call-for-papers", "moodlemoot", "2026", "postulacion"],
    cover: convocatoriaSpeakersCover,
    readingMinutes: 7,
    seo: {
      metaTitle: {
        es: "Convocatoria de Speakers MoodleMoot Perú 2026 | Postula tu ponencia",
        en: "Speaker Call MoodleMoot Perú 2026 | Submit your talk",
      },
      metaDescription: {
        es: "Postula como ponente al MoodleMoot Perú 2026 (18-19 sept en UMCH Lima). Keynotes, talleres y casos de éxito Moodle/IA. Convocatoria abierta a LATAM.",
        en: "Apply as a speaker for MoodleMoot Perú 2026 (Sept 18-19, UMCH Lima). Keynotes, workshops and Moodle/AI success stories. Open call across LATAM.",
      },
      keywords: [
        "convocatoria speakers MoodleMoot Perú",
        "postular ponente Moodle 2026",
        "call for speakers Moodle Latinoamérica",
        "ponentes Moodle Lima",
        "propuesta ponencia MoodleMoot",
        "taller Moodle UMCH",
      ],
    },
    faq: [
      {
        q: {
          es: "¿Puedo postular si vivo fuera del Perú?",
          en: "Can I apply if I live outside Peru?",
        },
        a: {
          es: "Sí. La convocatoria es abierta a toda Latinoamérica y el mundo hispanohablante. Puedes elegir modalidad presencial (Lima) o remota (transmisión en vivo).",
          en: "Yes. The call is open to all of Latin America and the Spanish-speaking world. You may choose in-person (Lima) or remote (live stream) modality.",
        },
      },
      {
        q: {
          es: "¿En qué idioma debo presentar mi ponencia?",
          en: "What language should my talk be in?",
        },
        a: {
          es: "Idealmente en español, pero aceptamos ponencias en inglés con traducción simultánea coordinada por la organización para keynotes seleccionados.",
          en: "Ideally Spanish. We accept English talks with simultaneous interpretation arranged by the organization for selected keynotes.",
        },
      },
      {
        q: {
          es: "¿La organización cubre pasajes o alojamiento?",
          en: "Does the organization cover travel or lodging?",
        },
        a: {
          es: "Para keynotes internacionales seleccionados, la organización puede coordinar pasajes y alojamiento según disponibilidad del sponsor académico. El resto de ponentes asume sus gastos.",
          en: "For selected international keynotes, the organization may coordinate travel and lodging subject to academic sponsor availability. Other speakers cover their own costs.",
        },
      },
      {
        q: {
          es: "¿Puedo postular una ponencia en equipo (co-ponentes)?",
          en: "Can I submit a co-presented talk?",
        },
        a: {
          es: "Sí. Puedes indicar hasta 3 co-ponentes en el formulario. Todos recibirán certificado oficial.",
          en: "Yes. You may list up to 3 co-presenters in the form. All will receive the official certificate.",
        },
      },
      {
        q: {
          es: "¿Cuándo se conocerán los resultados?",
          en: "When will results be announced?",
        },
        a: {
          es: "El comité académico notificará a los seleccionados el 15 de agosto de 2026 vía correo electrónico. La agenda oficial se publicará el 25 de agosto.",
          en: "The academic committee will notify selected speakers on August 15, 2026 by email. The official agenda will be published on August 25.",
        },
      },
      {
        q: {
          es: "¿Hasta cuándo puedo postular?",
          en: "What's the deadline?",
        },
        a: {
          es: "El cierre de postulaciones es el 31 de julio de 2026. Recomendamos enviar tu propuesta lo antes posible: los cupos de talleres prácticos son limitados.",
          en: "Deadline is July 31, 2026. We recommend submitting early — hands-on workshop slots are limited.",
        },
      },
    ],
  },
  {
    slug: "notificaciones-y-pwa-moodlemoot-peru-2026",
    title: {
      es: "No te pierdas ni una sola notificación del MoodleMoot Perú 2026",
      en: "Never miss a notification from MoodleMoot Perú 2026",
    },
    excerpt: {
      es: "Activa la campana de notificaciones e instala la app (PWA) de la web del MoodleMoot Perú 2026. Dos funciones clave para no perderte cupos, talleres ni anuncios.",
      en: "Enable the notification bell and install the PWA of MoodleMoot Perú 2026. Two key features so you don't miss seats, workshops or announcements.",
    },
    body: { es: post5Es, en: post5En },
    date: "2026-06-16",
    author: "Equipo MoodleMoot Perú",
    category: "announcements",
    tags: ["notificaciones", "pwa", "instalar app", "campana", "alertas", "moodlemoot"],
    cover: notificationsGuide,
    readingMinutes: 6,
    seo: {
      metaTitle: {
        es: "Notificaciones y App MoodleMoot Perú 2026 | No te pierdas nada",
        en: "Notifications & App MoodleMoot Perú 2026 | Don't miss anything",
      },
      metaDescription: {
        es: "Activa la campana de notificaciones e instala la PWA del MoodleMoot Perú 2026 para no perderte cupos, talleres y anuncios exclusivos. Guía paso a paso.",
        en: "Enable notifications and install the MoodleMoot Perú 2026 PWA so you don't miss seats, workshops and exclusive announcements. Step-by-step guide.",
      },
      keywords: [
        "notificaciones MoodleMoot Perú",
        "instalar app MoodleMoot",
        "PWA MoodleMoot 2026",
        "alertas evento Moodle Lima",
        "campana notificaciones moodlemootperu.com",
      ],
    },
  },
  {
    slug: "moodlemoot-peru-2026-adquiere-tu-entrada-inversion",
    title: {
      es: "Adquiere tu entrada al MoodleMoot Perú 2026: la inversión EdTech del año",
      en: "Get your ticket to MoodleMoot Perú 2026: the EdTech investment of the year",
    },
    excerpt: {
      es: "Por qué asistir al MoodleMoot Perú 2026 es la inversión profesional más rentable del año, cómo asegurar tu cupo y cómo aprovechar nuestra PWA y notificaciones.",
      en: "Why attending MoodleMoot Perú 2026 is the most profitable professional investment of the year, how to secure your spot and how to leverage our PWA and notifications.",
    },
    body: { es: post4Es, en: post4En },
    date: "2026-06-16",
    author: "Equipo MoodleMoot Perú",
    category: "announcements",
    tags: ["entradas", "ticket", "inversion", "pwa", "notificaciones", "cupones", "gremio-educativo"],
    cover: hibridoMoodlemoot,
    readingMinutes: 9,
    seo: {
      metaTitle: {
        es: "Adquiere tu entrada MoodleMoot Perú 2026 | Inversión EdTech",
        en: "Get your ticket MoodleMoot Perú 2026 | EdTech investment",
      },
      metaDescription: {
        es: "MoodleMoot Perú 2026: 18-19 sept en UMCH Lima. Talleres, networking y certificación. Adquiere tu entrada, activa notificaciones e instala la PWA. Cupos limitados.",
        en: "MoodleMoot Perú 2026: Sept 18-19 at UMCH Lima. Workshops, networking and certification. Get your ticket, enable notifications and install the PWA. Limited capacity.",
      },
      keywords: [
        "entradas MoodleMoot Perú 2026",
        "ticket MoodleMoot Lima",
        "cupones MoodleMoot",
        "PWA MoodleMoot",
        "notificaciones evento Moodle",
        "inversión EdTech Perú",
      ],
    },
  },
  {
    slug: "moodlemoot-peru-2026-fechas-confirmadas",
    title: {
      es: "MoodleMoot Perú 2026: fechas confirmadas en Lima",
      en: "MoodleMoot Perú 2026: dates confirmed in Lima",
    },
    excerpt: {
      es: "El encuentro Moodle más grande del Perú se realizará el 18 y 19 de septiembre en Lima, en formato híbrido y con más de 2,000 asistentes esperados.",
      en: "Peru's largest Moodle gathering will take place September 18–19 in Lima, in hybrid format with over 2,000 expected attendees.",
    },
    body: { es: post1Es, en: post1En },
    date: "2026-04-12",
    updatedAt: "2026-05-15",
    author: "Equipo MoodleMoot Perú",
    category: "announcements",
    tags: ["moodle", "evento", "hibrido", "lima", "agenda", "registro"],
    cover: post1Cover,
    readingMinutes: 8,
    seo: {
      metaTitle: {
        es: "MoodleMoot Perú 2026: fechas confirmadas en Lima",
        en: "MoodleMoot Perú 2026: dates confirmed in Lima",
      },
      metaDescription: {
        es: "MoodleMoot Perú 2026 será el 18 y 19 de septiembre en la UMCH (Lima). Formato híbrido, +2,000 asistentes, IA en educación y Moodle 5.0. Regístrate gratis.",
        en: "MoodleMoot Perú 2026 takes place September 18–19 at UMCH (Lima). Hybrid format, 2,000+ attendees, AI in education and Moodle 5.0. Register for free.",
      },
      keywords: [
        "MoodleMoot Perú 2026",
        "evento Moodle Lima",
        "congreso e-learning Perú",
        "Moodle 5.0",
        "IA en educación",
        "EdTech Latinoamérica",
      ],
    },
    faq: [
      {
        q: { es: "¿Cuándo y a qué hora es MoodleMoot Perú 2026?", en: "When and at what time is MoodleMoot Perú 2026?" },
        a: {
          es: "Viernes 18 y sábado 19 de septiembre de 2026, en horario continuo de 8:30 a 18:30 (hora de Lima, GMT-5). La acreditación presencial inicia a las 8:00 a.m. del día 1.",
          en: "Friday September 18 and Saturday September 19, 2026, from 8:30 AM to 6:30 PM Lima time (GMT-5). On-site check-in opens at 8:00 AM on day 1.",
        },
      },
      {
        q: { es: "¿Dónde se realiza el evento y cómo asisto virtualmente?", en: "Where is the event held and how do I attend virtually?" },
        a: {
          es: "Presencialmente en el campus de la Universidad Marcelino Champagnat (UMCH), en Santiago de Surco, Lima. Virtualmente, desde nuestra plataforma Moodle: tras registrarte, recibes un correo con el enlace de acceso 48 horas antes del evento.",
          en: "On-site at the Universidad Marcelino Champagnat (UMCH) campus in Santiago de Surco, Lima. Virtually, from our Moodle platform: once you register, you'll receive an email with the access link 48 hours before the event.",
        },
      },
      {
        q: { es: "¿El evento tiene costo? ¿Hay entrada VIP?", en: "Does the event have a cost? Is there a VIP ticket?" },
        a: {
          es: "El registro general es 100% gratuito (presencial y virtual). No hay entradas VIP ni pagos por sesiones. La presencial requiere confirmación por correo porque el aforo del campus es limitado y se asigna por orden de llegada.",
          en: "General registration is 100% free (on-site and virtual). There are no VIP tickets or paid sessions. On-site requires email confirmation because campus capacity is limited and assigned in order of registration.",
        },
      },
      {
        q: { es: "¿Hasta cuándo puedo registrarme?", en: "Until when can I register?" },
        a: {
          es: "El registro virtual permanece abierto hasta el inicio de cada sesión durante los dos días del evento. El registro presencial cierra cuando se completa el aforo del campus (~1,400 asistentes), normalmente 2 a 3 semanas antes.",
          en: "Virtual registration stays open until each session begins during the two days of the event. On-site registration closes when campus capacity (~1,400 attendees) is reached, usually 2–3 weeks beforehand.",
        },
      },
      {
        q: { es: "¿Se entrega certificado de asistencia?", en: "Is an attendance certificate issued?" },
        a: {
          es: "Sí. Todos los asistentes registrados —presencial o virtual— reciben un certificado digital con código QR de verificación, válido para horas de capacitación, tras completar al menos el 70% de las sesiones a las que se inscribieron.",
          en: "Yes. All registered attendees —on-site or virtual— receive a digital certificate with a QR verification code, valid for training hours, after completing at least 70% of the sessions they signed up for.",
        },
      },
      {
        q: { es: "¿En qué idioma son las sesiones?", en: "In which language are the sessions?" },
        a: {
          es: "La gran mayoría de sesiones son en español. Las keynotes internacionales (por ejemplo, las de Moodle HQ) cuentan con interpretación simultánea español ⇄ inglés, disponible tanto en la sala presencial como en la transmisión virtual.",
          en: "The vast majority of sessions are in Spanish. International keynotes (e.g., from Moodle HQ) include simultaneous Spanish ⇄ English interpretation, available both in the on-site room and on the virtual stream.",
        },
      },
      {
        q: { es: "¿Las sesiones quedan grabadas?", en: "Are sessions recorded?" },
        a: {
          es: "Sí. Los asistentes registrados acceden al replay on-demand de todas las sesiones durante 90 días posteriores al evento, desde la misma plataforma Moodle del evento.",
          en: "Yes. Registered attendees access on-demand replay of all sessions for 90 days after the event, from the same Moodle event platform.",
        },
      },
      {
        q: { es: "¿Qué nivel de Moodle necesito tener?", en: "What level of Moodle do I need?" },
        a: {
          es: "Ninguno en particular. Hay tracks dedicados para principiantes (docentes que recién migran a Moodle), nivel intermedio (diseño instruccional y administración) y avanzado (desarrollo, plugins, integraciones). Al registrarte indicas tu nivel y recibes una agenda recomendada.",
          en: "None in particular. There are dedicated tracks for beginners (teachers just migrating to Moodle), intermediate (instructional design and administration) and advanced (development, plugins, integrations). When you register you indicate your level and receive a recommended agenda.",
        },
      },
      {
        q: { es: "¿Incluye almuerzo y coffee break?", en: "Does it include lunch and coffee breaks?" },
        a: {
          es: "Para los asistentes presenciales: sí. Cada día incluye coffee break en la mañana, almuerzo tipo buffet y cóctel de cierre el sábado. Está cubierto por los sponsors y no tiene costo adicional.",
          en: "For on-site attendees: yes. Each day includes a morning coffee break, a buffet lunch and a closing cocktail on Saturday. It's covered by sponsors and has no additional cost.",
        },
      },
      {
        q: { es: "¿Puedo asistir si soy estudiante universitario?", en: "Can I attend if I'm a university student?" },
        a: {
          es: "Sí, totalmente. Tenemos un track específico para estudiantes y futuros docentes, además de descuentos para grupos universitarios. Solo regístrate indicando tu institución educativa.",
          en: "Yes, absolutely. We have a specific track for students and future teachers, plus discounts for university groups. Just register indicating your educational institution.",
        },
      },
    ],
  },
  {
    slug: "sede-universidad-marcelino-champagnat-umch",
    title: {
      es: "Sede oficial: Universidad Marcelino Champagnat (UMCH)",
      en: "Official venue: Universidad Marcelino Champagnat (UMCH)",
    },
    excerpt: {
      es: "Conoce la UMCH, la universidad marista licenciada por SUNEDU que recibe MoodleMoot Perú 2026 en Surco, Lima: historia, infraestructura, ubicación y hospedaje.",
      en: "Meet UMCH, the SUNEDU-licensed Marist university hosting MoodleMoot Perú 2026 in Surco, Lima: history, infrastructure, location and lodging.",
    },
    body: { es: post2Es, en: post2En },
    date: "2026-04-08",
    updatedAt: "2026-05-15",
    author: "Equipo MoodleMoot Perú",
    category: "venue",
    tags: ["umch", "sede", "surco-lima", "infraestructura", "hospedaje"],
    cover: umchFachada,
    readingMinutes: 9,
    seo: {
      metaTitle: {
        es: "Sede MoodleMoot Perú 2026: Universidad Marcelino Champagnat",
        en: "MoodleMoot Perú 2026 venue: Universidad Marcelino Champagnat",
      },
      metaDescription: {
        es: "MoodleMoot Perú 2026 se realiza en la UMCH (Surco, Lima). Conoce su historia marista, infraestructura, accesibilidad, cómo llegar y hospedaje recomendado.",
        en: "MoodleMoot Perú 2026 is held at UMCH (Surco, Lima). Discover its Marist history, infrastructure, accessibility, transportation and recommended lodging.",
      },
      keywords: [
        "Universidad Marcelino Champagnat",
        "UMCH Lima",
        "sede MoodleMoot Perú",
        "universidad marista Perú",
        "Surco Lima eventos académicos",
        "SUNEDU",
      ],
    },
    faq: [
      {
        q: { es: "¿Dónde queda exactamente la UMCH?", en: "Where exactly is UMCH located?" },
        a: {
          es: "En Santiago de Surco, Lima, Perú, a pocos minutos de la avenida Javier Prado y de la Vía Expresa. Está a 25–35 minutos de Miraflores y a 45–60 minutos del aeropuerto Jorge Chávez según el tráfico. La dirección exacta y el mapa con accesos los enviamos por correo a los asistentes presenciales confirmados.",
          en: "In Santiago de Surco, Lima, Peru, a few minutes from Javier Prado Avenue and the Vía Expresa. It's 25–35 minutes from Miraflores and 45–60 minutes from Jorge Chávez Airport depending on traffic. The exact address and access map are emailed to confirmed on-site attendees.",
        },
      },
      {
        q: { es: "¿La UMCH está licenciada por SUNEDU?", en: "Is UMCH licensed by SUNEDU?" },
        a: {
          es: "Sí. La Universidad Marcelino Champagnat está licenciada por SUNEDU, el organismo peruano que garantiza oficialmente la calidad de las universidades del país. Esto avala su infraestructura y procesos académicos.",
          en: "Yes. Universidad Marcelino Champagnat is licensed by SUNEDU, the Peruvian agency that officially guarantees the quality of universities in the country. This validates its infrastructure and academic processes.",
        },
      },
      {
        q: { es: "¿Cómo llego en transporte público?", en: "How do I get there by public transport?" },
        a: {
          es: "Las opciones más cómodas son: (1) Metropolitano hasta la estación más cercana + taxi/Uber 10 min, (2) corredor azul / corredor rojo según tu zona, (3) Uber/Cabify directo desde Miraflores (~S/ 18–25). El sábado el tráfico es muy fluido.",
          en: "The most convenient options are: (1) Metropolitano to the nearest station + 10-min taxi/Uber, (2) blue or red corridor depending on your area, (3) Uber/Cabify directly from Miraflores (~S/ 18–25 / USD 5–7). Traffic flows freely on Saturday.",
        },
      },
      {
        q: { es: "¿Hay estacionamiento en la sede?", en: "Is there parking at the venue?" },
        a: {
          es: "Sí, el campus cuenta con estacionamiento gratuito sujeto a disponibilidad para asistentes con registro presencial confirmado. Recomendamos llegar antes de las 8:30 a.m. para asegurar espacio o usar Uber/taxi para evitar la espera.",
          en: "Yes, the campus has free parking subject to availability for confirmed on-site attendees. We recommend arriving before 8:30 AM to secure a spot, or using Uber/taxi to avoid waiting.",
        },
      },
      {
        q: { es: "¿Qué hoteles cercanos recomiendan?", en: "Which nearby hotels do you recommend?" },
        a: {
          es: "En Surco y Miraflores hay opciones para todos los presupuestos: Casa Andina, Costa del Sol, Wyndham, Hilton Lima Miraflores, Belmond Miraflores Park, además de Airbnb y aparthoteles. La organización negocia tarifas preferenciales con cadenas seleccionadas; los códigos se envían por correo a asistentes presenciales un mes antes del evento.",
          en: "In Surco and Miraflores there are options for every budget: Casa Andina, Costa del Sol, Wyndham, Hilton Lima Miraflores, Belmond Miraflores Park, plus Airbnb and aparthotels. The organization negotiates preferential rates with selected chains; codes are emailed to on-site attendees one month before the event.",
        },
      },
      {
        q: { es: "¿La sede es accesible para personas con discapacidad?", en: "Is the venue accessible for people with disabilities?" },
        a: {
          es: "Sí. La UMCH cuenta con rampas, ascensores, baños adaptados, lazo magnético en el auditorio principal e intérpretes de lengua de señas peruana en las keynotes principales. Si necesitas un apoyo adicional, márcalo al registrarte y un asistente te contacta para coordinar.",
          en: "Yes. UMCH has ramps, elevators, adapted bathrooms, a hearing loop in the main auditorium and Peruvian Sign Language interpreters in the main keynotes. If you need additional support, mark it during registration and an assistant will contact you to coordinate.",
        },
      },
      {
        q: { es: "¿Hay zona para alimentación cerca?", en: "Is there a food area nearby?" },
        a: {
          es: "Sí. Dentro del campus hay cafetería, food trucks aliados los días del evento y el almuerzo buffet incluido. A 5–10 minutos hay centros comerciales (Jockey Plaza, El Polo) con amplia oferta gastronómica.",
          en: "Yes. The campus has a cafeteria, allied food trucks on event days and the included buffet lunch. 5–10 minutes away you'll find shopping malls (Jockey Plaza, El Polo) with a wide range of restaurants.",
        },
      },
      {
        q: { es: "¿La zona es segura?", en: "Is the area safe?" },
        a: {
          es: "Surco es uno de los distritos más seguros y mejor organizados de Lima, con vigilancia municipal activa. Aún así, recomendamos las precauciones habituales de cualquier ciudad grande: usar Uber/taxis registrados, no exhibir objetos de valor en la calle y moverse en grupo durante la noche.",
          en: "Surco is one of the safest and best-organized districts in Lima, with active municipal patrols. Still, we recommend the usual precautions of any large city: use Uber/registered taxis, don't display valuables on the street and move in groups at night.",
        },
      },
    ],
  },
  {
    slug: "historia-moodlemoot-peru-crecimiento-proyeccion-2026",
    title: {
      es: "Historia y proyección de MoodleMoot Perú: cómo crecimos hasta 2026",
      en: "History and projection of MoodleMoot Perú: how we grew until 2026",
    },
    excerpt: {
      es: "De una reunión técnica de administradores Moodle al principal evento EdTech del país. Crecimiento, cifras y qué esperar de la edición 2026 y siguientes.",
      en: "From a technical meeting of Moodle admins to Peru's main EdTech event. Growth, numbers and what to expect from the 2026 edition and beyond.",
    },
    body: { es: post3Es, en: post3En },
    date: "2026-03-28",
    updatedAt: "2026-05-15",
    author: "Equipo MoodleMoot Perú",
    category: "community",
    tags: ["historia", "comunidad", "latinoamerica", "proyeccion-2026", "moodle-hq"],
    cover: historiaEvento,
    readingMinutes: 9,
    seo: {
      metaTitle: {
        es: "Historia de MoodleMoot Perú: crecimiento y proyección 2026",
        en: "History of MoodleMoot Perú: growth and 2026 projection",
      },
      metaDescription: {
        es: "Cómo MoodleMoot Perú pasó de reunión técnica a evento regional con +2,000 asistentes. Hitos, cifras del ecosistema Moodle peruano y proyección 2026-2028.",
        en: "How MoodleMoot Perú evolved from a technical meeting to a regional event with 2,000+ attendees. Milestones, Moodle ecosystem numbers and 2026-2028 outlook.",
      },
      keywords: [
        "historia MoodleMoot Perú",
        "comunidad Moodle Latinoamérica",
        "crecimiento e-learning Perú",
        "ecosistema Moodle peruano",
        "MoodleMoot LATAM",
      ],
    },
    faq: [
      {
        q: { es: "¿Qué es exactamente un MoodleMoot?", en: "What exactly is a MoodleMoot?" },
        a: {
          es: "Es un encuentro oficial reconocido por Moodle HQ donde la comunidad local de un país se reúne para compartir casos de uso, integraciones, plugins y novedades de la plataforma. Existen MoodleMoots en más de 30 países; el de Perú es uno de los más activos de la región LATAM.",
          en: "It's an official gathering recognized by Moodle HQ where each country's local community meets to share use cases, integrations, plugins and platform updates. There are MoodleMoots in more than 30 countries; the Peru edition is one of the most active in the LATAM region.",
        },
      },
      {
        q: { es: "¿Cuándo se realizó la primera edición en Perú?", en: "When was the first edition held in Peru?" },
        a: {
          es: "La primera reunión informal de administradores Moodle en el Perú se hizo hace varios años en formato técnico de medio día. Desde entonces, el evento ha crecido cada edición hasta consolidarse como el referente EdTech del país, con formato bianual y ahora con presencia regional.",
          en: "The first informal meeting of Moodle admins in Peru was held several years ago as a half-day technical session. Since then, the event has grown each edition until consolidating as Peru's EdTech reference, with a biannual format and now with regional presence.",
        },
      },
      {
        q: { es: "¿Cuántos asistentes esperan en 2026?", en: "How many attendees are expected in 2026?" },
        a: {
          es: "Más de 2,000 asistentes únicos entre modalidad presencial y virtual, provenientes principalmente de Perú, Colombia, Ecuador, Bolivia, Chile, México, España y Argentina. Es la edición más ambiciosa de MoodleMoot Perú hasta la fecha.",
          en: "Over 2,000 unique attendees between on-site and virtual modalities, primarily from Peru, Colombia, Ecuador, Bolivia, Chile, Mexico, Spain and Argentina. It's the most ambitious edition of MoodleMoot Perú to date.",
        },
      },
      {
        q: { es: "¿Quién organiza el evento?", en: "Who organizes the event?" },
        a: {
          es: "MoodleMoot Perú es organizado por la comunidad local de Moodle Perú junto con Moodle HQ, partners certificados de Moodle (Moodle Partners) y la Universidad Marcelino Champagnat como sede oficial 2026. El comité es 100% sin fines de lucro.",
          en: "MoodleMoot Perú is organized by the local Moodle Peru community together with Moodle HQ, Moodle Certified Partners and Universidad Marcelino Champagnat as the official 2026 venue. The committee is 100% non-profit.",
        },
      },
      {
        q: { es: "¿Cómo puedo participar como ponente?", en: "How can I participate as a speaker?" },
        a: {
          es: "Las convocatorias de ponencias se abren entre 4 y 6 meses antes del evento. Si quieres ser notificado, regístrate gratis y marca la opción \"Quiero proponer una ponencia\". Las propuestas se evalúan por un comité académico considerando originalidad, valor para la comunidad y aplicabilidad práctica.",
          en: "Calls for talks open 4 to 6 months before the event. If you want to be notified, register for free and check \"I want to propose a talk\". Proposals are evaluated by an academic committee considering originality, value to the community and practical applicability.",
        },
      },
      {
        q: { es: "¿Cómo puedo ser sponsor o partner?", en: "How can I become a sponsor or partner?" },
        a: {
          es: "Tenemos planes de auspicio (Diamond, Gold, Silver, Community) con stand físico y virtual, exposición en la app, participación en sesiones express y contenido en redes. Escríbenos por el formulario de contacto del sitio para recibir el brief de auspicios 2026.",
          en: "We have sponsorship tiers (Diamond, Gold, Silver, Community) with physical and virtual booths, exposure in the app, express sessions and social media content. Contact us via the website's contact form to receive the 2026 sponsorship brief.",
        },
      },
      {
        q: { es: "¿Habrá MoodleMoot Perú 2027?", en: "Will there be a MoodleMoot Perú 2027?" },
        a: {
          es: "Sí. Cerramos el sábado 19 de septiembre de 2026 con el anuncio oficial de MoodleMoot Perú 2027, incluyendo nueva sede candidata, nuevos ejes temáticos y proyección regional hacia el ecosistema andino y el cono sur.",
          en: "Yes. We close on Saturday September 19, 2026 with the official announcement of MoodleMoot Perú 2027, including the new candidate venue, new themes and regional outlook toward the Andean ecosystem and the Southern Cone.",
        },
      },
    ],
  },
];

export const getCategory = (id: BlogCategoryId) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

export const ALL_TAGS = Array.from(new Set(POSTS.flatMap((p) => p.tags))).sort();

// Slugs antiguos → nuevos slugs (para evitar romper enlaces externos ya indexados)
export const SLUG_REDIRECTS: Record<string, string> = {
  "convocatoria-ponencias-abierta": "sede-universidad-marcelino-champagnat-umch",
  "alianza-moodle-hq-diamond": "historia-moodlemoot-peru-crecimiento-proyeccion-2026",
};

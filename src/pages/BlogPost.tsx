import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "@/i18n/LanguageContext";
import { POSTS, SLUG_REDIRECTS, getCategory } from "@/data/blog";

const SITE_URL = "https://moodlemootperu.com";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { locale } = useTranslation();

  // Redirección de slugs antiguos
  if (slug && SLUG_REDIRECTS[slug]) {
    return <Navigate to={`/blog/${SLUG_REDIRECTS[slug]}`} replace />;
  }

  const post = POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="pt-32 pb-24 container mx-auto px-4 text-center">
          <h1 className="text-3xl font-semibold mb-4">
            {locale === "es" ? "Noticia no encontrada" : "Post not found"}
          </h1>
          <Link to="/blog" className="text-primary underline">
            {locale === "es" ? "Volver al blog" : "Back to blog"}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const url = `${SITE_URL}/blog/${post.slug}`;
  const title = post.seo?.metaTitle?.[locale] ?? post.title[locale];
  const description = post.seo?.metaDescription?.[locale] ?? post.excerpt[locale];
  const image = post.cover ? `${SITE_URL}${post.cover}` : `${SITE_URL}/og-image.jpg`;
  const keywords = post.seo?.keywords?.join(", ");

  // JSON-LD: Article
  const articleLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title[locale],
    description: post.excerpt[locale],
    image,
    datePublished: post.date,
    dateModified: post.updatedAt ?? post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "MoodleMoot Perú",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: locale === "es" ? "es-PE" : "en-US",
    keywords: post.seo?.keywords,
  };

  // JSON-LD: FAQ
  const faqLd =
    post.faq && post.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faq.map((f) => ({
            "@type": "Question",
            name: f.q[locale],
            acceptedAnswer: { "@type": "Answer", text: f.a[locale] },
          })),
        }
      : null;

  // JSON-LD: Event (solo post 1) + Place (post 2)
  const extraLd: Array<Record<string, unknown>> = [];
  if (post.slug === "moodlemoot-peru-2026-fechas-confirmadas") {
    extraLd.push({
      "@context": "https://schema.org",
      "@type": "Event",
      name: "MoodleMoot Perú 2026",
      startDate: "2026-09-18T08:30:00-05:00",
      endDate: "2026-09-19T18:30:00-05:00",
      eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: [
        {
          "@type": "Place",
          name: "Universidad Marcelino Champagnat",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Santiago de Surco",
            addressRegion: "Lima",
            addressCountry: "PE",
          },
          url: "https://umch.edu.pe/",
        },
        {
          "@type": "VirtualLocation",
          url: SITE_URL,
        },
      ],
      image,
      description: post.excerpt[locale],
      organizer: { "@type": "Organization", name: "MoodleMoot Perú", url: SITE_URL },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "PEN",
        availability: "https://schema.org/InStock",
        url: SITE_URL,
        validFrom: post.date,
      },
    });
  }
  if (post.slug === "sede-universidad-marcelino-champagnat-umch") {
    extraLd.push({
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: "Universidad Marcelino Champagnat",
      alternateName: "UMCH",
      url: "https://umch.edu.pe/",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Santiago de Surco",
        addressRegion: "Lima",
        addressCountry: "PE",
      },
    });
  }

  const category = getCategory(post.category);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <html lang={locale} />
        <title>{title}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title[locale]} />
        <meta property="og:description" content={post.excerpt[locale]} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={image} />
        <meta property="og:locale" content={locale === "es" ? "es_PE" : "en_US"} />
        <meta property="article:published_time" content={post.date} />
        {post.updatedAt && <meta property="article:modified_time" content={post.updatedAt} />}
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content={category.label[locale]} />
        {post.tags.map((t) => (
          <meta key={t} property="article:tag" content={t} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title[locale]} />
        <meta name="twitter:description" content={post.excerpt[locale]} />
        <meta name="twitter:image" content={image} />
        <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
        {faqLd && <script type="application/ld+json">{JSON.stringify(faqLd)}</script>}
        {extraLd.map((ld, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(ld)}
          </script>
        ))}
      </Helmet>

      <Navbar />

      {/* Hero oscuro */}
      <header className="relative bg-brand-ink text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, hsl(var(--brand-orange) / 0.18), transparent 55%), radial-gradient(ellipse at 80% 100%, hsl(var(--secondary) / 0.35), transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative container mx-auto px-4 max-w-3xl pt-36 md:pt-44 pb-16 md:pb-24">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/70 hover:text-brand-orange mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {locale === "es" ? "Todas las noticias" : "All posts"}
          </Link>
          <Link
            to={`/blog?cat=${post.category}`}
            className="inline-block text-[10px] font-mono uppercase tracking-[0.3em] text-brand-orange mb-3 hover:underline"
          >
            {category.label[locale]}
          </Link>
          <h1 className="text-display text-[clamp(2rem,5vw,3.5rem)] leading-[1] mb-6 text-white">
            {post.title[locale]}
          </h1>
          <p className="text-base md:text-lg text-white/80 mb-6 max-w-2xl">
            {post.excerpt[locale]}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString(locale === "es" ? "es-PE" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {post.author}
            </span>
            {post.readingMinutes && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readingMinutes} {locale === "es" ? "min de lectura" : "min read"}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="pt-16 pb-24">
        <article className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-lg max-w-none text-foreground/85 leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 className="font-display font-bold text-3xl md:text-4xl mt-14 mb-5 text-foreground leading-tight">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-display font-semibold text-xl md:text-2xl mt-10 mb-4 text-foreground">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-base md:text-lg leading-relaxed mb-5 text-foreground/85">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-6 space-y-2 text-foreground/85">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 mb-6 space-y-2 text-foreground/85">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                a: ({ href, children }) => {
                  if (href === "#register") {
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          window.dispatchEvent(new CustomEvent("open-event-registration"))
                        }
                        className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.03] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                      >
                        {children}
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </button>
                    );
                  }
                  if (href === "/#tickets" || href === "#tickets") {
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          window.dispatchEvent(new Event("open-ticket-purchase"))
                        }
                        className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.03] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                      >
                        {children}
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </button>
                    );
                  }
                  if (href === "#postular-ponente" || href === "/#postular-ponente") {
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          window.dispatchEvent(new Event("open-speaker-proposal"))
                        }
                        className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.03] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                      >
                        {children}
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </button>
                    );
                  }
                  const isExternal = href?.startsWith("http");
                  if (isExternal) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-4 hover:text-brand-orange"
                      >
                        {children}
                      </a>
                    );
                  }
                  return (
                    <Link
                      to={href ?? "#"}
                      className="text-primary underline underline-offset-4 hover:text-brand-orange"
                    >
                      {children}
                    </Link>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-brand-orange pl-5 my-8 italic text-foreground/75 text-lg">
                    {children}
                  </blockquote>
                ),
                img: ({ src, alt }) => (
                  <img
                    src={typeof src === "string" ? src : ""}
                    alt={alt ?? ""}
                    loading="lazy"
                    width={1280}
                    height={720}
                    className="w-full h-auto rounded-2xl my-10 shadow-md"
                  />
                ),
                hr: () => <hr className="my-12 border-border" />,
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">{children}</strong>
                ),
                code: ({ children }) => (
                  <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">
                    {children}
                  </code>
                ),
              }}
            >
              {post.body[locale]}
            </ReactMarkdown>
          </div>

          {/* FAQ */}
          {post.faq && post.faq.length > 0 && (
            <section className="mt-16 pt-12 border-t border-border" aria-labelledby="faq-title">
              <h2
                id="faq-title"
                className="font-display font-bold text-3xl md:text-4xl mb-8 text-foreground"
              >
                {locale === "es" ? "Preguntas frecuentes" : "Frequently asked questions"}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {post.faq.map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-base md:text-lg font-medium">
                      {f.q[locale]}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-foreground/80 leading-relaxed">
                      {f.a[locale]}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2">
                {locale === "es" ? "Etiquetas:" : "Tags:"}
              </span>
              {post.tags.map((t) => (
                <Link
                  key={t}
                  to={`/blog?tag=${t}`}
                  className="text-xs rounded-full bg-muted hover:bg-secondary hover:text-secondary-foreground px-3 py-1 transition-colors"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;

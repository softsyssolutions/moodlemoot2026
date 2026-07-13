import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Calendar, Folder, Tag, Sparkles, Search, X } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import EventRegistrationModal from "@/components/landing/EventRegistrationModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/LanguageContext";
import { POSTS, CATEGORIES, ALL_TAGS, getCategory, type BlogCategoryId } from "@/data/blog";

const Blog = () => {
  const { locale } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [regOpen, setRegOpen] = useState(false);
  const [query, setQuery] = useState("");

  const activeCategory = params.get("cat") as BlogCategoryId | null;
  const activeTag = params.get("tag");

  const filtered = useMemo(() => {
    return [...POSTS]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((p) => (activeCategory ? p.category === activeCategory : true))
      .filter((p) => (activeTag ? p.tags.includes(activeTag) : true))
      .filter((p) =>
        query
          ? `${p.title[locale]} ${p.excerpt[locale]}`.toLowerCase().includes(query.toLowerCase())
          : true,
      );
  }, [activeCategory, activeTag, query, locale]);

  const counts = useMemo(() => {
    const map = new Map<BlogCategoryId, number>();
    POSTS.forEach((p) => map.set(p.category, (map.get(p.category) ?? 0) + 1));
    return map;
  }, []);

  const setCategory = (id: BlogCategoryId | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set("cat", id);
    else next.delete("cat");
    setParams(next, { replace: true });
  };

  const setTag = (tag: string | null) => {
    const next = new URLSearchParams(params);
    if (tag) next.set("tag", tag);
    else next.delete("tag");
    setParams(next, { replace: true });
  };

  const clearFilters = () => {
    setParams(new URLSearchParams(), { replace: true });
    setQuery("");
  };

  const hasFilters = !!activeCategory || !!activeTag || !!query;

  const blogTitle =
    locale === "es"
      ? "Blog — Noticias y novedades de MoodleMoot Perú 2026"
      : "Blog — News and updates from MoodleMoot Perú 2026";
  const blogDescription =
    locale === "es"
      ? "Anuncios, alianzas, ponentes y novedades del MoodleMoot Perú 2026: el encuentro Moodle más grande del Perú."
      : "Announcements, partnerships, speakers and updates from MoodleMoot Perú 2026, the largest Moodle gathering in Peru.";

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog MoodleMoot Perú 2026",
    url: "https://moodlemootperu.com/blog",
    inLanguage: locale === "es" ? "es-PE" : "en-US",
    blogPost: POSTS.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title[locale],
      url: `https://moodlemootperu.com/blog/${p.slug}`,
      datePublished: p.date,
      author: { "@type": "Organization", name: p.author },
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{blogTitle}</title>
        <meta name="description" content={blogDescription} />
        <link rel="canonical" href="https://moodlemootperu.com/blog" />
        <meta property="og:title" content={blogTitle} />
        <meta property="og:description" content={blogDescription} />
        <meta property="og:url" content="https://moodlemootperu.com/blog" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(collectionLd)}</script>
      </Helmet>
      <Navbar />


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
        <div className="relative container mx-auto px-4 max-w-6xl pt-36 md:pt-44 pb-16 md:pb-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/70 hover:text-brand-orange mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {locale === "es" ? "Volver al inicio" : "Back to home"}
          </Link>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand-orange mb-3">
            {locale === "es" ? "Noticias y blog" : "News & blog"}
          </div>
          <h1 className="text-display text-[clamp(2rem,5vw,4rem)] leading-[0.95] text-white">
            {locale === "es" ? "Lo último del evento." : "Latest from the event."}
          </h1>
          <p className="mt-4 text-white/70 max-w-2xl">
            {locale === "es"
              ? "Anuncios, alianzas y novedades de MoodleMoot Perú 2026."
              : "Announcements, partnerships and updates from MoodleMoot Perú 2026."}
          </p>
        </div>
      </header>

      <main className="pb-24 pt-12">
        <div className="container mx-auto px-4 max-w-6xl grid gap-10 lg:grid-cols-[1fr_300px]">
          {/* Posts column */}
          <section>
            {/* Search + active filters */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={locale === "es" ? "Buscar artículos..." : "Search articles..."}
                  aria-label={locale === "es" ? "Buscar artículos del blog" : "Search blog articles"}
                  className="pl-9"
                />
              </div>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="self-start sm:self-auto">
                  <X className="w-4 h-4" />
                  {locale === "es" ? "Limpiar filtros" : "Clear filters"}
                </Button>
              )}
            </div>

            {(activeCategory || activeTag) && (
              <div className="mb-6 flex flex-wrap gap-2 text-xs">
                {activeCategory && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 font-medium">
                    <Folder className="w-3 h-3" />
                    {getCategory(activeCategory).label[locale]}
                    <button onClick={() => setCategory(null)} aria-label="Remove category">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {activeTag && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 text-secondary px-3 py-1 font-medium">
                    <Tag className="w-3 h-3" />#{activeTag}
                    <button onClick={() => setTag(null)} aria-label="Remove tag">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
                {locale === "es"
                  ? "No encontramos artículos con esos filtros."
                  : "No articles match those filters."}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {filtered.map((post) => {
                  const cat = getCategory(post.category);
                  return (
                    <Link
                      key={post.slug}
                      to={`/blog/${post.slug}`}
                      className="group flex flex-col rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.25)] transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
                        {post.cover ? (
                          <img
                            src={post.cover}
                            alt={post.title[locale]}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-50 transition-opacity duration-500" />
                        <span className="absolute top-3 left-3 inline-flex items-center text-[10px] font-mono uppercase tracking-[0.25em] text-brand-orange bg-black/50 backdrop-blur px-2.5 py-1 rounded-full">
                          {cat.label[locale]}
                        </span>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.date).toLocaleDateString(
                              locale === "es" ? "es-PE" : "en-US",
                              { year: "numeric", month: "short", day: "numeric" },
                            )}
                          </span>
                        </div>
                        <h2 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
                          {post.title[locale]}
                        </h2>
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                          {post.excerpt[locale]}
                        </p>
                        {post.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {post.tags.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] uppercase tracking-wider rounded-full bg-muted px-2 py-0.5 text-muted-foreground"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-4 text-xs uppercase tracking-wider text-primary font-medium">
                          {locale === "es" ? "Leer más →" : "Read more →"}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* Register CTA banner — oculto globalmente */}
            {false && (
            <div className="relative overflow-hidden rounded-2xl border border-brand-orange/30 bg-brand-ink text-white p-6">
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  background:
                    "radial-gradient(ellipse at 100% 0%, hsl(var(--brand-orange) / 0.35), transparent 60%)",
                }}
                aria-hidden
              />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.25em] text-brand-orange mb-3">
                  <Sparkles className="w-3 h-3" />
                  {locale === "es" ? "Cupos limitados" : "Limited seats"}
                </div>
                <h3 className="text-lg font-semibold leading-snug mb-2">
                  {locale === "es"
                    ? "Asegura tu lugar en MoodleMoot Perú 2026"
                    : "Get your spot at MoodleMoot Perú 2026"}
                </h3>
                <p className="text-sm text-white/70 mb-4">
                  {locale === "es"
                    ? "Registro gratuito para asistencia presencial o virtual."
                    : "Free registration for in-person or virtual attendance."}
                </p>
                <Button
                  onClick={() => setRegOpen(true)}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white"
                >
                  {locale === "es" ? "Regístrate gratis" : "Register free"}
                </Button>
              </div>
            </div>
            )}

            {/* Categories */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Folder className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  {locale === "es" ? "Categorías" : "Categories"}
                </h3>
              </div>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setCategory(null)}
                    className={`w-full flex items-center justify-between text-left text-sm rounded-md px-2.5 py-1.5 transition-colors ${
                      !activeCategory
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground/80 hover:bg-muted"
                    }`}
                  >
                    <span>{locale === "es" ? "Todas" : "All"}</span>
                    <span className="text-xs text-muted-foreground">{POSTS.length}</span>
                  </button>
                </li>
                {CATEGORIES.map((c) => {
                  const count = counts.get(c.id) ?? 0;
                  const isActive = activeCategory === c.id;
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => setCategory(c.id)}
                        disabled={count === 0}
                        className={`w-full flex items-center justify-between text-left text-sm rounded-md px-2.5 py-1.5 transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : count === 0
                              ? "text-muted-foreground/50 cursor-not-allowed"
                              : "text-foreground/80 hover:bg-muted"
                        }`}
                      >
                        <span>{c.label[locale]}</span>
                        <span className="text-xs text-muted-foreground">{count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Tags */}
            {ALL_TAGS.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-secondary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider">
                    {locale === "es" ? "Etiquetas" : "Tags"}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_TAGS.map((t) => {
                    const isActive = activeTag === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setTag(isActive ? null : t)}
                        className={`text-xs rounded-full px-2.5 py-1 border transition-colors ${
                          isActive
                            ? "bg-secondary text-secondary-foreground border-secondary"
                            : "bg-background text-muted-foreground border-border hover:border-secondary/50 hover:text-foreground"
                        }`}
                      >
                        #{t}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      <EventRegistrationModal open={regOpen} onOpenChange={setRegOpen} />
      <Footer />
    </div>
  );
};

export default Blog;

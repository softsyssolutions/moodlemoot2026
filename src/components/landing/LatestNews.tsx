import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { POSTS, getCategory } from "@/data/blog";

const LatestNews = () => {
  const { t, locale } = useTranslation();

  const posts = [...POSTS]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 3);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "es" ? "es-PE" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <section id="noticias" className="py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.3em] text-primary mb-3">
              {locale === "es" ? "Cap. 08 · Noticias" : "Ch. 08 · News"}
            </div>
            <h2 className="text-display text-[clamp(2rem,5vw,4rem)] leading-[1.05]">
              {t.latestNews.title}
            </h2>
            <p className="mt-4 max-w-xl text-base md:text-lg text-muted-foreground">
              {t.latestNews.subtitle}
            </p>
          </div>
          <Link
            to="/blog"
            className="hidden md:inline-flex items-center gap-2 text-sm font-mono uppercase tracking-[0.2em] text-primary hover:text-brand-orange transition-colors"
          >
            {t.latestNews.cta}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {posts.map((post) => {
            const category = getCategory(post.category);
            return (
              <article
                key={post.slug}
                className="relative isolate bg-background group flex flex-col overflow-hidden text-white"
              >
                {/* Imagen principal siempre visible */}
                {post.cover && (
                  <>
                    <img
                      src={post.cover}
                      alt={post.title[locale]}
                      loading="lazy"
                      className="pointer-events-none absolute inset-0 -z-10 w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    {/* Overlay legibilidad: más opaco por defecto, se aclara en hover para destacar la imagen */}
                    <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/70 to-black/50 group-hover:from-black/70 group-hover:via-black/40 group-hover:to-black/20 transition-all duration-700" />
                  </>
                )}

                <div className="p-8 md:p-10 flex flex-col flex-1 min-h-[24rem]">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-brand-orange">
                      {category.label[locale]}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/70">
                      {formatDate(post.date)}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-2xl md:text-3xl leading-tight mb-4">
                    <Link
                      to={`/blog/${post.slug}`}
                      aria-label={post.title[locale]}
                      className="hover:text-brand-orange transition-colors"
                    >
                      {post.title[locale]}
                    </Link>
                  </h3>

                  <p className="text-base text-white/85 leading-relaxed mb-8 line-clamp-4">
                    {post.excerpt[locale]}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/20">
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/70">
                      {post.author}
                    </span>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.2em] text-brand-orange underline-offset-4 hover:underline transition-colors"
                    >
                      {t.latestNews.readMore}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 md:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-[0.2em] text-primary hover:text-brand-orange transition-colors"
          >
            {t.latestNews.cta}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestNews;

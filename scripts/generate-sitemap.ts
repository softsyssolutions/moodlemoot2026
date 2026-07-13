// Genera public/sitemap.xml antes de dev y build (predev/prebuild).
// Nota: parseamos src/data/blog.ts con regex para evitar importarlo (importa .jpg
// que tsx no puede resolver fuera del bundler de Vite).
import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://moodlemootperu.com";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const today = new Date().toISOString().split("T")[0];

function extractPosts(): { slug: string; lastmod: string }[] {
  const src = readFileSync(resolve("src/data/blog.ts"), "utf8");
  // Separa el archivo en bloques de post (cada bloque empieza con `slug:`).
  const blocks = src.split(/(?=\s+slug:\s)/).slice(1);

  return blocks
    .map((block) => {
      const slugMatch = block.match(/slug:\s*"([^"]+)"/);
      if (!slugMatch) return null;
      const slug = slugMatch[1];
      // Ignora la definición del tipo `slug: string;`.
      if (!/^[a-z0-9-]+$/i.test(slug)) return null;

      const dateMatch = block.match(/date:\s*"(\d{4}-\d{2}-\d{2})"/);
      const updatedMatch = block.match(/updatedAt:\s*"(\d{4}-\d{2}-\d{2})"/);
      const lastmod = updatedMatch?.[1] ?? dateMatch?.[1] ?? today;

      return { slug, lastmod };
    })
    .filter((p): p is { slug: string; lastmod: string } => p !== null);
}

const posts = extractPosts();

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0", lastmod: today },
  { path: "/blog", changefreq: "weekly", priority: "0.8", lastmod: today },
  ...posts.map((p) => ({
    path: `/blog/${p.slug}`,
    changefreq: "monthly" as const,
    priority: "0.7",
    lastmod: p.lastmod,
  })),
];

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`✓ sitemap.xml generado con ${entries.length} URLs`);

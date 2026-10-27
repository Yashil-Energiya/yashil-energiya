import type { MetadataRoute } from "next";
import {
  absoluteUrl,
  cmsAlternateLocales,
  languageAlternates,
  localizedPath,
  SeoLocale,
  staticRoutes,
} from "@/lib/seo";
import {
  cmsLocales,
  getSafeSitemapContent,
  getStaticPathLocales,
} from "@/lib/sitemap-utils";

const now = new Date();

export const dynamic = "force-dynamic";

function sitemapEntry(
  locale: SeoLocale,
  path: string,
  alternates: readonly SeoLocale[] = getStaticPathLocales(path),
  lastModified: Date | string = now,
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(localizedPath(locale, path)),
    lastModified,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
    alternates: {
      languages: languageAlternates(path, alternates),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = Object.values(staticRoutes).flatMap((path) =>
    getStaticPathLocales(path).map((locale) => sitemapEntry(locale, path)),
  );

  const dynamicEntries = [];

  for (const locale of cmsLocales) {
    const { news, articles, plants, vacancies, procurements } =
      await getSafeSitemapContent(locale);

    // hreflang per entry: only the languages it is actually published in.
    dynamicEntries.push(
      ...[
        ...news
          .filter((item) => !item.seo?.noIndex)
          .map((item) =>
            sitemapEntry(
              locale,
              `/news/${item.slug}`,
              cmsAlternateLocales(item.languages),
              item.updatedAt ?? now,
            ),
          ),
        ...articles
          .filter((item) => !item.seo?.noIndex)
          .map((item) =>
            sitemapEntry(
              locale,
              `/articles/${item.slug}`,
              cmsAlternateLocales(item.languages),
              item.updatedAt ?? now,
            ),
          ),
        ...plants.map((item) =>
          sitemapEntry(
            locale,
            `/plants/${item.id}`,
            cmsAlternateLocales(item.languages),
          ),
        ),
        ...vacancies.map((item) =>
          sitemapEntry(
            locale,
            `/vacancies/${item.id}`,
            cmsAlternateLocales(item.languages),
          ),
        ),
        ...procurements.map((item) =>
          sitemapEntry(
            locale,
            `/procurements/${item.slug}`,
            cmsAlternateLocales(item.languages),
          ),
        ),
      ],
    );
  }

  return [...staticEntries, ...dynamicEntries];
}

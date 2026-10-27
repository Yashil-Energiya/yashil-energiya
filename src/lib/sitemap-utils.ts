import { ArticlesService } from "services/articles.service";
import { NewsService } from "services/news.service";
import { PlantService } from "services/plants.service";
import { ProcurementService } from "services/procurements.service";
import { VacancyService } from "services/vacancies.service";
import {
  absoluteUrl,
  cmsContentLocales,
  localizedPath,
  SeoLocale,
  siteName,
  staticRoutes,
  supportedLocales,
} from "@/lib/seo";

export type SitemapContent = {
  news: Awaited<ReturnType<typeof NewsService.getAllNews>>["news"];
  articles: Awaited<ReturnType<typeof ArticlesService.getAllArticles>>;
  plants: Awaited<ReturnType<typeof PlantService.getAllPlants>>["plants"];
  vacancies: Awaited<ReturnType<typeof VacancyService.getAllVacancies>>;
  procurements: Awaited<
    ReturnType<typeof ProcurementService.getAllProcurements>
  >;
};

export const cmsLocales: SeoLocale[] = [...cmsContentLocales];

export function escapeXml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function unique<T>(items: T[], getKey: (item: T) => string) {
  const map = new Map<string, T>();

  items.forEach((item) => {
    map.set(getKey(item), item);
  });

  return Array.from(map.values());
}

export async function getSitemapContent(locale: SeoLocale) {
  const newsData = await NewsService.getAllNews(undefined, 0, locale);
  const articles = await ArticlesService.getAllArticles(locale);
  const plantsData = await PlantService.getAllPlants(undefined, 0, locale);
  const vacancies = await VacancyService.getAllVacancies(locale);
  const procurements = await ProcurementService.getAllProcurements(locale);

  return {
    news: newsData.news,
    articles,
    plants: plantsData.plants,
    vacancies,
    procurements,
  };
}

export async function getSafeSitemapContent(locale: SeoLocale) {
  try {
    return await getSitemapContent(locale);
  } catch (error) {
    console.error(`Failed to load sitemap CMS content for ${locale}:`, error);

    return {
      news: [],
      articles: [],
      plants: [],
      vacancies: [],
      procurements: [],
    };
  }
}

export function getStaticSitemapPaths() {
  return Object.values(staticRoutes);
}

export function buildNewsImageAlt(title: string) {
  return `${title} - ${siteName}`;
}

export function buildMultilingualStaticUrls() {
  return getStaticSitemapPaths().flatMap((path) =>
    getStaticPathLocales(path).map((locale) => ({
      locale,
      path,
      url: absoluteUrl(localizedPath(locale, path)),
    })),
  );
}

export function getStaticPathLocales(path: string): readonly SeoLocale[] {
  return path === "/news" ||
    path === "/articles" ||
    path === "/plants" ||
    path === "/vacancies"
    ? cmsLocales
    : supportedLocales;
}

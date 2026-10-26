import "server-only";
import { Redis } from "@upstash/redis";
import { ArticlesService } from "services/articles.service";
import { NewsService } from "services/news.service";
import { toPlainText, type PortableTextBlock } from "@portabletext/react";
import { loadWithFallback } from "@/lib/cms-locale";
import type { RichText, RichTextTable } from "@/types/richtext";
import { COMPANY_CONTACTS, SITE_PAGES } from "@/lib/assistant/site-map";
import { routing } from "@/i18n/routing";

/**
 * Knowledge-base layer for the virtual assistant.
 *
 * Aggregates the site's content (static navigation + CMS articles/news from
 * Sanity) into a single compact text digest that is stuffed into the model's
 * system prompt. For a site this size a vector store is unnecessary; the digest
 * fits comfortably in Gemini's context window.
 *
 * The digest is cached in Upstash Redis (keyed by UI locale) so we don't hit
 * the CMS on every chat message. uz content is translated gradually: while a
 * section has no uz documents, uz users get the `en` material — the model
 * still answers in uz.
 */

const KB_CACHE_PREFIX = "assistant:kb:v5";
const KB_CACHE_TTL_SECONDS = 3600;

// Prompt-size budget. Enough per item for the assistant to give informative
// answers (full sentences, real summaries), while still bounding the request.
/** Max plain-text characters kept per CMS item. */
const MAX_ITEM_CHARS = 900;
/** Newest N news items to include. */
const NEWS_LIMIT = 8;
/** Max articles to include. */
const ARTICLES_LIMIT = 12;

const redis = Redis.fromEnv();

/** Flatten Portable Text (including table cells) into collapsed plain text. */
export function richTextToPlainText(blocks: RichText | null | undefined): string {
  if (!Array.isArray(blocks)) return "";

  const parts: string[] = [];
  for (const block of blocks) {
    if (block._type === "block") {
      parts.push(toPlainText([block as PortableTextBlock]));
    } else if (block._type === "dataTable") {
      for (const row of (block as RichTextTable).table?.rows ?? []) {
        parts.push(...(row.cells ?? []));
      }
    }
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function truncate(value: string, max = MAX_ITEM_CHARS): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}…`;
}

/** Prefix a locale-agnostic site path with the active locale segment. */
function localizedUrl(locale: string, path: string): string {
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

function buildNavigationSection(locale: string): string {
  const lines = SITE_PAGES.map(
    (page) =>
      `- ${page.title} (${localizedUrl(locale, page.path)}): ${page.description}`,
  );
  return `## Site pages\n${lines.join("\n")}`;
}

async function buildArticlesSection(locale: string): Promise<string> {
  try {
    const { data: articles } = await loadWithFallback(
      locale,
      (contentLocale) => ArticlesService.getAllArticles(contentLocale, true),
      (items) => items.length === 0,
    );
    if (!articles?.length) return "";

    const lines = articles.slice(0, ARTICLES_LIMIT).map((article) => {
      const url = localizedUrl(locale, `/articles/${article.slug}`);
      // Prefer the full body (truncated) over the short excerpt so the assistant
      // has real content to summarise from, not a one-line teaser.
      const fullText = richTextToPlainText(article.content);
      const body = fullText || article.excerpt?.trim() || "";
      return `- ${article.title} (${url}): ${truncate(body)}`;
    });

    return `## Articles\n${lines.join("\n")}`;
  } catch (error) {
    console.error("[assistant] Failed to load articles for KB:", error);
    return "";
  }
}

async function buildNewsSection(locale: string): Promise<string> {
  try {
    const { data } = await loadWithFallback(
      locale,
      (contentLocale) =>
        NewsService.getAllNews(NEWS_LIMIT, 0, contentLocale, true),
      (result) => result.news.length === 0,
    );
    const news = data?.news ?? [];
    if (!news.length) return "";

    const lines = news.map((item) => {
      const url = localizedUrl(locale, `/news/${item.slug}`);
      const date = item.date ? ` [${item.date}]` : "";
      const fullText = richTextToPlainText(item.description);
      const body = fullText || item.excerpt?.trim() || "";
      return `- ${item.title}${date} (${url}): ${truncate(body)}`;
    });

    return `## News (latest ${news.length})\n${lines.join("\n")}`;
  } catch (error) {
    console.error("[assistant] Failed to load news for KB:", error);
    return "";
  }
}

/**
 * Build (or read from cache) the knowledge digest for a given user locale.
 * `locale` is the user's UI locale (en | ru | uz) and is used for links;
 * CMS content falls back to English where the locale has none yet.
 */
export async function buildKnowledgeBase(locale: string): Promise<string> {
  const cacheKey = `${KB_CACHE_PREFIX}:${locale}`;

  try {
    const cached = await redis.get<string>(cacheKey);
    if (cached) return cached;
  } catch (error) {
    console.error("[assistant] KB cache read failed:", error);
  }

  const [navigation, articles, news] = await Promise.all([
    Promise.resolve(buildNavigationSection(locale)),
    buildArticlesSection(locale),
    buildNewsSection(locale),
  ]);

  const contacts = `## Company contacts\n${COMPANY_CONTACTS}`;

  const digest = [contacts, navigation, articles, news]
    .filter(Boolean)
    .join("\n\n");

  try {
    await redis.set(cacheKey, digest, { ex: KB_CACHE_TTL_SECONDS });
  } catch (error) {
    console.error("[assistant] KB cache write failed:", error);
  }

  return digest;
}

/**
 * Drop the cached digests of every locale, so the next chat message rebuilds
 * them from the CMS. Called by the Sanity revalidate webhook.
 */
export async function invalidateKnowledgeBase(): Promise<void> {
  await redis.del(
    ...routing.locales.map((locale) => `${KB_CACHE_PREFIX}:${locale}`),
  );
}

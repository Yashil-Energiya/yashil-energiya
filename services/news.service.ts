import { fetchData } from "lib/sanity-client";
import { CACHE_TAGS } from "lib/cache-tags";
import {
  ENTRY_ID,
  IMAGE,
  SEO,
  cmsLocale,
  hasLocale,
  languages,
  localized,
  richText,
} from "./fragments";
import type { NewResponse, NewsResponse } from "./news.service.types";

const tags = [CACHE_TAGS.news];

const FILTER = `_type == "news" && ${hasLocale()}`;

const CARD_FIELDS = `
  ${ENTRY_ID},
  "slug": slug.current,
  date,
  "cover": cover${IMAGE}
`;

const CARD_LOCALIZED = `title, excerpt`;
const BODY = richText("description");

export const NewsService = {
  // Lists need only the card; the full body is heavy (~3 KB per item), so it
  // is loaded only for the assistant's knowledge base.
  getAllNews: async (
    first?: number,
    skip = 0,
    locale = "en",
    withBody = false,
  ) => {
    const paginated = first !== undefined;
    const query = `{
      "news": *[${FILTER}] | order(date desc, _id asc) ${paginated ? "[$start...$end]" : ""} {
        ${CARD_FIELDS},
        "updatedAt": _updatedAt,
        ${localized(`${CARD_LOCALIZED}, ${withBody ? `${BODY},` : ""} "seo": seo{ noIndex }`)},
        ${languages()}
      },
      "newsConnection": { "aggregate": { "count": count(*[${FILTER}]) } }
    }`;

    const params = { locale: cmsLocale(locale) };
    return fetchData<NewsResponse>(
      query,
      paginated ? { ...params, start: skip, end: skip + first } : params,
      { tags },
    );
  },

  getOneNews: async (slug: string, locale: string) => {
    const query = `*[${FILTER} && slug.current == $slug][0]{
      ${CARD_FIELDS},
      "updatedAt": _updatedAt,
      ${localized(`${CARD_LOCALIZED}, ${BODY}, ${SEO}`)},
      ${languages()}
    }`;

    return fetchData<NewResponse | null>(
      query,
      { slug, locale: cmsLocale(locale) },
      { tags },
    );
  },

  getNewsByIds: async (ids: string[], locale: string) => {
    if (!ids.length) {
      return [];
    }

    const query = `*[${FILTER} && entryId in $ids]{
      ${CARD_FIELDS},
      ${localized(CARD_LOCALIZED)}
    }`;
    return fetchData<NewResponse[]>(
      query,
      { ids, locale: cmsLocale(locale) },
      { tags },
    );
  },

  // Every published news id, whatever its languages (news-views validation).
  getAllNewsIds: async () =>
    fetchData<string[]>(`*[_type == "news"].entryId`, {}, { tags }),

  getLastNews: async (locale: string) => {
    const query = `*[${FILTER}] | order(date desc, _id asc) [0...3]{
      ${CARD_FIELDS},
      ${localized(CARD_LOCALIZED)}
    }`;
    return fetchData<NewResponse[]>(query, { locale: cmsLocale(locale) }, { tags });
  },
};

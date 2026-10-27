/**
 * Cache tags for Sanity-backed data. Every CMS query is tagged with the
 * document type it reads, so the `/api/revalidate` webhook can purge exactly
 * the affected data when a document is published or unpublished.
 *
 * Keys are Sanity `_type` values (what the webhook projection sends).
 */
export const CACHE_TAGS = {
  article: "sanity:article",
  news: "sanity:news",
  plant: "sanity:plant",
  vacancy: "sanity:vacancy",
  procurement: "sanity:procurement",
  manager: "sanity:manager",
  evCharge: "sanity:ev-charge",
  mhp: "sanity:mhp",
  plantStatus: "sanity:plant-status",
} as const;

export type SanityDocumentType = keyof typeof CACHE_TAGS;

export const ALL_CACHE_TAGS = Object.values(CACHE_TAGS);

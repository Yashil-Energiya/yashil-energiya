import { fetchData } from "lib/sanity-client";
import { CACHE_TAGS } from "lib/cache-tags";
import type { RichText } from "@/types/richtext";
import { cmsLocale, hasLocale, languages, localized, richText } from "./fragments";

export type TenderStatus = "open" | "closed" | "completed";

export interface Tender {
  id: string;
  title: string;
  status: TenderStatus;
  /** ISO date, e.g. "2025-01-15". */
  deadline: string;
  fileUrl?: string | null;
  fileName?: string | null;
}

export interface ProcurementSummary {
  slug: string;
  projectNumber?: string | null;
  title: string;
  description?: string | null;
  tendersCount: number;
  /** Languages this procurement is filled in. */
  languages?: string[];
}

export interface Procurement extends ProcurementSummary {
  eyebrow?: string | null;
  notice: RichText | null;
  contactName?: string | null;
  contactRole?: string | null;
  contactAddress?: string | null;
  contactEmail: string;
  tenders: Tender[];
}

const tags = [CACHE_TAGS.procurement];

const FILTER = `_type == "procurement" && ${hasLocale()}`;

const SUMMARY = `
  "slug": slug.current,
  projectNumber,
  "tendersCount": count(tenders),
  ${languages()}
`;

// A tender file missing in this language falls back to ru, then en.
const FILE = `coalesce(file[$locale].asset, file.ru.asset, file.en.asset)`;

export const ProcurementService = {
  getAllProcurements: async (locale: string) => {
    // Oldest first: the general procurements card stays on top.
    const query = `*[${FILTER}] | order(_createdAt asc, _id asc){
      ${SUMMARY},
      ${localized("title, description")}
    }`;
    return fetchData<ProcurementSummary[]>(
      query,
      { locale: cmsLocale(locale) },
      { tags },
    );
  },

  getOneProcurement: async (slug: string, locale: string) => {
    const query = `*[${FILTER} && slug.current == $slug][0]{
      ${SUMMARY},
      contactEmail,
      "tenders": coalesce(tenders[]{
        "id": _key,
        "title": coalesce(title[$locale], title.en),
        status,
        deadline,
        "fileUrl": ${FILE}->url,
        "fileName": ${FILE}->originalFilename
      }, []),
      ${localized(
        `title, description, eyebrow, ${richText("notice")}, contactName, contactRole, contactAddress`,
      )}
    }`;
    return fetchData<Procurement | null>(
      query,
      { slug, locale: cmsLocale(locale) },
      { tags },
    );
  },
};

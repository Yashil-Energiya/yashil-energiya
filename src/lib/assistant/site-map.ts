/**
 * Static navigation facts for the virtual assistant.
 *
 * These describe the site's pages so the assistant can guide users to the right
 * place. Paths are locale-agnostic here; `buildKnowledgeBase` prefixes them with
 * the active locale (next-intl uses an always-on locale prefix, e.g. `/uz/...`).
 *
 * Descriptions are kept in English on purpose: the model translates them into the
 * user's language at answer time, and English keeps the prompt token cost low.
 * Update this list whenever a user-facing route is added or its purpose changes.
 */

export interface SitePage {
  /** Locale-agnostic path, without the leading locale segment. */
  path: string;
  /** Short human label for the page. */
  title: string;
  /** What the user can do or find here. */
  description: string;
}

/**
 * Company contact facts injected into the knowledge base so the assistant can
 * answer "where are you located?" / "how do I reach you?" directly. Keep in sync
 * with the Contacts page (messages/*.json → ContactsPage).
 */
export const COMPANY_CONTACTS = [
  "Head office address: Tashkent, Yunusabad district, Bodomzor street 2B (landmark: UZGIDROMET / Uzhydromet).",
  "Customer call centre (questions and requests from clients): +998 55-514-88-44.",
  "Office reception (calls are transferred to the right employee): +998 55-511-88-44.",
  "EV charging stations technical support (charging and mobile app issues): +998 90 830-10-00.",
  "Email: info@yashil-energiya.uz.",
  "Full contact details and a map are on the Contacts page.",
].join(" ");

export const SITE_PAGES: SitePage[] = [
  {
    path: "/",
    title: "Home",
    description:
      "Company overview and entry point to solar panels, micro hydro plants, EV charging stations and the latest news.",
  },
  {
    path: "/about",
    title: "About the company",
    description: "Who Yashil Energiya is, its mission and activities in green/renewable energy.",
  },
  {
    path: "/ceo",
    title: "CEO / leadership",
    description: "Message from the company's leadership.",
  },
  {
    path: "/solarpanels",
    title: "Solar panels",
    description: "Information about solar panels and photovoltaic solutions offered by the company.",
  },
  {
    path: "/microges",
    title: "Micro hydro power plants (MicroGES)",
    description: "Information about micro hydroelectric power plant solutions.",
  },
  {
    path: "/chargingstation",
    title: "EV charging stations",
    description: "Electric vehicle charging station products and services.",
  },
  {
    path: "/ev-guide",
    title: "EV guide",
    description: "Guide and useful information about electric vehicles and charging.",
  },
  {
    path: "/plants",
    title: "Power plants / installed objects",
    description:
      "Map and list of installed stations and energy objects, with details for each object.",
  },
  {
    path: "/resources/calculator",
    title: "Solar station calculator",
    description:
      "Interactive calculator that recommends a solar station size and estimates savings from the user's electricity consumption; it can send a lead request to the company.",
  },
  {
    path: "/installation-request",
    title: "Installation request",
    description: "Form to request installation of a solar station or other equipment.",
  },
  {
    path: "/articles",
    title: "Articles",
    description: "Educational articles about solar energy, equipment and related topics.",
  },
  {
    path: "/news",
    title: "News",
    description: "Company and industry news.",
  },
  {
    path: "/contacts",
    title: "Contacts",
    description: "Phone numbers, addresses and ways to reach the company.",
  },
  {
    path: "/documents",
    title: "Documents",
    description: "Official documents, licenses and downloadable files.",
  },
  {
    path: "/procurements",
    title: "Procurements / tenders",
    description: "Procurement and tender information.",
  },
  {
    path: "/vacancies",
    title: "Vacancies",
    description: "Open job positions at the company.",
  },
  {
    path: "/search",
    title: "Search",
    description: "Full-text search across the site.",
  },
];

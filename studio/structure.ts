import type { StructureBuilder, StructureResolver } from "sanity/structure";
import { BASE_LANGUAGE, LANGUAGES } from "./languages";

const CONTENT_TYPES = [
  { type: "news", title: "Новости" },
  { type: "article", title: "Статьи" },
  { type: "plant", title: "СЭС" },
  { type: "vacancy", title: "Вакансии" },
  { type: "procurement", title: "Закупки" },
  { type: "manager", title: "Руководство" },
];

const MAP_TYPES = [
  { type: "plantStatus", title: "СЭС по регионам (карта)" },
  { type: "evCharge", title: "Зарядные станции (карта)" },
  { type: "mhp", title: "МикроГЭС (карта)" },
];

// Title field used to tell whether a language version is filled in.
const TITLE_FIELD: Record<string, string> = { manager: "name" };

// Each multilingual type: all entries, plus work queues of entries that still
// miss a translation (the site falls back to English for them).
function contentList(S: StructureBuilder, type: string, title: string) {
  const titleField = TITLE_FIELD[type] ?? "title";

  return S.listItem()
    .title(title)
    .schemaType(type)
    .child(
      S.list()
        .title(title)
        .items([
          S.documentTypeListItem(type).title("Все"),
          S.divider(),
          ...LANGUAGES.filter((l) => l.id !== BASE_LANGUAGE).map((language) =>
            S.listItem()
              .title(`Без перевода: ${language.title}`)
              .schemaType(type)
              .child(
                S.documentTypeList(type)
                  .title(`${title} — без перевода: ${language.title}`)
                  .filter(`_type == $type && !defined(${language.id}.${titleField})`)
                  .params({ type }),
              ),
          ),
        ]),
    );
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Контент")
    .items([
      ...CONTENT_TYPES.map(({ type, title }) => contentList(S, type, title)),
      S.divider(),
      ...MAP_TYPES.map(({ type, title }) =>
        S.documentTypeListItem(type).title(title),
      ),
    ]);

import { defineArrayMember, defineField, defineType } from "sanity";
import { LANGUAGES } from "../../languages";
import { COMMON_GROUP, localizedFields, localizedGroups, slugField } from "../fields";
import { localizedPreview } from "../preview";

const STATUSES = [
  { title: "Открыт", value: "open" },
  { title: "Закрыт", value: "closed" },
  { title: "Завершен", value: "completed" },
];

// Tender rows: status and deadline are shared, so they never differ between
// languages; only the title and the document file are per language.
const tender = defineArrayMember({
  name: "tender",
  title: "Тендер",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Название",
      type: "object",
      fields: LANGUAGES.map((language) =>
        defineField({ name: language.id, title: language.title, type: "string" }),
      ),
      validation: (rule) =>
        rule.custom((value: Record<string, string | undefined> | undefined) =>
          value?.en?.trim() ? true : "Заполните английское название",
        ),
    }),
    defineField({
      name: "status",
      title: "Статус",
      type: "string",
      options: { list: STATUSES, layout: "radio", direction: "horizontal" },
      initialValue: "open",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "deadline",
      title: "Крайний срок",
      type: "date",
      options: { dateFormat: "DD.MM.YYYY" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "file",
      title: "Документация",
      type: "object",
      description:
        "Файл на каждом языке. Если для языка файла нет, на сайте показывается русский, затем английский.",
      fields: LANGUAGES.map((language) =>
        defineField({ name: language.id, title: language.title, type: "file" }),
      ),
    }),
  ],
  preview: {
    select: { title: "title.ru", fallback: "title.en", status: "status", deadline: "deadline" },
    prepare: ({ title, fallback, status, deadline }) => ({
      title: title || fallback || "Без названия",
      subtitle: [STATUSES.find((s) => s.value === status)?.title, deadline]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});

export const procurement = defineType({
  name: "procurement",
  title: "Закупка",
  type: "document",
  groups: localizedGroups,
  fields: [
    defineField({
      ...slugField,
      description:
        "Часть URL: /procurements/{slug}. Нажмите «Generate» — адрес создастся из английского названия. После публикации не меняйте.",
    }),
    defineField({
      name: "projectNumber",
      title: "Номер проекта",
      type: "string",
      group: COMMON_GROUP,
      description: "Например, P000827. Пусто — на карточке будет «Общие закупки».",
    }),
    defineField({
      name: "contactEmail",
      title: "E-mail для связи",
      type: "string",
      group: COMMON_GROUP,
      initialValue: "marketing@yashil-energiya.uz",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "tenders",
      title: "Тендеры",
      type: "array",
      group: COMMON_GROUP,
      of: [tender],
    }),
    ...localizedFields([
      defineField({
        name: "title",
        title: "Название проекта",
        type: "string",
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: "description",
        title: "Описание для карточки",
        type: "text",
        rows: 4,
      }),
      defineField({
        name: "eyebrow",
        title: "Шапка уведомления",
        type: "text",
        rows: 4,
        description: "Каждая строка выводится отдельно (страна, проект, номер).",
      }),
      defineField({
        name: "notice",
        title: "Уведомление о закупках",
        type: "richText",
        validation: (rule) => rule.required(),
      }),
      defineField({ name: "contactName", title: "Контакт: имя", type: "string" }),
      defineField({ name: "contactRole", title: "Контакт: должность", type: "string" }),
      defineField({ name: "contactAddress", title: "Контакт: адрес", type: "string" }),
    ]),
  ],
  preview: localizedPreview("title"),
});

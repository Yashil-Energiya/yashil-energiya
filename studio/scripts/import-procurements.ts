// One-off import of the procurements section (the former data/tenders.ts and
// the hardcoded /procurements/procurement1|2 pages) into Sanity. Tender files
// are uploaded from public/documents. createIfNotExists: re-running never
// overwrites what editors have changed in Studio.
//
//   cd studio && npx sanity exec scripts/import-procurements.ts --with-user-token
import { createReadStream } from "node:fs";
import path from "node:path";
import { getCliClient } from "sanity/cli";
import { apiVersion } from "../env";

const client = getCliClient({ apiVersion });
const DOCUMENTS_DIR = path.resolve(process.cwd(), "../public/documents");

const key = () => crypto.randomUUID().slice(0, 12);

// A paragraph; [text, "em"] pieces are italic.
const p = (...parts: (string | [string, "em"])[]) => ({
  _type: "block",
  _key: key(),
  style: "normal",
  markDefs: [],
  children: parts.map((part) => ({
    _type: "span",
    _key: key(),
    text: typeof part === "string" ? part : part[0],
    marks: typeof part === "string" ? [] : [part[1]],
  })),
});

const uploads = new Map<string, Promise<string>>();
const asset = (fileName: string) => {
  if (!uploads.has(fileName)) {
    uploads.set(
      fileName,
      client.assets
        .upload("file", createReadStream(path.join(DOCUMENTS_DIR, fileName)), {
          filename: fileName,
        })
        .then((doc) => doc._id),
    );
  }
  return uploads.get(fileName)!;
};

type Lang = "en" | "ru" | "uz";
type TenderInput = {
  title: Record<Lang, string>;
  status: "open" | "closed" | "completed";
  deadline: string;
  file: Record<Lang, string>;
};

async function tender({ title, status, deadline, file }: TenderInput) {
  const files = Object.fromEntries(
    await Promise.all(
      Object.entries(file).map(async ([lang, name]) => [
        lang,
        { _type: "file", asset: { _type: "reference", _ref: await asset(name) } },
      ]),
    ),
  );
  return { _type: "tender", _key: key(), title, status, deadline, file: files };
}

const contact = {
  en: {
    contactName: "N.T. Nasretdinov",
    contactRole: "Director of JV “Yashil Energiya” LLC",
    contactAddress: "2B, Bodomzor str., Yunusabad district, Tashkent city, Uzbekistan",
  },
  ru: {
    contactName: "Насретдинов Н.Т.",
    contactRole: "Директор СП ООО «Yashil Energiya»",
    contactAddress: "2Б, ул. Чингиза Айтматова, Юнусабадский район, Ташкент, Узбекистан",
  },
  uz: {
    contactName: "Nasretdinov N.T.",
    contactRole: "«Yashil Energiya» QK MChJ direktori",
    contactAddress: "2B, Chingiz Aytmatov ko‘chasi, Yunusobod tumani, Toshkent, O‘zbekiston",
  },
};

const sameFile = (name: string) => ({ en: name, ru: name, uz: name });

async function main() {
  const general = {
    _id: "procurement-1",
    _type: "procurement",
    slug: { _type: "slug", current: "procurement1" },
    contactEmail: "marketing@yashil-energiya.uz",
    tenders: await Promise.all([
      tender({
        title: {
          en: "Tender for the Provision of Customs Clearance Services for Imported Goods",
          ru: "Конкурс на прибретение услуг по таможенному оформлению импортируемых грузов",
          uz: "Import qilinadigan yuklarni bojxona rasmiylashtiruvi xizmatlarini xarid qilish tanlovi",
        },
        status: "closed",
        deadline: "2025-01-15",
        file: sameFile("RFQ-04-1360.pdf"),
      }),
      tender({
        title: {
          en: "Selection of a Consulting Company to Conduct an Audit of Financial Statements",
          ru: "Отбор консалтинговой компании на проведение аудита по финансовой отчетности",
          uz: "Moliyaviy hisobot auditini o‘tkazish uchun konsalting kompaniyasini tanlash",
        },
        status: "closed",
        deadline: "2025-01-15",
        file: sameFile("RFQ-04-1371.pdf"),
      }),
    ]),
    en: {
      title: "General procurements",
      notice: [
        p("JV LLC “Yashil Energiya”, within the scope of its statutory activities and implemented development programs, plans to utilize financial resources for the procurement of goods, works, non-consulting services, and consulting services required for the preparation and implementation of projects in the field of distributed solar energy."),
        p("The planned activities include, inter alia, the preparation of feasibility studies, environmental and social assessments, development of relevant environmental and social instruments, legal and regulatory due diligence, preparation of tender documentation, as well as support throughout the procurement process."),
        p("Procurement of goods, works, non-consulting services, and consulting services will be carried out in accordance with the Company’s internal procedures, taking into account the requirements of the legislation of the Republic of Uzbekistan, as well as the principles of transparency, open competition, and equal access for potential participants."),
        p("Information on ongoing procurement procedures and tenders will be published on the official website of JV LLC “Yashil Energiya” as they are announced."),
        p("Interested companies and individuals possessing the required qualifications and experience, and wishing to consider participation in the supply of goods, execution of works, or provision of services, as well as those seeking additional information, may contact JV LLC “Yashil Energiya” using the contact details provided on the Company’s official website."),
      ],
      ...contact.en,
    },
    ru: {
      title: "Общие закупки",
      notice: [
        p("СП ООО «Yashil Energiya» в рамках своей уставной деятельности и реализуемых программ развития планирует использование финансовых средств на оплату товаров, работ, неконсультационных и консультационных услуг, необходимых для подготовки и реализации проектов в сфере распределённой солнечной энергетики."),
        p("Планируемые мероприятия включают, в том числе, проведение технико-экономических обоснований, экологических и социальных оценок, разработку соответствующих экологических и социальных инструментов, правовой и нормативной экспертизы, подготовку тендерной документации, а также сопровождение закупочных процедур."),
        p("Закупки товаров, работ, неконсультационных и консультационных услуг будут осуществляться в соответствии с действующими внутренними процедурами компании, а также с учётом требований законодательства Республики Узбекистан, принципов прозрачности, открытой конкуренции и равного доступа для потенциальных участников."),
        p("Информация о проводимых закупочных процедурах и конкурсах будет публиковаться на официальном веб-сайте СП ООО «Yashil Energiya» по мере их объявления."),
        p("Заинтересованные компании и физические лица, обладающие необходимой квалификацией и опытом, и желающие рассмотреть возможность участия в поставке товаров, выполнении работ или оказании услуг, а также лица, заинтересованные в получении дополнительной информации, могут обращаться в СП ООО «Yashil Energiya» по контактным данным, указанным на официальном сайте компании."),
      ],
      ...contact.ru,
    },
    uz: {
      title: "Umumiy xaridlar",
      notice: [
        p("«Yashil Energiya» QK MChJ o‘zining ustav faoliyati va amalga oshirilayotgan rivojlanish dasturlari doirasida taqsimlangan quyosh energetikasi sohasidagi loyihalarni tayyorlash va amalga oshirish uchun zarur bo‘lgan tovarlar, ishlar, nokonsalting va konsalting xizmatlarini to‘lash uchun moliyaviy mablag‘lardan foydalanishni rejalashtirmoqda."),
        p("Rejalashtirilgan tadbirlar, jumladan, texnik-iqtisodiy asoslashlar, ekologik va ijtimoiy baholashlarni o‘tkazish, tegishli ekologik va ijtimoiy vositalarni ishlab chiqish, huquqiy va me’yoriy ekspertiza, tender hujjatlarini tayyorlash, shuningdek xarid protseduralarini qo‘llab-quvvatlashni o‘z ichiga oladi."),
        p("Tovarlar, ishlar, nokonsalting va konsalting xizmatlarini xarid qilish kompaniyaning amaldagi ichki protseduralariga muvofiq, shuningdek O‘zbekiston Respublikasi qonunchiligi talablari, shaffoflik, ochiq raqobat va potentsial ishtirokchilar uchun teng imkoniyat tamoyillarini hisobga olgan holda amalga oshiriladi."),
        p("O‘tkazilayotgan xarid protseduralari va tanlovlar to‘g‘risidagi ma’lumotlar e’lon qilinishiga qarab «Yashil Energiya» QK MChJ rasmiy veb-saytida joylashtiriladi."),
        p("Zarur malaka va tajribaga ega bo‘lgan hamda tovarlar yetkazib berish, ishlarni bajarish yoki xizmatlar ko‘rsatishda ishtirok etish imkoniyatini ko‘rib chiqmoqchi bo‘lgan manfaatdor kompaniyalar va jismoniy shaxslar, shuningdek qo‘shimcha ma’lumot olishdan manfaatdor shaxslar «Yashil Energiya» QK MChJ ga kompaniyaning rasmiy saytida ko‘rsatilgan aloqa ma’lumotlari orqali murojaat qilishlari mumkin."),
      ],
      ...contact.uz,
    },
  };

  const aiib = {
    _id: "procurement-2",
    _type: "procurement",
    slug: { _type: "slug", current: "procurement2" },
    projectNumber: "P000827",
    contactEmail: "marketing@yashil-energiya.uz",
    tenders: await Promise.all([
      tender({
        title: {
          en: "Competition for the purchase of office equipment",
          ru: "Конкурс на закупку оргтехники",
          uz: "Ofis texnikasini xarid qilish tanlovi",
        },
        status: "completed",
        deadline: "2025-05-30",
        file: sameFile("RFQ_IT_office.docx"),
      }),
      tender({
        title: {
          en: "Competition for the purchase of stationery",
          ru: "Конкурс на закупку канцтоваров",
          uz: "Kanselyariya tovarlarini xarid qilish tanlovi",
        },
        status: "completed",
        deadline: "2025-06-02",
        file: sameFile("RFQ_Invitation_eng_stationery.docx"),
      }),
      tender({
        title: {
          en: "Selection Consulting company for preparing Feasibility Study report",
          ru: "Отбор консалтинговой компании для разработки ТЭО проекта",
          uz: "Loyihaning texnik-iqtisodiy asoslashini (TIA) ishlab chiqish uchun konsalting kompaniyasini tanlash",
        },
        status: "completed",
        deadline: "2025-09-19",
        file: { en: "REOI_QCBS_1_eng.docx", ru: "REOI_QCBS_1_rus.docx", uz: "REOI_QCBS_1_rus.docx" },
      }),
    ]),
    en: {
      title: "Project development",
      description:
        "The Republic of Uzbekistan has received a Project Preparation Special Fund (PPSF) grant in the amount equivalent to US$1,700,000 from the Asian Infrastructure Investment Bank (AIIB) for preparatory activities for the project to develop state distributed solar energy in Uzbekistan and intends to use part of the funds to pay for goods, works, non-consulting services and consulting services to be procured under this grant.",
      eyebrow:
        "Republic of Uzbekistan\nUzbekistan Public Distributed Solar Energy\nDevelopment Project\nProject ID No.: P000827",
      notice: [
        p("The Republic of Uzbekistan has received Project Preparation Special Fund (PPSF), hereafter referred to as “the Grant”, in the amount of US$ 1,700,000 equivalent from the Asian Infrastructure Investment Bank (hereafter AIIB) toward the project preparatory activities for the Uzbekistan Public Distributed Solar Energy Development Project, and it intends to apply part of the proceeds to payments for goods, works, non-consulting services and consulting services to be procured under this grant."),
        p("The activities under the Grant will include project preparatory activities, including feasibility study, environmental and social assessment and preparation of E&S instruments, legal and regulatory due diligence, preparation of bidding documents, and support with the tender process."),
        p(
          "Procurement of contracts financed by the AIIB will be conducted through the procedures as specified in ",
          ["AIIB Directive on Procurement Instructions for Recipients (July 2024)", "em"],
          ", and is open to all eligible firms and individuals.",
        ),
        p("Specific procurement notices for contracts subject to international open competitive tender will be announced, as they become available, on the AIIB’s external website and on the website of JV \"Yashil Energiya\" LLC."),
        p("Interested eligible firms and individuals who would wish to be considered for the provision of goods, works, non-consulting services and consulting services for the abovementioned project, or those requiring additional information, should contact the project implementing agency at the address below:"),
      ],
      ...contact.en,
    },
    ru: {
      title: "Проект развития",
      description:
        "Республика Узбекистан получила Специальный фонд подготовки проекта (PPSF), далее именуемый «Грант», в размере, эквивалентном 1 700 000 долл. США, от Азиатского банка инфраструктурных инвестиций (далее – АБИИ) на подготовительные мероприятия по проекту развития государственной распределенной солнечной энергетики в Узбекистане и намерена использовать часть средств на оплату товаров, работ, неконсультационных услуг и консультационных услуг, которые будут закуплены в рамках этого гранта.",
      eyebrow:
        "Республика Узбекистан\nРаспределенная солнечная энергия в Узбекистане\nПроект развития\nИдентификационный номер проекта: P000827",
      notice: [
        p("Республика Узбекистан получила Специальный фонд подготовки проекта (PPSF), далее именуемый «Грант», в размере, эквивалентном 1 700 000 долл. США, от Азиатского банка инфраструктурных инвестиций (далее – АБИИ) на подготовительные мероприятия по проекту развития государственной распределенной солнечной энергетики в Узбекистане и намерена использовать часть средств на оплату товаров, работ, неконсультационных услуг и консультационных услуг, которые будут закуплены в рамках этого гранта."),
        p("Мероприятия в рамках гранта будут включать подготовительные мероприятия по проекту, в том числе технико-экономическое обоснование, экологическую и социальную оценку и подготовку экологических и социальных инструментов, юридическую и нормативную проверку, подготовку тендерной документации и поддержку в тендерном процессе."),
        p(
          "Закупки по контрактам, финансируемым АБИИ, будут проводиться в соответствии с процедурами, указанными в ",
          ["Директиве АБИИ об инструкциях по закупкам для получателей (июль 2024 г.),", "em"],
          " и открыты для всех соответствующих требованиям фирм и лиц.",
        ),
        p("Конкретные уведомления о закупках по контрактам, подлежащим международному открытому конкурсу, будут публиковаться по мере их поступления на внешнем веб-сайте АБИИ и на веб-сайте СП ООО «Yashil Energiya»."),
        p("Заинтересованные компании и частные лица, имеющие право на участие в тендере и желающие рассмотреть возможность предоставления товаров, работ, неконсультационных и консультационных услуг для вышеупомянутого проекта, или те, кому требуется дополнительная информация, должны связаться с агентством, реализующим проект, по указанному ниже адресу:"),
      ],
      ...contact.ru,
    },
    uz: {
      title: "Rivojlanish loyihasi",
      description:
        "O‘zbekiston Respublikasi Osiyo infratuzilma investitsiyalari bankidan (keyingi o‘rinlarda – AIIB) O‘zbekistonda davlat taqsimlangan quyosh energetikasini rivojlantirish loyihasi bo‘yicha tayyorgarlik tadbirlari uchun 1 700 000 AQSh dollariga teng miqdorda Loyihani tayyorlash maxsus jamg‘armasini (PPSF, keyingi o‘rinlarda – «Grant») oldi va mablag‘larning bir qismini ushbu grant doirasida xarid qilinadigan tovarlar, ishlar, nokonsalting va konsalting xizmatlari uchun to‘lashga yo‘naltirish niyatida.",
      eyebrow:
        "O‘zbekiston Respublikasi\nO‘zbekistonda taqsimlangan quyosh energiyasi\nRivojlanish loyihasi\nLoyihaning identifikatsiya raqami: P000827",
      notice: [
        p("O‘zbekiston Respublikasi Osiyo infratuzilma investitsiyalari bankidan (keyingi o‘rinlarda – AIIB) O‘zbekistonda davlat taqsimlangan quyosh energetikasini rivojlantirish loyihasi bo‘yicha tayyorgarlik tadbirlari uchun 1 700 000 AQSh dollariga teng miqdorda Loyihani tayyorlash maxsus jamg‘armasini (PPSF, keyingi o‘rinlarda – «Grant») oldi va mablag‘larning bir qismini ushbu grant doirasida xarid qilinadigan tovarlar, ishlar, nokonsalting va konsalting xizmatlari uchun to‘lashga yo‘naltirish niyatida."),
        p("Grant doirasidagi tadbirlar loyiha bo‘yicha tayyorgarlik ishlarini, jumladan texnik-iqtisodiy asoslash, ekologik va ijtimoiy baholash hamda ekologik va ijtimoiy vositalarni tayyorlash, huquqiy va me’yoriy tekshiruv, tender hujjatlarini tayyorlash va tender jarayonini qo‘llab-quvvatlashni o‘z ichiga oladi."),
        p(
          "AIIB tomonidan moliyalashtiriladigan shartnomalar bo‘yicha xaridlar ",
          ["AIIB ning oluvchilar uchun xaridlar bo‘yicha ko‘rsatmalar to‘g‘risidagi direktivasida (2024-yil iyul)", "em"],
          " belgilangan protseduralarga muvofiq amalga oshiriladi va barcha talablarga javob beradigan firmalar va shaxslar uchun ochiqdir.",
        ),
        p("Xalqaro ochiq tanlovga qo‘yiladigan shartnomalar bo‘yicha aniq xarid bildirishnomalari ular paydo bo‘lishiga qarab AIIB ning tashqi veb-saytida va «Yashil Energiya» QK MChJ veb-saytida e’lon qilinadi."),
        p("Tenderda ishtirok etish huquqiga ega bo‘lgan hamda yuqorida qayd etilgan loyiha uchun tovarlar, ishlar, nokonsalting va konsalting xizmatlarini taqdim etish imkoniyatini ko‘rib chiqmoqchi bo‘lgan manfaatdor kompaniyalar va jismoniy shaxslar, yoki qo‘shimcha ma’lumotga muhtoj bo‘lganlar, loyihani amalga oshiruvchi agentlik bilan quyidagi manzil orqali bog‘lanishlari lozim:"),
      ],
      ...contact.uz,
    },
  };

  // One transaction = same _createdAt; the _id tiebreak keeps procurement-1 on top.
  const result = await client
    .transaction()
    .createIfNotExists(general)
    .createIfNotExists(aiib)
    .commit();
  console.log(`Done: ${result.results.map((r) => r.id).join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

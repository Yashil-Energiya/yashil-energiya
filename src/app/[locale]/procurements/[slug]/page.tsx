import { TheHero } from "@/components/HeroComponent/TheHero";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import type { Metadata } from "next";
import { ProcurementService } from "services/procurements.service";
import { ProcurementBreadcrumbs } from "@/components/ProcurementsComponent/ProcurementBreadcrumbs";
import { ProcurementSubNav } from "@/components/ProcurementsComponent/ProcurementSubNav";
import { ContactPlaque } from "@/components/ProcurementsComponent/ContactPlaque";
import { TendersList } from "@/components/ProcurementsComponent/TendersList";
import { TheReveal } from "@/components/ui/Reveal/TheReveal";
import ThePageContent from "@/components/PageContentComponent/ThePageContent";
import { TheJsonLd } from "@/components/JsonLd/TheJsonLd";
import {
  breadcrumbJsonLd,
  cmsAlternateLocales,
  createMetadata,
  normalizeLocale,
  staticSeo,
} from "@/lib/seo";
import s from "@/components/ProcurementsComponent/Procurement.module.scss";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const procurement = await ProcurementService.getOneProcurement(slug, locale);

  if (!procurement) {
    return {};
  }

  return createMetadata({
    locale,
    path: `/procurements/${slug}`,
    title: procurement.title,
    description:
      procurement.description ||
      staticSeo.procurements[normalizeLocale(locale)].description,
    alternateLocales: cmsAlternateLocales(procurement.languages),
  });
}

export default async function ProcurementPage({ params }: Props) {
  const { slug, locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("TendersPage");
  const procurement = await ProcurementService.getOneProcurement(slug, locale);

  if (!procurement) {
    // uz is translated gradually: without a uz version, use the English page.
    if (locale === "uz") {
      redirect({ href: `/procurements/${slug}`, locale: "en" });
    }
    notFound();
  }

  const { projectNumber, title, eyebrow, notice, tenders } = procurement;
  const currentName = [projectNumber, title].filter(Boolean).join(" · ");

  return (
    <>
      <TheJsonLd
        data={breadcrumbJsonLd(locale, [
          { name: t("title"), path: "/procurements" },
          { name: currentName, path: `/procurements/${slug}` },
        ])}
      />
      <TheHero title1={t("title")} url1="procurements" titleTag="h1" />
      <div className="container">
        <ProcurementBreadcrumbs current={currentName} />
        <div className={s.content}>
          <ProcurementSubNav />

          <TheReveal as="section" className={s.notice} motionKey="notice">
            <h2 className={s.sectionTitle} id="section1">
              {t("noticeTitle")}
            </h2>
            <div className={s.accentLine} aria-hidden="true" />

            <article className={s.doc}>
              {eyebrow && (
                <div className={s.docEyebrow}>
                  {eyebrow.split("\n").map((line) => (
                    <p key={line} className="description">
                      {line}
                    </p>
                  ))}
                </div>
              )}
              <ThePageContent content={notice} />
            </article>

            <ContactPlaque
              name={procurement.contactName ?? ""}
              role={procurement.contactRole ?? ""}
              address={procurement.contactAddress ?? ""}
              email={procurement.contactEmail}
              website="https://www.yashil-energiya.uz"
            />
          </TheReveal>

          <section className={s.tenders}>
            <h2 className={s.sectionTitle} id="section2">
              {t("tendersTitle")}
            </h2>
            <div className={s.accentLine} aria-hidden="true" />
            <TendersList tenders={tenders} />
          </section>
        </div>
      </div>
    </>
  );
}

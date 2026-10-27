import { TheFeedback } from "@/components/FeedbackComponent/TheFeedback";
import { TheHero } from "@/components/HeroComponent/TheHero";
import { TheReveal } from "@/components/ui/Reveal/TheReveal";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import s from "./page.module.scss";
import { ProcurementService } from "services/procurements.service";

export default async function TendersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("TendersPage");
  const procurements =
    (await ProcurementService.getAllProcurements(locale)) ?? [];

  return (
    <>
      <TheHero title1={t("title")} url1="procurements" titleTag="h1" />
      <div className={`${s.container} container`}>
        <TheReveal className={s.intro}>
          <p>{t("intro")}</p>
        </TheReveal>

        <TheReveal stagger className={s.grid} motionKey="procurements-grid">
          {procurements.map((procurement) => {
            const {
              slug,
              projectNumber,
              title,
              description,
              tendersCount: count,
            } = procurement;

            return (
              <Link
                key={slug}
                href={`/procurements/${slug}`}
                className={s.card}
              >
                <span className={s.badge}>
                  {projectNumber || t("generalLabel")}
                </span>
                <h2 className={s.cardTitle}>{title}</h2>
                {description && (
                  <p className={s.cardText}>{description}</p>
                )}
                <span className={s.cardFooter}>
                  {count ? (
                    <span className={s.count}>
                      {t("tendersCount", { count })}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className={s.more}>
                    {t("more")}
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </span>
              </Link>
            );
          })}
        </TheReveal>
      </div>
      <TheFeedback />
    </>
  );
}

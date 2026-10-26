"use client";

import type { CSSProperties } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  BatteryCharging,
  Calculator,
  ChevronRight,
  CircleDollarSign,
  Gauge,
  Leaf,
  PlugZap,
  ShieldCheck,
  SunMedium,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { TheHero } from "@/components/HeroComponent/TheHero";
import {
  TheContentSections,
  type ContentSection,
} from "@/components/ContentSectionsComponent/TheContentSections";
import { TheMotionWrapper } from "@/components/MotionWrapper/TheMotionWrapper";
import { Link } from "@/i18n/navigation";
import type { PlantStatus } from "services/plant-status.service";
import s from "./page.module.scss";
import { numberLocale } from "@/lib/number-locale";

const TheChart = dynamic(
  () => import("@/components/ChartComponent/TheChart").then((m) => m.TheChart),
  { ssr: false },
);

const ThePlantsMap = dynamic(
  () =>
    import("@/components/MapComponent/ThePlantsMap").then(
      (m) => m.ThePlantsMap,
    ),
  { ssr: false },
);

type MetricKey = "metric1" | "metric2" | "metric3" | "metric4";
type BenefitKey = "benefit1" | "benefit2" | "benefit3" | "benefit4";
type SystemKey = "system1" | "system2" | "system3";

type SolarPanelsClientProps = {
  plantStatuses: PlantStatus[];
};

const metricKeys = [
  "metric1",
  "metric2",
  "metric3",
  "metric4",
] as const satisfies readonly MetricKey[];

const benefitCards = [
  { key: "benefit1", icon: Leaf },
  { key: "benefit2", icon: ShieldCheck },
  { key: "benefit3", icon: CircleDollarSign },
  { key: "benefit4", icon: Gauge },
] satisfies Array<{ key: BenefitKey; icon: LucideIcon }>;

const systemCards = [
  {
    key: "system1",
    icon: PlugZap,
    image: {
      src: "/solarPanelsPage/on-grid1.webp",
      width: 1600,
      height: 900,
    },
  },
  {
    key: "system2",
    icon: BatteryCharging,
    image: {
      src: "/solarPanelsPage/off-grid.webp",
      width: 1600,
      height: 900,
    },
  },
  {
    key: "system3",
    icon: Zap,
    image: {
      src: "/solarPanelsPage/hybrid.webp",
      width: 1600,
      height: 900,
    },
  },
] satisfies Array<{
  key: SystemKey;
  icon: LucideIcon;
  image: {
    src: string;
    width: number;
    height: number;
  };
}>;

const staggerStyle = (index: number) =>
  ({ "--item-index": index } as CSSProperties);

export function SolarPanelsClient({ plantStatuses }: SolarPanelsClientProps) {
  const locale = useLocale();
  const t = useTranslations("SolarPanelsPage");
  const integerFormatter = new Intl.NumberFormat(numberLocale(locale));
  const decimalFormatter = new Intl.NumberFormat(numberLocale(locale), {
    maximumFractionDigits: 2,
  });
  const totalPvPlants = plantStatuses.reduce(
    (total, plant) => total + plant.plants,
    0,
  );
  const totalPvPower = plantStatuses.reduce(
    (total, plant) => total + plant.power,
    0,
  );
  const formattedTotalPvPlants = integerFormatter.format(totalPvPlants);
  const formattedTotalPvPower = decimalFormatter.format(totalPvPower);

  return (
    <>
      <TheHero title1={t("heroTitle")} url1="solarPanels" titleTag="h1" />
      <div className={s.page}>
        <section className={s.metricsSection} aria-label={t("metrics.label")}>
          <TheMotionWrapper motionKey="solar-metrics">
            <div className={s.metricsGrid}>
              {metricKeys.map((metric, index) => (
                <article
                  className={s.metricCard}
                  key={metric}
                  style={staggerStyle(index)}
                >
                  <strong>
                    {metric === "metric4"
                      ? formattedTotalPvPlants
                      : t(`metrics.${metric}.value`)}
                  </strong>
                  <span>{t(`metrics.${metric}.label`)}</span>
                  <p>{t(`metrics.${metric}.description`)}</p>
                </article>
              ))}
            </div>
          </TheMotionWrapper>
        </section>

        <section
          id="solar-solutions"
          className={s.benefitsSection}
          aria-labelledby="solar-benefits-title"
        >
          <TheMotionWrapper motionKey="solar-benefits">
            <div className={s.sectionHeader}>
              <span className={s.eyebrow}>{t("benefits.eyebrow")}</span>
              <h2 id="solar-benefits-title">{t("benefits.title")}</h2>
              <p>{t("benefits.description")}</p>
            </div>
            <div className={s.benefitsGrid}>
              {benefitCards.map(({ key, icon: Icon }, index) => (
                <article
                  className={s.benefitCard}
                  key={key}
                  style={staggerStyle(index)}
                >
                  <span className={s.iconCircle}>
                    <Icon aria-hidden="true" />
                  </span>
                  <h3>{t(`benefits.${key}.title`)}</h3>
                  <p>{t(`benefits.${key}.description`)}</p>
                </article>
              ))}
            </div>
          </TheMotionWrapper>
        </section>

        <section className={s.potentialSection} aria-labelledby="solar-potential-title">
          <TheMotionWrapper motionKey="solar-potential">
            <div className={s.potentialGrid}>
              <div className={s.potentialCopy}>
                <span className={s.eyebrow}>{t("potential.eyebrow")}</span>
                <h2 id="solar-potential-title">{t("potential.title")}</h2>
                <p>{t("potential.description")}</p>
              </div>
              <div className={s.potentialVisual} aria-hidden="true">
                <div className={s.sunPath}>
                  <SunMedium aria-hidden="true" />
                </div>
                <div className={s.potentialPanelGrid}>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className={s.potentialBadge}>
                  <strong>{t("potential.badgeValue")}</strong>
                  <span>{t("potential.badgeLabel")}</span>
                </div>
              </div>
            </div>
          </TheMotionWrapper>
        </section>

        <section className={s.systemTypes} aria-labelledby="solar-types-title">
          <TheMotionWrapper motionKey="solar-systems">
            <div className={s.sectionHeader}>
              <span className={s.eyebrow}>{t("systems.eyebrow")}</span>
              <h2 id="solar-types-title">{t("systems.title")}</h2>
              <p>{t("systems.description")}</p>
            </div>
            <div className={s.systemsGrid}>
              {systemCards.map(({ key, icon: Icon, image }, index) => (
                <article
                  className={s.systemCard}
                  key={key}
                  style={staggerStyle(index)}
                >
                  <div className={s.systemImage}>
                    <Image
                      src={image.src}
                      alt={t(`${key}.alt`)}
                      width={image.width}
                      height={image.height}
                      className={s.systemPhoto}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <span className={s.systemBadge}>
                      <Icon aria-hidden="true" />
                      {t(`${key}.technicalLabel`)}
                    </span>
                  </div>
                  <div className={s.systemBody}>
                    <h3>{t(`${key}.title`)}</h3>
                    <p>{t(`${key}.description`)}</p>
                    <div className={s.systemFooter}>
                      <span>{t(`${key}.context`)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </TheMotionWrapper>
        </section>

        <section
          id="current-status"
          className={s.statusSection}
          aria-labelledby="solar-status-title"
        >
          <TheMotionWrapper motionKey="solar-status">
            <div className={s.statusIntro}>
              <span className={s.eyebrow}>{t("status.eyebrow")}</span>
              <h2 id="solar-status-title">{t("status.title")}</h2>
              <p>{t("status.description")}</p>
            </div>
            <div className={s.statusGrid}>
              <article className={s.statusCard}>
                <span>{t("status.cardLabel")}</span>
                <strong>{t("status.cardTitle")}</strong>
                <div className={s.statusFacts}>
                  <div>
                    <b>
                      {formattedTotalPvPower} {t("chartLabelUnit")}
                    </b>
                    <small>{t("status.capacityLabel")}</small>
                  </div>
                  <div>
                    <b>{t("status.sinceValue")}</b>
                    <small>{t("status.sinceLabel")}</small>
                  </div>
                </div>
              </article>
              <article className={s.chartCard}>
                <h3>{t("status.chartTitle")}</h3>
                <div className={s.chartFrame}>
                  <TheChart
                    currentPower={totalPvPower}
                    label={t("chartLabel")}
                    unit={t("chartLabelUnit")}
                    yearLabel={t("chartYearLabel")}
                  />
                </div>
              </article>
            </div>
            <article className={s.mapCard}>
              <h3>{t("status.mapTitle")}</h3>
              <div className={s.mapFrame}>
                <ThePlantsMap plants={plantStatuses} />
              </div>
            </article>
          </TheMotionWrapper>
        </section>

        <TheContentSections
          sections={t.raw("seoSections") as ContentSection[]}
          cta={{
            href: "/resources/calculator",
            label: t("calculatorCapacityCta"),
          }}
        />

        <section className={s.ctaSection} aria-labelledby="solar-cta-title">
          <TheMotionWrapper motionKey="solar-cta">
            <div className={s.ctaPanel}>
              <div>
                <span className={s.eyebrow}>{t("cta.eyebrow")}</span>
                <h2 id="solar-cta-title">{t("cta.title")}</h2>
                <p>{t("cta.text")}</p>
              </div>
              <div className={s.heroActions}>
                <Link className={s.primaryAction} href="/contacts">
                  <span>{t("cta.button")}</span>
                  <ChevronRight aria-hidden="true" />
                </Link>
                <Link
                  className={s.secondaryAction}
                  href="/resources/calculator"
                >
                  <Calculator aria-hidden="true" />
                  <span>{t("cta.calculatorButton")}</span>
                </Link>
              </div>
            </div>
          </TheMotionWrapper>
        </section>
      </div>
    </>
  );
}

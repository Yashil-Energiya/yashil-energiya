"use client";

import type { CSSProperties } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  Activity,
  BatteryCharging,
  BriefcaseBusiness,
  Cable,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Construction,
  Droplets,
  Factory,
  FileText,
  Gauge,
  Landmark,
  MapPin,
  Network,
  PlugZap,
  Settings,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { TheMotionWrapper } from "@/components/MotionWrapper/TheMotionWrapper";
import { Link } from "@/i18n/navigation";
import type { Mhp } from "services/operational-assets.service";
import s from "./page.module.scss";
import { numberLocale } from "@/lib/number-locale";

const TheMicroMap = dynamic(
  () =>
    import("@/components/MapComponent/TheMicroMap").then(
      (m) => m.TheMicroMap,
    ),
  { ssr: false },
);

type MicroGesClientProps = {
  mhps: Mhp[];
};

type MetricKey =
  | "capacityRange"
  | "projectPower"
  | "serviceDirections"
  | "legalBasis";
type BenefitKey =
  | "stableGeneration"
  | "renewableWater"
  | "remoteSupply"
  | "lowMaintenance";
type ProcessKey =
  | "waterFlow"
  | "hydroNode"
  | "turbine"
  | "generator"
  | "delivery";
type ServiceKey = "design" | "construction" | "commissioning" | "operation";
type BusinessKey =
  | "auctionWinner"
  | "construction"
  | "generation"
  | "energosavdo"
  | "consumer";
type ProjectFactKey = "capacity" | "location" | "object";
type ProjectBadgeKey = "waterResource" | "localGeneration" | "renewable";

const metricKeys = [
  "capacityRange",
  "projectPower",
  "serviceDirections",
  "legalBasis",
] as const satisfies readonly MetricKey[];

const benefitCards = [
  { key: "stableGeneration", icon: Gauge },
  { key: "renewableWater", icon: Droplets },
  { key: "remoteSupply", icon: PlugZap },
  { key: "lowMaintenance", icon: CircleDollarSign },
] satisfies Array<{ key: BenefitKey; icon: LucideIcon }>;

const processSteps = [
  { key: "waterFlow", icon: Droplets },
  { key: "hydroNode", icon: Factory },
  { key: "turbine", icon: Settings },
  { key: "generator", icon: Zap },
  { key: "delivery", icon: Cable },
] satisfies Array<{ key: ProcessKey; icon: LucideIcon }>;

const serviceCards = [
  { key: "design", icon: ClipboardCheck },
  { key: "construction", icon: Construction },
  { key: "commissioning", icon: Activity },
  { key: "operation", icon: BriefcaseBusiness },
] satisfies Array<{ key: ServiceKey; icon: LucideIcon }>;

const businessSteps = [
  { key: "auctionWinner", icon: Landmark },
  { key: "construction", icon: Construction },
  { key: "generation", icon: BatteryCharging },
  { key: "energosavdo", icon: Network },
  { key: "consumer", icon: PlugZap },
] satisfies Array<{ key: BusinessKey; icon: LucideIcon }>;

const projectFactKeys = [
  "capacity",
  "location",
  "object",
] as const satisfies readonly ProjectFactKey[];

const projectBadgeKeys = [
  "waterResource",
  "localGeneration",
  "renewable",
] as const satisfies readonly ProjectBadgeKey[];

const staggerStyle = (index: number) =>
  ({ "--item-index": index } as CSSProperties);

export function MicroGesClient({ mhps }: MicroGesClientProps) {
  const locale = useLocale();
  const t = useTranslations("MicroGesPage");
  const homeT = useTranslations("HomePage");
  const integerFormatter = new Intl.NumberFormat(numberLocale(locale));
  const capacityFormatter = new Intl.NumberFormat(numberLocale(locale), {
    maximumFractionDigits: 2,
  });

  const totalCapacity = mhps.reduce((total, plant) => total + plant.capacity, 0);
  const regionCount = new Set(mhps.map((plant) => plant.region)).size;
  const hasMhpData = mhps.length > 0;

  return (
    <div className={s.page}>
      <section className={s.hero} aria-labelledby="micro-hydro-title">
        <div className="container">
          <nav className={s.breadcrumbs} aria-label={t("breadcrumbs.label")}>
            <ol>
              <li>
                <Link href="/">{homeT("title")}</Link>
              </li>
              <li aria-current="page">{t("heroTitle")}</li>
            </ol>
          </nav>

          <div className={s.heroGrid}>
            <div className={s.heroCopy}>
              <span className={s.eyebrow}>{t("hero.eyebrow")}</span>
              <h1 id="micro-hydro-title">{t("hero.title")}</h1>
              <p>{t("hero.subtitle")}</p>
              <div className={s.heroActions}>
                <Link className={s.primaryAction} href="/contacts">
                  <span>{t("hero.primaryCta")}</span>
                  <ChevronRight aria-hidden="true" />
                </Link>
                <a className={s.secondaryAction} href="#micro-hydro-process">
                  <span>{t("hero.secondaryCta")}</span>
                  <ChevronRight aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className={s.heroVisual}>
              <div className={s.heroImage}>
                <Image
                  src="/aboutPage/about-micro-hydro.webp"
                  alt={t("hero.imageAlt")}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 48vw, 620px"
                />
              </div>
              <div className={s.heroBadge}>
                <Droplets aria-hidden="true" />
                <div>
                  <strong>{t("hero.visualTitle")}</strong>
                  <span>{t("hero.visualText")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={s.metricsGrid} aria-label={t("metrics.label")}>
            {metricKeys.map((metric, index) => (
              <article
                className={s.metricCard}
                key={metric}
                style={staggerStyle(index)}
              >
                <strong>{t(`metrics.${metric}.value`)}</strong>
                <span>{t(`metrics.${metric}.label`)}</span>
                <p>{t(`metrics.${metric}.description`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={s.benefitsSection} aria-labelledby="micro-benefits-title">
        <TheMotionWrapper motionKey="micro-benefits">
          <div className={s.sectionHeader}>
            <span className={s.eyebrow}>{t("benefits.eyebrow")}</span>
            <h2 id="micro-benefits-title">{t("benefits.title")}</h2>
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

      <section
        id="micro-hydro-process"
        className={s.processSection}
        aria-labelledby="micro-process-title"
      >
        <TheMotionWrapper motionKey="micro-process">
          <div className={s.sectionHeader}>
            <span className={s.eyebrow}>{t("process.eyebrow")}</span>
            <h2 id="micro-process-title">{t("process.title")}</h2>
            <p>{t("process.description")}</p>
          </div>
          <ol className={s.processSteps} aria-label={t("process.ariaLabel")}>
            {processSteps.map(({ key, icon: Icon }, index) => (
              <li
                className={s.processStep}
                key={key}
                style={staggerStyle(index)}
              >
                <span className={s.processNumber}>
                  {integerFormatter.format(index + 1)}
                </span>
                <span className={s.processIcon}>
                  <Icon aria-hidden="true" />
                </span>
                <h3>{t(`process.${key}.title`)}</h3>
                <p>{t(`process.${key}.description`)}</p>
              </li>
            ))}
          </ol>
        </TheMotionWrapper>
      </section>

      <section className={s.servicesSection} aria-labelledby="micro-services-title">
        <TheMotionWrapper motionKey="micro-services">
          <div className={s.sectionHeader}>
            <span className={s.eyebrow}>{t("services.eyebrow")}</span>
            <h2 id="micro-services-title">{t("services.title")}</h2>
            <p>{t("services.description")}</p>
          </div>
          <div className={s.servicesGrid}>
            {serviceCards.map(({ key, icon: Icon }, index) => (
              <article
                className={s.serviceCard}
                key={key}
                style={staggerStyle(index)}
              >
                <div className={s.serviceMeta}>
                  <span>{integerFormatter.format(index + 1)}</span>
                  <Icon aria-hidden="true" />
                </div>
                <h3>{t(`services.${key}.title`)}</h3>
                <p>{t(`services.${key}.description`)}</p>
              </article>
            ))}
          </div>
        </TheMotionWrapper>
      </section>

      <section className={s.businessSection} aria-labelledby="micro-business-title">
        <TheMotionWrapper motionKey="micro-business">
          <div className={s.businessPanel}>
            <div className={s.sectionHeader}>
              <span className={s.eyebrow}>{t("business.eyebrow")}</span>
              <h2 id="micro-business-title">{t("business.title")}</h2>
              <p>{t("business.description")}</p>
            </div>
            <ol className={s.businessFlow} aria-label={t("business.ariaLabel")}>
              {businessSteps.map(({ key, icon: Icon }, index) => (
                <li
                  className={s.businessStep}
                  key={key}
                  style={staggerStyle(index)}
                >
                  <span className={s.businessIcon}>
                    <Icon aria-hidden="true" />
                  </span>
                  <h3>{t(`business.${key}.title`)}</h3>
                  <p>{t(`business.${key}.description`)}</p>
                </li>
              ))}
            </ol>
            <p className={s.businessNote}>{t("business.note")}</p>
          </div>
        </TheMotionWrapper>
      </section>

      <section className={s.projectSection} aria-labelledby="micro-project-title">
        <TheMotionWrapper motionKey="micro-project">
          <div className={s.projectGrid}>
            <div className={s.projectImageWrap}>
              <Image
                src="/aboutPage/about-micro-hydro.webp"
                alt={t("project.imageAlt")}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 48vw, 620px"
                className={s.projectImage}
              />
              <span>{t("project.imageBadge")}</span>
            </div>
            <div className={s.projectCopy}>
              <span className={s.eyebrow}>{t("project.eyebrow")}</span>
              <h2 id="micro-project-title">{t("project.title")}</h2>
              <p>{t("project.description")}</p>
              <dl className={s.projectFacts}>
                {projectFactKeys.map((fact) => (
                  <div key={fact}>
                    <dt>{t(`project.facts.${fact}.label`)}</dt>
                    <dd>{t(`project.facts.${fact}.value`)}</dd>
                  </div>
                ))}
              </dl>
              <div className={s.projectBadges}>
                {projectBadgeKeys.map((badge) => (
                  <span key={badge}>{t(`project.badges.${badge}`)}</span>
                ))}
              </div>
            </div>
          </div>
        </TheMotionWrapper>
      </section>

      <section className={s.statusSection} aria-labelledby="micro-status-title">
        <TheMotionWrapper motionKey="micro-status">
          <div className={s.statusIntro}>
            <span className={s.eyebrow}>{t("status.eyebrow")}</span>
            <h2 id="micro-status-title">{t("status.title")}</h2>
            <p>{t("status.description")}</p>
          </div>

          {hasMhpData ? (
            <div className={s.statusGrid}>
              <article className={s.statusCard}>
                <span>{t("status.cardLabel")}</span>
                <strong>{t("status.cardTitle")}</strong>
                <div className={s.statusFacts}>
                  <div>
                    <b>
                      {capacityFormatter.format(totalCapacity)}{" "}
                      {t("mapLabelUnit")}
                    </b>
                    <small>{t("status.capacityLabel")}</small>
                  </div>
                  <div>
                    <b>{integerFormatter.format(mhps.length)}</b>
                    <small>{t("status.objectsLabel")}</small>
                  </div>
                  <div>
                    <b>{integerFormatter.format(regionCount)}</b>
                    <small>{t("status.regionsLabel")}</small>
                  </div>
                </div>
              </article>
              <article className={s.mapCard}>
                <h3>{t("status.mapTitle")}</h3>
                <div className={s.mapFrame}>
                  <TheMicroMap plants={mhps} />
                </div>
              </article>
            </div>
          ) : (
            <article className={s.emptyState}>
              <MapPin aria-hidden="true" />
              <div>
                <h3>{t("status.emptyTitle")}</h3>
                <p>{t("status.emptyText")}</p>
              </div>
            </article>
          )}
        </TheMotionWrapper>
      </section>

      <section className={s.legalSection} aria-labelledby="micro-legal-title">
        <TheMotionWrapper motionKey="micro-legal">
          <article className={s.legalPanel}>
            <span className={s.legalIcon}>
              <FileText aria-hidden="true" />
            </span>
            <div>
              <span className={s.eyebrow}>{t("legal.eyebrow")}</span>
              <h2 id="micro-legal-title">{t("legal.title")}</h2>
              <p>{t("legal.description")}</p>
              <dl className={s.legalFacts}>
                <div>
                  <dt>{t("legal.dateLabel")}</dt>
                  <dd>{t("legal.dateValue")}</dd>
                </div>
                <div>
                  <dt>{t("legal.documentLabel")}</dt>
                  <dd>{t("legal.documentValue")}</dd>
                </div>
              </dl>
            </div>
          </article>
        </TheMotionWrapper>
      </section>

      <section className={s.ctaSection} aria-labelledby="micro-cta-title">
        <TheMotionWrapper motionKey="micro-cta">
          <div className={s.ctaPanel}>
            <div>
              <span className={s.eyebrow}>{t("cta.eyebrow")}</span>
              <h2 id="micro-cta-title">{t("cta.title")}</h2>
              <p>{t("cta.text")}</p>
            </div>
            <Link className={s.primaryAction} href="/contacts">
              <span>{t("cta.button")}</span>
              <ChevronRight aria-hidden="true" />
            </Link>
          </div>
        </TheMotionWrapper>
      </section>
    </div>
  );
}

import s from "./page.module.scss";
import { TheHero } from "@/components/HeroComponent/TheHero";
import { TheFeedback } from "@/components/FeedbackComponent/TheFeedback";
import { ThePlantsList } from "@/components/PlantsListComponent/ThePlantsList";
import { PlantService } from "services/plants.service";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  breadcrumbJsonLd,
  cmsAlternateLocales,
  createMetadata,
  powerPlantJsonLd,
} from "@/lib/seo";
import { TheJsonLd } from "@/components/JsonLd/TheJsonLd";
import { PlantGallery } from "./PlantGallery";
import { BackToListLink } from "./BackToListLink";
import { PlantLocationMap } from "./PlantLocationMap";
import {
  extractRegion,
  installationTimestamp,
  parseInstallationDate,
  parsePowerKw,
  parseProductionKwh,
  parseTons,
  parseTrees,
} from "@/lib/plant-metrics";
import {
  BarChart3,
  Calendar,
  CircleCheck,
  Cloud,
  ExternalLink,
  Flame,
  MapPin,
  TreePine,
  Zap,
} from "lucide-react";
import { numberLocale } from "@/lib/number-locale";

type Props = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const plant = await PlantService.getPlantById(id, locale);

  if (!plant) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "PlantDetail" });

  return createMetadata({
    locale,
    path: `/plants/${id}`,
    title: plant.title,
    description: `${plant.address}. ${t("power")}: ${plant.power}. ${t("averageAnnualProduction")}: ${plant.production}.`,
    image: plant.pictures[0]?.url,
    type: "article",
    alternateLocales: cmsAlternateLocales(plant.languages),
  });
}

export default async function Plant({ params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "PlantDetail" });
  const plant = await PlantService.getPlantById(id, locale);

  if (!plant) {
    // uz is translated gradually: without a uz version, use the English page.
    if (locale === "uz") {
      redirect({ href: `/plants/${id}`, locale: "en" });
    }
    notFound();
  }

  const {
    title,
    address,
    power,
    date,
    production,
    coal,
    gases,
    trees,
    pictures,
    coords,
  } = plant;

  const hasCoords =
    Array.isArray(coords) &&
    coords.length === 2 &&
    coords.every((value) => typeof value === "number" && Number.isFinite(value));

  const integerFormat = new Intl.NumberFormat(numberLocale(locale), {
    maximumFractionDigits: 0,
  });
  const decimalFormat = new Intl.NumberFormat(numberLocale(locale), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const powerKw = parsePowerKw(power);
  const powerDisplay =
    powerKw === null ? power.trim() : integerFormat.format(powerKw);

  const productionKwh = parseProductionKwh(production);
  const productionDisplay =
    productionKwh === null
      ? production.trim()
      : `${integerFormat.format(productionKwh)} ${t("unitKwh")}`;

  const dateParts = parseInstallationDate(date);
  const dateDisplay = dateParts
    ? new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day)))
    : date.trim();

  const formatTons = (raw: string) => {
    const tons = parseTons(raw);
    if (tons === null) return raw.trim() || "—";
    if (tons >= 1000) {
      return `${decimalFormat.format(tons / 1000)} ${t("unitKTons")}`;
    }
    return `${decimalFormat.format(tons)} ${t("unitTons")}`;
  };

  const treesCount = parseTrees(trees);
  const treesDisplay =
    treesCount === null ? trees.trim() || "—" : integerFormat.format(treesCount);

  const specs = [
    { icon: Zap, label: t("power"), value: `${powerDisplay} ${powerKw === null ? "" : t("unitKw")}`.trim() },
    { icon: BarChart3, label: t("averageAnnualProduction"), value: productionDisplay },
    { icon: Calendar, label: t("gridConnection"), value: dateDisplay },
    { icon: MapPin, label: t("location"), value: address },
  ];

  const ecoMetrics = [
    { icon: Flame, label: t("coalSaved"), value: formatTons(coal) },
    { icon: Cloud, label: t("co2Saved"), value: formatTons(gases) },
    { icon: TreePine, label: t("treesSaved"), value: treesDisplay },
  ];

  const { plants: allPlants } = await PlantService.getAllPlants(100, 0, locale);
  const region = extractRegion(address);
  const otherPlants = [
    ...allPlants.filter(
      (item) => item.id !== id && extractRegion(item.address) === region,
    ),
    ...allPlants
      .filter((item) => item.id !== id && extractRegion(item.address) !== region)
      .sort((a, b) => installationTimestamp(b.date) - installationTimestamp(a.date)),
  ].slice(0, 3);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${title}, ${address}`,
  )}`;

  return (
    <>
      <TheJsonLd
        data={[
          powerPlantJsonLd({
            locale,
            id,
            title,
            address,
            power,
            powerLabel: t("power"),
            image: pictures[0]?.url,
          }),
          breadcrumbJsonLd(locale, [
            { name: t("heroTitle"), path: "/plants" },
            { name: title, path: `/plants/${id}` },
          ]),
        ]}
      />
      <TheHero title1={t("heroTitle")} url1="plants" />
      <div className="container">
        <nav className={s.breadcrumbs} aria-label={t("breadcrumbsLabel")}>
          <ol>
            <li>
              <Link href="/">{t("breadcrumbHome")}</Link>
            </li>
            <li>
              <Link href="/plants">{t("heroTitle")}</Link>
            </li>
            <li aria-current="page">{title}</li>
          </ol>
        </nav>

        <BackToListLink />

        <header className={s.header}>
          <div className={s.headerMain}>
            <h1 className={s.title}>{title}</h1>
            <div className={s.metaRow}>
              <span className={s.metaLocation}>
                <MapPin aria-hidden="true" />
                {address}
              </span>
              <span className={s.statusBadge}>
                <CircleCheck aria-hidden="true" />
                {t("statusOperating")}
              </span>
              {dateParts && (
                <span className={s.metaDate}>
                  <Calendar aria-hidden="true" />
                  {dateDisplay}
                </span>
              )}
            </div>
          </div>
          <div className={s.powerAccent}>
            <span className={s.powerValue}>{powerDisplay}</span>
            {powerKw !== null && (
              <span className={s.powerUnit}>{t("unitKw")}</span>
            )}
            <span className={s.powerCaption}>{t("power")}</span>
          </div>
        </header>

        <PlantGallery pictures={pictures} title={title} />

        <div className={s.detailsGrid}>
          <section className={s.specsCard} aria-label={t("techTitle")}>
            <h2>{t("techTitle")}</h2>
            <dl className={s.specsList}>
              {specs.map((spec) => (
                <div key={spec.label} className={s.specRow}>
                  <dt>
                    <spec.icon aria-hidden="true" />
                    {spec.label}
                  </dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={s.locationCard} aria-label={t("locationTitle")}>
            <h2>{t("locationTitle")}</h2>
            <p className={s.locationAddress}>
              <MapPin aria-hidden="true" />
              {address}
            </p>
            {hasCoords ? (
              <div className={s.locationMapFrame}>
                <PlantLocationMap
                  coords={[coords[0], coords[1]]}
                  title={title}
                  address={address}
                />
              </div>
            ) : (
              <a
                className={s.mapsLink}
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("openInMaps")}
                <ExternalLink aria-hidden="true" />
              </a>
            )}
          </section>
        </div>

        <section className={s.ecoSection} aria-label={t("ecoTitle")}>
          <h2>{t("ecoTitle")}</h2>
          <div className={s.ecoGrid}>
            {ecoMetrics.map((metric) => (
              <article key={metric.label} className={s.ecoCard}>
                <metric.icon aria-hidden="true" />
                <p className={s.ecoValue}>{metric.value}</p>
                <p className={s.ecoLabel}>{metric.label}</p>
              </article>
            ))}
          </div>
          {/* TODO: подтвердить формулировку методики расчёта у заказчика */}
          <p className={s.ecoNote}>{t("ecoNote")}</p>
        </section>

        {otherPlants.length > 0 && (
          <section className={s.otherSection} aria-label={t("otherPlants")}>
            <div className={s.otherHeader}>
              <h2>{t("otherPlants")}</h2>
              <Link href="/plants" className={s.otherLink}>
                {t("allPlants")}
              </Link>
            </div>
            <ThePlantsList plants={otherPlants} />
          </section>
        )}
      </div>
      <TheFeedback />
    </>
  );
}

"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  BatteryCharging,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Gauge,
  Info,
  Leaf,
  MapPin,
  Phone,
  Plug,
  Smartphone,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { ChargingGuide } from "@/components/ChargingGuide/ChargingGuide";
import {
  TheContentSections,
  type ContentSection,
} from "@/components/ContentSectionsComponent/TheContentSections";
import { TheMotionWrapper } from "@/components/MotionWrapper/TheMotionWrapper";
import { ThePaginationControls } from "@/components/PaginationComponent/ThePaginationControls";
import { Link } from "@/i18n/navigation";
import { resolveRegionLabel } from "@/lib/region-labels";
import type { ChSMapControls } from "@/components/MapComponent/TheChSMap";
import type { EvCharge } from "services/operational-assets.service";
import s from "./page.module.scss";
import { numberLocale } from "@/lib/number-locale";

const TheChSMap = dynamic(
  () => import("@/components/MapComponent/TheChSMap").then((m) => m.TheChSMap),
  { ssr: false },
);

type BenefitKey =
  | "environment"
  | "energy"
  | "cost"
  | "supply"
  | "growth"
  | "digital";

const benefitCards = [
  { key: "environment", icon: Leaf },
  { key: "energy", icon: Gauge },
  { key: "cost", icon: CircleDollarSign },
  { key: "supply", icon: BatteryCharging },
  { key: "growth", icon: TrendingUp },
  { key: "digital", icon: Smartphone },
] satisfies Array<{ key: BenefitKey; icon: LucideIcon }>;

const chargingTypeSpecs = ["power", "time", "connector", "bestFor"] as const;


const STATIONS_PER_PAGE = 6;
const PHONE_HREF = "tel:+998555148844";

const staggerStyle = (index: number) =>
  ({ "--item-index": index } as CSSProperties);

type ChargingStationClientProps = {
  evCharges: EvCharge[];
};

export function ChargingStationClient({
  evCharges,
}: ChargingStationClientProps) {
  const locale = useLocale();
  const t = useTranslations("ChargingStationPage");
  const homeT = useTranslations("HomePage");
  const regionT = useTranslations("SolarPanelsPage");
  const integerFormatter = new Intl.NumberFormat(numberLocale(locale));
  const powerFormatter = new Intl.NumberFormat(numberLocale(locale), {
    maximumFractionDigits: 2,
  });

  const hasStations = evCharges.length > 0;
  const stationCount = evCharges.length;
  const regionCount = new Set(evCharges.map((station) => station.region)).size;
  const totalPower = evCharges.reduce(
    (total, station) => total + station.capacity,
    0,
  );
  const powerUnit = t("mapLabelUnit");

  const [stationsPage, setStationsPage] = useState(1);
  const totalStationPages = Math.ceil(stationCount / STATIONS_PER_PAGE);
  const visibleStations = evCharges.slice(
    (stationsPage - 1) * STATIONS_PER_PAGE,
    stationsPage * STATIONS_PER_PAGE,
  );

  const mapControlsRef = useRef<ChSMapControls | null>(null);
  const mapCardRef = useRef<HTMLElement | null>(null);
  const handleMapReady = useCallback((controls: ChSMapControls) => {
    mapControlsRef.current = controls;
  }, []);

  const handleStationClick = (id: string) => {
    mapCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    mapControlsRef.current?.focusStation(id);
  };

  const conditionLabel = (condition: string) => {
    try {
      return t(condition);
    } catch {
      return condition;
    }
  };

  const metricValues: Record<string, string> = {
    stations: hasStations ? integerFormatter.format(stationCount) : "—",
    regions: hasStations
      ? integerFormatter.format(regionCount)
      : t("metrics.regions.fallbackValue"),
    power: hasStations
      ? `${powerFormatter.format(totalPower)} ${powerUnit}`
      : "—",
    launch: t("metrics.launch.value"),
  };
  const metricKeys = ["stations", "regions", "power", "launch"] as const;

  return (
    <div className={s.page}>
      <section className={s.hero} aria-labelledby="charging-title">
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
              <h1 id="charging-title">{t("hero.title")}</h1>
              <p>{t("hero.subtitle")}</p>
              <div className={s.heroActions}>
                <a className={s.primaryAction} href="#how-to-charge">
                  <span>{t("hero.primaryCta")}</span>
                  <ChevronRight aria-hidden="true" />
                </a>
                <a className={s.secondaryAction} href="#charging-network">
                  <span>{t("hero.secondaryCta")}</span>
                  <ChevronRight aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className={s.heroVisual}>
              <div className={s.heroImage}>
                {/* TODO: replace with a dedicated high-res EV charging hero asset when provided */}
                <Image
                  src="/aboutPage/about-ev-charging.webp"
                  alt={t("hero.imageAlt")}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 48vw, 620px"
                />
              </div>
              <div className={s.heroBadge}>
                <Zap aria-hidden="true" />
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
                <strong>{metricValues[metric]}</strong>
                <span>{t(`metrics.${metric}.label`)}</span>
                <p>{t(`metrics.${metric}.description`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className={s.benefitsSection}
        aria-labelledby="charging-benefits-title"
      >
        <TheMotionWrapper motionKey="charging-benefits">
          <div className={s.sectionHeader}>
            <span className={s.eyebrow}>{t("benefits.eyebrow")}</span>
            <h2 id="charging-benefits-title">{t("benefits.title")}</h2>
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
        id="charging-network"
        className={s.networkSection}
        aria-labelledby="charging-network-title"
      >
        <TheMotionWrapper motionKey="charging-network">
          <div className={s.sectionHeader}>
            <span className={s.eyebrow}>{t("network.eyebrow")}</span>
            <h2 id="charging-network-title">{t("network.title")}</h2>
            <p>{t("network.description")}</p>
          </div>

          {hasStations ? (
            <>
              <div className={s.statusGrid}>
                <article className={s.summaryCard}>
                  <span>{t("network.summaryLabel")}</span>
                  <strong>{t("network.summaryTitle")}</strong>
                  <div className={s.summaryFacts}>
                    <div>
                      <b>{`${powerFormatter.format(totalPower)} ${powerUnit}`}</b>
                      <small>{t("network.capacityLabel")}</small>
                    </div>
                    <div>
                      <b>{integerFormatter.format(stationCount)}</b>
                      <small>{t("network.stationsLabel")}</small>
                    </div>
                    <div>
                      <b>{integerFormatter.format(regionCount)}</b>
                      <small>{t("network.regionsLabel")}</small>
                    </div>
                  </div>
                </article>

                <article className={s.stationsCard}>
                  <h3>{t("network.stationsLabel")}</h3>
                  <div className={s.stationsGrid}>
                    {visibleStations.map((station, index) => {
                      const isRunning = station.condition === "running";
                      return (
                        <button
                          type="button"
                          className={s.stationCard}
                          key={station.id}
                          style={staggerStyle(index)}
                          onClick={() => handleStationClick(station.id)}
                          aria-label={`${station.name} — ${t("network.mapTitle")}`}
                        >
                          <span className={s.stationTop}>
                            <span className={s.stationName}>
                              <strong>{station.name}</strong>
                              <span>
                                <MapPin aria-hidden="true" />
                                {resolveRegionLabel(
                                  regionT,
                                  station.region,
                                  station.regionName,
                                )}
                              </span>
                            </span>
                            {station.capacity > 0 && (
                              <span className={s.stationBadge}>
                                <b>{powerFormatter.format(station.capacity)}</b>
                                <span>{powerUnit}</span>
                              </span>
                            )}
                          </span>
                          <span
                            className={`${s.statusPill} ${
                              isRunning ? s.statusRunning : s.statusPending
                            }`}
                          >
                            {conditionLabel(station.condition)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {totalStationPages > 1 && (
                    <div className={s.stationsPagination}>
                      <ThePaginationControls
                        totalPages={totalStationPages}
                        currentPage={stationsPage}
                        setCurrentPage={setStationsPage}
                      />
                    </div>
                  )}
                </article>
              </div>

              <article className={s.mapCard} ref={mapCardRef}>
                <h3>{t("network.mapTitle")}</h3>
                <div className={s.mapFrame}>
                  <TheChSMap stations={evCharges} onReady={handleMapReady} />
                </div>
              </article>
            </>
          ) : (
            <article className={s.emptyState}>
              <MapPin aria-hidden="true" />
              <div>
                <h3>{t("network.emptyTitle")}</h3>
                <p>{t("network.emptyText")}</p>
              </div>
            </article>
          )}
        </TheMotionWrapper>
      </section>

      <section
        className={s.typesSection}
        aria-labelledby="charging-types-title"
      >
        <TheMotionWrapper motionKey="charging-types">
          <div className={s.sectionHeader}>
            <span className={s.eyebrow}>{t("chargingTypes.eyebrow")}</span>
            <h2 id="charging-types-title">{t("chargingTypes.title")}</h2>
            <p>{t("chargingTypes.description")}</p>
          </div>
          <div className={s.typesGrid}>
            {(
              [
                { key: "ac", icon: Plug },
                { key: "dc", icon: Zap },
              ] as const
            ).map(({ key, icon: Icon }) => (
              <article
                className={`${s.typeCard} ${key === "dc" ? s.typeDc : ""}`}
                key={key}
              >
                <div className={s.typeHeader}>
                  <div className={s.typeHeadText}>
                    <span className={s.typeIcon}>
                      <Icon aria-hidden="true" />
                    </span>
                    <h3>{t(`chargingTypes.${key}.name`)}</h3>
                  </div>
                  <span className={s.typeBadge}>
                    {t(`chargingTypes.${key}.badge`)}
                  </span>
                </div>
                <dl className={s.typeSpecs}>
                  {chargingTypeSpecs.map((spec) => (
                    <div key={spec}>
                      <dt>{t(`chargingTypes.${spec}Label`)}</dt>
                      <dd>{t(`chargingTypes.${key}.${spec}`)}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
          <p className={s.typesNote}>
            <Info aria-hidden="true" />
            {t("chargingTypes.note")}
          </p>
        </TheMotionWrapper>
      </section>

      <section id="how-to-charge" className={s.guideSection}>
        <ChargingGuide />
      </section>

      <TheContentSections
        sections={(t.raw("seoSections") as ContentSection[]).filter((x) =>
          ["price", "whyUs"].includes(x.id),
        )}
      />

      <section className={s.offerSection} aria-labelledby="charging-offer-title">
        <TheMotionWrapper motionKey="charging-offer">
          <article className={s.offerPanel}>
            <span className={s.offerIcon}>
              <FileText aria-hidden="true" />
            </span>
            <div>
              <span className={s.eyebrow}>{t("offer.eyebrow")}</span>
              <h2 id="charging-offer-title">{t("offer.title")}</h2>
              <p>{t("offer.description")}</p>
              <p className={s.offerNote}>{t("offer.note")}</p>
            </div>
            <Link
              className={s.primaryAction}
              href="/chargingstation/public-offer"
            >
              <span>{t("offer.button")}</span>
              <ChevronRight aria-hidden="true" />
            </Link>
          </article>
        </TheMotionWrapper>
      </section>

      <TheContentSections
        sections={(t.raw("seoSections") as ContentSection[]).filter(
          (x) => x.id === "faq",
        )}
      />

      <section className={s.ctaSection} aria-labelledby="charging-cta-title">
        <TheMotionWrapper motionKey="charging-cta">
          <div className={s.ctaPanel}>
            <div>
              <span className={s.eyebrow}>{t("cta.eyebrow")}</span>
              <h2 id="charging-cta-title">{t("cta.title")}</h2>
              <p>{t("cta.text")}</p>
            </div>
            <div className={s.ctaActions}>
              <Link className={s.primaryAction} href="/contacts">
                <span>{t("cta.button")}</span>
                <ChevronRight aria-hidden="true" />
              </Link>
              <a className={s.ctaPhone} href={PHONE_HREF}>
                <Phone aria-hidden="true" />
                <span>{t("cta.phone")}</span>
              </a>
            </div>
          </div>
        </TheMotionWrapper>
      </section>

    </div>
  );
}

"use client";

import s from "./ThePlantsList.module.scss";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Plant } from "services/plants.service";
import {
  installationYear,
  parsePowerKw,
  parseProductionKwh,
  parseTons,
} from "@/lib/plant-metrics";
import type { Locale } from "next-intl";
import { numberLocale } from "@/lib/number-locale";

type PlantsListProps = {
  plants: Plant[];
  contentLocale?: Locale;
};

export const ThePlantsList = ({ plants, contentLocale }: PlantsListProps) => {
  const t = useTranslations("PlantCard");
  const locale = useLocale();

  const integerFormat = new Intl.NumberFormat(numberLocale(locale), {
    maximumFractionDigits: 0,
  });
  const decimalFormat = new Intl.NumberFormat(numberLocale(locale), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formatPower = (raw: string) => {
    const kw = parsePowerKw(raw);
    return kw === null
      ? raw.trim()
      : `${integerFormat.format(kw)} ${t("unitKw")}`;
  };

  const formatProduction = (raw: string) => {
    const kwh = parseProductionKwh(raw);
    if (kwh === null) return raw.trim() || "—";
    if (kwh >= 100_000) {
      return `${decimalFormat.format(kwh / 1_000_000)} ${t("unitGwh")}`;
    }
    return `${integerFormat.format(kwh)} ${t("unitKwh")}`;
  };

  const formatCo2 = (raw: string) => {
    const tons = parseTons(raw);
    return tons === null
      ? raw.trim() || "—"
      : `${integerFormat.format(Math.round(tons))} ${t("unitTons")}`;
  };

  return (
    <ul className={s.projects}>
      {plants.map((plant) => {
        const cover = plant.pictures[0];
        const year = installationYear(plant.date);

        return (
          <li key={plant.id} className={s.project}>
            <Link
              className={s.card}
              href={`/plants/${plant.id}`}
              locale={contentLocale}
            >
              <span className={s.media}>
                {cover?.url && (
                  <Image
                    className={s.coverImage}
                    src={cover.url}
                    alt={`${plant.title}, ${plant.address}`}
                    fill
                    sizes="(max-width: 640px) 94vw, (max-width: 1024px) 46vw, 31vw"
                  />
                )}
                <span className={s.powerBadge}>{formatPower(plant.power)}</span>
                {year !== null && <span className={s.yearBadge}>{year}</span>}
              </span>

              <span className={s.body}>
                <h3 className={s.projectTitle}>{plant.title}</h3>
                <span className={s.location}>
                  <MapPin aria-hidden="true" />
                  {plant.address}
                </span>
              </span>

              <span className={s.footer}>
                <span className={s.metric}>
                  <span className={s.metricLabel}>{t("productionLabel")}</span>
                  <span className={s.metricValue}>
                    {formatProduction(plant.production)}
                  </span>
                </span>
                <span className={s.metric}>
                  <span className={s.metricLabel}>{t("co2Label")}</span>
                  <span className={s.metricValue}>
                    {formatCo2(plant.gases)}
                  </span>
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

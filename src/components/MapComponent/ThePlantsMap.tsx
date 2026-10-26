"use client";
import "@/lib/leaflet-icons";
import L from "leaflet";
import "leaflet.markercluster";
import LeafletMap from "@/components/MapComponent/LeafletMap";
import styles from "./Map.module.scss";
import { useLocale, useTranslations } from "next-intl";
import { escapeHtml } from "@/lib/html";
import { resolveRegionLabel } from "@/lib/region-labels";
import type { PlantStatus } from "services/plant-status.service";
import { numberLocale } from "@/lib/number-locale";

type ThePlantsMapProps = {
  plants: PlantStatus[];
};

const isLatLng = (c: unknown): c is [number, number] =>
  Array.isArray(c) &&
  c.length === 2 &&
  typeof c[0] === "number" &&
  typeof c[1] === "number" &&
  Number.isFinite(c[0]) &&
  Number.isFinite(c[1]);

export const ThePlantsMap = ({ plants }: ThePlantsMapProps) => {
  const locale = useLocale();
  const t = useTranslations("SolarPanelsPage");
  const integerFormatter = new Intl.NumberFormat(numberLocale(locale));
  const decimalFormatter = new Intl.NumberFormat(numberLocale(locale), {
    maximumFractionDigits: 2,
  });

  return (
    <LeafletMap
      center={[41.2, 64.0]}
      zoom={5}
      className={styles.map}
      storageKey="yashil-energiya:plants-map-view"
      onMap={(map, { restoredView }) => {
        const cluster = L.markerClusterGroup();
        const bounds = L.latLngBounds([]);

        plants.forEach((plant) => {
          if (!isLatLng(plant.coords)) return;

          bounds.extend(plant.coords);

          const marker = L.marker(plant.coords);
          marker.bindPopup(
            `<strong>${escapeHtml(
              resolveRegionLabel(t, plant.name, plant.regionName),
            )}</strong><br/>
             &#x1F3ED; ${escapeHtml(t("chartLabel1"))}: ${escapeHtml(
               integerFormatter.format(plant.plants),
             )}<br/>
             &#9889; ${escapeHtml(t("chartLabel"))} (${escapeHtml(
               t("chartLabelUnit"),
             )}): ${escapeHtml(decimalFormatter.format(plant.power))}`
          );

          cluster.addLayer(marker);
        });

        cluster.addTo(map);

        if (!restoredView && bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [20, 20],
            maxZoom: 10,
          });
        }

        return () => {
          cluster.clearLayers();
          map.removeLayer(cluster);
        };
      }}
    />
  );
};

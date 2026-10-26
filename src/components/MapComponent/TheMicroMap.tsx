"use client";

import "@/lib/leaflet-icons";
import L from "leaflet";
import "leaflet.markercluster";
import LeafletMap from "@/components/MapComponent/LeafletMap";
import styles from "@/components/MapComponent/Map.module.scss";
import { escapeHtml } from "@/lib/html";
import { resolveRegionLabel } from "@/lib/region-labels";
import { useLocale, useTranslations } from "next-intl";
import type { Mhp } from "services/operational-assets.service";
import { numberLocale } from "@/lib/number-locale";

type TheMicroMapProps = {
  plants: Mhp[];
};

const isLatLng = (c: unknown): c is [number, number] =>
  Array.isArray(c) &&
  c.length === 2 &&
  typeof c[0] === "number" &&
  typeof c[1] === "number" &&
  Number.isFinite(c[0]) &&
  Number.isFinite(c[1]);

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greyIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const TheMicroMap = ({ plants }: TheMicroMapProps) => {
  const locale = useLocale();
  const t = useTranslations("MicroGesPage");
  const regionT = useTranslations("SolarPanelsPage");
  const numberFormatter = new Intl.NumberFormat(numberLocale(locale), {
    maximumFractionDigits: 2,
  });

  const getConditionLabel = (condition: string) => {
    try {
      return t(condition);
    } catch {
      return condition;
    }
  };

  return (
    <LeafletMap
      center={[41.2, 64.0]}
      zoom={5}
      className={styles.map}
      storageKey="yashil-energiya:micro-map-view"
      onMap={(map, { restoredView }) => {
        const cluster = L.markerClusterGroup();
        const bounds = L.latLngBounds([]);

        plants.forEach((plant) => {
          if (!isLatLng(plant.coords)) return;

          bounds.extend(plant.coords);

          const icon = plant.condition === "planning" ? greyIcon : greenIcon;
          const marker = L.marker(plant.coords, { icon });

          marker.bindPopup(
            `<strong>${escapeHtml(plant.name)}</strong><br/>
             ${escapeHtml(
               resolveRegionLabel(regionT, plant.region, plant.regionName),
             )}<br/>
             &#x1F3ED; ${escapeHtml(t("mapLabel1"))}: ${escapeHtml(
               getConditionLabel(plant.condition),
             )}<br/>
             &#9889; ${escapeHtml(t("mapLabel"))} (${escapeHtml(
               t("mapLabelUnit"),
             )}): ${escapeHtml(numberFormatter.format(plant.capacity))}`
          );

          cluster.addLayer(marker);
        });

        cluster.addTo(map);

        if (!restoredView && bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20], maxZoom: 10 });
        }

        return () => {
          cluster.clearLayers();
          map.removeLayer(cluster);
        };
      }}
    />
  );
};

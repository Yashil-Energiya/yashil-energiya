"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import cn from "classnames";
import { useLocale, useTranslations } from "next-intl";
import {
  BatteryCharging,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Info,
  Plus,
  Ruler,
  Sun,
  Trash2,
  TriangleAlert,
  Wallet,
  Zap,
} from "lucide-react";
import { InfoTooltip } from "./InfoTooltip";
import { CalculatorLeadModal } from "./CalculatorLeadModal";
import { solarCalculatorConfig as config } from "data/solar-calculator-config";
import { calculate } from "lib/solar-calculator";
import type {
  ApplianceItem,
  InputMode,
  Segment,
} from "interface/solar-calculator.types";
import s from "./SolarCalculator.module.scss";
import { numberLocale } from "@/lib/number-locale";

const MonthlyChart = dynamic(
  () => import("./MonthlyChart").then((m) => m.MonthlyChart),
  { ssr: false },
);

const MONTH_KEYS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
] as const;

let rowSeq = 0;
const nextRowId = () => {
  rowSeq += 1;
  return `row-${rowSeq}`;
};

export const SolarCalculator = () => {
  const t = useTranslations("CalculatorPage");
  const locale = useLocale();

  const numberFmt = useMemo(
    () => new Intl.NumberFormat(numberLocale(locale), { maximumFractionDigits: 0 }),
    [locale],
  );
  const decimalFmt = useMemo(
    () => new Intl.NumberFormat(numberLocale(locale), { maximumFractionDigits: 1 }),
    [locale],
  );

  const [segment, setSegment] = useState<Segment>("residential");
  const [inputMode, setInputMode] = useState<InputMode>("consumption");
  const [monthlyConsumptionKwh, setMonthlyConsumptionKwh] = useState(300);
  const [appliances, setAppliances] = useState<ApplianceItem[]>([]);
  const [regionCode, setRegionCode] = useState(config.regions[0].code);
  const [coveragePercent, setCoveragePercent] = useState(100);
  const [solarHouseProgram, setSolarHouseProgram] = useState(true);
  const [includeBESS, setIncludeBESS] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  // Seed appliance rows on first switch to the "by appliances" mode.
  const seeded = useRef(false);
  const ensureSeeded = () => {
    if (seeded.current || appliances.length > 0) return;
    seeded.current = true;
    const defaults = config.appliancePresets
      .filter((p) => p.segment === segment)
      .slice(0, 3)
      .map<ApplianceItem>((p) => ({
        id: nextRowId(),
        nameKey: p.nameKey,
        powerW: p.powerW,
        hoursPerDay: p.defaultHoursPerDay,
        quantity: 1,
      }));
    setAppliances(defaults);
  };

  const presetOptions = config.appliancePresets.filter(
    (p) => p.segment === segment,
  );

  const result = useMemo(
    () =>
      calculate(
        {
          segment,
          inputMode,
          monthlyConsumptionKwh,
          appliances,
          regionCode,
          coveragePercent,
          solarHouseProgram,
          includeBESS,
        },
        config,
      ),
    [
      segment,
      inputMode,
      monthlyConsumptionKwh,
      appliances,
      regionCode,
      coveragePercent,
      solarHouseProgram,
      includeBESS,
    ],
  );

  const sum = (value: number) => `${numberFmt.format(Math.round(value))} ${t("units.sum")}`;
  const kwh = (value: number) => `${numberFmt.format(Math.round(value))} ${t("units.kwh")}`;

  const addPreset = (presetId: string) => {
    if (!presetId) return;
    const preset = config.appliancePresets.find((p) => p.id === presetId);
    if (!preset) return;
    setAppliances((prev) => [
      ...prev,
      {
        id: nextRowId(),
        nameKey: preset.nameKey,
        powerW: preset.powerW,
        hoursPerDay: preset.defaultHoursPerDay,
        quantity: 1,
      },
    ]);
  };

  const addCustom = () => {
    setAppliances((prev) => [
      ...prev,
      { id: nextRowId(), name: "", powerW: 0, hoursPerDay: 0, quantity: 1 },
    ]);
  };

  const updateRow = (id: string, patch: Partial<ApplianceItem>) => {
    setAppliances((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const removeRow = (id: string) => {
    setAppliances((prev) => prev.filter((row) => row.id !== id));
  };

  const applianceLabel = (row: ApplianceItem) =>
    row.nameKey ? t(`appliances.${row.nameKey}`) : row.name || "";

  const paybackText =
    Number.isFinite(result.paybackYears) && result.paybackYears > 0
      ? t("result.paybackYears", {
          years: decimalFmt.format(result.paybackYears),
        })
      : "—";

  const resetCalculator = () => {
    setSegment("residential");
    setInputMode("consumption");
    setMonthlyConsumptionKwh(300);
    setAppliances([]);
    seeded.current = false;
    setRegionCode(config.regions[0].code);
    setCoveragePercent(100);
    setSolarHouseProgram(true);
    setIncludeBESS(false);
    setShowBreakdown(false);
  };

  const totals = result.monthlyBreakdown.reduce(
    (acc, row) => ({
      billWithoutPV: acc.billWithoutPV + row.billWithoutPV,
      generationKwh: acc.generationKwh + row.generationKwh,
      surplusKwh: acc.surplusKwh + row.surplusKwh,
      savingsSum: acc.savingsSum + row.savingsSum,
    }),
    { billWithoutPV: 0, generationKwh: 0, surplusKwh: 0, savingsSum: 0 },
  );

  return (
    <div className={s.page}>
      <div className="container">
        <div className={s.intro}>
          <span className={s.eyebrow}>{t("eyebrow")}</span>
          <h1 className={s.pageTitle}>{t("title")}</h1>
          <p className={s.lead}>{t("lead")}</p>
        </div>

        <div className={s.layout}>
          {/* ── Inputs ─────────────────────────────────────────────── */}
          <div className={s.inputs}>
            {/* Step 1 — segment */}
            <section className={s.card}>
              <h2 className={s.cardTitle}>
                <span className={s.stepBadge}>1</span>
                {t("steps.segment")}
              </h2>
              <div className={s.segmented} role="tablist">
                {(["residential", "commercial"] as Segment[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={segment === value}
                    className={cn(s.segmentBtn, {
                      [s.segmentBtnActive]: segment === value,
                    })}
                    onClick={() => setSegment(value)}
                  >
                    {t(`segment.${value}`)}
                  </button>
                ))}
              </div>
            </section>

            {/* Step 2 — consumption */}
            <section className={s.card}>
              <h2 className={s.cardTitle}>
                <span className={s.stepBadge}>2</span>
                {t("steps.consumption")}
              </h2>
              <div className={s.segmented}>
                <button
                  type="button"
                  className={cn(s.segmentBtn, {
                    [s.segmentBtnActive]: inputMode === "consumption",
                  })}
                  onClick={() => setInputMode("consumption")}
                >
                  {t("mode.consumption")}
                </button>
                <button
                  type="button"
                  className={cn(s.segmentBtn, {
                    [s.segmentBtnActive]: inputMode === "appliances",
                  })}
                  onClick={() => {
                    setInputMode("appliances");
                    ensureSeeded();
                  }}
                >
                  {t("mode.appliances")}
                </button>
              </div>

              {inputMode === "consumption" ? (
                <label className={s.field}>
                  <span className={s.label}>{t("fields.monthlyConsumption")}</span>
                  <div className={s.inputWithUnit}>
                    <input
                      className={s.input}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={monthlyConsumptionKwh || ""}
                      onChange={(e) =>
                        setMonthlyConsumptionKwh(Number(e.target.value) || 0)
                      }
                    />
                    <span className={s.unit}>{t("units.kwhMonth")}</span>
                  </div>
                </label>
              ) : (
                <div className={s.appliances}>
                  <div className={cn(s.applianceRow, s.applianceHead)}>
                    <span>{t("appliancesTable.name")}</span>
                    <span>{t("appliancesTable.power")}</span>
                    <span>{t("appliancesTable.hours")}</span>
                    <span>{t("appliancesTable.qty")}</span>
                    <span aria-hidden="true" />
                  </div>
                  {appliances.map((row) => (
                    <div key={row.id} className={s.applianceRow}>
                      {row.nameKey ? (
                        <span className={s.applianceName}>
                          {applianceLabel(row)}
                        </span>
                      ) : (
                        <input
                          className={s.input}
                          type="text"
                          placeholder={t("appliancesTable.customName")}
                          value={row.name ?? ""}
                          onChange={(e) =>
                            updateRow(row.id, { name: e.target.value })
                          }
                        />
                      )}
                      <input
                        className={s.input}
                        type="number"
                        min={0}
                        aria-label={t("appliancesTable.power")}
                        value={row.powerW || ""}
                        onChange={(e) =>
                          updateRow(row.id, { powerW: Number(e.target.value) || 0 })
                        }
                      />
                      <input
                        className={s.input}
                        type="number"
                        min={0}
                        step={0.5}
                        aria-label={t("appliancesTable.hours")}
                        value={row.hoursPerDay || ""}
                        onChange={(e) =>
                          updateRow(row.id, {
                            hoursPerDay: Number(e.target.value) || 0,
                          })
                        }
                      />
                      <input
                        className={s.input}
                        type="number"
                        min={1}
                        aria-label={t("appliancesTable.qty")}
                        value={row.quantity || ""}
                        onChange={(e) =>
                          updateRow(row.id, {
                            quantity: Number(e.target.value) || 0,
                          })
                        }
                      />
                      <button
                        type="button"
                        className={s.iconBtn}
                        aria-label={t("appliancesTable.remove")}
                        onClick={() => removeRow(row.id)}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  ))}

                  <div className={s.applianceActions}>
                    <select
                      className={s.select}
                      value=""
                      onChange={(e) => {
                        addPreset(e.target.value);
                        e.target.value = "";
                      }}
                    >
                      <option value="">{t("appliancesTable.addPreset")}</option>
                      {presetOptions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {t(`appliances.${p.nameKey}`)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={s.ghostBtn}
                      onClick={addCustom}
                    >
                      <Plus size={16} aria-hidden="true" />
                      {t("appliancesTable.addCustom")}
                    </button>
                  </div>

                  <p className={s.helper}>
                    {t("fields.estimatedConsumption", {
                      value: kwh(result.monthlyConsumptionKwh),
                    })}
                  </p>
                </div>
              )}
            </section>

            {/* Step 3 — region */}
            <section className={s.card}>
              <h2 className={s.cardTitle}>
                <span className={s.stepBadge}>3</span>
                {t("steps.region")}
              </h2>
              <label className={s.field}>
                <span className={s.label}>{t("fields.region")}</span>
                <select
                  className={s.select}
                  value={regionCode}
                  onChange={(e) => setRegionCode(e.target.value)}
                >
                  {config.regions.map((r) => (
                    <option key={r.code} value={r.code}>
                      {t(`regions.${r.nameKey}`)}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            {/* Step 4 — station parameters */}
            <section className={s.card}>
              <h2 className={s.cardTitle}>
                <span className={s.stepBadge}>4</span>
                {t("steps.parameters")}
              </h2>

              <label className={s.field}>
                <span className={s.label}>
                  {t("fields.coverage")}
                  <strong className={s.coverageValue}>{coveragePercent}%</strong>
                </span>
                <input
                  className={s.slider}
                  type="range"
                  min={50}
                  max={150}
                  step={5}
                  value={coveragePercent}
                  onChange={(e) => setCoveragePercent(Number(e.target.value))}
                />
              </label>

              {segment === "residential" && (
                <div className={s.checkboxRow}>
                  <label className={s.checkbox}>
                    <input
                      type="checkbox"
                      checked={solarHouseProgram}
                      onChange={(e) => setSolarHouseProgram(e.target.checked)}
                    />
                    <span>{t("fields.solarHouseProgram")}</span>
                  </label>
                  <InfoTooltip label={t("fields.solarHouseProgram")}>
                    <span className={s.tipTitle}>
                      {t("fields.solarHouseInfoTitle")}
                    </span>
                    <span>{t("fields.solarHouseInfo")}</span>
                    <a
                      className={s.tipLink}
                      href={config.references.solarHouseProgram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("fields.moreInfo")}
                    </a>
                  </InfoTooltip>
                </div>
              )}

              <label className={s.checkbox}>
                <input
                  type="checkbox"
                  checked={includeBESS}
                  onChange={(e) => setIncludeBESS(e.target.checked)}
                />
                <span>{t("fields.includeBESS")}</span>
              </label>
            </section>
          </div>

          {/* ── Results ────────────────────────────────────────────── */}
          <div className={s.results}>
            <div className={s.resultSticky}>
              <div className={s.resultHead}>
                <span className={s.eyebrow}>{t("result.eyebrow")}</span>
                <div className={s.powerValue}>
                  <Sun size={28} aria-hidden="true" />
                  <strong>{decimalFmt.format(result.actualKwp)}</strong>
                  <span>{t("units.kw")}</span>
                </div>
                <p className={s.coverageNote}>
                  {t("result.coverageNote", {
                    percent: numberFmt.format(
                      Math.round(result.coverageActualPercent),
                    ),
                  })}
                </p>
              </div>

              <div className={s.specGrid}>
                <div className={s.spec}>
                  <Zap size={18} aria-hidden="true" />
                  <b>{numberFmt.format(result.panelCount)}</b>
                  <span>
                    {t("result.panels", { watt: config.panelWp })}
                  </span>
                </div>
                <div className={s.spec}>
                  <Ruler size={18} aria-hidden="true" />
                  <b>
                    {numberFmt.format(Math.round(result.arrayAreaM2))}{" "}
                    {t("units.m2")}
                  </b>
                  <span>{t("result.area")}</span>
                </div>
                <div className={s.spec}>
                  <BatteryCharging size={18} aria-hidden="true" />
                  <b>
                    {decimalFmt.format(result.inverterKw)} {t("units.kw")}
                  </b>
                  <span>
                    {result.isThreePhase
                      ? t("result.inverterThreePhase")
                      : t("result.inverterSinglePhase")}
                  </span>
                </div>
                <div className={s.spec}>
                  <Sun size={18} aria-hidden="true" />
                  <b>{kwh(result.annualGenerationKwh)}</b>
                  <span>{t("result.annualGeneration")}</span>
                </div>
              </div>

              <div className={s.chartBlock}>
                <h3 className={s.blockTitle}>{t("result.chartTitle")}</h3>
                <MonthlyChart
                  generation={result.monthlyGeneration}
                  consumption={result.monthlyConsumption}
                  unit={t("units.kwh")}
                />
              </div>

              <div className={s.moneyGrid}>
                <button
                  type="button"
                  className={cn(s.money, s.moneyAccent, s.moneyAccentBtn)}
                  aria-expanded={showBreakdown}
                  onClick={() => setShowBreakdown((v) => !v)}
                >
                  <Wallet size={18} aria-hidden="true" />
                  <span>{t("result.monthlySavings")}</span>
                  <b>{sum(result.monthlySavingsSum)}</b>
                  <span className={s.accentHint}>
                    {t("result.breakdownHint")}
                    {showBreakdown ? (
                      <ChevronUp size={16} aria-hidden="true" />
                    ) : (
                      <ChevronDown size={16} aria-hidden="true" />
                    )}
                  </span>
                </button>
                <div className={s.money}>
                  <span>{t("result.annualSavings")}</span>
                  <b>{sum(result.annualSavingsSum)}</b>
                </div>
                <div className={s.money}>
                  <span>{t("result.systemCost")}</span>
                  <b>{sum(result.systemCostSum)}</b>
                </div>
                <div className={s.money}>
                  <span>{t("result.payback")}</span>
                  <b>{paybackText}</b>
                </div>
              </div>

              <div className={s.breakdown}>
                {showBreakdown && (
                  <div className={s.tableScroll}>
                    <table className={s.table}>
                      <thead>
                        <tr>
                          <th>{t("breakdown.month")}</th>
                          <th>{t("breakdown.billWithoutPV")}</th>
                          <th>{t("breakdown.generation")}</th>
                          <th>{t("breakdown.export")}</th>
                          <th>{t("breakdown.savings")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.monthlyBreakdown.map((row, i) => (
                          <tr key={MONTH_KEYS[i]}>
                            <td>{t(`months.${MONTH_KEYS[i]}`)}</td>
                            <td>{numberFmt.format(Math.round(row.billWithoutPV))}</td>
                            <td>{numberFmt.format(Math.round(row.generationKwh))}</td>
                            <td>{numberFmt.format(Math.round(row.surplusKwh))}</td>
                            <td>{numberFmt.format(Math.round(row.savingsSum))}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td>{t("breakdown.total")}</td>
                          <td>{numberFmt.format(Math.round(totals.billWithoutPV))}</td>
                          <td>{numberFmt.format(Math.round(totals.generationKwh))}</td>
                          <td>{numberFmt.format(Math.round(totals.surplusKwh))}</td>
                          <td>{numberFmt.format(Math.round(totals.savingsSum))}</td>
                        </tr>
                      </tfoot>
                    </table>
                    <p className={s.tableUnits}>{t("breakdown.unitsNote")}</p>
                  </div>
                )}
              </div>

              {result.warnings.length > 0 && (
                <ul className={s.warnings}>
                  {result.warnings.map((code) => (
                    <li key={code} className={s.warning}>
                      <TriangleAlert size={16} aria-hidden="true" />
                      <span>{t(`warnings.${code}`)}</span>
                    </li>
                  ))}
                </ul>
              )}

              <p className={s.disclaimer}>
                <Info size={16} aria-hidden="true" />
                <span>{t("disclaimer")}</span>
              </p>

              <button
                type="button"
                className={s.cta}
                onClick={() => setModalOpen(true)}
              >
                <span>{t("result.cta")}</span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <CalculatorLeadModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        onReset={resetCalculator}
        summary={{
          segmentLabel: t(`segment.${segment}`),
          annualConsumptionKwh: Math.round(result.monthlyConsumptionKwh * 12),
          regionLabel: t(
            `regions.${
              config.regions.find((r) => r.code === regionCode)?.nameKey ??
              config.regions[0].nameKey
            }`,
          ),
          coveragePercent,
          includeBESS,
          recommendedKwp: result.actualKwp,
          regionCode,
          segment,
        }}
      />
    </div>
  );
};

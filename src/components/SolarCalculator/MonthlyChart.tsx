"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { numberLocale } from "@/lib/number-locale";

type MonthlyChartProps = {
  generation: number[];
  consumption: number[];
  unit: string;
};

const makeTooltip = (unit: string, formatter: Intl.NumberFormat) => {
  const CustomTooltip = ({ active, payload, label }: TooltipContentProps<ValueType, NameType>) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div
        style={{
          background: "#ffffff",
          padding: "10px 14px",
          borderRadius: 8,
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
          fontSize: 13,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
        {payload.map((item) => (
          <div key={item.name} style={{ color: item.color }}>
            {item.name}: {formatter.format(Number(item.value))} {unit}
          </div>
        ))}
      </div>
    );
  };
  CustomTooltip.displayName = "MonthlyChartTooltip";
  return CustomTooltip;
};

export const MonthlyChart = ({
  generation,
  consumption,
  unit,
}: MonthlyChartProps) => {
  const locale = useLocale();
  const t = useTranslations("CalculatorPage");
  const formatter = new Intl.NumberFormat(numberLocale(locale), {
    maximumFractionDigits: 0,
  });

  const monthKeys = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ] as const;

  const generationLabel = t("result.generation");
  const consumptionLabel = t("result.consumption");

  const data = monthKeys.map((key, i) => ({
    month: t(`months.${key}`),
    [generationLabel]: Math.round(generation[i] ?? 0),
    [consumptionLabel]: Math.round(consumption[i] ?? 0),
  }));

  return (
    <div style={{ width: "100%", height: 320, minHeight: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 6" stroke="#e6ede8" vertical={false} />
          <XAxis dataKey="month" tickMargin={6} fontSize={12} />
          <YAxis
            tickFormatter={(value) => formatter.format(Number(value))}
            fontSize={12}
            width={48}
          />
          <Tooltip
            cursor={{ fill: "rgba(18, 144, 62, 0.06)" }}
            content={makeTooltip(unit, formatter)}
          />
          <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
          <Bar
            dataKey={generationLabel}
            fill="#12903e"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
          <Bar
            dataKey={consumptionLabel}
            fill="#e9ad32"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

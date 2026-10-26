"use client";

import { useLocale } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  type TooltipContentProps,
} from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { numberLocale } from "@/lib/number-locale";

type Datum = {
  year: string;
  power: number;
  color: string;
};

type TheChartProps = {
  currentPower: number;
  label: string;
  unit: string;
  yearLabel: string;
};

const historicalData: Datum[] = [
  { year: "2023", power: 25418, color: "#5cb63f" },
  { year: "2024", power: 48066, color: "#5cb63f" },
];

const makeCustomTooltip = (
  labelText: string,
  unit: string,
  numberFormatter: Intl.NumberFormat,
) => {
  const CustomTooltip = ({ active, payload, label }: TooltipContentProps<ValueType, NameType>) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div
        style={{
          background: "#ffffff",
          padding: "10px 14px",
          borderRadius: 8,
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
          fontSize: 14,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div style={{ color: "#5cb63f" }}>
          {labelText}: {numberFormatter.format(Number(payload[0].value))} {unit}
        </div>
      </div>
    );
  };

  CustomTooltip.displayName = "CustomTooltip";
  return CustomTooltip;
};

export const TheChart = ({
  currentPower,
  label,
  unit,
  yearLabel,
}: TheChartProps) => {
  const locale = useLocale();
  const numberFormatter = new Intl.NumberFormat(numberLocale(locale), {
    maximumFractionDigits: 2,
  });
  const data: Datum[] = [
    ...historicalData,
    { year: "2025", power: currentPower, color: "#5cb63f" },
  ];

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          minWidth: 0,
          height: 340,
          minHeight: 340,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 30, right: 40, left: 60, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 6" stroke="#e0e0e0" />
            <XAxis
              dataKey="year"
              tickMargin={6}
              label={{ value: yearLabel, position: "insideBottom", offset: -20 }}
            />
            <YAxis
              tickFormatter={(value) => numberFormatter.format(Number(value))}
              label={{
                value: `${label} (${unit})`,
                angle: -90,
                position: "insideLeft",
                offset: -20,
              }}
            />
            <Tooltip content={makeCustomTooltip(label, unit, numberFormatter)} />
            <Bar dataKey="power" radius={[6, 6, 0, 0]} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell key={entry.year} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

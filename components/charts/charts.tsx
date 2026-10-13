"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { useTheme } from "@/components/layout/theme-provider";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
);

interface ChartColors {
  fg: string;
  muted: string;
  subtle: string;
  line: string;
  surface: string;
  bg: string;
  ok: string;
  warn: string;
  danger: string;
  info: string;
}

export function useChartColors(): ChartColors {
  useTheme();
  if (typeof window === "undefined") {
    return {
      fg: "#fafafa",
      muted: "#a1a1aa",
      subtle: "#71717a",
      line: "#26262a",
      surface: "#111113",
      bg: "#0a0a0a",
      ok: "#4ade80",
      warn: "#fbbf24",
      danger: "#f87171",
      info: "#60a5fa",
    };
  }
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) =>
    cs.getPropertyValue(name).trim() || fallback;
  return {
    fg: v("--fg", "#fafafa"),
    muted: v("--fg-muted", "#a1a1aa"),
    subtle: v("--fg-subtle", "#71717a"),
    line: v("--line", "#26262a"),
    surface: v("--surface", "#111113"),
    bg: v("--bg", "#0a0a0a"),
    ok: v("--ok", "#4ade80"),
    warn: v("--warn", "#fbbf24"),
    danger: v("--danger", "#f87171"),
    info: v("--info", "#60a5fa"),
  };
}

function baseOptions(c: ChartColors) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: c.muted,
          boxWidth: 8,
          boxHeight: 8,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: c.fg,
        titleColor: c.bg,
        bodyColor: c.bg,
        cornerRadius: 0,
        padding: 8,
        displayColors: false,
        titleFont: { size: 11, weight: 500 as const },
        bodyFont: { size: 11 },
      },
    },
  };
}

export interface TrendDataset {
  label: string;
  data: number[];
}

export function TrendLine({
  labels,
  datasets,
  height = 260,
}: {
  labels: string[];
  datasets: TrendDataset[];
  height?: number;
}) {
  const c = useChartColors();

  const data = {
    labels,
    datasets: datasets.map((d, i) => ({
      label: d.label,
      data: d.data,
      borderColor: i === 0 ? c.fg : c.subtle,
      backgroundColor: "transparent",
      borderWidth: 1.5,
      tension: 0.35,
      pointRadius: 2.5,
      pointHoverRadius: 4,
      pointBackgroundColor: i === 0 ? c.fg : c.subtle,
      pointBorderColor: "transparent",
    })),
  };

  const options = {
    ...baseOptions(c),
    interaction: { mode: "index" as const, intersect: false },
    scales: {
      x: {
        ticks: { color: c.subtle, font: { size: 11 } },
        grid: { display: false },
        border: { color: c.line },
      },
      y: {
        beginAtZero: true,
        ticks: { color: c.subtle, font: { size: 11 }, precision: 0 },
        grid: { color: c.line },
        border: { display: false },
      },
    },
  };

  return (
    <div style={{ height }} className="relative w-full">
      <Line data={data} options={options} />
    </div>
  );
}

export function BreakdownBar({
  labels,
  values,
  height = 260,
  horizontal = false,
  color = "fg",
}: {
  labels: string[];
  values: number[];
  height?: number;
  horizontal?: boolean;
  color?: "fg" | "ok" | "warn" | "danger";
}) {
  const c = useChartColors();
  const barColor = c[color];

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: barColor,
        hoverBackgroundColor: barColor,
        borderWidth: 0,
        maxBarThickness: horizontal ? 18 : 40,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    ...baseOptions(c),
    plugins: {
      ...baseOptions(c).plugins,
      legend: { display: false },
    },
    scales: horizontal
      ? {
          x: {
            beginAtZero: true,
            ticks: { color: c.subtle, font: { size: 11 }, precision: 0 },
            grid: { color: c.line },
            border: { display: false },
          },
          y: {
            ticks: { color: c.muted, font: { size: 11 } },
            grid: { display: false },
            border: { color: c.line },
          },
        }
      : {
          x: {
            ticks: { color: c.subtle, font: { size: 11 }, maxRotation: 45 },
            grid: { display: false },
            border: { color: c.line },
          },
          y: {
            beginAtZero: true,
            ticks: { color: c.subtle, font: { size: 11 }, precision: 0 },
            grid: { color: c.line },
            border: { display: false },
          },
        },
  };

  return (
    <div style={{ height }} className="relative w-full">
      <Bar data={data} options={options} />
    </div>
  );
}

export function BreakdownDoughnut({
  labels,
  values,
  colors,
  variant = "default",
  height = 240,
}: {
  labels: string[];
  values: number[];
  colors?: string[];
  variant?: "default" | "urgency";
  height?: number;
}) {
  const c = useChartColors();
  const palette =
    colors ??
    (variant === "urgency"
      ? [c.danger, c.warn, c.muted, c.subtle, c.info]
      : [c.fg, c.muted, c.subtle, c.line, c.info]);

  const data = {
    labels: labels.map((l, i) => `${l} (${values[i] ?? 0})`),
    datasets: [
      {
        data: values,
        backgroundColor: palette,
        borderColor: c.surface,
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    ...baseOptions(c),
    cutout: "68%",
    plugins: {
      ...baseOptions(c).plugins,
      legend: {
        position: "bottom" as const,
        labels: {
          color: c.muted,
          boxWidth: 8,
          boxHeight: 8,
          font: { size: 11 },
          padding: 12,
        },
      },
    },
  };

  return (
    <div style={{ height }} className="relative w-full">
      <Doughnut data={data} options={options} />
    </div>
  );
}

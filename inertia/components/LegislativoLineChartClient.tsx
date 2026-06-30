import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useCssHsl } from "~/hooks/use_css_hsl";

/** Subconjunto tipado localmente — evita resolver o pacote apexcharts no bundle SSR. */
type ChartOptions = Record<string, unknown>;

export interface WeeklyPoint {
  label: string;
  count: number;
}

interface Props {
  weekly: WeeklyPoint[];
}

/**
 * Gráfico de linha com zoom por scroll (ApexCharts) — só no browser (SSR-safe).
 */
export function LegislativoLineChartClient({ weekly }: Props) {
  const theme = useCssHsl();
  const [Chart, setChart] = useState<ComponentType<{
    options: ApexOptions;
    series: { name: string; data: number[] }[];
    type: string;
    height: number;
    width?: string | number;
  }> | null>(null);

  useEffect(() => {
    import("react-apexcharts").then((mod) => setChart(() => mod.default));
  }, []);

  const categories = useMemo(() => weekly.map((w) => w.label), [weekly]);
  const series = useMemo(
    () => [{ name: "Matérias", data: weekly.map((w) => w.count) }],
    [weekly]
  );

  const options = useMemo<ChartOptions>(
    () => ({
      chart: {
        id: "legislativo-weekly",
        type: "area",
        height: 280,
        fontFamily: "inherit",
        background: "transparent",
        toolbar: {
          show: true,
          tools: {
            download: false,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
          autoSelected: "zoom",
        },
        zoom: {
          enabled: true,
          type: "x",
          autoScaleYaxis: true,
          allowMouseWheelZoom: true,
        },
        animations: { enabled: true, speed: 400 },
      },
      colors: [theme.navy],
      stroke: { curve: "smooth", width: 3 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0.4,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 90, 100],
          colorStops: [
            { offset: 0, color: theme.navy, opacity: 0.35 },
            { offset: 100, color: theme.navy, opacity: 0.02 },
          ],
        },
      },
      markers: {
        size: 4,
        strokeWidth: 2,
        strokeColors: theme.card,
        // NÃO usar theme.gold aqui: o gold do tema é branco (#fff), some no fundo
        // branco do card. theme.navy (cor da linha) + anel branco = marcador visível.
        colors: [theme.navy],
        hover: { size: 7, sizeOffset: 2 },
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor: theme.border,
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { left: 8, right: 8 },
      },
      xaxis: {
        categories,
        tickAmount: Math.min(12, categories.length),
        labels: {
          rotate: -45,
          rotateAlways: categories.length > 8,
          hideOverlappingLabels: true,
          style: { colors: theme.muted, fontSize: "11px", fontWeight: 500 },
        },
        axisBorder: { show: true, color: theme.border },
        axisTicks: { show: true, color: theme.border },
        crosshairs: {
          stroke: { color: theme.navy, width: 1, dashArray: 4 },
        },
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: {
          style: { colors: theme.muted, fontSize: "11px" },
          formatter: (v) => (Number.isInteger(v) ? String(v) : ""),
        },
      },
      tooltip: {
        theme: theme.isDark ? "dark" : "light",
        x: { show: true },
        y: {
          formatter: (v) => `${v ?? 0} matéria${v === 1 ? "" : "s"}`,
          title: { formatter: () => "" },
        },
        marker: { show: true },
      },
      legend: { show: false },
    }),
    [categories, theme]
  );

  if (!Chart) {
    return (
      <div
        className="h-[280px] rounded-xl bg-muted/30 animate-pulse border border-border/40"
        aria-hidden
      />
    );
  }

  return (
    <div className="legislativo-line-chart [&_.apexcharts-toolbar]:!top-0 [&_.apexcharts-toolbar]:!right-0">
      <Chart options={options} series={series} type="area" height={280} width="100%" />
    </div>
  );
}

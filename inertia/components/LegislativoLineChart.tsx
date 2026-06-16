import { useEffect, useState } from "react";
import type { WeeklyPoint } from "~/components/LegislativoLineChartClient";

interface Props {
  weekly: WeeklyPoint[];
}

/** Wrapper SSR-safe — carrega ApexCharts só no browser. */
export function LegislativoLineChart({ weekly }: Props) {
  const [Client, setClient] = useState<
    typeof import("~/components/LegislativoLineChartClient").LegislativoLineChartClient | null
  >(null);

  useEffect(() => {
    import("~/components/LegislativoLineChartClient").then((m) =>
      setClient(() => m.LegislativoLineChartClient)
    );
  }, []);

  if (!Client) {
    return (
      <div
        className="h-[280px] rounded-xl bg-muted/30 animate-pulse border border-border/40"
        role="status"
        aria-label="Carregando gráfico"
      />
    );
  }

  return <Client weekly={weekly} />;
}

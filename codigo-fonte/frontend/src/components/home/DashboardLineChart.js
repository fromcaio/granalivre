// Client component for rendering the dashboard line chart.
"use client";

import { LineChart } from "@mui/x-charts";

export default function DashboardLineChart({ labels, totals, spent }) {
  return (
    <LineChart
      height={280}
      xAxis={[
        {
          data: labels,
          scaleType: "point",
        },
      ]}
      series={[
        { data: totals, label: "Total", color: "#059669" },
        { data: spent, label: "Gastos", color: "#f59e0b" },
      ]}
      slotProps={{
        legend: { position: { vertical: "top", horizontal: "right" } },
      }}
      margin={{ top: 40, right: 20, bottom: 40, left: 40 }}
    />
  );
}

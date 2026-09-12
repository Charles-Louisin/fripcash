"use client";

import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { orderStatusChartData } from "@/lib/admin-chart-mock";

const chartConfig = {
  count: { label: "Commandes" },
  livree: { label: "Livrée", color: "var(--chart-1)" },
  en_cours: { label: "En cours", color: "var(--chart-2)" },
  en_attente: { label: "En attente", color: "var(--chart-3)" },
  annulee: { label: "Annulée", color: "var(--chart-4)" },
} satisfies ChartConfig;

export function ChartPieLegend() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Statuts des commandes</CardTitle>
        <CardDescription>Répartition globale</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <PieChart>
            <Pie data={[...orderStatusChartData]} dataKey="count" nameKey="status" />
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/2 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

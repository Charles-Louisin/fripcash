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

const chartConfig = {
  count: { label: "Commandes" },
} satisfies ChartConfig;

type Point = { status: string; count: number; fill?: string };

type Props = { data?: Point[] };

export function ChartPieLegend({ data = [] }: Props) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Statuts des commandes</CardTitle>
        <CardDescription>Répartition globale</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {data.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            Aucune commande
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[280px]"
          >
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="status" />
              <ChartLegend
                content={<ChartLegendContent nameKey="status" />}
                className="-translate-y-2 flex-wrap gap-2 *:basis-1/2 *:justify-center"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

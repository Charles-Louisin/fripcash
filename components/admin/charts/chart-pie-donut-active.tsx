"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart, Sector } from "recharts";
import type { PieSectorShapeProps } from "recharts/types/polar/Pie";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { zoneChartData } from "@/lib/admin-chart-mock";

const chartConfig = {
  commandes: { label: "Commandes" },
  zone_1: { label: "Zone 1", color: "var(--chart-1)" },
  zone_2: { label: "Zone 2", color: "var(--chart-2)" },
  autre: { label: "Autre zone", color: "var(--chart-3)" },
} satisfies ChartConfig;

const ACTIVE_INDEX = 0;

export function ChartPieDonutActive() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Commandes par zone</CardTitle>
        <CardDescription>Volume des 30 derniers jours</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={[...zoneChartData]}
              dataKey="commandes"
              nameKey="zone"
              innerRadius={60}
              strokeWidth={5}
              shape={({
                index,
                outerRadius = 0,
                ...props
              }: PieSectorShapeProps) =>
                index === ACTIVE_INDEX ? (
                  <Sector {...props} outerRadius={outerRadius + 10} />
                ) : (
                  <Sector {...props} outerRadius={outerRadius} />
                )
              }
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Zone 1 en hausse <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Zone la plus active : Conakry centre
        </div>
      </CardFooter>
    </Card>
  );
}

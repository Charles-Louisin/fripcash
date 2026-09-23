"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAdminDateRange } from "@/stores/admin-date-filter-store";

const chartConfig = {
  inscriptions: { label: "Inscriptions" },
  acheteurs: { label: "Acheteurs", color: "var(--chart-1)" },
  vendeurs: { label: "Vendeurs", color: "var(--chart-2)" },
} satisfies ChartConfig;

type MetricKey = "acheteurs" | "vendeurs";

type Point = { date: string; acheteurs: number; vendeurs: number };

type Props = {
  data?: Point[];
};

export function ChartBarInteractive({ data = [] }: Props) {
  const [activeChart, setActiveChart] = React.useState<MetricKey>("acheteurs");
  const range = useAdminDateRange();

  const total = React.useMemo(
    () => ({
      acheteurs: data.reduce((acc, curr) => acc + curr.acheteurs, 0),
      vendeurs: data.reduce((acc, curr) => acc + curr.vendeurs, 0),
    }),
    [data]
  );

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">
          <CardTitle>Inscriptions par jour</CardTitle>
          <CardDescription>
            Nouveaux acheteurs et vendeurs — {range.label}
          </CardDescription>
        </div>
        <div className="flex">
          {(["acheteurs", "vendeurs"] as const).map((key) => (
            <button
              key={key}
              type="button"
              data-active={activeChart === key}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              onClick={() => setActiveChart(key)}
            >
              <span className="text-xs text-muted-foreground">
                {chartConfig[key].label}
              </span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {total[key].toLocaleString("fr-FR")}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {data.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Aucune inscription pour cette période
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("fr-FR", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="inscriptions"
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("fr-FR", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }
                  />
                }
              />
              <Bar
                dataKey={activeChart}
                fill={`var(--color-${activeChart})`}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

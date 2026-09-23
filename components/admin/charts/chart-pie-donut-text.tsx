"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
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

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export type CategorySlice = { category: string; volume: number };

type Props = {
  title?: string;
  description?: string;
  data?: CategorySlice[];
};

export function ChartPieDonutText({
  title = "Catalogue par catégorie",
  description = "Répartition des annonces",
  data = [],
}: Props) {
  const chartData = React.useMemo(
    () =>
      data.map((row, i) => ({
        ...row,
        fill: COLORS[i % COLORS.length],
      })),
    [data]
  );

  const total = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.volume, 0),
    [chartData]
  );

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = { volume: { label: "Articles" } };
    chartData.forEach((row, i) => {
      config[row.category] = {
        label: row.category,
        color: COLORS[i % COLORS.length],
      };
    });
    return config;
  }, [chartData]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Aucune annonce à afficher
          </div>
        ) : (
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
                data={chartData}
                dataKey="volume"
                nameKey="category"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {total.toLocaleString("fr-FR")}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground text-sm"
                          >
                            Articles
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Données catalogue live
        </div>
      </CardFooter>
    </Card>
  );
}

"use client";

import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
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
import { formatGnf } from "@/lib/admin-platform";

const chartConfig = {
  livraison: { label: "Livraison", color: "var(--chart-1)" },
  retrait: { label: "Retrait", color: "var(--chart-2)" },
} satisfies ChartConfig;

type Props = {
  livraison?: number;
  retrait?: number;
  web?: number;
  mobile?: number;
};

export function ChartRadialStacked({
  livraison,
  retrait,
  web = 0,
  mobile = 0,
}: Props) {
  const gmvLivraison = livraison ?? web;
  const gmvRetrait = retrait ?? mobile;
  const totalGmv = gmvLivraison + gmvRetrait;
  const hasData = totalGmv > 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>GMV du mois</CardTitle>
        <CardDescription>Livraison FripCash vs retrait / local</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        {!hasData ? (
          <div className="flex h-[250px] w-full items-center justify-center text-sm text-muted-foreground">
            Aucune donnée GMV
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[250px]"
          >
            <RadialBarChart
              data={[{ livraison: gmvLivraison, retrait: gmvRetrait }]}
              endAngle={180}
              innerRadius={80}
              outerRadius={110}
            >
              <RadialBar
                dataKey="retrait"
                fill="var(--color-retrait)"
                stackId="a"
                cornerRadius={5}
                className="stroke-transparent stroke-2"
              />
              <RadialBar
                dataKey="livraison"
                stackId="a"
                cornerRadius={5}
                fill="var(--color-livraison)"
                className="stroke-transparent stroke-2"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 16}
                            className="fill-foreground text-lg font-bold"
                          >
                            {formatGnf(totalGmv)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 4}
                            className="fill-muted-foreground text-xs"
                          >
                            GMV total
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          {hasData
            ? `Livraison ${formatGnf(gmvLivraison)} · Retrait ${formatGnf(gmvRetrait)}`
            : "Aucune commande ce mois-ci"}
        </div>
      </CardFooter>
    </Card>
  );
}

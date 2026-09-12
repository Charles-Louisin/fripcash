"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  type ChartConfig,
} from "@/components/ui/chart";
import { productGmvChartData } from "@/lib/admin-chart-mock";
import { formatGnf } from "@/lib/admin-platform";

const chartConfig = {
  gmv: { label: "GMV (GNF)", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ChartProductsGmv() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top produits (GMV)</CardTitle>
        <CardDescription>Chiffre d&apos;affaires par article</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
          <BarChart data={[...productGmvChartData]} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              width={90}
              tick={{ fontSize: 12 }}
            />
            <XAxis type="number" hide />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as { name: string };
                return (
                  <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                    <p className="font-medium">{row.name}</p>
                    <p className="text-muted-foreground">
                      {formatGnf(Number(payload[0].value ?? 0))}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="gmv" fill="var(--color-gmv)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

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

const chartConfig = {
  gmv: { label: "Volume", color: "var(--chart-1)" },
} satisfies ChartConfig;

type Point = { name: string; gmv: number };

type Props = {
  data?: Point[];
  title?: string;
  description?: string;
  valueLabel?: string;
};

export function ChartProductsGmv({
  data = [],
  title = "Top produits",
  description = "Volume",
  valueLabel = "Volume",
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            Aucune donnée
          </div>
        ) : (
          <ChartContainer
            config={{
              ...chartConfig,
              gmv: { ...chartConfig.gmv, label: valueLabel },
            }}
            className="aspect-auto h-[280px] w-full"
          >
            <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
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
              <ChartTooltip />
              <Bar dataKey="gmv" fill="var(--color-gmv)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

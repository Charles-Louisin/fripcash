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
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { courierPerfChartData } from "@/lib/admin-chart-mock";

const chartConfig = {
  deliveries: { label: "Livraisons", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ChartCourierPerf() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance livreurs</CardTitle>
        <CardDescription>Livraisons complétées ce mois</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
          <BarChart data={[...courierPerfChartData]}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="deliveries" fill="var(--color-deliveries)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

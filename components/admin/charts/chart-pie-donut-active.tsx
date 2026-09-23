"use client";

import { Pie, PieChart } from "recharts";
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

const chartConfig = {
  commandes: { label: "Commandes" },
} satisfies ChartConfig;

type Point = { zone: string; commandes: number; fill?: string };

type Props = { data?: Point[] };

export function ChartPieDonutActive({ data = [] }: Props) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Commandes par zone</CardTitle>
        <CardDescription>Volume des 30 derniers jours</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {data.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Aucune commande par zone
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
                data={data}
                dataKey="commandes"
                nameKey="zone"
                innerRadius={60}
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Données commandes live uniquement
        </div>
      </CardFooter>
    </Card>
  );
}

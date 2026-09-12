"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useAdminChartData } from "@/hooks/use-admin"
import { filterTransactionChartByRange } from "@/lib/admin-chart-mock"
import { filterByDateRange } from "@/lib/admin-date-filter"
import { useAdminDateRange } from "@/stores/admin-date-filter-store"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  transactions: {
    label: "Transactions",
  },
  revenus: {
    label: "Revenus (GNF)",
    color: "var(--chart-1)",
  },
  commissions: {
    label: "Commissions (GNF)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const range = useAdminDateRange()
  const { data: apiData, isLoading } = useAdminChartData(range.days)

  const chartData = React.useMemo(() => {
    const source =
      apiData && apiData.length > 0
        ? apiData
        : filterTransactionChartByRange(range.from, range.to)
    return filterByDateRange(source, (item) => item.date, range.from, range.to)
  }, [apiData, range.from, range.to])

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Transactions & Commissions</CardTitle>
          <CardDescription>
            Aperçu pour la période : {range.label}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
            Aucune transaction pour cette période
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillRevenus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenus)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-revenus)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillCommissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-commissions)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-commissions)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("fr-FR", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("fr-FR", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="commissions"
                type="natural"
                fill="url(#fillCommissions)"
                stroke="var(--color-commissions)"
                stackId="a"
              />
              <Area
                dataKey="revenus"
                type="natural"
                fill="url(#fillRevenus)"
                stroke="var(--color-revenus)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

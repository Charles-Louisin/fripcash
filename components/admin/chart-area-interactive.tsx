"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const chartData = [
  { date: "2024-04-01", revenus: 222000, commissions: 15000 },
  { date: "2024-04-02", revenus: 97000, commissions: 18000 },
  { date: "2024-04-03", revenus: 167000, commissions: 12000 },
  { date: "2024-04-04", revenus: 242000, commissions: 26000 },
  { date: "2024-04-05", revenus: 373000, commissions: 29000 },
  { date: "2024-04-06", revenus: 301000, commissions: 34000 },
  { date: "2024-04-07", revenus: 245000, commissions: 18000 },
  { date: "2024-04-08", revenus: 409000, commissions: 32000 },
  { date: "2024-04-09", revenus: 59000, commissions: 11000 },
  { date: "2024-04-10", revenus: 261000, commissions: 19000 },
  { date: "2024-04-11", revenus: 327000, commissions: 35000 },
  { date: "2024-04-12", revenus: 292000, commissions: 21000 },
  { date: "2024-04-13", revenus: 342000, commissions: 38000 },
  { date: "2024-04-14", revenus: 137000, commissions: 22000 },
  { date: "2024-04-15", revenus: 120000, commissions: 17000 },
  { date: "2024-04-16", revenus: 138000, commissions: 19000 },
  { date: "2024-04-17", revenus: 446000, commissions: 36000 },
  { date: "2024-04-18", revenus: 364000, commissions: 41000 },
  { date: "2024-04-19", revenus: 243000, commissions: 18000 },
  { date: "2024-04-20", revenus: 89000, commissions: 15000 },
  { date: "2024-04-21", revenus: 137000, commissions: 20000 },
  { date: "2024-04-22", revenus: 224000, commissions: 17000 },
  { date: "2024-04-23", revenus: 138000, commissions: 23000 },
  { date: "2024-04-24", revenus: 387000, commissions: 29000 },
  { date: "2024-04-25", revenus: 215000, commissions: 25000 },
  { date: "2024-04-26", revenus: 75000, commissions: 13000 },
  { date: "2024-04-27", revenus: 383000, commissions: 42000 },
  { date: "2024-04-28", revenus: 122000, commissions: 18000 },
  { date: "2024-04-29", revenus: 315000, commissions: 24000 },
  { date: "2024-04-30", revenus: 454000, commissions: 38000 },
  { date: "2024-05-01", revenus: 165000, commissions: 22000 },
  { date: "2024-05-02", revenus: 293000, commissions: 31000 },
  { date: "2024-05-03", revenus: 247000, commissions: 19000 },
  { date: "2024-05-04", revenus: 385000, commissions: 42000 },
  { date: "2024-05-05", revenus: 481000, commissions: 39000 },
  { date: "2024-05-06", revenus: 498000, commissions: 52000 },
  { date: "2024-05-07", revenus: 388000, commissions: 30000 },
  { date: "2024-05-08", revenus: 149000, commissions: 21000 },
  { date: "2024-05-09", revenus: 227000, commissions: 18000 },
  { date: "2024-05-10", revenus: 293000, commissions: 33000 },
  { date: "2024-05-11", revenus: 335000, commissions: 27000 },
  { date: "2024-05-12", revenus: 197000, commissions: 24000 },
  { date: "2024-05-13", revenus: 197000, commissions: 16000 },
  { date: "2024-05-14", revenus: 448000, commissions: 49000 },
  { date: "2024-05-15", revenus: 473000, commissions: 38000 },
  { date: "2024-05-16", revenus: 338000, commissions: 40000 },
  { date: "2024-05-17", revenus: 499000, commissions: 42000 },
  { date: "2024-05-18", revenus: 315000, commissions: 35000 },
  { date: "2024-05-19", revenus: 235000, commissions: 18000 },
  { date: "2024-05-20", revenus: 177000, commissions: 23000 },
  { date: "2024-05-21", revenus: 82000, commissions: 14000 },
  { date: "2024-05-22", revenus: 81000, commissions: 12000 },
  { date: "2024-05-23", revenus: 252000, commissions: 29000 },
  { date: "2024-05-24", revenus: 294000, commissions: 22000 },
  { date: "2024-05-25", revenus: 201000, commissions: 25000 },
  { date: "2024-05-26", revenus: 213000, commissions: 17000 },
  { date: "2024-05-27", revenus: 420000, commissions: 46000 },
  { date: "2024-05-28", revenus: 233000, commissions: 19000 },
  { date: "2024-05-29", revenus: 78000, commissions: 13000 },
  { date: "2024-05-30", revenus: 340000, commissions: 28000 },
  { date: "2024-05-31", revenus: 178000, commissions: 23000 },
  { date: "2024-06-01", revenus: 178000, commissions: 20000 },
  { date: "2024-06-02", revenus: 470000, commissions: 41000 },
  { date: "2024-06-03", revenus: 103000, commissions: 16000 },
  { date: "2024-06-04", revenus: 439000, commissions: 38000 },
  { date: "2024-06-05", revenus: 88000, commissions: 14000 },
  { date: "2024-06-06", revenus: 294000, commissions: 25000 },
  { date: "2024-06-07", revenus: 323000, commissions: 37000 },
  { date: "2024-06-08", revenus: 385000, commissions: 32000 },
  { date: "2024-06-09", revenus: 438000, commissions: 48000 },
  { date: "2024-06-10", revenus: 155000, commissions: 20000 },
  { date: "2024-06-11", revenus: 92000, commissions: 15000 },
  { date: "2024-06-12", revenus: 492000, commissions: 42000 },
  { date: "2024-06-13", revenus: 81000, commissions: 13000 },
  { date: "2024-06-14", revenus: 426000, commissions: 38000 },
  { date: "2024-06-15", revenus: 307000, commissions: 35000 },
  { date: "2024-06-16", revenus: 371000, commissions: 31000 },
  { date: "2024-06-17", revenus: 475000, commissions: 52000 },
  { date: "2024-06-18", revenus: 107000, commissions: 17000 },
  { date: "2024-06-19", revenus: 341000, commissions: 29000 },
  { date: "2024-06-20", revenus: 408000, commissions: 45000 },
  { date: "2024-06-21", revenus: 169000, commissions: 21000 },
  { date: "2024-06-22", revenus: 317000, commissions: 27000 },
  { date: "2024-06-23", revenus: 480000, commissions: 53000 },
  { date: "2024-06-24", revenus: 132000, commissions: 18000 },
  { date: "2024-06-25", revenus: 141000, commissions: 19000 },
  { date: "2024-06-26", revenus: 434000, commissions: 38000 },
  { date: "2024-06-27", revenus: 448000, commissions: 49000 },
  { date: "2024-06-28", revenus: 149000, commissions: 20000 },
  { date: "2024-06-29", revenus: 103000, commissions: 16000 },
  { date: "2024-06-30", revenus: 446000, commissions: 40000 },
]

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
  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Transactions & Commissions</CardTitle>
          <CardDescription>
            Aperçu des transactions des 3 derniers mois
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Sélectionner une période"
          >
            <SelectValue placeholder="3 derniers mois" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              3 derniers mois
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              30 derniers jours
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              7 derniers jours
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillRevenus" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenus)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenus)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillCommissions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-commissions)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-commissions)"
                  stopOpacity={0.1}
                />
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
      </CardContent>
    </Card>
  )
}

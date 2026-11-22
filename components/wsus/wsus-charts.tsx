"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { wsusComplianceTrend, wsusStatusBreakdown } from "@/data/wsus-sample";

const trendChartConfig = {
  compliant: {
    label: "Compliant",
    color: "var(--chart-2)",
  },
  pendingReboot: {
    label: "Pending Reboot",
    color: "var(--chart-4)",
  },
  failed: {
    label: "Failed",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const breakdownChartConfig = {
  count: {
    label: "Clients",
  },
  compliant: {
    label: "Compliant",
    color: "var(--chart-2)",
  },
  needed: {
    label: "Updates Needed",
    color: "var(--chart-3)",
  },
  pendingReboot: {
    label: "Pending Reboot",
    color: "var(--chart-4)",
  },
  failed: {
    label: "Failed",
    color: "var(--chart-1)",
  },
  offline: {
    label: "Offline (>30d)",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function WsusCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-7">
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>7-Day Client Patch Compliance</CardTitle>
          <CardDescription>
            Daily compliance progression across all WSUS target groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={trendChartConfig} className="h-[280px] w-full">
            <BarChart data={wsusComplianceTrend} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="compliant"
                stackId="a"
                fill="var(--color-compliant)"
                radius={[0, 0, 4, 4]}
              />
              <Bar
                dataKey="pendingReboot"
                stackId="a"
                fill="var(--color-pendingReboot)"
              />
              <Bar
                dataKey="failed"
                stackId="a"
                fill="var(--color-failed)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Client Status Distribution</CardTitle>
          <CardDescription>
            Current snapshot of 1,248 managed endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={breakdownChartConfig}
            className="mx-auto h-[280px] w-full"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={wsusStatusBreakdown}
                dataKey="count"
                nameKey="key"
                innerRadius={56}
                outerRadius={92}
                strokeWidth={2}
              >
                {wsusStatusBreakdown.map((entry) => (
                  <Cell key={entry.key} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="key" />}
                className="-translate-y-1 flex-wrap gap-2 *:basis-1/3 *:justify-center"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

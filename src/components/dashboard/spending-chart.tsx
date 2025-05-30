"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart" // Shadcn chart components

const data = [
  { month: "Jan", groceries: 400, dining: 240, transport: 100, utilities: 150 },
  { month: "Feb", groceries: 300, dining: 139, transport: 90, utilities: 140 },
  { month: "Mar", groceries: 200, dining: 380, transport: 120, utilities: 160 },
  { month: "Apr", groceries: 278, dining: 300, transport: 80, utilities: 130 },
  { month: "May", groceries: 189, dining: 480, transport: 110, utilities: 170 },
  { month: "Jun", groceries: 239, dining: 380, transport: 100, utilities: 150 },
]

const chartConfig = {
  groceries: { label: "Groceries", color: "hsl(var(--chart-1))" },
  dining: { label: "Dining", color: "hsl(var(--chart-2))" },
  transport: { label: "Transport", color: "hsl(var(--chart-3))" },
  utilities: { label: "Utilities", color: "hsl(var(--chart-4))" },
} satisfies import("@/components/ui/chart").ChartConfig

export default function SpendingChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full aspect-video">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
          <XAxis
            dataKey="month"
            stroke="hsl(var(--foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="groceries" stackId="a" fill="var(--color-groceries)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="dining" stackId="a" fill="var(--color-dining)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="transport" stackId="a" fill="var(--color-transport)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="utilities" stackId="a" fill="var(--color-utilities)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}


'use client';

import { CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useSpendWise } from '@/context/spendwise-context';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface IncomeVsExpenseChartProps {
  timeRange: string; // This would be used to filter transactions
}

export default function IncomeVsExpenseChart({ timeRange }: IncomeVsExpenseChartProps) {
  const { transactions, isLoading } = useSpendWise();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // This is a simplified data aggregation for the last 6 months.
  // A real implementation would use timeRange to define the interval.
  const SPREAD = 6; // Number of months to show
  const end = new Date();
  const start = subMonths(startOfMonth(new Date()), SPREAD -1);
  const monthsInterval = eachMonthOfInterval({ start, end });

  const data = monthsInterval.map(monthStart => {
    const monthEnd = endOfMonth(monthStart);
    const monthLabel = format(monthStart, 'MMM yyyy');
    
    let income = 0;
    let expenses = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate >= monthStart && tDate <= monthEnd) {
        if (t.type === 'income') {
          income += t.amount;
        } else {
          expenses += Math.abs(t.amount);
        }
      }
    });
    return { name: monthLabel, income, expenses, net: income - expenses };
  });

  if (data.length === 0 && !isLoading) { // Check isLoading before concluding no data
     return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No data available for this period.</p>
      </div>
    );
  }

  const chartConfig = {
    income: { label: "Income", color: "hsl(var(--chart-1))" },
    expenses: { label: "Expenses", color: "hsl(var(--chart-2))" },
    net: { label: "Net Flow", color: "hsl(var(--chart-3))" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="net" stroke="var(--color-net)" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

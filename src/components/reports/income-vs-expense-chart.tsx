
'use client';

import { CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useSpendWise } from '@/context/spendwise-context';
import { format, subDays, subMonths, startOfYear, endOfDay, startOfMonth, endOfMonth, eachMonthOfInterval, startOfDay } from 'date-fns';
import { Loader2 } from 'lucide-react';

const getDateRangeLimits = (timeRange: string): { startDateLimit: Date; endDateLimit: Date } => {
  const now = endOfDay(new Date());
  let startDateLimit: Date;

  switch (timeRange) {
    case 'last30days':
      startDateLimit = startOfDay(subDays(now, 29));
      break;
    case 'last3months':
      startDateLimit = startOfDay(subMonths(now, 3));
      break;
    case 'last6months':
      startDateLimit = startOfDay(subMonths(now, 6));
      break;
    case 'thisyear':
      startDateLimit = startOfDay(startOfYear(now));
      break;
    case 'alltime':
    default:
      startDateLimit = new Date(1970, 0, 1); // A very early date for "all time"
      break;
  }
  return { startDateLimit, endDateLimit: now };
};

interface IncomeVsExpenseChartProps {
  timeRange: string;
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

  const { startDateLimit, endDateLimit } = getDateRangeLimits(timeRange);

  const relevantTransactions = transactions.filter(t => {
    const tDate = startOfDay(new Date(t.date));
    return tDate >= startDateLimit && tDate <= endDateLimit;
  });

  if (relevantTransactions.length === 0 && !isLoading) {
     return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No data available for this period.</p>
      </div>
    );
  }
  
  let effectiveStartForInterval = startDateLimit;
  if (relevantTransactions.length > 0) {
    const firstTransactionDate = relevantTransactions.reduce((earliest, current) => {
        const currentDate = startOfDay(new Date(current.date));
        return currentDate < earliest ? currentDate : earliest;
    }, endOfDay(new Date()) ); // Initialize with a late date
    // Ensure effectiveStartForInterval is not later than startDateLimit, and aligns with actual data or the desired range start.
    effectiveStartForInterval = firstTransactionDate > startDateLimit && firstTransactionDate < endDateLimit ? firstTransactionDate : startDateLimit;
  }
  // Align to start of month for monthly bucketing, or use the direct start date if range is small (e.g., last30days)
  const isShortRange = timeRange === 'last30days'; // Example: decide if daily/weekly aggregation is better
  
  // For simplicity, we'll stick to monthly intervals for now.
  // A more advanced version could switch to daily/weekly for shorter timeRanges.
  const intervalStart = startOfMonth(effectiveStartForInterval < startDateLimit ? startDateLimit : effectiveStartForInterval);

  const monthsInterval = eachMonthOfInterval({
    start: intervalStart,
    end: endDateLimit,
  });

  const data = monthsInterval.map(monthBucketStart => {
    const monthBucketEnd = endOfMonth(monthBucketStart);
    const monthLabel = format(monthBucketStart, 'MMM yy'); // Changed format slightly for clarity
    
    let income = 0;
    let expenses = 0;

    relevantTransactions.forEach(t => {
      const tDate = startOfDay(new Date(t.date));
      // Ensure transaction falls within the current month bucket
      if (tDate >= monthBucketStart && tDate <= monthBucketEnd) {
        if (t.type === 'income') {
          income += t.amount;
        } else {
          expenses += Math.abs(t.amount);
        }
      }
    });
    return { name: monthLabel, income, expenses, net: income - expenses };
  }).filter(d => d.income > 0 || d.expenses > 0); // Only show months with activity

   if (data.length === 0 && !isLoading) {
     return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No aggregated data to display for this period.</p>
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

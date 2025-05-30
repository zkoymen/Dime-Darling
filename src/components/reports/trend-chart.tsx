
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useSpendWise } from '@/context/spendwise-context';
import { PREDEFINED_CATEGORIES } from '@/lib/constants';
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
      startDateLimit = new Date(1970, 0, 1); 
      break;
  }
  return { startDateLimit, endDateLimit: now };
};

interface TrendChartProps {
  timeRange: string;
}

export default function TrendChart({ timeRange }: TrendChartProps) {
  const { transactions, categories: userCategories, isLoading } = useSpendWise();
  
  if (isLoading) {
    return (
     <div className="flex items-center justify-center h-[300px]">
       <Loader2 className="h-8 w-8 animate-spin text-primary" />
     </div>
   );
  }

  const allCategories = [...PREDEFINED_CATEGORIES, ...userCategories.filter(uc => !PREDEFINED_CATEGORIES.find(pc => pc.id === uc.id))];
  const { startDateLimit, endDateLimit } = getDateRangeLimits(timeRange);

  const relevantTransactions = transactions.filter(t => {
    const tDate = startOfDay(new Date(t.date));
    return t.type === 'expense' && tDate >= startDateLimit && tDate <= endDateLimit;
  });
  
  // Select top 3-4 spending categories FOR THE SELECTED PERIOD
  const expenseByCategory: Record<string, number> = {};
  relevantTransactions.forEach(t => {
    expenseByCategory[t.categoryId] = (expenseByCategory[t.categoryId] || 0) + Math.abs(t.amount);
  });
  
  const topCategoryIds = Object.entries(expenseByCategory)
    .sort(([,a],[,b]) => b-a)
    .slice(0, 4) // Show trends for top 4 categories
    .map(([id]) => id);

  const topCategories = allCategories.filter(cat => topCategoryIds.includes(cat.id));

  if (topCategories.length === 0 || relevantTransactions.length === 0) {
    return (
     <div className="flex items-center justify-center h-[300px]">
       <p className="text-muted-foreground">Not enough data to display trends for this period.</p>
     </div>
   );
  }
  
  let effectiveStartForInterval = startDateLimit;
   if (relevantTransactions.length > 0) {
    const firstTransactionDate = relevantTransactions.reduce((earliest, current) => {
        const currentDate = startOfDay(new Date(current.date));
        return currentDate < earliest ? currentDate : earliest;
    }, endOfDay(new Date()) );
    effectiveStartForInterval = firstTransactionDate > startDateLimit && firstTransactionDate < endDateLimit ? firstTransactionDate : startDateLimit;
  }
  const intervalStart = startOfMonth(effectiveStartForInterval < startDateLimit ? startDateLimit : effectiveStartForInterval);


  const monthsInterval = eachMonthOfInterval({
    start: intervalStart,
    end: endDateLimit,
  });

  const data = monthsInterval.map(monthBucketStart => {
    const monthBucketEnd = endOfMonth(monthBucketStart);
    const monthLabel = format(monthBucketStart, 'MMM yy');
    
    const monthData: { name: string; [key: string]: string | number } = { name: monthLabel };

    topCategories.forEach(cat => {
      monthData[cat.name] = 0; // Initialize category spending for the month
    });

    relevantTransactions.forEach(t => {
      const tDate = startOfDay(new Date(t.date));
      if (tDate >= monthBucketStart && tDate <= monthBucketEnd) { // Check if transaction is in current month bucket
        const category = allCategories.find(c => c.id === t.categoryId);
        if (category && topCategories.some(tc => tc.id === category.id)) {
           monthData[category.name] = (monthData[category.name] as number || 0) + Math.abs(t.amount);
        }
      }
    });
    return monthData;
  }).filter(d => topCategories.some(cat => (d[cat.name] as number) > 0)); // Only show months with activity in top categories


  if (data.length === 0 && !isLoading) {
    return (
     <div className="flex items-center justify-center h-[300px]">
       <p className="text-muted-foreground">No aggregated trend data to display for this period.</p>
     </div>
   );
 }

  const chartConfig = topCategories.reduce((config, category, idx) => {
    const safeCategoryName = category.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    // Use chart theme colors first
    const themeColorVar = `--chart-${(idx % 5) + 1}`;
    config[safeCategoryName] = { 
      label: category.name,
      color: category.color || `hsl(var(${themeColorVar}))`, 
    };
    return config;
  }, {} as ChartConfig);

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend />
          {topCategories.map(category => {
            const safeCategoryName = category.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
            return (
              <Line 
                key={category.id}
                type="monotone" 
                dataKey={category.name} 
                name={category.name}
                stroke={`var(--color-${safeCategoryName})`} 
                strokeWidth={2} 
                dot={{ r: 4, fill: `var(--color-${safeCategoryName})` }}
                activeDot={{ r: 6, stroke: `var(--color-${safeCategoryName})` }}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

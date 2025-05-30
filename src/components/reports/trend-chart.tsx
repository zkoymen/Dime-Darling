
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useSpendWise } from '@/context/spendwise-context';
import { PREDEFINED_CATEGORIES } from '@/lib/constants';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface TrendChartProps {
  timeRange: string; // This would be used to filter transactions
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
  
  const SPREAD = 6; // Number of months to show
  const end = new Date();
  const start = subMonths(startOfMonth(new Date()), SPREAD -1);
  const monthsInterval = eachMonthOfInterval({ start, end });

  // Select top 3-4 spending categories for trend display
  const expenseByCategory: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    expenseByCategory[t.categoryId] = (expenseByCategory[t.categoryId] || 0) + Math.abs(t.amount);
  });
  
  const topCategoryIds = Object.entries(expenseByCategory)
    .sort(([,a],[,b]) => b-a)
    .slice(0, 4)
    .map(([id]) => id);

  const topCategories = allCategories.filter(cat => topCategoryIds.includes(cat.id));

  const data = monthsInterval.map(monthStart => {
    const monthEnd = endOfMonth(monthStart);
    const monthLabel = format(monthStart, 'MMM yy');
    
    const monthData: { name: string; [key: string]: string | number } = { name: monthLabel };

    topCategories.forEach(cat => {
      monthData[cat.name] = 0; // Initialize
    });

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (t.type === 'expense' && tDate >= monthStart && tDate <= monthEnd) {
        const category = allCategories.find(c => c.id === t.categoryId);
        if (category && topCategories.some(tc => tc.id === category.id)) {
           monthData[category.name] = (monthData[category.name] as number || 0) + Math.abs(t.amount);
        }
      }
    });
    return monthData;
  });

  if (topCategories.length === 0 || (data.length === 0 && !isLoading)) { // Check isLoading
    return (
     <div className="flex items-center justify-center h-[300px]">
       <p className="text-muted-foreground">Not enough data to display trends.</p>
     </div>
   );
 }


  const chartConfig = topCategories.reduce((config, category, idx) => {
    const safeCategoryName = category.name.replace(/\s+/g, '-').toLowerCase(); // Make CSS var friendly
    config[safeCategoryName] = { // Use safe name for config key
      label: category.name,
      color: category.color || `hsl(var(--chart-${(idx % 5) + 1}))`, 
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
            const safeCategoryName = category.name.replace(/\s+/g, '-').toLowerCase();
            return (
              <Line 
                key={category.id}
                type="monotone" 
                dataKey={category.name} // dataKey should match the key in `data` objects
                name={category.name} // This is used by Legend and Tooltip
                stroke={`var(--color-${safeCategoryName})`} 
                strokeWidth={2} 
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

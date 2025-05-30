
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { ChartTooltipContent, ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { useSpendWise } from '@/context/spendwise-context';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, startOfDay, endOfDay } from 'date-fns'; // Added endOfDay
import { Loader2 } from 'lucide-react';
import { PREDEFINED_CATEGORIES, CURRENCY_SYMBOL } from "@/lib/constants";

export default function SpendingChart() {
  const { transactions, categories: userCategories, isLoading } = useSpendWise();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const allCategories = [...PREDEFINED_CATEGORIES, ...userCategories.filter(uc => !PREDEFINED_CATEGORIES.find(pc => pc.id === uc.id))];

  const endDate = endOfDay(new Date());
  const startDate = startOfMonth(subMonths(endDate, 5)); // Last 6 months including current

  const relevantTransactions = transactions.filter(t => {
    const tDate = startOfDay(new Date(t.date));
    return t.type === 'expense' && tDate >= startDate && tDate <= endDate;
  });

  if (relevantTransactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <p className="text-muted-foreground">No spending data for the last 6 months.</p>
      </div>
    );
  }

  const monthlyExpenses: { [month: string]: { [categoryName: string]: number } } = {};
  const categorySet = new Set<string>();

  const monthsInterval = eachMonthOfInterval({ start: startDate, end: endDate });

  monthsInterval.forEach(monthStart => {
    const monthKey = format(monthStart, 'MMM yy');
    monthlyExpenses[monthKey] = {};

    const monthEnd = endOfMonth(monthStart);
    relevantTransactions.forEach(t => {
      const tDate = startOfDay(new Date(t.date));
      if (tDate >= monthStart && tDate <= monthEnd) {
        const category = allCategories.find(c => c.id === t.categoryId);
        const categoryName = category ? category.name : 'Uncategorized';
        monthlyExpenses[monthKey][categoryName] = (monthlyExpenses[monthKey][categoryName] || 0) + Math.abs(t.amount);
        categorySet.add(categoryName);
      }
    });
  });

  const chartData = monthsInterval.map(monthStart => {
    const monthKey = format(monthStart, 'MMM yy');
    const expensesForMonth = monthlyExpenses[monthKey] || {};
    const monthEntry: { month: string; [key: string]: string | number } = { month: monthKey };
    categorySet.forEach(catName => {
      monthEntry[catName] = expensesForMonth[catName] || 0;
    });
    return monthEntry;
  }).filter(entry => Object.values(entry).some(val => typeof val === 'number' && val > 0)); // Only include months with some spending

  if (chartData.length === 0) {
     return (
      <div className="flex items-center justify-center h-[350px]">
        <p className="text-muted-foreground">No spending to display for the last 6 months after processing.</p>
      </div>
    );
  }

  const activeCategoryNames = Array.from(categorySet);
  const dynamicChartConfig = activeCategoryNames.reduce((acc, catName, index) => {
    const categoryDetails = allCategories.find(c => c.name === catName);
    // Use chart theme colors first, then fallback to category color or a generated one
    const themeColorVar = `hsl(var(--chart-${(index % 5) + 1}))`; // Cycle through 5 theme chart colors

    acc[catName] = {
      label: catName,
      color: categoryDetails?.color || themeColorVar,
    };
    return acc;
  }, {} as ChartConfig);


  return (
    <ChartContainer config={dynamicChartConfig} className="min-h-[200px] w-full aspect-video">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
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
            tickFormatter={(value) => `${CURRENCY_SYMBOL}${value}`}
          />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted))' }} 
            content={<ChartTooltipContent 
                formatter={(value, name) => {
                    if (typeof value === 'number' && value > 0) {
                         return [`${CURRENCY_SYMBOL}${value.toFixed(2)}`, name];
                    }
                    return null; // Hide if value is 0 or not a number
                }}
            />} 
          />
          <Legend />
          {Object.keys(dynamicChartConfig).map((categoryKey) => (
            <Bar 
                key={categoryKey} 
                dataKey={categoryKey} 
                stackId="a" 
                fill={`var(--color-${categoryKey.replace(/\s+/g, '-')})`} // Ensure CSS var compatibility
                radius={[4, 4, 0, 0]} 
                // Hide bar if value is 0 by setting barSize to 0 - Recharts doesn't have a direct "hide if 0" prop
                // This can be complex; tooltips handle 0 values better. For actual hiding, data needs pre-filtering
                // or custom bar shapes. For now, tooltip will hide 0s.
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

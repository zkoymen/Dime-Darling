
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useSpendWise } from '@/context/spendwise-context';
import { PREDEFINED_CATEGORIES } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { subDays, subMonths, startOfYear, endOfDay, startOfDay } from 'date-fns';

// Helper to generate distinct colors if not defined or for many categories
const generateColors = (numColors: number): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < numColors; i++) {
    // Simple HSL based color generation, could be more sophisticated
    colors.push(`hsl(${ (i * (360 / Math.max(numColors,10))) % 360}, 70%, 60%)`);
  }
  return colors;
};

const getDateRangeLimits = (timeRange: string): { startDateLimit: Date; endDateLimit: Date } => {
  const now = endOfDay(new Date());
  let startDateLimit: Date;

  switch (timeRange) {
    case 'last30days':
      startDateLimit = startOfDay(subDays(now, 29)); // Inclusive of today
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
      startDateLimit = new Date(0); // Epoch
      break;
  }
  return { startDateLimit, endDateLimit: now };
};

interface CategoryPieChartProps {
  timeRange: string;
}

export default function CategoryPieChart({ timeRange }: CategoryPieChartProps) {
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

  const filteredTransactions = transactions.filter(t => {
    const tDate = startOfDay(new Date(t.date));
    return t.type === 'expense' && tDate >= startDateLimit && tDate <= endDateLimit;
  });

  const dataMap = new Map<string, number>();
  filteredTransactions.forEach(t => {
    const category = allCategories.find(c => c.id === t.categoryId);
    if (category) {
      dataMap.set(category.name, (dataMap.get(category.name) || 0) + Math.abs(t.amount));
    } else {
      dataMap.set('Uncategorized', (dataMap.get('Uncategorized') || 0) + Math.abs(t.amount));
    }
  });

  const chartData = Array.from(dataMap.entries()).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No expense data available for this period.</p>
      </div>
    );
  }
  
  const dynamicColors = generateColors(chartData.length);

  const chartConfig = chartData.reduce((acc, entry, index) => {
    const categoryDetails = allCategories.find(c => c.name === entry.name);
    // Use chart theme colors first, then fallback to generated or category color
    const themeColorVar = `--chart-${(index % 5) + 1}`; // Cycle through 5 theme chart colors
    const themeColor = `hsl(var(${themeColorVar}))`;

    acc[entry.name] = {
      label: entry.name,
      color: categoryDetails?.color || themeColor || dynamicColors[index % dynamicColors.length],
    };
    return acc;
  }, {} as ChartConfig);
  
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full aspect-square max-w-md mx-auto">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8" // Default fill, overridden by Cell
            labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
              const RADIAN = Math.PI / 180;
              // only show label if percent > 5% to avoid clutter
              if ((percent * 100) <= 5) return null; 
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + (radius + 10) * Math.cos(-midAngle * RADIAN); // Position label outside a bit
              const y = cy + (radius + 10) * Math.sin(-midAngle * RADIAN);
              return (
                <text x={x} y={y} fill={chartConfig[chartData[index].name]?.color || "hsl(var(--foreground))"} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
                  {`${chartData[index].name} (${(percent * 100).toFixed(0)}%)`}
                </text>
              );
            }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={chartConfig[entry.name]?.color} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

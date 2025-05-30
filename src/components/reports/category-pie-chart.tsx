'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useSpendWise } from '@/context/spendwise-context';
import { PREDEFINED_CATEGORIES } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

// Helper to generate distinct colors if not defined or for many categories
const generateColors = (numColors: number): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < numColors; i++) {
    // Simple HSL based color generation
    colors.push(`hsl(${ (i * (360 / Math.max(numColors,10))) % 360}, 70%, 60%)`);
  }
  return colors;
};


interface CategoryPieChartProps {
  timeRange: string; // This would be used to filter transactions
}

export default function CategoryPieChart({ timeRange }: CategoryPieChartProps) {
  const { transactions, categories: userCategories } = useSpendWise();
  const allCategories = [...PREDEFINED_CATEGORIES, ...userCategories.filter(uc => !PREDEFINED_CATEGORIES.find(pc => pc.id === uc.id))];

  // Filter transactions by timeRange (simplified for this example)
  // A real implementation would parse timeRange and filter dates accordingly
  const filteredTransactions = transactions.filter(t => t.type === 'expense');

  const dataMap = new Map<string, number>();
  filteredTransactions.forEach(t => {
    const category = allCategories.find(c => c.id === t.categoryId);
    if (category) {
      dataMap.set(category.name, (dataMap.get(category.name) || 0) + Math.abs(t.amount));
    } else {
      dataMap.set('Uncategorized', (dataMap.get('Uncategorized') || 0) + Math.abs(t.amount));
    }
  });

  const chartData = Array.from(dataMap.entries()).map(([name, value]) => ({ name, value }));

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
    acc[entry.name] = {
      label: entry.name,
      color: categoryDetails?.color || dynamicColors[index % dynamicColors.length],
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
            fill="#8884d8"
            labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
              const RADIAN = Math.PI / 180;
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * RADIAN);
              const y = cy + radius * Math.sin(-midAngle * RADIAN);
              return (percent * 100) > 5 ? ( // Only show label if percent > 5%
                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              ) : null;
            }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={chartConfig[entry.name]?.color || dynamicColors[index % dynamicColors.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}


'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import SpendingChart from "@/components/dashboard/spending-chart"; // No longer used here
import CategoryPieChart from "@/components/reports/category-pie-chart";
import IncomeVsExpenseChart from "@/components/reports/income-vs-expense-chart";
import TrendChart from "@/components/reports/trend-chart";
import { useState } from "react";

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("last6months");

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-muted-foreground">Analyze your spending patterns and financial health.</p>
        </div>
        <Select defaultValue={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last30days">Last 30 Days</SelectItem>
            <SelectItem value="last3months">Last 3 Months</SelectItem>
            <SelectItem value="last6months">Last 6 Months</SelectItem>
            <SelectItem value="thisyear">This Year</SelectItem>
            <SelectItem value="alltime">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spending">Spending by Category</TabsTrigger>
          <TabsTrigger value="income">Income vs Expense</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>A summary of your financial activity for the selected period.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {/* Using IncomeVsExpenseChart for a dynamic overview */}
              <IncomeVsExpenseChart timeRange={timeRange} /> 
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spending">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Breakdown of your expenses across different categories.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <CategoryPieChart timeRange={timeRange} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Income vs. Expense</CardTitle>
              <CardDescription>Comparison of your total income and expenses over time.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <IncomeVsExpenseChart timeRange={timeRange} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>Track how your spending in key categories changes over time.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <TrendChart timeRange={timeRange} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

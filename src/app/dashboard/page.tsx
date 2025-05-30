import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Landmark, Activity } from "lucide-react";
import OverviewCard from "@/components/dashboard/overview-card";
import SpendingChart from "@/components/dashboard/spending-chart";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import BudgetOverview from "@/components/dashboard/budget-overview";

export default function DashboardPage() {
  // Mock data - replace with actual data fetching
  const totalIncome = 5000;
  const totalExpenses = 2500;
  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
          title="Total Income"
          value={`$${totalIncome.toFixed(2)}`}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          description="This month"
        />
        <OverviewCard
          title="Total Expenses"
          value={`$${totalExpenses.toFixed(2)}`}
          icon={<TrendingDown className="h-5 w-5 text-red-500" />}
          description="This month"
        />
        <OverviewCard
          title="Net Balance"
          value={`$${netBalance.toFixed(2)}`}
          icon={<Landmark className="h-5 w-5 text-blue-500" />}
          description="Current balance"
        />
        <OverviewCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          icon={<Activity className="h-5 w-5 text-purple-500" />}
          description="This month"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
            <CardDescription>Your spending patterns for the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <SpendingChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activities.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactions />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>Track your progress towards your budget goals.</CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetOverview />
        </CardContent>
      </Card>
    </div>
  );
}

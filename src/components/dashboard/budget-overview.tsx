
'use client';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PREDEFINED_CATEGORIES, CURRENCY_SYMBOL } from "@/lib/constants";
import type { Budget } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSpendWise } from "@/context/spendwise-context";
import { Loader2 } from "lucide-react";

export default function BudgetOverview() {
  const { budgets, categories, isLoading } = useSpendWise();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (budgets.length === 0 && !isLoading) {
    return <p className="text-sm text-muted-foreground">No budgets set yet. <a href="/budgets" className="text-primary hover:underline">Create one now!</a></p>;
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const category = categories.find(c => c.id === budget.categoryId) || PREDEFINED_CATEGORIES.find(c => c.id === budget.categoryId);
          const progressValue = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
          const remaining = budget.limit - budget.spent;

          return (
            <Card key={budget.id} className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{category?.name || 'Unnamed Budget'}</CardTitle>
                <CardDescription className="text-xs">
                  {CURRENCY_SYMBOL}{budget.spent.toFixed(2)} spent of {CURRENCY_SYMBOL}{budget.limit.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={Math.min(progressValue, 100)} className="h-2 mb-1" />
                <p className={`text-xs ${remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {remaining >= 0 
                    ? `${CURRENCY_SYMBOL}${remaining.toFixed(2)} remaining` 
                    : `${CURRENCY_SYMBOL}${Math.abs(remaining).toFixed(2)} overspent`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}

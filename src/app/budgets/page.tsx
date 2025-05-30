'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Edit3, Trash2, AlertTriangle } from "lucide-react";
import BudgetForm from "@/components/budgets/budget-form";
import type { Budget, Category } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { PREDEFINED_CATEGORIES, CURRENCY_SYMBOL } from "@/lib/constants";
import { ScrollArea } from '@/components/ui/scroll-area';
import { getIconComponent } from '@/lib/utils';
import { useSpendWise } from '@/context/spendwise-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


export default function BudgetsPage() {
  const { budgets, categories: userCategories, addBudget, updateBudget, deleteBudget, transactions } = useSpendWise();
  const allCategories = [...PREDEFINED_CATEGORIES, ...userCategories.filter(uc => !PREDEFINED_CATEGORIES.find(pc => pc.id === uc.id))];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>(undefined);

  const handleAddBudget = () => {
    setEditingBudget(undefined);
    setIsFormOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };
  
  const onFormSubmit = (data: Omit<Budget, 'id' | 'spent'> & { id?: string }) => {
    const budgetData = {
        ...data,
        id: editingBudget?.id || data.id || crypto.randomUUID(),
        spent: calculateSpentForBudget(data.categoryId, data.startDate, data.endDate),
    };

    if (editingBudget || data.id) {
        updateBudget(budgetData);
    } else {
        addBudget(budgetData);
    }
    setIsFormOpen(false);
    setEditingBudget(undefined);
  };

  // Recalculate spent amounts when transactions change
  // This is a simplified calculation. Real app would filter by date range more precisely.
  const calculateSpentForBudget = (categoryId: string, startDate: string, endDate?: string): number => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getFullYear(), start.getMonth() + 1, 0); // End of month if no end date

    return transactions
      .filter(t => 
        t.categoryId === categoryId && 
        t.type === 'expense' &&
        new Date(t.date) >= start &&
        new Date(t.date) <= end
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };
  
  const displayBudgets = budgets.map(b => ({
    ...b,
    spent: calculateSpentForBudget(b.categoryId, b.startDate, b.endDate),
  }));


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Budgets</h1>
          <p className="text-muted-foreground">Set and track your monthly spending goals.</p>
        </div>
        <Button onClick={handleAddBudget}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Budgets</CardTitle>
          <CardDescription>Monitor your progress against your set budgets.</CardDescription>
        </CardHeader>
        <CardContent>
          {displayBudgets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No budgets set yet. Start by adding one!</p>
          ) : (
            <ScrollArea className="h-[calc(100vh-20rem)]"> {/* Adjust height as needed */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayBudgets.map((budget) => {
                  const category = allCategories.find(c => c.id === budget.categoryId);
                  const iconElement = category ? getIconComponent(category.icon as any, { className: "h-5 w-5", style: { color: category?.color || 'hsl(var(--foreground))' } }) : null;
                  const progressValue = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
                  const isOverspent = progressValue > 100;

                  return (
                    <Card key={budget.id} className={`shadow-sm hover:shadow-md transition-shadow ${isOverspent ? 'border-destructive' : ''}`}>
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-2">
                          {iconElement}
                          <CardTitle className="text-base font-medium">{category?.name || 'Uncategorized Budget'}</CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditBudget(budget)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the budget for "{category?.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteBudget(budget.id)} className={buttonVariants({variant: "destructive"})}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">{CURRENCY_SYMBOL}{budget.spent.toFixed(2)} <span className="text-sm text-muted-foreground">/ {CURRENCY_SYMBOL}{budget.limit.toFixed(2)}</span></div>
                        <Progress value={Math.min(progressValue, 100)} className={`h-3 mt-1 mb-2 ${isOverspent ? '[&>div]:bg-destructive' : ''}`} />
                        <p className="text-xs text-muted-foreground">
                          {budget.period === 'monthly' ? `For ${new Date(budget.startDate).toLocaleString('default', { month: 'long', year: 'numeric' })}` : `From ${new Date(budget.startDate).toLocaleDateString()} to ${budget.endDate ? new Date(budget.endDate).toLocaleDateString() : 'Ongoing'}`}
                        </p>
                        {isOverspent && (
                          <p className="text-xs text-destructive font-medium mt-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Overspent by {CURRENCY_SYMBOL}{(budget.spent - budget.limit).toFixed(2)}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if(!isOpen) setEditingBudget(undefined); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingBudget ? "Edit Budget" : "Add New Budget"}</DialogTitle>
            <DialogDescription>
              {editingBudget ? "Update your budget details." : "Set a new budget for a category."}
            </DialogDescription>
          </DialogHeader>
          <BudgetForm onSubmit={onFormSubmit} existingBudget={editingBudget} categories={allCategories.filter(c => c.name.toLowerCase() !== 'salary' && c.name.toLowerCase() !== 'freelance income')} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper for AlertDialog action style
const buttonVariants = ({ variant }: { variant?: string }) => {
  if (variant === "destructive") {
    return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
  }
  return "";
};

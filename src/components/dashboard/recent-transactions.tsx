'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PREDEFINED_CATEGORIES, CURRENCY_SYMBOL } from "@/lib/constants";
import type { Transaction } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getIconComponent } from '@/lib/utils';
import { useSpendWise } from "@/context/spendwise-context";

export default function RecentTransactions() {
  const { transactions, categories } = useSpendWise();
  
  // Get last 5 transactions
  const recent = transactions.slice(-5).reverse();

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || PREDEFINED_CATEGORIES.find(cat => cat.id === categoryId);
  }

  return (
    <ScrollArea className="h-[350px]">
      <div className="space-y-4">
        {recent.length === 0 && <p className="text-sm text-muted-foreground">No transactions yet.</p>}
        {recent.map((transaction) => {
          const category = getCategoryInfo(transaction.categoryId);
          const IconComponent = category ? getIconComponent(category.icon as any) : null;
          const initials = category ? category.name.substring(0, 2).toUpperCase() : '??';

          return (
            <div key={transaction.id} className="flex items-center p-1 rounded-md hover:bg-muted/50 transition-colors">
              <Avatar className="h-9 w-9">
                {IconComponent ? (
                  <div className="flex h-full w-full items-center justify-center rounded-full" style={{ backgroundColor: category?.color ? `${category.color}33` : 'hsl(var(--muted))' }}>
                     <IconComponent className="h-5 w-5" style={{ color: category?.color || 'hsl(var(--foreground))' }} />
                  </div>
                ) : (
                  <AvatarFallback style={{ backgroundColor: category?.color ? `${category.color}33` : 'hsl(var(--muted))', color: category?.color || 'hsl(var(--foreground))' }}>
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">{category?.name || 'Uncategorized'}</p>
              </div>
              <div className={`ml-auto font-medium text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'income' ? '+' : '-'}{CURRENCY_SYMBOL}{Math.abs(transaction.amount).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

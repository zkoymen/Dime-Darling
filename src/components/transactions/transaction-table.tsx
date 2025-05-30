'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2 } from "lucide-react";
import type { Transaction, Category } from "@/lib/types";
import { PREDEFINED_CATEGORIES, CURRENCY_SYMBOL } from "@/lib/constants";
import { getIconComponent, cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from "next/link";

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  onDeleteTransaction: (id: string) => void;
}

export default function TransactionTable({ transactions, categories: userCategories, onDeleteTransaction }: TransactionTableProps) {
  const allCategories = [...PREDEFINED_CATEGORIES, ...userCategories.filter(uc => !PREDEFINED_CATEGORIES.find(pc => pc.id === uc.id))];
  
  const getCategoryInfo = (categoryId: string) => {
    return allCategories.find(cat => cat.id === categoryId);
  }

  if (transactions.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No transactions yet. <Link href="/transactions/add" className="text-primary hover:underline">Add your first one!</Link></p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Type</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const category = getCategoryInfo(transaction.categoryId);
            const IconComponent = category ? getIconComponent(category.icon as any) : null;
            return (
              <TableRow key={transaction.id}>
                <TableCell>{format(new Date(transaction.date), "MMM d, yyyy")}</TableCell>
                <TableCell className="font-medium">{transaction.description}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {IconComponent && <IconComponent className="h-4 w-4" style={{ color: category?.color }} />}
                    <span>{category?.name || 'Uncategorized'}</span>
                  </div>
                </TableCell>
                <TableCell className={cn("text-right", transaction.type === 'income' ? 'text-green-600' : 'text-red-600')}>
                  {transaction.type === 'income' ? '+' : '-'}{CURRENCY_SYMBOL}{Math.abs(transaction.amount).toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'} 
                         className={cn(transaction.type === 'income' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200')}>
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/transactions/edit/${transaction.id}`}>
                        <DropdownMenuItem>
                          <Edit3 className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem onClick={() => onDeleteTransaction(transaction.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

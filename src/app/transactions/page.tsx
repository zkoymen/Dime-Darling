'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionTable from "@/components/transactions/transaction-table";
import Link from "next/link";
import { PlusCircle, Download } from "lucide-react";
import { useSpendWise } from "@/context/spendwise-context";

export default function TransactionsPage() {
  const { transactions, categories, deleteTransaction } = useSpendWise();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="text-muted-foreground">View and manage all your financial transactions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/transactions/add">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </Link>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>A complete list of your income and expenses.</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionTable 
            transactions={transactions} 
            categories={categories}
            onDeleteTransaction={deleteTransaction}
          />
        </CardContent>
      </Card>
    </div>
  );
}

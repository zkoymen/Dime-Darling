
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionForm from "@/components/transactions/transaction-form";
import { useSpendWise } from "@/context/spendwise-context";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Transaction } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button"; // Added import for Button

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { transactions, getTransactionById, isLoading: isContextLoading } = useSpendWise();
  const [transaction, setTransaction] = useState<Transaction | undefined>(undefined);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (isContextLoading) {
      setPageLoading(true); // Keep page loading if context is still loading
      return;
    }

    // Context is loaded, now process to find the transaction
    if (id) {
      const fetchedTransaction = getTransactionById(id as string);
      if (fetchedTransaction) {
        setTransaction(fetchedTransaction);
      } else {
        // Transaction not found after context loaded.
        // console.log(`Transaction with id ${id} not found after context load.`);
      }
    }
    setPageLoading(false); // Done with attempting to find the transaction for this effect run
  }, [id, getTransactionById, transactions, isContextLoading, router]);


  if (isContextLoading || (pageLoading && !transaction && id)) { // Show loader if context is loading, or page is trying to load a specific transaction
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!transaction && !pageLoading && id) { // Context loaded, page processed, but specific transaction not found
     return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The transaction you are trying to edit could not be found.</p>
            <Button onClick={() => router.push('/transactions')} className="mt-4">Go to Transactions</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{transaction ? "Edit Transaction" : "Add New Transaction"}</CardTitle>
          <CardDescription>
            {transaction ? "Update the details of your transaction." : "Enter the details of your income or expense."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Render form only if transaction is loaded (for editing) or if no ID (for adding) */}
          {/* And ensure page is not in a loading state for the transaction itself */}
          {(transaction && !pageLoading) || !id ? (
            <TransactionForm existingTransaction={transaction} />
          ) : (
            <p>Loading transaction details...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionForm from "@/components/transactions/transaction-form";
import { useSpendWise } from "@/context/spendwise-context";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Transaction } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { transactions, getTransactionById } = useSpendWise(); // Assuming getTransactionById is added to context
  const [transaction, setTransaction] = useState<Transaction | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && transactions.length > 0) { // Check transactions populated from context
      const fetchedTransaction = getTransactionById(id as string);
      if (fetchedTransaction) {
        setTransaction(fetchedTransaction);
      } else {
        // Handle transaction not found, maybe redirect or show error
        // router.push('/transactions'); 
      }
      setLoading(false);
    } else if (id && transactions.length === 0) {
      // context might still be loading, wait for transactions to populate or fetch directly if needed
      // For this example, we assume context loads quickly or has initial data.
      // A more robust solution might involve a loading state in the context itself.
    }
  }, [id, getTransactionById, router, transactions]);


  if (loading && !transaction) { // Show loader if still fetching or context data not yet available
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!transaction && !loading) {
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
          <CardTitle>Edit Transaction</CardTitle>
          <CardDescription>Update the details of your transaction.</CardDescription>
        </CardHeader>
        <CardContent>
          {transaction ? <TransactionForm existingTransaction={transaction} /> : <p>Loading transaction details...</p>}
        </CardContent>
      </Card>
    </div>
  );
}

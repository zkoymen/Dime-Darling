import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionForm from "@/components/transactions/transaction-form";

export default function AddTransactionPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Transaction</CardTitle>
          <CardDescription>Enter the details of your income or expense.</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionForm />
        </CardContent>
      </Card>
    </div>
  );
}

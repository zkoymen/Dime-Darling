'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check, ChevronsUpDown, Sparkles, Lightbulb, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";
import { cn, getIconComponent } from "@/lib/utils";
import { PREDEFINED_CATEGORIES } from "@/lib/constants";
import type { Transaction, Category, CategorizationSuggestion } from "@/lib/types";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { categorizeExpense } from "@/ai/flows/categorize-expense";
import { useSpendWise } from "@/context/spendwise-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const transactionFormSchema = z.object({
  description: z.string().min(2, "Description must be at least 2 characters.").max(100),
  amount: z.coerce.number().positive("Amount must be positive."),
  date: z.date({ required_error: "A date is required." }),
  type: z.enum(["income", "expense"], { required_error: "Transaction type is required." }),
  categoryId: z.string().min(1, "Category is required."),
  notes: z.string().max(200).optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  existingTransaction?: Transaction;
}

export default function TransactionForm({ existingTransaction }: TransactionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { categories: userCategories, addTransaction, updateTransaction, getPastSpendingSummary } = useSpendWise();
  
  const allCategories = [...PREDEFINED_CATEGORIES, ...userCategories.filter(uc => !PREDEFINED_CATEGORIES.find(pc => pc.id === uc.id))];
  const expenseCategories = allCategories.filter(c => c.name.toLowerCase() !== 'salary' && c.name.toLowerCase() !== 'freelance income'); // Basic filter
  const incomeCategories = allCategories.filter(c => c.name.toLowerCase() === 'salary' || c.name.toLowerCase() === 'freelance income');

  const [availableCategories, setAvailableCategories] = useState(expenseCategories);
  const [isSmartCategorizeOpen, setIsSmartCategorizeOpen] = useState(false);
  const [suggestion, setSuggestion] = useState<CategorizationSuggestion | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [showSuggestionApplied, setShowSuggestionApplied] = useState(false);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: existingTransaction
      ? {
          ...existingTransaction,
          amount: Math.abs(existingTransaction.amount),
          date: new Date(existingTransaction.date),
        }
      : {
          description: "",
          amount: 0,
          date: new Date(),
          type: "expense",
          categoryId: "",
          notes: "",
        },
  });

  const transactionType = form.watch("type");
  const transactionDescription = form.watch("description");

  useEffect(() => {
    if (transactionType === "income") {
      setAvailableCategories(incomeCategories);
    } else {
      setAvailableCategories(expenseCategories);
    }
    // Reset category if it's not valid for the new type
    const currentCategoryId = form.getValues("categoryId");
    if (currentCategoryId && !availableCategories.find(cat => cat.id === currentCategoryId)) {
       form.setValue("categoryId", "", { shouldValidate: true });
    } else if (currentCategoryId && availableCategories.find(cat => cat.id === currentCategoryId)){
      // No need to reset if current category is still valid
    } else {
      form.setValue("categoryId", "", { shouldValidate: true });
    }
  }, [transactionType, form, incomeCategories, expenseCategories]); // Removed availableCategories from dep array as it causes re-runs itself


  async function onSubmit(data: TransactionFormValues) {
    const transactionData: Transaction = {
      id: existingTransaction?.id || crypto.randomUUID(),
      ...data,
      date: format(data.date, "yyyy-MM-dd"),
      amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
    };

    if (existingTransaction) {
      updateTransaction(transactionData);
      toast({ title: "Transaction Updated", description: "Your transaction has been successfully updated." });
    } else {
      addTransaction(transactionData);
      toast({ title: "Transaction Added", description: "Your new transaction has been successfully added." });
    }
    router.push("/transactions");
  }

  const handleSmartCategorize = async () => {
    if (!transactionDescription) {
      toast({ title: "Missing Description", description: "Please enter a transaction description first.", variant: "destructive" });
      return;
    }
    setIsCategorizing(true);
    setSuggestion(null);
    try {
      const pastSpendingHabits = getPastSpendingSummary(); // Get summary from context
      const predefinedCatNames = expenseCategories.map(c => c.name);
      
      const result = await categorizeExpense({
        transactionDescription,
        pastSpendingHabits,
        predefinedCategories: predefinedCatNames,
      });

      setSuggestion(result);
      setIsSmartCategorizeOpen(true);
    } catch (error) {
      console.error("Error categorizing expense:", error);
      toast({ title: "Categorization Failed", description: "Could not get AI suggestion. Please try again.", variant: "destructive" });
    } finally {
      setIsCategorizing(false);
    }
  };
  
  const applySuggestion = () => {
    if (suggestion) {
      const suggestedCat = expenseCategories.find(c => c.name === suggestion.suggestedCategory);
      if (suggestedCat) {
        form.setValue("categoryId", suggestedCat.id, { shouldValidate: true });
        toast({ title: "Suggestion Applied!", description: `Category set to ${suggestedCat.name}.`});
        setShowSuggestionApplied(true);
        setTimeout(() => setShowSuggestionApplied(false), 3000); // Hide message after 3s
      } else {
         toast({ title: "Category Not Found", description: `Suggested category "${suggestion.suggestedCategory}" not in your list.`, variant: "destructive" });
      }
    }
    setIsSmartCategorizeOpen(false);
  };


  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Coffee with Jane" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} step="0.01"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="mb-1.5">Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Category</FormLabel>
                 <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                        >
                          {field.value
                            ? availableCategories.find((cat) => cat.id === field.value)?.name
                            : "Select category"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                       <Command>
                        <CommandInput placeholder="Search category..." />
                        <CommandList>
                          <CommandEmpty>No category found.</CommandEmpty>
                          <CommandGroup>
                            {availableCategories.map((cat) => {
                              const iconElement = getIconComponent(cat.icon as any, { className: "mr-2 h-4 w-4", style:{color: cat.color}});
                              return (
                                <CommandItem
                                  value={cat.name}
                                  key={cat.id}
                                  onSelect={() => {
                                    form.setValue("categoryId", cat.id, { shouldValidate: true });
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      cat.id === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {iconElement}
                                  {cat.name}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {transactionType === 'expense' && (
                    <Button type="button" variant="outline" size="icon" onClick={handleSmartCategorize} disabled={isCategorizing || !transactionDescription} title="Smart Categorize (AI)">
                      {isCategorizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-accent" />}
                    </Button>
                  )}
                </div>
                {showSuggestionApplied && <p className="text-sm text-green-600 mt-1">AI suggestion applied!</p>}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Add any relevant notes..." className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {existingTransaction ? "Save Changes" : "Add Transaction"}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={isSmartCategorizeOpen} onOpenChange={setIsSmartCategorizeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              AI Category Suggestion
            </DialogTitle>
            <DialogDescription>
              Based on "{transactionDescription}", we suggest the following category:
            </DialogDescription>
          </DialogHeader>
          {suggestion && (
            <div className="my-4 p-4 bg-muted/50 rounded-md">
              <p className="font-semibold text-lg">{suggestion.suggestedCategory}</p>
              <p className="text-sm text-muted-foreground">Confidence: {(suggestion.confidence * 100).toFixed(0)}%</p>
              {suggestion.reasoning && <p className="text-xs mt-2 italic">Reason: {suggestion.reasoning}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSmartCategorizeOpen(false)}>Cancel</Button>
            <Button onClick={applySuggestion} disabled={!suggestion}>Apply Suggestion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

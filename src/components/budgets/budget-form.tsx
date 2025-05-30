'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import type { Budget, Category } from "@/lib/types";
import { cn, getIconComponent } from "@/lib/utils";
import { format, startOfMonth, endOfMonth } from "date-fns";

const budgetFormSchema = z.object({
  categoryId: z.string().min(1, "Category is required."),
  limit: z.coerce.number().positive("Limit must be a positive number."),
  period: z.enum(["monthly", "yearly", "custom"], { required_error: "Budget period is required." }),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date().optional(),
}).refine(data => {
  if (data.period === 'custom' && !data.endDate) {
    return false;
  }
  if (data.endDate && data.endDate < data.startDate) {
    return false;
  }
  return true;
}, {
  message: "End date is required for custom period and must be after start date.",
  path: ["endDate"],
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface BudgetFormProps {
  onSubmit: (data: Omit<Budget, 'id' | 'spent'> & { id?: string }) => void;
  existingBudget?: Budget;
  categories: Category[];
}

export default function BudgetForm({ onSubmit, existingBudget, categories }: BudgetFormProps) {
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: existingBudget
      ? {
          ...existingBudget,
          startDate: new Date(existingBudget.startDate),
          endDate: existingBudget.endDate ? new Date(existingBudget.endDate) : undefined,
        }
      : {
          categoryId: "",
          limit: 0,
          period: "monthly",
          startDate: startOfMonth(new Date()),
          endDate: undefined,
        },
  });

  const budgetPeriod = form.watch("period");
  const startDate = form.watch("startDate");

  // Automatically set end date for monthly/yearly if not custom
  if (budgetPeriod === "monthly" && startDate) {
    form.setValue("endDate", endOfMonth(startDate), {shouldValidate: false});
  } else if (budgetPeriod === "yearly" && startDate) {
    form.setValue("endDate", new Date(startDate.getFullYear(), 11, 31), {shouldValidate: false});
  }


  const handleSubmit = (values: BudgetFormValues) => {
    const budgetData: Omit<Budget, 'id' | 'spent'> & {id?: string} = {
      id: existingBudget?.id,
      categoryId: values.categoryId,
      limit: values.limit,
      period: values.period,
      startDate: format(values.startDate, "yyyy-MM-dd"),
      endDate: values.endDate ? format(values.endDate, "yyyy-MM-dd") : undefined,
    };
    onSubmit(budgetData);
     if (!existingBudget) {
      form.reset({ categoryId: "", limit: 0, period: "monthly", startDate: startOfMonth(new Date()), endDate: undefined});
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Category</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
                      {field.value
                        ? categories.find((cat) => cat.id === field.value)?.name
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
                        {categories.map((cat) => {
                          const Icon = getIconComponent(cat.icon as any);
                          return (
                            <CommandItem
                              value={cat.name}
                              key={cat.id}
                              onSelect={() => {
                                form.setValue("categoryId", cat.id, { shouldValidate: true });
                              }}
                            >
                              <Check
                                className={cn("mr-2 h-4 w-4", cat.id === field.value ? "opacity-100" : "opacity-0")}
                              />
                              {Icon && <Icon className="mr-2 h-4 w-4" style={{color: cat.color}} />}
                              {cat.name}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="limit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Limit</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} step="0.01"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Period</FormLabel>
                <Select onValueChange={(value) => {
                    field.onChange(value);
                    const currentStartDate = form.getValues("startDate") || new Date();
                    if (value === "monthly") {
                        form.setValue("startDate", startOfMonth(currentStartDate), { shouldValidate: true });
                        form.setValue("endDate", endOfMonth(currentStartDate), { shouldValidate: true });
                    } else if (value === "yearly") {
                        form.setValue("startDate", new Date(currentStartDate.getFullYear(), 0, 1), { shouldValidate: true }); // Jan 1st
                        form.setValue("endDate", new Date(currentStartDate.getFullYear(), 11, 31), { shouldValidate: true }); // Dec 31st
                    }
                 }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget period" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="mb-1.5">Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          disabled={budgetPeriod !== 'custom'}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            {budgetPeriod === 'custom' && (
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1.5">End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus 
                          disabled={(date) => form.getValues("startDate") && date < form.getValues("startDate")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
        </div>


        <Button type="submit" className="w-full">
          {existingBudget ? "Save Changes" : "Add Budget"}
        </Button>
      </form>
    </Form>
  );
}

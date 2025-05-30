'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import type { Category } from "@/lib/types";
import { cn, getIconComponent, ALL_LUCIDE_ICONS } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const iconNames = ALL_LUCIDE_ICONS;

const categoryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50),
  icon: z.string().min(1, "Icon is required."),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color (e.g., #RRGGBB).").optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  onSubmit: (data: Category) => void;
  existingCategory?: Category;
}

export default function CategoryForm({ onSubmit, existingCategory }: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: existingCategory || {
      name: "",
      icon: "Tags", // Default icon
      color: "#808080", // Default color
    },
  });

  const handleSubmit = (values: CategoryFormValues) => {
    const categoryData: Category = {
      id: existingCategory?.id || crypto.randomUUID(),
      name: values.name,
      icon: values.icon,
      color: values.color,
      isPredefined: existingCategory?.isPredefined || false,
    };
    onSubmit(categoryData);
    if (!existingCategory) {
      form.reset({ name: "", icon: "Tags", color: "#808080" }); // Reset for new entry
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Groceries" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Icon</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? 
                        (<span className="flex items-center gap-2">{getIconComponent(field.value as any, {className: "h-4 w-4"})} {field.value}</span>)
                        : "Select icon"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search icon..." />
                    <CommandList>
                      <ScrollArea className="h-48">
                        <CommandEmpty>No icon found.</CommandEmpty>
                        <CommandGroup>
                          {iconNames.map((iconName) => {
                            const iconElement = getIconComponent(iconName as any, { className: "mr-2 h-4 w-4" });
                            return (
                              <CommandItem
                                value={iconName}
                                key={iconName}
                                onSelect={() => {
                                  form.setValue("icon", iconName, { shouldValidate: true });
                                }}
                              >
                                <Check
                                  className={cn("mr-2 h-4 w-4", iconName === field.value ? "opacity-100" : "opacity-0")}
                                />
                                {iconElement}
                                {iconName}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </ScrollArea>
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
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input type="color" {...field} className="p-1 h-10 w-16" />
                </FormControl>
                <Input 
                  placeholder="#RRGGBB" 
                  value={field.value} 
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  maxLength={7}
                  className="w-full"
                />
              </div>
              <FormDescription>Choose a color for this category.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {existingCategory ? "Save Changes" : "Add Category"}
        </Button>
      </form>
    </Form>
  );
}

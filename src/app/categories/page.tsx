'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2 } from "lucide-react";
import CategoryForm from "@/components/categories/category-form";
import type { Category } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { getIconComponent, cn } from '@/lib/utils';
import { useSpendWise } from '@/context/spendwise-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';


export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useSpendWise();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory(id);
  };

  const onFormSubmit = (data: Category) => {
    if (editingCategory) {
      updateCategory(data);
    } else {
      addCategory({ ...data, id: crypto.randomUUID() });
    }
    setIsFormOpen(false);
    setEditingCategory(undefined);
  };
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-muted-foreground">Manage your spending and income categories.</p>
        </div>
        <Button onClick={handleAddCategory}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Categories</CardTitle>
          <CardDescription>Custom and predefined categories for organizing your finances.</CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No custom categories yet. Predefined categories are always available.</p>
          ) : (
            <ScrollArea className="h-[calc(100vh-20rem)]"> {/* Adjust height as needed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category) => {
                  const iconElement = getIconComponent(category.icon as any, { className: "h-5 w-5", style: { color: category.color || 'hsl(var(--foreground))' } });
                  return (
                    <Card key={category.id} className="flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium flex items-center gap-2">
                          {iconElement}
                          {category.name}
                        </CardTitle>
                        {!category.isPredefined && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditCategory(category)}>
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
                                    This action cannot be undone. This will permanently delete the category "{category.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteCategory(category.id)} className={buttonVariants({variant: "destructive"})}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="h-2 w-full rounded-full" style={{ backgroundColor: category.color || 'hsl(var(--muted))' }} />
                        {category.isPredefined && <Badge variant="outline" className="mt-2 text-xs">Predefined</Badge>}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if(!isOpen) setEditingCategory(undefined); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update the details of your category." : "Create a new category to organize your transactions."}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm onSubmit={onFormSubmit} existingCategory={editingCategory} />
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

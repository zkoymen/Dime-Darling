
'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Transaction, Category, Budget, AppData } from '@/lib/types';
import { PREDEFINED_CATEGORIES } from '@/lib/constants';
// import { format, startOfMonth, subMonths } from 'date-fns'; // No longer needed for mock data generation here

// Define the shape of the context data and methods
interface SpendWiseContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  getTransactionById: (id: string) => Transaction | undefined;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  getPastSpendingSummary: () => string;
  isLoading: boolean;
}

const SpendWiseContext = createContext<SpendWiseContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'dimeDarlingData'; // Updated key to match new app name for fresh start

export const SpendWiseProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(PREDEFINED_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData: AppData = JSON.parse(storedData);
        setTransactions(parsedData.transactions || []);
        // Merge predefined with stored custom categories ensuring no duplicates by id
        const customCategories = parsedData.categories?.filter(sc => !PREDEFINED_CATEGORIES.some(pc => pc.id === sc.id)) || [];
        setCategories([...PREDEFINED_CATEGORIES, ...customCategories]);
        setBudgets(parsedData.budgets || []);
      } else {
        // Initialize with a clean slate: empty transactions and budgets, only predefined categories
        setTransactions([]);
        setCategories(PREDEFINED_CATEGORIES);
        setBudgets([]);
      }
    } catch (error) {
      console.error("Failed to load data from local storage", error);
      // Fallback to clean slate on error
      setTransactions([]);
      setCategories(PREDEFINED_CATEGORIES);
      setBudgets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) { // Only save if not initial loading phase
        // Save only custom categories to localStorage; predefined are constants
        const customCategoriesToSave = categories.filter(c => !c.isPredefined);
        const appData: AppData = { transactions, categories: customCategoriesToSave, budgets };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData));
    }
  }, [transactions, categories, budgets, isLoading]);

  const addTransaction = (transaction: Transaction) => setTransactions(prev => [...prev, transaction].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  const updateTransaction = (updatedTransaction: Transaction) => setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));
  const getTransactionById = useCallback((id: string) => transactions.find(t => t.id === id), [transactions]);

  const addCategory = (category: Category) => setCategories(prev => [...prev, category]);
  const updateCategory = (updatedCategory: Category) => setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id && !c.isPredefined)); // Cannot delete predefined
    // Also update transactions that used this category to 'uncategorized' or a default
    const otherCategory = categories.find(c => c.name.toLowerCase() === 'other');
    setTransactions(prev => prev.map(t => t.categoryId === id ? {...t, categoryId: otherCategory?.id || PREDEFINED_CATEGORIES.find(c=>c.name === 'Other')!.id } : t));
  };
  

  const addBudget = (budget: Budget) => setBudgets(prev => [...prev, budget]);
  const updateBudget = (updatedBudget: Budget) => setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
  const deleteBudget = (id: string) => setBudgets(prev => prev.filter(b => b.id !== id));

  const getPastSpendingSummary = useCallback(() => {
    const recentExpenses = transactions
      .filter(t => t.type === 'expense')
      .slice(-10); // Get last 10 expenses
    if (recentExpenses.length === 0) return "No recent spending data.";
    
    const summary = recentExpenses.map(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return `${cat ? cat.name : 'Uncategorized'}: ${Math.abs(t.amount).toFixed(2)}`;
    }).join(', ');
    
    return `Recent spending includes: ${summary}.`;
  }, [transactions, categories]);

  // Sort transactions by date whenever they are set initially or updated
  useEffect(() => {
    if (transactions.length > 0) {
      setTransactions(currentTransactions => 
        [...currentTransactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    }
  }, []); // Run once on mount to sort initial data if any

  return (
    <SpendWiseContext.Provider value={{ 
        transactions, categories, budgets, 
        addTransaction, updateTransaction, deleteTransaction, getTransactionById,
        addCategory, updateCategory, deleteCategory, 
        addBudget, updateBudget, deleteBudget,
        getPastSpendingSummary,
        isLoading
    }}>
      {children}
    </SpendWiseContext.Provider>
  );
};

export const useSpendWise = (): SpendWiseContextType => {
  const context = useContext(SpendWiseContext);
  if (context === undefined) {
    throw new Error('useSpendWise must be used within a SpendWiseProvider');
  }
  return context;
};

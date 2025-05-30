
'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Transaction, Category, Budget, AppData } from '@/lib/types';
import { PREDEFINED_CATEGORIES } from '@/lib/constants';
import { format, startOfMonth, subMonths } from 'date-fns';

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

const LOCAL_STORAGE_KEY = 'spendwiseData';

// Helper to generate mock transactions
const generateMockTransactions = (categories: Category[]): Transaction[] => {
  const today = new Date();
  const mockTransactions: Transaction[] = [];
  const numTransactions = 30; // Generate 30 mock transactions

  for (let i = 0; i < numTransactions; i++) {
    const date = subMonths(startOfMonth(today), Math.floor(i / 5)); // Spread transactions over last 6 months
    const dayOffset = Math.floor(Math.random() * 28); // Random day within the month
    date.setDate(dayOffset + 1);

    const isExpense = Math.random() > 0.2; // 80% chance of expense
    const availableCategories = isExpense
      ? categories.filter(c => c.name.toLowerCase() !== 'salary' && c.name.toLowerCase() !== 'freelance income')
      : categories.filter(c => c.name.toLowerCase() === 'salary' || c.name.toLowerCase() === 'freelance income');
    
    if (availableCategories.length === 0) continue;

    const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    
    mockTransactions.push({
      id: crypto.randomUUID(),
      date: format(date, "yyyy-MM-dd"),
      description: `${isExpense ? 'Purchase' : 'Income'} ${i + 1} for ${randomCategory.name}`,
      amount: parseFloat((Math.random() * (isExpense ? 200 : 3000) + 5).toFixed(2)) * (isExpense ? -1 : 1),
      type: isExpense ? 'expense' : 'income',
      categoryId: randomCategory.id,
      notes: `Mock transaction note ${i + 1}`
    });
  }
  return mockTransactions;
};

// Helper to generate mock budgets
const generateMockBudgets = (categories: Category[], transactions: Transaction[]): Budget[] => {
  const expenseCategories = categories.filter(c => c.name.toLowerCase() !== 'salary' && c.name.toLowerCase() !== 'freelance income');
  const mockBudgets: Budget[] = [];
  const numBudgets = Math.min(5, expenseCategories.length); // Create budgets for up to 5 categories

  for (let i = 0; i < numBudgets; i++) {
    const category = expenseCategories[i];
    const limit = parseFloat((Math.random() * 500 + 100).toFixed(2)); // Random limit between 100 and 600
    const startDate = format(startOfMonth(new Date()), "yyyy-MM-dd");
    
    // Calculate spent amount for this mock budget
    const spent = transactions
      .filter(t => t.categoryId === category.id && t.type === 'expense' && new Date(t.date) >= new Date(startDate))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    mockBudgets.push({
      id: crypto.randomUUID(),
      categoryId: category.id,
      limit,
      spent,
      period: 'monthly',
      startDate,
    });
  }
  return mockBudgets;
};


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
        // Initialize with mock data if no local storage data
        const mockTxs = generateMockTransactions(PREDEFINED_CATEGORIES);
        setTransactions(mockTxs);
        setCategories(PREDEFINED_CATEGORIES); // Already set, but for clarity
        setBudgets(generateMockBudgets(PREDEFINED_CATEGORIES, mockTxs));
      }
    } catch (error) {
      console.error("Failed to load data from local storage", error);
      // Fallback to mock data on error
      const mockTxs = generateMockTransactions(PREDEFINED_CATEGORIES);
      setTransactions(mockTxs);
      setCategories(PREDEFINED_CATEGORIES);
      setBudgets(generateMockBudgets(PREDEFINED_CATEGORIES, mockTxs));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) { // Only save if not initial loading phase
        const appData: AppData = { transactions, categories: categories.filter(c => !c.isPredefined), budgets };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData));
    }
  }, [transactions, categories, budgets, isLoading]);

  const addTransaction = (transaction: Transaction) => setTransactions(prev => [...prev, transaction]);
  const updateTransaction = (updatedTransaction: Transaction) => setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
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


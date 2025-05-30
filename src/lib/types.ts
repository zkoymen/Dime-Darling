import type { LucideIcon } from 'lucide-react';

export interface Transaction {
  id: string;
  date: string; // ISO string e.g. "2024-07-15"
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string; // foreign key to Category
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: keyof typeof import('lucide-react')['icons'] | string; // Lucide icon name or custom SVG path
  color?: string; // Hex color for UI differentiation (e.g., '#FF5733')
  isPredefined?: boolean;
}

export interface Budget {
  id: string;
  categoryId: string; 
  categoryName?: string; // For display purposes
  limit: number;
  spent: number; // current spent amount for this budget period
  period: 'monthly' | 'yearly' | 'custom';
  startDate: string; // ISO string
  endDate?: string; // ISO string, optional for ongoing/monthly
}

export interface AppData {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
}

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};

export type CategorizationSuggestion = {
  suggestedCategory: string;
  confidence: number;
  reasoning?: string;
};

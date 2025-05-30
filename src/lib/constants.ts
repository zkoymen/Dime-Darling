import type { Category, NavItem } from '@/lib/types';
import { LayoutDashboard, ArrowLeftRight, Tags, Target, BarChart3, Landmark, Settings, ShoppingCart, Utensils, Car, Home, Heart, GraduationCap, Briefcase, Gift, Plane, Fuel, Shirt, Phone, Wifi, Tv, HandCoins, PiggyBank, Bitcoin } from 'lucide-react';

export const APP_NAME = "Dime Darling";

export const PREDEFINED_CATEGORIES: Category[] = [
  { id: 'cat_groceries', name: 'Groceries', icon: 'ShoppingCart', color: '#E040FB', isPredefined: true }, // Vibrant Pink
  { id: 'cat_utilities', name: 'Utilities', icon: 'Home', color: '#7E57C2', isPredefined: true }, // Medium Purple
  { id: 'cat_rent', name: 'Rent/Mortgage', icon: 'Landmark', color: '#BA68C8', isPredefined: true }, // Lighter Purple
  { id: 'cat_transport', name: 'Transportation', icon: 'Car', color: '#9575CD', isPredefined: true }, // Soft Purple
  { id: 'cat_dining', name: 'Dining Out', icon: 'Utensils', color: '#F06292', isPredefined: true }, // Soft Pink
  { id: 'cat_entertainment', name: 'Entertainment', icon: 'Tv', color: '#CE93D8', isPredefined: true }, // Lavender
  { id: 'cat_health', name: 'Healthcare', icon: 'Heart', color: '#F48FB1', isPredefined: true }, // Light Pink
  { id: 'cat_education', name: 'Education', icon: 'GraduationCap', color: '#AB47BC', isPredefined: true }, // Deeper Purple
  { id: 'cat_salary', name: 'Salary', icon: 'Briefcase', color: '#64B5F6', isPredefined: true }, // Kept a contrasting blue for income for clarity
  { id: 'cat_gifts', name: 'Gifts', icon: 'Gift', color: '#D1C4E9', isPredefined: true }, // Very Light Purple
  { id: 'cat_travel', name: 'Travel', icon: 'Plane', color: '#9FA8DA', isPredefined: true }, // Muted Indigo/Purple
  { id: 'cat_fuel', name: 'Fuel', icon: 'Fuel', color: '#CE93D8', isPredefined: true }, // Lavender (same as Entertainment)
  { id: 'cat_clothing', name: 'Clothing', icon: 'Shirt', color: '#F06292', isPredefined: true }, // Soft Pink (same as Dining)
  { id: 'cat_phone', name: 'Phone Bill', icon: 'Phone', color: '#BA68C8', isPredefined: true }, // Lighter Purple (same as Rent)
  { id: 'cat_internet', name: 'Internet Bill', icon: 'Wifi', color: '#9575CD', isPredefined: true }, // Soft Purple (same as Transport)
  { id: 'cat_investments', name: 'Investments', icon: 'PiggyBank', color: '#4DB6AC', isPredefined: true }, // Kept Teal for contrast
  { id: 'cat_freelance', name: 'Freelance Income', icon: 'HandCoins', color: '#81C784', isPredefined: true }, // Kept a contrasting green for income
  { id: 'cat_crypto', name: 'Crypto', icon: 'Bitcoin', color: '#FFF176', isPredefined: true }, // Kept Yellow for contrast
  { id: 'cat_other', name: 'Other', icon: 'Tags', color: '#BDBDBD', isPredefined: true }, // Neutral Gray
];


export const NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { title: 'Categories', href: '/categories', icon: Tags },
  { title: 'Budgets', href: '/budgets', icon: Target },
  { title: 'Reports', href: '/reports', icon: BarChart3 },
  // { title: 'Settings', href: '/settings', icon: Settings }, // Example for later
];

export const CURRENCY_SYMBOL = '$'; // Example, could be configurable

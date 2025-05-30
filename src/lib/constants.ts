import type { Category, NavItem } from '@/lib/types';
import { LayoutDashboard, ArrowLeftRight, Tags, Target, BarChart3, Landmark, Settings, ShoppingCart, Utensils, Car, Home, Heart, GraduationCap, Briefcase, Gift, Plane, Fuel, Shirt, Phone, Wifi, Tv, HandCoins, PiggyBank, Bitcoin } from 'lucide-react';

export const APP_NAME = "SpendWise";

export const PREDEFINED_CATEGORIES: Category[] = [
  { id: 'cat_groceries', name: 'Groceries', icon: 'ShoppingCart', color: '#4CAF50', isPredefined: true },
  { id: 'cat_utilities', name: 'Utilities', icon: 'Home', color: '#2196F3', isPredefined: true },
  { id: 'cat_rent', name: 'Rent/Mortgage', icon: 'Landmark', color: '#FFC107', isPredefined: true },
  { id: 'cat_transport', name: 'Transportation', icon: 'Car', color: '#9C27B0', isPredefined: true },
  { id: 'cat_dining', name: 'Dining Out', icon: 'Utensils', color: '#FF5722', isPredefined: true },
  { id: 'cat_entertainment', name: 'Entertainment', icon: 'Tv', color: '#E91E63', isPredefined: true },
  { id: 'cat_health', name: 'Healthcare', icon: 'Heart', color: '#F44336', isPredefined: true },
  { id: 'cat_education', name: 'Education', icon: 'GraduationCap', color: '#3F51B5', isPredefined: true },
  { id: 'cat_salary', name: 'Salary', icon: 'Briefcase', color: '#009688', isPredefined: true }, // Income
  { id: 'cat_gifts', name: 'Gifts', icon: 'Gift', color: '#795548', isPredefined: true },
  { id: 'cat_travel', name: 'Travel', icon: 'Plane', color: '#607D8B', isPredefined: true },
  { id: 'cat_fuel', name: 'Fuel', icon: 'Fuel', color: '#FF9800', isPredefined: true },
  { id: 'cat_clothing', name: 'Clothing', icon: 'Shirt', color: '#03A9F4', isPredefined: true },
  { id: 'cat_phone', name: 'Phone Bill', icon: 'Phone', color: '#8BC34A', isPredefined: true },
  { id: 'cat_internet', name: 'Internet Bill', icon: 'Wifi', color: '#CDDC39', isPredefined: true },
  { id: 'cat_investments', name: 'Investments', icon: 'PiggyBank', color: '#00BCD4', isPredefined: true },
  { id: 'cat_freelance', name: 'Freelance Income', icon: 'HandCoins', color: '#673AB7', isPredefined: true }, // Income
  { id: 'cat_crypto', name: 'Crypto', icon: 'Bitcoin', color: '#FFEB3B', isPredefined: true },
  { id: 'cat_other', name: 'Other', icon: 'Tags', color: '#9E9E9E', isPredefined: true },
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

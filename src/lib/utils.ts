
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as LucideIcons from 'lucide-react';
import type { LucideIcon, LucideProps } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ALL_LUCIDE_ICONS = Object.keys(LucideIcons).filter(
  (key) => key !== 'createReactComponent' && key !== 'icons' && key !== 'LucideIcon' && key !== 'default'
) as (keyof typeof LucideIcons)[];


export function getIconComponent(iconName: keyof typeof LucideIcons | string, props?: LucideProps): React.ReactElement | null {
  if (!iconName || typeof iconName !== 'string') return null;

  // Case 1: iconName is an SVG string
  if (iconName.startsWith('<svg')) {
    // For raw SVG strings, we primarily pass className.
    // Extract className and ignore any dangerouslySetInnerHTML from props to avoid conflicts.
    const { className, dangerouslySetInnerHTML: _ignoredFromProps } = props || {};
    return <span className={className} dangerouslySetInnerHTML={{ __html: iconName }}></span>;
  }

  // Case 2: iconName is a named Lucide icon
  // Cast iconName to keyof typeof LucideIcons for safer lookup.
  const LucideIconComponent = (LucideIcons as any)[iconName as keyof typeof LucideIcons] as LucideIcon | undefined;
  if (LucideIconComponent) {
    return <LucideIconComponent {...props} />;
  }

  // Case 3: iconName is not an SVG string and not a known Lucide icon (fallback)
  const FallbackIcon = LucideIcons.HelpCircle;
  return <FallbackIcon {...props} />;
}

// Helper to format currency
export const formatCurrency = (amount: number, currencySymbol: string = '$') => {
  const value = Math.abs(amount);
  const sign = amount < 0 ? '-' : (amount > 0 && currencySymbol === '$' ? '+' : ''); // '+' only for positive $ amounts for clarity in some contexts
  return `${sign}${currencySymbol}${value.toFixed(2)}`;
};

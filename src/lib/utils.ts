
import React from 'react'; // Ensure React is in scope
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
    // Using React.createElement to bypass potential JSX parsing issues for this specific case.
    const spanProps: { dangerouslySetInnerHTML: { __html: string }; className?: string } = {
        dangerouslySetInnerHTML: { __html: iconName }
    };
    // Default props to an empty object if undefined to allow safe destructuring
    const { className } = props || {}; 
    if (className) {
        spanProps.className = className;
    }
    // Note: Other props are intentionally omitted here for SVG strings
    // as they might not be applicable or could cause issues with the span wrapper.
    return React.createElement('span', spanProps);
  }

  // Case 2: iconName is a named Lucide icon
  // Cast iconName to keyof typeof LucideIcons for safer lookup.
  const LucideIconComponent = (LucideIcons as any)[iconName as keyof typeof LucideIcons] as LucideIcon | undefined;
  if (LucideIconComponent) {
    return React.createElement(LucideIconComponent, props);
  }

  // Case 3: iconName is not an SVG string and not a known Lucide icon (fallback)
  const FallbackIcon = LucideIcons.HelpCircle;
  return React.createElement(FallbackIcon, props);
}

// Helper to format currency
export const formatCurrency = (amount: number, currencySymbol: string = '$') => {
  const value = Math.abs(amount);
  const sign = amount < 0 ? '-' : (amount > 0 && currencySymbol === '$' ? '+' : '');
  return `${sign}${currencySymbol}${value.toFixed(2)}`;
};

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCSSVariable(propertyName: string): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return getComputedStyle(document.documentElement)
    .getPropertyValue(propertyName)
    .trim();
}

/** Форматирует число монет с разделителем тысяч (пробел): 15000 → "15 000" */
export function prettifyCoins(value: number): string {
  return value.toLocaleString('ru-RU', { useGrouping: true, maximumFractionDigits: 0 });
}

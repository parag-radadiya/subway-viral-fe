import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely using clsx + tailwind-merge.
 * The cn() utility is the cornerstone of dynamic Tailwind class composition.
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

/**
 * Format a number as a currency string (e.g. 1234.5 → "£1,234.50")
 */
export const formatCurrency = (
  amount: number,
  currency = "GBP",
  locale = "en-GB"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Truncate a string to a given max length, appending "…" if truncated.
 */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 1)}…`;
};

/**
 * Get user initials from a full name (e.g. "John Doe" → "JD")
 */
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Check if a JWT token has expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

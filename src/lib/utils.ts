
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Expense, TimePeriod } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getPercentage(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${((value / total) * 100).toFixed(2)}%`;
}

export function getCategoryColor(categoryName: string): string {
  const safeCategory = categoryName.toLowerCase().replace(/\s+/g, "-");
  return `category-${safeCategory}`;
}

export function getHexColor(categoryName: string): string {
  const colors: Record<string, string> = {
    groceries: "#4CAF50",
    dining: "#FF9800",
    transportation: "#9C27B0",
    entertainment: "#C2185B",
    shopping: "#039BE5",
    bills: "#F44336",
    healthcare: "#00BCD4",
    savings: "#FFEB3B",
    other: "#9C27B0",
  };
  
  const safeCategory = categoryName.toLowerCase().replace(/\s+/g, "-");
  return colors[safeCategory] || colors.other;
}

export function getTimeFilterDates(filter: TimePeriod): { start: Date; end: Date } {
  const end = new Date();
  let start = new Date();
  
  switch (filter) {
    case "3m":
      start.setMonth(end.getMonth() - 3);
      break;
    case "6m":
      start.setMonth(end.getMonth() - 6);
      break;
    case "1y":
      start.setFullYear(end.getFullYear() - 1);
      break;
    case "ytd":
      start = new Date(end.getFullYear(), 0, 1);
      break;
    case "all":
    default:
      start = new Date(0); // Beginning of time
      break;
  }
  
  return { start, end };
}

export function filterExpensesByDate(expenses: Expense[], filter: TimePeriod): Expense[] {
  const { start, end } = getTimeFilterDates(filter);
  
  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= start && expenseDate <= end;
  });
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function calculateRemainingBalance(
  allocatedAmount: number,
  expenses: Expense[],
  categoryId: string
): number {
  const categoryExpenses = expenses.filter(
    (expense) => expense.category_id === categoryId
  );
  
  const totalSpent = categoryExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  
  return allocatedAmount - totalSpent;
}

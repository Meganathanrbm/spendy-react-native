import { Transaction } from "../../types";
import { Category } from "../../types";
import { lastNDays, toDateKey } from "./date";

export type CategoryStat = {
  name: string;
  icon: string;
  color: string;
  amount: number;
  count: number;
  percent: number;
};

// Colors for categories not defined in the system — distinct from all named category colors
const UNKNOWN_CATEGORY_COLORS = [
  "#F43F5E", // rose
  "#FB923C", // orange-light
  "#A78BFA", // violet-light
  "#38BDF8", // sky
  "#E879F9", // fuchsia
  "#84CC16", // lime
  "#14B8A6", // teal
  "#FBBF24", // amber-light
];

// Deterministic color from name so the same category always gets the same color
function colorForUnknown(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return UNKNOWN_CATEGORY_COLORS[Math.abs(h) % UNKNOWN_CATEGORY_COLORS.length];
}

/** Aggregate expenses by category for a list of transactions */
export const getCategoryStats = (
  transactions: Transaction[],
  categories: Category[]
): CategoryStat[] => {
  const expenses = transactions.filter((t) => t.type === "expense");
  const total = expenses.reduce((s, t) => s + t.amount, 0);
  if (total === 0) return [];

  const map = new Map<string, { amount: number; count: number }>();
  for (const t of expenses) {
    const existing = map.get(t.category) ?? { amount: 0, count: 0 };
    map.set(t.category, {
      amount: existing.amount + t.amount,
      count: existing.count + 1,
    });
  }

  return Array.from(map.entries())
    .map(([name, stat]) => {
      const cat = categories.find((c) => c.name === name);
      return {
        name,
        icon: cat?.icon ?? "Package",
        color: cat?.color ?? colorForUnknown(name),
        amount: stat.amount,
        count: stat.count,
        percent: (stat.amount / total) * 100,
      };
    })
    .sort((a, b) => b.amount - a.amount);
};

/** Daily expense flow for the last 7 days */
export const getWeeklyFlow = (transactions: Transaction[]) => {
  const days = lastNDays(7);
  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return days.map((dateKey) => {
    const d = new Date(dateKey + "T00:00:00");
    const dayExpense = transactions
      .filter((t) => t.type === "expense" && toDateKey(t.date) === dateKey)
      .reduce((s, t) => s + t.amount, 0);
    return {
      day: DAY_LABELS[d.getDay()],
      date: dateKey,
      expense: dayExpense,
    };
  });
};

/** Daily expense flow for any pre-filtered set of transactions (period-agnostic) */
export const getPeriodFlow = (transactions: Transaction[]) => {
  const expenses = transactions.filter((t) => t.type === "expense");
  const map = new Map<string, number>();
  for (const t of expenses) {
    const key = toDateKey(t.date);
    map.set(key, (map.get(key) ?? 0) + t.amount);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, expense]) => {
      const d = new Date(date + "T00:00:00");
      const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return { day: DAY_LABELS[d.getDay()], date, expense };
    });
};

/** Daily expense flow across all days in a month */
export const getMonthlyFlow = (transactions: Transaction[], month: string) => {
  const expenses = transactions.filter(
    (t) => t.type === "expense" && t.date.startsWith(month)
  );

  const map = new Map<string, number>();
  for (const t of expenses) {
    const key = toDateKey(t.date);
    map.set(key, (map.get(key) ?? 0) + t.amount);
  }

  // Build sorted array of all dates with data
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, expense]) => {
      const d = new Date(date + "T00:00:00");
      const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return { day: DAY_LABELS[d.getDay()], date, expense };
    });
};

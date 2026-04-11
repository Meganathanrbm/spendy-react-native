/**
 * Returns current month as "YYYY-MM"
 */
export const currentMonth = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/**
 * "YYYY-MM" → "January 2025"
 */
export const formatMonthLabel = (month: string): string => {
  const [year, mon] = month.split("-");
  const date = new Date(Number(year), Number(mon) - 1, 1);
  return date.toLocaleString("en-IN", { month: "long", year: "numeric" });
};

/**
 * Step month forward or backward.
 * offsetMonths: +1 = next month, -1 = previous month
 */
export const stepMonth = (month: string, offsetMonths: number): string => {
  const [year, mon] = month.split("-").map(Number);
  const d = new Date(year, mon - 1 + offsetMonths, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/**
 * "YYYY-MM-DD" → "Jan 03, Sunday"
 */
export const formatDateGroupHeader = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.toLocaleString("en-IN", { weekday: "long" });
  const mon = date.toLocaleString("en-IN", { month: "short" });
  const d = String(date.getDate()).padStart(2, "0");
  return `${mon} ${d}, ${day}`;
};

/**
 * ISO string → "3:45 PM"
 */
export const formatTime = (iso: string): string => {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * ISO string → "Jan 21, 2025"
 */
export const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * ISO string → "YYYY-MM-DD"
 */
export const toDateKey = (iso: string): string => iso.slice(0, 10);

/**
 * Returns true if the date belongs to the given month "YYYY-MM"
 */
export const isInMonth = (iso: string, month: string): boolean =>
  iso.startsWith(month);

/**
 * Returns the last N days as "YYYY-MM-DD" strings, oldest first
 */
export const lastNDays = (n: number): string[] => {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
};

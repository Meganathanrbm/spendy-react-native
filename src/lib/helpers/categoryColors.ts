// Category → accent color map matching the Spendy 2.0 design palette.
// Each category gets a unique hue so the icon box tint is the only chromatic cue.

export const CATEGORY_COLORS: Record<string, string> = {
  // Expense categories
  Food: "#F59E0B",
  Groceries: "#34D399",
  Transport: "#FBBF24",
  Shopping: "#60A5FA",
  Bills: "#818CF8",
  Health: "#F472B6",
  Entertainment: "#A78BFA",
  Education: "#22D3EE",
  Travel: "#38BDF8",
  Rent: "#4ADE80",
  Other: "#94A3B8",
  // Income categories
  Salary: "#34D399",
  Freelance: "#22D3EE",
  Business: "#818CF8",
  Gift: "#F472B6",
  Returns: "#FBBF24",
  // Transfer
  Transfer: "#60A5FA",
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? "#94A3B8";
}

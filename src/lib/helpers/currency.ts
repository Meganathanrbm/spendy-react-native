/**
 * Format a number as Indian Rupee string.
 * e.g. 1234567.89 → "₹12,34,567.89"
 */
export const formatCurrency = (
  amount: number,
  options: { compact?: boolean; showSign?: boolean } = {}
): string => {
  const { compact = false, showSign = false } = options;

  const abs = Math.abs(amount);
  const sign = showSign ? (amount >= 0 ? "+" : "-") : amount < 0 ? "-" : "";

  if (compact) {
    if (abs >= 10_000_000) return `${sign}₹${(abs / 10_000_000).toFixed(2)}Cr`;
    if (abs >= 100_000)    return `${sign}₹${(abs / 100_000).toFixed(2)}L`;
    if (abs >= 1_000)      return `${sign}₹${(abs / 1_000).toFixed(1)}K`;
    return `${sign}₹${abs.toFixed(0)}`;
  }

  // Indian number formatting (lakhs, crores)
  const formatted = abs.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${sign}₹${formatted}`;
};

/**
 * Returns percentage string, e.g. "34.5%"
 */
export const formatPercent = (value: number, decimals = 1): string =>
  `${value.toFixed(decimals)}%`;

/**
 * Parses a string like "₹1,234.56" → 1234.56
 */
export const parseCurrency = (str: string): number => {
  const clean = str.replace(/[₹,\s]/g, "");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

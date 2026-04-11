export const lightColors = {
  // Backgrounds
  background: "#FAF7F2",
  surface: "#FFFFFF",
  surfaceAlt: "#F3EFE8",
  surfaceElevated: "#FFFFFF",

  // Brand
  primary: "#2D6A4F",
  primaryLight: "#52B788",
  primaryMuted: "#D8F3DC",

  // Semantic
  income: "#2D6A4F",
  incomeLight: "#D8F3DC",
  expense: "#E63946",
  expenseLight: "#FFE5E7",
  transfer: "#457B9D",
  transferLight: "#DBEAFE",

  // Text
  text: "#1A1A1A",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textInverse: "#FFFFFF",

  // Border & Divider
  border: "#EDE9E0",
  divider: "#F3EFE8",

  // Tab bar
  tabActive: "#2D6A4F",
  tabInactive: "#9CA3AF",
  tabBackground: "#FFFFFF",

  // Status
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  success: "#10B981",
  successLight: "#D1FAE5",
  error: "#E63946",
  errorLight: "#FFE5E7",

  // Chart palette (category colors)
  chart: [
    "#2D6A4F",
    "#E63946",
    "#457B9D",
    "#F59E0B",
    "#8B5CF6",
    "#06B6D4",
    "#EC4899",
    "#84CC16",
    "#F97316",
    "#6366F1",
  ],

  // Overlays
  overlay: "rgba(0,0,0,0.5)",
  shimmer: "#E9E4DC",
};

export const darkColors: typeof lightColors = {
  // Backgrounds
  background: "#0F1117",
  surface: "#1C1E26",
  surfaceAlt: "#252830",
  surfaceElevated: "#2A2D38",

  // Brand
  primary: "#52B788",
  primaryLight: "#74C69D",
  primaryMuted: "#1B3A2D",

  // Semantic
  income: "#52B788",
  incomeLight: "#1B3A2D",
  expense: "#FF6B6B",
  expenseLight: "#3D1A1A",
  transfer: "#64B5F6",
  transferLight: "#1A2A3D",

  // Text
  text: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#4A5568",
  textInverse: "#0F1117",

  // Border & Divider
  border: "#2D3748",
  divider: "#1E2330",

  // Tab bar
  tabActive: "#52B788",
  tabInactive: "#4A5568",
  tabBackground: "#1C1E26",

  // Status
  warning: "#FBBF24",
  warningLight: "#2D2007",
  success: "#34D399",
  successLight: "#0A2E1E",
  error: "#FF6B6B",
  errorLight: "#3D1A1A",

  // Chart palette
  chart: [
    "#52B788",
    "#FF6B6B",
    "#64B5F6",
    "#FBBF24",
    "#A78BFA",
    "#22D3EE",
    "#F472B6",
    "#A3E635",
    "#FB923C",
    "#818CF8",
  ],

  // Overlays
  overlay: "rgba(0,0,0,0.7)",
  shimmer: "#252830",
};

export type AppColors = typeof lightColors;

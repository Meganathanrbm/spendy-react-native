// Spendy 2.0 — Near-monochrome dark design system
// Accent: Emerald (#34D399). Three surfaces, one accent, monospaced numerals.

export const lightColors = {
  // Backgrounds
  background: "#FAF7F2",
  surface: "#FFFFFF",
  surfaceAlt: "#F3EFE8",
  surface2: "#F3EFE8",
  surfaceElevated: "#FFFFFF",
  surface3: "#EDE9E0",

  // Brand
  primary: "#2D6A4F",
  primaryLight: "#52B788",
  primaryMuted: "#D8F3DC",
  primaryDim: "#52B788",

  // Semantic
  income: "#2D6A4F",
  incomeLight: "#D8F3DC",
  expense: "#1A1A1A",
  expenseLight: "#F3EFE8",
  expenseAccent: "#E63946",
  transfer: "#457B9D",
  transferLight: "#DBEAFE",

  // Text
  text: "#1A1A1A",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textFaint: "#C4C4C4",
  textInverse: "#FFFFFF",

  // Border & Divider
  border: "#EDE9E0",
  borderStrong: "#D5D0C8",
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
  negative: "#E63946",

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

// Spendy 2.0 — Notion/Vercel-flavored near-black dark theme
export const darkColors: typeof lightColors = {
  // Backgrounds — 3 surface levels, elevation via color shift only (no shadows)
  background: "#0A0A0A",   // Page / screen bg
  surface: "#101010",      // Cards, list items
  surfaceAlt: "#161616",   // Inputs, nested cards
  surface2: "#161616",     // Inputs, nested surfaces
  surfaceElevated: "#1C1C1C", // Hover / pressed
  surface3: "#1C1C1C",    // Active / pressed states

  // Brand — Emerald accent (income, primary actions)
  primary: "#34D399",
  primaryLight: "#10B981",
  primaryMuted: "#0F2A22",
  primaryDim: "#10B981",

  // Semantic
  income: "#34D399",
  incomeLight: "#0F2A22",
  // expense is intentionally neutral — the minus sign carries meaning, not red
  expense: "#EDEDED",
  expenseLight: "#1C1C1C",
  expenseAccent: "#F87171", // danger UI only: delete buttons, over-budget
  transfer: "#60A5FA",
  transferLight: "#1A2440",

  // Text — 4-level hierarchy
  text: "#EDEDED",          // Primary body
  textSecondary: "#A1A1A1", // Secondary labels
  textMuted: "#5A5A5A",     // Captions, section labels
  textFaint: "#3A3A3A",     // Disabled / placeholder
  textInverse: "#0A0A0A",   // Text on primary bg

  // Border & Divider — hairline only
  border: "#1F1F1F",
  borderStrong: "#2A2A2A",
  divider: "#1F1F1F",

  // Tab bar
  tabActive: "#34D399",
  tabInactive: "#5A5A5A",
  tabBackground: "#0A0A0A",

  // Status
  warning: "#FBBF24",
  warningLight: "#2D2007",
  success: "#34D399",
  successLight: "#0F2A22",
  error: "#F87171",
  errorLight: "#2A1010",
  negative: "#F87171",

  // Chart palette — category colors (chromatic differentiation)
  chart: [
    "#34D399", // emerald — income / Groceries / Salary
    "#F59E0B", // amber  — Food / Transport
    "#FBBF24", // yellow
    "#60A5FA", // blue   — Shopping / Transfer
    "#818CF8", // indigo — Bills / Business
    "#F472B6", // pink   — Health / Gift
    "#A78BFA", // violet — Entertainment / PPF
    "#22D3EE", // cyan   — Education / Freelance
    "#38BDF8", // sky    — Travel
    "#94A3B8", // slate  — Other
  ],

  // Overlays
  overlay: "rgba(0,0,0,0.72)",
  shimmer: "#161616",
};

export type AppColors = typeof darkColors;

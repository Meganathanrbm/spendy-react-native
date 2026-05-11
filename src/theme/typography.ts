export const typography = {
  // Font family
  family: {
    sans: undefined, // system default (Geist on device, system sans elsewhere)
    mono: "monospace" as const, // all amounts, %, dates — tabular-nums
  },

  // Type scale (px → pt in RN is 1:1 on most devices)
  size: {
    xs: 10.5, // section labels, badges (UPPERCASE)
    sm: 11.5, // captions, sub-labels, time stamps
    base: 13, // body / transaction titles
    md: 14, // list primary text
    lg: 15, // card headings
    xl: 18, // screen section titles
    "2xl": 22, // account balance, summary numbers
    "3xl": 28, // hero amounts (add transaction)
    "4xl": 34, // display (large balance)
    "24": 24,
  },

  // Font weights
  weight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },

  // Letter spacing (tracking)
  tracking: {
    tightest: -1.2, // large display numbers
    tight: -0.4, // headings
    normal: 0,
    wide: 0.5,
    wider: 0.8, // section labels in uppercase
    widest: 1.2, // caps labels
  },
} as const;

export type Typography = typeof typography;

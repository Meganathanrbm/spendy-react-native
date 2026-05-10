// Spendy 2.0 Spacing — 4px base unit
export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// Semantic layout tokens
export const layout = {
  screenPadding: 16,
  cardPadding: 16,
  // Spendy 2.0 radii: 6 input, 10 small card, 12 card, 14 large card, 20 sheet
  cardRadius: 12,
  cardRadiusSm: 10,
  cardRadiusLg: 14,
  sheetRadius: 20,
  inputRadius: 10,
  iconRadius: 10,    // icon box default (size * 0.32)
  sectionGap: 20,
  itemGap: 10,
  iconSize: 36,
  iconSizeSm: 28,
  iconSizeLg: 48,
  tabBarHeight: 64,
  headerHeight: 52,
  fabSize: 52,
  fabRadius: 14,
} as const;

export type Spacing = typeof spacing;

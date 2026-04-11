// 4px base unit scale
export const spacing = {
  0: 0,
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

// Semantic aliases
export const layout = {
  screenPadding: 16,
  cardPadding: 16,
  cardRadius: 16,
  cardRadiusSm: 10,
  cardRadiusLg: 24,
  sectionGap: 24,
  itemGap: 12,
  iconSize: 40,
  iconSizeSm: 32,
  iconSizeLg: 48,
  tabBarHeight: 64,
  headerHeight: 56,
} as const;

export type Spacing = typeof spacing;

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency, formatPercent } from "../../lib/helpers/currency";

type Props = {
  icon: string;
  name: string;
  amount: number;
  percent: number;
  color: string;
  count: number;
};

export default function CategoryBreakdownItem({
  icon,
  name,
  amount,
  percent,
  color,
  count,
}: Props) {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: colors.divider }]}>
      {/* Icon */}
      <View style={[styles.iconBox, { backgroundColor: color + "22" }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text
            style={[
              styles.name,
              { color: colors.text, fontSize: typography.size.base, fontWeight: typography.weight.medium },
            ]}
          >
            {name}
          </Text>
          <Text
            style={[
              styles.amount,
              { color: colors.expense, fontSize: typography.size.base, fontWeight: typography.weight.semibold },
            ]}
          >
            -{formatCurrency(amount)}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={[styles.barBg, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(percent, 100)}%`, backgroundColor: color },
            ]}
          />
        </View>

        <View style={styles.bottomRow}>
          <Text style={[styles.count, { color: colors.textMuted, fontSize: typography.size.xs }]}>
            {count} transaction{count !== 1 ? "s" : ""}
          </Text>
          <Text style={[styles.percent, { color: color, fontSize: typography.size.xs, fontWeight: typography.weight.semibold }]}>
            {formatPercent(percent)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconText: { fontSize: 20 },
  info: { flex: 1, gap: 5 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {},
  amount: {},
  barBg: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  count: {},
  percent: {},
});

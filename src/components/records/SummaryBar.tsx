import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../lib/helpers/currency";

type Props = {
  income: number;
  expense: number;
};

const SummaryBar = memo(function SummaryBar({ income, expense }: Props) {
  const { colors } = useTheme();
  const net = income - expense;

  const items = [
    { label: "INCOME",  value: income,  color: colors.primary,     sign: "" },
    { label: "EXPENSE", value: expense, color: colors.textSecondary, sign: "" },
    {
      label: "NET",
      value: Math.abs(net),
      color: net >= 0 ? colors.primary : colors.expenseAccent,
      sign: net >= 0 ? "+" : "−",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          <View style={styles.item}>
            <Text style={[styles.label, { color: colors.textMuted }]}>{item.label}</Text>
            <Text style={[styles.value, { color: item.color }]}>
              {item.sign}{formatCurrency(item.value, { compact: true })}
            </Text>
          </View>
          {i < items.length - 1 && (
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
});

export default SummaryBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  item: { flex: 1, alignItems: "center", gap: 3 },
  label: { fontSize: 10, fontWeight: "600", letterSpacing: 0.8 },
  value: { fontSize: 14, fontWeight: "600", letterSpacing: -0.2, fontVariant: ["tabular-nums"] },
  divider: { width: StyleSheet.hairlineWidth, height: 28, marginHorizontal: 4 },
});

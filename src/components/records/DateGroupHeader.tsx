import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { formatDateGroupHeader } from "../../lib/helpers/date";
import { formatCurrency } from "../../lib/helpers/currency";
import { layout } from "../../theme/spacing";
import { Transaction } from "../../types";

type Props = {
  date: string; // "YYYY-MM-DD"
  transactions: Transaction[];
};

export default function DateGroupHeader({ date, transactions }: Props) {
  const { colors, typography } = useTheme();

  // Daily totals
  const dayIncome  = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const dayExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surfaceAlt },
      ]}
    >
      <Text
        style={[
          styles.dateLabel,
          {
            color: colors.textSecondary,
            fontSize: typography.size.xs,
            fontWeight: typography.weight.semibold,
            letterSpacing: typography.tracking.wide,
          },
        ]}
      >
        {formatDateGroupHeader(date).toUpperCase()}
      </Text>

      <View style={styles.totals}>
        {dayIncome > 0 && (
          <Text style={[styles.total, { color: colors.income, fontSize: typography.size.xs }]}>
            +{formatCurrency(dayIncome, { compact: true })}
          </Text>
        )}
        {dayExpense > 0 && (
          <Text style={[styles.total, { color: colors.expense, fontSize: typography.size.xs }]}>
            -{formatCurrency(dayExpense, { compact: true })}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 6,
  },
  dateLabel: {},
  totals: {
    flexDirection: "row",
    gap: 8,
  },
  total: {
    fontWeight: "600",
  },
});

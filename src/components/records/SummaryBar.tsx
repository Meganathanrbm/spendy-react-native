import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../lib/helpers/currency";

type Props = {
  income: number;
  expense: number;
};

const SummaryBar = memo(function SummaryBar({ income, expense }: Props) {
  const { colors, typography } = useTheme();
  const net = income - expense;

  const items = [
    { label: "INCOME",  value: income,  color: colors.income },
    { label: "EXPENSE", value: expense, color: colors.expense },
    { label: "NET",     value: net,     color: net >= 0 ? colors.income : colors.expense },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          <View style={styles.item}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.textMuted,
                  fontSize: typography.size.xs,
                  letterSpacing: typography.tracking.wider,
                },
              ]}
            >
              {item.label}
            </Text>
            <Text
              style={[
                styles.value,
                {
                  color: item.color,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.semibold,
                },
              ]}
            >
              {formatCurrency(item.value)}
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
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  label: {
    fontWeight: "600",
  },
  value: {},
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    marginHorizontal: 4,
  },
});

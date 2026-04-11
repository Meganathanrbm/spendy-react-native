import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../lib/helpers/currency";
import { formatTime } from "../../lib/helpers/date";
import { Transaction } from "../../types";
import { layout } from "../../theme/spacing";

type Props = {
  transaction: Transaction;
  onLongPress?: () => void;
};

export default function TransactionItem({ transaction, onLongPress }: Props) {
  const { colors, typography } = useTheme();

  const isExpense = transaction.type === "expense";
  const isTransfer = transaction.type === "transfer";
  const amountColor = isTransfer
    ? colors.transfer
    : isExpense
    ? colors.expense
    : colors.income;

  const amountPrefix = isExpense ? "-" : isTransfer ? "↔" : "+";

  // Icon background: soft tint of amount color
  const iconBg = isTransfer
    ? colors.transferLight
    : isExpense
    ? colors.expenseLight
    : colors.incomeLight;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={[styles.container, { borderBottomColor: colors.divider }]}
    >
      {/* Icon */}
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <Text style={styles.iconText}>{transaction.icon}</Text>
      </View>

      {/* Details */}
      <View style={styles.middle}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontSize: typography.size.base,
              fontWeight: typography.weight.medium,
            },
          ]}
          numberOfLines={1}
        >
          {transaction.title}
        </Text>
        <Text
          style={[
            styles.meta,
            { color: colors.textMuted, fontSize: typography.size.xs },
          ]}
        >
          {transaction.category}
          {"  ·  "}
          {formatTime(transaction.date)}
        </Text>
      </View>

      {/* Amount */}
      <Text
        style={[
          styles.amount,
          {
            color: amountColor,
            fontSize: typography.size.base,
            fontWeight: typography.weight.semibold,
          },
        ]}
      >
        {amountPrefix}
        {formatCurrency(transaction.amount)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconBox: {
    width: layout.iconSize,
    height: layout.iconSize,
    borderRadius: layout.iconSize / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 18,
  },
  middle: {
    flex: 1,
    gap: 3,
  },
  title: {},
  meta: {},
  amount: {},
});

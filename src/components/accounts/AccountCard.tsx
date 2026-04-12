import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../lib/helpers/currency";
import { Account } from "../../types";
import { layout } from "../../theme/spacing";

type Props = {
  account: Account;
  onSetPrimary: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: "Savings Account",
  current: "Current Account",
  credit: "Credit Card",
  wallet: "Wallet",
  cash: "Cash",
  investment: "Investment",
};

export default function AccountCard({ account, onSetPrimary, onEdit, onDelete }: Props) {
  const { colors, typography } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: account.isPrimary ? account.color : colors.border,
          borderWidth: account.isPrimary ? 1.5 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      {/* Primary badge */}
      {account.isPrimary && (
        <View style={[styles.primaryBadge, { backgroundColor: account.color }]}>
          <Text style={styles.primaryBadgeText}>PRIMARY</Text>
        </View>
      )}

      <View style={styles.row}>
        {/* Icon */}
        <View style={[styles.iconBox, { backgroundColor: account.color + "22" }]}>
          <Text style={styles.iconText}>{account.icon}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text
            style={[
              styles.name,
              { color: colors.text, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
            ]}
          >
            {account.name}
          </Text>
          <Text style={[styles.type, { color: colors.textMuted, fontSize: typography.size.xs }]}>
            {ACCOUNT_TYPE_LABELS[account.type] ?? account.type}
            {account.lastFourDigits ? `  ··${account.lastFourDigits}` : ""}
          </Text>
        </View>

        {/* Balance */}
        <View style={styles.balanceCol}>
          <Text
            style={[
              styles.balance,
              {
                color: account.balance >= 0 ? colors.text : colors.expense,
                fontSize: typography.size.lg,
                fontWeight: typography.weight.bold,
              },
            ]}
          >
            {formatCurrency(account.balance)}
          </Text>
        </View>
      </View>

      {/* Action row */}
      <View style={[styles.actions, { borderTopColor: colors.divider }]}>
        {!account.isPrimary && (
          <TouchableOpacity onPress={onSetPrimary} style={styles.actionBtn} activeOpacity={0.7}>
            <Ionicons name="star-outline" size={14} color={colors.primary} />
            <Text style={[styles.actionLabel, { color: colors.primary, fontSize: typography.size.xs }]}>
              Set Primary
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onEdit} style={styles.actionBtn} activeOpacity={0.7}>
          <Ionicons name="create-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.actionLabel, { color: colors.textSecondary, fontSize: typography.size.xs }]}>
            Edit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.actionBtn} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={14} color={colors.expense} />
          <Text style={[styles.actionLabel, { color: colors.expense, fontSize: typography.size.xs }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: layout.screenPadding,
    marginBottom: 12,
    borderRadius: layout.cardRadius,
    overflow: "hidden",
  },
  primaryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
    borderBottomRightRadius: 8,
  },
  primaryBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    paddingTop: 12,
    gap: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 22 },
  info: { flex: 1 },
  name: {},
  type: { marginTop: 2 },
  balanceCol: { alignItems: "flex-end" },
  balance: {},
  actions: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  actionLabel: { fontWeight: "600" },
});

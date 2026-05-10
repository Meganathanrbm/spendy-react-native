import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Star } from "lucide-react-native";
import { getAccountTypeIcon } from "../../lib/helpers/categoryIcons";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../lib/helpers/currency";
import { Account } from "../../types";
import { layout } from "../../theme/spacing";

type Props = {
  account: Account;
  onSetPrimary: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: "Savings Account",
  current: "Current Account",
  credit: "Credit Card",
  wallet: "Wallet",
  cash: "Cash",
  investment: "Investment",
};

const AccountCard = memo(function AccountCard({
  account,
  onSetPrimary,
  onEdit,
}: Props) {
  const { colors, typography } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onEdit(account.id)}
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
        <View
          style={[styles.iconBox, { backgroundColor: account.color + "22" }]}
        >
          {(() => { const Icon = getAccountTypeIcon(account.type); return <Icon size={22} color={account.color} strokeWidth={1.7} />; })()}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text
            style={[
              styles.name,
              {
                color: colors.text,
                fontSize: typography.size.md,
                fontWeight: typography.weight.semibold,
              },
            ]}
          >
            {account.name}
          </Text>
          <Text
            style={[
              styles.type,
              { color: colors.textMuted, fontSize: typography.size.xs },
            ]}
          >
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
          <TouchableOpacity
            onPress={() => onSetPrimary(account.id)}
            style={styles.actionBtn}
            activeOpacity={0.7}
          >
            <Star size={14} color={colors.primary} strokeWidth={1.7} />
            <Text
              style={[
                styles.actionLabel,
                { color: colors.primary, fontSize: typography.size.xs },
              ]}
            >
              Set Primary
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default AccountCard;

const styles = StyleSheet.create({
  card: {
    marginBottom: 4,
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

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../lib/helpers/currency";
import { getAccountTypeIcon } from "../../lib/helpers/categoryIcons";
import { Account } from "../../types";
import { layout } from "../../theme/spacing";

type Props = {
  account: Account | null;
  income?: number;
  expense?: number;
  onPress?: () => void;
};

export default function AccountBanner({ account, onPress }: Props) {
  const { colors, typography } = useTheme();

  if (!account) return null;

  // Use account's own color for icon tinting, fall back to primary
  const accentColor = account.color || colors.primary;
  const AccountIcon = getAccountTypeIcon(account.type);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.row}>
        {/* Icon box — account-color tinted rounded square */}
        <View style={[styles.iconBox, { backgroundColor: accentColor + "22" }]}>
          <AccountIcon size={20} color={accentColor} strokeWidth={1.7} />
        </View>

        {/* Balance col */}
        <View style={styles.balanceCol}>
          <View style={styles.primaryRow}>
            <Text style={[styles.primaryLabel, { color: colors.textMuted }]}>PRIMARY</Text>
            <View style={[styles.dot, { backgroundColor: accentColor }]} />
          </View>
          <Text
            style={[
              styles.balance,
              { color: colors.text, fontSize: typography.size["2xl"], fontWeight: typography.weight.semibold },
            ]}
          >
            {formatCurrency(account.balance)}
          </Text>
        </View>

        {/* Account name + last four */}
        <View style={styles.accountInfo}>
          <Text
            style={[styles.accountName, { color: colors.text, fontSize: typography.size.sm, fontWeight: typography.weight.medium }]}
            numberOfLines={1}
          >
            {account.name}
          </Text>
          <Text style={[styles.accountSub, { color: colors.textMuted }]}>
            {account.lastFourDigits ? `•• ${account.lastFourDigits}` : account.type}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const ICON_SIZE = 40;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: layout.screenPadding,
    marginTop: 14,
    marginBottom: 4,
    borderRadius: layout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconBox: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: Math.round(ICON_SIZE * 0.3),
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  balanceCol: { flex: 1 },
  primaryRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  primaryLabel: { fontSize: 10, fontWeight: "600", letterSpacing: 0.8 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  balance: { marginTop: 2, letterSpacing: -0.6, fontVariant: ["tabular-nums"] },
  accountInfo: { alignItems: "flex-end", maxWidth: 110 },
  accountName: { letterSpacing: -0.1 },
  accountSub: { fontSize: 10.5, marginTop: 2, fontVariant: ["tabular-nums"] },
});

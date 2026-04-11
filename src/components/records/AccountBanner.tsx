import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../lib/helpers/currency";
import { Account } from "../../types";
import { layout } from "../../theme/spacing";

type Props = {
  account: Account | null;
  income: number;
  expense: number;
  onPress?: () => void;
};

export default function AccountBanner({ account, income, expense, onPress }: Props) {
  const { colors, typography } = useTheme();

  if (!account) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.primary }]}
    >
      {/* Top row — account name + chevron */}
      <View style={styles.topRow}>
        <View style={styles.accountLabel}>
          <Text style={[styles.icon]}>{account.icon}</Text>
          <View>
            <Text
              style={[
                styles.accountName,
                { color: "rgba(255,255,255,0.75)", fontSize: typography.size.xs },
              ]}
            >
              {account.type.toUpperCase()} · PRIMARY
            </Text>
            <Text
              style={[
                styles.accountName,
                {
                  color: "#fff",
                  fontSize: typography.size.md,
                  fontWeight: typography.weight.semibold,
                },
              ]}
            >
              {account.name}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.5)" />
      </View>

      {/* Balance */}
      <Text
        style={[
          styles.balance,
          {
            color: "#fff",
            fontSize: typography.size["3xl"],
            fontWeight: typography.weight.bold,
          },
        ]}
      >
        {formatCurrency(account.balance)}
      </Text>

      {/* Income / Expense row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <View style={styles.statIcon}>
            <Ionicons name="arrow-down" size={12} color={colors.incomeLight} />
          </View>
          <View>
            <Text style={[styles.statLabel, { color: "rgba(255,255,255,0.6)" }]}>
              Income
            </Text>
            <Text
              style={[
                styles.statValue,
                { color: "#fff", fontWeight: typography.weight.semibold },
              ]}
            >
              {formatCurrency(income)}
            </Text>
          </View>
        </View>

        <View style={[styles.statDivider, { backgroundColor: "rgba(255,255,255,0.15)" }]} />

        <View style={styles.stat}>
          <View style={[styles.statIcon, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Ionicons name="arrow-up" size={12} color="rgba(255,255,255,0.8)" />
          </View>
          <View>
            <Text style={[styles.statLabel, { color: "rgba(255,255,255,0.6)" }]}>
              Expense
            </Text>
            <Text
              style={[
                styles.statValue,
                { color: "#fff", fontWeight: typography.weight.semibold },
              ]}
            >
              {formatCurrency(expense)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: layout.screenPadding,
    marginVertical: 12,
    borderRadius: layout.cardRadius,
    padding: 20,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accountLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    fontSize: 28,
  },
  accountName: {},
  balance: {
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  stat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 11,
  },
  statValue: {
    fontSize: 13,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
});

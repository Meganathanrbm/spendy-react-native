import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency, formatPercent } from "../../lib/helpers/currency";
import { Asset } from "../../types";
import { layout } from "../../theme/spacing";

type Props = {
  asset: Asset;
  onEdit: () => void;
  onDelete: () => void;
};

export const ASSET_TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  stocks:        { label: "Stocks",          icon: "📊", color: "#6366F1" },
  mutual_fund:   { label: "Mutual Fund",     icon: "📈", color: "#2D6A4F" },
  fixed_deposit: { label: "Fixed Deposit",   icon: "🏦", color: "#457B9D" },
  gold:          { label: "Gold",            icon: "🥇", color: "#F59E0B" },
  ppf:           { label: "PPF",             icon: "🏛️", color: "#8B5CF6" },
  nps:           { label: "NPS",             icon: "🏢", color: "#06B6D4" },
  epf:           { label: "EPF",             icon: "🏗️", color: "#10B981" },
  crypto:        { label: "Crypto",          icon: "₿",  color: "#F97316" },
  real_estate:   { label: "Real Estate",     icon: "🏠", color: "#EC4899" },
  other:         { label: "Other",           icon: "📦", color: "#64748B" },
};

export default function AssetCard({ asset, onEdit, onDelete }: Props) {
  const { colors, typography } = useTheme();

  const meta = ASSET_TYPE_META[asset.type] ?? ASSET_TYPE_META.other;
  const returns = asset.currentValue - asset.investedAmount;
  const returnsPercent = asset.investedAmount > 0
    ? (returns / asset.investedAmount) * 100
    : 0;
  const isPositive = returns >= 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: meta.color + "22" }]}>
          <Text style={styles.icon}>{meta.icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text, fontSize: typography.size.base, fontWeight: typography.weight.semibold }]} numberOfLines={1}>
            {asset.name}
          </Text>
          <Text style={[styles.type, { color: colors.textMuted, fontSize: typography.size.xs }]}>
            {meta.label}
            {asset.broker ? `  ·  ${asset.broker}` : ""}
            {asset.interestRate ? `  ·  ${asset.interestRate}% p.a.` : ""}
          </Text>
        </View>
        <View style={styles.menuBtns}>
          <TouchableOpacity onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={16} color={colors.expense} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Values row */}
      <View style={[styles.valuesRow, { backgroundColor: colors.surfaceAlt, borderRadius: 10 }]}>
        <View style={styles.valueCol}>
          <Text style={[styles.valueLabel, { color: colors.textMuted }]}>Invested</Text>
          <Text style={[styles.valueAmount, { color: colors.text, fontWeight: typography.weight.semibold }]}>
            {formatCurrency(asset.investedAmount)}
          </Text>
        </View>
        <View style={[styles.valueDivider, { backgroundColor: colors.border }]} />
        <View style={styles.valueCol}>
          <Text style={[styles.valueLabel, { color: colors.textMuted }]}>Current</Text>
          <Text style={[styles.valueAmount, { color: colors.text, fontWeight: typography.weight.bold }]}>
            {formatCurrency(asset.currentValue)}
          </Text>
        </View>
        <View style={[styles.valueDivider, { backgroundColor: colors.border }]} />
        <View style={styles.valueCol}>
          <Text style={[styles.valueLabel, { color: colors.textMuted }]}>Returns</Text>
          <Text style={[styles.valueAmount, { color: isPositive ? colors.income : colors.expense, fontWeight: typography.weight.bold }]}>
            {isPositive ? "+" : ""}{formatCurrency(returns, { compact: true })}
          </Text>
          <Text style={[styles.returnsPercent, { color: isPositive ? colors.income : colors.expense }]}>
            {isPositive ? "▲" : "▼"} {formatPercent(Math.abs(returnsPercent))}
          </Text>
        </View>
      </View>

      {/* Extra details */}
      {(asset.units || asset.maturityDate || asset.folioNumber) && (
        <View style={styles.detailsRow}>
          {asset.units && (
            <View style={styles.detailChip}>
              <Text style={[styles.detailText, { color: colors.textSecondary, fontSize: typography.size.xs }]}>
                {asset.units} units
                {asset.currentPrice ? `  @  ${formatCurrency(asset.currentPrice, { compact: true })}` : ""}
              </Text>
            </View>
          )}
          {asset.maturityDate && (
            <View style={styles.detailChip}>
              <Ionicons name="calendar-outline" size={11} color={colors.textMuted} />
              <Text style={[styles.detailText, { color: colors.textSecondary, fontSize: typography.size.xs }]}>
                Matures {new Date(asset.maturityDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
              </Text>
            </View>
          )}
          {asset.folioNumber && (
            <View style={styles.detailChip}>
              <Text style={[styles.detailText, { color: colors.textSecondary, fontSize: typography.size.xs }]}>
                Folio {asset.folioNumber}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: layout.screenPadding,
    marginBottom: 10,
    borderRadius: layout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 10,
  },
  topRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBox: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 20 },
  info: { flex: 1 },
  name: {},
  type: { marginTop: 2 },
  menuBtns: { flexDirection: "row", gap: 10 },
  valuesRow: { flexDirection: "row", padding: 10, gap: 4 },
  valueCol: { flex: 1, alignItems: "center", gap: 2 },
  valueLabel: { fontSize: 10, fontWeight: "600", letterSpacing: 0.3 },
  valueAmount: { fontSize: 13 },
  returnsPercent: { fontSize: 10, fontWeight: "600" },
  valueDivider: { width: 1, marginVertical: 2 },
  detailsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  detailChip: { flexDirection: "row", alignItems: "center", gap: 3 },
  detailText: {},
});

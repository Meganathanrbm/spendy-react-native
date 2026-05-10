import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Pencil, Trash2, TriangleAlert } from "lucide-react-native";
import { getCategoryIcon } from "../../lib/helpers/categoryIcons";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency, formatPercent } from "../../lib/helpers/currency";
import { layout } from "../../theme/spacing";

export type BudgetCardData = {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  limit: number;
  spent: number;
  month: string;
  budgetId: string;
};

type Props = {
  data: BudgetCardData;
  onEdit: () => void;
  onDelete: () => void;
};

export default function BudgetCard({ data, onEdit, onDelete }: Props) {
  const { colors, typography } = useTheme();

  const { categoryName, categoryIcon, categoryColor, limit, spent } = data;
  const remaining = limit - spent;
  const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const isExceeded = spent > limit;
  const isWarning = !isExceeded && percent >= 80;

  const barColor = isExceeded
    ? colors.expense
    : isWarning
    ? colors.warning
    : categoryColor;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isExceeded ? colors.expenseLight : colors.border,
          borderWidth: isExceeded ? 1.5 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.left}>
          <View style={[styles.iconBox, { backgroundColor: categoryColor + "22" }]}>
            {(() => { const Icon = getCategoryIcon(categoryName); return <Icon size={20} color={categoryColor} strokeWidth={1.7} />; })()}
          </View>
          <View>
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
              {categoryName}
            </Text>
            <Text style={[styles.month, { color: colors.textMuted, fontSize: typography.size.xs }]}>
              {data.month}
            </Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Pencil size={16} color={colors.textSecondary} strokeWidth={1.7} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash2 size={16} color={colors.expense} strokeWidth={1.7} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Limit display */}
      <View style={styles.limitRow}>
        <Text style={[styles.limitLabel, { color: colors.textMuted, fontSize: typography.size.xs }]}>
          Limit{" "}
          <Text style={{ color: colors.text, fontWeight: typography.weight.semibold }}>
            {formatCurrency(limit)}
          </Text>
        </Text>
        <Text style={[styles.limitLabel, { color: colors.textMuted, fontSize: typography.size.xs }]}>
          Spent{" "}
          <Text style={{ color: colors.expense, fontWeight: typography.weight.semibold }}>
            {formatCurrency(spent)}
          </Text>
        </Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.barBg, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.barFill,
            { width: `${percent}%`, backgroundColor: barColor },
          ]}
        />
        {/* Limit marker */}
        <View style={[styles.limitMarker, { backgroundColor: colors.textMuted }]} />
      </View>

      {/* Remaining / Exceeded */}
      <View style={styles.bottomRow}>
        {isExceeded ? (
          <View style={styles.exceededBadge}>
            <TriangleAlert size={12} color={colors.expense} strokeWidth={1.7} />
            <Text style={[styles.exceededText, { color: colors.expense, fontSize: typography.size.xs }]}>
              Limit exceeded by {formatCurrency(Math.abs(remaining))}
            </Text>
          </View>
        ) : (
          <Text style={[styles.remaining, { color: colors.textSecondary, fontSize: typography.size.xs }]}>
            Remaining{" "}
            <Text
              style={{
                color: isWarning ? colors.warning : colors.income,
                fontWeight: typography.weight.semibold,
              }}
            >
              {formatCurrency(remaining)}
            </Text>
          </Text>
        )}
        <Text
          style={[
            styles.percent,
            {
              color: barColor,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.bold,
            },
          ]}
        >
          {formatPercent(percent, 0)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: layout.screenPadding,
    marginBottom: 12,
    borderRadius: layout.cardRadius,
    padding: 16,
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 18 },
  name: {},
  month: {},
  actions: { flexDirection: "row", gap: 4 },
  actionBtn: { padding: 4 },
  limitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  limitLabel: {},
  barBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  limitMarker: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 2,
    borderRadius: 1,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  remaining: {},
  percent: {},
  exceededBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  exceededText: { fontWeight: "600" },
});

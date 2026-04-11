import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../hooks/useTheme";
import { useTransactionsByMonth, useMonthlySummary } from "../../hooks/useTransactions";
import { getAllCategories } from "../../lib/helpers/categories";
import { getCategoryStats, getMonthlyFlow } from "../../lib/helpers/analysis";
import { currentMonth } from "../../lib/helpers/date";
import { formatCurrency } from "../../lib/helpers/currency";
import { layout } from "../../theme/spacing";
import { Category } from "../../types";

import AppHeader from "../../components/common/AppHeader";
import MonthNavigator from "../../components/common/MonthNavigator";
import SummaryBar from "../../components/records/SummaryBar";
import DonutChart, { DonutSlice } from "../../components/charts/DonutChart";
import ExpenseFlowChart from "../../components/charts/ExpenseFlowChart";
import CategoryBreakdownItem from "../../components/analysis/CategoryBreakdownItem";

type Section = "overview" | "flow";

export default function AnalysisScreen() {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();

  const [month, setMonth] = useState(currentMonth());
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedSection, setExpandedSection] = useState<Section>("overview");

  const { data: transactions = [], isLoading, refetch } = useTransactionsByMonth(month);
  const { income, expense } = useMonthlySummary(transactions);

  useEffect(() => {
    getAllCategories().then(setCategories);
  }, []);

  const categoryStats = useMemo(
    () => getCategoryStats(transactions, categories),
    [transactions, categories]
  );

  const flowData = useMemo(
    () => getMonthlyFlow(transactions, month),
    [transactions, month]
  );

  const donutSlices: DonutSlice[] = useMemo(
    () =>
      categoryStats.map((s) => ({
        key: s.name,
        label: s.name,
        value: s.amount,
        color: s.color,
      })),
    [categoryStats]
  );

  const toggleSection = (s: Section) =>
    setExpandedSection((prev) => (prev === s ? "overview" : s));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader title="Analysis" onMenuPress={() => {}} />

      <MonthNavigator month={month} onChange={setMonth} />
      <SummaryBar income={income} expense={expense} />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: layout.tabBarHeight + insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Expense Overview ─────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.sectionToggle}
            onPress={() => toggleSection("overview")}
            activeOpacity={0.7}
          >
            <Ionicons
              name={expandedSection === "overview" ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.size.base, fontWeight: typography.weight.semibold }]}>
              EXPENSE OVERVIEW
            </Text>
          </TouchableOpacity>

          {expandedSection === "overview" && (
            <>
              {categoryStats.length === 0 ? (
                <View style={styles.emptyChart}>
                  <Text style={{ fontSize: 36 }}>📊</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No expenses this month
                  </Text>
                </View>
              ) : (
                <>
                  {/* Donut + legend */}
                  <View style={styles.chartRow}>
                    <DonutChart
                      slices={donutSlices}
                      centerLabel="Expenses"
                      centerValue={expense}
                      size={168}
                    />

                    {/* Legend */}
                    <View style={styles.legend}>
                      {categoryStats.slice(0, 6).map((s) => (
                        <View key={s.name} style={styles.legendItem}>
                          <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                          <Text
                            style={[styles.legendLabel, { color: colors.textSecondary, fontSize: typography.size.xs }]}
                            numberOfLines={1}
                          >
                            {s.name}
                          </Text>
                        </View>
                      ))}
                      {categoryStats.length > 6 && (
                        <Text style={[styles.legendMore, { color: colors.textMuted, fontSize: typography.size.xs }]}>
                          +{categoryStats.length - 6} more
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Category breakdown list */}
                  <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                  {categoryStats.map((stat) => (
                    <CategoryBreakdownItem
                      key={stat.name}
                      icon={stat.icon}
                      name={stat.name}
                      amount={stat.amount}
                      percent={stat.percent}
                      color={stat.color}
                      count={stat.count}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </View>

        {/* ── Expense Flow ─────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.sectionToggle}
            onPress={() => toggleSection("flow")}
            activeOpacity={0.7}
          >
            <Ionicons
              name={expandedSection === "flow" ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.size.base, fontWeight: typography.weight.semibold }]}>
              EXPENSE FLOW
            </Text>
          </TouchableOpacity>

          {expandedSection === "flow" && (
            <>
              {flowData.length < 2 ? (
                <View style={styles.emptyChart}>
                  <Text style={{ fontSize: 36 }}>📈</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Not enough data yet
                  </Text>
                </View>
              ) : (
                <ExpenseFlowChart data={flowData} />
              )}
            </>
          )}
        </View>

        {/* ── Income vs Expense card ───────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.size.base, fontWeight: typography.weight.semibold, paddingHorizontal: 16, paddingBottom: 12 }]}>
            INCOME vs EXPENSE
          </Text>

          <View style={styles.compareRow}>
            {/* Income bar */}
            <View style={styles.compareCol}>
              <Text style={[styles.compareLabel, { color: colors.income, fontSize: typography.size.xs }]}>
                INCOME
              </Text>
              <Text style={[styles.compareAmount, { color: colors.income, fontSize: typography.size.lg, fontWeight: typography.weight.bold }]}>
                {formatCurrency(income, { compact: true })}
              </Text>
              <View style={[styles.compareBarBg, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.compareBarFill,
                    {
                      height: income + expense > 0 ? `${(income / (income + expense)) * 100}%` : "0%",
                      backgroundColor: colors.income,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Net */}
            <View style={styles.netCol}>
              <Text style={[styles.netLabel, { color: colors.textMuted, fontSize: typography.size.xs }]}>NET</Text>
              <Text
                style={[
                  styles.netAmount,
                  {
                    color: income - expense >= 0 ? colors.income : colors.expense,
                    fontSize: typography.size.md,
                    fontWeight: typography.weight.bold,
                  },
                ]}
              >
                {formatCurrency(income - expense, { showSign: true, compact: true })}
              </Text>
            </View>

            {/* Expense bar */}
            <View style={styles.compareCol}>
              <Text style={[styles.compareLabel, { color: colors.expense, fontSize: typography.size.xs }]}>
                EXPENSE
              </Text>
              <Text style={[styles.compareAmount, { color: colors.expense, fontSize: typography.size.lg, fontWeight: typography.weight.bold }]}>
                {formatCurrency(expense, { compact: true })}
              </Text>
              <View style={[styles.compareBarBg, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.compareBarFill,
                    {
                      height: income + expense > 0 ? `${(expense / (income + expense)) * 100}%` : "0%",
                      backgroundColor: colors.expense,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: layout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  sectionToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
  },
  sectionTitle: { letterSpacing: 0.5 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  emptyChart: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    gap: 8,
  },
  emptyText: { fontSize: 14 },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  legend: {
    flex: 1,
    gap: 7,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  legendLabel: { flex: 1 },
  legendMore: {},
  compareRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
    height: 180,
  },
  compareCol: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    height: "100%",
    justifyContent: "flex-end",
  },
  compareLabel: { fontWeight: "700", letterSpacing: 0.5 },
  compareAmount: {},
  compareBarBg: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  compareBarFill: {
    width: "100%",
    borderRadius: 8,
  },
  netCol: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
    gap: 4,
  },
  netLabel: { fontWeight: "600" },
  netAmount: {},
});

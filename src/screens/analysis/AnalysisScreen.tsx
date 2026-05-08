import React, { useState, useMemo, useEffect, useCallback } from "react";
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

  const toggleSection = useCallback((s: Section) =>
    setExpandedSection((prev) => (prev === s ? "overview" : s)),
  []);

  const financialHealth = useMemo(() => {
    const net = income - expense;
    const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0;
    const spentPct = income > 0
      ? Math.min(100, Math.round((expense / income) * 100))
      : expense > 0 ? 100 : 0;
    const healthLabel =
      savingsRate >= 30 ? "Excellent savings" :
      savingsRate >= 20 ? "Good savings" :
      savingsRate >= 10 ? "Saving a little" :
      savingsRate >= 0  ? "Breaking even" :
                          "Overspent";
    const healthColor =
      savingsRate >= 20 ? colors.income :
      savingsRate >= 0  ? "#F59E0B" :
                          colors.expense;
    return { net, savingsRate, spentPct, healthLabel, healthColor };
  }, [income, expense, colors.income, colors.expense]);

  const { net, savingsRate, spentPct, healthLabel, healthColor } = financialHealth;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader title="Analysis"  />

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

        {/* ── Financial Health ─────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.size.base, fontWeight: typography.weight.semibold, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14 }]}>
            FINANCIAL HEALTH
          </Text>

          {income === 0 && expense === 0 ? (
            <View style={styles.emptyChart}>
              <Text style={{ fontSize: 36 }}>💡</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No transactions this month
              </Text>
            </View>
          ) : (
            <View style={styles.healthBody}>
              {/* Savings rate badge + stats row */}
              <View style={styles.healthTopRow}>
                {/* Big savings rate */}
                <View style={[styles.rateBox, { backgroundColor: healthColor + "18", borderColor: healthColor + "40" }]}>
                  <Text style={[styles.ratePct, { color: healthColor, fontSize: typography.size["2xl"] ?? 24, fontWeight: typography.weight.extrabold }]}>
                    {savingsRate >= 0 ? "+" : ""}{savingsRate}%
                  </Text>
                  <Text style={[styles.rateLabel, { color: healthColor, fontSize: typography.size.xs, fontWeight: typography.weight.medium }]}>
                    {healthLabel}
                  </Text>
                </View>

                {/* 3-stat grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: colors.income }]} />
                    <View>
                      <Text style={[styles.statItemLabel, { color: colors.textMuted, fontSize: typography.size.xs }]}>Income</Text>
                      <Text style={[styles.statItemValue, { color: colors.text, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }]}>
                        {formatCurrency(income, { compact: true })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: colors.expense }]} />
                    <View>
                      <Text style={[styles.statItemLabel, { color: colors.textMuted, fontSize: typography.size.xs }]}>Spent</Text>
                      <Text style={[styles.statItemValue, { color: colors.text, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }]}>
                        {formatCurrency(expense, { compact: true })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: net >= 0 ? colors.income : colors.expense }]} />
                    <View>
                      <Text style={[styles.statItemLabel, { color: colors.textMuted, fontSize: typography.size.xs }]}>Net saved</Text>
                      <Text style={[styles.statItemValue, { color: net >= 0 ? colors.income : colors.expense, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }]}>
                        {formatCurrency(net, { showSign: true, compact: true })}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Spend allocation bar */}
              <View style={styles.allocationWrap}>
                <View style={[styles.allocationTrack, { backgroundColor: colors.incomeLight ?? colors.border }]}>
                  <View style={[styles.allocationFill, { width: `${spentPct}%`, backgroundColor: colors.expense }]} />
                </View>
                <View style={styles.allocationLabels}>
                  <View style={styles.allocLabelRow}>
                    <View style={[styles.allocDot, { backgroundColor: colors.expense }]} />
                    <Text style={[styles.allocText, { color: colors.textMuted, fontSize: typography.size.xs }]}>
                      {spentPct}% spent of income
                    </Text>
                  </View>
                  <View style={styles.allocLabelRow}>
                    <View style={[styles.allocDot, { backgroundColor: colors.income }]} />
                    <Text style={[styles.allocText, { color: colors.textMuted, fontSize: typography.size.xs }]}>
                      {Math.max(0, 100 - spentPct)}% retained
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
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
  healthBody: { paddingHorizontal: 16, paddingBottom: 20, gap: 16 },
  healthTopRow: { flexDirection: "row", gap: 14, alignItems: "center" },
  rateBox: {
    width: 100,
    height: 84,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  ratePct: {},
  rateLabel: { letterSpacing: 0.2 },
  statsGrid: { flex: 1, gap: 10 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  statDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  statItemLabel: {},
  statItemValue: {},
  allocationWrap: { gap: 8 },
  allocationTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  allocationFill: { height: "100%", borderRadius: 4 },
  allocationLabels: { flexDirection: "row", justifyContent: "space-between" },
  allocLabelRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  allocDot: { width: 6, height: 6, borderRadius: 3 },
  allocText: {},
});

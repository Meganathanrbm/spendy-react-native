import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../hooks/useTheme";
import { useTransactionsByMonth, useMonthlySummary } from "../../hooks/useTransactions";
import { getAllCategories } from "../../lib/helpers/categories";
import { getCategoryStats, getMonthlyFlow } from "../../lib/helpers/analysis";
import { currentMonth } from "../../lib/helpers/date";
import { formatCurrency } from "../../lib/helpers/currency";
import { layout } from "../../theme/spacing";
import { Category, Transaction } from "../../types";

import AppHeader from "../../components/common/AppHeader";
import MonthNavigator from "../../components/common/MonthNavigator";
import DonutChart, { DonutSlice } from "../../components/charts/DonutChart";
import ExpenseFlowChart from "../../components/charts/ExpenseFlowChart";
import { getCategoryIcon } from "../../lib/helpers/categoryIcons";

type Tab = "overview" | "flow" | "calendar";

// ─── Calendar Heatmap ────────────────────────────────────────────────────────
function CalendarHeatmap({ transactions, month, colors, typography }: {
  transactions: Transaction[];
  month: string;
  colors: any;
  typography: any;
}) {
  const [year, m] = month.split("-").map(Number);
  const daysInMonth = new Date(year, m, 0).getDate();
  const firstDow = new Date(year, m - 1, 1).getDay(); // 0=Sun

  const expByDay = useMemo(() => {
    const map: Record<number, number> = {};
    transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(month))
      .forEach((t) => {
        const d = parseInt(t.date.slice(8, 10), 10);
        map[d] = (map[d] || 0) + t.amount;
      });
    return map;
  }, [transactions, month]);

  const maxAmt = Math.max(...Object.values(expByDay), 1);
  const totalExp = Object.values(expByDay).reduce((s, v) => s + v, 0);
  const activeDays = Object.keys(expByDay).length;
  const peakDay = Object.entries(expByDay).sort((a, b) => b[1] - a[1])[0];

  const monthName = new Date(year, m - 1, 1).toLocaleString("en-US", { month: "long" }).toUpperCase();

  const getIntensityColor = (amt: number) => {
    if (!amt) return colors.surfaceAlt;
    const ratio = amt / maxAmt;
    if (ratio < 0.25) return colors.primary + "44";
    if (ratio < 0.5)  return colors.primary + "77";
    if (ratio < 0.75) return colors.primary + "AA";
    return colors.primary;
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDow }, (_, i) => i);

  return (
    <View style={[calStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={calStyles.cardHeader}>
        <View>
          <Text style={[calStyles.cardTitle, { color: colors.textMuted }]}>
            CALENDAR · {monthName} {year}
          </Text>
          <Text style={[calStyles.totalAmt, { color: colors.text }]}>
            {formatCurrency(totalExp, { compact: true })}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[calStyles.metaLine, { color: colors.textMuted }]}>
            active <Text style={[calStyles.metaMono, { color: colors.textSecondary }]}>{activeDays}/{daysInMonth}d</Text>
          </Text>
          {peakDay && (
            <Text style={[calStyles.metaLine, { color: colors.textMuted, marginTop: 2 }]}>
              peak <Text style={[calStyles.metaMono, { color: colors.textSecondary }]}>
                {monthName.slice(0, 3).charAt(0) + monthName.slice(1, 3).toLowerCase()} {peakDay[0]}
              </Text>
            </Text>
          )}
        </View>
      </View>

      {/* Day-of-week header */}
      <View style={calStyles.dowRow}>
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <Text key={i} style={[calStyles.dowLabel, { color: colors.textMuted }]}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={calStyles.grid}>
        {blanks.map((_, i) => <View key={`b${i}`} style={calStyles.cell} />)}
        {days.map((d) => {
          const amt = expByDay[d];
          const isToday = (() => {
            const now = new Date();
            return now.getFullYear() === year && now.getMonth() + 1 === m && now.getDate() === d;
          })();
          return (
            <View
              key={d}
              style={[
                calStyles.cell,
                { backgroundColor: getIntensityColor(amt) },
                isToday && { borderWidth: 1.5, borderColor: colors.primary },
              ]}
            >
              <Text style={[calStyles.dayNum, { color: amt ? colors.text : colors.textMuted }]}>{d}</Text>
              {amt ? (
                <Text style={[calStyles.dayAmt, { color: colors.text }]}>
                  {amt >= 1000 ? `${Math.round(amt / 1000)}k` : amt}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={calStyles.legendRow}>
        <Text style={[calStyles.legendLabel, { color: colors.textMuted }]}>less</Text>
        {["44","77","AA","FF"].map((op) => (
          <View key={op} style={[calStyles.legendDot, { backgroundColor: colors.primary + op }]} />
        ))}
        <Text style={[calStyles.legendLabel, { color: colors.textMuted }]}>more</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AnalysisScreen() {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();

  const [month, setMonth] = useState(currentMonth());
  const [categories, setCategories] = useState<Category[]>([]);
  const [tab, setTab] = useState<Tab>("overview");

  const { data: transactions = [], isLoading, refetch } = useTransactionsByMonth(month);
  const { income, expense } = useMonthlySummary(transactions);

  useEffect(() => { getAllCategories().then(setCategories); }, []);

  const categoryStats = useMemo(
    () => getCategoryStats(transactions, categories),
    [transactions, categories],
  );

  const flowData = useMemo(
    () => getMonthlyFlow(transactions, month),
    [transactions, month],
  );

  const donutSlices: DonutSlice[] = useMemo(
    () => categoryStats.map((s) => ({ key: s.name, label: s.name, value: s.amount, color: s.color })),
    [categoryStats],
  );

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "flow",     label: "Daily flow" },
    { key: "calendar", label: "Calendar" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader title="Analysis" />

      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: layout.tabBarHeight + insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <MonthNavigator month={month} onChange={setMonth} />

        {/* Tab row */}
        <View style={styles.tabsRow}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[
                styles.tab,
                {
                  backgroundColor: tab === t.key ? (colors.surface3 ?? colors.surfaceElevated) : "transparent",
                  borderColor: tab === t.key ? (colors.borderStrong ?? colors.border) : colors.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, { color: tab === t.key ? colors.text : colors.textSecondary }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Overview ── */}
        {tab === "overview" && (
          <>
            {categoryStats.length === 0 ? (
              <View style={styles.empty}>
                <Text style={{ fontSize: 36 }}>📊</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No expenses this month</Text>
              </View>
            ) : (
              <>
                {/* Hero donut card */}
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.heroRow}>
                    <DonutChart
                      slices={donutSlices}
                      centerLabel="SPENT"
                      centerValue={expense}
                      size={120}
                    />
                    <View style={styles.legend}>
                      {categoryStats.slice(0, 4).map((s) => (
                        <View key={s.name} style={styles.legendItem}>
                          <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                          <Text
                            style={[styles.legendName, { color: colors.textSecondary }]}
                            numberOfLines={1}
                          >
                            {s.name}
                          </Text>
                          <Text style={[styles.legendPct, { color: colors.text, fontVariant: ["tabular-nums"] }]}>
                            {Math.round((s.amount / (expense || 1)) * 100)}%
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                {/* BY CATEGORY */}
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>BY CATEGORY</Text>
                </View>
                <View style={[styles.catList, { borderColor: colors.border }]}>
                  {categoryStats.map((stat) => {
                    const pct = (stat.amount / (expense || 1)) * 100;
                    const Icon = getCategoryIcon(stat.name);
                    return (
                      <View
                        key={stat.name}
                        style={[styles.catRow, { borderBottomColor: colors.border }]}
                      >
                        <View style={[styles.catIcon, { backgroundColor: stat.color + "22" }]}>
                          <Icon size={18} color={stat.color} strokeWidth={1.7} />
                        </View>
                        <View style={styles.catInfo}>
                          <View style={styles.catTopRow}>
                            <Text style={[styles.catName, { color: colors.text }]}>{stat.name}</Text>
                            <Text style={[styles.catAmt, { color: colors.text, fontVariant: ["tabular-nums"] }]}>
                              {formatCurrency(stat.amount, { compact: true })}
                            </Text>
                          </View>
                          <View style={styles.catBarRow}>
                            <View style={[styles.catBarTrack, { backgroundColor: colors.surfaceAlt }]}>
                              <View
                                style={[styles.catBarFill, { width: `${Math.min(100, pct)}%`, backgroundColor: stat.color }]}
                              />
                            </View>
                            <Text style={[styles.catPct, { color: colors.textMuted, fontVariant: ["tabular-nums"] }]}>
                              {pct.toFixed(1)}%
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </>
        )}

        {/* ── Daily Flow ── */}
        {tab === "flow" && (
          <View style={{ paddingHorizontal: 16 }}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.flowHeader}>
                <View>
                  <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>DAILY EXPENSE</Text>
                  <Text style={[styles.flowTotal, { color: colors.text, fontVariant: ["tabular-nums"] }]}>
                    {formatCurrency(expense, { compact: true })}
                  </Text>
                </View>
                <Text style={[styles.flowAvg, { color: colors.textMuted }]}>
                  avg{" "}
                  <Text style={{ color: colors.textSecondary, fontVariant: ["tabular-nums"] }}>
                    {formatCurrency(expense / 30, { compact: true })}/d
                  </Text>
                </Text>
              </View>
              {flowData.length < 2 ? (
                <View style={styles.empty}>
                  <Text style={{ fontSize: 36 }}>📈</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Not enough data yet</Text>
                </View>
              ) : (
                <ExpenseFlowChart data={flowData} />
              )}
            </View>
          </View>
        )}

        {/* ── Calendar ── */}
        {tab === "calendar" && (
          <View style={{ paddingHorizontal: 16 }}>
            <CalendarHeatmap
              transactions={transactions}
              month={month}
              colors={colors}
              typography={typography}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  tabsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tabText: { fontSize: 12, fontWeight: "600", letterSpacing: 0.1 },

  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    marginBottom: 0,
  },

  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  legend: { flex: 1, gap: 7 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 2, flexShrink: 0 },
  legendName: { flex: 1, fontSize: 11.5 },
  legendPct: { fontSize: 11.5, fontWeight: "500" },

  sectionHeader: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  sectionLabel: { fontSize: 10.5, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" },

  catList: { paddingHorizontal: 16 },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  catIcon: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  catInfo: { flex: 1 },
  catTopRow: { flexDirection: "row", justifyContent: "space-between" },
  catName: { fontSize: 13, fontWeight: "500" },
  catAmt: { fontSize: 13, fontWeight: "500" },
  catBarRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 5 },
  catBarTrack: { flex: 1, height: 3, borderRadius: 2, overflow: "hidden" },
  catBarFill: { height: "100%", borderRadius: 2 },
  catPct: { fontSize: 10.5, width: 38, textAlign: "right" },

  flowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 },
  flowTotal: { fontSize: 22, fontWeight: "600", marginTop: 4, letterSpacing: -0.6 },
  flowAvg: { fontSize: 11 },

  empty: { alignItems: "center", paddingVertical: 48, gap: 8 },
  emptyText: { fontSize: 13 },
});

// ─── Calendar Heatmap styles ──────────────────────────────────────────────────
const calStyles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  cardTitle: { fontSize: 10, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase" },
  totalAmt: { fontSize: 22, fontWeight: "600", letterSpacing: -0.6, marginTop: 4, fontVariant: ["tabular-nums"] },
  metaLine: { fontSize: 10 },
  metaMono: { fontVariant: ["tabular-nums"], fontWeight: "500" },

  dowRow: { flexDirection: "row", marginBottom: 6 },
  dowLabel: { flex: 1, textAlign: "center", fontSize: 10, fontWeight: "600" },

  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: "14.28%",
    aspectRatio: 1,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  dayNum: { fontSize: 9, fontWeight: "600" },
  dayAmt: { fontSize: 8, fontVariant: ["tabular-nums"], fontWeight: "500" },

  legendRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 5, marginTop: 12 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendLabel: { fontSize: 10 },
});

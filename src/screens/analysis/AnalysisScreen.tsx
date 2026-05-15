import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../contexts/AuthContext";
import {
  useTransactions,
  useTransactionsByMonth,
  useMonthlySummary,
} from "../../hooks/useTransactions";
import { getAllCategories } from "../../lib/helpers/categories";
import { getCategoryStats, getMonthlyFlow, getPeriodFlow } from "../../lib/helpers/analysis";
import { currentMonth } from "../../lib/helpers/date";
import { formatCurrency } from "../../lib/helpers/currency";
import { layout } from "../../theme/spacing";
import { ChartNoAxesColumn, SlidersHorizontal, Check } from "lucide-react-native";
import { Category, Transaction } from "../../types";
import { RootStackParamList } from "../../navigation/types";

import AppHeader from "../../components/common/AppHeader";
import MonthNavigator from "../../components/common/MonthNavigator";
import DonutChart, { DonutSlice } from "../../components/charts/DonutChart";
import ExpenseFlowChart from "../../components/charts/ExpenseFlowChart";
import { getCategoryIcon } from "../../lib/helpers/categoryIcons";

type Tab = "overview" | "flow" | "calendar";
type Period = "1d" | "7d" | "1m" | "3m" | "6m" | "1y";

const PERIODS: { key: Period; label: string }[] = [
  { key: "1d", label: "Today" },
  { key: "7d", label: "Weekly" },
  { key: "1m", label: "Monthly" },
  { key: "3m", label: "3 Months" },
  { key: "6m", label: "6 Months" },
  { key: "1y", label: "Yearly" },
];

// ─── Calendar Heatmap ────────────────────────────────────────────────────────
function CalendarHeatmap({
  transactions,
  month,
  colors,
}: {
  transactions: Transaction[];
  month: string;
  colors: any;
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

  const monthName = new Date(year, m - 1, 1).toLocaleString("en-US", {
    month: "long",
  });

  const getIntensityColor = (amt: number) => {
    if (!amt) return colors.surfaceAlt;
    const ratio = amt / maxAmt;
    if (ratio < 0.25) return colors.primary + "44";
    if (ratio < 0.5) return colors.primary + "77";
    if (ratio < 0.75) return colors.primary + "AA";
    return colors.primary;
  };

  // Build week rows so DOW header and cells share the same flex model
  const allCells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < allCells.length; i += 7) {
    const week = allCells.slice(i, i + 7);
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const now = new Date();
  const isCurrentMonth =
    now.getFullYear() === year && now.getMonth() + 1 === m;

  return (
    <View
      style={[
        calStyles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {/* Header */}
      <View style={calStyles.cardHeader}>
        <View>
          <Text style={[calStyles.cardTitle, { color: colors.textMuted }]}>
            {monthName.toUpperCase()} {year}
          </Text>
          <Text style={[calStyles.totalAmt, { color: colors.text }]}>
            {formatCurrency(totalExp, { compact: true })}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[calStyles.metaLine, { color: colors.textMuted }]}>
            active{" "}
            <Text style={[calStyles.metaMono, { color: colors.textSecondary }]}>
              {activeDays}/{daysInMonth}d
            </Text>
          </Text>
          {peakDay && (
            <Text
              style={[calStyles.metaLine, { color: colors.textMuted, marginTop: 2 }]}
            >
              peak{" "}
              <Text style={[calStyles.metaMono, { color: colors.textSecondary }]}>
                {monthName.slice(0, 3)} {peakDay[0]}
              </Text>
            </Text>
          )}
        </View>
      </View>

      {/* Day-of-week header — matches week row flex layout */}
      <View style={calStyles.dowRow}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <View key={i} style={calStyles.dowCell}>
            <Text style={[calStyles.dowLabel, { color: colors.textMuted }]}>
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid — one row per week */}
      <View style={calStyles.gridContainer}>
        {weeks.map((week, wi) => (
          <View key={wi} style={calStyles.weekRow}>
            {week.map((day, di) => {
              if (day === null) {
                return <View key={di} style={calStyles.cell} />;
              }
              const amt = expByDay[day];
              const isToday = isCurrentMonth && now.getDate() === day;
              return (
                <View
                  key={di}
                  style={[
                    calStyles.cell,
                    { backgroundColor: getIntensityColor(amt) },
                    isToday && {
                      borderWidth: 1.5,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      calStyles.dayNum,
                      { color: amt ? colors.text : colors.textMuted },
                    ]}
                  >
                    {day}
                  </Text>
                  {amt ? (
                    <Text style={[calStyles.dayAmt, { color: colors.text }]}>
                      {amt >= 1000
                        ? `${(amt / 1000).toFixed(1)}k`
                        : Math.round(amt)}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={calStyles.legendRow}>
        <Text style={[calStyles.legendLabel, { color: colors.textMuted }]}>
          less
        </Text>
        {["44", "77", "AA", "FF"].map((op) => (
          <View
            key={op}
            style={[
              calStyles.legendDot,
              { backgroundColor: colors.primary + op },
            ]}
          />
        ))}
        <Text style={[calStyles.legendLabel, { color: colors.textMuted }]}>
          more
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AnalysisScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [month, setMonth] = useState(currentMonth());
  const [categories, setCategories] = useState<Category[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [period, setPeriod] = useState<Period>("1m");
  const [showFilter, setShowFilter] = useState(false);

  const monthQuery = useTransactionsByMonth(month);
  const allQuery = useTransactions();

  const transactions = useMemo(() => {
    if (period === "1m") return monthQuery.data ?? [];
    const all = allQuery.data ?? [];
    if (period === "1d") {
      const today = new Date().toISOString().slice(0, 10);
      return all.filter((t) => t.date.startsWith(today));
    }
    const daysMap: Record<string, number> = { "7d": 7, "3m": 90, "6m": 180, "1y": 365 };
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysMap[period]);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return all.filter((t) => t.date.slice(0, 10) >= cutoffStr);
  }, [period, monthQuery.data, allQuery.data]);

  const isLoading = period === "1m" ? monthQuery.isLoading : allQuery.isLoading;
  const refetch = period === "1m" ? monthQuery.refetch : allQuery.refetch;

  const { expense } = useMonthlySummary(transactions);

  useEffect(() => {
    getAllCategories(user!.email).then(setCategories);
  }, []);

  const categoryStats = useMemo(
    () => getCategoryStats(transactions, categories),
    [transactions, categories],
  );

  const flowData = useMemo(
    () => period === "1m" ? getMonthlyFlow(transactions, month) : getPeriodFlow(transactions),
    [transactions, month, period],
  );

  useEffect(() => {
    if (period !== "1m" && tab === "calendar") setTab("overview");
  }, [period]);

  const donutSlices: DonutSlice[] = useMemo(
    () =>
      categoryStats.map((s) => ({
        key: s.name,
        label: s.name,
        value: s.amount,
        color: s.color,
      })),
    [categoryStats],
  );

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "flow", label: "Daily flow" },
    ...(period === "1m" ? [{ key: "calendar" as Tab, label: "Calendar" }] : []),
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Analysis"
        rightElement={
          <TouchableOpacity
            onPress={() => setShowFilter(true)}
            style={styles.filterBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SlidersHorizontal
              size={20}
              color={period !== "1m" ? colors.primary : colors.text}
              strokeWidth={1.7}
            />
          </TouchableOpacity>
        }
      />

      <Modal
        visible={showFilter}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilter(false)}
      >
        <View style={styles.overlay}>
          {/* Backdrop — sibling of card so it doesn't capture card touches */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setShowFilter(false)}
            activeOpacity={1}
          />
          <View
            style={[
              styles.filterCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                top: insets.top + 56,
              },
            ]}
          >
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p.key}
                onPress={() => { setPeriod(p.key); setShowFilter(false); }}
                style={[
                  styles.filterOption,
                  period === p.key && { backgroundColor: colors.surfaceAlt ?? colors.surfaceElevated },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    { color: period === p.key ? colors.text : colors.textSecondary },
                  ]}
                >
                  {p.label}
                </Text>
                {period === p.key && (
                  <Check size={14} color={colors.primary} strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={{
          paddingBottom: layout.tabBarHeight + insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {period === "1m" && <MonthNavigator month={month} onChange={setMonth} />}

        {/* Tab row */}
        <View style={[styles.tabsRow, period !== "1m" && { paddingTop: 14 }]}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[
                styles.tab,
                {
                  backgroundColor:
                    tab === t.key
                      ? (colors.surface3 ?? colors.surfaceElevated)
                      : "transparent",
                  borderColor:
                    tab === t.key
                      ? (colors.borderStrong ?? colors.border)
                      : colors.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: tab === t.key ? colors.text : colors.textSecondary },
                ]}
              >
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
                <ChartNoAxesColumn
                  size={36}
                  color={colors.textMuted}
                  strokeWidth={1.5}
                />
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  No expenses{period === "1m" ? " this month" : " in this period"}
                </Text>
              </View>
            ) : (
              <>
                {/* Hero donut card */}
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
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
                          <View
                            style={[
                              styles.legendDot,
                              { backgroundColor: s.color },
                            ]}
                          />
                          <Text
                            style={[
                              styles.legendName,
                              { color: colors.textSecondary },
                            ]}
                            numberOfLines={1}
                          >
                            {s.name}
                          </Text>
                          <Text
                            style={[
                              styles.legendPct,
                              {
                                color: colors.text,
                                fontVariant: ["tabular-nums"],
                              },
                            ]}
                          >
                            {Math.round((s.amount / (expense || 1)) * 100)}%
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                {/* BY CATEGORY */}
                <View style={styles.sectionHeader}>
                  <Text
                    style={[styles.sectionLabel, { color: colors.textMuted }]}
                  >
                    BY CATEGORY
                  </Text>
                </View>
                <View style={[styles.catList, { borderColor: colors.border }]}>
                  {categoryStats.map((stat) => {
                    const pct = (stat.amount / (expense || 1)) * 100;
                    const Icon = getCategoryIcon(stat.name);
                    return (
                      <TouchableOpacity
                        key={stat.name}
                        onPress={() =>
                          navigation.navigate("CategoryDetail", {
                            categoryName: stat.name,
                            month,
                            totalExpense: expense,
                          })
                        }
                        activeOpacity={0.7}
                        style={[
                          styles.catRow,
                          { borderBottomColor: colors.border },
                        ]}
                      >
                        <View
                          style={[
                            styles.catIcon,
                            { backgroundColor: stat.color + "22" },
                          ]}
                        >
                          <Icon
                            size={18}
                            color={stat.color}
                            strokeWidth={1.7}
                          />
                        </View>
                        <View style={styles.catInfo}>
                          <View style={styles.catTopRow}>
                            <Text
                              style={[styles.catName, { color: colors.text }]}
                            >
                              {stat.name}
                            </Text>
                            <Text
                              style={[
                                styles.catAmt,
                                {
                                  color: colors.text,
                                  fontVariant: ["tabular-nums"],
                                },
                              ]}
                            >
                              {formatCurrency(stat.amount, { compact: true })}
                            </Text>
                          </View>
                          <View style={styles.catBarRow}>
                            <View
                              style={[
                                styles.catBarTrack,
                                { backgroundColor: colors.surfaceAlt },
                              ]}
                            >
                              <View
                                style={[
                                  styles.catBarFill,
                                  {
                                    width: `${Math.min(100, pct)}%`,
                                    backgroundColor: stat.color,
                                  },
                                ]}
                              />
                            </View>
                            <Text
                              style={[
                                styles.catPct,
                                {
                                  color: colors.textMuted,
                                  fontVariant: ["tabular-nums"],
                                },
                              ]}
                            >
                              {pct.toFixed(1)}%
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
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
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.flowHeader}>
                <View>
                  <Text
                    style={[styles.sectionLabel, { color: colors.textMuted }]}
                  >
                    DAILY EXPENSE
                  </Text>
                  <Text
                    style={[
                      styles.flowTotal,
                      { color: colors.text, fontVariant: ["tabular-nums"] },
                    ]}
                  >
                    {formatCurrency(expense, { compact: true })}
                  </Text>
                </View>
                <Text style={[styles.flowAvg, { color: colors.textMuted }]}>
                  avg{" "}
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {formatCurrency(expense / 30, { compact: true })}/d
                  </Text>
                </Text>
              </View>
              {flowData.length < 2 ? (
                <View style={styles.empty}>
                  <ChartNoAxesColumn
                    size={36}
                    color={colors.textMuted}
                    strokeWidth={1.5}
                  />
                  <Text
                    style={[styles.emptyText, { color: colors.textSecondary }]}
                  >
                    Not enough data yet
                  </Text>
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
  sectionLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  catList: { paddingHorizontal: 16 },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  catInfo: { flex: 1 },
  catTopRow: { flexDirection: "row", justifyContent: "space-between" },
  catName: { fontSize: 13, fontWeight: "500" },
  catAmt: { fontSize: 13, fontWeight: "500" },
  catBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  catBarTrack: { flex: 1, height: 3, borderRadius: 2, overflow: "hidden" },
  catBarFill: { height: "100%", borderRadius: 2 },
  catPct: { fontSize: 10.5, width: 38, textAlign: "right" },

  flowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  flowTotal: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 4,
    letterSpacing: -0.6,
  },
  flowAvg: { fontSize: 11 },

  empty: { alignItems: "center", paddingVertical: 48, gap: 8 },
  emptyText: { fontSize: 13 },

  filterBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
  },
  filterCard: {
    position: "absolute",
    right: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    minWidth: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 24,
  },
  filterOptionText: { fontSize: 13, fontWeight: "500" },
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
  cardTitle: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  totalAmt: {
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: -0.6,
    marginTop: 4,
    fontVariant: ["tabular-nums"],
  },
  metaLine: { fontSize: 10 },
  metaMono: { fontVariant: ["tabular-nums"], fontWeight: "500" },

  dowRow: { flexDirection: "row", gap: 3, marginBottom: 4 },
  dowCell: { flex: 1, alignItems: "center", paddingVertical: 4 },
  dowLabel: { fontSize: 10, fontWeight: "600" },

  gridContainer: { gap: 3 },
  weekRow: { flexDirection: "row", gap: 3 },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNum: { fontSize: 9, fontWeight: "600" },
  dayAmt: { fontSize: 8, fontVariant: ["tabular-nums"], fontWeight: "500" },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
    marginTop: 12,
  },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendLabel: { fontSize: 10 },
});

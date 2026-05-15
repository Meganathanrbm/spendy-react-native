import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../contexts/AuthContext";
import { useTransactionsByMonth } from "../../hooks/useTransactions";
import { defaultCategories } from "../../lib/helpers/categories";
import { getCategoryIcon } from "../../lib/helpers/categoryIcons";
import { formatCurrency } from "../../lib/helpers/currency";
import { layout } from "../../theme/spacing";
import { RootStackParamList } from "../../navigation/types";
import { Transaction } from "../../types";

type Props = NativeStackScreenProps<RootStackParamList, "CategoryDetail">;

function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const dow = d.toLocaleString("en-US", { weekday: "short" });
  return `${month} ${day} · ${dow}`;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function CategoryDetailScreen({ route, navigation }: Props) {
  const { categoryName, month, totalExpense } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const { data: allTransactions = [] } = useTransactionsByMonth(month);

  const [categoryColor, CategoryIcon] = useMemo(() => {
    const cat = defaultCategories.find((c) => c.name === categoryName);
    const color = cat?.color ?? "#64748B";
    const Icon = getCategoryIcon(categoryName);
    return [color, Icon] as const;
  }, [categoryName]);

  const transactions: Transaction[] = useMemo(
    () =>
      allTransactions.filter(
        (t) => t.type === "expense" && t.category === categoryName,
      ),
    [allTransactions, categoryName],
  );

  const stats = useMemo(() => {
    const count = transactions.length;
    const total = transactions.reduce((s, t) => s + t.amount, 0);
    const avg = count > 0 ? total / count : 0;
    const days = transactions
      .map((t) => parseInt(t.date.slice(8, 10), 10))
      .filter(Boolean);
    const minDay = days.length > 0 ? Math.min(...days) : 0;
    const maxDay = days.length > 0 ? Math.max(...days) : 0;
    return { count, avg, minDay, maxDay };
  }, [transactions]);

  const pct = totalExpense > 0
    ? ((transactions.reduce((s, t) => s + t.amount, 0) / totalExpense) * 100).toFixed(1)
    : "0.0";

  const categoryTotal = transactions.reduce((s, t) => s + t.amount, 0);

  // Group transactions by date (newest first)
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of transactions) {
      const key = t.date.slice(0, 10);
      const arr = map.get(key) ?? [];
      arr.push(t);
      map.set(key, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [transactions]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={22} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{categoryName}</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>{formatMonthLabel(month)}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: layout.tabBarHeight + insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.summaryRow}>
            <View style={[styles.catIcon, { backgroundColor: categoryColor + "22" }]}>
              <CategoryIcon size={26} color={categoryColor} strokeWidth={1.7} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>SPENT THIS MONTH</Text>
              <View style={styles.amtRow}>
                <Text style={[styles.summaryAmt, { color: colors.text }]}>
                  {`-${formatCurrency(categoryTotal)}`}
                </Text>
                <View style={[styles.pctBadge, { backgroundColor: categoryColor + "22" }]}>
                  <Text style={[styles.pctText, { color: categoryColor }]}>{pct}%</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>RECORDS</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.count}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>AVG</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatCurrency(stats.avg, { compact: true })}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>RANGE</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.count > 0 ? `${stats.minDay}-${stats.maxDay}` : "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Transactions */}
        {grouped.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>TRANSACTIONS</Text>
            </View>

            {grouped.map(([dateKey, txns]) => {
              const dayTotal = txns.reduce((s, t) => s + t.amount, 0);
              return (
                <View key={dateKey}>
                  {/* Date row */}
                  <View style={[styles.dateRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
                      {formatDateHeader(dateKey)}
                    </Text>
                    <Text style={[styles.dateTotalAmt, { color: colors.textSecondary }]}>
                      {`-${formatCurrency(dayTotal, { compact: true })}`}
                    </Text>
                  </View>

                  {/* Transaction rows */}
                  {txns.map((t) => (
                    <View
                      key={t.id}
                      style={[styles.txRow, { borderBottomColor: colors.border }]}
                    >
                      <View style={[styles.txIcon, { backgroundColor: categoryColor + "22" }]}>
                        <CategoryIcon size={18} color={categoryColor} strokeWidth={1.7} />
                      </View>
                      <View style={styles.txInfo}>
                        <Text style={[styles.txTitle, { color: colors.text }]} numberOfLines={1}>
                          {t.title}
                        </Text>
                        <Text style={[styles.txMeta, { color: colors.textMuted }]}>
                          {t.category} · {formatTime(t.date)}
                        </Text>
                      </View>
                      <Text style={[styles.txAmt, { color: colors.text }]}>
                        {`-${formatCurrency(t.amount)}`}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  backBtn: { padding: 4 },
  headerTitles: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: "600", letterSpacing: -0.3 },
  headerSub: { fontSize: 12, marginTop: 1 },

  card: {
    margin: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
  },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  catIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  summaryInfo: { flex: 1 },
  summaryLabel: { fontSize: 10.5, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase" },
  amtRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" },
  summaryAmt: { fontSize: 24, fontWeight: "700", letterSpacing: -0.8, fontVariant: ["tabular-nums"] },
  pctBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pctText: { fontSize: 12, fontWeight: "600" },

  divider: { height: StyleSheet.hairlineWidth, marginVertical: 16 },

  statsRow: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { width: StyleSheet.hairlineWidth, height: 28 },
  statLabel: { fontSize: 9.5, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 5 },
  statValue: { fontSize: 15, fontWeight: "600", fontVariant: ["tabular-nums"] },

  sectionHeader: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 },
  sectionLabel: { fontSize: 10.5, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dateLabel: { fontSize: 12, fontWeight: "500" },
  dateTotalAmt: { fontSize: 12, fontWeight: "500", fontVariant: ["tabular-nums"] },

  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  txIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 13.5, fontWeight: "500" },
  txMeta: { fontSize: 11.5, marginTop: 2 },
  txAmt: { fontSize: 13.5, fontWeight: "600", fontVariant: ["tabular-nums"] },
});

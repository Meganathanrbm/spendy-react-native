import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { Plus } from "lucide-react-native";
import { getCategoryIcon } from "../../lib/helpers/categoryIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../hooks/useTheme";
import { useBudgetsByMonth, useDeleteBudget } from "../../hooks/useBudgets";
import { useTransactionsByMonth } from "../../hooks/useTransactions";
import { getAllCategories } from "../../lib/helpers/categories";
import { getCategoryStats } from "../../lib/helpers/analysis";
import { currentMonth, formatMonthLabel } from "../../lib/helpers/date";
import { formatCurrency } from "../../lib/helpers/currency";
import { layout } from "../../theme/spacing";
import { Budget, Category } from "../../types";

import AppHeader from "../../components/common/AppHeader";
import MonthNavigator from "../../components/common/MonthNavigator";
import BudgetCard, { BudgetCardData } from "../../components/budgets/BudgetCard";
import SetBudgetModal from "../../components/budgets/SetBudgetModal";

type ModalState = {
  visible: boolean;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  existingBudget?: Budget;
};

const CLOSED_MODAL: ModalState = {
  visible: false,
  categoryName: "",
  categoryIcon: "",
  categoryColor: "#64748B",
};

export default function BudgetsScreen() {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();

  const [month, setMonth] = useState(currentMonth());
  const [categories, setCategories] = useState<Category[]>([]);
  const [modal, setModal] = useState<ModalState>(CLOSED_MODAL);

  const { data: budgets = [], isLoading: budgetsLoading, refetch: refetchBudgets } = useBudgetsByMonth(month);
  const { data: transactions = [], isLoading: txLoading, refetch: refetchTx } = useTransactionsByMonth(month);
  const deleteMutation = useDeleteBudget();

  const isLoading = budgetsLoading || txLoading;
  const refetch = () => { refetchBudgets(); refetchTx(); };

  useEffect(() => {
    getAllCategories().then(setCategories);
  }, []);

  // Spend per category this month
  const categoryStats = useMemo(
    () => getCategoryStats(transactions, categories),
    [transactions, categories]
  );

  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of categoryStats) map.set(s.name, s.amount);
    return map;
  }, [categoryStats]);

  // Budget cards data
  const budgetCards: BudgetCardData[] = useMemo(
    () =>
      budgets.map((b) => {
        const cat = categories.find((c) => c.name === b.categoryName);
        return {
          categoryName: b.categoryName,
          categoryIcon: cat?.icon ?? "📦",
          categoryColor: cat?.color ?? "#64748B",
          limit: b.limit,
          spent: spentByCategory.get(b.categoryName) ?? 0,
          month: formatMonthLabel(month),
          budgetId: b.id,
        };
      }),
    [budgets, categories, spentByCategory, month]
  );

  // Categories that have expenses but no budget set
  const unbudgetedCategories = useMemo(
    () =>
      categoryStats.filter(
        (s) => !budgets.some((b) => b.categoryName === s.name)
      ),
    [categoryStats, budgets]
  );

  // Expense categories with no spending AND no budget (to allow proactive budgeting)
  const allExpenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );

  // Totals
  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgetCards.reduce((s, c) => s + c.spent, 0);
  const totalPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const isOverall = totalSpent > totalBudget && totalBudget > 0;

  const openModal = (cat: Category, existing?: Budget) =>
    setModal({
      visible: true,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
      existingBudget: existing,
    });

  const handleDelete = (b: Budget, catName: string) =>
    Alert.alert("Delete Budget", `Remove budget for ${catName}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(b.id) },
    ]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader title="Budgets"  />
      <MonthNavigator month={month} onChange={setMonth} />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: layout.tabBarHeight + insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Overall summary card ─────────────────────────── */}
        {totalBudget > 0 && (
          <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={[styles.summaryLabel, { color: "rgba(255,255,255,0.7)" }]}>TOTAL BUDGET</Text>
                <Text style={[styles.summaryValue, { color: "#fff", fontSize: typography.size["2xl"], fontWeight: typography.weight.bold }]}>
                  {formatCurrency(totalBudget)}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.summaryLabel, { color: "rgba(255,255,255,0.7)" }]}>TOTAL SPENT</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color: isOverall ? colors.expenseLight : "#fff",
                      fontSize: typography.size["2xl"],
                      fontWeight: typography.weight.bold,
                    },
                  ]}
                >
                  {formatCurrency(totalSpent)}
                </Text>
              </View>
            </View>

            <View style={[styles.overallBarBg, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <View
                style={[
                  styles.overallBarFill,
                  {
                    width: `${totalPercent}%`,
                    backgroundColor: isOverall ? colors.expense : "rgba(255,255,255,0.85)",
                  },
                ]}
              />
            </View>

            <Text style={[styles.summaryRemaining, { color: "rgba(255,255,255,0.75)" }]}>
              {isOverall
                ? `Over budget by ${formatCurrency(totalSpent - totalBudget)}`
                : `${formatCurrency(totalBudget - totalSpent)} remaining · ${totalPercent.toFixed(0)}% used`}
            </Text>
          </View>
        )}

        {/* ── Budgeted categories ──────────────────────────── */}
        {budgetCards.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontSize: typography.size.xs }]}>
              BUDGETED · {formatMonthLabel(month).toUpperCase()}
            </Text>
            {budgetCards.map((card) => {
              const budget = budgets.find((b) => b.id === card.budgetId)!;
              const cat = categories.find((c) => c.name === card.categoryName);
              return (
                <BudgetCard
                  key={card.budgetId}
                  data={card}
                  onEdit={() => cat && openModal(cat, budget)}
                  onDelete={() => handleDelete(budget, card.categoryName)}
                />
              );
            })}
          </>
        )}

        {/* ── Not budgeted (has spending) ──────────────────── */}
        {unbudgetedCategories.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontSize: typography.size.xs }]}>
              NOT BUDGETED THIS MONTH
            </Text>
            {unbudgetedCategories.map((stat) => {
              const cat = categories.find((c) => c.name === stat.name);
              if (!cat) return null;
              return (
                <View
                  key={stat.name}
                  style={[styles.unbudgetedRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={[styles.unbudgetedIcon, { backgroundColor: stat.color + "22" }]}>
                    {(() => { const Icon = getCategoryIcon(stat.name); return <Icon size={20} color={stat.color} strokeWidth={1.7} />; })()}
                  </View>
                  <View style={styles.unbudgetedInfo}>
                    <Text style={[styles.unbudgetedName, { color: colors.text, fontWeight: typography.weight.medium }]}>
                      {stat.name}
                    </Text>
                    <Text style={[styles.unbudgetedSpent, { color: colors.expense, fontSize: typography.size.xs }]}>
                      Spent {formatCurrency(stat.amount)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => openModal(cat)}
                    style={[styles.setBudgetBtn, { borderColor: colors.primary }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.setBudgetLabel, { color: colors.primary, fontSize: typography.size.xs, fontWeight: typography.weight.semibold }]}>
                      SET BUDGET
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}

        {/* ── Add budget for any expense category ─────────── */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontSize: typography.size.xs }]}>
          ADD A BUDGET
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.addBudgetScroll}
        >
          {allExpenseCategories
            .filter((c) => !budgets.some((b) => b.categoryName === c.name))
            .map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => openModal(cat)}
                style={[styles.addBudgetChip, { backgroundColor: cat.color + "18", borderColor: cat.color + "44" }]}
                activeOpacity={0.7}
              >
                {(() => { const Icon = getCategoryIcon(cat.name); return <Icon size={16} color={cat.color} strokeWidth={1.7} />; })()}
                <Text style={[styles.addBudgetLabel, { color: colors.text, fontSize: typography.size.xs, fontWeight: typography.weight.medium }]}>
                  {cat.name}
                </Text>
                <Plus size={14} color={cat.color} strokeWidth={2} />
              </TouchableOpacity>
            ))}
        </ScrollView>

        {/* Empty state */}
        {budgets.length === 0 && unbudgetedCategories.length === 0 && (
          <View style={styles.empty}>
            <Text style={{ fontSize: 44 }}>💰</Text>
            <Text style={[styles.emptyTitle, { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.semibold }]}>
              No budgets yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Tap a category above to set a spending limit
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Set Budget Modal */}
      <SetBudgetModal
        visible={modal.visible}
        onClose={() => setModal(CLOSED_MODAL)}
        categoryName={modal.categoryName}
        categoryIcon={modal.categoryIcon}
        categoryColor={modal.categoryColor}
        month={month}
        existingBudget={modal.existingBudget}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  summaryCard: {
    margin: 16,
    borderRadius: layout.cardRadius,
    padding: 20,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summaryValue: {},
  overallBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  overallBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  summaryRemaining: {
    fontSize: 12,
  },
  sectionLabel: {
    fontWeight: "700",
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  unbudgetedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 12,
  },
  unbudgetedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  unbudgetedInfo: { flex: 1 },
  unbudgetedName: { fontSize: 14 },
  unbudgetedSpent: {},
  setBudgetBtn: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  setBudgetLabel: {},
  addBudgetScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4,
  },
  addBudgetChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  addBudgetLabel: {},
  empty: {
    alignItems: "center",
    paddingTop: 40,
    gap: 8,
  },
  emptyTitle: {},
  emptySubtitle: { fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
});

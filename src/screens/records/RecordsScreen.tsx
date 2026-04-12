import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../hooks/useTheme";
import {
  useTransactionsByMonth,
  useDeleteTransaction,
  useMonthlySummary,
} from "../../hooks/useTransactions";
import { usePrimaryAccount } from "../../hooks/useAccounts";
import { groupTransactionsByDate } from "../../lib/api/transactions";
import { currentMonth } from "../../lib/helpers/date";
import { layout } from "../../theme/spacing";
import { RootStackParamList } from "../../navigation/types";
import { Transaction } from "../../types";

import AppHeader from "../../components/common/AppHeader";
import MonthNavigator from "../../components/common/MonthNavigator";
import SummaryBar from "../../components/records/SummaryBar";
import AccountBanner from "../../components/records/AccountBanner";
import DateGroupHeader from "../../components/records/DateGroupHeader";
import TransactionItem from "../../components/records/TransactionItem";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function RecordsScreen() {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [month, setMonth] = useState(currentMonth());
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: transactions = [], isLoading, refetch } = useTransactionsByMonth(month);
  const { data: primaryAccount } = usePrimaryAccount();
  const deleteMutation = useDeleteTransaction();

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  const { income, expense } = useMonthlySummary(transactions);

  const sections = useMemo(() => {
    const groups = groupTransactionsByDate(filtered);
    return groups.map((g) => ({ title: g.date, data: g.items }));
  }, [filtered]);

  const handleDelete = useCallback(
    (tx: Transaction) => {
      Alert.alert("Delete Transaction", `Delete "${tx.title}"?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(tx.id),
        },
      ]);
    },
    [deleteMutation]
  );

  const handleSearchToggle = () => {
    if (isSearching) {
      setSearchQuery("");
      Keyboard.dismiss();
    }
    setIsSearching((v) => !v);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Records"
        rightElement={
          <TouchableOpacity onPress={handleSearchToggle} style={styles.iconBtn}>
            <Ionicons
              name={isSearching ? "close-outline" : "search-outline"}
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
        }
      />

      {isSearching && (
        <View style={[styles.searchBar, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            autoFocus
            placeholder="Search transactions..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text, fontSize: typography.size.base }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View>
            <AccountBanner
              account={primaryAccount ?? null}
              income={income}
              expense={expense}
              onPress={() => navigation.navigate("Accounts" as any)}
            />
            <MonthNavigator month={month} onChange={setMonth} />
            <SummaryBar income={income} expense={expense} />
          </View>
        }
        renderSectionHeader={({ section }) => (
          <DateGroupHeader date={section.title} transactions={section.data} />
        )}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onLongPress={() => handleDelete(item)}
          />
        )}
        ItemSeparatorComponent={() => null}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 36 }}>📭</Text>
            <Text style={[styles.emptyTitle, { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.semibold }]}>
              No transactions
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery ? `No results for "${searchQuery}"` : "Tap + to add your first transaction"}
            </Text>
          </View>
        }
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingBottom: layout.tabBarHeight + insets.bottom + 24, flexGrow: 1 }}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: layout.tabBarHeight + insets.bottom + 16 }]}
        onPress={() => navigation.navigate("AddTransaction")}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, padding: 0 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 8 },
  emptyTitle: { marginTop: 8 },
  emptySubtitle: { fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});

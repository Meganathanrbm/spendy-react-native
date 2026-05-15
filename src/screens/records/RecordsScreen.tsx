import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  Alert,
  RefreshControl,
  TextInput,
  Keyboard,
  Animated,
  Pressable,
} from "react-native";
import { Search, Plus, CircleX } from "lucide-react-native";
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
import DateGroupHeader from "../../components/records/DateGroupHeader";
import TransactionItem from "../../components/records/TransactionItem";
import TransactionDetailModal from "../../components/records/TransactionDetailModal";
import { SearchButton } from "../../components/common/searchButton/SearchButton";
import { ListHeader } from "../../components/records/ListHeader";
import { TransactionListSkeleton } from "../../components/records/TransactionItemSkeleton";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function RecordsScreen() {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [month, setMonth] = useState(currentMonth());
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const {
    data: transactions = [],
    isLoading,
    refetch,
  } = useTransactionsByMonth(month);
  const isFirstLoad = isLoading && transactions.length === 0;
  const { data: primaryAccount } = usePrimaryAccount();
  const deleteMutation = useDeleteTransaction();
  // Destructure the stable mutate fn so handleDelete doesn't invalidate every render
  const { mutate: deleteTransaction } = deleteMutation;

  // ── Animations ───────────────────────────────────────────────────────────
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabRotate = useRef(new Animated.Value(0)).current;
  const searchH = useRef(new Animated.Value(0)).current;
  const searchOp = useRef(new Animated.Value(0)).current;
  const fabPulse = useRef(new Animated.Value(1)).current;
  const fabPulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const startFabPulse = () => {
    fabPulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 1.06,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );
    fabPulseLoop.current.start();
  };

  const stopFabPulse = () => {
    fabPulseLoop.current?.stop();
    fabPulseLoop.current = null;
    fabPulse.setValue(1); // snap to neutral so multiply stays at fabScale * 1
  };

  useEffect(() => {
    startFabPulse();
    return () => stopFabPulse();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(searchH, {
        toValue: isSearching ? 52 : 0,
        useNativeDriver: false,
        tension: 180,
        friction: 20,
      }),
      Animated.timing(searchOp, {
        toValue: isSearching ? 1 : 0,
        duration: 160,
        useNativeDriver: false,
      }),
      // Rotate search icon → close icon
      Animated.spring(fabRotate, {
        toValue: isSearching ? 1 : 0,
        useNativeDriver: true,
        tension: 160,
        friction: 14,
      }),
    ]).start();
  }, [isSearching]);

  // ── Data ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
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
          onPress: () => deleteTransaction(tx.id),
        },
      ]);
    },
    [deleteTransaction],
  );

  const handleSearchToggle = useCallback(() => {
    setIsSearching((v) => {
      if (v) {
        setSearchQuery("");
        Keyboard.dismiss();
      }
      return !v;
    });
  }, []);

  // FAB press handlers
  const onFabPressIn = useCallback(() => {
    stopFabPulse();
    Animated.spring(fabScale, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 60,
      bounciness: 0,
    }).start();
  }, []);

  const onFabPressOut = useCallback(() => {
    Animated.spring(fabScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 14,
    }).start(() => startFabPulse());
  }, []);

  const onAccountPress = useCallback(
    () => navigation.navigate("Accounts" as any),
    [navigation],
  );

  // Render as a function so SectionList treats it as a component, not an
  // element. This prevents the header from remounting when props change.
  const ListHeaderComponent = useCallback(
    () => (
      <ListHeader
        account={primaryAccount ?? null}
        income={income}
        expense={expense}
        month={month}
        onMonthChange={setMonth}
        onAccountPress={onAccountPress}
      />
    ),
    [primaryAccount, income, expense, month, setMonth, onAccountPress],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; data: Transaction[] } }) => (
      <DateGroupHeader date={section.title} transactions={section.data} />
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionItem
        transaction={item}
        onPress={setSelectedTx}
        onLongPress={handleDelete}
      />
    ),
    [handleDelete, setSelectedTx],
  );

  // handleSearchToggle is stable (no deps). fabSpin is a useRef. So this memo
  // only invalidates when isSearching or colors.text changes — both correct.
  const searchRight = (
    <SearchButton
      isSearching={isSearching}
      color={colors.text}
      onPress={handleSearchToggle}
    />
  );

  const ListEmptyComponent = (
    <View style={styles.empty}>
      <Text style={{ fontSize: 36 }}>📭</Text>
      <Text
        style={[
          styles.emptyTitle,
          {
            color: colors.text,
            fontSize: typography.size.lg,
            fontWeight: typography.weight.semibold,
          },
        ]}
      >
        No transactions
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {searchQuery
          ? `No results for "${searchQuery}"`
          : "Tap + to add your first transaction"}
      </Text>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader title="Records" rightElement={searchRight} />

      {/* Animated search bar */}
      {isSearching && (
        <View style={styles.searchWrapper}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
              },
            ]}
          >
            <Search size={16} color={colors.textMuted} strokeWidth={1.7} />
            <TextInput
              autoFocus={isSearching}
              placeholder="Search transactions..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[
                styles.searchInput,
                { color: colors.text, fontSize: typography.size.base },
              ]}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <CircleX size={16} color={colors.textMuted} strokeWidth={1.7} />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {isFirstLoad ? (
        <TransactionListSkeleton />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={ListHeaderComponent}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          ItemSeparatorComponent={() => null}
          ListEmptyComponent={ListEmptyComponent}
          stickySectionHeadersEnabled
          contentContainerStyle={{
            paddingBottom: layout.tabBarHeight + insets.bottom + 24,
            flexGrow: 1,
          }}
        />
      )}

      <TransactionDetailModal
        transaction={selectedTx}
        visible={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
      />

      <Pressable
        onPressIn={onFabPressIn}
        onPressOut={onFabPressOut}
        onPress={() => navigation.navigate("AddTransaction")}
        style={[
          styles.fabHit,
          { bottom: layout.tabBarHeight + insets.bottom + 16 },
        ]}
      >
        <Animated.View
          style={[
            styles.fab,
            {
              backgroundColor: colors.primary,
              transform: [{ scale: Animated.multiply(fabScale, fabPulse) }],
            },
          ]}
        >
          <Plus size={26} color="#0A0A0A" strokeWidth={2} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrapper: {
    overflow: "hidden",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, padding: 0 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 8,
  },
  emptyTitle: { marginTop: 8 },
  emptySubtitle: { fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
  fabHit: {
    position: "absolute",
    right: 18,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 14, // rounded square per Spendy 2.0
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
});

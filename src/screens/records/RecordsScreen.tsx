import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  memo,
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
import { Account, Transaction } from "../../types";

import AppHeader from "../../components/common/AppHeader";
import MonthNavigator from "../../components/common/MonthNavigator";
import SummaryBar from "../../components/records/SummaryBar";
import AccountBanner from "../../components/records/AccountBanner";
import DateGroupHeader from "../../components/records/DateGroupHeader";
import TransactionItem from "../../components/records/TransactionItem";

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Defined outside RecordsScreen so its identity is stable across renders.
// Passing a JSX element to ListHeaderComponent causes remount on every dep
// change; a component reference avoids that entirely.
type ListHeaderProps = {
  account: Account | null;
  income: number;
  expense: number;
  month: string;
  onMonthChange: (m: string) => void;
  onAccountPress: () => void;
};

const ListHeader = memo(function ListHeader({
  account,
  income,
  expense,
  month,
  onMonthChange,
  onAccountPress,
}: ListHeaderProps) {
  return (
    <View>
      <AccountBanner
        account={account}
        income={income}
        expense={expense}
        onPress={onAccountPress}
      />
      <MonthNavigator month={month} onChange={onMonthChange} />
      <SummaryBar income={income} expense={expense} />
    </View>
  );
});

// Stable memo component so AppHeader never gets a new `rightElement` element
// identity when isSearching or colors change — avoids Pressable remounts.
type SearchButtonProps = {
  isSearching: boolean;
  color: string;
  spin: Animated.AnimatedInterpolation<string>;
  onPress: () => void;
};

const SearchButton = memo(function SearchButton({
  isSearching,
  color,
  spin,
  onPress,
}: SearchButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={searchBtnStyle}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Ionicons
          name={isSearching ? "close-outline" : "search-outline"}
          size={22}
          color={color}
        />
      </Animated.View>
    </Pressable>
  );
});

const searchBtnStyle = { width: 36, height: 36, alignItems: "center" as const, justifyContent: "center" as const };

export default function RecordsScreen() {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [month, setMonth] = useState(currentMonth());
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const {
    data: transactions = [],
    isLoading,
    refetch,
  } = useTransactionsByMonth(month);
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
  // Stable interpolation — must not be recreated on each render or useMemo
  // deps that reference it (searchIconNode) will invalidate every frame.
  const fabSpin = useRef(
    fabRotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "135deg"] }),
  ).current;

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
      <TransactionItem transaction={item} onLongPress={handleDelete} />
    ),
    [handleDelete],
  );

  // handleSearchToggle is stable (no deps). fabSpin is a useRef. So this memo
  // only invalidates when isSearching or colors.text changes — both correct.
  const searchRight = useMemo(
    () => (
      <SearchButton
        isSearching={isSearching}
        color={colors.text}
        spin={fabSpin}
        onPress={handleSearchToggle}
      />
    ),
    [isSearching, colors.text, fabSpin, handleSearchToggle],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader title="Records" rightElement={searchRight} />

      {/* Animated search bar */}
      <Animated.View
        style={[styles.searchWrapper, { height: searchH, opacity: searchOp }]}
      >
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
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
              <Ionicons
                name="close-circle"
                size={16}
                color={colors.textMuted}
              />
            </Pressable>
          )}
        </View>
      </Animated.View>

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
        ListEmptyComponent={
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
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              {searchQuery
                ? `No results for "${searchQuery}"`
                : "Tap + to add your first transaction"}
            </Text>
          </View>
        }
        stickySectionHeadersEnabled
        contentContainerStyle={{
          paddingBottom: layout.tabBarHeight + insets.bottom + 24,
          flexGrow: 1,
        }}
      />

      {/* Animated FAB */}
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
          <Ionicons name="add" size={28} color="#fff" />
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
    right: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
});

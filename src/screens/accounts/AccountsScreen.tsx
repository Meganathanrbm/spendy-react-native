import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../hooks/useTheme";
import { useAccounts, useUpdateAccount, useDeleteAccount } from "../../hooks/useAccounts";
import { useTransactions } from "../../hooks/useTransactions";
import { formatCurrency } from "../../lib/helpers/currency";
import { layout } from "../../theme/spacing";
import { Account } from "../../types";

import AppHeader from "../../components/common/AppHeader";
import AccountCard from "../../components/accounts/AccountCard";
import AddAccountModal from "../../components/accounts/AddAccountModal";

export default function AccountsScreen() {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();

  const { data: accounts = [], isLoading, refetch } = useAccounts();
  const { data: transactions = [] } = useTransactions();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();

  const netWorth = useMemo(() => accounts.reduce((s, a) => s + a.balance, 0), [accounts]);

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalExpense = useMemo(
    () => transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const handleSetPrimary = async (account: Account) => {
    await updateMutation.mutateAsync({ ...account, isPrimary: true });
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setModalVisible(true);
  };

  const handleDelete = (account: Account) => {
    if (account.isPrimary) {
      Alert.alert("Cannot Delete", "Set another account as primary first.");
      return;
    }
    Alert.alert(
      "Delete Account",
      `Delete "${account.name}"? Transactions won't be affected.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(account.id) },
      ]
    );
  };

  const openAddModal = () => {
    setEditingAccount(undefined);
    setModalVisible(true);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Accounts"
        rightElement={
          <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: layout.tabBarHeight + insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Net Worth card */}
        <View style={[styles.netWorthCard, { backgroundColor: colors.primary }]}>
          <Text style={[styles.netWorthLabel, { color: "rgba(255,255,255,0.7)" }]}>NET WORTH</Text>
          <Text style={[styles.netWorthAmount, { color: "#fff", fontSize: typography.size["3xl"], fontWeight: typography.weight.extrabold }]}>
            {formatCurrency(netWorth)}
          </Text>
          <View style={styles.netWorthStats}>
            <View style={styles.netWorthStat}>
              <Ionicons name="arrow-down-circle-outline" size={14} color="#A7F3D0" />
              <Text style={[styles.netWorthStatLabel, { color: "rgba(255,255,255,0.7)" }]}>Income</Text>
              <Text style={[styles.netWorthStatVal, { color: "#fff" }]}>{formatCurrency(totalIncome, { compact: true })}</Text>
            </View>
            <View style={[styles.netWorthDivider, { backgroundColor: "rgba(255,255,255,0.2)" }]} />
            <View style={styles.netWorthStat}>
              <Ionicons name="arrow-up-circle-outline" size={14} color="#FCA5A5" />
              <Text style={[styles.netWorthStatLabel, { color: "rgba(255,255,255,0.7)" }]}>Expense</Text>
              <Text style={[styles.netWorthStatVal, { color: "#fff" }]}>{formatCurrency(totalExpense, { compact: true })}</Text>
            </View>
            <View style={[styles.netWorthDivider, { backgroundColor: "rgba(255,255,255,0.2)" }]} />
            <View style={styles.netWorthStat}>
              <Ionicons name="wallet-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={[styles.netWorthStatLabel, { color: "rgba(255,255,255,0.7)" }]}>Accounts</Text>
              <Text style={[styles.netWorthStatVal, { color: "#fff" }]}>{accounts.length}</Text>
            </View>
          </View>
        </View>

        {/* Accounts list */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted, fontSize: typography.size.xs }]}>
            ALL ACCOUNTS
          </Text>
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onSetPrimary={() => handleSetPrimary(account)}
              onEdit={() => handleEdit(account)}
              onDelete={() => handleDelete(account)}
            />
          ))}

          {/* Add new dashed button */}
          <TouchableOpacity
            onPress={openAddModal}
            style={[styles.addCard, { borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={22} color={colors.textMuted} />
            <Text style={[styles.addCardText, { color: colors.textMuted, fontSize: typography.size.sm }]}>
              Add New Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Breakdown */}
        {accounts.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted, fontSize: typography.size.xs, paddingHorizontal: 0, marginBottom: 12 }]}>
              BALANCE BREAKDOWN
            </Text>
            {accounts.map((account) => {
              const pct = netWorth > 0 ? (account.balance / netWorth) * 100 : 0;
              return (
                <View key={account.id} style={styles.breakdownRow}>
                  <Text style={[styles.breakdownIcon]}>{account.icon}</Text>
                  <Text style={[styles.breakdownName, { color: colors.text, fontSize: typography.size.sm, flex: 1 }]} numberOfLines={1}>
                    {account.name}
                  </Text>
                  <View style={[styles.breakdownBarTrack, { backgroundColor: colors.surfaceAlt, flex: 2 }]}>
                    <View style={[styles.breakdownBarFill, { backgroundColor: account.color, width: `${Math.max(pct, 1)}%` }]} />
                  </View>
                  <Text style={[styles.breakdownPct, { color: colors.textMuted, fontSize: typography.size.xs }]}>
                    {pct.toFixed(0)}%
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <AddAccountModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingAccount(undefined); }}
        existing={editingAccount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  addBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  netWorthCard: {
    margin: 16,
    borderRadius: layout.cardRadius,
    padding: 20,
    gap: 4,
  },
  netWorthLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  netWorthAmount: { marginTop: 4 },
  netWorthStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  netWorthStat: { flex: 1, alignItems: "center", gap: 3 },
  netWorthStatLabel: { fontSize: 10 },
  netWorthStatVal: { fontSize: 13, fontWeight: "600" },
  netWorthDivider: { width: 1, height: 28 },
  section: { paddingHorizontal: 16, gap: 10 },
  sectionTitle: { fontWeight: "700", letterSpacing: 0.8, paddingHorizontal: 4, marginBottom: 4 },
  addCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: layout.cardRadius,
    paddingVertical: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  addCardText: {},
  card: {
    margin: 16,
    marginTop: 8,
    borderRadius: layout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  breakdownIcon: { fontSize: 16, width: 24, textAlign: "center" },
  breakdownName: {},
  breakdownBarTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  breakdownBarFill: { height: 6, borderRadius: 3 },
  breakdownPct: { width: 30, textAlign: "right" },
});

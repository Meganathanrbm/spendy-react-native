import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { Plus, CirclePlus } from "lucide-react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../hooks/useTheme";
import {
  useAccounts,
  useUpdateAccount,
  useDeleteAccount,
} from "../../hooks/useAccounts";
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
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();

  const netWorth = useMemo(
    () => accounts.reduce((s, a) => s + a.balance, 0),
    [accounts],
  );


  const handleSetPrimary = useCallback(async (id: string) => {
    const account = accounts.find((a) => a.id === id);
    if (account) await updateMutation.mutateAsync({ ...account, isPrimary: true });
  }, [accounts, updateMutation]);

  const handleEdit = useCallback((id: string) => {
    const account = accounts.find((a) => a.id === id);
    if (account) {
      setEditingAccount(account);
      setModalVisible(true);
    }
  }, [accounts]);

  const handleDelete = useCallback((id: string) => {
    const account = accounts.find((a) => a.id === id);
    if (!account) return;
    if (account.isPrimary) {
      Alert.alert("Cannot Delete", "Set another account as primary first.");
      return;
    }
    Alert.alert(
      "Delete Account",
      `Delete "${account.name}"? Transactions won't be affected.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(account.id),
        },
      ],
    );
  }, [accounts, deleteMutation]);

  const openAddModal = useCallback(() => {
    setEditingAccount(undefined);
    setModalVisible(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setEditingAccount(undefined);
  }, []);


  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Accounts"
        rightElement={
          <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
            <Plus size={24} color={colors.primary} strokeWidth={1.7} />
          </TouchableOpacity>
        }
      />

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
        {/* Net Worth card */}
        <View
          style={[styles.netWorthCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.netWorthLabel, { color: colors.textMuted }]}>
            Net worth
          </Text>
          <Text
            style={[
              styles.netWorthAmount,
              {
                color: colors.text,
                fontSize: typography.size["3xl"],
                fontWeight: typography.weight.extrabold,
              },
            ]}
          >
            {formatCurrency(netWorth)}
          </Text>
          <Text style={[styles.netWorthSub, { color: colors.textMuted }]}>
            Across {accounts.length} account{accounts.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Accounts list */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textMuted, fontSize: typography.size.xs },
            ]}
          >
            YOUR ACCOUNTS
          </Text>
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onSetPrimary={handleSetPrimary}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

          {/* Add new dashed button */}
          <TouchableOpacity
            onPress={openAddModal}
            style={[styles.addCard, { borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <CirclePlus size={22} color={colors.textMuted} strokeWidth={1.7} />
            <Text
              style={[
                styles.addCardText,
                { color: colors.textMuted, fontSize: typography.size.sm },
              ]}
            >
              Add New Account
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <AddAccountModal
        visible={modalVisible}
        onClose={handleModalClose}
        existing={editingAccount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  addBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  netWorthCard: {
    margin: 16,
    borderRadius: layout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 4,
  },
  netWorthLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.3 },
  netWorthAmount: { marginTop: 4 },
  netWorthSub: { fontSize: 11, marginTop: 2 },
  section: { paddingHorizontal: 16, gap: 10 },
  sectionTitle: {
    fontWeight: "700",
    letterSpacing: 0.8,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
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
});

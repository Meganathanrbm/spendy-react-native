import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
} from "react-native";
import {
  ArrowDown, ArrowUp, CircleCheck, CreditCard, Info,
  X, Check, ArrowLeft, CheckCheck, Mail, RefreshCw,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import uuid from "react-native-uuid";

import { useTheme } from "../../hooks/useTheme";
import { useAccounts } from "../../hooks/useAccounts";
import { useSaveTransaction, useTransactionsByPeriod } from "../../hooks/useTransactions";
import {
  fetchParsedBankTransactions,
  requestSMSPermission,
} from "../../lib/helpers/smsService";
import { formatCurrency } from "../../lib/helpers/currency";
import { SMSDraft, Account } from "../../types";
import { TouchableOpacity } from "react-native";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchAccount(
  draft: SMSDraft,
  accounts: Account[],
): Account | undefined {
  if (!draft.parsedLastFour) return undefined;
  return accounts.find(
    (a) =>
      a.lastFourDigits === draft.parsedLastFour ||
      (a.bankName &&
        a.bankName.toLowerCase() === draft.parsedBank.toLowerCase() &&
        a.lastFourDigits === draft.parsedLastFour),
  );
}

// ─── Draft card ───────────────────────────────────────────────────────────────

type DraftCardProps = {
  draft: SMSDraft;
  matchedAccount?: Account;
  onAccept: () => void;
  onDismiss: () => void;
  colors: any;
  typography: any;
};

const DraftCard = ({
  draft,
  matchedAccount,
  onAccept,
  onDismiss,
  colors,
  typography,
}: DraftCardProps) => {
  const isCredit = draft.parsedType === "income";
  const amountColor = isCredit ? colors.income : colors.expense;
  const accentBg = isCredit ? colors.incomeLight : colors.expenseLight;
  const category = draft.suggestedCategory ?? "Others";
  const icon = draft.suggestedIcon ?? (isCredit ? "💰" : "💸");
  const merchant =
    draft.parsedMerchant ??
    `${draft.parsedBank} ${isCredit ? "Credit" : "Debit"}`;

  const dateStr = new Date(draft.parsedDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* ── Top strip: bank + type indicator ── */}
      <View style={[styles.topStrip, { backgroundColor: accentBg }]}>
        <View style={styles.topLeft}>
          <View style={[styles.typeIcon, { backgroundColor: amountColor }]}>
            {isCredit ? <ArrowDown size={10} color="#fff" strokeWidth={2} /> : <ArrowUp size={10} color="#fff" strokeWidth={2} />}
          </View>
          <Text
            style={[
              styles.bankName,
              { color: amountColor, fontSize: typography.size.xs },
            ]}
          >
            {draft.parsedBank}
          </Text>
          <Text
            style={[
              styles.typePill,
              { color: amountColor, fontSize: typography.size.xs },
            ]}
          >
            {isCredit ? "CREDIT" : "DEBIT"}
          </Text>
        </View>
        <Text
          style={[
            styles.dateLabel,
            { color: colors.textMuted, fontSize: typography.size.xs },
          ]}
        >
          {dateStr}
        </Text>
      </View>

      {/* ── Body ── */}
      <View style={styles.body}>
        {/* Merchant row */}
        <View style={styles.merchantRow}>
          <View style={[styles.iconCircle, { backgroundColor: accentBg }]}>
            <Text style={styles.iconEmoji}>{icon}</Text>
          </View>
          <View style={styles.merchantInfo}>
            <Text
              style={[
                styles.merchantName,
                {
                  color: colors.text,
                  fontSize: typography.size.base,
                  fontWeight: typography.weight.semibold,
                },
              ]}
              numberOfLines={1}
            >
              {merchant}
            </Text>
            <Text
              style={[
                styles.categoryLabel,
                { color: colors.textMuted, fontSize: typography.size.xs },
              ]}
            >
              {category}
            </Text>
          </View>
          <Text
            style={[
              styles.amount,
              {
                color: amountColor,
                fontSize: typography.size.xl,
                fontWeight: typography.weight.bold,
              },
            ]}
          >
            {isCredit ? "+" : "−"}
            {formatCurrency(draft.parsedAmount)}
          </Text>
        </View>

        {/* Account chip row */}
        <View style={styles.chipRow}>
          {matchedAccount ? (
            <View
              style={[styles.chip, { backgroundColor: colors.primaryMuted }]}
            >
              <CircleCheck size={11} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.chipText, { color: colors.primary }]}>
                {matchedAccount.name}
              </Text>
            </View>
          ) : draft.parsedLastFour ? (
            <View style={[styles.chip, { backgroundColor: colors.surfaceAlt }]}>
              <CreditCard size={11} color={colors.textMuted} strokeWidth={1.7} />
              <Text style={[styles.chipText, { color: colors.textMuted }]}>
                ••••{draft.parsedLastFour}
              </Text>
            </View>
          ) : (
            <View style={[styles.chip, { backgroundColor: colors.surfaceAlt }]}>
              <Info size={11} color={colors.textMuted} strokeWidth={1.7} />
              <Text style={[styles.chipText, { color: colors.textMuted }]}>
                No account matched
              </Text>
            </View>
          )}
        </View>

        {/* SMS preview */}
        <Text
          style={[
            styles.smsText,
            {
              color: colors.textMuted,
              borderTopColor: colors.divider,
              fontSize: typography.size.xs,
            },
          ]}
          numberOfLines={2}
        >
          {draft.rawSms}
        </Text>
      </View>

      {/* ── Actions ── */}
      <View style={[styles.actions, { borderTopColor: colors.divider }]}>
        <TouchableOpacity
          onPress={onDismiss}
          style={[styles.actionBtn, { borderColor: colors.border }]}
        >
          <X size={16} color={colors.textMuted} strokeWidth={1.7} />
          <Text
            style={[
              styles.actionLabel,
              { color: colors.textMuted, fontSize: typography.size.sm },
            ]}
          >
            Dismiss
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onAccept}
          style={[
            styles.actionBtn,
            { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
        >
          <Check size={16} color="#fff" strokeWidth={2} />
          <Text
            style={[
              styles.actionLabel,
              {
                color: "#fff",
                fontSize: typography.size.sm,
                fontWeight: typography.weight.semibold,
              },
            ]}
          >
            Add Transaction
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SMSInboxScreen() {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { data: accounts = [] } = useAccounts();
  const { data: existingTransactions = [] } = useTransactionsByPeriod();
  const saveTransaction = useSaveTransaction();

  const [drafts, setDrafts] = useState<SMSDraft[]>([]);
  const [accepted, setAccepted] = useState<SMSDraft[]>([]);
  const [dismissed, setDismissed] = useState<SMSDraft[]>([]);
  const [tab, setTab] = useState<"pending" | "accepted" | "dismissed">("pending");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const loadTransactions = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const granted = await requestSMSPermission();
      setHasPermission(granted);
      if (!granted) {
        setError(
          "SMS permission denied. Enable it in Settings → Apps → Spendy → Permissions.",
        );
        return;
      }
      const results = await fetchParsedBankTransactions(30, existingTransactions, accounts);
      setDrafts(results);
      if (results.length === 0)
        setError("No bank SMS found in the last 30 days.");
    } catch (e: any) {
      setError(e?.message ?? "Failed to read SMS.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [existingTransactions]);

  useEffect(() => {
    if (Platform.OS === "android") loadTransactions();
    else setError("SMS reading is only available on Android devices.");
  }, [loadTransactions]);

  const handleAccept = useCallback(
    async (draft: SMSDraft) => {
      const matched = matchAccount(draft, accounts);
      const primary = accounts.find((a) => a.isPrimary) ?? accounts[0];
      const account = matched ?? primary;

      if (!account) {
        Alert.alert(
          "No Account",
          "Create an account first before adding transactions.",
        );
        return;
      }
      try {
        await saveTransaction.mutateAsync({
          id: uuid.v4() as string,
          title:
            draft.parsedMerchant ??
            `${draft.parsedBank} ${draft.parsedType === "income" ? "Credit" : "Debit"}`,
          amount: draft.parsedAmount,
          type: draft.parsedType,
          category: draft.suggestedCategory ?? "Others",
          date: draft.parsedDate,
          icon:
            draft.suggestedIcon ??
            (draft.parsedType === "income" ? "💰" : "💸"),
          accountId: account.id,
          isAutoDetected: true,
          smsSource: draft.parsedBank,
        });
        setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
        setAccepted((prev) => [...prev, draft]);
      } catch {
        Alert.alert("Error", "Failed to save transaction.");
      }
    },
    [accounts, saveTransaction],
  );

  const handleDismiss = useCallback(
    (id: string) => {
      const draft = drafts.find((d) => d.id === id);
      setDrafts((p) => p.filter((d) => d.id !== id));
      if (draft) setDismissed((prev) => [...prev, draft]);
    },
    [drafts],
  );
  const handleAcceptAll = useCallback(() => {
    if (!drafts.length) return;
    Alert.alert("Add All", `Add all ${drafts.length} detected transactions?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Add All",
        onPress: async () => {
          const toProcess = [...drafts];
          for (const draft of toProcess) {
            await handleAccept(draft);
          }
        },
      },
    ]);
  }, [drafts, handleAccept]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.iconBtn,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <ArrowLeft size={22} color={colors.text} strokeWidth={1.7} />
        </Pressable>

        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
              fontSize: typography.size.md,
              fontWeight: typography.weight.semibold,
            },
          ]}
        >
          SMS Transactions
        </Text>

        {drafts.length > 0 ? (
          <Pressable
            onPress={handleAcceptAll}
            style={({ pressed }) => [
              styles.addAllBtn,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text
              style={[
                styles.addAllLabel,
                {
                  color: colors.primary,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.semibold,
                },
              ]}
            >
              Add All
            </Text>
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>

      {/* ── Tabs ── */}
      <View style={[styles.tabsRow, { borderBottomColor: colors.border }]}>
        {(["pending", "accepted", "dismissed"] as const).map((t) => {
          const count = t === "pending" ? drafts.length : t === "accepted" ? accepted.length : dismissed.length;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[
                styles.tabBtn,
                tab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabBtnText, { color: tab === t ? colors.text : colors.textMuted }]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
              {count > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: t === "pending" ? colors.primaryMuted : colors.surfaceAlt }]}>
                  <Text style={[styles.tabBadgeText, { color: t === "pending" ? colors.primary : colors.textMuted }]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Loading ── */}
      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={[
              styles.stateLabel,
              { color: colors.textMuted, fontSize: typography.size.sm },
            ]}
          >
            Reading bank SMS…
          </Text>
        </View>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <View style={styles.center}>
          <View
            style={[styles.stateIcon, { backgroundColor: colors.surfaceAlt }]}
          >
            <Mail size={32} color={colors.textMuted} strokeWidth={1.5} />
          </View>
          <Text
            style={[
              styles.stateTitle,
              {
                color: colors.text,
                fontSize: typography.size.base,
                fontWeight: typography.weight.semibold,
              },
            ]}
          >
            {Platform.OS !== "android"
              ? "Android Only"
              : "Something went wrong"}
          </Text>
          <Text
            style={[
              styles.stateLabel,
              { color: colors.textMuted, fontSize: typography.size.sm },
            ]}
          >
            {error}
          </Text>
          {Platform.OS === "android" && (
            <Pressable
              onPress={() => loadTransactions()}
              style={({ pressed }) => [
                styles.retryBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <RefreshCw size={16} color="#fff" strokeWidth={1.7} />
              <Text
                style={[
                  styles.btnLabel,
                  {
                    color: "#fff",
                    fontSize: typography.size.sm,
                    fontWeight: typography.weight.semibold,
                  },
                ]}
              >
                Try Again
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && tab === "pending" && drafts.length === 0 && hasPermission && (
        <View style={styles.center}>
          <View style={[styles.stateIcon, { backgroundColor: colors.incomeLight }]}>
            <CheckCheck size={32} color={colors.income} strokeWidth={1.5} />
          </View>
          <Text style={[styles.stateTitle, { color: colors.text, fontSize: typography.size.base, fontWeight: typography.weight.semibold }]}>
            All caught up!
          </Text>
          <Text style={[styles.stateLabel, { color: colors.textMuted, fontSize: typography.size.sm }]}>
            No pending bank SMS transactions.
          </Text>
        </View>
      )}

      {!loading && !error && tab !== "pending" && (tab === "accepted" ? accepted : dismissed).length === 0 && (
        <View style={styles.center}>
          <Text style={[styles.stateTitle, { color: colors.text, fontSize: typography.size.base, fontWeight: typography.weight.semibold }]}>
            Nothing here
          </Text>
          <Text style={[styles.stateLabel, { color: colors.textMuted, fontSize: typography.size.sm }]}>
            No {tab} transactions yet.
          </Text>
        </View>
      )}

      {/* ── List ── */}
      {!loading && (() => {
        const listData = tab === "pending" ? drafts : tab === "accepted" ? accepted : dismissed;
        if (listData.length === 0) return null;
        return (
          <FlatList
            data={listData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: insets.bottom + 28 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            removeClippedSubviews
            maxToRenderPerBatch={8}
            windowSize={10}
            refreshControl={
              tab === "pending" ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => loadTransactions(true)}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                />
              ) : undefined
            }
            renderItem={({ item }) => (
              <DraftCard
                draft={item}
                matchedAccount={matchAccount(item, accounts)}
                onAccept={tab === "pending" ? () => handleAccept(item) : () => {}}
                onDismiss={tab === "pending" ? () => handleDismiss(item.id) : () => {}}
                colors={colors}
                typography={typography}
              />
            )}
          />
        );
      })()}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { flex: 1, textAlign: "center" },
  addAllBtn: {
    width: 64,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  addAllLabel: {},

  // Tabs
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
  },
  tabBtnText: { fontSize: 12.5, fontWeight: "600" },
  tabBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 },
  tabBadgeText: { fontSize: 10, fontWeight: "600" },

  // Banner
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  bannerText: { fontWeight: "500" },

  // States
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 10,
  },
  stateIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  stateTitle: {},
  stateLabel: { textAlign: "center", lineHeight: 20 },
  retryBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 12,
  },

  // Card
  card: {
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  topStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  topLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  typeIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  bankName: { fontWeight: "600", letterSpacing: 0.2 },
  typePill: { fontWeight: "700", letterSpacing: 0.6, opacity: 0.7 },
  dateLabel: { fontWeight: "400" },

  body: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4, gap: 10 },

  merchantRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: { fontSize: 20 },
  merchantInfo: { flex: 1, minWidth: 0 },
  merchantName: { lineHeight: 20 },
  categoryLabel: { marginTop: 1 },
  amount: { flexShrink: 0, marginLeft: 8 },

  chipRow: { flexDirection: "row", alignItems: "center" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chipText: { fontSize: 11, fontWeight: "500" },

  smsText: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingBottom: 4,
    lineHeight: 17,
    fontStyle: "italic",
  },

  // Actions
  actions: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  dismissBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  dismissLabel: { fontWeight: "500" },
  addBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 14,
  },
  addLabel: { fontWeight: "600", letterSpacing: 0.3 },
  btnLabel: { fontWeight: "500" },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionLabel: {},
});

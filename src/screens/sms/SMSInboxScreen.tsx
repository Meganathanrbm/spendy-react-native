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
  TouchableOpacity,
} from "react-native";
import {
  X,
  Check,
  CheckCheck,
  Mail,
  RefreshCw,
  Pencil,
  ChevronRight,
  Tag,
} from "lucide-react-native";
import { getCategoryIcon, getAccountTypeIcon } from "../../lib/helpers/categoryIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import uuid from "react-native-uuid";

import { useTheme } from "../../hooks/useTheme";
import { useAccounts } from "../../hooks/useAccounts";
import {
  useSaveTransaction,
  useTransactionsByPeriod,
} from "../../hooks/useTransactions";
import {
  fetchParsedBankTransactions,
  requestSMSPermission,
} from "../../lib/helpers/smsService";
import { formatCurrency } from "../../lib/helpers/currency";
import { SMSDraft, Account, TransactionType } from "../../types";
import CategoryPicker from "../../components/transaction/CategoryPicker";
import BottomSheet from "../../components/common/BottomSheet";

// ─── Types ────────────────────────────────────────────────────────────────────

type DraftWithEdits = SMSDraft & {
  editType: TransactionType;
  editCategory: string;
  editAccountId: string;
};

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

function initDraft(draft: SMSDraft, accounts: Account[]): DraftWithEdits {
  const matched = matchAccount(draft, accounts);
  const primary = accounts.find((a) => a.isPrimary) ?? accounts[0];
  const account = matched ?? primary;
  return {
    ...draft,
    editType: draft.parsedType,
    editCategory: draft.suggestedCategory ?? "Other",
    editAccountId: account?.id ?? "",
  };
}

function formatCardTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const TYPE_CONFIG: Record<TransactionType, { label: string; dotColor: string }> =
  {
    income: { label: "INCOME", dotColor: "#34D399" },
    expense: { label: "EXPENSE", dotColor: "#F59E0B" },
    transfer: { label: "TRANSFER", dotColor: "#60A5FA" },
  };

// ─── Draft Card ───────────────────────────────────────────────────────────────

type DraftCardProps = {
  draft: DraftWithEdits;
  isEditing: boolean;
  tab: "pending" | "accepted" | "dismissed";
  accounts: Account[];
  colors: any;
  typography: any;
  onEdit: () => void;
  onDone: () => void;
  onAccept: () => void;
  onDismiss: () => void;
  onRestore: () => void;
  onTypeChange: (type: TransactionType) => void;
  onCategoryChange: (category: string) => void;
  onAccountChange: (accountId: string) => void;
};

const DraftCard = ({
  draft,
  isEditing,
  tab,
  accounts,
  colors,
  typography,
  onEdit,
  onDone,
  onAccept,
  onDismiss,
  onRestore,
  onTypeChange,
  onCategoryChange,
  onAccountChange,
}: DraftCardProps) => {
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);

  const typeConfig = TYPE_CONFIG[draft.editType] ?? TYPE_CONFIG.expense;
  const isIncome = draft.editType === "income";
  const isTransfer = draft.editType === "transfer";
  const isDismissed = tab === "dismissed";
  const isAccepted = tab === "accepted";

  const merchant =
    draft.parsedMerchant ??
    `${draft.parsedBank} ${draft.parsedType === "income" ? "Credit" : "Debit"}`;

  const CategoryIcon = isDismissed ? Tag : getCategoryIcon(draft.editCategory);

  const iconBg = isDismissed
    ? colors.surfaceAlt
    : isIncome
      ? colors.incomeLight
      : isTransfer
        ? colors.transferLight
        : colors.expenseLight;

  const iconColor = isDismissed
    ? colors.textMuted
    : isIncome
      ? colors.income
      : isTransfer
        ? colors.transfer
        : colors.textSecondary;

  const amountColor = isIncome
    ? colors.income
    : isTransfer
      ? colors.transfer
      : colors.text;

  const amountPrefix = isIncome ? "+" : isTransfer ? "" : "−";

  const displayAccount =
    accounts.find((a) => a.id === draft.editAccountId) ??
    accounts.find((a) => a.isPrimary) ??
    accounts[0];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* Row 1: Bank badge + last4 + time */}
      <View style={styles.cardTopRow}>
        <View style={styles.bankBadgeRow}>
          <View
            style={[
              styles.bankBadge,
              { backgroundColor: colors.surfaceElevated },
            ]}
          >
            <Text
              style={[
                styles.bankBadgeText,
                {
                  color: colors.textSecondary,
                  fontSize: typography.size.xs,
                },
              ]}
            >
              SMS · {draft.parsedBank}
            </Text>
          </View>
          {draft.parsedLastFour && (
            <Text
              style={[
                styles.lastFour,
                { color: colors.textMuted, fontSize: typography.size.xs },
              ]}
            >
              ·· {draft.parsedLastFour}
            </Text>
          )}
        </View>
        <Text
          style={[
            styles.cardTime,
            { color: colors.textMuted, fontSize: typography.size.xs },
          ]}
        >
          {formatCardTime(draft.parsedDate)}
        </Text>
      </View>

      {/* Merchant row */}
      <View style={styles.cardBody}>
        <View style={[styles.categoryIconBox, { backgroundColor: iconBg }]}>
          <CategoryIcon size={20} color={iconColor} strokeWidth={1.7} />
        </View>
        <View style={styles.merchantCol}>
          <View style={styles.merchantAmountRow}>
            <Text
              style={[
                styles.merchantName,
                {
                  color: isDismissed ? colors.textMuted : colors.text,
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
                styles.amount,
                {
                  color: isDismissed ? colors.textMuted : amountColor,
                  fontSize: typography.size.lg,
                  fontWeight: typography.weight.bold,
                  letterSpacing: -0.2,
                },
              ]}
            >
              {isDismissed ? "" : amountPrefix}
              {formatCurrency(draft.parsedAmount)}
            </Text>
          </View>
          <View style={styles.typeCategoryRow}>
            <View style={styles.typeBadge}>
              <View
                style={[
                  styles.typeDot,
                  {
                    backgroundColor: isDismissed
                      ? colors.textMuted
                      : typeConfig.dotColor,
                  },
                ]}
              />
              <Text
                style={[
                  styles.typeBadgeText,
                  {
                    color: isDismissed
                      ? colors.textMuted
                      : typeConfig.dotColor,
                    fontSize: typography.size.xs,
                  },
                ]}
              >
                {typeConfig.label}
              </Text>
            </View>
            <Text
              style={[
                styles.categoryAccountText,
                { color: colors.textMuted, fontSize: typography.size.xs },
              ]}
              numberOfLines={1}
            >
              {isDismissed
                ? "Uncategorized"
                : `${draft.editCategory} · ${displayAccount?.name ?? "No account"}`}
            </Text>
          </View>
        </View>
      </View>

      {/* SMS preview */}
      <Text
        style={[
          styles.smsPreview,
          {
            color: colors.textMuted,
            fontSize: typography.size.xs,
            borderTopColor: colors.border,
          },
        ]}
        numberOfLines={2}
      >
        {draft.rawSms}
      </Text>

      {/* Edit section */}
      {isEditing && (
        <View
          style={[styles.editSection, { borderTopColor: colors.border }]}
        >
          {/* TYPE */}
          <Text
            style={[
              styles.editLabel,
              { color: colors.textMuted, fontSize: typography.size.xs },
            ]}
          >
            TYPE
          </Text>
          <View style={styles.typeButtons}>
            {(["income", "expense", "transfer"] as TransactionType[]).map(
              (t) => {
                const cfg = TYPE_CONFIG[t];
                const active = draft.editType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => onTypeChange(t)}
                    style={[
                      styles.typeBtn,
                      {
                        borderColor: active
                          ? colors.borderStrong
                          : colors.border,
                        backgroundColor: active
                          ? colors.surfaceAlt
                          : "transparent",
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    {active && (
                      <View
                        style={[
                          styles.typeDotSm,
                          { backgroundColor: cfg.dotColor },
                        ]}
                      />
                    )}
                    <Text
                      style={[
                        styles.typeBtnText,
                        {
                          color: active ? colors.text : colors.textMuted,
                          fontSize: typography.size.xs,
                        },
                      ]}
                    >
                      {cfg.label}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>

          {/* CATEGORY */}
          <CategoryPicker
            transactionType={draft.editType}
            selectedName={draft.editCategory}
            onSelect={(cat) => onCategoryChange(cat.name)}
          />

          {/* ACCOUNT */}
          <TouchableOpacity
            onPress={() => setAccountPickerOpen(true)}
            style={[
              styles.accountTrigger,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.editLabel,
                { color: colors.textMuted, fontSize: typography.size.xs },
              ]}
            >
              ACCOUNT
            </Text>
            <View style={styles.accountTriggerValue}>
              <View
                style={[
                  styles.accountEmojiBox,
                  { backgroundColor: displayAccount ? displayAccount.color + "22" : colors.surfaceAlt },
                ]}
              >
                {(() => { const Icon = getAccountTypeIcon(displayAccount?.type ?? "savings"); return <Icon size={16} color={displayAccount?.color ?? colors.textMuted} strokeWidth={1.7} />; })()}
              </View>
              <Text
                style={[
                  styles.accountTriggerName,
                  {
                    color: colors.text,
                    fontSize: typography.size.base,
                    fontWeight: typography.weight.medium,
                  },
                ]}
                numberOfLines={1}
              >
                {displayAccount?.name ?? "No account"}
              </Text>
              <ChevronRight
                size={14}
                color={colors.textMuted}
                strokeWidth={1.7}
              />
            </View>
          </TouchableOpacity>

          <BottomSheet
            visible={accountPickerOpen}
            onClose={() => setAccountPickerOpen(false)}
            maxHeight={0.5}
          >
            <Text
              style={[
                styles.sheetTitle,
                {
                  color: colors.text,
                  fontSize: typography.size.lg,
                  fontWeight: typography.weight.bold,
                },
              ]}
            >
              Select account
            </Text>
            {accounts.map((acc) => {
              const selected = draft.editAccountId === acc.id;
              return (
                <TouchableOpacity
                  key={acc.id}
                  onPress={() => {
                    onAccountChange(acc.id);
                    setAccountPickerOpen(false);
                  }}
                  style={[
                    styles.accountSheetRow,
                    {
                      backgroundColor: selected
                        ? colors.primaryMuted
                        : "transparent",
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.accountEmojiBox,
                      { backgroundColor: acc.color + "22" },
                    ]}
                  >
                    {(() => { const Icon = getAccountTypeIcon(acc.type); return <Icon size={18} color={acc.color} strokeWidth={1.7} />; })()}
                  </View>
                  <Text
                    style={[
                      styles.accountSheetName,
                      {
                        flex: 1,
                        color: selected ? colors.primary : colors.text,
                        fontSize: typography.size.base,
                      },
                    ]}
                  >
                    {acc.name}
                  </Text>
                  {selected && (
                    <Check size={14} color={colors.primary} strokeWidth={2} />
                  )}
                </TouchableOpacity>
              );
            })}
          </BottomSheet>
        </View>
      )}

      {/* Actions — pending */}
      {tab === "pending" && (
        <View style={[styles.actions, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={isEditing ? onDone : onEdit}
            style={[styles.actionOutline, { borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Pencil size={12} color={colors.textSecondary} strokeWidth={1.7} />
            <Text
              style={[
                styles.actionText,
                {
                  color: colors.textSecondary,
                  fontSize: typography.size.sm,
                },
              ]}
            >
              {isEditing ? "Done" : "Edit"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDismiss}
            style={[styles.actionOutline, { borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.actionText,
                {
                  color: colors.textSecondary,
                  fontSize: typography.size.sm,
                },
              ]}
            >
              Dismiss
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onAccept}
            style={[
              styles.actionFilled,
              { backgroundColor: colors.primary },
            ]}
            activeOpacity={0.8}
          >
            <Check size={13} color="#000" strokeWidth={2.5} />
            <Text
              style={[
                styles.actionText,
                {
                  color: "#000",
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.semibold,
                },
              ]}
            >
              Accept
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Footer — accepted */}
      {isAccepted && (
        <View style={[styles.acceptedFooter, { borderTopColor: colors.border }]}>
          <Check size={13} color={colors.income} strokeWidth={2} />
          <Text
            style={[
              styles.acceptedText,
              { color: colors.income, fontSize: typography.size.sm },
            ]}
          >
            Added to records
          </Text>
        </View>
      )}

      {/* Footer — dismissed */}
      {isDismissed && (
        <View
          style={[styles.dismissedFooter, { borderTopColor: colors.border }]}
        >
          <Text
            style={[
              styles.dismissedLabel,
              { color: colors.textMuted, fontSize: typography.size.sm },
            ]}
          >
            Dismissed
          </Text>
          <TouchableOpacity onPress={onRestore} activeOpacity={0.7}>
            <Text
              style={[
                styles.restoreText,
                {
                  color: colors.textSecondary,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.semibold,
                },
              ]}
            >
              Restore
            </Text>
          </TouchableOpacity>
        </View>
      )}
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

  const [drafts, setDrafts] = useState<DraftWithEdits[]>([]);
  const [accepted, setAccepted] = useState<DraftWithEdits[]>([]);
  const [dismissed, setDismissed] = useState<DraftWithEdits[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"pending" | "accepted" | "dismissed">(
    "pending",
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const loadTransactions = useCallback(
    async (isRefresh = false) => {
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
        const results = await fetchParsedBankTransactions(
          30,
          existingTransactions,
          accounts,
        );
        setDrafts(results.map((d) => initDraft(d, accounts)));
        if (results.length === 0)
          setError("No bank SMS found in the last 30 days.");
      } catch (e: any) {
        setError(e?.message ?? "Failed to read SMS.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [existingTransactions, accounts],
  );

  useEffect(() => {
    if (Platform.OS === "android") loadTransactions();
    else setError("SMS reading is only available on Android devices.");
  }, [loadTransactions]);

  const updateDraft = useCallback(
    (id: string, updates: Partial<DraftWithEdits>) => {
      setDrafts((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...updates } : d)),
      );
    },
    [],
  );

  const handleAccept = useCallback(
    async (draft: DraftWithEdits) => {
      const account =
        accounts.find((a) => a.id === draft.editAccountId) ??
        accounts.find((a) => a.isPrimary) ??
        accounts[0];

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
          type: draft.editType,
          category: draft.editCategory,
          date: draft.parsedDate,
          icon: draft.suggestedIcon ?? "Package",
          accountId: account.id,
          isAutoDetected: true,
          smsSource: draft.parsedBank,
        });
        setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
        setAccepted((prev) => [...prev, draft]);
        if (editingId === draft.id) setEditingId(null);
      } catch {
        Alert.alert("Error", "Failed to save transaction.");
      }
    },
    [accounts, saveTransaction, editingId],
  );

  const handleDismiss = useCallback(
    (id: string) => {
      const draft = drafts.find((d) => d.id === id);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      if (draft) setDismissed((prev) => [...prev, draft]);
      if (editingId === id) setEditingId(null);
    },
    [drafts, editingId],
  );

  const handleRestore = useCallback((id: string) => {
    setDismissed((prev) => {
      const draft = prev.find((d) => d.id === id);
      if (draft) setDrafts((existing) => [draft, ...existing]);
      return prev.filter((d) => d.id !== id);
    });
  }, []);

  const handleAcceptAll = useCallback(() => {
    if (!drafts.length) return;
    Alert.alert("Accept All", `Add all ${drafts.length} detected transactions?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Accept All",
        onPress: async () => {
          for (const draft of [...drafts]) {
            await handleAccept(draft);
          }
        },
      },
    ]);
  }, [drafts, handleAccept]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  const listData =
    tab === "pending" ? drafts : tab === "accepted" ? accepted : dismissed;

  return (
    <View
      style={[styles.root, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.headerIconBtn,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <X size={20} color={colors.text} strokeWidth={1.8} />
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
          SMS inbox
        </Text>
        <View style={styles.headerIconBtn} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsRow, { backgroundColor: colors.background }]}>
        {(["pending", "accepted", "dismissed"] as const).map((t) => {
          const count =
            t === "pending"
              ? drafts.length
              : t === "accepted"
                ? accepted.length
                : dismissed.length;
          const active = tab === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[
                styles.tabPill,
                active && {
                  backgroundColor: colors.surfaceElevated,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabPillText,
                  {
                    color: active ? colors.text : colors.textMuted,
                    fontSize: typography.size.sm,
                    fontWeight: active
                      ? typography.weight.semibold
                      : typography.weight.regular,
                  },
                ]}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {count > 0 ? ` · ${count}` : ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Auto-detect banner */}
      {tab === "pending" && drafts.length > 0 && (
        <View
          style={[styles.banner, { borderBottomColor: colors.border }]}
        >
          <Text
            style={[
              styles.bannerText,
              { color: colors.textMuted, fontSize: typography.size.xs },
            ]}
          >
            {drafts.length} draft{drafts.length !== 1 ? "s" : ""}{" "}
            auto-detected · tap Edit to adjust
          </Text>
          <Pressable
            onPress={handleAcceptAll}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text
              style={[
                styles.acceptAllText,
                {
                  color: colors.primary,
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.semibold,
                },
              ]}
            >
              Accept all
            </Text>
          </Pressable>
        </View>
      )}

      {/* Loading */}
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

      {/* Error */}
      {!loading && error && (
        <View style={styles.center}>
          <View
            style={[
              styles.stateIconBox,
              { backgroundColor: colors.surfaceAlt },
            ]}
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
            {Platform.OS !== "android" ? "Android Only" : "Something went wrong"}
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
              <RefreshCw size={15} color="#000" strokeWidth={1.8} />
              <Text
                style={[
                  styles.retryText,
                  {
                    color: "#000",
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

      {/* Empty state */}
      {!loading && !error && tab === "pending" && drafts.length === 0 && hasPermission && (
        <View style={styles.center}>
          <View
            style={[styles.stateIconBox, { backgroundColor: colors.incomeLight }]}
          >
            <CheckCheck size={32} color={colors.income} strokeWidth={1.5} />
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
            All caught up!
          </Text>
          <Text
            style={[
              styles.stateLabel,
              { color: colors.textMuted, fontSize: typography.size.sm },
            ]}
          >
            No pending bank SMS transactions.
          </Text>
        </View>
      )}

      {!loading && !error && tab !== "pending" && listData.length === 0 && (
        <View style={styles.center}>
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
            Nothing here
          </Text>
          <Text
            style={[
              styles.stateLabel,
              { color: colors.textMuted, fontSize: typography.size.sm },
            ]}
          >
            No {tab} transactions yet.
          </Text>
        </View>
      )}

      {/* List */}
      {!loading && listData.length > 0 && (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingTop: 12,
            paddingBottom: insets.bottom + 28,
          }}
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
              isEditing={editingId === item.id}
              tab={tab}
              accounts={accounts}
              colors={colors}
              typography={typography}
              onEdit={() => setEditingId(item.id)}
              onDone={() => setEditingId(null)}
              onAccept={() => handleAccept(item)}
              onDismiss={() => handleDismiss(item.id)}
              onRestore={() => handleRestore(item.id)}
              onTypeChange={(type) => updateDraft(item.id, { editType: type })}
              onCategoryChange={(category) =>
                updateDraft(item.id, { editCategory: category })
              }
              onAccountChange={(accountId) =>
                updateDraft(item.id, { editAccountId: accountId })
              }
            />
          )}
        />
      )}
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
  headerIconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },

  // Tabs
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  tabPillText: {},

  // Banner
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bannerText: {},
  acceptAllText: {},

  // States
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 10,
  },
  stateIconBox: {
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
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {},

  // Card
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },

  // Card top row
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  bankBadgeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  bankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bankBadgeText: { fontWeight: "600", letterSpacing: 0.2 },
  lastFour: {},
  cardTime: {},

  // Card body
  cardBody: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 12,
  },
  categoryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  merchantCol: { flex: 1, minWidth: 0 },
  merchantAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  merchantName: { flex: 1, lineHeight: 20 },
  amount: { flexShrink: 0 },
  typeCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
    flexWrap: "wrap",
  },
  typeBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  typeDot: { width: 6, height: 6, borderRadius: 3 },
  typeBadgeText: { fontWeight: "700", letterSpacing: 0.3 },
  categoryAccountText: {},

  // SMS preview
  smsPreview: {
    marginHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    lineHeight: 17,
    fontStyle: "italic",
  },

  // Edit section
  editSection: {
    marginHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  editLabel: { fontWeight: "600", letterSpacing: 0.4 },
  typeButtons: { flexDirection: "row", gap: 8 },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  typeDotSm: { width: 5, height: 5, borderRadius: 3 },
  typeBtnText: { fontWeight: "600", letterSpacing: 0.3 },

  // Account trigger
  accountTrigger: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  accountTriggerValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accountEmojiBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  accountTriggerName: { flex: 1 },

  // Account sheet
  sheetTitle: {
    marginBottom: 12,
  },
  accountSheetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  accountSheetName: {},

  // Actions
  actions: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  actionOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionFilled: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionText: {},

  // Accepted footer
  acceptedFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  acceptedText: {},

  // Dismissed footer
  dismissedFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dismissedLabel: {},
  restoreText: {},
});

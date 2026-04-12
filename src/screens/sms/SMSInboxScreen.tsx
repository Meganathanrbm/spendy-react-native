import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import uuid from "react-native-uuid";
import { useTheme } from "../../hooks/useTheme";
import { useAccounts } from "../../hooks/useAccounts";
import { useSaveTransaction } from "../../hooks/useTransactions";
import {
  fetchParsedBankTransactions,
  requestSMSPermission,
} from "../../lib/helpers/smsService";
import { formatCurrency } from "../../lib/helpers/currency";
import { layout } from "../../theme/spacing";
import { SMSDraft, Account } from "../../types";

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

function categoryForDraft(draft: SMSDraft): string {
  if (draft.parsedType === "income") return "Income";
  const m = draft.parsedMerchant?.toLowerCase() ?? "";
  if (/swiggy|zomato|food|restaurant|cafe/i.test(m)) return "Food & Dining";
  if (/petrol|fuel|gas/i.test(m)) return "Transport";
  if (/amazon|flipkart|myntra|shop/i.test(m)) return "Shopping";
  if (/netflix|spotify|prime|hotstar/i.test(m)) return "Entertainment";
  if (/hospital|pharmacy|medical|clinic/i.test(m)) return "Healthcare";
  return "Others";
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

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {/* Header row */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.bankBadge,
            {
              backgroundColor: isCredit
                ? colors.incomeLight
                : colors.expenseLight,
            },
          ]}
        >
          <Ionicons
            name={isCredit ? "arrow-down-circle" : "arrow-up-circle"}
            size={16}
            color={amountColor}
          />
          <Text
            style={[
              styles.bankBadgeText,
              {
                color: amountColor,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.semibold,
              },
            ]}
          >
            {draft.parsedBank}
          </Text>
        </View>
        <Text
          style={[
            styles.amountText,
            {
              color: amountColor,
              fontSize: typography.size.lg,
              fontWeight: typography.weight.bold,
            },
          ]}
        >
          {isCredit ? "+" : "-"}
          {formatCurrency(draft.parsedAmount)}
        </Text>
      </View>

      {/* Merchant */}
      {draft.parsedMerchant ? (
        <Text
          style={[
            styles.merchantText,
            {
              color: colors.text,
              fontSize: typography.size.base,
              fontWeight: typography.weight.medium,
            },
          ]}
          numberOfLines={1}
        >
          {draft.parsedMerchant}
        </Text>
      ) : null}

      {/* Meta row */}
      <View style={styles.metaRow}>
        {draft.parsedLastFour ? (
          <View style={styles.metaChip}>
            <Ionicons name="card-outline" size={12} color={colors.textMuted} />
            <Text
              style={[
                styles.metaText,
                { color: colors.textMuted, fontSize: typography.size.xs },
              ]}
            >
              ••••{draft.parsedLastFour}
            </Text>
          </View>
        ) : null}
        {matchedAccount ? (
          <View
            style={[styles.metaChip, { backgroundColor: colors.primaryLight }]}
          >
            <Ionicons
              name="checkmark-circle"
              size={12}
              color={colors.primary}
            />
            <Text
              style={[
                styles.metaText,
                { color: colors.primary, fontSize: typography.size.xs },
              ]}
            >
              {matchedAccount.name}
            </Text>
          </View>
        ) : (
          <View style={styles.metaChip}>
            <Ionicons
              name="help-circle-outline"
              size={12}
              color={colors.textMuted}
            />
            <Text
              style={[
                styles.metaText,
                { color: colors.textMuted, fontSize: typography.size.xs },
              ]}
            >
              No account matched
            </Text>
          </View>
        )}
        <Text
          style={[
            styles.dateText,
            { color: colors.textMuted, fontSize: typography.size.xs },
          ]}
        >
          {new Date(draft.parsedDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          })}
        </Text>
      </View>

      {/* SMS preview */}
      <Text
        style={[
          styles.smsPreview,
          {
            color: colors.textMuted,
            fontSize: typography.size.xs,
            borderTopColor: colors.divider,
          },
        ]}
        numberOfLines={2}
      >
        {draft.rawSms}
      </Text>

      {/* Actions */}
      <View style={[styles.actions, { borderTopColor: colors.divider }]}>
        <TouchableOpacity
          onPress={onDismiss}
          style={[styles.actionBtn, { borderColor: colors.border }]}
        >
          <Ionicons name="close" size={16} color={colors.textMuted} />
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
          <Ionicons name="checkmark" size={16} color="#fff" />
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
  const saveTransaction = useSaveTransaction();

  const [drafts, setDrafts] = useState<SMSDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const handleFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const granted = await requestSMSPermission();
      setHasPermission(granted);
      if (!granted) {
        setError("SMS permission was denied. Please enable it in Settings.");
        return;
      }
      const results = await fetchParsedBankTransactions(30);
      setDrafts(results);
      if (results.length === 0) {
        setError("No bank transaction SMS found in the last 30 days.");
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to read SMS.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      handleFetch();
    } else {
      setError("SMS reading is only available on Android devices.");
    }
  }, [handleFetch]);

  const handleAccept = useCallback(
    async (draft: SMSDraft) => {
      const matched = matchAccount(draft, accounts);
      const accountId = matched?.id ?? accounts[0]?.id ?? "default";
      const category = categoryForDraft(draft);

      try {
        await saveTransaction.mutateAsync({
          id: uuid.v4() as string,
          title:
            draft.parsedMerchant ??
            `${draft.parsedBank} ${draft.parsedType === "income" ? "Credit" : "Debit"}`,
          amount: draft.parsedAmount,
          type: draft.parsedType,
          category,
          date: draft.parsedDate,
          icon: draft.parsedType === "income" ? "💰" : "💸",
          accountId,
          isAutoDetected: true,
          smsSource: draft.parsedBank,
        });
        setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
      } catch {
        Alert.alert("Error", "Failed to save transaction.");
      }
    },
    [accounts, saveTransaction],
  );

  const handleDismiss = useCallback((id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const handleAcceptAll = useCallback(() => {
    Alert.alert(
      "Add All Transactions",
      `Add all ${drafts.length} detected transactions?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add All",
          onPress: () => drafts.forEach((d) => handleAccept(d)),
        },
      ],
    );
  }, [drafts, handleAccept]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            paddingTop: insets.top + 4,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
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
          <TouchableOpacity
            onPress={handleAcceptAll}
            style={styles.headerAction}
          >
            <Text
              style={[
                {
                  color: colors.primary,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.semibold,
                },
              ]}
            >
              Add All
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Count banner */}
      {drafts.length > 0 && (
        <View
          style={[styles.countBanner, { backgroundColor: colors.primaryLight }]}
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={16}
            color={colors.primary}
          />
          <Text
            style={[
              styles.countText,
              { color: colors.primary, fontSize: typography.size.sm },
            ]}
          >
            {drafts.length} transaction{drafts.length > 1 ? "s" : ""} detected
            from last 30 days
          </Text>
        </View>
      )}

      {/* States */}
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={[
              {
                color: colors.textMuted,
                marginTop: 12,
                fontSize: typography.size.base,
              },
            ]}
          >
            Reading bank SMS…
          </Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Ionicons
            name="chatbubble-outline"
            size={56}
            color={colors.textMuted}
          />
          <Text
            style={[
              styles.errorText,
              {
                color: colors.text,
                fontSize: typography.size.base,
                fontWeight: typography.weight.medium,
              },
            ]}
          >
            {error}
          </Text>
          {Platform.OS === "android" && (
            <TouchableOpacity
              onPress={handleFetch}
              style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Retry</Text>
            </TouchableOpacity>
          )}
          {Platform.OS !== "android" && (
            <Text
              style={[
                {
                  color: colors.textMuted,
                  fontSize: typography.size.sm,
                  marginTop: 8,
                  textAlign: "center",
                  paddingHorizontal: 32,
                },
              ]}
            >
              This feature is only available on Android. To enable on Android,
              run{"\n"}
              <Text style={{ fontWeight: "600" }}>npx expo prebuild</Text> and
              build the app.
            </Text>
          )}
        </View>
      )}

      {!loading && !error && drafts.length === 0 && hasPermission && (
        <View style={styles.centered}>
          <Ionicons
            name="checkmark-circle-outline"
            size={56}
            color={colors.income}
          />
          <Text
            style={[
              {
                color: colors.text,
                fontSize: typography.size.base,
                fontWeight: typography.weight.medium,
                marginTop: 12,
              },
            ]}
          >
            All caught up!
          </Text>
          <Text
            style={[
              {
                color: colors.textMuted,
                fontSize: typography.size.sm,
                marginTop: 4,
              },
            ]}
          >
            No pending bank SMS transactions.
          </Text>
        </View>
      )}

      {/* Draft list */}
      {!loading && drafts.length > 0 && (
        <FlatList
          data={drafts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 24,
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <DraftCard
              draft={item}
              matchedAccount={matchAccount(item, accounts)}
              onAccept={() => handleAccept(item)}
              onDismiss={() => handleDismiss(item.id)}
              colors={colors}
              typography={typography}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: layout.headerHeight + 44,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { flex: 1, textAlign: "center" },
  headerAction: { width: 60, alignItems: "flex-end" },
  countBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  countText: { fontWeight: "500" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: { marginTop: 16, textAlign: "center" },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  card: {
    borderRadius: layout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    padding: 14,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bankBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  bankBadgeText: {},
  amountText: {},
  merchantText: {},
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaText: {},
  dateText: { marginLeft: "auto" },
  smsPreview: {
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    lineHeight: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
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

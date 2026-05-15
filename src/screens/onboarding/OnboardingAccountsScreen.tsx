import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  DeviceEventEmitter,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckCircle2, Circle } from "lucide-react-native";
import uuid from "react-native-uuid";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../contexts/AuthContext";
import { useSaveAccount } from "../../hooks/useAccounts";
import { setOnboardingComplete } from "../../lib/api/auth";
import {
  fetchParsedBankTransactions,
  requestSMSPermission,
} from "../../lib/helpers/smsService";
import {
  AccountCandidate,
  detectAccountCandidates,
} from "../../lib/helpers/smsAccountDetector";
import { Account, AccountType } from "../../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCOUNT_COLORS = [
  "#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981",
  "#3B82F6", "#EF4444", "#14B8A6", "#F97316", "#84CC16",
];

const BANK_ICONS: Record<string, string> = {
  HDFC: "🏦", ICICI: "🏦", SBI: "🏦", Axis: "🏦", Kotak: "🏦",
  IndusInd: "🏦", Yes: "🏦", IDFC: "🏦", RBL: "🏦", Federal: "🏦",
  PNB: "🏦", Canara: "🏦", BOB: "🏦", BOI: "🏦", IDBI: "🏦",
  Paytm: "💰", PhonePe: "📱", GPay: "🔵", "Amazon Pay": "🛒",
  Airtel: "📶", Jio: "📶", CRED: "💎", Slice: "💳", Fi: "🏦",
};

const TYPE_LABELS: { type: AccountType; label: string }[] = [
  { type: "savings", label: "Savings" },
  { type: "current", label: "Current" },
  { type: "credit", label: "Credit" },
  { type: "wallet", label: "Wallet" },
];

function getBankIcon(bankName: string) {
  return BANK_ICONS[bankName] ?? "🏦";
}

// ─── Candidate Card ───────────────────────────────────────────────────────────

type CandidateCardProps = {
  candidate: AccountCandidate;
  color: string;
  isSelected: boolean;
  accountType: AccountType;
  onToggleSelect: () => void;
  onChangeType: (type: AccountType) => void;
};

function CandidateCard({
  candidate,
  color,
  isSelected,
  accountType,
  onToggleSelect,
  onChangeType,
}: CandidateCardProps) {
  const { colors, typography, spacing, layout } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
          borderRadius: layout.cardRadius,
          borderWidth: isSelected ? 1.5 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      {/* Top row: icon + info + checkbox */}
      <View style={styles.cardTopRow}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: color + "33", borderRadius: 10 },
          ]}
        >
          <Text style={styles.iconEmoji}>{getBankIcon(candidate.bankName)}</Text>
        </View>

        <View style={styles.cardInfo}>
          <Text style={[styles.accountName, { color: colors.text, fontSize: typography.size.sm }]}>
            {candidate.suggestedName}
          </Text>
          <View
            style={[
              styles.txnBadge,
              { borderColor: colors.border, backgroundColor: colors.surfaceAlt ?? colors.surface },
            ]}
          >
            <Text style={[styles.txnBadgeText, { color: colors.textMuted, fontSize: typography.size.xs }]}>
              {candidate.transactionCount} transaction{candidate.transactionCount !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={onToggleSelect} hitSlop={8}>
          {isSelected ? (
            <CheckCircle2 size={22} color={colors.primary} />
          ) : (
            <Circle size={22} color={colors.textMuted} />
          )}
        </TouchableOpacity>
      </View>

      {/* Type pills */}
      <View style={styles.typePillsRow}>
        {TYPE_LABELS.map(({ type, label }) => {
          const active = accountType === type;
          return (
            <TouchableOpacity
              key={type}
              onPress={() => onChangeType(type)}
              style={[
                styles.typePill,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primary + "22" : "transparent",
                },
              ]}
            >
              <Text
                style={[
                  styles.typePillText,
                  {
                    color: active ? colors.primary : colors.textMuted,
                    fontSize: typography.size.xs,
                    fontWeight: active ? "600" : "400",
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OnboardingAccountsScreen() {
  const { colors, typography, spacing, layout } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const saveAccount = useSaveAccount();

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<AccountCandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [typeOverrides, setTypeOverrides] = useState<Record<string, AccountType>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  async function loadCandidates() {
    // iOS doesn't support SMS reading — skip straight to finish
    if (Platform.OS === "ios") {
      await finishOnboarding([]);
      return;
    }

    const granted = await requestSMSPermission();
    if (!granted) {
      await finishOnboarding([]);
      return;
    }

    try {
      const drafts = await fetchParsedBankTransactions(90);
      const found = detectAccountCandidates(drafts);
      setCandidates(found);
      setSelected(new Set(found.map((c) => c.key)));
    } catch {
      // If SMS fetch fails, continue with empty list
    } finally {
      setLoading(false);
    }
  }

  const toggleSelect = useCallback((key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const changeType = useCallback((key: string, type: AccountType) => {
    setTypeOverrides((prev) => ({ ...prev, [key]: type }));
  }, []);

  async function finishOnboarding(chosenCandidates: AccountCandidate[]) {
    if (!user) return;
    setSaving(true);

    for (let i = 0; i < chosenCandidates.length; i++) {
      const c = chosenCandidates[i];
      const account: Account = {
        id: String(uuid.v4()),
        name: c.suggestedName,
        type: typeOverrides[c.key] ?? c.suggestedType,
        icon: getBankIcon(c.bankName),
        color: ACCOUNT_COLORS[i % ACCOUNT_COLORS.length],
        balance: 0,
        isPrimary: false,
        bankName: c.bankName,
        lastFourDigits: c.lastFourDigits,
        createdAt: new Date().toISOString(),
      };
      await saveAccount.mutateAsync(account);
    }

    await setOnboardingComplete(user.email);
    DeviceEventEmitter.emit("onboarding_complete");
  }

  function handleContinue() {
    const chosen = candidates.filter((c) => selected.has(c.key));
    finishOnboarding(chosen);
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary, fontSize: typography.size.sm }]}>
          Scanning your messages…
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <FlatList
        data={candidates}
        keyExtractor={(item) => item.key}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text, fontSize: typography.size["2xl"] }]}>
              Set up your accounts
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: typography.size.sm }]}>
              {candidates.length > 0
                ? "Found in your messages. Pick the ones you use."
                : "No bank accounts detected from your messages."}
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <CandidateCard
            candidate={item}
            color={ACCOUNT_COLORS[index % ACCOUNT_COLORS.length]}
            isSelected={selected.has(item.key)}
            accountType={typeOverrides[item.key] ?? item.suggestedType}
            onToggleSelect={() => toggleSelect(item.key)}
            onChangeType={(type) => changeType(item.key, type)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      {/* Footer — always visible at bottom */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        <Pressable
          onPress={handleContinue}
          disabled={saving}
          style={({ pressed }) => [
            styles.continueBtn,
            {
              backgroundColor: saving ? colors.primary + "88" : colors.primary,
              borderRadius: layout.cardRadius,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[styles.continueBtnText, { color: colors.textInverse, fontSize: typography.size.sm }]}>
            {saving ? "Setting up…" : "Continue"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { marginTop: 8 },

  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 24 },

  header: { marginBottom: 24 },
  title: { fontWeight: "700", marginBottom: 6 },
  subtitle: { lineHeight: 20 },

  card: { padding: 14 },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: { fontSize: 20 },
  cardInfo: { flex: 1, gap: 4 },
  accountName: { fontWeight: "600" },
  txnBadge: {
    alignSelf: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  txnBadgeText: {},

  typePillsRow: { flexDirection: "row", gap: 6, marginTop: 12, flexWrap: "wrap" },
  typePill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typePillText: { fontSize: 11 },

  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  footerNote: { textAlign: "center" },
  continueBtn: {
    height: 52,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtnText: { fontWeight: "600" },
});

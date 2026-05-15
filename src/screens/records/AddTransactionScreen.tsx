import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { X, Check, Delete } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import uuid from "react-native-uuid";

import { useTheme } from "../../hooks/useTheme";
import { useSaveTransaction, useUpdateTransaction } from "../../hooks/useTransactions";
import { useAccounts } from "../../hooks/useAccounts";
import { RootStackParamList } from "../../navigation/types";
import { Transaction, TransactionType, Account, Category } from "../../types";

import TypeToggle from "../../components/transaction/TypeToggle";
import AccountPicker from "../../components/transaction/AccountPicker";
import CategoryPicker from "../../components/transaction/CategoryPicker";
import Calculator from "../../components/transaction/Calculator";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = NativeStackScreenProps<
  RootStackParamList,
  "AddTransaction"
>["route"];

export default function AddTransactionScreen() {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();

  const { data: accounts = [] } = useAccounts();
  const saveMutation = useSaveTransaction();
  const updateMutation = useUpdateTransaction();

  const editTx = route.params?.editTransaction;
  const isEditing = !!editTx;

  // ─── State ───────────────────────────────────────────────────────────────
  const [type, setType] = useState<TransactionType>(editTx?.type ?? "expense");
  const [amount, setAmount] = useState(editTx ? String(editTx.amount) : "0");
  const [description, setDescription] = useState(editTx?.title ?? "");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    editTx ? { id: editTx.category, name: editTx.category, icon: editTx.icon, color: "", type: editTx.type === "income" ? "income" : "expense", isCustom: false } : null,
  );
  const [date, setDate] = useState(editTx ? new Date(editTx.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Pre-select account
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      const accountId = editTx?.accountId ?? route.params?.defaultAccountId;
      const primary = accountId
        ? accounts.find((a) => a.id === accountId)
        : (accounts.find((a) => a.isPrimary) ?? accounts[0]);
      setSelectedAccount(primary ?? null);
    }
  }, [accounts]);

  // Amount color + sign per Spendy 2.0: expense = neutral text, income = primary, transfer = blue
  const amountColor  = type === "income" ? colors.primary : type === "transfer" ? colors.transfer : colors.text;
  const amountPrefix = type === "income" ? "+" : type === "expense" ? "−" : "";
  const accentColor  = colors.primary; // calculator key accent

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    if (!selectedAccount) {
      Alert.alert("Account Required", "Please select an account.");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Category Required", "Please select a category.");
      return;
    }

    const tx: Transaction = {
      id: editTx?.id ?? (uuid.v4() as string),
      title: description.trim() || selectedCategory.name,
      amount: numAmount,
      category: selectedCategory.name,
      type,
      date: date.toISOString(),
      icon: selectedCategory.icon,
      accountId: selectedAccount.id,
    };

    try {
      if (isEditing && editTx) {
        await updateMutation.mutateAsync({ updated: tx, original: editTx });
      } else {
        await saveMutation.mutateAsync(tx);
      }
      navigation.goBack();
    } catch {
      Alert.alert("Error", "Failed to save transaction.");
    }
  };

  const handleBackspace = () => {
    setAmount((v) => (v.length <= 1 ? "0" : v.slice(0, -1)));
  };

  // ─── Render ──────────────────────────────────────────────────────────────
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
        >
          <X size={20} color={colors.primary} strokeWidth={1.7} />
          <Text
            style={[
              styles.headerBtnLabel,
              {
                color: colors.primary,
                fontSize: typography.size.sm,
                fontWeight: typography.weight.semibold,
                letterSpacing: typography.tracking.wide,
              },
            ]}
          >
            CANCEL
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saveMutation.isPending || updateMutation.isPending}
          style={styles.headerBtn}
        >
          <Check size={20} color={colors.primary} strokeWidth={2} />
          <Text
            style={[
              styles.headerBtnLabel,
              {
                color: colors.primary,
                fontSize: typography.size.sm,
                fontWeight: typography.weight.semibold,
                letterSpacing: typography.tracking.wide,
              },
            ]}
          >
            {(saveMutation.isPending || updateMutation.isPending) ? "SAVING…" : isEditing ? "UPDATE" : "SAVE"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Type toggle ── */}
      <View style={{ paddingTop: 10 }}>
        <TypeToggle value={type} onChange={setType} />
      </View>

      {/* ── Account + Category row ── */}
      <View style={styles.pickerRow}>
        <AccountPicker
          label="ACCOUNT"
          selectedId={selectedAccount?.id ?? null}
          onSelect={setSelectedAccount}
        />
        <CategoryPicker
          transactionType={type}
          selectedName={selectedCategory?.name ?? null}
          onSelect={setSelectedCategory}
        />
      </View>

      {/* ── Notes ── */}
      <View
        style={[
          styles.descriptionBox,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <TextInput
          placeholder="Add notes"
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          style={[
            styles.descriptionInput,
            { color: colors.text, fontSize: 13 },
          ]}
          maxLength={150}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* ── Amount display with backspace ── */}
      <View
        style={[
          styles.amountRow,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text
          style={[
            styles.amountText,
            {
              color: parseFloat(amount) > 0 ? amountColor : colors.textMuted,
              fontSize: 32,
              fontWeight: "600",
              fontVariant: ["tabular-nums"],
            },
          ]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {parseFloat(amount) > 0 ? `${amountPrefix}₹${amount}` : "0"}
        </Text>
        <TouchableOpacity onPress={handleBackspace} style={styles.backspaceBtn}>
          <Delete size={20} color={colors.textSecondary} strokeWidth={1.7} />
        </TouchableOpacity>
      </View>

      {/* ── Calculator (fills remaining space) ── */}
      <View style={styles.calculatorWrapper}>
        <Calculator
          value={amount}
          onChange={setAmount}
          accentColor={accentColor}
        />
      </View>

      {/* ── Date / Time row ── */}
      <View
        style={[
          styles.dateRow,
          {
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 10,
          },
        ]}
      >
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePill}>
          <Text style={[styles.datePillText, { color: colors.text, fontSize: typography.size.sm }]}>
            {date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </TouchableOpacity>

        <View style={[styles.dateDivider, { backgroundColor: colors.border }]} />

        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.datePill}>
          <Text style={[styles.datePillText, { color: colors.text, fontSize: typography.size.sm }]}>
            {date.toLocaleTimeString("en-IN", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Date / Time Pickers ── */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_, d) => {
            setShowDatePicker(false);
            if (d) setDate(d);
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, d) => {
            setShowTimePicker(false);
            if (d) setDate(d);
          }}
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
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
  },
  headerBtnLabel: {},

  pickerRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 10,
  },

  descriptionBox: {
    marginHorizontal: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  descriptionInput: {
    minHeight: 52,
    padding: 0,
    textAlignVertical: "top",
    lineHeight: 19,
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 10,
  },
  amountText: {
    flex: 1,
    letterSpacing: -1,
    textAlign: "right",
  },
  backspaceBtn: {
    paddingLeft: 12,
  },

  calculatorWrapper: {
    flex: 1,
    minHeight: 190,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dateDivider: {
    width: 1,
    height: 16,
  },
  datePill: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  datePillText: {},
});

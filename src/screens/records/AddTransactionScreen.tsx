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
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import uuid from "react-native-uuid";

import { useTheme } from "../../hooks/useTheme";
import { useSaveTransaction } from "../../hooks/useTransactions";
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

  // ─── State ───────────────────────────────────────────────────────────────
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("0");
  const [description, setDescription] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Pre-select primary account
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      const defaultId = route.params?.defaultAccountId;
      const primary = defaultId
        ? accounts.find((a) => a.id === defaultId)
        : (accounts.find((a) => a.isPrimary) ?? accounts[0]);
      setSelectedAccount(primary ?? null);
    }
  }, [accounts]);

  // Accent color changes per type (used only for calculator + amount display)
  const accentColor = colors.income;

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
      id: uuid.v4() as string,
      title: description.trim() || selectedCategory.name,
      amount: numAmount,
      category: selectedCategory.name,
      type,
      date: date.toISOString(),
      icon: selectedCategory.icon,
      accountId: selectedAccount.id,
    };

    try {
      await saveMutation.mutateAsync(tx);
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
          <Ionicons name="close" size={20} color={colors.primary} />
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
          disabled={saveMutation.isPending}
          style={styles.headerBtn}
        >
          <Ionicons name="checkmark" size={20} color={colors.primary} />
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
            {saveMutation.isPending ? "SAVING…" : "SAVE"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Type toggle ── */}
      <View style={{ paddingTop: 14 }}>
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

      {/* ── Description ── */}
      <View
        style={[
          styles.descriptionBox,
          { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
        ]}
      >
        <TextInput
          placeholder="Description (optional)"
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          style={[
            styles.descriptionInput,
            { color: colors.text, fontSize: typography.size.base },
          ]}
          maxLength={150}
          multiline
        />
      </View>

      {/* ── Amount display with backspace ── */}
      <View
        style={[
          styles.amountRow,
          { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
        ]}
      >
        <Text
          style={[
            styles.amountText,
            {
              color: parseFloat(amount) > 0 ? accentColor : colors.textMuted,
              fontSize: typography.size["4xl"],
              fontWeight: typography.weight.bold,
            },
          ]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {amount === "0" ? "0.00" : amount}
        </Text>
        <TouchableOpacity onPress={handleBackspace} style={styles.backspaceBtn}>
          <Ionicons name="backspace-outline" size={24} color={accentColor} />
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
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={[
            styles.datePill,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text
            style={[
              styles.datePillText,
              { color: colors.text, fontSize: typography.size.sm },
            ]}
          >
            {date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </TouchableOpacity>

        <View
          style={[styles.dateDivider, { backgroundColor: colors.border }]}
        />

        <TouchableOpacity
          onPress={() => setShowTimePicker(true)}
          style={[
            styles.datePill,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="time-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text
            style={[
              styles.datePillText,
              { color: colors.text, fontSize: typography.size.sm },
            ]}
          >
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
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 10,
  },

  descriptionBox: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 8,
  },
  descriptionInput: {
    height: 110,
    padding: 0,
    textAlignVertical: "top",
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  amountText: {
    flex: 1,
    letterSpacing: -1,
  },
  backspaceBtn: {
    paddingLeft: 12,
  },

  calculatorWrapper: {
    flex: 1,
    minHeight: 220,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  datePillText: {},
});

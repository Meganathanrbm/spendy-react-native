import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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
import { layout } from "../../theme/spacing";
import { formatDate } from "../../lib/helpers/date";

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

  // Active color by type
  const accentColor =
    type === "income"
      ? colors.income
      : type === "transfer"
        ? colors.transfer
        : colors.expense;

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

  const formattedDateTime = `${formatDate(date.toISOString())}  ${date.toLocaleTimeString(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    },
  )}`;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
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
          <Ionicons name="close" size={22} color={colors.text} />
          <Text
            style={[
              styles.headerBtnLabel,
              { color: colors.text, fontSize: typography.size.base },
            ]}
          >
            Cancel
          </Text>
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
          New Transaction
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saveMutation.isPending}
          style={[
            styles.headerBtn,
            styles.saveBtn,
            { backgroundColor: accentColor },
          ]}
        >
          <Ionicons name="checkmark" size={16} color="#fff" />
          <Text
            style={[
              styles.headerBtnLabel,
              { color: "#fff", fontWeight: typography.weight.semibold },
            ]}
          >
            {saveMutation.isPending ? "Saving…" : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Type toggle */}
        <View style={{ paddingTop: 16 }}>
          <TypeToggle value={type} onChange={setType} />
        </View>

        {/* Account + Category row */}
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

        {/* Description */}
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
            maxLength={100}
            multiline
          />
        </View>

        {/* Amount display */}
        <View style={styles.amountDisplay}>
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
            ₹ {amount === "0" ? "0.00" : amount}
          </Text>
        </View>

        {/* Calculator */}
        <Calculator
          value={amount}
          onChange={setAmount}
          accentColor={accentColor}
        />

        {/* Date / Time row */}
        <View style={[styles.dateRow, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[
              styles.datePill,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
              },
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

          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            style={[
              styles.datePill,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
              },
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
        
      </ScrollView>

      {/* Date / Time Pickers */}
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {},
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  headerBtnLabel: {},
  saveBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  pickerRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  descriptionBox: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 8,
  },
  descriptionInput: {
    height: 100,
    padding: 0,
  },
  amountDisplay: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "flex-end",
  },
  amountText: {
    letterSpacing: -1,
  },
  dateRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    flexWrap: "wrap",
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

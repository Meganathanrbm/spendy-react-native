import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { CircleX } from "lucide-react-native";
import uuid from "react-native-uuid";
import { useTheme } from "../../hooks/useTheme";
import { useSaveBudget } from "../../hooks/useBudgets";
import { Budget } from "../../types";
import { formatMonthLabel } from "../../lib/helpers/date";
import BottomSheet from "../common/BottomSheet";

type Props = {
  visible: boolean;
  onClose: () => void;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  month: string;
  existingBudget?: Budget;
};

export default function SetBudgetModal({
  visible,
  onClose,
  categoryName,
  categoryIcon,
  categoryColor,
  month,
  existingBudget,
}: Props) {
  const { colors, typography } = useTheme();
  const saveMutation = useSaveBudget();
  const [limitStr, setLimitStr] = useState("");

  useEffect(() => {
    if (visible) {
      setLimitStr(existingBudget ? String(existingBudget.limit) : "");
    }
  }, [visible, existingBudget]);

  const handleSave = async () => {
    const limit = parseFloat(limitStr);
    if (!limit || limit <= 0) {
      Alert.alert("Invalid", "Please enter a valid budget limit.");
      return;
    }

    const budget: Budget = {
      id: existingBudget?.id ?? (uuid.v4() as string),
      categoryName,
      limit,
      month,
      createdAt: existingBudget?.createdAt ?? new Date().toISOString(),
    };

    await saveMutation.mutateAsync(budget);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight={0.5}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: categoryColor + "22" }]}>
            <Text style={styles.icon}>{categoryIcon}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.bold }]}>
              {existingBudget ? "Edit Budget" : "Set Budget"}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted, fontSize: typography.size.sm }]}>
              {categoryName} · {formatMonthLabel(month)}
            </Text>
          </View>
        </View>

        {/* Amount input */}
        <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Text style={[styles.currencySymbol, { color: colors.primary, fontSize: typography.size["2xl"], fontWeight: typography.weight.bold }]}>
            ₹
          </Text>
          <TextInput
            autoFocus
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            value={limitStr}
            onChangeText={setLimitStr}
            style={[
              styles.input,
              {
                color: colors.text,
                fontSize: typography.size["2xl"],
                fontWeight: typography.weight.bold,
              },
            ]}
          />
          {limitStr.length > 0 && (
            <TouchableOpacity onPress={() => setLimitStr("")}>
              <CircleX size={20} color={colors.textMuted} strokeWidth={1.7} />
            </TouchableOpacity>
          )}
        </View>

        {/* Save button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saveMutation.isPending}
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Text style={[styles.saveBtnText, { fontSize: typography.size.md, fontWeight: typography.weight.semibold }]}>
            {saveMutation.isPending ? "Saving…" : existingBudget ? "Update Budget" : "Set Budget"}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 22 },
  headerText: { flex: 1 },
  title: {},
  subtitle: {},
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 8,
  },
  currencySymbol: {},
  input: {
    flex: 1,
    padding: 0,
  },
  saveBtn: {
    marginHorizontal: 16,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
  },
});

import React, { useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import uuid from "react-native-uuid";

import { useTheme } from "../../hooks/useTheme";
import { useSaveBudget } from "../../hooks/useBudgets";
import { Budget } from "../../types";
import { formatMonthLabel } from "../../lib/helpers/date";
import { RootStackParamList } from "../../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = NativeStackScreenProps<RootStackParamList, "SetBudget">["route"];

export default function SetBudgetScreen() {
  const { colors, typography } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();

  const { categoryName, month, existingLimit } = route.params;
  const saveMutation = useSaveBudget();
  const [limitStr, setLimitStr] = useState(existingLimit ? String(existingLimit) : "");

  const handleSave = async () => {
    const limit = parseFloat(limitStr);
    if (!limit || limit <= 0) {
      Alert.alert("Invalid", "Please enter a valid budget limit.");
      return;
    }
    const budget: Budget = {
      id: uuid.v4() as string,
      categoryName,
      limit,
      month,
      createdAt: new Date().toISOString(),
    };
    await saveMutation.mutateAsync(budget);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.size.md, fontWeight: typography.weight.semibold }]}>
          {existingLimit ? "Edit Budget" : "Set Budget"}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saveMutation.isPending}
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={{ color: "#fff", fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
            {saveMutation.isPending ? "Saving…" : "Save"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={[styles.categoryLabel, { color: colors.textSecondary, fontSize: typography.size.sm }]}>
          {categoryName} · {formatMonthLabel(month)}
        </Text>

        <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Text style={[styles.symbol, { color: colors.primary, fontSize: typography.size["3xl"], fontWeight: typography.weight.bold }]}>₹</Text>
          <TextInput
            autoFocus
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            value={limitStr}
            onChangeText={setLimitStr}
            style={[styles.input, { color: colors.text, fontSize: typography.size["3xl"], fontWeight: typography.weight.bold }]}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
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
  closeBtn: { padding: 4 },
  headerTitle: {},
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  body: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20, paddingHorizontal: 32 },
  categoryLabel: { textAlign: "center" },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
    width: "100%",
  },
  symbol: {},
  input: { flex: 1, padding: 0 },
});

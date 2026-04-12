import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import uuid from "react-native-uuid";

import { useTheme } from "../../hooks/useTheme";
import { useSaveAccount, useUpdateAccount } from "../../hooks/useAccounts";
import { Account, AccountType } from "../../types";
import { layout } from "../../theme/spacing";
import BottomSheet from "../common/BottomSheet";

type Props = {
  visible: boolean;
  onClose: () => void;
  existing?: Account;
};

const ACCOUNT_TYPES: { key: AccountType; label: string; icon: string }[] = [
  { key: "savings",    label: "Savings",    icon: "🏦" },
  { key: "current",   label: "Current",    icon: "🏧" },
  { key: "credit",    label: "Credit Card",icon: "💳" },
  { key: "wallet",    label: "Wallet",     icon: "👜" },
  { key: "cash",      label: "Cash",       icon: "💵" },
  { key: "investment",label: "Investment", icon: "📈" },
];

const PRESET_COLORS = [
  "#2D6A4F", "#40916C", "#E63946", "#457B9D",
  "#F59E0B", "#8B5CF6", "#06B6D4", "#EC4899",
  "#F97316", "#6366F1", "#10B981", "#64748B",
];

const PRESET_ICONS = ["🏦", "🏧", "💳", "👜", "💵", "📈", "💰", "🏠", "📊", "🎯"];

export default function AddAccountModal({ visible, onClose, existing }: Props) {
  const { colors, typography } = useTheme();
  const saveMutation = useSaveAccount();
  const updateMutation = useUpdateAccount();

  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("savings");
  const [balance, setBalance] = useState("0");
  const [icon, setIcon] = useState("🏦");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [bankName, setBankName] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    if (visible && existing) {
      setName(existing.name);
      setType(existing.type);
      setBalance(String(existing.balance));
      setIcon(existing.icon);
      setColor(existing.color);
      setBankName(existing.bankName ?? "");
      setLastFour(existing.lastFourDigits ?? "");
      setIsPrimary(existing.isPrimary);
    } else if (visible && !existing) {
      setName(""); setType("savings"); setBalance("0");
      setIcon("🏦"); setColor(PRESET_COLORS[0]);
      setBankName(""); setLastFour(""); setIsPrimary(false);
    }
  }, [visible, existing]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter an account name.");
      return;
    }
    const bal = parseFloat(balance) || 0;

    const account: Account = {
      id: existing?.id ?? (uuid.v4() as string),
      name: name.trim(),
      type,
      icon,
      color,
      balance: bal,
      isPrimary,
      bankName: bankName.trim() || undefined,
      lastFourDigits: lastFour.trim() || undefined,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    if (existing) {
      await updateMutation.mutateAsync(account);
    } else {
      await saveMutation.mutateAsync(account);
    }
    onClose();
  };

  const isSaving = saveMutation.isPending || updateMutation.isPending;

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight={0.9}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Title */}
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text, fontSize: typography.size.xl, fontWeight: typography.weight.bold }]}>
              {existing ? "Edit Account" : "New Account"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Icon picker */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>ICON</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconRow}>
            {PRESET_ICONS.map((ic) => (
              <TouchableOpacity
                key={ic}
                onPress={() => setIcon(ic)}
                style={[
                  styles.iconOption,
                  {
                    backgroundColor: icon === ic ? color + "33" : colors.surfaceAlt,
                    borderColor: icon === ic ? color : colors.border,
                    borderWidth: icon === ic ? 2 : 1,
                  },
                ]}
              >
                <Text style={{ fontSize: 22 }}>{ic}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Color picker */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>COLOR</Text>
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c },
                  color === c && styles.colorSwatchActive,
                ]}
              >
                {color === c && <Ionicons name="checkmark" size={14} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Account name */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>ACCOUNT NAME</Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <TextInput
              placeholder="e.g. HDFC Savings"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              style={[styles.input, { color: colors.text, fontSize: typography.size.base }]}
            />
          </View>

          {/* Account type */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>TYPE</Text>
          <View style={styles.typeGrid}>
            {ACCOUNT_TYPES.map((t) => {
              const active = type === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setType(t.key)}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: active ? color + "22" : colors.surfaceAlt,
                      borderColor: active ? color : colors.border,
                      borderWidth: active ? 1.5 : 1,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 16 }}>{t.icon}</Text>
                  <Text style={[styles.typeLabel, { color: active ? color : colors.text, fontSize: typography.size.xs, fontWeight: active ? typography.weight.semibold : typography.weight.regular }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Opening balance */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>OPENING BALANCE</Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Text style={[{ color: colors.primary, fontSize: typography.size.md, fontWeight: typography.weight.bold, marginRight: 4 }]}>₹</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={balance}
              onChangeText={setBalance}
              style={[styles.input, { color: colors.text, fontSize: typography.size.base }]}
            />
          </View>

          {/* Bank name (for SMS matching) */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>BANK NAME <Text style={{ color: colors.textMuted, fontWeight: "400" }}>(for SMS auto-detect)</Text></Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <TextInput
              placeholder="e.g. HDFC, SBI, ICICI"
              placeholderTextColor={colors.textMuted}
              value={bankName}
              onChangeText={setBankName}
              autoCapitalize="characters"
              style={[styles.input, { color: colors.text, fontSize: typography.size.base }]}
            />
          </View>

          {/* Last 4 digits */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>LAST 4 DIGITS <Text style={{ color: colors.textMuted, fontWeight: "400" }}>(optional)</Text></Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <TextInput
              placeholder="e.g. 4321"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={4}
              value={lastFour}
              onChangeText={setLastFour}
              style={[styles.input, { color: colors.text, fontSize: typography.size.base }]}
            />
          </View>

          {/* Primary toggle */}
          <TouchableOpacity
            onPress={() => setIsPrimary((v) => !v)}
            style={[styles.primaryToggle, { backgroundColor: colors.surfaceAlt, borderColor: isPrimary ? color : colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPrimary ? "star" : "star-outline"}
              size={18}
              color={isPrimary ? color : colors.textMuted}
            />
            <Text style={[styles.primaryToggleLabel, { color: isPrimary ? color : colors.text, fontSize: typography.size.base, fontWeight: typography.weight.medium }]}>
              Set as primary account
            </Text>
          </TouchableOpacity>

          {/* Save */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            style={[styles.saveBtn, { backgroundColor: color }]}
            activeOpacity={0.85}
          >
            <Text style={[styles.saveBtnText, { fontSize: typography.size.md, fontWeight: typography.weight.semibold }]}>
              {isSaving ? "Saving…" : existing ? "Update Account" : "Add Account"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {},
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  iconRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  colorSwatchActive: {
    transform: [{ scale: 1.15 }],
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: { flex: 1, padding: 0 },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  typeLabel: {},
  primaryToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
  },
  primaryToggleLabel: {},
  saveBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff" },
});

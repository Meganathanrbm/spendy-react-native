import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Check } from "lucide-react-native";
import { getAccountTypeIcon } from "../../lib/helpers/categoryIcons";
import { useTheme } from "../../hooks/useTheme";
import { useAccounts } from "../../hooks/useAccounts";
import { formatCurrency } from "../../lib/helpers/currency";
import BottomSheet from "../common/BottomSheet";
import { Account } from "../../types";

type Props = {
  label: string;
  selectedId: string | null;
  onSelect: (account: Account) => void;
};

export default function AccountPicker({ label, selectedId, onSelect }: Props) {
  const { colors, typography } = useTheme();
  const { data: accounts = [] } = useAccounts();
  const [open, setOpen] = useState(false);

  const selected = accounts.find((a) => a.id === selectedId);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.wrapper}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.fieldLabel,
            { color: colors.textMuted },
          ]}
        >
          {label}
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {selected ? (
            <>
              <View style={[styles.iconBox, { backgroundColor: selected.color + "24" }]}>
                {(() => {
                  const Icon = getAccountTypeIcon(selected.type);
                  return <Icon size={14} color={selected.color} strokeWidth={1.7} />;
                })()}
              </View>
              <Text
                style={[
                  styles.fieldValue,
                  { color: colors.text },
                ]}
                numberOfLines={1}
              >
                {selected.name}
              </Text>
            </>
          ) : (
            <Text style={[styles.fieldValue, { color: colors.textMuted }]}>
              Select…
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <BottomSheet visible={open} onClose={() => setOpen(false)} maxHeight={0.55}>
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
        <FlatList
          data={accounts}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedId;
            return (
              <TouchableOpacity
                onPress={() => { onSelect(item); setOpen(false); }}
                style={[
                  styles.option,
                  {
                    borderBottomColor: colors.divider,
                    backgroundColor: isSelected ? colors.surface3 : "transparent",
                    borderWidth: isSelected ? StyleSheet.hairlineWidth : 0,
                    borderColor: isSelected ? colors.borderStrong : "transparent",
                    borderRadius: isSelected ? 10 : 0,
                    marginHorizontal: isSelected ? 8 : 0,
                    paddingHorizontal: isSelected ? 8 : 16,
                  },
                ]}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIconBox, { backgroundColor: item.color + "24" }]}>
                  {(() => {
                    const Icon = getAccountTypeIcon(item.type);
                    return <Icon size={18} color={item.color} strokeWidth={1.7} />;
                  })()}
                </View>
                <View style={styles.optionInfo}>
                  <Text
                    style={[
                      styles.optionName,
                      { color: colors.text, fontWeight: typography.weight.medium },
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={[styles.optionType, { color: colors.textMuted, fontSize: typography.size.xs }]}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    {item.lastFourDigits ? ` •• ${item.lastFourDigits}` : ""}
                  </Text>
                </View>
                <Text style={[styles.optionBalance, { color: colors.text, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }]}>
                  {formatCurrency(item.balance, { compact: true })}
                </Text>
                {isSelected && <Check size={16} color={colors.primary} strokeWidth={2} />}
              </TouchableOpacity>
            );
          }}
        />
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldValue: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "500",
  },
  sheetTitle: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  optionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  optionInfo: { flex: 1 },
  optionName: { fontSize: 15 },
  optionType: {},
  optionBalance: { marginRight: 8 },
});

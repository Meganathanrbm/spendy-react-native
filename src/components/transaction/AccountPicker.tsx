import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { useAccounts } from "../../hooks/useAccounts";
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
        style={[
          styles.trigger,
          { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
        ]}
        activeOpacity={0.75}
      >
        <Text
          style={[
            styles.triggerLabel,
            { color: colors.textMuted, fontSize: typography.size.xs },
          ]}
        >
          {label}
        </Text>
        <View style={styles.triggerValue}>
          {selected ? (
            <>
              <Text style={{ fontSize: 18 }}>{selected.icon}</Text>
              <Text
                style={[
                  styles.valueName,
                  {
                    color: colors.text,
                    fontSize: typography.size.base,
                    fontWeight: typography.weight.medium,
                  },
                ]}
                numberOfLines={1}
              >
                {selected.name}
              </Text>
            </>
          ) : (
            <Text
              style={[
                styles.valueName,
                { color: colors.textMuted, fontSize: typography.size.base },
              ]}
            >
              Select…
            </Text>
          )}
          <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        maxHeight={0.55}
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
          Select Account
        </Text>
        <FlatList
          data={accounts}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedId;
            return (
              <TouchableOpacity
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                }}
                style={[
                  styles.option,
                  {
                    borderBottomColor: colors.divider,
                    backgroundColor: isSelected
                      ? colors.primaryMuted
                      : "transparent",
                  },
                ]}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.optionIcon,
                    { backgroundColor: item.color + "22" },
                  ]}
                >
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                </View>
                <View style={styles.optionInfo}>
                  <Text
                    style={[
                      styles.optionName,
                      {
                        color: colors.text,
                        fontWeight: typography.weight.medium,
                      },
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.optionType,
                      { color: colors.textMuted, fontSize: typography.size.xs },
                    ]}
                  >
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  triggerLabel: { fontWeight: "600" },
  triggerValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  valueName: { flex: 1 },
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
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  optionInfo: { flex: 1 },
  optionName: { fontSize: 15 },
  optionType: {},
});

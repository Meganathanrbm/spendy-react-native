import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { TransactionType } from "../../types";

type Props = {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
};

const TYPES: { key: TransactionType; label: string }[] = [
  { key: "income",   label: "INCOME" },
  { key: "expense",  label: "EXPENSE" },
  { key: "transfer", label: "TRANSFER" },
];

export default function TypeToggle({ value, onChange }: Props) {
  const { colors, typography } = useTheme();

  const activeColor = (type: TransactionType) => {
    if (type === "income")   return colors.income;
    if (type === "expense")  return colors.expense;
    return colors.transfer;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
      {TYPES.map((t) => {
        const isActive = value === t.key;
        const color = activeColor(t.key);
        return (
          <TouchableOpacity
            key={t.key}
            onPress={() => onChange(t.key)}
            style={[
              styles.tab,
              isActive && { backgroundColor: color },
            ]}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.label,
                {
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.bold,
                  letterSpacing: typography.tracking.wide,
                  color: isActive ? "#fff" : colors.textSecondary,
                },
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {},
});

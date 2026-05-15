import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import { useTheme } from "../../hooks/useTheme";
import { TransactionType } from "../../types";

type Props = {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
};

const TYPES: { key: TransactionType; label: string }[] = [
  { key: "income", label: "INCOME" },
  { key: "expense", label: "EXPENSE" },
  { key: "transfer", label: "TRANSFER" },
];

export default function TypeToggle({ value, onChange }: Props) {
  const { colors, typography } = useTheme();

  const activeColor =
    value === "income"
      ? colors.income
      : value === "expense"
        ? colors.expense
        : colors.primary;

  return (
    <View style={styles.container}>
      {TYPES.map((t, i) => {
        const isActive = value === t.key;
        const isLast = i === TYPES.length - 1;
        return (
          <React.Fragment key={t.key}>
            <TouchableOpacity
              onPress={() => onChange(t.key)}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                {isActive && (
                  <View style={[styles.checkCircle, { backgroundColor: activeColor }]}>
                    <Check size={11} color={colors.textInverse} strokeWidth={3} />
                  </View>
                )}
                <Text
                  style={[
                    styles.label,
                    {
                      fontSize: 13,
                      fontWeight: isActive ? typography.weight.bold : typography.weight.medium,
                      letterSpacing: 1.2,
                      color: isActive ? colors.text : colors.textMuted,
                    },
                  ]}
                >
                  {t.label}
                </Text>
              </View>
            </TouchableOpacity>
            {!isLast && (
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    height: 36,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    width: 1,
    height: 16,
  },
  label: {},
});

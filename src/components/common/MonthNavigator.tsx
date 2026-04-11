import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { formatMonthLabel, stepMonth } from "../../lib/helpers/date";

type Props = {
  month: string; // "YYYY-MM"
  onChange: (month: string) => void;
};

export default function MonthNavigator({ month, onChange }: Props) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onChange(stepMonth(month, -1))}
        style={styles.arrow}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Text
        style={[
          styles.label,
          {
            color: colors.text,
            fontSize: typography.size.base,
            fontWeight: typography.weight.semibold,
          },
        ]}
      >
        {formatMonthLabel(month)}
      </Text>

      <TouchableOpacity
        onPress={() => onChange(stepMonth(month, +1))}
        style={styles.arrow}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 12,
  },
  arrow: {
    padding: 4,
  },
  label: {
    minWidth: 140,
    textAlign: "center",
  },
});

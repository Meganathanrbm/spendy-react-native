// Spendy 2.0 — Month navigator. Compact, space-between, chevrons in textSecondary.
import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useTheme } from "../../hooks/useTheme";
import { formatMonthLabel, stepMonth } from "../../lib/helpers/date";

type Props = {
  month: string; // "YYYY-MM"
  onChange: (month: string) => void;
};

const MonthNavigator = memo(function MonthNavigator({ month, onChange }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onChange(stepMonth(month, -1))}
        style={styles.arrow}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <ChevronLeft size={18} color={colors.textSecondary} strokeWidth={1.7} />
      </TouchableOpacity>

      <Text style={[styles.label, { color: colors.text }]}>
        {formatMonthLabel(month)}
      </Text>

      <TouchableOpacity
        onPress={() => onChange(stepMonth(month, +1))}
        style={styles.arrow}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <ChevronRight size={18} color={colors.textSecondary} strokeWidth={1.7} />
      </TouchableOpacity>
    </View>
  );
});

export default MonthNavigator;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  arrow: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
    textAlign: "center",
  },
});

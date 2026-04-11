import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PieChart } from "react-native-svg-charts";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../lib/helpers/currency";

export type DonutSlice = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type Props = {
  slices: DonutSlice[];
  centerLabel?: string;
  centerValue?: number;
  size?: number;
};

export default function DonutChart({
  slices,
  centerLabel = "Total",
  centerValue,
  size = 180,
}: Props) {
  const { colors, typography } = useTheme();

  const total = slices.reduce((s, d) => s + d.value, 0);
  const displayValue = centerValue ?? total;

  const pieData = slices
    .filter((s) => s.value > 0)
    .map((s) => ({
      key: s.key,
      value: s.value,
      svg: { fill: s.color },
    }));

  if (pieData.length === 0) {
    return (
      <View style={[styles.empty, { width: size, height: size, borderColor: colors.border }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No data</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <PieChart
        style={{ height: size, width: size }}
        data={pieData}
        innerRadius="62%"
        outerRadius="100%"
        padAngle={0.02}
      />
      {/* Center label */}
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={[styles.centerLabel, { color: colors.textMuted, fontSize: typography.size.xs }]}>
          {centerLabel}
        </Text>
        <Text
          style={[
            styles.centerValue,
            {
              color: colors.text,
              fontSize: typography.size.lg,
              fontWeight: typography.weight.bold,
            },
          ]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {formatCurrency(displayValue, { compact: true })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  centerValue: {
    textAlign: "center",
    marginTop: 2,
  },
  empty: {
    borderRadius: 9999,
    borderWidth: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { fontSize: 12 },
});

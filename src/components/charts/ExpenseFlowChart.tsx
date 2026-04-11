import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart, Grid, XAxis } from "react-native-svg-charts";
import * as shape from "d3-shape";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../lib/helpers/currency";

export type FlowPoint = {
  day: string;   // "Mon", "Tue" …
  expense: number;
};

type Props = {
  data: FlowPoint[];
  color?: string;
};

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_H = 140;

export default function ExpenseFlowChart({ data, color }: Props) {
  const { colors, typography } = useTheme();
  const lineColor = color ?? colors.expense;

  const values = data.map((d) => d.expense);
  const labels = data.map((d) => d.day);
  const maxVal = Math.max(...values, 1);

  // Gradient fill under line
  const Gradient = () => (
    <defs>
      <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
        <stop offset="100%" stopColor={lineColor} stopOpacity={0.0} />
      </linearGradient>
    </defs>
  );

  const AreaFill = ({ lines }: any) => (
    <path
      d={lines[0]}
      fill="url(#flowGrad)"
      strokeWidth={0}
    />
  );

  return (
    <View style={styles.container}>
      {/* Peak label */}
      <View style={styles.peakRow}>
        <Text style={[styles.peakLabel, { color: colors.textMuted, fontSize: typography.size.xs }]}>
          PEAK · {formatCurrency(maxVal, { compact: true })}
        </Text>
      </View>

      <LineChart
        style={{ height: CHART_H }}
        data={values}
        svg={{ stroke: lineColor, strokeWidth: 2.5 }}
        curve={shape.curveCatmullRom}
        contentInset={{ top: 12, bottom: 4 }}
      >
        <Grid
          svg={{
            stroke: colors.border,
            strokeWidth: 0.5,
          }}
        />
        <Gradient />
        <AreaFill />
      </LineChart>

      <XAxis
        style={{ marginTop: 4 }}
        data={values}
        formatLabel={(_, i) => labels[i] ?? ""}
        contentInset={{ left: 16, right: 16 }}
        svg={{
          fontSize: 10,
          fill: colors.textMuted,
          fontWeight: "500",
        }}
      />

      {/* Weekly totals table */}
      <View style={[styles.table, { borderTopColor: colors.border }]}>
        {data.map((d) => (
          <View key={d.day} style={styles.tableCell}>
            <Text style={[styles.tableDay, { color: colors.textMuted, fontSize: typography.size.xs }]}>
              {d.day}
            </Text>
            <Text
              style={[
                styles.tableValue,
                {
                  color: d.expense > 0 ? colors.expense : colors.textMuted,
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.medium,
                },
              ]}
            >
              {d.expense > 0 ? `-${formatCurrency(d.expense, { compact: true })}` : "–"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 4 },
  peakRow: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    alignItems: "flex-end",
  },
  peakLabel: { fontWeight: "600" },
  table: {
    flexDirection: "row",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
  },
  tableCell: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  tableDay: { fontWeight: "600" },
  tableValue: {},
});

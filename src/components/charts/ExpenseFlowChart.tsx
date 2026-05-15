import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Line, Defs, LinearGradient, Stop } from "react-native-svg";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../lib/helpers/currency";

export type FlowPoint = {
  day: string;
  expense: number;
};

type Props = {
  data: FlowPoint[];
  color?: string;
};

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_H = 140;
const PADDING = { top: 12, bottom: 4, left: 4, right: 4 };

function buildLinePath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y} ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
  }
  return d;
}

function buildAreaPath(
  points: { x: number; y: number }[],
  bottom: number,
): string {
  if (points.length < 2) return "";
  const line = buildLinePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
}

export default function ExpenseFlowChart({ data, color }: Props) {
  const { colors, typography } = useTheme();
  const lineColor = color ?? colors.expense;

  const chartWidth = SCREEN_W - 32 - PADDING.left - PADDING.right;
  const chartHeight = CHART_H - PADDING.top - PADDING.bottom;

  const values = data.map((d) => d.expense);
  const maxVal = Math.max(...values, 1);

  const points = values.map((v, i) => ({
    x: PADDING.left + (i / (values.length - 1)) * chartWidth,
    y: PADDING.top + (1 - v / maxVal) * chartHeight,
  }));

  const linePath = buildLinePath(points);
  const areaPath = buildAreaPath(points, PADDING.top + chartHeight);

  const gridLines = [0, 0.5, 1];

  return (
    <View style={styles.container}>
      <View style={styles.peakRow}>
        <Text
          style={[
            styles.peakLabel,
            { color: colors.textMuted, fontSize: typography.size.xs },
          ]}
        >
          PEAK · {formatCurrency(maxVal, { compact: true })}
        </Text>
      </View>

      <Svg width={SCREEN_W - 32} height={CHART_H}>
        <Defs>
          <LinearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={lineColor} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Horizontal grid lines */}
        {gridLines.map((ratio) => {
          const y = PADDING.top + ratio * chartHeight;
          return (
            <Line
              key={ratio}
              x1={PADDING.left}
              y1={y}
              x2={PADDING.left + chartWidth}
              y2={y}
              stroke={colors.border}
              strokeWidth={0.5}
            />
          );
        })}

        {/* Area fill */}
        <Path d={areaPath} fill="url(#flowGrad)" />

        {/* Line */}
        <Path
          d={linePath}
          stroke={lineColor}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>

      {/* X-axis labels */}
      <View style={[styles.xAxis, { paddingHorizontal: PADDING.left }]}>
        {data.map((d, i) => (
          <Text
            key={`${d.day}-${i}`}
            style={[
              styles.xLabel,
              { color: colors.textMuted, fontSize: 10 },
            ]}
          >
            {d.day}
          </Text>
        ))}
      </View>

      {/* Weekly totals table */}
      <View style={[styles.table, { borderTopColor: colors.border }]}>
        {data.map((d, i) => (
          <View key={`${d.day}-${i}`} style={styles.tableCell}>
            <Text
              style={[
                styles.tableDay,
                { color: colors.textMuted, fontSize: typography.size.xs },
              ]}
            >
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
              {d.expense > 0
                ? `-${formatCurrency(d.expense, { compact: true })}`
                : "–"}
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
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 4,
  },
  xLabel: { fontWeight: "500" },
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

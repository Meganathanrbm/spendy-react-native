import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, G } from "react-native-svg";

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

// Convert polar angle (radians, 0 = top, clockwise) to SVG cartesian coords
function polar(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.sin(angle),
    y: cy - r * Math.cos(angle),
  };
}

// Build an SVG donut-arc path string for one segment
function arcPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const large = endAngle - startAngle > Math.PI ? 1 : 0;
  const os = polar(cx, cy, outerR, startAngle);
  const oe = polar(cx, cy, outerR, endAngle);
  const ie = polar(cx, cy, innerR, endAngle);
  const is_ = polar(cx, cy, innerR, startAngle);
  return [
    `M ${os.x} ${os.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${oe.x} ${oe.y}`,
    `L ${ie.x} ${ie.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${is_.x} ${is_.y}`,
    "Z",
  ].join(" ");
}

export default function DonutChart({
  slices,
  centerLabel = "Total",
  centerValue,
  size = 180,
}: Props) {
  const { colors, typography } = useTheme();

  const validSlices = slices.filter((s) => s.value > 0);
  const total = validSlices.reduce((s, d) => s + d.value, 0);
  const displayValue = centerValue ?? total;

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 1;
  const innerR = outerR * 0.62;
  const PAD = 0.025; // gap between slices in radians

  // Build arc segments
  const segments: { path: string; color: string; key: string }[] = [];
  let cursor = 0;

  for (const s of validSlices) {
    const sweep = (s.value / total) * 2 * Math.PI;
    const start = cursor + PAD / 2;
    const end = cursor + sweep - PAD / 2;
    if (end > start) {
      segments.push({
        key: s.key,
        color: s.color,
        path: arcPath(cx, cy, innerR, outerR, start, end),
      });
    }
    cursor += sweep;
  }

  if (segments.length === 0) {
    return (
      <View
        style={[
          styles.empty,
          { width: size, height: size, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No data
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G>
          {segments.map((seg) => (
            <Path key={seg.key} d={seg.path} fill={seg.color} />
          ))}
        </G>
      </Svg>

      <View
        style={[styles.center, { width: size, height: size }]}
        pointerEvents="none"
      >
        <Text
          style={[
            styles.centerLabel,
            { color: colors.textMuted, fontSize: typography.size.xs },
          ]}
        >
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

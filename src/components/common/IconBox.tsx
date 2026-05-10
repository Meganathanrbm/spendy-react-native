/**
 * Spendy 2.0 — Color-tinted icon square.
 * The category color is the ONLY chromatic cue on the screen.
 * bg = color @ 14% opacity; icon renders in full category color.
 */
import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";

type Props = {
  icon: LucideIcon;
  color: string;
  size?: number;      // box size (icon renders at 50% of this)
  radius?: number;    // border radius; auto if omitted (size × 0.28)
  opacity?: number;   // background opacity 0–1, default 0.14
  strokeWidth?: number; // icon stroke width, default 1.7
};

const IconBox = memo(function IconBox({
  icon: Icon,
  color,
  size = 36,
  radius,
  opacity = 0.14,
  strokeWidth = 1.7,
}: Props) {
  const r = radius ?? Math.round(size * 0.28);
  const iconSize = Math.round(size * 0.5);

  // Hex alpha suffix
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");

  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: r,
          backgroundColor: color + alpha,
        },
      ]}
    >
      <Icon size={iconSize} color={color} strokeWidth={strokeWidth} />
    </View>
  );
});

export default IconBox;

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});

// Spendy 2.0 — Section label: 10.5px, 600 weight, 0.8 tracking, UPPERCASE, muted.
import React, { memo } from "react";
import { Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { useTheme } from "../../hooks/useTheme";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const SectionLabel = memo(function SectionLabel({ children, style }: Props) {
  const { colors } = useTheme();

  return (
    <Text style={[styles.label, { color: colors.textMuted }, style as any]}>
      {children}
    </Text>
  );
});

export default SectionLabel;

const styles = StyleSheet.create({
  label: {
    fontSize: 10.5,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});

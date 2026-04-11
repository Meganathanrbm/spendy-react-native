import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";

type Props = {
  value: string;           // display string e.g. "38.95"
  onChange: (v: string) => void;
  accentColor: string;
};

const KEYS = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  [".", "0", "⌫"],
];

export default function Calculator({ value, onChange, accentColor }: Props) {
  const { colors, typography } = useTheme();

  const press = (key: string) => {
    if (key === "⌫") {
      onChange(value.length <= 1 ? "0" : value.slice(0, -1));
      return;
    }
    if (key === "." && value.includes(".")) return;
    // Limit to 2 decimal places
    if (value.includes(".")) {
      const [, dec] = value.split(".");
      if (dec && dec.length >= 2) return;
    }
    if (value === "0" && key !== ".") {
      onChange(key);
    } else {
      // Max 10 digits total
      const raw = value.replace(".", "");
      if (raw.length >= 10) return;
      onChange(value + key);
    }
  };

  return (
    <View style={styles.container}>
      {KEYS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key) => {
            const isBackspace = key === "⌫";
            const isZero = key === "0";
            return (
              <TouchableOpacity
                key={key}
                onPress={() => press(key)}
                activeOpacity={0.6}
                style={[
                  styles.key,
                  {
                    backgroundColor: isBackspace
                      ? accentColor + "22"
                      : colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                ]}
              >
                {isBackspace ? (
                  <Ionicons name="backspace-outline" size={20} color={accentColor} />
                ) : (
                  <Text
                    style={[
                      styles.keyLabel,
                      {
                        color: colors.text,
                        fontSize: typography.size.xl,
                        fontWeight: typography.weight.medium,
                      },
                    ]}
                  >
                    {key}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  key: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  keyLabel: {},
});

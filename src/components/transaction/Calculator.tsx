import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";

type Props = {
  value: string;
  onChange: (v: string) => void;
  accentColor: string;
};

// Each row: one operator on the left + three digit/symbol keys
const ROWS: { op: string; keys: string[] }[] = [
  { op: "+", keys: ["7", "8", "9"] },
  { op: "-", keys: ["4", "5", "6"] },
  { op: "×", keys: ["1", "2", "3"] },
  { op: "÷", keys: ["0", ".", "="] },
];

function evaluate(left: string, op: string, right: string): string {
  const a = parseFloat(left);
  const b = parseFloat(right);
  if (isNaN(a) || isNaN(b)) return right;
  let result: number;
  switch (op) {
    case "+": result = a + b; break;
    case "-": result = a - b; break;
    case "×": result = a * b; break;
    case "÷": result = b === 0 ? a : a / b; break;
    default:  result = b;
  }
  // Keep up to 2 decimal places, strip trailing zeros
  const rounded = Math.round(result * 100) / 100;
  return String(rounded);
}

export default function Calculator({ value, onChange, accentColor }: Props) {
  const { colors, typography } = useTheme();

  const [pendingLeft, setPendingLeft] = useState<string | null>(null);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [freshEntry, setFreshEntry] = useState(false);

  const pressDigit = (key: string) => {
    const current = freshEntry ? "0" : value;
    const fresh = freshEntry;
    setFreshEntry(false);

    if (key === ".") {
      if (!fresh && current.includes(".")) return;
      onChange(fresh ? "0." : current + ".");
      return;
    }
    // Limit to 2 decimal places
    if (current.includes(".")) {
      const [, dec] = current.split(".");
      if (dec && dec.length >= 2) return;
    }
    const next = current === "0" || fresh ? key : current + key;
    // Max 10 digits
    if (next.replace(".", "").length > 10) return;
    onChange(next);
  };

  const pressOp = (op: string) => {
    if (op === "=") {
      if (pendingLeft !== null && pendingOp !== null) {
        const result = evaluate(pendingLeft, pendingOp, value);
        onChange(result);
        setPendingLeft(null);
        setPendingOp(null);
        setFreshEntry(true);
      }
      return;
    }
    // Chain: if there's already a pending op, evaluate first
    if (pendingLeft !== null && pendingOp !== null && !freshEntry) {
      const result = evaluate(pendingLeft, pendingOp, value);
      onChange(result);
      setPendingLeft(result);
    } else {
      setPendingLeft(value);
    }
    setPendingOp(op);
    setFreshEntry(true);
  };

  return (
    <View style={styles.container}>
      {ROWS.map(({ op, keys }) => (
        <View key={op} style={styles.row}>
          {/* Operator button */}
          <TouchableOpacity
            onPress={() => pressOp(op)}
            activeOpacity={0.65}
            style={[
              styles.key,
              styles.opKey,
              { backgroundColor: accentColor },
            ]}
          >
            <Text
              style={[
                styles.keyLabel,
                styles.opLabel,
                { fontSize: typography.size.xl, fontWeight: typography.weight.semibold },
              ]}
            >
              {op}
            </Text>
          </TouchableOpacity>

          {/* Digit/symbol keys */}
          {keys.map((key) => {
            const isEquals = key === "=";
            return (
              <TouchableOpacity
                key={key}
                onPress={() => (isEquals ? pressOp("=") : pressDigit(key))}
                activeOpacity={0.6}
                style={[
                  styles.key,
                  {
                    backgroundColor: isEquals ? accentColor : colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.keyLabel,
                    {
                      color: isEquals ? "#fff" : colors.text,
                      fontSize: typography.size.xl,
                      fontWeight: typography.weight.medium,
                    },
                  ]}
                >
                  {key}
                </Text>
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
    flex: 1,
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  key: {
    flex: 1,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  opKey: {
    borderWidth: 0,
  },
  keyLabel: {},
  opLabel: {
    color: "#fff",
  },
});

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";

type Props = {
  value: string;
  onChange: (v: string) => void;
  accentColor: string;
};

const ROWS: { op: string; keys: string[] }[] = [
  { op: "+", keys: ["7", "8", "9"] },
  { op: "−", keys: ["4", "5", "6"] },
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
    case "−": result = a - b; break;
    case "×": result = a * b; break;
    case "÷": result = b === 0 ? a : a / b; break;
    default:  result = b;
  }
  const rounded = Math.round(result * 100) / 100;
  return String(rounded);
}

export default function Calculator({ value, onChange, accentColor }: Props) {
  const { colors } = useTheme();

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
    if (current.includes(".")) {
      const [, dec] = current.split(".");
      if (dec && dec.length >= 2) return;
    }
    const next = current === "0" || fresh ? key : current + key;
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
          {/* Operator — surface3 bg, primary text */}
          <TouchableOpacity
            onPress={() => pressOp(op)}
            activeOpacity={0.65}
            style={[styles.key, { backgroundColor: colors.surface3, borderColor: colors.border }]}
          >
            <Text style={[styles.keyLabel, { color: accentColor, fontSize: 22, fontWeight: "500" }]}>
              {op}
            </Text>
          </TouchableOpacity>

          {/* Digit / equals keys */}
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
                    backgroundColor: isEquals ? colors.surface3 : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.keyLabel,
                    {
                      color: isEquals ? accentColor : colors.text,
                      fontSize: 19,
                      fontWeight: "500",
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
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 6,
  },
  key: {
    flex: 1,
    height: 56,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  keyLabel: {},
});

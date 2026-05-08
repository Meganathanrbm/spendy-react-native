import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { TransactionType } from "../../types";

type Props = {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
};

const TYPES: { key: TransactionType; label: string; emoji: string }[] = [
  { key: "income", label: "INCOME", emoji: "↓" },
  { key: "expense", label: "EXPENSE", emoji: "↑" },
  { key: "transfer", label: "TRANSFER", emoji: "⇄" },
];

export default function TypeToggle({ value, onChange }: Props) {
  const { colors, typography } = useTheme();
  const [containerW, setContainerW] = useState(0);
  const tabScales = useRef(TYPES.map(() => new Animated.Value(1))).current;

  const activeIndex = TYPES.findIndex((t) => t.key === value);
  const tabW = containerW / TYPES.length;
  const pillX = useRef(new Animated.Value(activeIndex * tabW + 3)).current;

  const pillColor =
    value === "income" ? colors.income
    : value === "expense" ? colors.expense
    : colors.primary;

  // Refs so callbacks stay stable regardless of derived value changes
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;
  const tabWRef = useRef(tabW);
  tabWRef.current = tabW;

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setContainerW(w);
    pillX.setValue(activeIndexRef.current * (w / TYPES.length) + 3);
  }, [pillX]);

  const handleOnpress = useCallback((key: number, type: TransactionType) => {
    onChange(type);
    pillX.setValue(key * tabWRef.current + 3);
  }, [onChange, pillX]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
      ]}
      onLayout={handleLayout}
    >
      {/* Sliding pill */}
      {
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            {
              width: tabW - 6,
              backgroundColor: pillColor,
              transform: [{ translateX: pillX }],
            },
          ]}
        />
      }

      {TYPES.map((t, i) => {
        const isActive = value === t.key;
        return (
          <Pressable
            key={t.key}
            onPress={() => handleOnpress(i, t.key)}
            style={styles.tab}
          >
            <Animated.View
              style={[
                styles.tabInner,
                { transform: [{ scale: tabScales[i] }] },
              ]}
            >
              <Text
                style={[
                  styles.label,
                  {
                    fontSize: typography.size.xs,
                    fontWeight: typography.weight.bold,
                    letterSpacing: typography.tracking?.wide ?? 0.6,
                    color: isActive ? "#fff" : colors.textSecondary,
                  },
                ]}
              >
                {t.label}
              </Text>
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 12,
    position: "relative",
    height: 42,
  },
  pill: {
    position: "absolute",
    top: 3,
    bottom: 3,
    borderRadius: 9,
    zIndex: 0,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  tabInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  label: {},
});

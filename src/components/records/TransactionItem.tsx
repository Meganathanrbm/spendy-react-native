import React, { useRef, useCallback, memo } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../lib/helpers/currency";
import { formatTime } from "../../lib/helpers/date";
import { getCategoryColor } from "../../lib/helpers/categoryColors";
import { getCategoryIcon } from "../../lib/helpers/categoryIcons";
import { Transaction } from "../../types";
import { layout } from "../../theme/spacing";
import { ArrowLeftRight } from "lucide-react-native";

type Props = {
  transaction: Transaction;
  onPress?: (tx: Transaction) => void;
  onLongPress?: (tx: Transaction) => void;
};

const ICON_SIZE = 36;
const ICON_RADIUS = Math.round(ICON_SIZE * 0.31); // ~11px

const TransactionItem = memo(function TransactionItem({
  transaction,
  onPress,
  onLongPress,
}: Props) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  const isExpense = transaction.type === "expense";
  const isTransfer = transaction.type === "transfer";
  const isIncome = transaction.type === "income";

  const amountColor = isTransfer
    ? colors.transfer
    : isIncome
      ? colors.primary
      : colors.expenseAccent;
  const amountPrefix = isExpense ? "−" : isIncome ? "+" : "";

  // Icon box: category-specific color tinted at ~14% opacity
  const categoryColor = isTransfer
    ? colors.transfer
    : getCategoryColor(transaction.category);
  const iconBgColor = categoryColor + "22"; // 14% opacity
  const CategoryIcon = isTransfer
    ? ArrowLeftRight
    : getCategoryIcon(transaction.category);

  const onPressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.985,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }),
      Animated.spring(iconScale, {
        toValue: 0.88,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }),
    ]).start();
  }, []);

  const onPressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 12,
      }),
    ]).start();
  }, []);

  const onLongPressHandler = useCallback(() => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.94,
        useNativeDriver: true,
        speed: 60,
        bounciness: 0,
      }),
      Animated.spring(scale, {
        toValue: 1.02,
        useNativeDriver: true,
        speed: 30,
        bounciness: 4,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 0,
      }),
    ]).start();
    onLongPress?.(transaction);
  }, [onLongPress, transaction]);

  return (
    <Pressable
      onPress={() => onPress?.(transaction)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onLongPress={onLongPressHandler}
      delayLongPress={380}
    >
      <Animated.View
        style={[
          styles.container,
          { borderBottomColor: colors.border, transform: [{ scale }] },
        ]}
      >
        {/* Icon box — category-color tinted rounded square */}
        <Animated.View
          style={[
            styles.iconBox,
            { backgroundColor: iconBgColor, transform: [{ scale: iconScale }] },
          ]}
        >
          <CategoryIcon size={18} color={categoryColor} strokeWidth={1.7} />
        </Animated.View>

        {/* Details */}
        <View style={styles.middle}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {transaction.title}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {isTransfer ? "Transfer" : transaction.category}
              {"  ·  "}
              {formatTime(transaction.date)}
            </Text>
            {transaction.isAutoDetected && (
              <View
                style={[
                  styles.smsBadge,
                  { backgroundColor: colors.surfaceElevated },
                ]}
              >
                <Text
                  style={[styles.smsBadgeText, { color: colors.textSecondary }]}
                >
                  SMS
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Amount — tabular mono font */}
        <Text style={[styles.amount, { color: amountColor }]}>
          {amountPrefix}
          {formatCurrency(transaction.amount)}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

export default TransactionItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconBox: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  middle: { flex: 1, gap: 3, minWidth: 0 },
  title: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { fontSize: 11.5 },
  smsBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  smsBadgeText: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
    fontVariant: ["tabular-nums"],
  },
});

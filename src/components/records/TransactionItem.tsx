import React, { useRef, useCallback, memo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { formatCurrency } from "../../lib/helpers/currency";
import { formatTime } from "../../lib/helpers/date";
import { Transaction } from "../../types";
import { layout } from "../../theme/spacing";

type Props = {
  transaction: Transaction;
  onLongPress?: (tx: Transaction) => void;
};

const TransactionItem = memo(function TransactionItem({ transaction, onLongPress }: Props) {
  const { colors, typography } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  const isExpense  = transaction.type === "expense";
  const isTransfer = transaction.type === "transfer";
  const amountColor = isTransfer
    ? colors.transfer
    : isExpense
    ? colors.expense
    : colors.income;
  const amountPrefix = isExpense ? "-" : isTransfer ? "↔" : "+";
  const iconBg = isTransfer
    ? colors.transferLight
    : isExpense
    ? colors.expenseLight
    : colors.incomeLight;

  const onPressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }),
      Animated.spring(iconScale, {
        toValue: 0.85,
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
      Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 60, bounciness: 0 }),
      Animated.spring(scale, { toValue: 1.02, useNativeDriver: true, speed: 30, bounciness: 4 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 0 }),
    ]).start();
    onLongPress?.(transaction);
  }, [onLongPress, transaction]);

  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onLongPress={onLongPressHandler}
      delayLongPress={380}
    >
      <Animated.View
        style={[
          styles.container,
          { borderBottomColor: colors.divider, transform: [{ scale }] },
        ]}
      >
        {/* Icon */}
        <Animated.View
          style={[
            styles.iconBox,
            { backgroundColor: iconBg, transform: [{ scale: iconScale }] },
          ]}
        >
          <Text style={styles.iconText}>{transaction.icon}</Text>
        </Animated.View>

        {/* Details */}
        <View style={styles.middle}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: typography.size.base,
                fontWeight: typography.weight.medium,
              },
            ]}
            numberOfLines={1}
          >
            {transaction.title}
          </Text>
          <Text
            style={[
              styles.meta,
              { color: colors.textMuted, fontSize: typography.size.xs },
            ]}
          >
            {transaction.category}
            {"  ·  "}
            {formatTime(transaction.date)}
          </Text>
        </View>

        {/* Amount */}
        <Text
          style={[
            styles.amount,
            {
              color: amountColor,
              fontSize: typography.size.base,
              fontWeight: typography.weight.semibold,
            },
          ]}
        >
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
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconBox: {
    width: layout.iconSize,
    height: layout.iconSize,
    borderRadius: layout.iconSize / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 18 },
  middle: { flex: 1, gap: 3 },
  title: {},
  meta: {},
  amount: {},
});

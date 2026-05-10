import React, { useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { X, Pencil, Trash2, ArrowLeftRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "../../hooks/useTheme";
import { useDeleteTransaction } from "../../hooks/useTransactions";
import { useAccounts } from "../../hooks/useAccounts";
import { formatCurrency } from "../../lib/helpers/currency";
import { formatDate, formatTime } from "../../lib/helpers/date";
import { getCategoryColor } from "../../lib/helpers/categoryColors";
import { getCategoryIcon } from "../../lib/helpers/categoryIcons";
import { Transaction } from "../../types";
import { layout } from "../../theme/spacing";
import { RootStackParamList } from "../../navigation/types";

const { height: SCREEN_H } = Dimensions.get("window");

const ICON_SIZE = 56;
const ICON_RADIUS = 18; // rounded square per design

type Props = {
  transaction: Transaction | null;
  visible: boolean;
  onClose: () => void;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function TransactionDetailModal({ transaction, visible, onClose }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransaction();
  const { data: accounts = [] } = useAccounts();

  const slideY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdropOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideY.setValue(SCREEN_H);
      backdropOp.setValue(0);
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 62, friction: 14 }),
        Animated.timing(backdropOp, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY, { toValue: SCREEN_H, duration: 220, useNativeDriver: true }),
        Animated.timing(backdropOp, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleEdit = useCallback(() => {
    if (!transaction) return;
    onClose();
    setTimeout(() => navigation.navigate("AddTransaction", { editTransaction: transaction }), 260);
  }, [transaction, navigation, onClose]);

  const handleDelete = useCallback(() => {
    if (!transaction) return;
    Alert.alert("Delete Transaction", `Delete "${transaction.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { deleteTransaction(transaction.id); onClose(); } },
    ]);
  }, [transaction, deleteTransaction, onClose]);

  const accountName = (id?: string) => {
    if (!id) return "—";
    const acc = accounts.find((a) => a.id === id);
    return acc ? acc.name : "—";
  };

  const tx = transaction;
  const isExpense  = tx?.type === "expense";
  const isTransfer = tx?.type === "transfer";
  const isIncome   = tx?.type === "income";

  // Spendy 2.0: expense = neutral text; income = primary; transfer = blue
  const amountColor  = isTransfer ? colors.transfer : isIncome ? colors.primary : colors.text;
  const amountPrefix = isExpense ? "−" : isIncome ? "+" : "";

  // Icon box: category-color tinted, rounded square
  const categoryColor = isTransfer
    ? colors.transfer
    : tx ? getCategoryColor(tx.category) : colors.textMuted;
  const iconBg = categoryColor + "22";
  const CategoryIcon = isTransfer ? ArrowLeftRight : tx ? getCategoryIcon(tx.category) : ArrowLeftRight;

  // Type badge
  const badgeLabel = isTransfer ? "TRANSFER" : isExpense ? "EXPENSE" : "INCOME";
  const badgeColor = isTransfer ? colors.transfer : isExpense ? colors.expenseAccent : colors.primary;
  const badgeBg    = badgeColor + "1F";

  const dateTime = tx ? `${formatDate(tx.date)}  ·  ${formatTime(tx.date)}` : "";
  const hasNotes = tx && tx.title !== tx.category;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOp }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            paddingBottom: insets.bottom + 16,
            transform: [{ translateY: slideY }],
          },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.handleArea}>
          <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
        </View>

        {tx && (
          <>
            {/* Badge row + close */}
            <View style={styles.topRow}>
              <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                <View style={[styles.badgeDot, { backgroundColor: badgeColor }]} />
                <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeLabel}</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
                <X size={18} color={colors.textMuted} strokeWidth={1.7} />
              </Pressable>
            </View>

            {/* Hero: icon + amount */}
            <View style={styles.hero}>
              <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                <CategoryIcon size={28} color={categoryColor} strokeWidth={1.7} />
              </View>
              <Text style={[styles.amount, { color: amountColor }]}>
                {amountPrefix}{formatCurrency(tx.amount)}
              </Text>
              <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
                {isTransfer ? "Internal transfer" : tx.title}
              </Text>
            </View>

            {/* Details card */}
            <View style={[styles.card, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              {isExpense && (
                <>
                  <Row label="Category"   value={tx.category}          colors={colors} />
                  <Sep color={colors.border} />
                  <Row label="Account"    value={accountName(tx.accountId)}              colors={colors} />
                  <Sep color={colors.border} />
                  <Row label="Date"       value={formatDate(tx.date)}                    colors={colors} />
                  <Sep color={colors.border} />
                  <Row label="Time"       value={formatTime(tx.date)}                    colors={colors} />
                  {hasNotes && (<><Sep color={colors.border}/><Row label="Notes" value={tx.title} colors={colors} /></>)}
                  {tx.isAutoDetected && tx.smsSource && (
                    <><Sep color={colors.border}/><Row label="Source" value={`SMS · ${tx.smsSource}`} colors={colors} smsTag /></>
                  )}
                </>
              )}
              {isTransfer && (
                <>
                  <Row label="From"  value={accountName(tx.fromAccountId ?? tx.accountId)} colors={colors} />
                  <Sep color={colors.border} />
                  <Row label="To"    value={accountName(tx.toAccountId)}                   colors={colors} />
                  <Sep color={colors.border} />
                  <Row label="Date"  value={formatDate(tx.date)}                           colors={colors} />
                  <Sep color={colors.border} />
                  <Row label="Time"  value={formatTime(tx.date)}                           colors={colors} />
                  {hasNotes && (<><Sep color={colors.border}/><Row label="Notes" value={tx.title} colors={colors} /></>)}
                </>
              )}
              {isIncome && (
                <>
                  <Row label="Category"  value={tx.category}             colors={colors} />
                  <Sep color={colors.border} />
                  <Row label="Account"   value={accountName(tx.accountId)}                 colors={colors} />
                  <Sep color={colors.border} />
                  <Row label="Date"      value={formatDate(tx.date)}                       colors={colors} />
                  <Sep color={colors.border} />
                  <Row label="Time"      value={formatTime(tx.date)}                       colors={colors} />
                  {hasNotes && (<><Sep color={colors.border}/><Row label="Notes" value={tx.title} colors={colors} /></>)}
                  {tx.isAutoDetected && tx.smsSource && (
                    <><Sep color={colors.border}/><Row label="Source" value={`SMS · ${tx.smsSource}`} colors={colors} smsTag /></>
                  )}
                </>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, { borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceAlt }]}
                onPress={handleEdit}
                activeOpacity={0.75}
              >
                <Pencil size={15} color={colors.text} strokeWidth={1.7} />
                <Text style={[styles.btnText, { color: colors.text }]}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.expenseAccent + "1A" }]}
                onPress={handleDelete}
                disabled={isDeleting}
                activeOpacity={0.75}
              >
                <Trash2 size={15} color={colors.expenseAccent} strokeWidth={1.7} />
                <Text style={[styles.btnText, { color: colors.expenseAccent }]}>
                  {isDeleting ? "Deleting…" : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </Modal>
  );
}

function Row({ label, value, colors, smsTag }: { label: string; value: string; colors: any; smsTag?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>{label}</Text>
      {smsTag ? (
        <View style={[styles.smsTag, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.smsTagText, { color: colors.textSecondary }]}>{value}</Text>
        </View>
      ) : (
        <Text style={[styles.rowValue, { color: colors.text }]} numberOfLines={2}>{value}</Text>
      )}
    </View>
  );
}

function Sep({ color }: { color: string }) {
  return <View style={[styles.sep, { backgroundColor: color }]} />;
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    overflow: "hidden",
  },
  handleArea: { paddingTop: 10, paddingBottom: 4, alignItems: "center" },
  handle: { width: 36, height: 4, borderRadius: 2 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.screenPadding,
    paddingTop: 4,
    paddingBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10.5, fontWeight: "600", letterSpacing: 0.8 },
  closeBtn: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  hero: { alignItems: "center", paddingBottom: 24, gap: 4 },
  iconBox: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  amount: { fontSize: 32, fontWeight: "600", letterSpacing: -1, fontVariant: ["tabular-nums"] },
  heroSub: { fontSize: 13, marginTop: 2 },
  card: {
    marginHorizontal: layout.screenPadding,
    borderRadius: layout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rowLabel: { fontSize: 12, letterSpacing: 0.2, flexShrink: 0 },
  rowValue: { fontSize: 13, fontWeight: "500", flex: 1, textAlign: "right" },
  smsTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  smsTagText: { fontSize: 11, fontWeight: "600", letterSpacing: 0.4 },
  sep: { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: layout.screenPadding,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: layout.cardRadius,
    gap: 6,
  },
  btnText: { fontSize: 13, fontWeight: "600" },
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { getIconByName } from "../../lib/helpers/categoryIcons";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../contexts/AuthContext";
import { getAllCategories } from "../../lib/helpers/categories";
import BottomSheet from "../common/BottomSheet";
import { Category, TransactionType } from "../../types";

type Props = {
  transactionType: TransactionType;
  selectedName: string | null;
  onSelect: (category: Category) => void;
};

export default function CategoryPicker({ transactionType, selectedName, onSelect }: Props) {
  const { colors, typography } = useTheme();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getAllCategories(user!.email).then((all) => {
      const type = transactionType === "transfer" ? "expense" : transactionType;
      setCategories(all.filter((c) => c.type === type));
    });
  }, [transactionType]);

  const selected = categories.find((c) => c.name === selectedName);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.wrapper}
        activeOpacity={0.8}
      >
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
          CATEGORY
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {selected ? (
            <>
              <View style={[styles.iconBox, { backgroundColor: selected.color + "24" }]}>
                {(() => {
                  const Icon = getIconByName(selected.icon);
                  return <Icon size={14} color={selected.color} strokeWidth={1.7} />;
                })()}
              </View>
              <Text
                style={[styles.fieldValue, { color: colors.text }]}
                numberOfLines={1}
              >
                {selected.name}
              </Text>
            </>
          ) : (
            <Text style={[styles.fieldValue, { color: colors.textMuted }]}>Select…</Text>
          )}
        </View>
      </TouchableOpacity>

      <BottomSheet visible={open} onClose={() => setOpen(false)} maxHeight={0.7}>
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.bold }]}>
            Select category
          </Text>
          <Text style={[styles.sheetSub, { color: colors.textMuted, fontSize: typography.size.xs }]}>
            {transactionType === "income" ? "Income source" : "Where did the money go?"}
          </Text>
        </View>
        <FlatList
          data={categories}
          keyExtractor={(c) => c.id}
          numColumns={4}
          columnWrapperStyle={styles.grid}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 12 }}
          renderItem={({ item }) => {
            const isSelected = item.name === selectedName;
            return (
              <TouchableOpacity
                onPress={() => { onSelect(item); setOpen(false); }}
                style={[
                  styles.categoryCell,
                  {
                    borderColor: isSelected ? item.color : colors.border,
                    borderWidth: isSelected ? 1.5 : StyleSheet.hairlineWidth,
                    backgroundColor: isSelected ? item.color + "18" : "transparent",
                  },
                ]}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIcon, { backgroundColor: item.color + "22" }]}>
                  {(() => {
                    const Icon = getIconByName(item.icon);
                    return <Icon size={22} color={item.color} strokeWidth={1.7} />;
                  })()}
                </View>
                <Text
                  style={[
                    styles.categoryName,
                    {
                      color: isSelected ? item.color : colors.text,
                      fontSize: 10,
                      fontWeight: isSelected ? typography.weight.semibold : typography.weight.regular,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldValue: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "500",
  },
  sheetHeader: { paddingHorizontal: 16, marginBottom: 12 },
  sheetTitle: {},
  sheetSub: { marginTop: 2 },
  grid: {
    gap: 8,
    marginBottom: 8,
  },
  categoryCell: {
    flex: 1,
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
    gap: 5,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: {
    textAlign: "center",
  },
});

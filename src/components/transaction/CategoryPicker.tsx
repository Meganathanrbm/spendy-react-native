import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
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
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getAllCategories().then((all) => {
      const type = transactionType === "transfer" ? "expense" : transactionType;
      setCategories(all.filter((c) => c.type === type));
    });
  }, [transactionType]);

  const selected = categories.find((c) => c.name === selectedName);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
        ]}
        activeOpacity={0.75}
      >
        <Text style={[styles.triggerLabel, { color: colors.textMuted, fontSize: typography.size.xs }]}>
          CATEGORY
        </Text>
        <View style={styles.triggerValue}>
          {selected ? (
            <>
              <View style={[styles.iconDot, { backgroundColor: selected.color + "33" }]}>
                <Text style={{ fontSize: 14 }}>{selected.icon}</Text>
              </View>
              <Text
                style={[styles.valueName, { color: colors.text, fontSize: typography.size.base, fontWeight: typography.weight.medium }]}
                numberOfLines={1}
              >
                {selected.name}
              </Text>
            </>
          ) : (
            <Text style={[styles.valueName, { color: colors.textMuted }]}>Select…</Text>
          )}
          <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
        </View>
      </TouchableOpacity>

      <BottomSheet visible={open} onClose={() => setOpen(false)} maxHeight={0.65}>
        <Text style={[styles.sheetTitle, { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.bold }]}>
          Category
        </Text>
        <FlatList
          data={categories}
          keyExtractor={(c) => c.id}
          numColumns={3}
          columnWrapperStyle={styles.grid}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
          renderItem={({ item }) => {
            const isSelected = item.name === selectedName;
            return (
              <TouchableOpacity
                onPress={() => { onSelect(item); setOpen(false); }}
                style={[
                  styles.categoryCell,
                  {
                    borderColor: isSelected ? item.color : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    backgroundColor: isSelected ? item.color + "18" : colors.surfaceAlt,
                  },
                ]}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIcon, { backgroundColor: item.color + "28" }]}>
                  <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                </View>
                <Text
                  style={[
                    styles.categoryName,
                    {
                      color: isSelected ? item.color : colors.text,
                      fontSize: typography.size.xs,
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
  trigger: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  triggerLabel: { fontWeight: "600" },
  triggerValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  valueName: { flex: 1 },
  sheetTitle: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  grid: {
    gap: 10,
    marginBottom: 10,
  },
  categoryCell: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    gap: 6,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: {
    textAlign: "center",
  },
});

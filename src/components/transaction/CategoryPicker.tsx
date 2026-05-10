import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { ChevronDown } from "lucide-react-native";
import { getCategoryIcon } from "../../lib/helpers/categoryIcons";
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
                {(() => { const Icon = getCategoryIcon(selected.name); return <Icon size={14} color={selected.color} strokeWidth={1.7} />; })()}
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
          <ChevronDown size={14} color={colors.textMuted} strokeWidth={1.7} />
        </View>
      </TouchableOpacity>

      <BottomSheet visible={open} onClose={() => setOpen(false)} maxHeight={0.7}>
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.bold }]}>
            Category
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
                    borderWidth: StyleSheet.hairlineWidth,
                    backgroundColor: isSelected ? item.color + "18" : "transparent",
                  },
                  isSelected && { borderColor: item.color, borderWidth: 1.5 },
                ]}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIcon, { backgroundColor: item.color + "22" }]}>
                  {(() => { const Icon = getCategoryIcon(item.name); return <Icon size={18} color={item.color} strokeWidth={1.7} />; })()}
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
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: {
    textAlign: "center",
  },
});

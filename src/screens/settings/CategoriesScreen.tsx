import React, { useEffect, useState } from "react";
import {
  View, Text, SectionList, TouchableOpacity,
  StyleSheet, Alert, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import uuid from "react-native-uuid";

import { useTheme } from "../../hooks/useTheme";
import {
  getAllCategories, saveCustomCategory, deleteCustomCategory,
  defaultCategories,
} from "../../lib/helpers/categories";
import { Category } from "../../types";
import { layout } from "../../theme/spacing";
import AppHeader from "../../components/common/AppHeader";

const EMOJI_OPTIONS = ["🛒","🚗","🍔","🛍️","💰","📦","💊","🎭","📚","✈️","🏠","💻","💼","🎁","🏦","📈","🧾","🎮","🐾","🌿","⚡","🎵","🎨","🏋️"];
const COLOR_OPTIONS = ["#2D6A4F","#E63946","#457B9D","#F59E0B","#8B5CF6","#06B6D4","#EC4899","#F97316","#6366F1","#10B981","#64748B","#40916C"];

export default function CategoriesScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📦");
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0]);
  const [newType, setNewType] = useState<"income" | "expense">("expense");
  const [adding, setAdding] = useState(false);

  const load = () => getAllCategories().then(setCategories);
  useEffect(() => { load(); }, []);

  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  const handleAdd = async () => {
    if (!newName.trim()) { Alert.alert("Required", "Enter a category name."); return; }
    const cat: Category = {
      id: uuid.v4() as string,
      name: newName.trim(),
      icon: newIcon,
      color: newColor,
      type: newType,
      isCustom: true,
    };
    await saveCustomCategory(cat);
    setNewName(""); setAdding(false);
    load();
  };

  const handleDelete = (cat: Category) => {
    if (!cat.isCustom) { Alert.alert("Cannot Delete", "Default categories cannot be deleted."); return; }
    Alert.alert("Delete Category", `Delete "${cat.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteCustomCategory(cat.id); load(); } },
    ]);
  };

  const sections = [
    { title: "INCOME", data: income },
    { title: "EXPENSE", data: expense },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader title="Categories" onMenuPress={() => navigation?.goBack()} />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: layout.tabBarHeight + insets.bottom + 24 }}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={[styles.catRow, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
            <View style={[styles.catIcon, { backgroundColor: item.color + "22" }]}>
              <Text style={{ fontSize: 18 }}>{item.icon}</Text>
            </View>
            <Text style={[styles.catName, { color: colors.text, fontSize: typography.size.base, flex: 1 }]}>
              {item.name}
            </Text>
            {item.isCustom ? (
              <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="trash-outline" size={16} color={colors.expense} />
              </TouchableOpacity>
            ) : (
              <Text style={[styles.defaultBadge, { color: colors.textMuted, fontSize: typography.size.xs }]}>default</Text>
            )}
          </View>
        )}
        ListFooterComponent={
          <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
            {!adding ? (
              <TouchableOpacity
                onPress={() => setAdding(true)}
                style={[styles.addBtn, { borderColor: colors.primary, backgroundColor: colors.primaryMuted }]}
              >
                <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                <Text style={[styles.addBtnLabel, { color: colors.primary, fontWeight: typography.weight.semibold }]}>
                  Add Custom Category
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.addForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {/* Type toggle */}
                <View style={[styles.typeRow, { backgroundColor: colors.surfaceAlt, borderRadius: 10 }]}>
                  {(["income", "expense"] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setNewType(t)}
                      style={[styles.typeBtn, newType === t && { backgroundColor: t === "income" ? colors.income : colors.expense }]}
                    >
                      <Text style={[styles.typeBtnLabel, { color: newType === t ? "#fff" : colors.textSecondary, fontWeight: typography.weight.semibold, fontSize: typography.size.xs }]}>
                        {t.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Name */}
                <View style={[styles.nameInput, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <TextInput
                    autoFocus placeholder="Category name"
                    placeholderTextColor={colors.textMuted}
                    value={newName} onChangeText={setNewName}
                    style={[styles.nameInputText, { color: colors.text, fontSize: typography.size.base }]}
                  />
                </View>

                {/* Emoji */}
                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>ICON</Text>
                <View style={styles.emojiGrid}>
                  {EMOJI_OPTIONS.map((e) => (
                    <TouchableOpacity
                      key={e}
                      onPress={() => setNewIcon(e)}
                      style={[styles.emojiBtn, {
                        backgroundColor: newIcon === e ? newColor + "33" : colors.surfaceAlt,
                        borderColor: newIcon === e ? newColor : colors.border,
                        borderWidth: newIcon === e ? 2 : 1,
                      }]}
                    >
                      <Text style={{ fontSize: 18 }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Color */}
                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>COLOR</Text>
                <View style={styles.colorRow}>
                  {COLOR_OPTIONS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setNewColor(c)}
                      style={[styles.colorSwatch, { backgroundColor: c }, newColor === c && { transform: [{ scale: 1.2 }] }]}
                    >
                      {newColor === c && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.formActions}>
                  <TouchableOpacity onPress={() => setAdding(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                    <Text style={[styles.cancelBtnLabel, { color: colors.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleAdd} style={[styles.saveFormBtn, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.saveFormBtnLabel, { color: "#fff", fontWeight: typography.weight.semibold }]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 7 },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  catRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  catIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  catName: {},
  defaultBadge: {},
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderStyle: "dashed", borderRadius: 12, paddingVertical: 14 },
  addBtnLabel: { fontSize: 14 },
  addForm: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  typeRow: { flexDirection: "row", overflow: "hidden", borderRadius: 10 },
  typeBtn: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 10 },
  typeBtnLabel: {},
  nameInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  nameInputText: { padding: 0 },
  miniLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  emojiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  emojiBtn: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  colorSwatch: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  formActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  cancelBtnLabel: { fontSize: 14 },
  saveFormBtn: { flex: 2, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  saveFormBtnLabel: { fontSize: 14 },
});

import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, TextInput, FlatList, Modal,
} from "react-native";
import { X, Plus, Trash2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import uuid from "react-native-uuid";

import { useTheme } from "../../hooks/useTheme";
import {
  getAllCategories, saveCustomCategory, deleteCustomCategory,
} from "../../lib/helpers/categories";
import { getCategoryIcon } from "../../lib/helpers/categoryIcons";
import { Category } from "../../types";
import { layout } from "../../theme/spacing";

const PALETTE = ["#34D399","#60A5FA","#FBBF24","#F472B6","#A78BFA","#F87171","#22D3EE","#FB923C","#84CC16","#94A3B8"];

// ─── Add Category Modal ───────────────────────────────────────────────────────
function AddCategoryModal({
  visible, onClose, onSave, presetType = "expense",
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (cat: Category) => void;
  presetType?: "expense" | "income";
}) {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [type, setType] = useState<"expense" | "income">(presetType);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0]);

  useEffect(() => {
    if (visible) {
      setType(presetType);
      setName("");
      setColor(PALETTE[0]);
    }
  }, [visible, presetType]);

  const handleSave = () => {
    if (!name.trim()) { Alert.alert("Required", "Enter a category name."); return; }
    onSave({
      id: uuid.v4() as string,
      name: name.trim(),
      icon: "📦",
      color,
      type,
      isCustom: true,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={[styles.addScreen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.addHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.addHeaderBtn}>
            <X size={19} color={colors.text} strokeWidth={1.7} />
          </TouchableOpacity>
          <Text style={[styles.addHeaderTitle, { color: colors.text }]}>New category</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.addSaveBtn, { backgroundColor: name.trim() ? colors.primary : colors.surfaceAlt }]}
          >
            <Text style={[styles.addSaveBtnText, { color: name.trim() ? "#0A0A0A" : colors.textMuted }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.addBody} showsVerticalScrollIndicator={false}>
          {/* Icon preview */}
          <View style={styles.iconPreviewWrap}>
            <View style={[styles.iconPreview, { backgroundColor: color + "22" }]}>
              <Text style={{ fontSize: 32 }}>📦</Text>
            </View>
          </View>

          {/* Type */}
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>TYPE</Text>
          <View style={[styles.typeRow, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            {(["expense", "income"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                style={[
                  styles.typeBtn,
                  type === t && { backgroundColor: colors.surface3 ?? colors.surfaceElevated },
                ]}
              >
                <Text style={[
                  styles.typeBtnText,
                  { color: type === t ? colors.text : colors.textSecondary, fontWeight: type === t ? "600" : "400" },
                ]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name */}
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>NAME</Text>
          <View style={[styles.nameInput, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <TextInput
              autoFocus
              placeholder="Subscriptions"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              style={[styles.nameInputText, { color: colors.text, fontSize: typography.size.base }]}
            />
          </View>

          {/* Color */}
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>COLOR</Text>
          <View style={styles.colorGrid}>
            {PALETTE.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c + "22" },
                  color === c && { borderWidth: 2, borderColor: c },
                ]}
              >
                <View style={[styles.colorDot, { backgroundColor: c }]} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function CategoriesScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tab, setTab] = useState<"expense" | "income">("expense");
  const [adding, setAdding] = useState(false);

  const load = () => getAllCategories().then(setCategories);
  useEffect(() => { load(); }, []);

  const defaults = categories.filter((c) => !c.isCustom && c.type === tab);
  const custom   = categories.filter((c) =>  c.isCustom && c.type === tab);

  const handleDelete = (cat: Category) => {
    Alert.alert("Delete Category", `Delete "${cat.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteCustomCategory(cat.id); load(); } },
    ]);
  };

  const handleSave = async (cat: Category) => {
    await saveCustomCategory(cat);
    setAdding(false);
    load();
  };

  const renderCategoryCard = (cat: Category, isCustom = false) => {
    const Icon = getCategoryIcon(cat.name);
    return (
      <View
        key={cat.id}
        style={[styles.catCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={[styles.catIconBox, { backgroundColor: cat.color + "22" }]}>
          <Icon size={18} color={cat.color} strokeWidth={1.7} />
        </View>
        <Text style={[styles.catName, { color: colors.text, fontSize: typography.size.sm }]} numberOfLines={1}>
          {cat.name}
        </Text>
        {isCustom && (
          <TouchableOpacity onPress={() => handleDelete(cat)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={13} color={colors.textMuted} strokeWidth={1.7} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.headerIconBtn}>
          <X size={19} color={colors.text} strokeWidth={1.7} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Categories</Text>
        <TouchableOpacity onPress={() => setAdding(true)} style={styles.headerIconBtn}>
          <Plus size={19} color={colors.text} strokeWidth={1.7} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: layout.tabBarHeight + insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Tabs */}
        <View style={styles.tabsRow}>
          {(["expense", "income"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[
                styles.tab,
                {
                  backgroundColor: tab === t ? colors.surfaceElevated : "transparent",
                  borderColor: tab === t ? colors.borderStrong ?? colors.border : colors.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, { color: tab === t ? colors.text : colors.textSecondary }]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DEFAULT */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>DEFAULT</Text>
        </View>
        <View style={styles.grid}>
          {defaults.map((c) => renderCategoryCard(c, false))}
        </View>

        {/* CUSTOM */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CUSTOM</Text>
        </View>
        {custom.length === 0 ? (
          <View style={[styles.emptyCustom, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyCustomText, { color: colors.textMuted }]}>
              No custom {tab} categories yet.
            </Text>
            <TouchableOpacity
              onPress={() => setAdding(true)}
              style={[styles.emptyAddBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            >
              <Plus size={13} color={colors.text} strokeWidth={1.7} />
              <Text style={[styles.emptyAddBtnText, { color: colors.text }]}>Add category</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {custom.map((c) => renderCategoryCard(c, true))}
          </View>
        )}
      </ScrollView>

      <AddCategoryModal
        visible={adding}
        onClose={() => setAdding(false)}
        onSave={handleSave}
        presetType={tab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerIconBtn: {
    width: 40, height: 40,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: {
    flex: 1, textAlign: "center",
    fontSize: 14, fontWeight: "600", letterSpacing: -0.1,
  },

  tabsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tabText: { fontSize: 12, fontWeight: "600", letterSpacing: 0.1 },

  sectionHeaderRow: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  sectionLabel: { fontSize: 10.5, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 8,
  },
  catCard: {
    width: "47.5%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
  },
  catIconBox: {
    width: 32, height: 32,
    borderRadius: 9,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  catName: { flex: 1, fontWeight: "500" },

  emptyCustom: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  emptyCustomText: { fontSize: 12 },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyAddBtnText: { fontSize: 12, fontWeight: "600" },

  // Add Category Modal
  addScreen: { flex: 1 },
  addHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  addHeaderBtn: {
    width: 40, height: 40,
    alignItems: "center", justifyContent: "center",
  },
  addHeaderTitle: {
    flex: 1,
    fontSize: 14, fontWeight: "600", letterSpacing: -0.1,
  },
  addSaveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    marginRight: 8,
  },
  addSaveBtnText: { fontSize: 12.5, fontWeight: "600", letterSpacing: 0.1 },

  addBody: { padding: 20 },

  iconPreviewWrap: { alignItems: "center", paddingTop: 12, paddingBottom: 28 },
  iconPreview: {
    width: 76, height: 76,
    borderRadius: 22,
    alignItems: "center", justifyContent: "center",
  },

  fieldLabel: {
    fontSize: 10, fontWeight: "600",
    letterSpacing: 0.8, textTransform: "uppercase",
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 18,
  },
  typeBtn: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 10 },
  typeBtnText: { fontSize: 13 },

  nameInput: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 18,
  },
  nameInputText: { padding: 0 },

  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  colorSwatch: {
    width: 32, height: 32,
    borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  colorDot: { width: 14, height: 14, borderRadius: 4 },
});

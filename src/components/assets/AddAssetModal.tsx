import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { X } from "lucide-react-native";
import uuid from "react-native-uuid";
import { useTheme } from "../../hooks/useTheme";
import { useSaveAsset, useUpdateAsset } from "../../hooks/useAssets";
import { Asset, AssetType, AssetSubType } from "../../types";
import BottomSheet from "../common/BottomSheet";
import { ASSET_TYPE_META } from "./AssetCard";

type Props = {
  visible: boolean;
  onClose: () => void;
  existing?: Asset;
};

const SUB_TYPES: { key: AssetSubType; label: string }[] = [
  { key: "equity",       label: "Equity" },
  { key: "debt",         label: "Debt" },
  { key: "gold",         label: "Gold" },
  { key: "hybrid",       label: "Hybrid" },
  { key: "real_estate",  label: "Real Estate" },
  { key: "other",        label: "Other" },
];

const ASSET_TYPES = Object.entries(ASSET_TYPE_META).map(([key, val]) => ({
  key: key as AssetType,
  ...val,
}));

export default function AddAssetModal({ visible, onClose, existing }: Props) {
  const { colors, typography } = useTheme();
  const saveMutation = useSaveAsset();
  const updateMutation = useUpdateAsset();

  const [type, setType] = useState<AssetType>("mutual_fund");
  const [subType, setSubType] = useState<AssetSubType>("equity");
  const [name, setName] = useState("");
  const [invested, setInvested] = useState("");
  const [current, setCurrent] = useState("");
  const [units, setUnits] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [broker, setBroker] = useState("");
  const [folioNumber, setFolioNumber] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [maturityDate, setMaturityDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (visible && existing) {
      setType(existing.type);
      setSubType(existing.subType);
      setName(existing.name);
      setInvested(String(existing.investedAmount));
      setCurrent(String(existing.currentValue));
      setUnits(existing.units ? String(existing.units) : "");
      setCurrentPrice(existing.currentPrice ? String(existing.currentPrice) : "");
      setBroker(existing.broker ?? "");
      setFolioNumber(existing.folioNumber ?? "");
      setInterestRate(existing.interestRate ? String(existing.interestRate) : "");
      setMaturityDate(existing.maturityDate ?? "");
      setNotes(existing.notes ?? "");
    } else if (visible && !existing) {
      setType("mutual_fund"); setSubType("equity"); setName("");
      setInvested(""); setCurrent(""); setUnits(""); setCurrentPrice("");
      setBroker(""); setFolioNumber(""); setInterestRate(""); setMaturityDate(""); setNotes("");
    }
  }, [visible, existing]);

  const meta = ASSET_TYPE_META[type] ?? ASSET_TYPE_META["other"];

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert("Required", "Enter asset name."); return; }
    const inv = parseFloat(invested);
    const cur = parseFloat(current);
    if (!inv || inv <= 0) { Alert.alert("Required", "Enter invested amount."); return; }
    if (isNaN(cur) || cur < 0) { Alert.alert("Required", "Enter current value."); return; }

    const asset: Asset = {
      id: existing?.id ?? (uuid.v4() as string),
      name: name.trim(),
      type,
      subType,
      investedAmount: inv,
      currentValue: cur || inv,
      units: units ? parseFloat(units) : undefined,
      currentPrice: currentPrice ? parseFloat(currentPrice) : undefined,
      broker: broker.trim() || undefined,
      folioNumber: folioNumber.trim() || undefined,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      maturityDate: maturityDate.trim() || undefined,
      notes: notes.trim() || undefined,
      lastUpdated: new Date().toISOString(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    if (existing) {
      await updateMutation.mutateAsync(asset);
    } else {
      await saveMutation.mutateAsync(asset);
    }
    onClose();
  };

  const isSaving = saveMutation.isPending || updateMutation.isPending;
  const showFD = type === "fixed_deposit" || type === "ppf" || type === "nps" || type === "epf";
  const showMF = type === "mutual_fund" || type === "stocks";

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight={0.95}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Title */}
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text, fontSize: typography.size.xl, fontWeight: typography.weight.bold }]}>
              {existing ? "Edit Asset" : "Add Asset"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color={colors.textSecondary} strokeWidth={1.7} />
            </TouchableOpacity>
          </View>

          {/* Asset type grid */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>ASSET TYPE</Text>
          <View style={styles.typeGrid}>
            {ASSET_TYPES.map((t) => {
              const active = type === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setType(t.key)}
                  style={[styles.typeChip, {
                    backgroundColor: active ? t.color + "22" : colors.surfaceAlt,
                    borderColor: active ? t.color : colors.border,
                    borderWidth: active ? 1.5 : 1,
                  }]}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 16 }}>{t?.icon}</Text>
                  <Text style={[styles.typeLabel, { color: active ? t.color : colors.text, fontWeight: active ? typography.weight.semibold : typography.weight.regular, fontSize: typography.size.xs }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Sub type */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>SUB TYPE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subTypeRow}>
            {SUB_TYPES.map((s) => {
              const active = subType === s.key;
              return (
                <TouchableOpacity
                  key={s.key}
                  onPress={() => setSubType(s.key)}
                  style={[styles.subTypeChip, {
                    backgroundColor: active ? meta.color : colors.surfaceAlt,
                    borderColor: active ? meta.color : colors.border,
                  }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.subTypeLabel, { color: active ? "#fff" : colors.textSecondary, fontWeight: active ? typography.weight.semibold : typography.weight.regular }]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Name */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>ASSET NAME</Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <TextInput placeholder="e.g. HDFC Nifty 50 Fund" placeholderTextColor={colors.textMuted}
              value={name} onChangeText={setName}
              style={[styles.input, { color: colors.text, fontSize: typography.size.base }]} />
          </View>

          {/* Invested / Current */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>INVESTED ₹</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <TextInput placeholder="0.00" placeholderTextColor={colors.textMuted} keyboardType="decimal-pad"
                  value={invested} onChangeText={setInvested}
                  style={[styles.input, { color: colors.text, fontSize: typography.size.base }]} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>CURRENT VALUE ₹</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <TextInput placeholder="0.00" placeholderTextColor={colors.textMuted} keyboardType="decimal-pad"
                  value={current} onChangeText={setCurrent}
                  style={[styles.input, { color: colors.text, fontSize: typography.size.base }]} />
              </View>
            </View>
          </View>

          {/* MF / Stocks specific */}
          {showMF && (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>UNITS</Text>
                <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <TextInput placeholder="0" placeholderTextColor={colors.textMuted} keyboardType="decimal-pad"
                    value={units} onChangeText={setUnits}
                    style={[styles.input, { color: colors.text, fontSize: typography.size.base }]} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>CURRENT NAV/PRICE ₹</Text>
                <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <TextInput placeholder="0.00" placeholderTextColor={colors.textMuted} keyboardType="decimal-pad"
                    value={currentPrice} onChangeText={setCurrentPrice}
                    style={[styles.input, { color: colors.text, fontSize: typography.size.base }]} />
                </View>
              </View>
            </View>
          )}

          {/* Broker / Folio */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>BROKER / PLATFORM</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                <TextInput placeholder="e.g. Zerodha, Groww" placeholderTextColor={colors.textMuted}
                  value={broker} onChangeText={setBroker}
                  style={[styles.input, { color: colors.text, fontSize: typography.size.base }]} />
              </View>
            </View>
            {showMF && (
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>FOLIO NUMBER</Text>
                <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <TextInput placeholder="Optional" placeholderTextColor={colors.textMuted}
                    value={folioNumber} onChangeText={setFolioNumber}
                    style={[styles.input, { color: colors.text, fontSize: typography.size.base }]} />
                </View>
              </View>
            )}
          </View>

          {/* FD specific */}
          {showFD && (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>INTEREST RATE %</Text>
                <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <TextInput placeholder="e.g. 7.5" placeholderTextColor={colors.textMuted} keyboardType="decimal-pad"
                    value={interestRate} onChangeText={setInterestRate}
                    style={[styles.input, { color: colors.text, fontSize: typography.size.base }]} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>MATURITY DATE</Text>
                <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <TextInput placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted}
                    value={maturityDate} onChangeText={setMaturityDate}
                    style={[styles.input, { color: colors.text, fontSize: typography.size.base }]} />
                </View>
              </View>
            </View>
          )}

          {/* Notes */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>NOTES</Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, alignItems: "flex-start" }]}>
            <TextInput placeholder="Optional notes..." placeholderTextColor={colors.textMuted}
              multiline numberOfLines={2} value={notes} onChangeText={setNotes}
              style={[styles.input, { color: colors.text, fontSize: typography.size.base, height: 60, textAlignVertical: "top" }]} />
          </View>

          {/* Save */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            style={[styles.saveBtn, { backgroundColor: meta.color }]}
            activeOpacity={0.85}
          >
            <Text style={[styles.saveBtnText, { fontSize: typography.size.md, fontWeight: typography.weight.semibold }]}>
              {isSaving ? "Saving…" : existing ? "Update Asset" : "Add Asset"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12 },
  title: {},
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 1, paddingHorizontal: 16, marginBottom: 8, marginTop: 14 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 8 },
  typeChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  typeLabel: {},
  subTypeRow: { paddingHorizontal: 16, gap: 8 },
  subTypeChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  subTypeLabel: { fontSize: 12 },
  row: { flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  inputBox: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11 },
  input: { flex: 1, padding: 0 },
  saveBtn: { marginHorizontal: 16, marginTop: 20, marginBottom: 8, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  saveBtnText: { color: "#fff" },
});

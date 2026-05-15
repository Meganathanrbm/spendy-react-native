import React, { useState, useMemo, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Alert, Animated, Pressable,
} from "react-native";
import { Plus, TrendingUp, TrendingDown, CirclePlus, ChartNoAxesColumn } from "lucide-react-native";
import { ASSET_TYPE_ICONS } from "../../lib/helpers/categoryIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../hooks/useTheme";
import { useAssets, usePortfolioSummary, useDeleteAsset } from "../../hooks/useAssets";
import { formatCurrency, formatPercent } from "../../lib/helpers/currency";
import { layout } from "../../theme/spacing";
import { Asset } from "../../types";

import AppHeader from "../../components/common/AppHeader";
import AssetCard, { ASSET_TYPE_META } from "../../components/assets/AssetCard";
import AddAssetModal from "../../components/assets/AddAssetModal";
import DonutChart, { DonutSlice } from "../../components/charts/DonutChart";

// Group assets by type for section display
const SECTION_ORDER = ["mutual_fund", "stocks", "fixed_deposit", "gold", "ppf", "nps", "epf", "crypto", "real_estate", "other"];

export default function AssetsScreen() {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();

  const { data: assets = [], isLoading, refetch } = useAssets();
  const { data: summary, refetch: refetchSummary } = usePortfolioSummary();
  const deleteMutation = useDeleteAsset();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>();
  const addBtnScale = useRef(new Animated.Value(1)).current;

  const openAddModal = () => {
    setEditingAsset(undefined);
    setModalVisible(true);
  };

  const onAddBtnPressIn = () =>
    Animated.spring(addBtnScale, { toValue: 0.93, useNativeDriver: true, speed: 60, bounciness: 0 }).start();

  const onAddBtnPressOut = () =>
    Animated.spring(addBtnScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }).start();

  const handleRefetch = () => { refetch(); refetchSummary(); };

  // Group by type
  const grouped = useMemo(() => {
    const map = new Map<string, Asset[]>();
    for (const a of assets) {
      const list = map.get(a.type) ?? [];
      list.push(a);
      map.set(a.type, list);
    }
    return map;
  }, [assets]);

  // Donut slices by type
  const donutSlices: DonutSlice[] = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.byType)
      .filter(([, v]) => v.current > 0)
      .map(([key, v]) => ({
        key,
        label: ASSET_TYPE_META[key]?.label ?? key,
        value: v.current,
        color: ASSET_TYPE_META[key]?.color ?? "#64748B",
      }));
  }, [summary]);

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setModalVisible(true);
  };

  const handleDelete = (asset: Asset) => {
    Alert.alert("Delete Asset", `Remove "${asset.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate(asset.id) },
    ]);
  };

  const totalReturns = summary?.totalReturns ?? 0;
  const totalReturnsPercent = summary?.totalReturnsPercent ?? 0;
  const isPositive = totalReturns >= 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Assets"
        rightElement={
          <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
            <Plus size={24} color={colors.primary} strokeWidth={1.7} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefetch} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: layout.tabBarHeight + insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Portfolio Overview Card ───────────────────── */}
        {summary && (
          <View style={[styles.overviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.overviewLabel, { color: colors.textMuted }]}>Total portfolio</Text>
            <Text style={[styles.overviewTotal, { color: colors.text, fontSize: typography.size["3xl"], fontWeight: typography.weight.extrabold }]}>
              {formatCurrency(summary.totalCurrentValue)}
            </Text>

            <View style={styles.overviewReturns}>
              {isPositive ? <TrendingUp size={14} color={colors.primary} strokeWidth={1.7} /> : <TrendingDown size={14} color={colors.expenseAccent ?? "#F87171"} strokeWidth={1.7} />}
              <Text style={[styles.overviewReturnsText, { color: isPositive ? colors.primary : colors.expenseAccent ?? "#F87171", fontWeight: typography.weight.semibold }]}>
                {isPositive ? "+" : ""}{formatCurrency(totalReturns, { compact: true })}{"  "}
                ({isPositive ? "+" : ""}{formatPercent(totalReturnsPercent)})
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: typography.size.xs }}>overall</Text>
            </View>

            {/* Embedded allocation donut */}
            {donutSlices.length > 0 && (
              <View style={[styles.allocationInner, { borderTopColor: colors.border }]}>
                <View style={styles.allocationRow}>
                  <DonutChart slices={donutSlices} centerLabel="Portfolio" centerValue={summary.totalCurrentValue} size={140} />
                  <View style={styles.allocationLegend}>
                    {donutSlices.map((s) => {
                      const pct = summary.totalCurrentValue > 0
                        ? (s.value / summary.totalCurrentValue) * 100 : 0;
                      return (
                        <View key={s.key} style={styles.legendRow}>
                          <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.legendLabel, { color: colors.text, fontSize: typography.size.xs, fontWeight: typography.weight.medium }]}>
                              {s.label}
                            </Text>
                            <Text style={[styles.legendValue, { color: colors.textMuted, fontSize: typography.size.xs }]}>
                              {formatCurrency(s.value, { compact: true })}  ·  {formatPercent(pct, 0)}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            <View style={[styles.overviewRow, { backgroundColor: colors.surfaceAlt, borderRadius: 10 }]}>
              <View style={styles.overviewStat}>
                <Text style={[styles.overviewStatLabel, { color: colors.textMuted }]}>INVESTED</Text>
                <Text style={[styles.overviewStatValue, { color: colors.text, fontWeight: typography.weight.semibold }]}>
                  {formatCurrency(summary.totalInvested, { compact: true })}
                </Text>
              </View>
              <View style={[styles.overviewDivider, { backgroundColor: colors.border }]} />
              <View style={styles.overviewStat}>
                <Text style={[styles.overviewStatLabel, { color: colors.textMuted }]}>ASSETS</Text>
                <Text style={[styles.overviewStatValue, { color: colors.text, fontWeight: typography.weight.semibold }]}>
                  {assets.length}
                </Text>
              </View>
              <View style={[styles.overviewDivider, { backgroundColor: colors.border }]} />
              <View style={styles.overviewStat}>
                <Text style={[styles.overviewStatLabel, { color: colors.textMuted }]}>LIQUID</Text>
                <Text style={[styles.overviewStatValue, { color: colors.text, fontWeight: typography.weight.semibold }]}>
                  {formatCurrency(
                    assets.filter((a) => ["stocks", "mutual_fund", "gold", "crypto"].includes(a.type))
                      .reduce((s, a) => s + a.currentValue, 0),
                    { compact: true }
                  )}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Assets by type ────────────────────────────── */}
        {assets.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIconRing, { backgroundColor: colors.primaryMuted ?? colors.surfaceAlt }]}>
              <ChartNoAxesColumn size={36} color={colors.textMuted} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.semibold }]}>
              No assets yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Track your mutual funds, FDs, stocks, gold, and more
            </Text>
            <Pressable
              onPress={openAddModal}
              onPressIn={onAddBtnPressIn}
              onPressOut={onAddBtnPressOut}
            >
              <Animated.View
                style={[
                  styles.emptyBtn,
                  { backgroundColor: colors.primary, transform: [{ scale: addBtnScale }] },
                ]}
              >
                <Plus size={18} color="#fff" strokeWidth={2} />
                <Text style={{ color: "#fff", fontWeight: typography.weight.semibold, fontSize: typography.size.base }}>
                  Add Your First Asset
                </Text>
              </Animated.View>
            </Pressable>
          </View>
        ) : (
          SECTION_ORDER.map((typeKey) => {
            const items = grouped.get(typeKey);
            if (!items || items.length === 0) return null;
            const meta = ASSET_TYPE_META[typeKey];
            const sectionTotal = items.reduce((s, a) => s + a.currentValue, 0);
            return (
              <View key={typeKey}>
                <View style={styles.sectionHeader}>
                  {(() => { const Icon = ASSET_TYPE_ICONS[typeKey] ?? ASSET_TYPE_ICONS.other; return <Icon size={14} color={colors.textSecondary} strokeWidth={1.7} />; })()}
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontSize: typography.size.xs }]}>
                    {meta.label.toUpperCase()}
                  </Text>
                  <Text style={[styles.sectionTotal, { color: colors.text, fontSize: typography.size.xs, fontWeight: typography.weight.semibold }]}>
                    {formatCurrency(sectionTotal, { compact: true })}
                  </Text>
                </View>
                {items.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onEdit={() => handleEdit(asset)}
                    onDelete={() => handleDelete(asset)}
                  />
                ))}
              </View>
            );
          })
        )}

        {/* Add more button */}
        {assets.length > 0 && (
          <TouchableOpacity
            onPress={openAddModal}
            style={[styles.addMoreBtn, { borderColor: colors.primary, backgroundColor: colors.primaryMuted }]}
            activeOpacity={0.75}
          >
            <CirclePlus size={20} color={colors.primary} strokeWidth={1.7} />
            <Text style={[styles.addMoreLabel, { color: colors.primary, fontSize: typography.size.base, fontWeight: typography.weight.semibold }]}>
              Add Asset
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <AddAssetModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingAsset(undefined); }}
        existing={editingAsset}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  addBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  overviewCard: { margin: 16, borderRadius: layout.cardRadius, borderWidth: StyleSheet.hairlineWidth, padding: 20, gap: 10 },
  overviewLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.3 },
  allocationInner: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 14, marginTop: 4 },
  overviewTotal: {},
  overviewReturns: { flexDirection: "row", alignItems: "center", gap: 6 },
  overviewReturnsText: { fontSize: 14 },
  overviewRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  overviewStat: { flex: 1, alignItems: "center" },
  overviewStatLabel: { fontSize: 10, fontWeight: "600", letterSpacing: 0.3 },
  overviewStatValue: { fontSize: 13, marginTop: 2 },
  overviewDivider: { width: 1, height: 28 },
  card: { margin: 16, borderRadius: layout.cardRadius, borderWidth: StyleSheet.hairlineWidth, padding: 16 },
  cardTitle: { marginBottom: 12, letterSpacing: 0.5 },
  allocationRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  allocationLegend: { flex: 1, gap: 8 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: {},
  legendValue: {},
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  sectionIcon: { fontSize: 14 },
  sectionLabel: { flex: 1, fontWeight: "700", letterSpacing: 1 },
  sectionTotal: {},
  empty: { alignItems: "center", paddingTop: 48, gap: 10 },
  emptyIconRing: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: {},
  emptySubtitle: { fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  addMoreBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, marginTop: 8, borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed", paddingVertical: 14 },
  addMoreLabel: {},
});

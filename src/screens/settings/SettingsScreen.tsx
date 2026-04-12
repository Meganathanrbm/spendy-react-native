import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "../../hooks/useTheme";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { layout } from "../../theme/spacing";
import { RootStackParamList } from "../../navigation/types";
import AppHeader from "../../components/common/AppHeader";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type SettingRow = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
};

export default function SettingsScreen() {
  const { colors, typography } = useTheme();
  const { toggleTheme, mode } = useThemeContext();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will delete ALL transactions, accounts, budgets and assets. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.multiRemove([
              "@spendy_transactions",
              "@spendy_accounts",
              "@spendy_budgets",
              "@spendy_assets",
              "@spendy_custom_categories",
            ]);
            Alert.alert("Done", "All data has been cleared.");
          },
        },
      ]
    );
  };

  const rows: SettingRow[] = [
    {
      icon: "moon-outline",
      label: "Dark Mode",
      sublabel: mode === "dark" ? "On" : "Off",
      rightElement: (
        <Switch
          value={mode === "dark"}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      ),
    },
    {
      icon: "grid-outline",
      label: "Categories",
      sublabel: "Manage income & expense categories",
      onPress: () => navigation.navigate("CategoriesNav"),
    },
    {
      icon: "chatbubble-ellipses-outline",
      label: "Fetch Bank SMS",
      sublabel: "Auto-detect transactions from SMS",
      onPress: () => navigation.navigate("SMSInbox"),
    },
    {
      icon: "notifications-outline",
      label: "Notifications",
      sublabel: "Coming soon",
    },
    {
      icon: "cloud-upload-outline",
      label: "Export Data",
      sublabel: "Coming soon",
    },
    {
      icon: "shield-checkmark-outline",
      label: "Privacy & Security",
      sublabel: "Coming soon",
    },
    {
      icon: "information-circle-outline",
      label: "About Spendy",
      sublabel: "Version 2.0.0",
    },
    {
      icon: "trash-outline",
      label: "Clear All Data",
      sublabel: "Delete all transactions, accounts, budgets",
      onPress: handleClearData,
      danger: true,
    },
    {
      icon: "log-out-outline",
      label: "Logout",
      onPress: () => {
        Alert.alert("Logout", "Are you sure?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            style: "destructive",
            onPress: async () => {
              await logout();
              // RootNavigator automatically shows auth stack when user is null
            },
          },
        ]);
      },
      danger: true,
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Settings"
        onMenuPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {rows.map((row, i) => (
            <TouchableOpacity
              key={row.label}
              onPress={row.onPress}
              disabled={!row.onPress && !row.rightElement}
              activeOpacity={0.7}
              style={[
                styles.row,
                { borderBottomColor: colors.divider },
                i < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth },
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: row.danger ? colors.expenseLight : colors.surfaceAlt }]}>
                <Ionicons
                  name={row.icon}
                  size={18}
                  color={row.danger ? colors.expense : colors.primary}
                />
              </View>
              <View style={styles.rowInfo}>
                <Text style={[styles.rowLabel, { color: row.danger ? colors.expense : colors.text, fontSize: typography.size.base, fontWeight: typography.weight.medium }]}>
                  {row.label}
                </Text>
                {row.sublabel && (
                  <Text style={[styles.rowSublabel, { color: colors.textMuted, fontSize: typography.size.xs }]}>
                    {row.sublabel}
                  </Text>
                )}
              </View>
              {row.rightElement ?? (
                row.onPress ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: { margin: 16, borderRadius: layout.cardRadius, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1 },
  rowLabel: {},
  rowSublabel: { marginTop: 1 },
});

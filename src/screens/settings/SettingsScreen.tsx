import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import {
  Moon, LayoutGrid, MessageSquare, Bell, Cloud, ShieldCheck,
  Info, Trash2, LogOut, ChevronRight,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
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
  icon: LucideIcon;
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
      ],
    );
  };

  const rows: SettingRow[] = [
    {
      icon: Moon,
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
      icon: LayoutGrid,
      label: "Categories",
      sublabel: "Manage income & expense categories",
      onPress: () => navigation.navigate("CategoriesNav"),
    },
    {
      icon: MessageSquare,
      label: "Fetch Bank SMS",
      sublabel: "Auto-detect transactions from SMS",
      onPress: () => navigation.navigate("SMSInbox"),
    },
    {
      icon: Bell,
      label: "Notifications",
      sublabel: "Coming soon",
    },
    {
      icon: Cloud,
      label: "Export Data",
      sublabel: "Coming soon",
    },
    {
      icon: ShieldCheck,
      label: "Privacy & Security",
      sublabel: "Coming soon",
    },
    {
      icon: Info,
      label: "About Spendy",
      sublabel: "Version 2.0.0",
    },
    {
      icon: Trash2,
      label: "Clear All Data",
      sublabel: "Delete all transactions, accounts, budgets",
      onPress: handleClearData,
      danger: true,
    },
    {
      icon: LogOut,
      label: "Logout",
      onPress: () => {
        Alert.alert("Logout", "Are you sure?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            style: "destructive",
            onPress: async () => {
              await logout();
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
        rightElement={<></>}
        onMenuPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {rows.map((row, i) => {
            const RowIcon = row.icon;
            return (
              <TouchableOpacity
                key={row.label}
                onPress={row.onPress}
                disabled={!row.onPress}
                activeOpacity={0.7}
                style={[
                  styles.row,
                  { borderBottomColor: colors.divider },
                  i < rows.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: row.danger
                        ? colors.expenseLight
                        : colors.surfaceAlt,
                    },
                  ]}
                >
                  <RowIcon
                    size={18}
                    color={row.danger ? colors.expense : colors.primary}
                    strokeWidth={1.7}
                  />
                </View>
                <View style={styles.rowInfo}>
                  <Text
                    style={[
                      styles.rowLabel,
                      {
                        color: row.danger ? colors.expense : colors.text,
                        fontSize: typography.size.base,
                        fontWeight: typography.weight.medium,
                      },
                    ]}
                  >
                    {row.label}
                  </Text>
                  {row.sublabel && (
                    <Text
                      style={[
                        styles.rowSublabel,
                        { color: colors.textMuted, fontSize: typography.size.xs },
                      ]}
                    >
                      {row.sublabel}
                    </Text>
                  )}
                </View>
                {row.rightElement ??
                  (row.onPress ? (
                    <ChevronRight size={16} color={colors.textMuted} strokeWidth={1.7} />
                  ) : null)}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: {
    margin: 16,
    borderRadius: layout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowInfo: { flex: 1 },
  rowLabel: {},
  rowSublabel: { marginTop: 1 },
});

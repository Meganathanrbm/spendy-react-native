import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { useTheme } from "../hooks/useTheme";
import { BottomTabParamList } from "./types";
import { layout } from "../theme/spacing";

// Screens
import RecordsScreen from "../screens/records/RecordsScreen";
import AnalysisScreen from "../screens/analysis/AnalysisScreen";
import BudgetsScreen from "../screens/budgets/BudgetsScreen";
import AccountsScreen from "../screens/Accounts/AccountsScreen";
import AssetsScreen from "../screens/assets/AssetsScreen";

const Tab = createBottomTabNavigator<BottomTabParamList>();

// ─── Tab icons ───────────────────────────────────────────────────────────────

type TabIconProps = { name: string; focused: boolean; color: string; size: number };

const TAB_ICONS: Record<
  keyof BottomTabParamList,
  { active: string; inactive: string; lib: "ionicons" | "material" }
> = {
  Records:  { active: "receipt",              inactive: "receipt-outline",        lib: "ionicons" },
  Analysis: { active: "bar-chart",            inactive: "bar-chart-outline",      lib: "ionicons" },
  Budgets:  { active: "wallet",               inactive: "wallet-outline",         lib: "ionicons" },
  Accounts: { active: "card",                 inactive: "card-outline",           lib: "ionicons" },
  Assets:   { active: "trending-up",          inactive: "trending-up-outline",    lib: "ionicons" },
};

const TabIcon = ({ name, focused, color, size }: TabIconProps) => {
  const config = TAB_ICONS[name as keyof BottomTabParamList];
  if (!config) return null;
  const iconName = focused ? config.active : config.inactive;
  return <Ionicons name={iconName as any} size={size} color={color} />;
};

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.tabBackground,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom,
          height: layout.tabBarHeight + insets.bottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        descriptors[route.key];
        const isFocused = state.index === index;
        const color = isFocused ? colors.tabActive : colors.tabInactive;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as keyof BottomTabParamList);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tabItem}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
          >
            {/* Active indicator dot */}
            {isFocused && (
              <View style={[styles.activeDot, { backgroundColor: colors.tabActive }]} />
            )}
            <TabIcon name={route.name} focused={isFocused} color={color} size={22} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Navigator ───────────────────────────────────────────────────────────────

export default function BottomTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Records"  component={RecordsScreen} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} />
      <Tab.Screen name="Budgets"  component={BudgetsScreen} />
      <Tab.Screen name="Accounts" component={AccountsScreen} />
      <Tab.Screen name="Assets"   component={AssetsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    position: "relative",
  },
  activeDot: {
    position: "absolute",
    top: 0,
    width: 24,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});

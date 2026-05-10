// Spendy 2.0 — Bottom tab bar: icon + label, active dot indicator, no shadow.
import React, { useCallback, memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { LucideIcon } from "lucide-react-native";
import {
  Receipt,
  ChartNoAxesColumn,
  Wallet,
  CreditCard,
  TrendingUp,
} from "lucide-react-native";

import { useTheme } from "../hooks/useTheme";
import { BottomTabParamList, RootStackParamList } from "./types";
import { DrawerProvider, useDrawer } from "../contexts/DrawerContext";

// Screens
import RecordsScreen from "../screens/records/RecordsScreen";
import AnalysisScreen from "../screens/analysis/AnalysisScreen";
import BudgetsScreen from "../screens/budgets/BudgetsScreen";
import AccountsScreen from "../screens/accounts/AccountsScreen";
import AssetsScreen from "../screens/assets/AssetsScreen";

// Drawer
import DrawerMenu from "../components/navigation/DrawerMenu";

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TAB_CONFIG: Record<keyof BottomTabParamList, { label: string; icon: LucideIcon }> = {
  Records:  { label: "Records",  icon: Receipt },
  Analysis: { label: "Analysis", icon: ChartNoAxesColumn },
  Budgets:  { label: "Budgets",  icon: Wallet },
  Accounts: { label: "Accounts", icon: CreditCard },
  Assets:   { label: "Assets",   icon: TrendingUp },
};

const TabItem = memo(function TabItem({
  routeKey,
  routeName,
  isFocused,
  colors,
  onPress,
}: {
  routeKey: string;
  routeName: string;
  isFocused: boolean;
  colors: any;
  onPress: () => void;
}) {
  const cfg = TAB_CONFIG[routeName as keyof BottomTabParamList];
  if (!cfg) return null;

  const color = isFocused ? colors.tabActive : colors.tabInactive;
  const Icon = cfg.icon;

  return (
    <Pressable
      onPress={onPress}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
    >
      {/* Active indicator dot at very top */}
      <View
        style={[
          styles.activeDot,
          { backgroundColor: colors.tabActive, opacity: isFocused ? 1 : 0 },
        ]}
      />
      <Icon size={21} color={color} strokeWidth={isFocused ? 2 : 1.6} />
      <Text
        style={[
          styles.tabLabel,
          {
            color,
            fontWeight: isFocused ? "600" : "500",
          },
        ]}
      >
        {cfg.label}
      </Text>
    </Pressable>
  );
});

const CustomTabBar = memo(function CustomTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const handlePress = useCallback(
    (routeKey: string, routeName: string, isFocused: boolean) => {
      const event = navigation.emit({
        type: "tabPress",
        target: routeKey,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName as keyof BottomTabParamList);
      }
    },
    [navigation],
  );

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.tabBackground,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 64 + Math.max(insets.bottom, 8),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        return (
          <TabItem
            key={route.key}
            routeKey={route.key}
            routeName={route.name}
            isFocused={isFocused}
            colors={colors}
            onPress={() => handlePress(route.key, route.name, isFocused)}
          />
        );
      })}
    </View>
  );
});

function BottomTabsInner() {
  const { isOpen, closeDrawer } = useDrawer();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleNavigate = useCallback(
    (screen: string) => {
      if (screen === "Settings") {
        navigation.navigate("Settings");
      } else if (screen === "Categories") {
        navigation.navigate("CategoriesNav");
      } else if (screen === "SMSInbox") {
        navigation.navigate("SMSInbox");
      }
    },
    [navigation],
  );

  return (
    <>
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

      <DrawerMenu
        visible={isOpen}
        onClose={closeDrawer}
        onNavigate={handleNavigate}
      />
    </>
  );
}

export default function BottomTabs() {
  return (
    <DrawerProvider>
      <BottomTabsInner />
    </DrawerProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    gap: 3,
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
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.1,
  },
});

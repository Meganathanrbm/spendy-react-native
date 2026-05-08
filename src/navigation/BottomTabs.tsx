import React, { useCallback, memo } from "react";
import { View, StyleSheet, Platform, Pressable } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useTheme } from "../hooks/useTheme";
import { BottomTabParamList, RootStackParamList } from "./types";
import { layout } from "../theme/spacing";
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

type TabIconProps = {
  name: string;
  focused: boolean;
  color: string;
  size: number;
};

const TAB_ICONS: Record<
  keyof BottomTabParamList,
  { active: string; inactive: string; lib: "ionicons" | "material" }
> = {
  Records: { active: "receipt", inactive: "receipt-outline", lib: "ionicons" },
  Analysis: {
    active: "bar-chart",
    inactive: "bar-chart-outline",
    lib: "ionicons",
  },
  Budgets: { active: "wallet", inactive: "wallet-outline", lib: "ionicons" },
  Accounts: { active: "card", inactive: "card-outline", lib: "ionicons" },
  Assets: {
    active: "trending-up",
    inactive: "trending-up-outline",
    lib: "ionicons",
  },
};

const TabIcon = ({ name, focused, color, size }: TabIconProps) => {
  const config = TAB_ICONS[name as keyof BottomTabParamList];
  if (!config) return null;
  const iconName = focused ? config.active : config.inactive;
  return <Ionicons name={iconName as any} size={size} color={color} />;
};

// ─── Animated tab item ────────────────────────────────────────────────────────

type AnimatedTabItemProps = {
  routeKey: string;
  routeName: string;
  isFocused: boolean;
  colors: any;
  onPress: () => void;
};

const AnimatedTabItem = memo(function AnimatedTabItem({
  routeKey,
  routeName,
  isFocused,
  colors,
  onPress,
}: AnimatedTabItemProps) {
  const color = isFocused ? colors.tabActive : colors.tabInactive;

  return (
    <Pressable
      key={routeKey}
      onPress={onPress}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
    >
      <View
        style={[
          styles.activeDot,
          { backgroundColor: colors.tabActive, opacity: isFocused ? 1 : 0 },
        ]}
      />
      <View style={[styles.iconContainer]}>
        <TabIcon name={routeName} focused={isFocused} color={color} size={22} />
      </View>
    </Pressable>
  );
});

const CustomTabBar = memo(({
  state,
  navigation,
}: BottomTabBarProps) => {
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
          paddingBottom: insets.bottom,
          height: layout.tabBarHeight + insets.bottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        return (
          <AnimatedTabItem
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
        <Tab.Screen name="Records" component={RecordsScreen} />
        <Tab.Screen name="Analysis" component={AnalysisScreen} />
        <Tab.Screen name="Budgets" component={BudgetsScreen} />
        <Tab.Screen name="Accounts" component={AccountsScreen} />
        <Tab.Screen name="Assets" component={AssetsScreen} />
      </Tab.Navigator>

      <DrawerMenu
        visible={isOpen}
        onClose={closeDrawer}
        onNavigate={handleNavigate}
      />
    </>
  );
}

// ─── Navigator ───────────────────────────────────────────────────────────────

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
  iconContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});

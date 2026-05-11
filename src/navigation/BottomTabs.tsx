import React, { useCallback, memo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
import { TabItem } from "../components/BottomTabs/TabItem";

const Tab = createBottomTabNavigator<BottomTabParamList>();

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
});

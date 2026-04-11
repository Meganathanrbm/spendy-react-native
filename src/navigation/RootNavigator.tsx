import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useThemeContext } from "../contexts/ThemeContext";
import { RootStackParamList } from "./types";

import Login from "../screens/auth/Login";
import Signup from "../screens/auth/Signup";
import BottomTabs from "./BottomTabs";

// Screens navigated to from within tabs
import AddTransactionScreen from "../screens/records/AddTransactionScreen";
import AddAccountScreen from "../screens/Accounts/AddAccountScreen";
import AddAssetScreen from "../screens/assets/AddAssetScreen";
import SetBudgetScreen from "../screens/budgets/SetBudgetScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { mode, theme } = useThemeContext();

  // Wire React Navigation's theme to ours for background + header tinting
  const navTheme = {
    ...(mode === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(mode === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        {/* Auth */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />

        {/* Main app */}
        <Stack.Screen name="Main" component={BottomTabs} />

        {/* Modals / full-screen pushes */}
        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="AddAccount"
          component={AddAccountScreen}
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="AddAsset"
          component={AddAssetScreen}
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="SetBudget"
          component={SetBudgetScreen}
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

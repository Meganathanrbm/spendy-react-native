import React from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import { useThemeContext } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList } from "./types";

// Auth screens
import Login from "../screens/auth/Login";
import Signup from "../screens/auth/Signup";

// App screens
import BottomTabs from "./BottomTabs";
import AddTransactionScreen from "../screens/records/AddTransactionScreen";
import AddAccountScreen from "../screens/accounts/AddAccountScreen";
import AddAssetScreen from "../screens/assets/AddAssetScreen";
import EditAssetScreen from "../screens/assets/EditAssetScreen";
import SetBudgetScreen from "../screens/budgets/SetBudgetScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import CategoriesScreen from "../screens/settings/CategoriesScreen";
import SMSInboxScreen from "../screens/sms/SMSInboxScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { mode, theme } = useThemeContext();
  const { user, isLoading } = useAuth();

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

  // Show a blank loading screen while restoring session from AsyncStorage.
  // This prevents the Login screen from flashing before we know auth state.
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // ── Authenticated stack ───────────────────────────────────────────
          <>
            <Stack.Screen name="Main" component={BottomTabs} />
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
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="CategoriesNav" component={CategoriesScreen} />
            <Stack.Screen name="SMSInbox" component={SMSInboxScreen} />
            <Stack.Screen
              name="EditAsset"
              component={EditAssetScreen}
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
          </>
        ) : (
          // ── Auth stack ────────────────────────────────────────────────────
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

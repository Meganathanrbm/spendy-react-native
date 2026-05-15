import React, { useEffect, useMemo, useState } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, DeviceEventEmitter } from "react-native";
import { useThemeContext } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList } from "./types";
import { hasCompletedOnboarding } from "../lib/api/auth";

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
// import DataManagementScreen from "../screens/settings/DataManagementScreen";
import SMSInboxScreen from "../screens/sms/SMSInboxScreen";
import CategoryDetailScreen from "../screens/analysis/CategoryDetailScreen";
import OnboardingAccountsScreen from "../screens/onboarding/OnboardingAccountsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { mode, theme } = useThemeContext();
  const { user, isLoading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      hasCompletedOnboarding(user.email).then(setOnboardingDone);
    } else {
      setOnboardingDone(null);
    }
  }, [user]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("onboarding_complete", () => {
      setOnboardingDone(true);
    });
    return () => sub.remove();
  }, []);

  const navTheme = useMemo(
    () => ({
      ...(mode === "dark" ? DarkTheme : DefaultTheme),
      colors: {
        ...(mode === "dark" ? DarkTheme.colors : DefaultTheme.colors),
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
        primary: theme.colors.primary,
      },
    }),
    [mode, theme],
  );
  if (isLoading || (user && onboardingDone === null)) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
          </>
        ) : !onboardingDone ? (
          <Stack.Screen
            name="OnboardingAccounts"
            component={OnboardingAccountsScreen}
          />
        ) : (
          <>
            <Stack.Screen name="Main" component={BottomTabs} />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="AddAccount"
              component={AddAccountScreen}
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="AddAsset"
              component={AddAssetScreen}
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="SetBudget"
              component={SetBudgetScreen}
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ animation: "slide_from_right" }}
            />
            {/* <Stack.Screen
              name="DataManagement"
              component={DataManagementScreen}
              options={{ animation: "slide_from_right" }}
            /> */}
            <Stack.Screen
              name="CategoriesNav"
              component={CategoriesScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="SMSInbox"
              component={SMSInboxScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="EditAsset"
              component={EditAssetScreen}
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="CategoryDetail"
              component={CategoryDetailScreen}
              options={{ animation: "slide_from_right" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

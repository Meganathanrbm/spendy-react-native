import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildTheme, AppTheme } from "../theme";

const THEME_KEY = "@spendy_theme";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  theme: AppTheme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Use system color scheme as initial value so the first render is already correct
  const [mode, setModeState] = useState<ThemeMode>(
    () => (Appearance.getColorScheme() === "dark" ? "dark" : "light")
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preference and override system default if user has a preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === "light" || saved === "dark") {
        setModeState(saved);
      }
      setIsLoaded(true);
    });
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(THEME_KEY, newMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(mode === "light" ? "dark" : "light");
  }, [mode, setMode]);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  const value = useMemo(
    () => ({ theme, mode, toggleTheme, setMode }),
    [theme, mode, toggleTheme, setMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {isLoaded ? (
        children
      ) : (
        // Hold rendering until theme is known — prevents light→dark flash
        <View style={{ flex: 1, backgroundColor: theme.colors.background }} />
      )}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error("useThemeContext must be used inside ThemeProvider");
  return ctx;
};

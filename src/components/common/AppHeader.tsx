import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { useDrawer } from "../../contexts/DrawerContext";
import { layout } from "../../theme/spacing";

type Props = {
  title: string;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  rightElement?: React.ReactNode;
};

export default function AppHeader({
  title,
  onMenuPress,
  onSearchPress,
  rightElement,
}: Props) {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const { openDrawer } = useDrawer();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          paddingTop: insets.top + 4,
        },
      ]}
    >
      {/* Left — hamburger */}
      <TouchableOpacity
        onPress={onMenuPress ?? openDrawer}
        style={styles.iconBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="menu" size={24} color={colors.text} />
      </TouchableOpacity>

      {/* Center — title */}
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: typography.size.md,
            fontWeight: typography.weight.semibold,
          },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* Right — search or custom */}
      {rightElement ?? (
        <TouchableOpacity
          onPress={onSearchPress}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="search-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: layout.headerHeight + 44, // header + status bar approx
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
});

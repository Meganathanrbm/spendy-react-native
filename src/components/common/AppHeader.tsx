// Spendy 2.0 — App header: menu left, centered title, optional right slot.
// Background matches screen bg. Hairline bottom border.
import React, { useRef, useCallback, memo } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { useDrawer } from "../../contexts/DrawerContext";
import type { LucideIcon } from "lucide-react-native";
import { Menu, Search } from "lucide-react-native";

type Props = {
  title: string;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  rightElement?: React.ReactNode;
};

// Reusable spring-press icon button (36×36 touch target)
export const IconBtn = memo(function IconBtn({
  icon: Icon,
  size = 20,
  onPress,
  color,
}: {
  icon: LucideIcon;
  size?: number;
  onPress?: () => void;
  color: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() =>
    Animated.spring(scale, {
      toValue: 0.82,
      useNativeDriver: true,
      speed: 60,
      bounciness: 0,
    }).start(),
  []);

  const onPressOut = useCallback(() =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start(),
  []);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.iconBtn}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon size={size} color={color} strokeWidth={1.7} />
      </Animated.View>
    </Pressable>
  );
});

const AppHeader = memo(function AppHeader({
  title,
  onMenuPress,
  onSearchPress,
  rightElement,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { openDrawer } = useDrawer();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          paddingTop: insets.top + 4,
        },
      ]}
    >
      <IconBtn
        icon={Menu}
        size={22}
        onPress={onMenuPress ?? openDrawer}
        color={colors.text}
      />

      <Text
        style={[styles.title, { color: colors.text }]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {rightElement !== undefined ? (
        rightElement
      ) : (
        <IconBtn
          icon={Search}
          size={20}
          onPress={onSearchPress}
          color={colors.text}
        />
      )}
    </View>
  );
});

export default AppHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: 14,
    paddingBottom: 8,
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
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
});

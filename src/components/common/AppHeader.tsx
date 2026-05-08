import React, { useRef, useCallback, memo } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
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

// Reusable spring-press icon button
export const IconBtn = memo(function IconBtn({
  name,
  size = 24,
  onPress,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  onPress?: () => void;
  color: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() =>
    Animated.spring(scale, { toValue: 0.80, useNativeDriver: true, speed: 60, bounciness: 0 }).start(),
  []);

  const onPressOut = useCallback(() =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 12 }).start(),
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
        <Ionicons name={name} size={size} color={color} />
      </Animated.View>
    </Pressable>
  );
});

const AppHeader = memo(function AppHeader({ title, onMenuPress, onSearchPress, rightElement }: Props) {
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
      <IconBtn
        name="menu"
        size={24}
        onPress={onMenuPress ?? openDrawer}
        color={colors.text}
      />

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

      {rightElement ?? (
        <IconBtn
          name="search-outline"
          size={22}
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
    height: layout.headerHeight + 44,
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

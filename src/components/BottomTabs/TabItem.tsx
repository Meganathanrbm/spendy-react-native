import { Pressable, StyleSheet, Text, View } from "react-native";
import { TAB_CONFIG } from "../../navigation/config";
import { BottomTabParamList } from "../../navigation/types";
import { memo } from "react";

export const TabItem = memo(function TabItem({
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

const styles = StyleSheet.create({
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

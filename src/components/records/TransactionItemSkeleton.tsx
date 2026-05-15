import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { layout } from "../../theme/spacing";

const ICON_SIZE = 36;
const ICON_RADIUS = Math.round(ICON_SIZE * 0.31);

function SkeletonBox({
  width,
  height,
  borderRadius = 6,
  opacity,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  opacity: Animated.Value;
}) {
  const { colors } = useTheme();
  return (
    <Animated.View
      style={{
        width: width as any,
        height,
        borderRadius,
        backgroundColor: colors.shimmer,
        opacity,
      }}
    />
  );
}

export function TransactionItemSkeleton({ opacity }: { opacity: Animated.Value }) {
  return (
    <View style={styles.container}>
      <SkeletonBox
        width={ICON_SIZE}
        height={ICON_SIZE}
        borderRadius={ICON_RADIUS}
        opacity={opacity}
      />
      <View style={styles.middle}>
        <SkeletonBox width={130} height={13} borderRadius={5} opacity={opacity} />
        <SkeletonBox width={90} height={11} borderRadius={4} opacity={opacity} />
      </View>
      <SkeletonBox width={64} height={13} borderRadius={5} opacity={opacity} />
    </View>
  );
}

export function TransactionListSkeleton({ count = 8 }: { count?: number }) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <TransactionItemSkeleton key={i} opacity={pulse} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 14,
    gap: 12,
  },
  middle: { flex: 1, gap: 6 },
});

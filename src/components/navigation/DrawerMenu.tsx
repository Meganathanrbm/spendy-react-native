// Spendy 2.0 — Slide-in drawer. Profile header, sectioned menu, footer.
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  ScrollView,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import type { LucideIcon } from "lucide-react-native";
import {
  User,
  LayoutGrid,
  Settings,
  MessageSquare,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  Leaf,
} from "lucide-react-native";

const { width: SCREEN_W } = Dimensions.get("window");
const DRAWER_W = SCREEN_W * 0.82;

type DrawerItem = {
  key: string;
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  danger?: boolean;
  badge?: string;
  color?: string;
};

type DrawerSection = {
  title: string;
  items: DrawerItem[];
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
};

export default function DrawerMenu({ visible, onClose, onNavigate }: Props) {
  const { colors } = useTheme();
  const { toggleTheme, mode } = useThemeContext();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const slideX = useRef(new Animated.Value(-DRAWER_W)).current;
  const backdropOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideX.setValue(-DRAWER_W);
      backdropOp.setValue(0);
      Animated.parallel([
        Animated.spring(slideX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 16,
        }),
        Animated.timing(backdropOp, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideX, {
          toValue: -DRAWER_W,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOp, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const navigate = (screen: string) => {
    onClose();
    onNavigate(screen);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user?.email ?? "?")[0].toUpperCase();

  const sections: DrawerSection[] = [
    {
      title: "Account",
      items: [
        {
          key: "profile",
          icon: User,
          label: "Profile",
          onPress: () => onClose(),
          color: colors.textSecondary,
        },
        {
          key: "settings",
          icon: Settings,
          label: "Settings",
          onPress: () => navigate("Settings"),
          color: colors.textSecondary,
        },
      ],
    },
    {
      title: "Manage",
      items: [
        {
          key: "categories",
          icon: LayoutGrid,
          label: "Categories",
          onPress: () => navigate("Categories"),
          color: colors.textSecondary,
        },
        {
          key: "sms",
          icon: MessageSquare,
          label: "SMS Inbox",
          onPress: () => navigate("SMSInbox"),
          badge: "3 new",
          color: colors.primary,
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          key: "appearance",
          icon: mode === "dark" ? Sun : Moon,
          label: "Appearance",
          onPress: () => toggleTheme(),
          color: colors.textSecondary,
        },
        {
          key: "notifications",
          icon: Leaf,
          label: "Notifications",
          onPress: () => onClose(),
          color: colors.textSecondary,
        },
      ],
    },
    {
      title: "Session",
      items: [
        {
          key: "logout",
          icon: LogOut,
          label: "Sign out",
          onPress: async () => {
            onClose();
            await logout();
            onNavigate("Login");
          },
          danger: true,
          color: colors.expenseAccent,
        },
      ],
    },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Animated backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOp }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_W,
            backgroundColor: colors.background,
            borderRightColor: colors.border,
            paddingBottom: insets.bottom + 12,
            transform: [{ translateX: slideX }],
          },
        ]}
      >
        {/* Profile header */}
        <View
          style={[
            styles.profileHeader,
            {
              borderBottomColor: colors.border,
              paddingTop: insets.top + 20,
            },
          ]}
        >
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: colors.primary + "22",
                borderColor: colors.primary + "55",
              },
            ]}
          >
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {initials}
            </Text>
          </View>

          <Text style={[styles.profileName, { color: colors.text }]}>
            {user?.name ?? "Welcome"}
          </Text>
          <Text
            style={[styles.profileEmail, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {user?.email ?? ""}
          </Text>

          <View
            style={[
              styles.versionBadge,
              { backgroundColor: colors.primaryMuted },
            ]}
          >
            <ShieldCheck size={11} color={colors.primary} strokeWidth={1.7} />
            <Text style={[styles.versionText, { color: colors.primary }]}>
              SPENDY 2.0
            </Text>
          </View>
        </View>

        {/* Menu */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          {sections.map((section, si) => (
            <View key={si} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                {section.title}
              </Text>
              {section.items.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={item.onPress}
                    style={styles.menuItem}
                    activeOpacity={0.65}
                  >
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: colors.surfaceAlt },
                      ]}
                    >
                      <ItemIcon
                        size={15}
                        color={item.color ?? colors.textSecondary}
                        strokeWidth={1.7}
                      />
                    </View>
                    <Text
                      style={[
                        styles.itemLabel,
                        {
                          color: item.danger
                            ? colors.expenseAccent
                            : colors.text,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.badge ? (
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: colors.primaryMuted },
                        ]}
                      >
                        <Text
                          style={[styles.badgeText, { color: colors.primary }]}
                        >
                          {item.badge}
                        </Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Leaf size={13} color={colors.textMuted} strokeWidth={1.7} />
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Spendy 2.0 · Local-first
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: { fontSize: 18, fontWeight: "600" },
  profileName: { fontSize: 15, fontWeight: "600", letterSpacing: -0.1 },
  profileEmail: { fontSize: 12 },
  versionBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    marginTop: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  versionText: { fontSize: 10, fontWeight: "600", letterSpacing: 0.4 },
  section: { paddingVertical: 10 },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  itemLabel: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "500",
  },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: "600", letterSpacing: 0.3 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerText: { fontSize: 11 },
});

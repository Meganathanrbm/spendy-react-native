import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { useThemeContext } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

const { width: SCREEN_W } = Dimensions.get("window");
const DRAWER_W = SCREEN_W * 0.78;

type DrawerSection = {
  title?: string;
  items: DrawerItem[];
};

type DrawerItem = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  onPress: () => void;
  danger?: boolean;
  badge?: string;
  androidOnly?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
};

export default function DrawerMenu({ visible, onClose, onNavigate }: Props) {
  const { colors, typography } = useTheme();
  const { toggleTheme, mode } = useThemeContext();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(-DRAWER_W)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: visible ? 0 : -DRAWER_W,
      useNativeDriver: true,
      damping: 22,
      stiffness: 200,
    }).start();
  }, [visible]);

  const navigate = (screen: string) => {
    onClose();
    onNavigate(screen);
  };

  const sections: DrawerSection[] = [
    {
      title: "ACCOUNT",
      items: [
        {
          key: "profile",
          icon: "person-outline",
          label: "Profile",
          sublabel: user?.email ?? "",
          onPress: () => onClose(),
        },
      ],
    },
    {
      title: "MANAGE",
      items: [
        {
          key: "categories",
          icon: "grid-outline",
          label: "Categories",
          sublabel: "Income & expense categories",
          onPress: () => navigate("Categories"),
        },
        {
          key: "settings",
          icon: "settings-outline",
          label: "Settings",
          sublabel: "App preferences",
          onPress: () => navigate("Settings"),
        },
      ],
    },
    {
      title: "TOOLS",
      items: [
        {
          key: "sms",
          icon: "chatbubble-ellipses-outline",
          label: "Fetch Bank SMS",
          sublabel: "Auto-detect transactions",
          onPress: () => navigate("SMSInbox"),
          badge: "Android",
          androidOnly: false, // show on all, SMS screen handles graceful fallback
        },
        {
          key: "theme",
          icon: mode === "dark" ? "sunny-outline" : "moon-outline",
          label: mode === "dark" ? "Switch to Light" : "Switch to Dark",
          sublabel: `Currently ${mode} theme`,
          onPress: () => { toggleTheme(); },
        },
      ],
    },
    {
      title: "SESSION",
      items: [
        {
          key: "logout",
          icon: "log-out-outline",
          label: "Logout",
          sublabel: "Sign out of your account",
          onPress: async () => {
            onClose();
            await logout();
            onNavigate("Login");
          },
          danger: true,
        },
      ],
    },
  ];

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "SP";

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      {/* Drawer panel */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_W,
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + 12,
            transform: [{ translateX }],
          },
        ]}
      >
        {/* ── Profile header ── */}
        <View
          style={[
            styles.profileHeader,
            {
              backgroundColor: colors.primary,
              paddingTop: insets.top + 16,
            },
          ]}
        >
          {/* Close */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>

          {/* Avatar ring */}
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Ionicons name="person" size={32} color={colors.primary} />
            </View>
          </View>

          <Text style={styles.profileName}>
            {user?.name ?? "Welcome"}
          </Text>
          <Text style={styles.profileEmail} numberOfLines={1}>
            {user?.email ?? ""}
          </Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="wallet-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statLabel}>Spendy 2.0</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="shield-checkmark-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statLabel}>Secure</Text>
            </View>
          </View>
        </View>

        {/* ── Menu sections ── */}
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 8 }}>
          {sections.map((section, si) => (
            <View key={si}>
              {section.title ? (
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: colors.textMuted, fontSize: typography.size.xs, fontWeight: typography.weight.bold },
                  ]}
                >
                  {section.title}
                </Text>
              ) : null}
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  onPress={item.onPress}
                  style={[styles.menuItem, { borderBottomColor: colors.divider }]}
                  activeOpacity={0.65}
                >
                  {/* Icon box */}
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor: item.danger
                          ? colors.expenseLight
                          : item.key === "sms"
                          ? colors.incomeLight
                          : colors.surfaceAlt,
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={19}
                      color={
                        item.danger
                          ? colors.expense
                          : item.key === "sms"
                          ? colors.income
                          : colors.primary
                      }
                    />
                  </View>

                  {/* Labels */}
                  <View style={styles.itemInfo}>
                    <View style={styles.labelRow}>
                      <Text
                        style={[
                          styles.itemLabel,
                          {
                            color: item.danger ? colors.expense : colors.text,
                            fontSize: typography.size.base,
                            fontWeight: typography.weight.medium,
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.badge ? (
                        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                      ) : null}
                    </View>
                    {item.sublabel ? (
                      <Text
                        style={[
                          styles.itemSublabel,
                          { color: colors.textMuted, fontSize: typography.size.xs },
                        ]}
                        numberOfLines={1}
                      >
                        {item.sublabel}
                      </Text>
                    ) : null}
                  </View>

                  <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>

        {/* ── Footer ── */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Ionicons name="leaf-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.footerText, { color: colors.textMuted, fontSize: typography.size.xs }]}>
            Spendy 2.0  ·  Your finances, simplified
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
  },
  // ── Profile header ──
  profileHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 4,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 8,
  },
  avatarInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  profileEmail: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 10,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  // ── Sections ──
  sectionTitle: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 6,
    letterSpacing: 0.8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: { flex: 1 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemLabel: {},
  itemSublabel: { marginTop: 1 },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  // ── Footer ──
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerText: { textAlign: "center" },
});

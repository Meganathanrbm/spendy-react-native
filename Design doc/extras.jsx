// Add Account, Add Asset, Add Category, Icon picker, Profile, Settings, Categories list, SMS Inbox, Calendar heatmap, Category detail.

const { useState: usS, useMemo: usM, useRef: usR } = React;
const { Pressable: PR, IconBox: IBX, BottomSheet: BSH, AppHeader: AHD, MonthNav: MNV, SectionLabel: SLB, HAIRLINE: HLN } = UI;

// ─── Icon collection (50+ glyphs from Lucide-style set; using current I + extra mapping) ───
const ICON_LIBRARY = [
  // Money / commerce
  "wallet", "card", "cash", "bank", "trending", "piggy", "coins", "receipt", "tag", "gift",
  // Food / lifestyle
  "utensils", "coffee", "groceries", "shopping", "shirt", "home", "bed", "lamp",
  // Travel / transport
  "car", "plane", "bus", "fuel", "compass", "map",
  // Entertainment
  "gamepad", "music", "film", "ticket", "book", "graduation",
  // Services / utilities
  "phone", "wifi", "bolt", "drop", "fire", "tools", "wrench",
  // Health / care
  "heart", "pill", "stethoscope", "dumbbell",
  // Work / docs
  "briefcase", "laptop", "file", "chart", "target",
  // Misc
  "sparkles", "leaf", "paw", "package", "bell", "star",
];

// Inline minimal stroke icons to extend our set (for ones not in icons.jsx)
const EX = {
  utensils: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h2v11"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>,
  coffee: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2M10 2v2M14 2v2"/></svg>,
  groceries: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h2.5l3 14h11l3-9H6.5"/><circle cx="9" cy="21" r="1.5"/><circle cx="18" cy="21" r="1.5"/></svg>,
  shopping: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  shirt: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M20.4 8.4 17 5h-3a3 3 0 0 1-4 0H7L3.6 8.4a1 1 0 0 0 0 1.4l2.7 2.7L7 12v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-8l.7.5 2.7-2.7a1 1 0 0 0 0-1.4Z"/></svg>,
  home: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2Z"/></svg>,
  bed: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20"/><circle cx="7" cy="12" r="2"/></svg>,
  lamp: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M8 2h8l4 10H4Z"/><path d="M12 12v6"/><path d="M9 18h6v4H9z"/></svg>,
  car: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M14 16H9m10 0h1.5a1.5 1.5 0 0 0 1.5-1.5v-3.4a1.5 1.5 0 0 0-1.06-1.43L18 8.5l-1.6-3.2A2 2 0 0 0 14.6 4H9.4a2 2 0 0 0-1.8 1.3L6 8.5l-2.94.7A1.5 1.5 0 0 0 2 10.6V14a2 2 0 0 0 2 2h1"/><circle cx="6.5" cy="16.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/></svg>,
  plane: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z"/></svg>,
  bus: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6M15 6v6M2 12h19.6M18 18h2v-7a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v7h2"/><circle cx="7" cy="18" r="2"/><circle cx="15" cy="18" r="2"/></svg>,
  fuel: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M3 22h12M3 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M3 11h12M15 5l3 2v8a2 2 0 0 1-4 0V8"/></svg>,
  compass: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16 8 14 14 8 16 10 10 16 8"/></svg>,
  map: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3Z"/><path d="M9 3v15M15 6v15"/></svg>,
  gamepad: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258A4 4 0 0 0 17.32 5Z"/></svg>,
  music: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  film: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 3v18M17 3v18M2 8h5M17 8h5M2 16h5M17 16h5"/></svg>,
  ticket: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v14"/></svg>,
  book: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>,
  graduation: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  phone: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2.5"/><path d="M12 18h.01"/></svg>,
  wifi: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13a10 10 0 0 1 14 0M2 9a16 16 0 0 1 20 0M8.5 16.5a5 5 0 0 1 7 0M12 20h.01"/></svg>,
  bolt: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  drop: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5S12 5 12 2C12 5 9 7.5 7 9.5S5 13 5 15a7 7 0 0 0 7 7Z"/></svg>,
  fire: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z"/></svg>,
  tools: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9M17.64 15 22 10.64M20.91 11.7l-1.25-1.25a2.5 2.5 0 0 1 0-3.54l-2.46 2.46-3.54-3.54L15.7 4.91A2.5 2.5 0 0 0 14.41 4H10l-2 2 6 6"/></svg>,
  wrench: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94L14.7 6.3Z"/></svg>,
  heart: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/></svg>,
  pill: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>,
  stethoscope: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 0 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 0 0-.2.2"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>,
  dumbbell: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4 9.6 9.6M18.66 5.34l1.06 1.06M3.34 18.66l1.06 1.06M16.5 6.5 12 11l-3-3 4.5-4.5M3 21l4.5-4.5M21 3l-4.5 4.5"/></svg>,
  briefcase: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  laptop: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4l1.5 4h13Z"/></svg>,
  file: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><polyline points="14 2 14 8 20 8"/></svg>,
  chart: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  target: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  sparkles: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/></svg>,
  leaf: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>,
  paw: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="4.5" r="2.5"/><circle cx="17.5" cy="6.5" r="2"/><circle cx="4" cy="10" r="2"/><circle cx="20" cy="11" r="2"/><path d="M5 18a4 4 0 0 1 4-4h6a4 4 0 1 1 0 8H9a4 4 0 0 1-4-4Z"/></svg>,
  package: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15M21 8 12 13 3 8m9 5v9m9-9V8L12 3 3 8v8l9 5 9-5"/></svg>,
  bell: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  star: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 8.5 22 9.5 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.5 9 8.5 12 2"/></svg>,
  piggy: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5Z"/></svg>,
  coins: ({ size = 18, stroke = 1.7 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4M16.71 13.88l.7.71-2.82 2.82"/></svg>,
};
const ALL_ICONS = { ...I, ...EX };

// ────────── Generic full-screen modal scaffold
function FullScreen({ theme, title, onClose, onSave, saveLabel = "Save", canSave = true, children, rightSlot }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: theme.colors.bg, display: "flex", flexDirection: "column", animation: "slideUp 320ms cubic-bezier(0.22, 1, 0.36, 1)", zIndex: 90 }}>
      <div style={{ height: 56, padding: "0 8px", display: "flex", alignItems: "center", borderBottom: HLN(theme.colors.border) }}>
        <PR theme={theme} onClick={onClose} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: theme.colors.text }}><I.close size={19}/></div>
        </PR>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: theme.colors.text, letterSpacing: -0.1 }}>{title}</div>
        {rightSlot}
        {onSave && (
          <PR theme={theme} onClick={canSave ? onSave : undefined}>
            <div style={{ padding: "8px 14px", marginRight: 8, fontSize: 12.5, fontWeight: 600, color: canSave ? "#0A0A0A" : theme.colors.textMuted, background: canSave ? theme.colors.primary : theme.colors.surface3, borderRadius: 8, letterSpacing: 0.1 }}>{saveLabel}</div>
          </PR>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>{children}</div>
    </div>
  );
}

function Field({ label, theme, children, hint }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: theme.colors.textMuted, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 11, color: theme.colors.textFaint, marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

function TextInput({ theme, value, onChange, placeholder, mono = false, prefix }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", background: theme.colors.surface2, border: HLN(theme.colors.border), borderRadius: 10 }}>
      {prefix && <span style={{ color: theme.colors.textMuted, fontFamily: mono ? "var(--mono)" : "inherit" }}>{prefix}</span>}
      <input value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ flex: 1, fontFamily: mono ? "var(--mono)" : "var(--sans)", fontSize: mono ? 14 : 13, color: theme.colors.text, background: "transparent", border: "none", outline: "none", fontVariantNumeric: mono ? "tabular-nums" : "normal" }}/>
    </div>
  );
}

function ChipRow({ theme, options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(o => {
        const active = value === o.value;
        return (
          <PR key={o.value} theme={theme} onClick={() => onChange(o.value)} scale={0.96}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 12px", borderRadius: 999,
              background: active ? theme.colors.surface3 : theme.colors.surface2,
              border: HLN(active ? theme.colors.borderStrong : theme.colors.border),
              color: active ? theme.colors.text : theme.colors.textSecondary,
              fontSize: 12, fontWeight: 500,
            }}>
              {o.icon && <span style={{ color: o.color || theme.colors.textSecondary }}>{React.createElement(o.icon, { size: 13, stroke: 1.8 })}</span>}
              {o.label}
            </div>
          </PR>
        );
      })}
    </div>
  );
}

// ────────── ICON PICKER (modal)
function IconPicker({ theme, visible, onClose, onPick, color }) {
  return (
    <BSH visible={visible} onClose={onClose} theme={theme} maxHeight={0.7}>
      <div style={{ padding: "14px 16px 8px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text }}>Choose an icon</div>
        <div style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 2 }}>{ICON_LIBRARY.length} glyphs</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, padding: "8px 16px 24px" }}>
        {ICON_LIBRARY.map(name => {
          const Comp = ALL_ICONS[name];
          if (!Comp) return null;
          return (
            <PR key={name} theme={theme} onClick={() => { onPick(name); onClose(); }} scale={0.92}>
              <div style={{
                aspectRatio: "1 / 1",
                background: theme.colors.surface2, border: HLN(theme.colors.border),
                borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                color: color || theme.colors.text,
              }}>
                <Comp size={20} stroke={1.7}/>
              </div>
            </PR>
          );
        })}
      </div>
    </BSH>
  );
}

// ────────── COLOR PICKER inline
const PALETTE = ["#34D399","#60A5FA","#FBBF24","#F472B6","#A78BFA","#F87171","#22D3EE","#FB923C","#84CC16","#94A3B8"];
function ColorPicker({ theme, value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {PALETTE.map(c => (
        <PR key={c} theme={theme} onClick={() => onChange(c)} scale={0.88}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: c + "22",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: HLN(value === c ? c : "transparent"),
          }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: c }}/>
          </div>
        </PR>
      ))}
    </div>
  );
}

// ────────── ADD ACCOUNT
function AddAccountScreen({ theme, onClose, onSave }) {
  const [name, sN] = usS("");
  const [type, sT] = usS("savings");
  const [balance, sB] = usS("");
  const [bank, sBn] = usS("");
  const [last4, sL] = usS("");
  const [color, sC] = usS("#34D399");
  const [iconName, sI] = usS("wallet");
  const [iconOpen, sIO] = usS(false);
  const Icon = ALL_ICONS[iconName] || I.wallet;

  const types = [
    { value: "savings",    label: "Savings",    icon: I.bank },
    { value: "current",    label: "Current",    icon: I.bank },
    { value: "credit",     label: "Credit",     icon: I.card },
    { value: "wallet",     label: "Wallet",     icon: I.wallet },
    { value: "cash",       label: "Cash",       icon: I.cash },
    { value: "investment", label: "Investment", icon: I.trending },
  ];

  return (
    <FullScreen theme={theme} title="New account" onClose={onClose} onSave={() => onSave({ name, type, balance: Number(balance) || 0, bankName: bank, lastFourDigits: last4, color, icon: Icon })} canSave={!!name.trim()}>
      <div style={{ padding: "20px 16px" }}>
        {/* preview */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 28px" }}>
          <PR theme={theme} onClick={() => sIO(true)} scale={0.94}>
            <div style={{
              width: 80, height: 80, borderRadius: 22,
              background: color + "22",
              display: "flex", alignItems: "center", justifyContent: "center",
              color, position: "relative",
            }}>
              <Icon size={36} stroke={1.6}/>
              <div style={{ position: "absolute", bottom: -4, right: -4, width: 26, height: 26, borderRadius: 13, background: theme.colors.surface, border: HLN(theme.colors.borderStrong), display: "flex", alignItems: "center", justifyContent: "center", color: theme.colors.text }}>
                <I.edit size={11}/>
              </div>
            </div>
          </PR>
          <div style={{ marginTop: 12, fontSize: 11, color: theme.colors.textMuted }}>Tap to change icon</div>
        </div>

        <Field label="Account name" theme={theme}>
          <TextInput theme={theme} value={name} onChange={sN} placeholder="HDFC Savings"/>
        </Field>

        <Field label="Type" theme={theme}>
          <ChipRow theme={theme} options={types} value={type} onChange={sT}/>
        </Field>

        <Field label="Color" theme={theme}>
          <ColorPicker theme={theme} value={color} onChange={sC}/>
        </Field>

        <Field label="Opening balance" theme={theme}>
          <TextInput theme={theme} value={balance} onChange={sB} placeholder="0" mono prefix="₹"/>
        </Field>

        {(type === "savings" || type === "current" || type === "credit") && (
          <>
            <Field label="Bank" theme={theme}>
              <TextInput theme={theme} value={bank} onChange={sBn} placeholder="HDFC"/>
            </Field>
            <Field label="Last 4 digits" theme={theme} hint="Helps match SMS notifications.">
              <TextInput theme={theme} value={last4} onChange={v => sL(v.replace(/\D/g, "").slice(0, 4))} placeholder="••••" mono/>
            </Field>
          </>
        )}
      </div>
      <IconPicker theme={theme} visible={iconOpen} onClose={() => sIO(false)} onPick={sI} color={color}/>
    </FullScreen>
  );
}

// ────────── ADD ASSET
const ASSET_TYPES = [
  { value: "mutual_fund",   label: "Mutual fund",   color: "#34D399" },
  { value: "stocks",        label: "Stocks",        color: "#60A5FA" },
  { value: "fixed_deposit", label: "Fixed deposit", color: "#FBBF24" },
  { value: "gold",          label: "Gold",          color: "#F59E0B" },
  { value: "ppf",           label: "PPF",           color: "#A78BFA" },
  { value: "nps",           label: "NPS",           color: "#22D3EE" },
  { value: "epf",           label: "EPF",           color: "#10B981" },
  { value: "crypto",        label: "Crypto",        color: "#F472B6" },
  { value: "real_estate",   label: "Real estate",   color: "#EC4899" },
  { value: "other",         label: "Other",         color: "#94A3B8" },
];

function AddAssetScreen({ theme, onClose, onSave }) {
  const [type, sT] = usS("mutual_fund");
  const [name, sN] = usS("");
  const [invested, sIv] = usS("");
  const [current, sCv] = usS("");
  const [units, sU] = usS("");
  const [buyPrice, sBP] = usS("");
  const [currentPrice, sCP] = usS("");
  const [maturity, sM] = usS("");
  const [interestRate, sIR] = usS("");
  const [broker, sBr] = usS("");
  const [folio, sFo] = usS("");
  const [notes, sNt] = usS("");

  const meta = ASSET_TYPES.find(t => t.value === type);

  // type-specific layout
  const showUnits = ["mutual_fund","stocks","crypto","gold"].includes(type);
  const showFD    = ["fixed_deposit","ppf","nps","epf"].includes(type);
  const showFolio = ["mutual_fund"].includes(type);

  return (
    <FullScreen theme={theme} title="New asset" onClose={onClose} onSave={() => onSave({ type, name, invested: Number(invested) || 0, current: Number(current) || 0, units: Number(units) || undefined, buyPrice: Number(buyPrice) || undefined, currentPrice: Number(currentPrice) || undefined, maturityDate: maturity, interestRate: Number(interestRate) || undefined, broker, folioNumber: folio, notes })} canSave={!!name.trim() && !!invested}>
      <div style={{ padding: "20px 16px" }}>
        <Field label="Type" theme={theme}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {ASSET_TYPES.map(at => {
              const active = at.value === type;
              return (
                <PR key={at.value} theme={theme} onClick={() => sT(at.value)} scale={0.97}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "11px 12px", borderRadius: 10,
                    background: active ? theme.colors.surface3 : theme.colors.surface2,
                    border: HLN(active ? theme.colors.borderStrong : theme.colors.border),
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: at.color }}/>
                    <span style={{ fontSize: 12.5, color: active ? theme.colors.text : theme.colors.textSecondary, fontWeight: 500 }}>{at.label}</span>
                  </div>
                </PR>
              );
            })}
          </div>
        </Field>

        <Field label={`${meta.label} name`} theme={theme}>
          <TextInput theme={theme} value={name} onChange={sN} placeholder={
            type === "mutual_fund" ? "Parag Parikh Flexi Cap" :
            type === "stocks" ? "TCS" :
            type === "fixed_deposit" ? "HDFC FD #4521" :
            type === "crypto" ? "Bitcoin" :
            "Asset name"
          }/>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Invested" theme={theme}>
            <TextInput theme={theme} value={invested} onChange={sIv} placeholder="50000" mono prefix="₹"/>
          </Field>
          <Field label="Current value" theme={theme}>
            <TextInput theme={theme} value={current} onChange={sCv} placeholder="58400" mono prefix="₹"/>
          </Field>
        </div>

        {showUnits && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Field label="Units" theme={theme}>
              <TextInput theme={theme} value={units} onChange={sU} placeholder="120" mono/>
            </Field>
            <Field label="Buy price" theme={theme}>
              <TextInput theme={theme} value={buyPrice} onChange={sBP} placeholder="416" mono prefix="₹"/>
            </Field>
            <Field label="Current" theme={theme}>
              <TextInput theme={theme} value={currentPrice} onChange={sCP} placeholder="486" mono prefix="₹"/>
            </Field>
          </div>
        )}

        {showFD && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Interest rate" theme={theme}>
              <TextInput theme={theme} value={interestRate} onChange={sIR} placeholder="7.1" mono prefix="%"/>
            </Field>
            <Field label="Maturity date" theme={theme}>
              <TextInput theme={theme} value={maturity} onChange={sM} placeholder="2027-04-12" mono/>
            </Field>
          </div>
        )}

        {(type === "mutual_fund" || type === "stocks" || type === "crypto") && (
          <Field label="Broker / Platform" theme={theme}>
            <TextInput theme={theme} value={broker} onChange={sBr} placeholder="Zerodha"/>
          </Field>
        )}

        {showFolio && (
          <Field label="Folio number" theme={theme}>
            <TextInput theme={theme} value={folio} onChange={sFo} placeholder="1234567"/>
          </Field>
        )}

        <Field label="Notes" theme={theme}>
          <TextInput theme={theme} value={notes} onChange={sNt} placeholder="Optional"/>
        </Field>

        <div style={{ height: 40 }}/>
      </div>
    </FullScreen>
  );
}

// ────────── ADD CATEGORY
function AddCategoryScreen({ theme, onClose, onSave, presetType = "expense" }) {
  const [type, sT] = usS(presetType);
  const [name, sN] = usS("");
  const [color, sC] = usS("#34D399");
  const [iconName, sI] = usS("tag");
  const [iconOpen, sIO] = usS(false);
  const Icon = ALL_ICONS[iconName] || I.tag;

  return (
    <FullScreen theme={theme} title="New category" onClose={onClose} onSave={() => onSave({ name, type, color, iconName })} canSave={!!name.trim()}>
      <div style={{ padding: "20px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 28px" }}>
          <PR theme={theme} onClick={() => sIO(true)} scale={0.94}>
            <div style={{
              width: 76, height: 76, borderRadius: 22,
              background: color + "22",
              display: "flex", alignItems: "center", justifyContent: "center",
              color, position: "relative",
            }}>
              <Icon size={32} stroke={1.6}/>
              <div style={{ position: "absolute", bottom: -4, right: -4, width: 24, height: 24, borderRadius: 12, background: theme.colors.surface, border: HLN(theme.colors.borderStrong), display: "flex", alignItems: "center", justifyContent: "center", color: theme.colors.text }}>
                <I.edit size={11}/>
              </div>
            </div>
          </PR>
        </div>

        <Field label="Type" theme={theme}>
          <ChipRow theme={theme} options={[
            { value: "expense", label: "Expense", icon: I.arrowUp },
            { value: "income",  label: "Income",  icon: I.arrowDown },
          ]} value={type} onChange={sT}/>
        </Field>

        <Field label="Name" theme={theme}>
          <TextInput theme={theme} value={name} onChange={sN} placeholder="Subscriptions"/>
        </Field>

        <Field label="Color" theme={theme}>
          <ColorPicker theme={theme} value={color} onChange={sC}/>
        </Field>
      </div>
      <IconPicker theme={theme} visible={iconOpen} onClose={() => sIO(false)} onPick={sI} color={color}/>
    </FullScreen>
  );
}

// ────────── CATEGORIES LIST
function CategoriesScreen({ theme, onClose, customCats = [], onAdd, onDelete }) {
  const [tab, sTab] = usS("expense");
  const list = Object.entries(CATS).filter(([n, c]) => (c.type || "expense") === tab);
  const customList = customCats.filter(c => c.type === tab);
  const [adding, sAd] = usS(false);

  return (
    <FullScreen theme={theme} title="Categories" onClose={onClose}
      rightSlot={
        <PR theme={theme} onClick={() => sAd(true)}>
          <div style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: theme.colors.text, marginRight: 4 }}>
            <I.plus size={19}/>
          </div>
        </PR>
      }>
      <div style={{ padding: "16px 16px 0" }}>
        <ChipRow theme={theme} options={[
          { value: "expense", label: "Expense" },
          { value: "income",  label: "Income" },
        ]} value={tab} onChange={sTab}/>
      </div>

      <div style={{ padding: "20px 16px 8px" }}>
        <SLB theme={theme}>Default</SLB>
      </div>
      <div style={{ padding: "0 16px", display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
        {list.map(([n, c]) => (
          <div key={n} style={{
            display: "flex", alignItems: "center", gap: 10,
            background: theme.colors.surface, border: HLN(theme.colors.border),
            borderRadius: 12, padding: "10px 12px",
          }}>
            <IBX icon={c.icon} color={c.color} size={32}/>
            <span style={{ fontSize: 12.5, color: theme.colors.text, fontWeight: 500, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "20px 16px 8px" }}>
        <SLB theme={theme}>Custom</SLB>
      </div>
      <div style={{ padding: "0 16px 24px" }}>
        {customList.length === 0 && (
          <div style={{ background: theme.colors.surface, border: HLN(theme.colors.border), borderRadius: 12, padding: "24px 16px", textAlign: "center" }}>
            <div style={{ color: theme.colors.textMuted, fontSize: 12 }}>No custom {tab} categories yet.</div>
            <PR theme={theme} onClick={() => sAd(true)}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, padding: "8px 14px", background: theme.colors.surface2, border: HLN(theme.colors.borderStrong), borderRadius: 8, color: theme.colors.text, fontSize: 12, fontWeight: 600 }}>
                <I.plus size={13}/> Add category
              </div>
            </PR>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
          {customList.map(c => {
            const Icon = ALL_ICONS[c.iconName] || I.tag;
            return (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                background: theme.colors.surface, border: HLN(theme.colors.border),
                borderRadius: 12, padding: "10px 12px",
              }}>
                <IBX icon={Icon} color={c.color} size={32}/>
                <span style={{ fontSize: 12.5, color: theme.colors.text, fontWeight: 500, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                <PR theme={theme} onClick={() => onDelete(c.id)}>
                  <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", color: theme.colors.textMuted }}>
                    <I.close size={14}/>
                  </div>
                </PR>
              </div>
            );
          })}
        </div>
      </div>

      {adding && <AddCategoryScreen theme={theme} presetType={tab} onClose={() => sAd(false)} onSave={d => { onAdd(d); sAd(false); }}/>}
    </FullScreen>
  );
}

// ────────── PROFILE
function ProfileScreen({ theme, onClose }) {
  return (
    <FullScreen theme={theme} title="Profile" onClose={onClose}>
      <div style={{ padding: "24px 16px" }}>
        {/* avatar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0 28px" }}>
          <div style={{ width: 84, height: 84, borderRadius: 42, background: theme.colors.primary + "22", display: "flex", alignItems: "center", justifyContent: "center", border: HLN(theme.colors.borderStrong), color: theme.colors.primary, fontSize: 30, fontWeight: 600 }}>SK</div>
          <div style={{ marginTop: 14, fontSize: 17, fontWeight: 600, color: theme.colors.text }}>Sanjai Kumar</div>
          <div style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 2 }}>sanjai@growfin.ai</div>
        </div>

        {/* stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 22 }}>
          {[
            { l: "Records",     v: "1,065" },
            { l: "Days active", v: "284" },
            { l: "Categories",  v: "17" },
          ].map(s => (
            <div key={s.l} style={{ background: theme.colors.surface, border: HLN(theme.colors.border), borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 17, fontWeight: 600, color: theme.colors.text, letterSpacing: -0.4 }}>{s.v}</div>
              <div style={{ fontSize: 10.5, color: theme.colors.textMuted, marginTop: 3, letterSpacing: 0.3 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <SettingsList theme={theme} groups={[
          { title: "Account", items: [
            { label: "Edit profile",     icon: I.edit },
            { label: "Email & password", icon: I.lock },
            { label: "Backup & sync",    icon: I.cloud },
          ]},
          { title: "Privacy", items: [
            { label: "Lock with biometrics", icon: I.lock,   right: <Toggle theme={theme} on={true}/> },
            { label: "Hide balances",        icon: I.eyeOff, right: <Toggle theme={theme} on={false}/> },
          ]},
        ]}/>

        <div style={{ height: 16 }}/>
        <PR theme={theme} onClick={()=>{}}>
          <div style={{ width: "100%", padding: "12px 16px", background: "rgba(248,113,113,0.10)", borderRadius: 12, color: theme.colors.expenseAccent, fontWeight: 600, fontSize: 13, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <I.logout size={14}/> Sign out
          </div>
        </PR>
      </div>
    </FullScreen>
  );
}

function Toggle({ theme, on }) {
  return (
    <div style={{ width: 34, height: 20, borderRadius: 10, background: on ? theme.colors.primary : theme.colors.surface3, position: "relative", transition: "background 200ms" }}>
      <div style={{ position: "absolute", top: 2, left: on ? 16 : 2, width: 16, height: 16, borderRadius: 8, background: "#0A0A0A", transition: "left 200ms" }}/>
    </div>
  );
}

function SettingsList({ theme, groups }) {
  return (
    <>
      {groups.map((g, gi) => (
        <div key={gi} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: theme.colors.textMuted, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>{g.title}</div>
          <div style={{ background: theme.colors.surface, border: HLN(theme.colors.border), borderRadius: 12, overflow: "hidden" }}>
            {g.items.map((item, i) => {
              const Icon = item.icon;
              const isLast = i === g.items.length - 1;
              return (
                <PR key={i} theme={theme} onClick={item.onClick}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px",
                    borderBottom: isLast ? "none" : HLN(theme.colors.border),
                  }}>
                    {Icon && <div style={{ width: 28, height: 28, borderRadius: 8, background: theme.colors.surface2, display: "flex", alignItems: "center", justifyContent: "center", color: item.color || theme.colors.textSecondary }}><Icon size={14} stroke={1.7}/></div>}
                    <div style={{ flex: 1, fontSize: 13, color: item.color || theme.colors.text, fontWeight: 500 }}>{item.label}</div>
                    {item.right || <div style={{ color: theme.colors.textMuted }}><I.chevronRight size={15}/></div>}
                  </div>
                </PR>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

// ────────── SETTINGS
function SettingsScreen({ theme, onClose, onNavigate }) {
  return (
    <FullScreen theme={theme} title="Settings" onClose={onClose}>
      <div style={{ padding: "20px 16px" }}>
        <SettingsList theme={theme} groups={[
          { title: "Appearance", items: [
            { label: "Theme",     icon: I.moon, right: <span style={{ fontSize: 12, color: theme.colors.textMuted }}>Dark</span> },
            { label: "Accent",    icon: I.sparkles, right: <span style={{ width: 14, height: 14, borderRadius: 4, background: theme.colors.primary }}/> },
          ]},
          { title: "Data", items: [
            { label: "Categories",  icon: I.tag,    onClick: () => onNavigate("categories") },
            { label: "SMS inbox",   icon: I.bell,   onClick: () => onNavigate("sms") },
            { label: "Export CSV",  icon: I.cloud },
            { label: "Clear all transactions", icon: I.trash, color: theme.colors.expenseAccent },
          ]},
          { title: "About", items: [
            { label: "Version",     icon: I.leaf, right: <span style={{ fontSize: 12, color: theme.colors.textMuted, fontFamily: "var(--mono)" }}>2.0.1</span> },
            { label: "Help & feedback", icon: I.help },
          ]},
        ]}/>
      </div>
    </FullScreen>
  );
}

// ────────── SMS INBOX
const SMS_DRAFTS = [
  { id: "s1", status: "pending",   bank: "HDFC",   amount: 245,   type: "expense", merchant: "SWIGGY*BENGALURU",  last4: "4521", date: "2026-05-09T13:24:00", suggestedCategory: "Food", raw: "Sent Rs.245.00 from HDFC Bank A/c x4521 on 09-05-26 to VPA swiggy@hdfcbank Refno 41208745. Not you?" },
  { id: "s2", status: "pending",   bank: "ICICI",  amount: 1899,  type: "expense", merchant: "AMAZON IN",         last4: "8810", date: "2026-05-09T11:02:00", suggestedCategory: "Shopping", raw: "INR 1,899.00 spent on ICICI Bank Card XX8810 at AMAZON IN. Avl Lmt: INR 1,21,000." },
  { id: "s3", status: "pending",   bank: "HDFC",   amount: 4500,  type: "expense", merchant: "RENT",              last4: "4521", date: "2026-05-08T19:14:00", suggestedCategory: "Rent",     raw: "Sent Rs.4,500.00 from HDFC Bank A/c x4521 on 08-05-26 to RENT@upi Refno 41201234." },
  { id: "s4", status: "accepted",  bank: "HDFC",   amount: 45000, type: "income",  merchant: "ACME LTD SALARY",   last4: "4521", date: "2026-05-01T10:00:00", suggestedCategory: "Salary",   raw: "Credit Alert: Rs.45,000.00 has been credited to HDFC Bank A/c x4521 on 01-05-26 from ACME LTD SALARY." },
  { id: "s5", status: "dismissed", bank: "PAYTM",  amount: 50,    type: "expense", merchant: "PAYTM PROMO",       last4: "",     date: "2026-05-09T08:00:00", suggestedCategory: null,       raw: "Get Rs.50 cashback on your next Paytm recharge. T&C apply." },
  { id: "s6", status: "pending",   bank: "ICICI",  amount: 320,   type: "expense", merchant: "UBER INDIA",        last4: "8810", date: "2026-05-08T22:45:00", suggestedCategory: "Transport", raw: "INR 320.00 spent on ICICI Bank Card XX8810 at UBER INDIA." },
];

function SMSInboxScreen({ theme, onClose }) {
  const [drafts, sD] = usS(SMS_DRAFTS);
  const [tab, sTab] = usS("pending");
  const visible = drafts.filter(d => d.status === tab);
  const counts = {
    pending: drafts.filter(d => d.status === "pending").length,
    accepted: drafts.filter(d => d.status === "accepted").length,
    dismissed: drafts.filter(d => d.status === "dismissed").length,
  };

  const accept = id => sD(arr => arr.map(d => d.id === id ? { ...d, status: "accepted" } : d));
  const dismiss = id => sD(arr => arr.map(d => d.id === id ? { ...d, status: "dismissed" } : d));

  return (
    <FullScreen theme={theme} title="SMS inbox" onClose={onClose}>
      <div style={{ padding: "16px 16px 0" }}>
        <ChipRow theme={theme} options={[
          { value: "pending",   label: `Pending · ${counts.pending}` },
          { value: "accepted",  label: `Accepted · ${counts.accepted}` },
          { value: "dismissed", label: `Dismissed · ${counts.dismissed}` },
        ]} value={tab} onChange={sTab}/>
      </div>

      {tab === "pending" && (
        <div style={{ padding: "14px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: theme.colors.textMuted }}>{counts.pending} drafts auto-detected</div>
          <PR theme={theme} onClick={() => sD(arr => arr.map(d => d.status === "pending" ? { ...d, status: "accepted" } : d))}>
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.colors.primary, padding: "4px 8px" }}>Accept all</div>
          </PR>
        </div>
      )}

      <div style={{ padding: "0 16px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        {visible.length === 0 && (
          <div style={{ background: theme.colors.surface, border: HLN(theme.colors.border), borderRadius: 12, padding: "32px 16px", textAlign: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: theme.colors.surface3, display: "inline-flex", alignItems: "center", justifyContent: "center", color: theme.colors.textMuted, marginBottom: 10 }}>
              <I.bell size={18}/>
            </div>
            <div style={{ fontSize: 13, color: theme.colors.text, fontWeight: 500 }}>{tab === "pending" ? "Inbox is clear" : `No ${tab} messages`}</div>
            <div style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 4 }}>SMS from 35+ banks are auto-parsed.</div>
          </div>
        )}
        {visible.map(d => {
          const cat = CATS[d.suggestedCategory] || null;
          const acc = ACCOUNTS.find(a => a.lastFourDigits === d.last4);
          return (
            <div key={d.id} style={{
              background: theme.colors.surface, border: HLN(theme.colors.border),
              borderRadius: 12, padding: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 9.5, fontWeight: 600, padding: "2px 7px", background: theme.colors.surface3, borderRadius: 5, color: theme.colors.textSecondary, letterSpacing: 0.5 }}>SMS · {d.bank}</span>
                {d.last4 && <span style={{ fontSize: 10, color: theme.colors.textMuted, fontFamily: "var(--mono)" }}>•• {d.last4}</span>}
                <span style={{ flex: 1 }}/>
                <span style={{ fontSize: 10, color: theme.colors.textMuted, fontFamily: "var(--mono)" }}>{fmtTime(d.date)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {cat ? <IBX icon={cat.icon} color={cat.color} size={36}/> : <div style={{ width: 36, height: 36, borderRadius: 11, background: theme.colors.surface3, display: "flex", alignItems: "center", justifyContent: "center", color: theme.colors.textMuted }}><I.tag size={16}/></div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: theme.colors.text, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.merchant}</div>
                  <div style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 2 }}>
                    {d.suggestedCategory || "Uncategorized"}{acc ? ` · ${acc.name}` : ""}
                  </div>
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 600, color: d.type === "income" ? theme.colors.primary : theme.colors.text }}>
                  {d.type === "income" ? "+" : "−"}{fmt(d.amount, { abs: true })}
                </div>
              </div>
              <div style={{ marginTop: 10, padding: "8px 10px", background: theme.colors.surface2, borderRadius: 8, fontSize: 10.5, color: theme.colors.textMuted, lineHeight: 1.5, fontFamily: "var(--mono)" }}>
                {d.raw}
              </div>
              {d.status === "pending" && (
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <PR theme={theme} onClick={() => dismiss(d.id)} scale={0.97}>
                    <div style={{ padding: "8px 12px", background: theme.colors.surface2, border: HLN(theme.colors.border), borderRadius: 8, fontSize: 12, fontWeight: 600, color: theme.colors.textSecondary }}>Dismiss</div>
                  </PR>
                  <span style={{ flex: 1 }}/>
                  <PR theme={theme} onClick={() => accept(d.id)} scale={0.97}>
                    <div style={{ padding: "8px 14px", background: theme.colors.primary, borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#0A0A0A", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <I.check size={13}/> Accept
                    </div>
                  </PR>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </FullScreen>
  );
}

// ────────── CATEGORY DETAIL (drilldown from Analysis)
function CategoryDetailScreen({ theme, categoryName, txns, month, onClose, onTxnPress }) {
  const cat = CATS[categoryName] || { icon: I.tag, color: "#94A3B8" };
  const monthTxns = txns.filter(t => t.date.startsWith(month) && t.type === "expense");
  const list = monthTxns.filter(t => t.category === categoryName).sort((a,b) => b.date.localeCompare(a.date));
  const total = list.reduce((s, t) => s + t.amount, 0);
  const totalAll = monthTxns.reduce((s, t) => s + t.amount, 0);
  const pct = (total / (totalAll || 1)) * 100;

  // group
  const groups = usM(() => {
    const m = {};
    list.forEach(t => { const k = dateKey(t.date); (m[k] = m[k] || []).push(t); });
    return Object.entries(m);
  }, [list]);

  // dates spread
  const days = list.map(t => Number(t.date.slice(8, 10)));
  const minD = Math.min(...days, 99);
  const maxD = Math.max(...days, 0);
  const avg = total / (list.length || 1);

  const monthLabel = (() => {
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const [y, m] = month.split("-");
    return `${months[Number(m)-1]} ${y}`;
  })();

  return (
    <div style={{ position: "absolute", inset: 0, background: theme.colors.bg, animation: "slideInRight 260ms cubic-bezier(0.22, 1, 0.36, 1)", zIndex: 75, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 56, padding: "0 8px", display: "flex", alignItems: "center", borderBottom: HLN(theme.colors.border) }}>
        <PR theme={theme} onClick={onClose} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: theme.colors.text }}><I.chevronLeft size={20}/></div>
        </PR>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text, letterSpacing: -0.1 }}>{categoryName}</div>
          <div style={{ fontSize: 10.5, color: theme.colors.textMuted, marginTop: 1 }}>{monthLabel}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* hero */}
        <div style={{ padding: "20px 16px 12px" }}>
          <div style={{ background: theme.colors.surface, border: HLN(theme.colors.border), borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <IBX icon={cat.icon} color={cat.color} size={48} radius={14}/>
              <div style={{ flex: 1 }}>
                <SLB theme={theme}>Spent this month</SLB>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 26, fontWeight: 600, color: theme.colors.text, letterSpacing: -0.8 }}>−{fmt(total, { abs: true })}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: cat.color, fontWeight: 600 }}>{pct.toFixed(1)}%</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", marginTop: 18, padding: "12px 0 0", borderTop: HLN(theme.colors.border) }}>
              <div style={{ flex: 1 }}>
                <SLB theme={theme}>Records</SLB>
                <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: theme.colors.text, fontWeight: 600, marginTop: 4 }}>{list.length}</div>
              </div>
              <div style={{ width: 0.5, background: theme.colors.border, margin: "0 10px" }}/>
              <div style={{ flex: 1 }}>
                <SLB theme={theme}>Avg</SLB>
                <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: theme.colors.text, fontWeight: 600, marginTop: 4 }}>{fmt(avg, { compact: true, abs: true })}</div>
              </div>
              <div style={{ width: 0.5, background: theme.colors.border, margin: "0 10px" }}/>
              <div style={{ flex: 1 }}>
                <SLB theme={theme}>Range</SLB>
                <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: theme.colors.text, fontWeight: 600, marginTop: 4 }}>{list.length ? `${minD}–${maxD}` : "—"}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "12px 16px 8px" }}>
          <SLB theme={theme}>Transactions</SLB>
        </div>

        {groups.map(([k, items]) => (
          <div key={k}>
            {window.Records.DateGroupHeader && <window.Records.DateGroupHeader dateKey={k} txns={items} theme={theme}/>}
            {items.map(t => <window.Records.TransactionItem key={t.id} t={t} theme={theme} onClick={() => onTxnPress(t)}/>)}
          </div>
        ))}

        {list.length === 0 && (
          <div style={{ padding: "32px 16px", textAlign: "center", color: theme.colors.textMuted, fontSize: 12 }}>No records this month.</div>
        )}
        <div style={{ height: 24 }}/>
      </div>
    </div>
  );
}

// ────────── CALENDAR HEATMAP (alt flow chart for Analysis)
function CalendarHeatmap({ theme, txns, month }) {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const days = new Date(y, m, 0).getDate();
  const offset = first.getDay(); // 0 = Sun

  // build expense map
  const map = {};
  txns.forEach(t => {
    if (t.type === "expense" && t.date.startsWith(month)) {
      const d = Number(t.date.slice(8, 10));
      map[d] = (map[d] || 0) + t.amount;
    }
  });
  const max = Math.max(0.01, ...Object.values(map));

  // fill grid (start with empty cells for offset)
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push({ d, amt: map[d] || 0 });
  while (cells.length % 7 !== 0) cells.push(null);

  const monthName = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m-1];
  const totalExp = Object.values(map).reduce((s, v) => s + v, 0);
  const activeDays = Object.keys(map).length;
  const peakD = Object.entries(map).sort((a,b) => b[1]-a[1])[0];

  return (
    <div style={{ background: theme.colors.surface, border: HLN(theme.colors.border), borderRadius: 14, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ whiteSpace: "nowrap" }}><SLB theme={theme}>Calendar · {monthName} {y}</SLB></div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 600, color: theme.colors.text, marginTop: 4, letterSpacing: -0.6, whiteSpace: "nowrap" }}>
            {fmt(totalExp, { compact: true, abs: true })}
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 10, color: theme.colors.textMuted, whiteSpace: "nowrap", flexShrink: 0 }}>
          <div>active <span style={{ fontFamily: "var(--mono)", color: theme.colors.textSecondary }}>{activeDays}/{days}d</span></div>
          {peakD && <div style={{ marginTop: 2 }}>peak <span style={{ fontFamily: "var(--mono)", color: theme.colors.textSecondary }}>{monthName} {peakD[0]}</span></div>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginTop: 16 }}>
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} style={{ fontSize: 9.5, color: theme.colors.textFaint, textAlign: "center", fontWeight: 600, letterSpacing: 0.5 }}>{d}</div>
        ))}
        {cells.map((c, i) => {
          if (!c) return <div key={i}/>;
          const intensity = c.amt > 0 ? Math.min(1, c.amt / max) : 0;
          // 5-step ramp
          const steps = [0, 0.2, 0.45, 0.7, 0.9];
          const idx = intensity === 0 ? 0 : steps.findIndex(s => intensity <= s + 0.2);
          const opacities = ["00", "1F", "55", "99", "DD"];
          const bg = c.amt === 0 ? theme.colors.surface2 : theme.colors.primary + opacities[Math.min(4, idx + 1)];
          const isToday = c.d === 9 && month === "2026-05";
          return (
            <div key={i} style={{
              aspectRatio: "1 / 1",
              borderRadius: 6,
              background: bg,
              border: HLN(isToday ? theme.colors.text : "transparent"),
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--mono)",
              fontSize: 10,
              color: c.amt === 0 ? theme.colors.textFaint : (intensity > 0.5 ? "#0A0A0A" : theme.colors.text),
              fontWeight: c.amt > 0 ? 600 : 400,
              position: "relative",
            }}>
              <span style={{ position: "absolute", top: 3, left: 4, fontSize: 9, opacity: 0.7 }}>{c.d}</span>
              {c.amt > 0 && <span style={{ fontSize: 8.5, marginTop: 6 }}>{c.amt >= 1000 ? Math.round(c.amt/1000) + "k" : c.amt}</span>}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginTop: 14, fontSize: 10, color: theme.colors.textMuted }}>
        <span>less</span>
        {[0, 1, 2, 3, 4].map(i => (
          <span key={i} style={{ width: 12, height: 12, borderRadius: 3, background: i === 0 ? theme.colors.surface2 : theme.colors.primary + ["00","1F","55","99","DD"][i] }}/>
        ))}
        <span>more</span>
      </div>
    </div>
  );
}

window.Extras = {
  AddAccountScreen, AddAssetScreen, AddCategoryScreen, IconPicker, CategoriesScreen,
  ProfileScreen, SettingsScreen, SMSInboxScreen, CategoryDetailScreen, CalendarHeatmap,
};

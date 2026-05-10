// Shared UI primitives — Card, IconBox, Pill, Button, BottomSheet, etc.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// Hairline border helper
const HAIRLINE = (c) => `0.5px solid ${c}`;

function IconBox({ icon: IconComp, color, size = 36, radius, opacity = 0.14 }) {
  const r = radius != null ? radius : Math.round(size * 0.32);
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      background: color + Math.round(opacity * 255).toString(16).padStart(2, "0"),
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <div style={{ color }}>
        {IconComp ? <IconComp size={Math.round(size * 0.5)} stroke={1.7} /> : null}
      </div>
    </div>
  );
}

function Card({ children, style, padded = true, theme, onClick, hover }) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: theme.colors.surface,
        border: HAIRLINE(h && hover ? theme.colors.borderStrong : theme.colors.border),
        borderRadius: 14,
        padding: padded ? 16 : 0,
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 120ms ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Pressable({ children, onClick, style, theme, scale = 0.97 }) {
  const [p, setP] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseDown={() => setP(true)}
      onMouseUp={() => setP(false)}
      onMouseLeave={() => setP(false)}
      onTouchStart={() => setP(true)}
      onTouchEnd={() => setP(false)}
      style={{
        cursor: "pointer",
        transform: `scale(${p ? scale : 1})`,
        transition: "transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children, theme, style }) {
  return (
    <div style={{
      fontSize: 10.5, fontWeight: 600, color: theme.colors.textMuted,
      letterSpacing: 0.8, textTransform: "uppercase",
      ...style,
    }}>{children}</div>
  );
}

// Bottom sheet (in-frame). Uses absolute positioning relative to a phone frame.
function BottomSheet({ visible, onClose, theme, children, height = "auto", maxHeight = "85%", padded = true }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
          opacity: visible ? 1 : 0,
          transition: "opacity 200ms ease",
          pointerEvents: visible ? "auto" : "none",
          zIndex: 50,
        }}
      />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        background: theme.colors.surface,
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        border: HAIRLINE(theme.colors.border),
        borderBottom: "none",
        height, maxHeight,
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
        zIndex: 51,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        <div style={{ padding: "10px 0 6px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: theme.colors.borderStrong }}/>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: padded ? "8px 16px 24px" : 0 }}>
          {children}
        </div>
      </div>
    </>
  );
}

// Tiny ring/donut for charts
function Donut({ slices, size = 180, thickness = 22, theme, centerLabel, centerSub }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let off = 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={theme.colors.surface3} strokeWidth={thickness}/>
        {slices.map((s, i) => {
          const len = (s.value / total) * c;
          const dash = `${len} ${c - len}`;
          const ele = (
            <circle
              key={i}
              cx={size/2} cy={size/2} r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeDashoffset={-off}
              strokeLinecap="butt"
            />
          );
          off += len;
          return ele;
        })}
      </svg>
      {centerLabel != null && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", textAlign: "center", padding: 12,
        }}>
          <div style={{ fontSize: 11, color: theme.colors.textMuted, letterSpacing: 0.6, textTransform: "uppercase", fontWeight: 600 }}>{centerSub}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 600, color: theme.colors.text, marginTop: 4 }}>{centerLabel}</div>
        </div>
      )}
    </div>
  );
}

// Bar chart for monthly flow
function FlowChart({ data, theme, height = 140 }) {
  const max = Math.max(1, ...data.map(d => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "stretch", gap: 4 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
            <div style={{
              width: "100%",
              height: `${Math.max(2, (d.value / max) * 100)}%`,
              background: d.value > 0 ? theme.colors.primary + "55" : theme.colors.borderStrong,
              borderTop: d.value > 0 ? `2px solid ${theme.colors.primary}` : "none",
              borderRadius: 2,
            }}/>
          </div>
          {i % 4 === 0 && (
            <div style={{ fontSize: 9, color: theme.colors.textMuted, textAlign: "center", fontFamily: "var(--mono)" }}>{d.label}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// Status bar (Android-ish)
function StatusBar({ theme }) {
  return (
    <div style={{
      height: 28, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
      fontSize: 11, fontWeight: 600, color: theme.colors.text, fontFamily: "var(--mono)", letterSpacing: 0.2,
    }}>
      <span>9:41</span>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor"><path d="M0 9h2v1H0zM3 7h2v3H3zM6 4h2v6H6zM9 1h2v9H9zM12 0h1v10h-1z"/></svg>
        <svg width="14" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="0.5" y="2" width="11" height="6" rx="1.4"/><rect x="2" y="3.4" width="8" height="3.2" rx="0.5" fill="currentColor"/><rect x="12.4" y="3.6" width="1.4" height="2.8" rx="0.4" fill="currentColor"/></svg>
      </div>
    </div>
  );
}

// AppHeader
function AppHeader({ title, theme, onMenuPress, onSearchPress, rightSlot, leftSlot }) {
  return (
    <div style={{
      height: 52, padding: "0 14px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      borderBottom: HAIRLINE(theme.colors.border),
      background: theme.colors.bg,
    }}>
      {leftSlot != null ? leftSlot : (
        <Pressable theme={theme} onClick={onMenuPress} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", marginLeft: -6 }}>
          <div style={{ color: theme.colors.text }}><I.menu size={20}/></div>
        </Pressable>
      )}
      <div style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: 600, color: theme.colors.text, letterSpacing: -0.1 }}>{title}</div>
      {rightSlot != null ? rightSlot : (
        <Pressable theme={theme} onClick={onSearchPress} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", marginRight: -6 }}>
          <div style={{ color: theme.colors.text }}><I.search size={19}/></div>
        </Pressable>
      )}
    </div>
  );
}

// Tab bar
function TabBar({ active, onChange, theme }) {
  const tabs = [
    { key: "records",  label: "Records",  icon: I.receipt },
    { key: "analysis", label: "Analysis", icon: I.chart },
    { key: "budgets",  label: "Budgets",  icon: I.wallet },
    { key: "accounts", label: "Accounts", icon: I.card },
    { key: "assets",   label: "Assets",   icon: I.trending },
  ];
  return (
    <div style={{
      height: 64, display: "flex",
      borderTop: HAIRLINE(theme.colors.border),
      background: theme.colors.bg,
      position: "relative",
    }}>
      {tabs.map(t => {
        const isActive = active === t.key;
        return (
          <Pressable key={t.key} theme={theme} onClick={() => onChange(t.key)} scale={0.94}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, position: "relative" }}>
            {isActive && (
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 24, height: 2, background: theme.colors.primary, borderRadius: 0,
              }}/>
            )}
            <div style={{ color: isActive ? theme.colors.text : theme.colors.textMuted }}>
              <t.icon size={20} stroke={isActive ? 1.9 : 1.6}/>
            </div>
            <div style={{
              fontSize: 10, color: isActive ? theme.colors.text : theme.colors.textMuted,
              fontWeight: isActive ? 600 : 500, letterSpacing: 0.1,
            }}>{t.label}</div>
          </Pressable>
        );
      })}
    </div>
  );
}

// Month navigator
function MonthNav({ month, onChange, theme }) {
  const [y, m] = month.split("-").map(Number);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const step = (delta) => {
    let nm = m + delta, ny = y;
    if (nm > 12) { nm = 1; ny++; }
    if (nm < 1) { nm = 12; ny--; }
    onChange(`${ny}-${String(nm).padStart(2, "0")}`);
  };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px" }}>
      <Pressable theme={theme} onClick={() => step(-1)} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: theme.colors.textSecondary }}><I.chevronLeft size={18}/></div>
      </Pressable>
      <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text, letterSpacing: -0.1 }}>{months[m-1]} {y}</div>
      <Pressable theme={theme} onClick={() => step(1)} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: theme.colors.textSecondary }}><I.chevronRight size={18}/></div>
      </Pressable>
    </div>
  );
}

// Summary bar (3 cols)
function SummaryBar({ income, expense, theme }) {
  const net = income - expense;
  const cell = (label, value, color) => (
    <div style={{ flex: 1, padding: "12px 8px" }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: theme.colors.textMuted, letterSpacing: 0.8, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 600, color, marginTop: 4, letterSpacing: -0.2 }}>{value}</div>
    </div>
  );
  return (
    <div style={{ display: "flex", padding: "0 8px" }}>
      {cell("Income", fmt(income, { compact: true, abs: true }), theme.colors.primary)}
      <div style={{ width: 0.5, background: theme.colors.border, margin: "12px 0" }}/>
      {cell("Expense", fmt(expense, { compact: true, abs: true }), theme.colors.text)}
      <div style={{ width: 0.5, background: theme.colors.border, margin: "12px 0" }}/>
      {cell("Net", (net >= 0 ? "+" : "−") + fmt(Math.abs(net), { compact: true, abs: true }).slice(1), net >= 0 ? theme.colors.primary : theme.colors.negative)}
    </div>
  );
}

// FAB
function FAB({ onClick, theme }) {
  return (
    <Pressable theme={theme} onClick={onClick} scale={0.92}
      style={{
        position: "absolute", right: 18, bottom: 80,
        width: 52, height: 52, borderRadius: 14,
        background: theme.colors.primary,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 6px 20px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.06) inset",
        zIndex: 30,
      }}>
      <div style={{ color: "#0A0A0A" }}><I.plus size={22} stroke={2.4}/></div>
    </Pressable>
  );
}

window.UI = {
  HAIRLINE, IconBox, Card, Pressable, SectionLabel, BottomSheet, Donut, FlowChart,
  StatusBar, AppHeader, TabBar, MonthNav, SummaryBar, FAB,
};

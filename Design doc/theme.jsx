// Theme tokens + helpers — Notion/Vercel-flavored dark.

const ACCENTS = {
  emerald: { primary: "#34D399", primaryDim: "#10B981", primaryMuted: "#0F2A22", name: "Emerald" },
  amber:   { primary: "#FBBF24", primaryDim: "#D97706", primaryMuted: "#2A1F0A", name: "Amber" },
  iris:    { primary: "#A78BFA", primaryDim: "#7C5CF7", primaryMuted: "#1F1A33", name: "Iris" },
};

function buildTheme(accentKey = "emerald") {
  const a = ACCENTS[accentKey] || ACCENTS.emerald;
  return {
    colors: {
      bg:           "#0A0A0A",
      surface:      "#101010",
      surface2:     "#161616",
      surface3:     "#1C1C1C",
      border:       "#1F1F1F",
      borderStrong: "#2A2A2A",
      text:         "#EDEDED",
      textSecondary:"#A1A1A1",
      textMuted:    "#5A5A5A",
      textFaint:    "#3A3A3A",
      primary:      a.primary,
      primaryDim:   a.primaryDim,
      primaryMuted: a.primaryMuted,
      income:       a.primary,
      expense:      "#EDEDED",   // neutral; sign carries meaning
      expenseAccent:"#F87171",   // used sparingly (deletes, hero badge)
      transfer:     "#60A5FA",
      negative:     "#F87171",
      overlay:      "rgba(0,0,0,0.72)",
    },
    accentKey,
    accentName: a.name,
  };
}

// Currency
function fmt(n, opts = {}) {
  const { compact, showSign, abs } = opts;
  const neg = n < 0;
  let v = Math.abs(n);
  let str;
  if (compact && v >= 10000000) str = "₹" + (v/10000000).toFixed(2) + "Cr";
  else if (compact && v >= 100000) str = "₹" + (v/100000).toFixed(2) + "L";
  else if (compact && v >= 1000) str = "₹" + (v/1000).toFixed(1) + "k";
  else {
    // Indian grouping
    const i = Math.floor(v);
    const dec = v % 1 ? "." + (v.toFixed(2).split(".")[1]) : "";
    const s = String(i);
    let out;
    if (s.length <= 3) out = s;
    else {
      const last3 = s.slice(-3);
      const rest = s.slice(0, -3);
      out = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
    }
    str = "₹" + out + dec;
  }
  if (abs) return str;
  if (showSign) return (neg ? "−" : "+") + str;
  return neg ? "−" + str : str;
}

function fmtTime(iso) {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}

function dateKey(iso) { return iso.slice(0, 10); }

function fmtDateGroupHeader(key) {
  const d = new Date(key + "T00:00:00");
  const today = new Date(); today.setHours(0,0,0,0);
  const yest = new Date(today); yest.setDate(today.getDate() - 1);
  const dt = new Date(d); dt.setHours(0,0,0,0);
  if (dt.getTime() === today.getTime()) return "Today";
  if (dt.getTime() === yest.getTime()) return "Yesterday";
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getDate()} · ${days[d.getDay()]}`;
}

window.ACCENTS = ACCENTS;
window.buildTheme = buildTheme;
window.fmt = fmt;
window.fmtTime = fmtTime;
window.dateKey = dateKey;
window.fmtDateGroupHeader = fmtDateGroupHeader;

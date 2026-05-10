// Lucide-style monoline icons. Stroke-based, currentColor.
// All icons are 24x24 viewBox, 1.6 stroke. Render at any size.

const Icon = ({ d, size = 20, stroke = 1.6, fill, style, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill || "none"}
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    {...rest}
  >
    {d}
  </svg>
);

const I = {
  // Nav / chrome
  menu: (p) => <Icon {...p} d={<><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>}/>,
  search: (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>}/>,
  close: (p) => <Icon {...p} d={<><path d="M6 6l12 12"/><path d="M18 6 6 18"/></>}/>,
  chevronLeft: (p) => <Icon {...p} d={<path d="m15 18-6-6 6-6"/>}/>,
  chevronRight: (p) => <Icon {...p} d={<path d="m9 18 6-6-6-6"/>}/>,
  chevronDown: (p) => <Icon {...p} d={<path d="m6 9 6 6 6-6"/>}/>,
  chevronUp: (p) => <Icon {...p} d={<path d="m6 15 6-6 6 6"/>}/>,
  plus: (p) => <Icon {...p} d={<><path d="M12 5v14"/><path d="M5 12h14"/></>}/>,
  minus: (p) => <Icon {...p} d={<path d="M5 12h14"/>}/>,
  check: (p) => <Icon {...p} d={<path d="M20 6 9 17l-5-5"/>}/>,
  more: (p) => <Icon {...p} d={<><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>}/>,
  filter: (p) => <Icon {...p} d={<path d="M4 6h16M7 12h10M10 18h4"/>}/>,
  edit: (p) => <Icon {...p} d={<><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></>}/>,
  trash: (p) => <Icon {...p} d={<><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>}/>,
  arrowRight: (p) => <Icon {...p} d={<><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>}/>,
  arrowDown: (p) => <Icon {...p} d={<><path d="M12 5v14"/><path d="m5 12 7 7 7-7"/></>}/>,
  arrowUp: (p) => <Icon {...p} d={<><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></>}/>,
  arrowLeftRight: (p) => <Icon {...p} d={<><path d="M3 7h14"/><path d="m13 3 4 4-4 4"/><path d="M21 17H7"/><path d="m11 13-4 4 4 4"/></>}/>,
  // Tabs
  receipt: (p) => <Icon {...p} d={<><path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 2"/><path d="M8 7h8M8 11h8M8 15h5"/></>}/>,
  chart: (p) => <Icon {...p} d={<><path d="M3 3v18h18"/><path d="M8 13v5"/><path d="M13 8v10"/><path d="M18 11v7"/></>}/>,
  wallet: (p) => <Icon {...p} d={<><path d="M19 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/><path d="M16 14a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" fill="currentColor"/><path d="M5 7V6a2 2 0 0 1 2-2h11"/></>}/>,
  card: (p) => <Icon {...p} d={<><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/><path d="M6 15h4"/></>}/>,
  trending: (p) => <Icon {...p} d={<><path d="M3 17 9 11l4 4 8-8"/><path d="M14 7h7v7"/></>}/>,
  // Categories
  utensils: (p) => <Icon {...p} d={<><path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2"/><path d="M5 11v11"/><path d="M19 2v20"/><path d="M19 14c-1.7 0-3-1.3-3-3V5c0-1.7 1.3-3 3-3"/></>}/>,
  cart: (p) => <Icon {...p} d={<><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l3 13h12l2-9H6"/></>}/>,
  car: (p) => <Icon {...p} d={<><path d="M5 17h14M5 17a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4M5 13l1.5-5a2 2 0 0 1 2-1.5h7a2 2 0 0 1 2 1.5L19 13"/><circle cx="7.5" cy="17" r="1.5" fill="currentColor"/><circle cx="16.5" cy="17" r="1.5" fill="currentColor"/></>}/>,
  bag: (p) => <Icon {...p} d={<><path d="M5 7h14l-1 14H6L5 7Z"/><path d="M9 7a3 3 0 1 1 6 0"/></>}/>,
  receiptShort: (p) => <Icon {...p} d={<><path d="M5 3h14v18l-2-1.5L15 21l-2-1.5L11 21l-2-1.5L7 21l-2-1.5V3Z"/><path d="M8 8h8M8 12h6"/></>}/>,
  pill: (p) => <Icon {...p} d={<><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)"/><path d="M8.5 8.5l7 7"/></>}/>,
  film: (p) => <Icon {...p} d={<><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h4M17 9h4M3 15h4M17 15h4M11 4v16"/></>}/>,
  book: (p) => <Icon {...p} d={<><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2V5Z"/><path d="M19 17H6a2 2 0 0 0-2 2"/></>}/>,
  plane: (p) => <Icon {...p} d={<path d="M21 16v-2L13 9V4a1.5 1.5 0 0 0-3 0v5l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1L15 22v-1.5L13 19v-5.5L21 16Z"/>}/>,
  home: (p) => <Icon {...p} d={<><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></>}/>,
  package: (p) => <Icon {...p} d={<><path d="m12 3 9 5v8l-9 5-9-5V8l9-5Z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/></>}/>,
  briefcase: (p) => <Icon {...p} d={<><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></>}/>,
  cash: (p) => <Icon {...p} d={<><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 10v4M18 10v4"/></>}/>,
  gift: (p) => <Icon {...p} d={<><path d="M3 8h18v4H3z"/><path d="M5 12v9h14v-9"/><path d="M12 8v13"/><path d="M12 8a3 3 0 1 0-3-3 5 5 0 0 0 3 3"/><path d="M12 8a3 3 0 1 1 3-3 5 5 0 0 1-3 3"/></>}/>,
  bank: (p) => <Icon {...p} d={<><path d="M3 9 12 4l9 5"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8"/><path d="M3 21h18"/></>}/>,
  // Accounts
  piggy: (p) => <Icon {...p} d={<><path d="M2 12c0-4 4-7 9-7s9 3 9 7-4 7-9 7c-1 0-2-.1-3-.3L4 21v-4l1-1.5A6.5 6.5 0 0 1 2 12Z"/><circle cx="15" cy="11" r="1" fill="currentColor"/></>}/>,
  // Misc
  user: (p) => <Icon {...p} d={<><circle cx="12" cy="8" r="4"/><path d="M3 21a9 9 0 0 1 18 0"/></>}/>,
  settings: (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.36.18.65.46.85.79"/></>}/>,
  bell: (p) => <Icon {...p} d={<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 0 0 4 0"/></>}/>,
  message: (p) => <Icon {...p} d={<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>}/>,
  moon: (p) => <Icon {...p} d={<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>}/>,
  logout: (p) => <Icon {...p} d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></>}/>,
  tag: (p) => <Icon {...p} d={<><path d="M20 12 12 20l-9-9V3h8l9 9Z"/><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/></>}/>,
  leaf: (p) => <Icon {...p} d={<><path d="M11 20a8 8 0 0 1 0-16h9v9a8 8 0 0 1-9 7Z"/><path d="M2 22 11 13"/></>}/>,
  shield: (p) => <Icon {...p} d={<path d="M12 3 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6Z"/>}/>,
  // assets
  bitcoin: (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M9 8h5a2.5 2.5 0 0 1 0 5H9V8ZM9 13h6a2.5 2.5 0 0 1 0 5H9v-5ZM11 6v2M11 18v2M14 6v2M14 18v2"/></>}/>,
  building: (p) => <Icon {...p} d={<><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/></>}/>,
  // calculator
  backspace: (p) => <Icon {...p} d={<><path d="M22 5H9L3 12l6 7h13a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z"/><path d="m12 9 6 6M18 9l-6 6"/></>}/>,
};

window.I = I;

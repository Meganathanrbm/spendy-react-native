// Records screen, TransactionItem, TransactionDetailModal, DrawerMenu, CategoryPicker, AccountPicker.

const { Card, Pressable, IconBox, BottomSheet, AppHeader, MonthNav, SummaryBar, FAB, TabBar, SectionLabel, HAIRLINE } = UI;

function TransactionItem({ t, theme, onClick }) {
  const cat = CATS[t.category] || CATS.Other;
  const acct = ACCOUNTS.find(a => a.id === t.accountId);
  const isTransfer = t.type === "transfer";
  const fromAcct = isTransfer ? ACCOUNTS.find(a => a.id === t.fromAccountId) : null;
  const toAcct   = isTransfer ? ACCOUNTS.find(a => a.id === t.toAccountId)   : null;

  let amountColor = theme.colors.text;
  let prefix = "";
  if (t.type === "income")   { amountColor = theme.colors.primary; prefix = "+"; }
  if (t.type === "expense")  { amountColor = theme.colors.text;    prefix = "−"; }
  if (t.type === "transfer") { amountColor = theme.colors.transfer; prefix = "";  }

  const iconColor = isTransfer ? theme.colors.transfer : cat.color;
  const IconC = isTransfer ? I.arrowLeftRight : cat.icon;

  return (
    <Pressable theme={theme} onClick={onClick} scale={0.985}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px",
        borderBottom: HAIRLINE(theme.colors.border),
      }}>
      <IconBox icon={IconC} color={iconColor} size={36}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: theme.colors.text, letterSpacing: -0.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {isTransfer ? `${fromAcct?.name} → ${toAcct?.name}` : t.title}
        </div>
        <div style={{ fontSize: 11.5, color: theme.colors.textMuted, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
          <span>{isTransfer ? "Transfer" : t.category}</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span style={{ fontFamily: "var(--mono)" }}>{fmtTime(t.date)}</span>
          {t.isAutoDetected && (<>
            <span style={{ opacity: 0.5 }}>·</span>
            <span style={{ background: theme.colors.surface3, color: theme.colors.textSecondary, padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 500, letterSpacing: 0.2 }}>SMS</span>
          </>)}
        </div>
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 600, color: amountColor, letterSpacing: -0.2, fontVariantNumeric: "tabular-nums" }}>
        {prefix}{fmt(t.amount, { abs: true })}
      </div>
    </Pressable>
  );
}

function DateGroupHeader({ dateKey: k, txns, theme }) {
  const inc = txns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const exp = txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 16px",
      background: theme.colors.bg,
    }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: theme.colors.textSecondary, letterSpacing: 0.2 }}>
        {fmtDateGroupHeader(k)}
      </div>
      <div style={{ display: "flex", gap: 10, fontSize: 11, fontFamily: "var(--mono)", fontVariantNumeric: "tabular-nums" }}>
        {inc > 0 && <span style={{ color: theme.colors.primary }}>+{fmt(inc, { compact: true, abs: true })}</span>}
        {exp > 0 && <span style={{ color: theme.colors.textMuted }}>−{fmt(exp, { compact: true, abs: true })}</span>}
      </div>
    </div>
  );
}

function RecordsScreen({ theme, txns, month, setMonth, onTxnPress, onAddPress, onMenuPress, accounts, primaryAccount }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const monthTxns = txns.filter(t => t.date.startsWith(month));
  const filtered = search
    ? monthTxns.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))
    : monthTxns;

  const inc = monthTxns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const exp = monthTxns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  // group by date desc
  const groups = useMemo(() => {
    const map = {};
    [...filtered].sort((a, b) => b.date.localeCompare(a.date)).forEach(t => {
      const k = dateKey(t.date);
      (map[k] = map[k] || []).push(t);
    });
    return Object.entries(map);
  }, [filtered]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <AppHeader theme={theme} title="Records" onMenuPress={onMenuPress}
        rightSlot={
          <Pressable theme={theme} onClick={() => setSearchOpen(s => !s)} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", marginRight: -6 }}>
            <div style={{ color: theme.colors.text }}>
              {searchOpen ? <I.close size={19}/> : <I.search size={19}/>}
            </div>
          </Pressable>
        }
      />

      {searchOpen && (
        <div style={{ padding: "10px 16px", borderBottom: HAIRLINE(theme.colors.border) }}>
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions"
            style={{
              width: "100%", background: theme.colors.surface2, border: HAIRLINE(theme.colors.border),
              borderRadius: 10, padding: "10px 12px", fontSize: 13, color: theme.colors.text,
              outline: "none",
            }}
          />
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto" }}>
        {primaryAccount && (
          <div style={{ padding: "14px 16px 4px" }}>
            <div style={{
              background: theme.colors.surface,
              border: HAIRLINE(theme.colors.border),
              borderRadius: 14,
              padding: "16px 18px",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <IconBox icon={primaryAccount.icon} color={primaryAccount.color} size={40} radius={12}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: theme.colors.textMuted, letterSpacing: 0.8, textTransform: "uppercase", whiteSpace: "nowrap" }}>Primary</span>
                  <span style={{ width: 4, height: 4, borderRadius: 2, background: theme.colors.primary }}/>
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 600, color: theme.colors.text, letterSpacing: -0.6, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                  {fmt(primaryAccount.balance, { abs: true })}
                </div>
              </div>
              <div style={{ textAlign: "right", minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: theme.colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 110 }}>{primaryAccount.name}</div>
                <div style={{ fontSize: 10.5, color: theme.colors.textMuted, marginTop: 2, fontFamily: "var(--mono)" }}>{primaryAccount.lastFourDigits ? `•• ${primaryAccount.lastFourDigits}` : primaryAccount.type}</div>
              </div>
            </div>
          </div>
        )}
        <MonthNav theme={theme} month={month} onChange={setMonth}/>
        <SummaryBar theme={theme} income={inc} expense={exp}/>

        <div style={{ height: 12 }}/>

        {groups.length === 0 && (
          <div style={{ padding: "60px 24px", textAlign: "center", color: theme.colors.textMuted, fontSize: 13 }}>
            No transactions this month.
          </div>
        )}

        {groups.map(([k, list]) => (
          <div key={k}>
            <DateGroupHeader dateKey={k} txns={list} theme={theme}/>
            {list.map(t => (
              <TransactionItem key={t.id} t={t} theme={theme} onClick={() => onTxnPress(t)}/>
            ))}
          </div>
        ))}

        <div style={{ height: 80 }}/>
      </div>

      <FAB theme={theme} onClick={onAddPress}/>
    </div>
  );
}

function TransactionDetailModal({ t, visible, onClose, theme, onEdit, onDelete }) {
  if (!t) return null;
  const cat = CATS[t.category] || CATS.Other;
  const acct = ACCOUNTS.find(a => a.id === t.accountId);
  const fromAcct = ACCOUNTS.find(a => a.id === t.fromAccountId);
  const toAcct = ACCOUNTS.find(a => a.id === t.toAccountId);

  let badgeColor, prefix, badgeLabel, IconC, iconColor;
  if (t.type === "income")   { badgeColor = theme.colors.primary;     prefix = "+"; badgeLabel = "INCOME";   IconC = cat.icon; iconColor = theme.colors.primary; }
  if (t.type === "expense")  { badgeColor = theme.colors.expenseAccent; prefix = "−"; badgeLabel = "EXPENSE"; IconC = cat.icon; iconColor = cat.color; }
  if (t.type === "transfer") { badgeColor = theme.colors.transfer;    prefix = "";  badgeLabel = "TRANSFER"; IconC = I.arrowLeftRight; iconColor = theme.colors.transfer; }

  const Row = ({ label, children }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: HAIRLINE(theme.colors.border) }}>
      <span style={{ fontSize: 12, color: theme.colors.textMuted, letterSpacing: 0.3 }}>{label}</span>
      <span style={{ fontSize: 13, color: theme.colors.text, fontWeight: 500 }}>{children}</span>
    </div>
  );

  const date = new Date(t.date);
  const dateStr = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <BottomSheet visible={visible} onClose={onClose} theme={theme} maxHeight="82%">
      {/* badge + close */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0 16px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "4px 10px", borderRadius: 999,
          background: badgeColor + "1F",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: badgeColor }}/>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: badgeColor, letterSpacing: 0.8 }}>{badgeLabel}</span>
        </div>
        <Pressable theme={theme} onClick={onClose} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: theme.colors.textSecondary }}><I.close size={18}/></div>
        </Pressable>
      </div>

      {/* hero */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 24px" }}>
        <IconBox icon={IconC} color={iconColor} size={56} radius={18} opacity={0.16}/>
        <div style={{ fontFamily: "var(--mono)", fontSize: 32, fontWeight: 600, color: theme.colors.text, marginTop: 14, letterSpacing: -1 }}>
          {prefix}{fmt(t.amount, { abs: true })}
        </div>
        <div style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 }}>
          {t.type === "transfer" ? "Internal transfer" : t.title}
        </div>
      </div>

      {/* details */}
      <div style={{ background: theme.colors.surface2, borderRadius: 12, padding: "0 14px", border: HAIRLINE(theme.colors.border) }}>
        {t.type !== "transfer" && <Row label="Category">{t.category}</Row>}
        {t.type === "transfer" ? (<>
          <Row label="From">{fromAcct?.name}</Row>
          <Row label="To">{toAcct?.name}</Row>
        </>) : (
          <Row label="Account">{acct?.name}</Row>
        )}
        <Row label="Date">{dateStr}</Row>
        <Row label="Time">{fmtTime(t.date)}</Row>
        {t.notes && <Row label="Notes"><span style={{ maxWidth: 180, textAlign: "right", fontWeight: 400 }}>{t.notes}</span></Row>}
        {t.isAutoDetected && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
            <span style={{ fontSize: 12, color: theme.colors.textMuted, letterSpacing: 0.3 }}>Source</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textSecondary, background: theme.colors.surface3, padding: "3px 8px", borderRadius: 6, letterSpacing: 0.4 }}>SMS · {t.smsSource}</span>
          </div>
        )}
      </div>

      {/* actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <Pressable theme={theme} onClick={onEdit} style={{ flex: 1 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "12px 16px", borderRadius: 12,
            border: HAIRLINE(theme.colors.borderStrong),
            background: theme.colors.surface2,
            color: theme.colors.text, fontSize: 13, fontWeight: 600,
          }}>
            <I.edit size={15}/> Edit
          </div>
        </Pressable>
        <Pressable theme={theme} onClick={onDelete} style={{ flex: 1 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "12px 16px", borderRadius: 12,
            background: "rgba(248,113,113,0.10)", color: theme.colors.expenseAccent,
            fontSize: 13, fontWeight: 600,
          }}>
            <I.trash size={15}/> Delete
          </div>
        </Pressable>
      </div>
    </BottomSheet>
  );
}

function CategoryPicker({ visible, onClose, theme, type, onSelect, selected }) {
  const list = type === "income" ? INCOME_CATS : EXPENSE_CATS;
  return (
    <BottomSheet visible={visible} onClose={onClose} theme={theme} maxHeight="78%">
      <div style={{ padding: "4px 4px 14px" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: theme.colors.text, letterSpacing: -0.2 }}>Select category</div>
        <div style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 2 }}>{type === "income" ? "Income source" : "Where did the money go?"}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, paddingBottom: 16 }}>
        {list.map(name => {
          const c = CATS[name];
          const isSel = selected === name;
          return (
            <Pressable key={name} theme={theme} onClick={() => onSelect(name)} scale={0.94}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "12px 4px", borderRadius: 12,
                background: isSel ? c.color + "18" : "transparent",
                border: HAIRLINE(isSel ? c.color + "55" : theme.colors.border),
              }}>
                <IconBox icon={c.icon} color={c.color} size={40} radius={14} opacity={0.16}/>
                <div style={{ fontSize: 11, color: theme.colors.text, fontWeight: 500, textAlign: "center" }}>{name}</div>
              </div>
            </Pressable>
          );
        })}
      </div>
    </BottomSheet>
  );
}

function AccountPicker({ visible, onClose, theme, accounts, onSelect, selected, title = "Select account" }) {
  return (
    <BottomSheet visible={visible} onClose={onClose} theme={theme} maxHeight="72%">
      <div style={{ padding: "4px 4px 14px" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: theme.colors.text, letterSpacing: -0.2 }}>{title}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 16 }}>
        {accounts.map(a => {
          const isSel = selected === a.id;
          return (
            <Pressable key={a.id} theme={theme} onClick={() => onSelect(a.id)}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 12px", borderRadius: 12,
                background: isSel ? theme.colors.surface2 : "transparent",
                border: HAIRLINE(isSel ? theme.colors.borderStrong : "transparent"),
              }}>
                <IconBox icon={a.icon} color={a.color} size={36}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: theme.colors.text }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 1, textTransform: "capitalize" }}>{a.type}{a.lastFourDigits ? ` · •• ${a.lastFourDigits}` : ""}</div>
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: a.balance >= 0 ? theme.colors.text : theme.colors.negative, fontVariantNumeric: "tabular-nums" }}>{fmt(a.balance, { compact: true, abs: true })}</div>
                {isSel && <div style={{ color: theme.colors.primary, marginLeft: 4 }}><I.check size={18}/></div>}
              </div>
            </Pressable>
          );
        })}
      </div>
    </BottomSheet>
  );
}

function DrawerMenu({ visible, onClose, theme, onNavigate }) {
  const items = [
    { section: "Account", entries: [
      { key: "profile",    label: "Profile",            icon: I.user,     color: theme.colors.textSecondary },
      { key: "settings",   label: "Settings",           icon: I.settings, color: theme.colors.textSecondary },
    ]},
    { section: "Manage", entries: [
      { key: "categories", label: "Categories",         icon: I.tag,      color: theme.colors.textSecondary },
      { key: "sms",        label: "SMS Inbox",          icon: I.message,  color: theme.colors.primary, badge: "3 new" },
    ]},
    { section: "Preferences", entries: [
      { key: "theme",      label: "Appearance",         icon: I.moon,     color: theme.colors.textSecondary },
      { key: "notifications", label: "Notifications",   icon: I.bell,     color: theme.colors.textSecondary },
    ]},
    { section: "Session", entries: [
      { key: "logout",     label: "Sign out",           icon: I.logout,   color: theme.colors.expenseAccent, danger: true },
    ]},
  ];
  return (
    <>
      <div onClick={onClose} style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
        opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none",
        transition: "opacity 200ms ease", zIndex: 60,
      }}/>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "82%",
        background: theme.colors.bg, borderRight: HAIRLINE(theme.colors.border),
        transform: visible ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
        zIndex: 61, display: "flex", flexDirection: "column",
      }}>
        {/* profile */}
        <div style={{ padding: "44px 20px 20px", borderBottom: HAIRLINE(theme.colors.border) }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: theme.colors.primary + "22",
            border: HAIRLINE(theme.colors.primary + "55"),
            display: "flex", alignItems: "center", justifyContent: "center",
            color: theme.colors.primary, fontWeight: 600, fontSize: 18, fontFamily: "var(--mono)",
          }}>RV</div>
          <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: theme.colors.text }}>Rohan Verma</div>
          <div style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 2 }}>rohan@spendy.app</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, padding: "3px 9px", borderRadius: 6, background: theme.colors.primaryMuted, color: theme.colors.primary, fontSize: 10.5, fontWeight: 600, letterSpacing: 0.4 }}>
            <I.shield size={11}/> SPENDY 2.0
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {items.map((sec, i) => (
            <div key={sec.section} style={{ padding: "12px 0" }}>
              <SectionLabel theme={theme} style={{ padding: "0 20px 6px" }}>{sec.section}</SectionLabel>
              {sec.entries.map(e => (
                <Pressable key={e.key} theme={theme} onClick={() => onNavigate(e.key)} scale={0.985}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 20px",
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: theme.colors.surface2, display: "flex", alignItems: "center", justifyContent: "center", color: e.color }}>
                      <e.icon size={16}/>
                    </div>
                    <div style={{ flex: 1, fontSize: 13.5, color: e.danger ? theme.colors.expenseAccent : theme.colors.text, fontWeight: 500 }}>{e.label}</div>
                    {e.badge && (
                      <div style={{ fontSize: 10, fontWeight: 600, color: theme.colors.primary, background: theme.colors.primaryMuted, padding: "2px 7px", borderRadius: 4, letterSpacing: 0.3 }}>{e.badge}</div>
                    )}
                  </div>
                </Pressable>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding: "16px 20px", borderTop: HAIRLINE(theme.colors.border), display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ color: theme.colors.textMuted }}><I.leaf size={14}/></div>
          <div style={{ fontSize: 11, color: theme.colors.textMuted }}>Spendy 2.0 · Local-first</div>
        </div>
      </div>
    </>
  );
}

window.Records = { TransactionItem, DateGroupHeader, RecordsScreen, TransactionDetailModal, CategoryPicker, AccountPicker, DrawerMenu };

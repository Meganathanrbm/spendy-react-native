// AddTransactionScreen — full-screen modal patterned after Spendy v1 reference:
// CANCEL / SAVE header, INCOME|EXPENSE|TRANSFER toggle with check, two-up Account/Category
// fields, notes box, big amount display with backspace, op-column calculator, date/time row.

const { Pressable: P_, IconBox: IB_, BottomSheet: BS_, HAIRLINE: HL_, SectionLabel: SL_ } = UI;

function TypeToggle({ value, onChange, theme }) {
  const types = [
    { key: "income",   label: "INCOME"   },
    { key: "expense",  label: "EXPENSE"  },
    { key: "transfer", label: "TRANSFER" },
  ];
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 0,
      padding: "10px 0",
    }}>
      {types.map((t, i) => {
        const isSel = value === t.key;
        return (
          <React.Fragment key={t.key}>
            <P_ theme={theme} onClick={() => onChange(t.key)} scale={0.96}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px",
              }}>
              {isSel && (
                <div style={{
                  width: 16, height: 16, borderRadius: 8,
                  background: theme.colors.primary,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <I.check size={11} stroke={3} color="#0A0A0A"/>
                </div>
              )}
              <div style={{
                fontSize: 13, fontWeight: 700, letterSpacing: 1.2,
                color: isSel ? theme.colors.text : theme.colors.textMuted,
              }}>{t.label}</div>
            </P_>
            {i < types.length - 1 && (
              <div style={{ width: 1, height: 14, background: theme.colors.border, margin: "0 2px" }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function KeypadButton({ theme, label, onClick, accent, big }) {
  return (
    <P_ theme={theme} onClick={onClick} scale={0.95}>
      <div style={{
        height: 56, borderRadius: 10,
        background: accent ? theme.colors.surface3 : theme.colors.surface,
        border: HL_(theme.colors.border),
        color: accent ? theme.colors.primary : theme.colors.text,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: big ? 22 : 19, fontFamily: "var(--mono)", fontWeight: 500,
      }}>
        {label}
      </div>
    </P_>
  );
}

function Calculator({ value, onChange, theme }) {
  const press = (key) => {
    if (key === "C") return onChange("0");
    if (key === "=") {
      try {
        const sanitized = value.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
        const r = Function("return " + sanitized)();
        if (!isFinite(r)) return;
        return onChange(String(Number(r.toFixed(2))));
      } catch { return; }
    }
    if (value === "0" && /[0-9.]/.test(key)) return onChange(key);
    onChange(value + key);
  };

  // Layout: left column = operators (+, -, ×, ÷), right 3 cols = digits + = at bottom-right
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
      <KeypadButton theme={theme} label="+" accent onClick={() => press("+")}/>
      <KeypadButton theme={theme} label="7" onClick={() => press("7")}/>
      <KeypadButton theme={theme} label="8" onClick={() => press("8")}/>
      <KeypadButton theme={theme} label="9" onClick={() => press("9")}/>

      <KeypadButton theme={theme} label="−" accent onClick={() => press("−")}/>
      <KeypadButton theme={theme} label="4" onClick={() => press("4")}/>
      <KeypadButton theme={theme} label="5" onClick={() => press("5")}/>
      <KeypadButton theme={theme} label="6" onClick={() => press("6")}/>

      <KeypadButton theme={theme} label="×" accent onClick={() => press("×")}/>
      <KeypadButton theme={theme} label="1" onClick={() => press("1")}/>
      <KeypadButton theme={theme} label="2" onClick={() => press("2")}/>
      <KeypadButton theme={theme} label="3" onClick={() => press("3")}/>

      <KeypadButton theme={theme} label="÷" accent onClick={() => press("÷")}/>
      <KeypadButton theme={theme} label="0" onClick={() => press("0")}/>
      <KeypadButton theme={theme} label="." onClick={() => press(".")}/>
      <KeypadButton theme={theme} label="=" accent onClick={() => press("=")}/>
    </div>
  );
}

function AddTransactionScreen({ theme, onClose, onSave, accounts, prefill }) {
  const [type, setType] = useState(prefill?.type || "expense");
  const [amount, setAmount] = useState(prefill ? String(prefill.amount) : "0");
  const [category, setCategory] = useState(prefill?.category || (type === "income" ? "Salary" : "Food"));
  const [accountId, setAccountId] = useState(prefill?.accountId || accounts[0].id);
  const [toAccountId, setToAccountId] = useState(prefill?.toAccountId || accounts[1]?.id);
  const [notes, setNotes] = useState(prefill?.notes || "");
  const now = new Date();
  const [date] = useState(prefill?.date?.slice(0, 10) || now.toISOString().slice(0, 10));
  const [time] = useState(now.toTimeString().slice(0, 5));

  const [showCat, setShowCat] = useState(false);
  const [showAcct, setShowAcct] = useState(false);
  const [showToAcct, setShowToAcct] = useState(false);

  useEffect(() => {
    if (type === "income" && !INCOME_CATS.includes(category)) setCategory("Salary");
    if (type === "expense" && !EXPENSE_CATS.includes(category)) setCategory("Food");
  }, [type]);

  const acct = accounts.find(a => a.id === accountId);
  const toAcct = accounts.find(a => a.id === toAccountId);
  const cat = CATS[category] || CATS.Other;

  const displayAmount = useMemo(() => {
    try {
      const sanitized = amount.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
      if (/[+\-*/]/.test(sanitized)) {
        const r = Function("return " + sanitized)();
        if (isFinite(r)) return Number(r.toFixed(2));
      }
      return Number(amount) || 0;
    } catch { return Number(amount) || 0; }
  }, [amount]);

  const backspace = () => setAmount(prev => prev.length <= 1 ? "0" : prev.slice(0, -1));

  const amountColor = type === "income" ? theme.colors.primary : type === "transfer" ? theme.colors.transfer : theme.colors.text;
  const amountSign  = type === "income" ? "+" : type === "expense" ? "−" : "";

  const handleSave = () => {
    if (!displayAmount || displayAmount <= 0) return;
    onSave({
      type, amount: displayAmount,
      category: type === "transfer" ? "Transfer" : category,
      accountId,
      fromAccountId: type === "transfer" ? accountId : undefined,
      toAccountId: type === "transfer" ? toAccountId : undefined,
      notes, date: date + "T" + new Date().toTimeString().slice(0, 8),
      title: type === "transfer" ? "Transfer" : (notes || category),
    });
  };

  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
  const timeLabel = new Date(`2000-01-01T${time}:00`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const canSave = displayAmount > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: theme.colors.bg }}>
      {/* CANCEL / SAVE header */}
      <div style={{
        height: 52, padding: "0 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <P_ theme={theme} onClick={onClose} scale={0.95}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 4px" }}>
          <I.close size={18} color={theme.colors.primary} stroke={2.2}/>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.colors.primary, letterSpacing: 1.2 }}>CANCEL</div>
        </P_>
        <P_ theme={theme} onClick={handleSave} scale={0.95}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 4px", opacity: canSave ? 1 : 0.4 }}>
          <I.check size={18} color={theme.colors.primary} stroke={2.4}/>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.colors.primary, letterSpacing: 1.2 }}>SAVE</div>
        </P_>
      </div>

      <TypeToggle value={type} onChange={setType} theme={theme}/>

      {/* fields + notes + amount + keypad */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 14px 14px" }}>
        {/* Account / Category two-up */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <FieldBox theme={theme} label={type === "transfer" ? "From" : "Account"}
            icon={acct?.icon} iconColor={acct?.color} value={acct?.name}
            onClick={() => setShowAcct(true)}/>
          {type === "transfer" ? (
            <FieldBox theme={theme} label="To"
              icon={toAcct?.icon} iconColor={toAcct?.color} value={toAcct?.name}
              onClick={() => setShowToAcct(true)}/>
          ) : (
            <FieldBox theme={theme} label="Category"
              icon={cat.icon} iconColor={cat.color} value={category}
              onClick={() => setShowCat(true)}/>
          )}
        </div>

        {/* Notes */}
        <div style={{ marginTop: 10 }}>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add notes"
            rows={3}
            style={{
              width: "100%", background: theme.colors.surface, border: HL_(theme.colors.border),
              borderRadius: 12, padding: "12px 14px", fontSize: 13, color: theme.colors.text,
              outline: "none", boxSizing: "border-box", resize: "none",
              fontFamily: "inherit", lineHeight: 1.4,
            }}
          />
        </div>

        {/* Amount display with backspace */}
        <div style={{
          marginTop: 10, padding: "16px 18px",
          background: theme.colors.surface, borderRadius: 12,
          border: HL_(theme.colors.border),
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ flex: 1, textAlign: "right", overflow: "hidden" }}>
            <div style={{
              fontFamily: "var(--mono)", fontSize: 32, fontWeight: 600,
              color: amountColor, letterSpacing: -1.2,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {displayAmount === 0 && !/[+\-*/×÷−]/.test(amount) ? "0" : `${amountSign}₹${fmt(displayAmount, { abs: true }).replace(/^₹/, "")}`}
            </div>
            {/[+\-*/×÷−]/.test(amount) && (
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: theme.colors.textMuted, marginTop: 2 }}>{amount}</div>
            )}
          </div>
          <P_ theme={theme} onClick={backspace} scale={0.9}
            style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <I.backspace size={20} color={theme.colors.textSecondary}/>
          </P_>
        </div>

        {/* Keypad */}
        <div style={{ marginTop: 10 }}>
          <Calculator value={amount} onChange={setAmount} theme={theme}/>
        </div>

        {/* Date | Time footer row */}
        <div style={{
          marginTop: 14, padding: "10px 4px",
          display: "flex", alignItems: "center", justifyContent: "space-around",
          fontSize: 13, fontWeight: 500, color: theme.colors.text,
        }}>
          <div>{dateLabel}</div>
          <div style={{ width: 1, height: 16, background: theme.colors.border }}/>
          <div>{timeLabel}</div>
        </div>
      </div>

      <CategoryPicker visible={showCat} onClose={() => setShowCat(false)} theme={theme} type={type}
        onSelect={(name) => { setCategory(name); setShowCat(false); }} selected={category}/>
      <AccountPicker visible={showAcct} onClose={() => setShowAcct(false)} theme={theme} accounts={accounts}
        onSelect={(id) => { setAccountId(id); setShowAcct(false); }} selected={accountId}
        title={type === "transfer" ? "From account" : "Select account"}/>
      <AccountPicker visible={showToAcct} onClose={() => setShowToAcct(false)} theme={theme} accounts={accounts.filter(a => a.id !== accountId)}
        onSelect={(id) => { setToAccountId(id); setShowToAcct(false); }} selected={toAccountId}
        title="To account"/>
    </div>
  );
}

function FieldBox({ theme, label, icon: IconC, iconColor, value, onClick }) {
  return (
    <div>
      <div style={{
        fontSize: 10.5, fontWeight: 600, color: theme.colors.textMuted,
        letterSpacing: 0.8, textTransform: "uppercase",
        textAlign: "center", marginBottom: 6,
      }}>{label}</div>
      <P_ theme={theme} onClick={onClick} scale={0.98}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "12px 12px",
          background: theme.colors.surface, border: HL_(theme.colors.border),
          borderRadius: 12, minHeight: 48,
        }}>
          {IconC && <IB_ icon={IconC} color={iconColor || theme.colors.textSecondary} size={28} radius={8}/>}
          <div style={{
            flex: 1, fontSize: 13.5, color: theme.colors.text, fontWeight: 500,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{value}</div>
        </div>
      </P_>
    </div>
  );
}

window.AddTransactionScreen = AddTransactionScreen;
window.TypeToggle = TypeToggle;

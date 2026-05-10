// Analysis, Budgets, Assets, Accounts list, Account detail screens.

const { Card: C2, Pressable: P2, IconBox: IB2, AppHeader: H2, MonthNav: MN2, FAB: FB2, SectionLabel: SL2, Donut: D2, FlowChart: FC2, HAIRLINE: HL2 } = UI;

// ─────────────── Analysis
function AnalysisScreen({ theme, txns, month, setMonth, onMenuPress, onCategoryPress }) {
  const [view, setView] = useState("overview"); // "overview" | "flow" | "calendar"
  const monthTxns = txns.filter(t => t.date.startsWith(month) && t.type === "expense");
  const totalExp = monthTxns.reduce((s, t) => s + t.amount, 0);
  const totalInc = txns.filter(t => t.date.startsWith(month) && t.type === "income").reduce((s, t) => s + t.amount, 0);

  // category stats
  const stats = useMemo(() => {
    const map = {};
    monthTxns.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map)
      .map(([name, amount]) => ({ name, amount, color: CATS[name]?.color || "#94A3B8", icon: CATS[name]?.icon }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthTxns]);

  // monthly daily flow
  const flow = useMemo(() => {
    const map = {};
    monthTxns.forEach(t => {
      const d = t.date.slice(8, 10);
      map[d] = (map[d] || 0) + t.amount;
    });
    const days = Array.from({ length: 31 }, (_, i) => String(i+1).padStart(2, "0"));
    return days.map(d => ({ label: Number(d), value: map[d] || 0 }));
  }, [monthTxns]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <H2 theme={theme} title="Analysis" onMenuPress={onMenuPress}/>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <MN2 theme={theme} month={month} onChange={setMonth}/>

        <div style={{ padding: "0 16px 14px", display: "flex", gap: 8 }}>
          {[["overview", "Overview"], ["flow", "Daily flow"], ["calendar", "Calendar"]].map(([k, l]) => (
            <P2 key={k} theme={theme} onClick={() => setView(k)} scale={0.97}>
              <div style={{
                padding: "7px 14px", borderRadius: 999,
                background: view === k ? theme.colors.surface3 : "transparent",
                border: HL2(view === k ? theme.colors.borderStrong : theme.colors.border),
                color: view === k ? theme.colors.text : theme.colors.textSecondary,
                fontSize: 12, fontWeight: 600, letterSpacing: 0.1, whiteSpace: "nowrap",
              }}>{l}</div>
            </P2>
          ))}
        </div>

        {view === "overview" && (
          <>
            {/* hero card */}
            <div style={{ padding: "0 16px" }}>
              <div style={{
                background: theme.colors.surface, border: HL2(theme.colors.border),
                borderRadius: 14, padding: 20,
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <D2 theme={theme} slices={stats.slice(0, 8).map(s => ({ value: s.amount, color: s.color }))}
                  size={120} thickness={14}
                  centerSub="Spent" centerLabel={fmt(totalExp, { compact: true, abs: true })}
                />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
                  {stats.slice(0, 4).map(s => (
                    <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }}/>
                      <span style={{ color: theme.colors.textSecondary, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
                      <span style={{ color: theme.colors.text, fontFamily: "var(--mono)", fontWeight: 500 }}>
                        {Math.round((s.amount / (totalExp || 1)) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: "20px 16px 8px" }}>
              <SL2 theme={theme}>By category</SL2>
            </div>

            <div style={{ padding: "0 16px" }}>
              {stats.map(s => {
                const pct = (s.amount / (totalExp || 1)) * 100;
                return (
                  <P2 key={s.name} theme={theme} onClick={() => onCategoryPress && onCategoryPress(s.name)} scale={0.985}>
                  <div style={{ padding: "10px 0", borderBottom: HL2(theme.colors.border), display: "flex", alignItems: "center", gap: 12 }}>
                    <IB2 icon={s.icon} color={s.color} size={32} radius={9}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: theme.colors.text }}>{s.name}</span>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: theme.colors.text, fontWeight: 500 }}>{fmt(s.amount, { compact: true, abs: true })}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                        <div style={{ flex: 1, height: 3, borderRadius: 2, background: theme.colors.surface3, overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: s.color }}/>
                        </div>
                        <span style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: theme.colors.textMuted, width: 38, textAlign: "right" }}>{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  </P2>
                );
              })}
            </div>
            <div style={{ height: 80 }}/>
          </>
        )}

        {view === "flow" && (
          <>
            <div style={{ padding: "0 16px" }}>
              <div style={{ background: theme.colors.surface, border: HL2(theme.colors.border), borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <SL2 theme={theme}>Daily expense</SL2>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 600, color: theme.colors.text, marginTop: 4, letterSpacing: -0.6 }}>
                      {fmt(totalExp, { compact: true, abs: true })}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: theme.colors.textMuted }}>
                    avg <span style={{ fontFamily: "var(--mono)", color: theme.colors.textSecondary }}>{fmt(totalExp/30, { compact: true, abs: true })}/d</span>
                  </div>
                </div>
                <div style={{ marginTop: 18 }}>
                  <FC2 data={flow} theme={theme} height={140}/>
                </div>
              </div>
            </div>
            <div style={{ height: 80 }}/>
          </>
        )}

        {view === "calendar" && (
          <>
            <div style={{ padding: "0 16px" }}>
              <Extras.CalendarHeatmap theme={theme} txns={txns} month={month}/>
            </div>
            <div style={{ height: 80 }}/>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────── Budgets
function BudgetsScreen({ theme, month, setMonth, onMenuPress }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <H2 theme={theme} title="Budgets" onMenuPress={onMenuPress}/>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <MN2 theme={theme} month={month} onChange={setMonth}/>

        <div style={{ padding: "0 16px 14px" }}>
          <div style={{ background: theme.colors.surface, border: HL2(theme.colors.border), borderRadius: 14, padding: 18 }}>
            <SL2 theme={theme}>Total this month</SL2>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 26, fontWeight: 600, color: theme.colors.text, letterSpacing: -0.8 }}>
                {fmt(BUDGETS.reduce((s, b) => s + b.spent, 0), { compact: true, abs: true })}
              </div>
              <div style={{ fontSize: 12, color: theme.colors.textMuted }}>
                of {fmt(BUDGETS.reduce((s, b) => s + b.limit, 0), { compact: true, abs: true })}
              </div>
            </div>
            <div style={{ marginTop: 12, height: 4, background: theme.colors.surface3, borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                width: `${Math.min(100, (BUDGETS.reduce((s,b)=>s+b.spent,0) / BUDGETS.reduce((s,b)=>s+b.limit,0)) * 100)}%`,
                height: "100%", background: theme.colors.primary,
              }}/>
            </div>
          </div>
        </div>

        <div style={{ padding: "8px 16px 8px" }}>
          <SL2 theme={theme}>Categories</SL2>
        </div>

        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {BUDGETS.map(b => {
            const c = CATS[b.categoryName];
            const pct = (b.spent / b.limit) * 100;
            const overBudget = b.spent > b.limit;
            return (
              <div key={b.categoryName} style={{
                background: theme.colors.surface, border: HL2(theme.colors.border),
                borderRadius: 14, padding: 14,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <IB2 icon={c.icon} color={c.color} size={36}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: theme.colors.text }}>{b.categoryName}</div>
                    <div style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 1 }}>{fmt(b.limit - b.spent, { compact: true })} {overBudget ? "over" : "left"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: overBudget ? theme.colors.expenseAccent : theme.colors.text }}>
                      {fmt(b.spent, { compact: true, abs: true })}
                    </div>
                    <div style={{ fontSize: 11, color: theme.colors.textMuted, fontFamily: "var(--mono)" }}>/ {fmt(b.limit, { compact: true, abs: true })}</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, height: 4, background: theme.colors.surface3, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: overBudget ? theme.colors.expenseAccent : c.color, transition: "width 320ms ease" }}/>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ height: 80 }}/>
      </div>
      <FB2 theme={theme} onClick={onAddPress}/>
    </div>
  );
}

// ASSETS_END

// ─────────────── Assets
function AssetsScreen({ theme, onMenuPress, onAddPress }) {
  const totalInvested = ASSETS.reduce((s, a) => s + a.invested, 0);
  const totalCurrent  = ASSETS.reduce((s, a) => s + a.current, 0);
  const returns = totalCurrent - totalInvested;
  const returnsPct = (returns / totalInvested) * 100;

  // by subType
  const subStats = useMemo(() => {
    const map = {};
    ASSETS.forEach(a => { map[a.subType] = (map[a.subType] || 0) + a.current; });
    return Object.entries(map).map(([k, v]) => ({ key: k, value: v, color: SUBTYPE_COLORS[k] || "#94A3B8" }));
  }, []);

  // group by type
  const order = ["mutual_fund","stocks","fixed_deposit","gold","ppf","crypto"];
  const groups = order.map(t => ({ type: t, items: ASSETS.filter(a => a.type === t) })).filter(g => g.items.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <H2 theme={theme} title="Assets" onMenuPress={onMenuPress}/>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 80px" }}>
        {/* portfolio summary */}
        <div style={{ background: theme.colors.surface, border: HL2(theme.colors.border), borderRadius: 14, padding: 20 }}>
          <SL2 theme={theme}>Portfolio value</SL2>
          <div style={{ fontFamily: "var(--mono)", fontSize: 30, fontWeight: 600, color: theme.colors.text, marginTop: 6, letterSpacing: -1 }}>
            {fmt(totalCurrent, { abs: true })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--mono)", fontSize: 12.5, fontWeight: 600, color: returns >= 0 ? theme.colors.primary : theme.colors.expenseAccent }}>
              {returns >= 0 ? <I.arrowUp size={11} stroke={2.4}/> : <I.arrowDown size={11} stroke={2.4}/>}
              {returns >= 0 ? "+" : "−"}{fmt(Math.abs(returns), { compact: true, abs: true })} ({returnsPct.toFixed(2)}%)
            </span>
            <span style={{ fontSize: 11, color: theme.colors.textMuted }}>· invested {fmt(totalInvested, { compact: true, abs: true })}</span>
          </div>

          <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 16 }}>
            <D2 theme={theme} slices={subStats.map(s => ({ value: s.value, color: s.color }))} size={88} thickness={11}/>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              {subStats.map(s => (
                <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: s.color }}/>
                  <span style={{ color: theme.colors.textSecondary, flex: 1, textTransform: "capitalize" }}>{s.key.replace("_"," ")}</span>
                  <span style={{ fontFamily: "var(--mono)", color: theme.colors.text }}>
                    {Math.round((s.value / totalCurrent) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {groups.map(g => {
          const meta = ASSET_TYPE_META[g.type];
          return (
            <div key={g.type} style={{ marginTop: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <SL2 theme={theme}>{meta.label}</SL2>
                <span style={{ fontSize: 10, color: theme.colors.textMuted, fontFamily: "var(--mono)" }}>· {g.items.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {g.items.map(a => {
                  const ret = a.current - a.invested;
                  const retPct = (ret / a.invested) * 100;
                  const positive = ret >= 0;
                  return (
                    <div key={a.id} style={{
                      background: theme.colors.surface, border: HL2(theme.colors.border),
                      borderRadius: 12, padding: 14,
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <IB2 icon={meta.icon} color={meta.color} size={36}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: theme.colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                        <div style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 2 }}>
                          {a.broker || meta.label} {a.units ? ` · ${a.units} units` : ""} {a.interestRate ? ` · ${a.interestRate}%` : ""}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: theme.colors.text }}>{fmt(a.current, { compact: true, abs: true })}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 500, color: positive ? theme.colors.primary : theme.colors.expenseAccent, marginTop: 1 }}>
                          {positive ? "+" : "−"}{Math.abs(retPct).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <FB2 theme={theme} onClick={onAddPress}/>
    </div>
  );
}

// ACCOUNTS_END

// ─────────────── Accounts list
function AccountsScreen({ theme, accounts, onMenuPress, onAccountPress, onAddPress }) {
  const total = accounts.reduce((s, a) => s + a.balance, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <H2 theme={theme} title="Accounts" onMenuPress={onMenuPress}/>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 80px" }}>
        <div style={{ background: theme.colors.surface, border: HL2(theme.colors.border), borderRadius: 14, padding: 20 }}>
          <SL2 theme={theme}>Net worth</SL2>
          <div style={{ fontFamily: "var(--mono)", fontSize: 30, fontWeight: 600, color: theme.colors.text, marginTop: 6, letterSpacing: -1 }}>
            {fmt(total, { abs: true })}
          </div>
          <div style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 4 }}>
            Across {accounts.length} accounts
          </div>
        </div>

        <div style={{ padding: "20px 0 8px" }}>
          <SL2 theme={theme}>Your accounts</SL2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {accounts.map(a => (
            <P2 key={a.id} theme={theme} onClick={() => onAccountPress(a)} scale={0.99}>
              <div style={{
                background: theme.colors.surface,
                border: HL2(a.isPrimary ? theme.colors.primary + "55" : theme.colors.border),
                borderRadius: 12, padding: 14,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <IB2 icon={a.icon} color={a.color} size={40} radius={12}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: theme.colors.text }}>{a.name}</span>
                    {a.isPrimary && <span style={{ fontSize: 9, fontWeight: 600, color: theme.colors.primary, background: theme.colors.primaryMuted, padding: "1.5px 6px", borderRadius: 4, letterSpacing: 0.4 }}>PRIMARY</span>}
                  </div>
                  <div style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 2, textTransform: "capitalize" }}>{a.type}{a.lastFourDigits ? ` · •• ${a.lastFourDigits}` : ""}</div>
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 600, color: a.balance >= 0 ? theme.colors.text : theme.colors.expenseAccent }}>
                  {a.balance < 0 ? "−" : ""}{fmt(Math.abs(a.balance), { compact: true, abs: true })}
                </div>
              </div>
            </P2>
          ))}
        </div>
      </div>
      <FB2 theme={theme} onClick={()=>{}}/>
    </div>
  );
}

// ─────────────── Account detail
function AccountDetailScreen({ theme, account, txns, onClose, onTxnPress }) {
  const acctTxns = txns.filter(t => t.accountId === account.id || t.fromAccountId === account.id || t.toAccountId === account.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const inc = acctTxns.filter(t => t.type === "income" || (t.type === "transfer" && t.toAccountId === account.id)).reduce((s, t) => s + t.amount, 0);
  const exp = acctTxns.filter(t => t.type === "expense" || (t.type === "transfer" && t.fromAccountId === account.id)).reduce((s, t) => s + t.amount, 0);

  // group
  const groups = useMemo(() => {
    const map = {};
    acctTxns.forEach(t => { const k = dateKey(t.date); (map[k] = map[k] || []).push(t); });
    return Object.entries(map);
  }, [acctTxns]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: theme.colors.bg }}>
      <div style={{ height: 56, padding: "0 12px", display: "flex", alignItems: "center", borderBottom: HL2(theme.colors.border) }}>
        <P2 theme={theme} onClick={onClose} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: theme.colors.text }}><I.chevronLeft size={20}/></div>
        </P2>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: theme.colors.text, letterSpacing: -0.1, marginLeft: 4 }}>Account</div>
        <P2 theme={theme} onClick={()=>{}} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: theme.colors.text }}><I.more size={20}/></div>
        </P2>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* hero */}
        <div style={{ padding: "20px 16px 8px" }}>
          <div style={{ background: theme.colors.surface, border: HL2(theme.colors.border), borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <IB2 icon={account.icon} color={account.color} size={44} radius={13}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{account.name}</div>
                <div style={{ fontSize: 11.5, color: theme.colors.textMuted, marginTop: 2, textTransform: "capitalize" }}>{account.type}{account.lastFourDigits ? ` · •• ${account.lastFourDigits}` : ""}</div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <SL2 theme={theme}>Balance</SL2>
              <div style={{ fontFamily: "var(--mono)", fontSize: 30, fontWeight: 600, color: account.balance >= 0 ? theme.colors.text : theme.colors.expenseAccent, marginTop: 4, letterSpacing: -1 }}>
                {account.balance < 0 ? "−" : ""}{fmt(Math.abs(account.balance), { abs: true })}
              </div>
            </div>

            <div style={{ display: "flex", marginTop: 18, padding: "12px 0 0", borderTop: HL2(theme.colors.border) }}>
              <div style={{ flex: 1 }}>
                <SL2 theme={theme}>Income</SL2>
                <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: theme.colors.primary, fontWeight: 600, marginTop: 4 }}>+{fmt(inc, { compact: true, abs: true })}</div>
              </div>
              <div style={{ width: 0.5, background: theme.colors.border, margin: "0 12px" }}/>
              <div style={{ flex: 1 }}>
                <SL2 theme={theme}>Expense</SL2>
                <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: theme.colors.text, fontWeight: 600, marginTop: 4 }}>−{fmt(exp, { compact: true, abs: true })}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <SL2 theme={theme}>Recent activity</SL2>
          <span style={{ fontSize: 11, color: theme.colors.textMuted, fontFamily: "var(--mono)" }}>{acctTxns.length} records</span>
        </div>

        {groups.map(([k, list]) => (
          <div key={k}>
            <DateGroupHeader dateKey={k} txns={list} theme={theme}/>
            {list.map(t => <TransactionItem key={t.id} t={t} theme={theme} onClick={() => onTxnPress(t)}/>)}
          </div>
        ))}
        <div style={{ height: 24 }}/>
      </div>
    </div>
  );
}

// reuse from records.jsx
const { TransactionItem, DateGroupHeader } = window.Records;

window.Screens = { AnalysisScreen, BudgetsScreen, AssetsScreen, AccountsScreen, AccountDetailScreen };

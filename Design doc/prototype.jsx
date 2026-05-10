// Prototype — phone frame + nav state machine.
const { useState: uS } = React;

function PhoneFrame({ children, theme }) {
  return (
    <div style={{
      width: 380, height: 780,
      borderRadius: 44,
      background: "#0a0a0a",
      border: `1px solid #1a1a1a`,
      boxShadow: "0 0 0 8px #050505, 0 30px 80px rgba(0,0,0,0.6), 0 0 0 9px #2a2a2a",
      padding: 8,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        width: "100%", height: "100%",
        borderRadius: 36,
        overflow: "hidden",
        background: theme.colors.bg,
        position: "relative",
        display: "flex", flexDirection: "column",
      }}>
        {children}
      </div>
    </div>
  );
}

function Prototype({ theme }) {
  const [tab, setTab] = uS("records");
  const [month, setMonth] = uS("2026-05");
  const [txns, setTxns] = uS(TXNS);
  const [drawerOpen, setDrawerOpen] = uS(false);
  const [selTxn, setSelTxn] = uS(null);
  const [showAdd, setShowAdd] = uS(false);
  const [editTxn, setEditTxn] = uS(null);
  const [acctDetail, setAcctDetail] = uS(null);
  // overlays from drawer / FABs
  const [overlay, setOverlay] = uS(null); // "addAccount" | "addAsset" | "categories" | "profile" | "settings" | "sms"
  const [catDrill, setCatDrill] = uS(null); // category name
  const [customCats, setCustomCats] = uS([]);

  const handleAddSave = (data) => {
    if (editTxn) {
      setTxns(arr => arr.map(t => t.id === editTxn.id ? { ...t, ...data } : t));
    } else {
      setTxns(arr => [{ id: "n" + Date.now(), ...data }, ...arr]);
    }
    setShowAdd(false); setEditTxn(null);
  };

  const handleDelete = () => {
    if (!selTxn) return;
    setTxns(arr => arr.filter(t => t.id !== selTxn.id));
    setSelTxn(null);
  };

  const handleEdit = () => {
    setEditTxn(selTxn);
    setShowAdd(true);
    setSelTxn(null);
  };

  const handleNavigate = (key) => {
    setDrawerOpen(false);
    const map = {
      profile: "profile",
      settings: "settings",
      categories: "categories",
      sms: "sms",
      theme: "settings",
    };
    if (map[key]) setTimeout(() => setOverlay(map[key]), 200);
  };

  const { RecordsScreen, TransactionDetailModal, DrawerMenu } = window.Records;
  const { AnalysisScreen, BudgetsScreen, AssetsScreen, AccountsScreen, AccountDetailScreen } = window.Screens;
  const { AddAccountScreen, AddAssetScreen, CategoriesScreen, ProfileScreen, SettingsScreen, SMSInboxScreen, CategoryDetailScreen } = window.Extras;

  return (
    <PhoneFrame theme={theme}>
      <UI.StatusBar theme={theme}/>

      {/* main view */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
          {tab === "records"  && <RecordsScreen   theme={theme} txns={txns} month={month} setMonth={setMonth} onMenuPress={()=>setDrawerOpen(true)} onTxnPress={setSelTxn} onAddPress={()=>setShowAdd(true)} accounts={ACCOUNTS} primaryAccount={ACCOUNTS.find(a => a.isPrimary)}/>}
          {tab === "analysis" && <AnalysisScreen  theme={theme} txns={txns} month={month} setMonth={setMonth} onMenuPress={()=>setDrawerOpen(true)} onCategoryPress={setCatDrill}/>}
          {tab === "budgets"  && <BudgetsScreen   theme={theme} month={month} setMonth={setMonth} onMenuPress={()=>setDrawerOpen(true)}/>}
          {tab === "accounts" && <AccountsScreen  theme={theme} accounts={ACCOUNTS} onMenuPress={()=>setDrawerOpen(true)} onAccountPress={setAcctDetail} onAddPress={()=>setOverlay("addAccount")}/>}
          {tab === "assets"   && <AssetsScreen    theme={theme} onMenuPress={()=>setDrawerOpen(true)} onAddPress={()=>setOverlay("addAsset")}/>}
        </div>

        <TransactionDetailModal t={selTxn} visible={!!selTxn} onClose={()=>setSelTxn(null)} theme={theme} onDelete={handleDelete} onEdit={handleEdit}/>
        <DrawerMenu visible={drawerOpen} onClose={()=>setDrawerOpen(false)} theme={theme} onNavigate={handleNavigate}/>

        {/* category drill-down */}
        {catDrill && (
          <CategoryDetailScreen theme={theme} categoryName={catDrill} txns={txns} month={month} onClose={()=>setCatDrill(null)} onTxnPress={setSelTxn}/>
        )}

        {/* Account detail overlay */}
        {acctDetail && (
          <div style={{ position: "absolute", inset: 0, zIndex: 70, animation: "slideInRight 280ms cubic-bezier(0.22, 1, 0.36, 1)" }}>
            <AccountDetailScreen theme={theme} account={acctDetail} txns={txns} onClose={()=>setAcctDetail(null)} onTxnPress={setSelTxn}/>
          </div>
        )}

        {/* Drawer-launched overlays */}
        {overlay === "profile"    && <ProfileScreen    theme={theme} onClose={()=>setOverlay(null)}/>}
        {overlay === "settings"   && <SettingsScreen   theme={theme} onClose={()=>setOverlay(null)} onNavigate={k => setOverlay(k)}/>}
        {overlay === "categories" && <CategoriesScreen theme={theme} onClose={()=>setOverlay(null)} customCats={customCats}
          onAdd={d => setCustomCats(arr => [...arr, { id: "c" + Date.now(), ...d }])}
          onDelete={id => setCustomCats(arr => arr.filter(c => c.id !== id))}/>}
        {overlay === "sms"        && <SMSInboxScreen   theme={theme} onClose={()=>setOverlay(null)}/>}
        {overlay === "addAccount" && <AddAccountScreen theme={theme} onClose={()=>setOverlay(null)} onSave={()=>setOverlay(null)}/>}
        {overlay === "addAsset"   && <AddAssetScreen   theme={theme} onClose={()=>setOverlay(null)} onSave={()=>setOverlay(null)}/>}

        {/* Add transaction overlay */}
        {showAdd && (
          <div style={{ position: "absolute", inset: 0, zIndex: 80, animation: "slideUp 320ms cubic-bezier(0.22, 1, 0.36, 1)" }}>
            <AddTransactionScreen theme={theme} accounts={ACCOUNTS} prefill={editTxn}
              onClose={()=>{ setShowAdd(false); setEditTxn(null); }}
              onSave={handleAddSave}
            />
          </div>
        )}
      </div>

      <UI.TabBar active={tab} onChange={setTab} theme={theme}/>

      {/* home indicator */}
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 6, width: 100, height: 3, borderRadius: 2, background: "#3a3a3a" }}/>
    </PhoneFrame>
  );
}

window.Prototype = Prototype;
window.PhoneFrame = PhoneFrame;

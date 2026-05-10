// Design System showcase page — tokens, type, components.

const { useState: dsUS } = React;

function DesignSystem({ theme }) {
  const Section = ({ title, sub, children }) => (
    <section style={{ marginBottom: 56 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textMuted, letterSpacing: 1.2, textTransform: "uppercase" }}>{title}</div>
        {sub && <div style={{ fontSize: 18, fontWeight: 500, color: theme.colors.text, marginTop: 4, letterSpacing: -0.3 }}>{sub}</div>}
      </div>
      {children}
    </section>
  );

  const swatches = [
    { name: "background",    val: theme.colors.bg,           role: "Page" },
    { name: "surface",       val: theme.colors.surface,      role: "Cards" },
    { name: "surface2",      val: theme.colors.surface2,     role: "Inputs" },
    { name: "surface3",      val: theme.colors.surface3,     role: "Hover" },
    { name: "border",        val: theme.colors.border,       role: "Hairline" },
    { name: "borderStrong",  val: theme.colors.borderStrong, role: "Primary" },
  ];
  const textTokens = [
    { name: "text",          val: theme.colors.text,          role: "Primary" },
    { name: "textSecondary", val: theme.colors.textSecondary, role: "Body" },
    { name: "textMuted",     val: theme.colors.textMuted,     role: "Caption" },
    { name: "textFaint",     val: theme.colors.textFaint,     role: "Disabled" },
  ];
  const semantic = [
    { name: "primary",   val: theme.colors.primary,       role: "Accent / income" },
    { name: "transfer",  val: theme.colors.transfer,      role: "Transfer" },
    { name: "negative",  val: theme.colors.expenseAccent, role: "Destructive" },
  ];
  const categoryColors = Object.entries(CATS).slice(0, 11).map(([name, c]) => ({ name, color: c.color }));

  const typeScale = [
    { name: "Display",   size: 36, weight: 600, sample: "₹1,84,500", mono: true,  letter: -1.4 },
    { name: "Title 1",   size: 24, weight: 600, sample: "Records",   letter: -0.4 },
    { name: "Title 2",   size: 18, weight: 600, sample: "May 2026",  letter: -0.2 },
    { name: "Body L",    size: 15, weight: 500, sample: "Transaction title" },
    { name: "Body",      size: 13.5, weight: 500, sample: "Body copy at default size" },
    { name: "Caption",   size: 11.5, weight: 500, sample: "Food · 9:12 AM", muted: true },
    { name: "Section",   size: 10.5, weight: 600, sample: "BY CATEGORY", upper: true, letter: 1, muted: true },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 32px 80px", color: theme.colors.text }}>
      {/* Header */}
      <header style={{ marginBottom: 56, paddingBottom: 32, borderBottom: `0.5px solid ${theme.colors.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 600, color: theme.colors.textMuted, letterSpacing: 1.2, textTransform: "uppercase" }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: theme.colors.primary }}/>
          Spendy 2.0 · Design system
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 600, letterSpacing: -1.6, marginTop: 16, lineHeight: 1.05, color: theme.colors.text }}>
          Quiet finance.<br/>
          <span style={{ color: theme.colors.textMuted }}>Loud numbers.</span>
        </h1>
        <p style={{ fontSize: 16, color: theme.colors.textSecondary, marginTop: 16, maxWidth: 580, lineHeight: 1.55 }}>
          A flat, near-monochrome dark system tuned for personal finance on Android. Three surfaces, one accent, monospaced numerals. Restraint by default — color reserved for state.
        </p>
        <div style={{ display: "flex", gap: 24, marginTop: 28, fontSize: 12, color: theme.colors.textMuted }}>
          <Stat label="Surfaces" value="3"/>
          <Stat label="Type sizes" value="7"/>
          <Stat label="Components" value="14"/>
          <Stat label="Density" value="Compact"/>
        </div>
      </header>

      {/* Foundations */}
      <Section title="Foundations" sub="Color">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {swatches.map(s => <Swatch key={s.name} {...s} theme={theme}/>)}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {textTokens.map(s => <Swatch key={s.name} {...s} theme={theme}/>)}
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textMuted, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 12 }}>Semantic</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
          {semantic.map(s => <Swatch key={s.name} {...s} theme={theme}/>)}
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textMuted, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 12 }}>Category palette</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {categoryColors.map(c => (
            <div key={c.name} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 10px 6px 6px",
              background: theme.colors.surface, border: `0.5px solid ${theme.colors.border}`,
              borderRadius: 999,
            }}>
              <span style={{ width: 18, height: 18, borderRadius: 6, background: c.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color }}/>
              </span>
              <span style={{ fontSize: 12, color: theme.colors.text, fontWeight: 500 }}>{c.name}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: theme.colors.textMuted, textTransform: "uppercase" }}>{c.color}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Type */}
      <Section title="Foundations" sub="Typography">
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: 360 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {typeScale.map(t => (
                <div key={t.name} style={{
                  display: "flex", alignItems: "baseline", gap: 24,
                  padding: "16px 0", borderBottom: `0.5px solid ${theme.colors.border}`,
                }}>
                  <div style={{ width: 80, fontSize: 11, color: theme.colors.textMuted, fontWeight: 500, letterSpacing: 0.3 }}>
                    {t.name}
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, marginTop: 3, color: theme.colors.textFaint }}>{t.size}/{t.weight}</div>
                  </div>
                  <div style={{
                    flex: 1,
                    fontSize: t.size, fontWeight: t.weight,
                    color: t.muted ? theme.colors.textMuted : theme.colors.text,
                    letterSpacing: t.letter || 0,
                    textTransform: t.upper ? "uppercase" : "none",
                    fontFamily: t.mono ? "var(--mono)" : "var(--sans)",
                    fontVariantNumeric: t.mono ? "tabular-nums" : "normal",
                  }}>{t.sample}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ background: theme.colors.surface, border: `0.5px solid ${theme.colors.border}`, borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 11, color: theme.colors.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase" }}>Type families</div>
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 28, fontFamily: "var(--sans)", fontWeight: 600, color: theme.colors.text, letterSpacing: -0.5 }}>Geist Sans</div>
                <div style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 2 }}>Interface · 400 / 500 / 600</div>
              </div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `0.5px solid ${theme.colors.border}` }}>
                <div style={{ fontSize: 26, fontFamily: "var(--mono)", fontWeight: 500, color: theme.colors.text, letterSpacing: -0.2 }}>₹1,84,500</div>
                <div style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 2 }}>Geist Mono · Numerals only</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Spacing */}
      <Section title="Foundations" sub="Spacing & shape">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: theme.colors.surface, border: `0.5px solid ${theme.colors.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, color: theme.colors.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 14 }}>Spacing scale (4px base)</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 56 }}>
              {[4, 8, 12, 16, 20, 24, 32, 48].map(n => (
                <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: n, height: n, background: theme.colors.primary, borderRadius: 2 }}/>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: theme.colors.textMuted }}>{n}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: theme.colors.surface, border: `0.5px solid ${theme.colors.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, color: theme.colors.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 14 }}>Radii</div>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
              {[{ n: 6, l: "input" }, { n: 10, l: "small" }, { n: 14, l: "card" }, { n: 20, l: "sheet" }].map(r => (
                <div key={r.n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 44, height: 44, background: theme.colors.surface3, borderRadius: r.n, border: `0.5px solid ${theme.colors.borderStrong}` }}/>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: theme.colors.textMuted }}>{r.n}</div>
                  <div style={{ fontSize: 10, color: theme.colors.textFaint }}>{r.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Components */}
      <Section title="Components" sub="Building blocks">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Transaction item demo */}
          <DemoCard theme={theme} title="Transaction item" desc="One row per record. Icon-color is the only chromatic cue.">
            <div style={{ background: theme.colors.surface, borderRadius: 10, border: `0.5px solid ${theme.colors.border}`, overflow: "hidden" }}>
              {[
                { type: "expense", title: "BigBasket weekly", category: "Groceries", amount: 2840, time: "7:45 PM" },
                { type: "income",  title: "Freelance — Acme", category: "Freelance",  amount: 45000, time: "10:00 AM" },
                { type: "transfer", title: "HDFC → Zerodha",   category: "Transfer",  amount: 15000, time: "6:20 PM" },
              ].map((d, i) => {
                const isLast = i === 2;
                const c = CATS[d.category] || { icon: I.arrowLeftRight, color: theme.colors.transfer };
                const IconC = d.type === "transfer" ? I.arrowLeftRight : c.icon;
                const iconColor = d.type === "transfer" ? theme.colors.transfer : c.color;
                const sign = d.type === "income" ? "+" : d.type === "expense" ? "−" : "";
                const aColor = d.type === "income" ? theme.colors.primary : d.type === "transfer" ? theme.colors.transfer : theme.colors.text;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderBottom: isLast ? "none" : `0.5px solid ${theme.colors.border}` }}>
                    <UI.IconBox icon={IconC} color={iconColor} size={32}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: theme.colors.text, fontWeight: 500 }}>{d.title}</div>
                      <div style={{ fontSize: 11, color: theme.colors.textMuted, marginTop: 2 }}>{d.category} · {d.time}</div>
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: aColor }}>{sign}{fmt(d.amount, { abs: true })}</div>
                  </div>
                );
              })}
            </div>
          </DemoCard>

          {/* Type toggle */}
          <DemoCard theme={theme} title="Type toggle" desc="Segmented control for income · expense · transfer.">
            <div style={{ padding: 16, background: theme.colors.surface, borderRadius: 10, border: `0.5px solid ${theme.colors.border}` }}>
              <TypeToggleDemo theme={theme}/>
            </div>
          </DemoCard>

          {/* Buttons */}
          <DemoCard theme={theme} title="Buttons" desc="One primary, one ghost. No outline variant.">
            <div style={{ padding: 18, background: theme.colors.surface, borderRadius: 10, border: `0.5px solid ${theme.colors.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
              <button style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: theme.colors.primary, color: "#0A0A0A", fontWeight: 600, fontSize: 13, cursor: "pointer", letterSpacing: 0.1 }}>Save transaction</button>
              <button style={{ padding: "10px 16px", borderRadius: 10, border: `0.5px solid ${theme.colors.borderStrong}`, background: theme.colors.surface2, color: theme.colors.text, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "rgba(248,113,113,0.10)", color: theme.colors.expenseAccent, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <I.trash size={14}/> Delete
              </button>
            </div>
          </DemoCard>

          {/* Inputs */}
          <DemoCard theme={theme} title="Form fields" desc="Surface inputs over surface2; hairline border at rest.">
            <div style={{ padding: 18, background: theme.colors.surface, borderRadius: 10, border: `0.5px solid ${theme.colors.border}`, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: theme.colors.textMuted, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>Notes</div>
                <input placeholder="Coffee with the team" style={{ width: "100%", boxSizing: "border-box", background: theme.colors.surface2, border: `0.5px solid ${theme.colors.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 13, color: theme.colors.text, outline: "none" }}/>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 600, color: theme.colors.textMuted, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>Amount</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: theme.colors.surface2, border: `0.5px solid ${theme.colors.border}`, borderRadius: 10 }}>
                  <span style={{ color: theme.colors.textMuted, fontFamily: "var(--mono)" }}>₹</span>
                  <input defaultValue="2,840" style={{ flex: 1, fontFamily: "var(--mono)", fontSize: 14, color: theme.colors.text, background: "transparent", border: "none", outline: "none", fontVariantNumeric: "tabular-nums" }}/>
                </div>
              </div>
            </div>
          </DemoCard>

          {/* Pills/badges */}
          <DemoCard theme={theme} title="Badges" desc="Type pills used in modal headers and SMS source tags.">
            <div style={{ padding: 18, background: theme.colors.surface, borderRadius: 10, border: `0.5px solid ${theme.colors.border}`, display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[
                { c: theme.colors.primary, l: "INCOME" },
                { c: theme.colors.expenseAccent, l: "EXPENSE" },
                { c: theme.colors.transfer, l: "TRANSFER" },
              ].map(b => (
                <span key={b.l} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 10px", borderRadius: 999, background: b.c + "1F" }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: b.c }}/>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: b.c, letterSpacing: 0.8 }}>{b.l}</span>
                </span>
              ))}
              <span style={{ background: theme.colors.surface3, color: theme.colors.textSecondary, padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, letterSpacing: 0.4 }}>SMS · HDFC</span>
              <span style={{ background: theme.colors.primaryMuted, color: theme.colors.primary, padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, letterSpacing: 0.4 }}>PRIMARY</span>
            </div>
          </DemoCard>

          {/* Icon box */}
          <DemoCard theme={theme} title="Icon box" desc="Color-tinted square for category & account marks.">
            <div style={{ padding: 18, background: theme.colors.surface, borderRadius: 10, border: `0.5px solid ${theme.colors.border}`, display: "flex", flexWrap: "wrap", gap: 12 }}>
              {Object.entries(CATS).slice(0, 11).map(([n, c]) => (
                <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <UI.IconBox icon={c.icon} color={c.color} size={36}/>
                  <span style={{ fontSize: 9, color: theme.colors.textMuted, fontWeight: 500 }}>{n}</span>
                </div>
              ))}
            </div>
          </DemoCard>
        </div>
      </Section>

      {/* Patterns */}
      <Section title="Patterns" sub="Rules of engagement">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { t: "Reduce", d: "Prefer hairline dividers over cards. Surface 1 for backgrounds, surface 2 for elevated content, surface 3 for hover. No drop shadows." },
            { t: "Numerals are mono", d: "All amounts, percentages, and dates use Geist Mono with tabular-nums. Body text is Geist Sans." },
            { t: "Color is state", d: "Accent for income/positive. Neutral text for expense — the minus sign carries the meaning. Red is reserved for destructive actions." },
            { t: "Press is physical", d: "Spring-eased scale 0.94–0.98 on press. No ripple. Sheets enter from where they came from." },
          ].map(p => (
            <div key={p.t} style={{ padding: 18, background: theme.colors.surface, borderRadius: 12, border: `0.5px solid ${theme.colors.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text, letterSpacing: -0.1 }}>{p.t}</div>
              <div style={{ fontSize: 12.5, color: theme.colors.textSecondary, marginTop: 6, lineHeight: 1.55 }}>{p.d}</div>
            </div>
          ))}
        </div>
      </Section>

      <footer style={{ paddingTop: 32, borderTop: `0.5px solid ${theme.colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", color: theme.colors.textMuted, fontSize: 11 }}>
        <span>Spendy 2.0 — Design system v0.1</span>
        <span style={{ fontFamily: "var(--mono)" }}>spendy.app/design</span>
      </footer>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 600, letterSpacing: -0.4 }}>{value}</div>
      <div style={{ fontSize: 11, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Swatch({ name, val, role, theme }) {
  return (
    <div style={{
      background: theme.colors.surface, border: `0.5px solid ${theme.colors.border}`,
      borderRadius: 10, padding: 14,
    }}>
      <div style={{ width: "100%", height: 56, borderRadius: 6, background: val, border: `0.5px solid ${theme.colors.border}`, marginBottom: 10 }}/>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.text }}>{name}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: theme.colors.textMuted, textTransform: "uppercase" }}>{val}</span>
      </div>
      <div style={{ fontSize: 10.5, color: theme.colors.textFaint, marginTop: 2 }}>{role}</div>
    </div>
  );
}

function DemoCard({ title, desc, children, theme }) {
  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.colors.text, letterSpacing: -0.1 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: theme.colors.textMuted, marginTop: 3, lineHeight: 1.5 }}>{desc}</div>
      </div>
      {children}
    </div>
  );
}

function TypeToggleDemo({ theme }) {
  const [v, sV] = dsUS("expense");
  return <TypeToggle value={v} onChange={sV} theme={theme}/>;
}

window.DesignSystem = DesignSystem;

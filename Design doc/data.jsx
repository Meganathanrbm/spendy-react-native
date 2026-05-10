// Mock data + category/account metadata.

const CATS = {
  // expense
  Food:          { icon: I.utensils,    color: "#F59E0B" },
  Groceries:     { icon: I.cart,        color: "#34D399" },
  Transport:     { icon: I.car,         color: "#FBBF24" },
  Shopping:      { icon: I.bag,         color: "#60A5FA" },
  Bills:         { icon: I.receiptShort, color: "#818CF8" },
  Health:        { icon: I.pill,        color: "#F472B6" },
  Entertainment: { icon: I.film,        color: "#A78BFA" },
  Education:     { icon: I.book,        color: "#22D3EE" },
  Travel:        { icon: I.plane,       color: "#38BDF8" },
  Rent:          { icon: I.home,        color: "#4ADE80" },
  Other:         { icon: I.package,     color: "#94A3B8" },
  // income
  Salary:        { icon: I.briefcase,   color: "#34D399" },
  Freelance:     { icon: I.cash,        color: "#22D3EE" },
  Business:      { icon: I.bank,        color: "#818CF8" },
  Gift:          { icon: I.gift,        color: "#F472B6" },
  Returns:       { icon: I.trending,    color: "#FBBF24" },
};

const EXPENSE_CATS = ["Food","Groceries","Transport","Shopping","Bills","Health","Entertainment","Education","Travel","Rent","Other"];
const INCOME_CATS = ["Salary","Freelance","Business","Gift","Returns","Other"];

const ACCOUNTS = [
  { id: "a1", name: "HDFC Savings",  type: "savings",  icon: I.bank,  color: "#34D399", balance: 184500, isPrimary: true,  bankName: "HDFC", lastFourDigits: "4521" },
  { id: "a2", name: "ICICI Credit",  type: "credit",   icon: I.card,  color: "#F472B6", balance: -12480, isPrimary: false, bankName: "ICICI", lastFourDigits: "8810" },
  { id: "a3", name: "Cash",          type: "cash",     icon: I.cash,  color: "#FBBF24", balance: 4250,   isPrimary: false },
  { id: "a4", name: "Paytm Wallet",  type: "wallet",   icon: I.wallet, color: "#60A5FA", balance: 1890,  isPrimary: false },
  { id: "a5", name: "Zerodha",       type: "investment", icon: I.trending, color: "#A78BFA", balance: 326400, isPrimary: false },
];

const ASSETS = [
  { id: "as1", name: "Nifty 50 Index Fund", type: "mutual_fund", subType: "equity", invested: 50000, current: 67200, broker: "Zerodha Coin" },
  { id: "as2", name: "HDFC Flexi Cap",      type: "mutual_fund", subType: "equity", invested: 30000, current: 34800, broker: "Zerodha Coin" },
  { id: "as3", name: "TCS",                  type: "stocks",      subType: "equity", invested: 25000, current: 28950, broker: "Zerodha", units: 8 },
  { id: "as4", name: "INFY",                 type: "stocks",      subType: "equity", invested: 18000, current: 16400, broker: "Zerodha", units: 11 },
  { id: "as5", name: "SBI Fixed Deposit",    type: "fixed_deposit", subType: "debt", invested: 100000, current: 108200, interestRate: 6.8, maturityDate: "2026-12-01" },
  { id: "as6", name: "Sovereign Gold Bond",  type: "gold",        subType: "gold",   invested: 60000, current: 71400 },
  { id: "as7", name: "PPF Account",          type: "ppf",         subType: "debt",   invested: 150000, current: 162300 },
  { id: "as8", name: "Bitcoin",              type: "crypto",      subType: "other",  invested: 40000, current: 36100 },
];

const ASSET_TYPE_META = {
  stocks:        { label: "Stocks",        icon: I.chart,    color: "#818CF8" },
  mutual_fund:   { label: "Mutual Fund",   icon: I.trending, color: "#34D399" },
  fixed_deposit: { label: "Fixed Deposit", icon: I.bank,     color: "#60A5FA" },
  gold:          { label: "Gold",          icon: I.tag,      color: "#FBBF24" },
  ppf:           { label: "PPF",           icon: I.shield,   color: "#A78BFA" },
  nps:           { label: "NPS",           icon: I.building, color: "#22D3EE" },
  epf:           { label: "EPF",           icon: I.bank,     color: "#10B981" },
  crypto:        { label: "Crypto",        icon: I.bitcoin,  color: "#FB923C" },
  real_estate:   { label: "Real Estate",   icon: I.home,     color: "#F472B6" },
  other:         { label: "Other",         icon: I.package,  color: "#94A3B8" },
};

const SUBTYPE_COLORS = {
  equity: "#34D399",
  debt: "#60A5FA",
  gold: "#FBBF24",
  hybrid: "#A78BFA",
  real_estate: "#F472B6",
  other: "#94A3B8",
};

// ─── Transactions: ~3 weeks of realistic data
const TXNS = [
  { id: "t1",  type: "expense", title: "Blue Tokai Coffee",  amount: 285,   category: "Food",          accountId: "a2", date: "2026-05-09T09:12:00", notes: "Saturday morning" },
  { id: "t2",  type: "expense", title: "Uber to office",      amount: 142,   category: "Transport",     accountId: "a4", date: "2026-05-09T08:30:00" },
  { id: "t3",  type: "expense", title: "BigBasket weekly",    amount: 2840,  category: "Groceries",     accountId: "a1", date: "2026-05-09T19:45:00", notes: "Veg + dairy + cleaning" },
  { id: "t4",  type: "expense", title: "Spotify Premium",     amount: 119,   category: "Entertainment", accountId: "a2", date: "2026-05-08T11:00:00", isAutoDetected: true, smsSource: "HDFCBK" },
  { id: "t5",  type: "transfer", title: "To Zerodha",          amount: 15000, category: "Transfer",      accountId: "a1", fromAccountId: "a1", toAccountId: "a5", date: "2026-05-08T18:20:00" },
  { id: "t6",  type: "expense", title: "Swiggy — dinner",     amount: 412,   category: "Food",          accountId: "a4", date: "2026-05-07T20:35:00" },
  { id: "t7",  type: "expense", title: "Apollo Pharmacy",     amount: 680,   category: "Health",        accountId: "a1", date: "2026-05-07T17:14:00" },
  { id: "t8",  type: "income",  title: "Freelance — Acme Co", amount: 45000, category: "Freelance",     accountId: "a1", date: "2026-05-06T10:00:00", notes: "Invoice #2026-04" },
  { id: "t9",  type: "expense", title: "BMTC bus pass",       amount: 1100,  category: "Transport",     accountId: "a3", date: "2026-05-06T08:05:00" },
  { id: "t10", type: "expense", title: "Amazon — book",       amount: 549,   category: "Education",     accountId: "a2", date: "2026-05-05T22:18:00" },
  { id: "t11", type: "expense", title: "Airtel postpaid",     amount: 999,   category: "Bills",         accountId: "a1", date: "2026-05-05T09:00:00", isAutoDetected: true, smsSource: "AIRTEL" },
  { id: "t12", type: "expense", title: "Cult.fit monthly",    amount: 2499,  category: "Health",        accountId: "a2", date: "2026-05-04T07:00:00" },
  { id: "t13", type: "expense", title: "Petrol — Indian Oil", amount: 1800,  category: "Transport",     accountId: "a2", date: "2026-05-04T18:30:00" },
  { id: "t14", type: "income",  title: "Salary — May",        amount: 168000, category: "Salary",       accountId: "a1", date: "2026-05-01T10:00:00" },
  { id: "t15", type: "expense", title: "Rent — May",          amount: 38000, category: "Rent",          accountId: "a1", date: "2026-05-01T11:00:00" },
  { id: "t16", type: "expense", title: "Zomato — lunch",      amount: 320,   category: "Food",          accountId: "a4", date: "2026-04-30T13:42:00" },
  { id: "t17", type: "expense", title: "Myntra — t-shirt",    amount: 1299,  category: "Shopping",      accountId: "a2", date: "2026-04-29T21:10:00" },
  { id: "t18", type: "expense", title: "BESCOM electricity",  amount: 2150,  category: "Bills",         accountId: "a1", date: "2026-04-28T09:30:00" },
  { id: "t19", type: "expense", title: "PVR Cinemas",         amount: 850,   category: "Entertainment", accountId: "a4", date: "2026-04-27T19:00:00" },
  { id: "t20", type: "transfer", title: "To Cash",             amount: 3000,  category: "Transfer",      accountId: "a1", fromAccountId: "a1", toAccountId: "a3", date: "2026-04-26T14:00:00" },
  { id: "t21", type: "expense", title: "Domino's Pizza",      amount: 580,   category: "Food",          accountId: "a4", date: "2026-04-25T20:10:00" },
  { id: "t22", type: "expense", title: "BigBasket",           amount: 1620,  category: "Groceries",     accountId: "a1", date: "2026-04-24T18:00:00" },
];

const BUDGETS = [
  { categoryName: "Food",          limit: 6000,  spent: 1597 },
  { categoryName: "Groceries",     limit: 10000, spent: 4460 },
  { categoryName: "Transport",     limit: 5000,  spent: 3042 },
  { categoryName: "Shopping",      limit: 4000,  spent: 1299 },
  { categoryName: "Bills",         limit: 4000,  spent: 4149 },
  { categoryName: "Entertainment", limit: 2000,  spent: 1469 },
];

window.CATS = CATS;
window.EXPENSE_CATS = EXPENSE_CATS;
window.INCOME_CATS = INCOME_CATS;
window.ACCOUNTS = ACCOUNTS;
window.ASSETS = ASSETS;
window.ASSET_TYPE_META = ASSET_TYPE_META;
window.SUBTYPE_COLORS = SUBTYPE_COLORS;
window.TXNS = TXNS;
window.BUDGETS = BUDGETS;

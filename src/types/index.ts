// ─── User ────────────────────────────────────────────────────────────────────

export type User = {
  name: string;
  email: string;
  password: string;
};

// ─── Account ─────────────────────────────────────────────────────────────────

export type AccountType =
  | "savings"
  | "current"
  | "credit"
  | "wallet"
  | "cash"
  | "investment";

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  icon: string;       // emoji
  color: string;      // hex
  balance: number;
  isPrimary: boolean;
  bankName?: string;        // e.g. "HDFC", used for SMS matching
  lastFourDigits?: string;  // e.g. "4321", used for SMS matching
  createdAt: string;
};

// ─── Transaction ─────────────────────────────────────────────────────────────

export type TransactionType = "income" | "expense" | "transfer";

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: TransactionType;
  date: string;             // ISO string
  icon: string;             // emoji
  accountId: string;        // linked account
  fromAccountId?: string;   // for transfers
  toAccountId?: string;     // for transfers
  isAutoDetected?: boolean; // came from SMS parser
  smsSource?: string;       // bank name from SMS
};

// ─── Category ────────────────────────────────────────────────────────────────

export type CategoryType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  icon: string;       // emoji
  color: string;      // hex, used for charts
  type: CategoryType;
  isCustom: boolean;
};

// ─── Budget ──────────────────────────────────────────────────────────────────

export type Budget = {
  id: string;
  categoryName: string;
  limit: number;
  month: string;      // "YYYY-MM"
  createdAt: string;
};

// ─── Asset ───────────────────────────────────────────────────────────────────

export type AssetType =
  | "stocks"
  | "mutual_fund"
  | "fixed_deposit"
  | "gold"
  | "ppf"
  | "nps"
  | "epf"
  | "crypto"
  | "real_estate"
  | "other";

export type AssetSubType = "equity" | "debt" | "gold" | "hybrid" | "real_estate" | "other";

export type Asset = {
  id: string;
  name: string;
  type: AssetType;
  subType: AssetSubType;
  investedAmount: number;
  currentValue: number;
  units?: number;           // for MF / stocks
  buyPrice?: number;        // per unit
  currentPrice?: number;    // per unit (live or manual)
  maturityDate?: string;    // for FD, PPF
  interestRate?: number;    // for FD (annual %)
  broker?: string;          // e.g. "Zerodha", "Groww"
  folioNumber?: string;     // MF folio
  notes?: string;
  lastUpdated: string;      // ISO string
  createdAt: string;
};

// ─── SMS Draft ───────────────────────────────────────────────────────────────

export type SMSDraft = {
  id: string;
  rawSms: string;
  parsedAmount: number;
  parsedType: "income" | "expense";
  parsedBank: string;
  parsedLastFour?: string;
  parsedMerchant?: string;
  parsedDate: string;
  suggestedCategory?: string;
  suggestedIcon?: string;
  suggestedAccountId?: string;
  status: "pending" | "accepted" | "dismissed";
  createdAt: string;
};

import { SMSDraft } from "../../types";
import uuid from "react-native-uuid";

// ─── Bank sender patterns ─────────────────────────────────────────────────────
// Covers Indian scheduled banks, payment banks, and fintech wallets.
// The 6-character sender IDs used by TRAI follow the format: XX-BANKCD

const BANK_SENDER_PATTERNS: { bank: string; patterns: RegExp[] }[] = [
  // Private sector banks
  { bank: "HDFC",      patterns: [/HDFC/i] },
  { bank: "ICICI",     patterns: [/ICICI/i] },
  { bank: "Axis",      patterns: [/AXIS/i] },
  { bank: "Kotak",     patterns: [/KOTAK/i] },
  { bank: "IndusInd",  patterns: [/INDUS(B|IND)?/i] },
  { bank: "Yes",       patterns: [/YES(BNK|BANK)?/i] },
  { bank: "IDFC",      patterns: [/IDFC(BK|FRST)?/i] },
  { bank: "RBL",       patterns: [/RBLBNK|RBLBK|RBL/i] },
  { bank: "Federal",   patterns: [/FEDBNK|FEDERAL/i] },
  { bank: "DCB",       patterns: [/DCBBNK|DCBBAN/i] },
  { bank: "Bandhan",   patterns: [/BANDHN|BANDHAN/i] },
  { bank: "AU",        patterns: [/AUSFIN|AUSBNK/i] },
  { bank: "CSB",       patterns: [/CSBBNK/i] },
  { bank: "Lakshmi Vilas", patterns: [/LVBANK|LVSBNK/i] },
  // Public sector banks
  { bank: "SBI",       patterns: [/SBI(INB|PSG|SMS)?/i] },
  { bank: "PNB",       patterns: [/PNBSMS|PNBMOB|PNB/i] },
  { bank: "Canara",    patterns: [/CANBNK|CANBK|CANARA/i] },
  { bank: "BOB",       patterns: [/BOB(TXN|SMS)?/i] },
  { bank: "BOI",       patterns: [/BOISMS|BANKIN/i] },
  { bank: "IDBI",      patterns: [/IDBIBAN|IDBI/i] },
  { bank: "UBI",       patterns: [/UBISMS|UNIBAN/i] },
  { bank: "Central",   patterns: [/CENTBK|CENTRB/i] },
  { bank: "Indian",    patterns: [/INDBNK|INDBAN/i] },
  { bank: "IOB",       patterns: [/IOBCHN|IOBSMS/i] },
  { bank: "SIB",       patterns: [/SIBSMS|SIBBNK/i] },
  { bank: "UCO",       patterns: [/UCOBNK/i] },
  { bank: "Punjab & Sind", patterns: [/PSBSMS/i] },
  { bank: "Syndicate", patterns: [/SYNBNK/i] },
  { bank: "Vijaya",    patterns: [/VIJBNK/i] },
  // Payment banks & wallets
  { bank: "Paytm",     patterns: [/PAYTM|PYTMBN/i] },
  { bank: "Airtel",    patterns: [/AIRTEL|AIRBNK/i] },
  { bank: "Jio",       patterns: [/JIOBKN|JIOMNY/i] },
  { bank: "Amazon Pay",patterns: [/AMAZON|AMZPAY/i] },
  // UPI / fintech
  { bank: "GPay",      patterns: [/GPAY|GOOGPE/i] },
  { bank: "PhonePe",   patterns: [/PHNPE|PHONEP|PPEBNK/i] },
  { bank: "CRED",      patterns: [/CREDPAY|CRED/i] },
  { bank: "Slice",     patterns: [/SLICEP/i] },
  { bank: "Fi",        patterns: [/FIBANK|EPIFIN/i] },
  { bank: "Jupiter",   patterns: [/JUPBNK/i] },
];

// ─── Noise / false-positive filters ──────────────────────────────────────────
// These patterns indicate the SMS is NOT a transaction — reject early.

const NOISE_PATTERNS: RegExp[] = [
  // OTP / authentication
  /\botp\b/i,
  /\bone.?time.?password\b/i,
  /\bverification\s+code\b/i,
  /\bsecurity\s+code\b/i,
  /\bdo\s+not\s+share\b/i,
  // Promotional / marketing (specific phrases, not just "offer")
  /\bcashback\s+upto\b/i,
  /\bget\s+(?:upto|up\s+to)\b/i,
  /\bwin\s+(?:up\s+to|upto|big|prizes?)\b/i,
  /\blucky\s+draw\b/i,
  /\bexclusive\s+(?:offer|deal|discount)\b/i,
  /\bclick\s+(?:here|now)\s+to\b/i,
  /\bvalid\s+(?:till|until|for)\b/i,
  /\buse\s+code\s+[A-Z0-9]{3,}/i,
  // Loan solicitation (not a transaction)
  /\bpre-?approved\s+loan\b/i,
  /\binstant\s+loan\b/i,
  /\bpersonal\s+loan\s+offer\b/i,
  // Generic alerts without a clear debit/credit
  /\bminimum\s+due\b/i,
  /\bpayment\s+due\s+date\b/i,
  /\bstatement\s+(is\s+)?ready\b/i,
];

// ─── Amount extraction ────────────────────────────────────────────────────────
// Ordered from most specific → least specific to reduce false captures.

const AMOUNT_PATTERNS = [
  // "INR 1,500.00" / "Rs.500" / "₹ 500"
  /(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
  // "1,500.00 INR" / "500 Rs"
  /([\d,]+(?:\.\d{1,2})?)\s*(?:INR|Rs\.?|₹)/i,
  // "debited by 500" / "credited with 1500" / "paid 250"
  /(?:debited(?:\s+by|\s+for|\s+with)?|credited(?:\s+with)?|paid|transferred|sent|received|withdrawn)\s+(?:of\s+|with\s+|for\s+|by\s+|an?\s+amount\s+of\s+)?([\d,]+(?:\.\d{1,2})?)/i,
  // "amount of 1500" / "amount: 500"
  /amount\s*(?:of|:)\s*([\d,]+(?:\.\d{1,2})?)/i,
];

function extractAmount(sms: string): number | null {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = sms.match(pattern);
    if (match?.[1]) {
      const raw = match[1].replace(/,/g, "");
      const amount = parseFloat(raw);
      if (!isNaN(amount) && amount > 0 && amount < 10_000_000) return amount;
    }
  }
  return null;
}

// ─── Transaction type ─────────────────────────────────────────────────────────

const DEBIT_KEYWORDS = [
  /\bdebited\b/i,
  /\bdebit\b/i,
  /\bwithdrawn\b/i,
  /\bwithdraw\b/i,
  /\bpaid\b/i,
  /\bpayment\s+of\b/i,
  /\bpurchase\b/i,
  /\bspent\b/i,
  /\bcharged\b/i,
  /\bsent\b/i,
  /\btransferred\b/i,
  /\btransfer\b/i,
  /\bremitted\b/i,
  /\bemis?\s+due\b/i,
  /\bemi\s+paid\b/i,
  /\bused\s+at\b/i,           // credit card: "was used at"
  /\batm\s+withdrawal\b/i,
];

const CREDIT_KEYWORDS = [
  /\bcredited\b/i,
  /\bcredit\b/i,
  /\breceived\b/i,
  /\brefund\b/i,
  /\bdeposited\b/i,
  /\btransfer(?:red)?\s+(?:to\s+your|in(?:to)?)\b/i,
  /\bmoney\s+added\b/i,
  /\bsalary\b/i,
  /\bpayroll\b/i,
  /\binterest\s+(?:paid|credited)\b/i,
  /\breversal\b/i,
  /\bcashback\s+(?:of|credited|added)\b/i,
  /\bcheque\s+(?:deposit|collection)\b/i,
  /\bdd\s+(?:deposit|collection)\b/i,
];

function extractType(sms: string): "income" | "expense" | null {
  for (const p of DEBIT_KEYWORDS) {
    if (p.test(sms)) return "expense";
  }
  for (const p of CREDIT_KEYWORDS) {
    if (p.test(sms)) return "income";
  }
  return null;
}

// Pre-computed merged array so isBankSMS doesn't allocate on every call
const DIRECTION_KEYWORDS = [...DEBIT_KEYWORDS, ...CREDIT_KEYWORDS];

// ─── Last four digits ─────────────────────────────────────────────────────────

const LAST_FOUR_PATTERNS = [
  /[Aa]\/?[Cc][\s.]*(?:no\.?|XX+|x+)[\s]*(\d{4})\b/i,      // A/c no. XX1234
  /(?:card|a\/c|account|acct)[:\s\-]*[Xx*•]{0,8}(\d{4})\b/i, // Card: XXXX1234
  /[Xx*•]{2,}(\d{4})\b/,                                     // ****1234 / XX1234
  /ending[:\s]+(\d{4})\b/i,                                  // ending 1234
  /ending\s+in\s+(\d{4})\b/i,                                // ending in 1234
  /last\s+(?:4\s+)?digits?[:\s]+(\d{4})\b/i,                 // last 4 digits: 1234
];

function extractLastFour(sms: string): string | undefined {
  for (const p of LAST_FOUR_PATTERNS) {
    const m = sms.match(p);
    if (m?.[1]) return m[1];
  }
  return undefined;
}

// ─── Merchant name ────────────────────────────────────────────────────────────
// Strategy: try progressively broader patterns; stop at first quality match.

// UPI VPA extraction — "to merchant@upi", "to raj@okaxis"
const UPI_VPA_PATTERN = /(?:to|@)\s+([a-zA-Z0-9._+-]{2,30}@[a-zA-Z0-9]+)/i;

const MERCHANT_PATTERNS = [
  // "paid to Merchant Name on" / "payment to Merchant"
  /(?:paid\s+to|payment\s+to|transferred\s+to)\s+([A-Za-z0-9][A-Za-z0-9\s\-&'.,]{1,35})(?:\.|,|\s+on\b|\s+via\b|\s+ref\b|\s+\d)/i,
  // "at Merchant Name on" / "at Amazon.IN on"
  /\bat\s+([A-Za-z0-9][A-Za-z0-9\s\-&'.]{1,35})(?:\.|,|\s+on\b|\s+via\b|\s+ref\b|\s+\d)/i,
  // "to Merchant Name." / "to Merchant Name,"
  /\bto\s+([A-Za-z][A-Za-z0-9\s\-&'.]{2,35})(?:\.|,|\s+on\b|\s+via\b|\s+ref\b)/i,
  // "purchase at/from MerchantName"
  /(?:purchase\s+at|purchase\s+from|bought\s+at)\s+([A-Za-z0-9][A-Za-z0-9\s\-&'.]{1,35})/i,
];

function extractMerchant(sms: string): string | undefined {
  // Prefer UPI VPA — gives exact payee
  const vpa = sms.match(UPI_VPA_PATTERN);
  if (vpa?.[1]) {
    // Strip @suffix for display: "merchant@upi" → "merchant"
    const handle = vpa[1].split("@")[0];
    if (handle.length >= 2) return handle;
  }

  for (const p of MERCHANT_PATTERNS) {
    const m = sms.match(p);
    if (m?.[1]) {
      const name = m[1].trim().replace(/\s{2,}/g, " ");
      if (name.length >= 2 && name.length <= 45) return name;
    }
  }
  return undefined;
}

// ─── Bank detection ───────────────────────────────────────────────────────────

export function detectBank(sender: string, sms: string): string {
  const text = `${sender} ${sms}`;
  for (const { bank, patterns } of BANK_SENDER_PATTERNS) {
    if (patterns.some((p) => p.test(text))) return bank;
  }
  return "Bank";
}

// ─── isBankSMS — gate for fetching ───────────────────────────────────────────

export function isBankSMS(sender: string, sms: string): boolean {
  // Hard reject noise early
  for (const noise of NOISE_PATTERNS) {
    if (noise.test(sms)) return false;
  }

  const text = `${sender} ${sms}`;
  const hasBank = BANK_SENDER_PATTERNS.some(({ patterns }) =>
    patterns.some((p) => p.test(text))
  );
  if (!hasBank) return false;

  const hasAmount = AMOUNT_PATTERNS.some((p) => p.test(sms));
  if (!hasAmount) return false;

  // Must have a recognisable transaction direction keyword so we don't
  // parse balance enquiry / limit SMS / OTP-with-amount as transactions.
  const hasDirection = DIRECTION_KEYWORDS.some((p) => p.test(sms));

  return hasDirection;
}

// ─── Category suggestion ──────────────────────────────────────────────────────
// Runs on the full raw SMS body for maximum coverage (merchant alone is often null).

export type SuggestedCategory =
  | "Food & Dining"
  | "Transport"
  | "Shopping"
  | "Entertainment"
  | "Healthcare"
  | "Utilities"
  | "Investments"
  | "Education"
  | "Travel"
  | "Insurance"
  | "Rent & Housing"
  | "Salary"
  | "Refund"
  | "Transfer"
  | "Others";

const CATEGORY_RULES: { category: SuggestedCategory; pattern: RegExp }[] = [
  // Food
  { category: "Food & Dining",   pattern: /swiggy|zomato|domino|pizza|mcdonald|burger|kfc|starbucks|cafe|restaurant|food|bigbasket|blinkit|zepto|dunzo|grofer/i },
  // Transport
  { category: "Transport",       pattern: /uber|ola|rapido|taxi|metro|dmrc|bmtc|ksrtc|irctc|railway|petrol|fuel|indian\s*oil|hp\s*petrol|bharat\s*petrol|bp\s*gas|fastag|toll/i },
  // Travel
  { category: "Travel",          pattern: /makemytrip|goibibo|yatra|cleartrip|ixigo|airbnb|booking\.com|hotel|flight|airlines|air\s*india|indigo|spicejet/i },
  // Shopping
  { category: "Shopping",        pattern: /amazon|flipkart|myntra|meesho|snapdeal|ajio|nykaa|tatacliq|reliance|dmart|bigbazar|shoppers.stop/i },
  // Entertainment
  { category: "Entertainment",   pattern: /netflix|hotstar|prime\s*video|sonyliv|zee5|jiocinema|spotify|gaana|wynk|youtube\s*premium|bookmyshow|inox|pvr/i },
  // Healthcare
  { category: "Healthcare",      pattern: /hospital|pharmacy|medical|clinic|practo|1mg|netmeds|apollo|fortis|manipal|apollo pharmacy/i },
  // Utilities
  { category: "Utilities",       pattern: /electricity|power\s*bill|water\s*bill|gas\s*bill|airtel|jio|vi\b|vodafone|bsnl|mtnl|recharge|broadband|internet|dth|tata\s*sky|dish\s*tv/i },
  // Investments
  { category: "Investments",     pattern: /zerodha|groww|upstox|kuvera|paytm\s*money|mutual\s*fund|sip|demat|nse|bse|ipo|nps|ppf/i },
  // Education
  { category: "Education",       pattern: /byju|unacademy|vedantu|coursera|udemy|college|school|university|tuition|exam\s*fee|admission\s*fee/i },
  // Insurance
  { category: "Insurance",       pattern: /insurance|lic\b|policy|premium\s*paid|term\s*plan|health\s*plan/i },
  // Rent / Housing
  { category: "Rent & Housing",  pattern: /rent|maintenance|society|housing\s*board|property\s*tax|emi\s+(?:for|of)|home\s*loan/i },
  // Salary / income
  { category: "Salary",          pattern: /salary|payroll|wages/i },
  // Refund
  { category: "Refund",          pattern: /refund|reversal|cashback\s+(?:of|credited)/i },
  // Transfer (own accounts, UPI generic)
  { category: "Transfer",        pattern: /neft|rtgs|imps|upi|transfer\s+(?:to|from)|moved\s+to/i },
];

export function suggestCategory(
  sms: string,
  merchant: string | undefined,
  type: "income" | "expense"
): { category: SuggestedCategory; icon: string } {
  if (type === "income") {
    if (/salary|payroll/i.test(sms)) return { category: "Salary",  icon: "💼" };
    if (/refund|reversal/i.test(sms))return { category: "Refund",  icon: "↩️" };
    return { category: "Others", icon: "💰" };
  }

  const haystack = `${sms} ${merchant ?? ""}`;
  for (const { category, pattern } of CATEGORY_RULES) {
    if (pattern.test(haystack)) {
      return { category, icon: CATEGORY_ICON[category] };
    }
  }
  return { category: "Others", icon: "💸" };
}

const CATEGORY_ICON: Record<SuggestedCategory, string> = {
  "Food & Dining":   "🍔",
  "Transport":       "🚗",
  "Shopping":        "🛍️",
  "Entertainment":   "🎬",
  "Healthcare":      "💊",
  "Utilities":       "⚡",
  "Investments":     "📈",
  "Education":       "📚",
  "Travel":          "✈️",
  "Insurance":       "🛡️",
  "Rent & Housing":  "🏠",
  "Salary":          "💼",
  "Refund":          "↩️",
  "Transfer":        "↔️",
  "Others":          "💸",
};

// ─── Main parser ──────────────────────────────────────────────────────────────

export function parseSMS(
  sms: string,
  sender: string = "",
  date?: string
): SMSDraft | null {
  const amount = extractAmount(sms);
  if (!amount) return null;

  const type = extractType(sms);
  if (!type) return null;

  const merchant = extractMerchant(sms);
  const { category, icon } = suggestCategory(sms, merchant, type);

  return {
    id: uuid.v4() as string,
    rawSms: sms,
    parsedAmount: amount,
    parsedType: type,
    parsedBank: detectBank(sender, sms),
    parsedLastFour: extractLastFour(sms),
    parsedMerchant: merchant,
    parsedDate: date ?? new Date().toISOString(),
    suggestedCategory: category,
    suggestedIcon: icon,
    suggestedAccountId: undefined,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

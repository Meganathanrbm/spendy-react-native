import { SMSDraft } from "../../types";
import uuid from "react-native-uuid";

// ─── Bank sender patterns ─────────────────────────────────────────────────────

const BANK_SENDER_PATTERNS: { bank: string; patterns: RegExp[] }[] = [
  { bank: "HDFC",     patterns: [/HDFC/i, /HDFCBK/i] },
  { bank: "SBI",      patterns: [/SBI/i, /SBIINB/i, /SBIPSG/i] },
  { bank: "ICICI",    patterns: [/ICICI/i, /ICICIB/i] },
  { bank: "Axis",     patterns: [/AXISBK/i, /AXISBN/i, /AXIS/i] },
  { bank: "Kotak",    patterns: [/KOTAK/i, /KOTAKB/i] },
  { bank: "IndusInd", patterns: [/INDUSB/i, /INDUSIND/i] },
  { bank: "Yes",      patterns: [/YESBNK/i, /YESBANK/i] },
  { bank: "IDBI",     patterns: [/IDBI/i] },
  { bank: "PNB",      patterns: [/PNBSMS/i, /PNB/i] },
  { bank: "Canara",   patterns: [/CANARA/i] },
  { bank: "BOB",      patterns: [/BOBTXN/i, /BOB/i] },
  { bank: "UBI",      patterns: [/UBISMS/i] },
  { bank: "Paytm",    patterns: [/PAYTM/i, /PYTMBN/i] },
  { bank: "Amazon",   patterns: [/AMAZON/i, /AMZPAY/i] },
  { bank: "Gpay",     patterns: [/GPAY/i, /GOOGPE/i] },
  { bank: "PhonePe",  patterns: [/PHNPE/i, /PHONEP/i] },
];

// ─── Amount extraction ────────────────────────────────────────────────────────

const AMOUNT_PATTERNS = [
  /(?:INR|Rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
  /([\d,]+(?:\.\d{1,2})?)\s*(?:INR|Rs\.?|₹)/i,
  /(?:debited|credited|paid|received)[^\d]*([\d,]+(?:\.\d{1,2})?)/i,
];

function extractAmount(sms: string): number | null {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = sms.match(pattern);
    if (match) {
      const raw = match[1].replace(/,/g, "");
      const amount = parseFloat(raw);
      if (!isNaN(amount) && amount > 0) return amount;
    }
  }
  return null;
}

// ─── Transaction type ─────────────────────────────────────────────────────────

const DEBIT_KEYWORDS = [
  /\bdebited\b/i,
  /\bdebit\b/i,
  /\bwithdrawn\b/i,
  /\bpaid\b/i,
  /\bpayment of\b/i,
  /\bpurchase\b/i,
  /\bspent\b/i,
  /\bcharged\b/i,
];

const CREDIT_KEYWORDS = [
  /\bcredited\b/i,
  /\bcredit\b/i,
  /\breceived\b/i,
  /\brefund\b/i,
  /\bdeposited\b/i,
  /\btransfer.*received\b/i,
  /\bmoney added\b/i,
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

// ─── Last 4 digits ────────────────────────────────────────────────────────────

const LAST_FOUR_PATTERNS = [
  /[Aa]\/?[Cc][\s.]*(?:no\.?|XX+|x+)[\s]*(\d{4})/i,
  /(?:card|a\/c|account|acct)[^\d]*(\d{4})\b/i,
  /[Xx]{2,}(\d{4})/i,
  /ending\s+(\d{4})/i,
];

function extractLastFour(sms: string): string | undefined {
  for (const p of LAST_FOUR_PATTERNS) {
    const m = sms.match(p);
    if (m) return m[1];
  }
  return undefined;
}

// ─── Merchant name ────────────────────────────────────────────────────────────

const MERCHANT_PATTERNS = [
  /(?:to|at|@)\s+([A-Z][A-Za-z0-9\s\-&'.]{2,30})(?:\.|,|\s+on|\s+via|\s+\d)/,
  /(?:paid to|payment to)\s+([A-Z][A-Za-z0-9\s\-&'.]{2,30})/i,
  /(?:purchase at|bought at)\s+([A-Z][A-Za-z0-9\s\-&'.]{2,30})/i,
];

function extractMerchant(sms: string): string | undefined {
  for (const p of MERCHANT_PATTERNS) {
    const m = sms.match(p);
    if (m) {
      const name = m[1].trim();
      if (name.length >= 2 && name.length <= 40) return name;
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

export function isBankSMS(sender: string, sms: string): boolean {
  const text = `${sender} ${sms}`;
  const hasBank = BANK_SENDER_PATTERNS.some(({ patterns }) =>
    patterns.some((p) => p.test(text))
  );
  const hasAmount = AMOUNT_PATTERNS.some((p) => p.test(sms));
  return hasBank && hasAmount;
}

// ─── Main parser ─────────────────────────────────────────────────────────────

export function parseSMS(
  sms: string,
  sender: string = "",
  date?: string
): SMSDraft | null {
  const amount = extractAmount(sms);
  if (!amount) return null;

  const type = extractType(sms);
  if (!type) return null;

  return {
    id: uuid.v4() as string,
    rawSms: sms,
    parsedAmount: amount,
    parsedType: type,
    parsedBank: detectBank(sender, sms),
    parsedLastFour: extractLastFour(sms),
    parsedMerchant: extractMerchant(sms),
    parsedDate: date ?? new Date().toISOString(),
    suggestedAccountId: undefined,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

import { AccountType, SMSDraft } from "../../types";

export type AccountCandidate = {
  key: string;
  bankName: string;
  lastFourDigits?: string;
  suggestedName: string;
  suggestedType: AccountType;
  transactionCount: number;
};

const WALLET_BANKS = new Set([
  "Paytm", "PhonePe", "GPay", "Amazon Pay", "Airtel", "Jio", "CRED", "Slice",
]);

export function detectAccountCandidates(drafts: SMSDraft[]): AccountCandidate[] {
  const groups = new Map<string, {
    bankName: string;
    lastFourDigits?: string;
    drafts: SMSDraft[];
  }>();

  for (const draft of drafts) {
    const bank = draft.parsedBank || "Bank";
    const last4 = draft.parsedLastFour;
    const key = `${bank}_${last4 ?? "unknown"}`;

    if (!groups.has(key)) {
      groups.set(key, { bankName: bank, lastFourDigits: last4, drafts: [] });
    }
    groups.get(key)!.drafts.push(draft);
  }

  const candidates: AccountCandidate[] = [];

  for (const [key, group] of groups.entries()) {
    const { bankName, lastFourDigits, drafts: groupDrafts } = group;

    let suggestedType: AccountType = "savings";
    if (WALLET_BANKS.has(bankName)) {
      suggestedType = "wallet";
    } else if (groupDrafts.some((d) => /credit\s*card/i.test(d.rawSms))) {
      suggestedType = "credit";
    }

    const suggestedName = lastFourDigits
      ? `${bankName} ••••${lastFourDigits}`
      : bankName;

    candidates.push({
      key,
      bankName,
      lastFourDigits,
      suggestedName,
      suggestedType,
      transactionCount: groupDrafts.length,
    });
  }

  return candidates.sort((a, b) => b.transactionCount - a.transactionCount);
}

import { Transaction, Account, Budget, Asset, Category, TransactionType } from "../../types";
import uuid from "react-native-uuid";
import { getIcon } from "./categories";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SpendyBackup = {
  version: string;
  exportedAt: string;
  userId: string;
  data: {
    transactions: Transaction[];
    accounts: Account[];
    budgets: Budget[];
    assets: Asset[];
    customCategories: Category[];
  };
};

export type CSVParseResult = {
  transactions: Transaction[];
  newAccounts: Account[];
  failedRows: number;
};

// ─── Date formatting ──────────────────────────────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDateToCSV(isoString: string): string {
  const d = new Date(isoString);
  const month = MONTHS[d.getMonth()];
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
}

function parseDateFromCSV(dateStr: string): string {
  const cleaned = dateStr.trim();
  const match = cleaned.match(/^(\w{3})\s+(\d{1,2}),\s*(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return new Date().toISOString();
  const [, mon, dayStr, yearStr, hourStr, minStr, ampm] = match;
  const monthIndex = MONTHS.findIndex(m => m.toLowerCase() === mon.toLowerCase());
  if (monthIndex === -1) return new Date().toISOString();
  let hour = parseInt(hourStr, 10);
  if (ampm.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;
  return new Date(parseInt(yearStr), monthIndex, parseInt(dayStr), hour, parseInt(minStr)).toISOString();
}

// ─── CSV field quoting (RFC 4180) ─────────────────────────────────────────────

function quoteField(val: string): string {
  const s = String(val ?? "");
  return '"' + s.replace(/"/g, '""') + '"';
}

// ─── RFC 4180 CSV Parser ──────────────────────────────────────────────────────

export function parseCSV(raw: string): string[][] {
  // Normalize line endings
  const content = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let i = 0;
  const len = content.length;

  while (i < len) {
    const row: string[] = [];

    while (i < len) {
      if (content[i] === '"') {
        // Quoted field
        i++;
        let field = "";
        while (i < len) {
          if (content[i] === '"') {
            if (i + 1 < len && content[i + 1] === '"') {
              field += '"';
              i += 2;
            } else {
              i++; // closing quote
              break;
            }
          } else {
            field += content[i++];
          }
        }
        row.push(field);
        if (i < len && content[i] === ',') i++;
        else break; // end of row (newline or EOF)
      } else {
        // Unquoted field
        let field = "";
        while (i < len && content[i] !== ',' && content[i] !== '\n') {
          field += content[i++];
        }
        row.push(field.trim());
        if (i < len && content[i] === ',') i++;
        else break;
      }
    }

    // consume newline
    if (i < len && content[i] === '\n') i++;

    if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

// ─── Type mapping ─────────────────────────────────────────────────────────────

function csvTypeToInternal(s: string): TransactionType | null {
  const t = s.trim();
  if (t === "(-) Expense") return "expense";
  if (t === "(+) Income") return "income";
  if (t === "(*) Transfer") return "transfer";
  return null;
}

function internalTypeToCSV(type: TransactionType): string {
  if (type === "expense") return "(-) Expense";
  if (type === "income") return "(+) Income";
  return "(*) Transfer";
}

// ─── Export: Transactions → CSV ───────────────────────────────────────────────

export function transactionsToCSV(transactions: Transaction[], accounts: Account[]): string {
  const accountMap = new Map<string, string>();
  for (const acc of accounts) accountMap.set(acc.id, acc.name);

  const header = `"TIME","TYPE","AMOUNT","CATEGORY","ACCOUNT","NOTES"`;

  const rows = [...transactions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((tx) => {
      let category: string;
      let account: string;

      if (tx.type === "transfer") {
        category = "  -  ";
        const from = accountMap.get(tx.fromAccountId ?? tx.accountId) ?? "Unknown";
        const to = accountMap.get(tx.toAccountId ?? tx.accountId) ?? "Unknown";
        account = `${from}->${to}`;
      } else {
        category = tx.category || "Other";
        account = accountMap.get(tx.accountId) ?? "Unknown";
      }

      return [
        quoteField(formatDateToCSV(tx.date)),
        quoteField(internalTypeToCSV(tx.type)),
        quoteField(tx.amount.toFixed(2)),
        quoteField(category),
        quoteField(account),
        quoteField(tx.title ?? ""),
      ].join(",");
    });

  return [header, ...rows].join("\n");
}

// ─── Export: Full JSON backup ─────────────────────────────────────────────────

export function exportToJSON(backup: SpendyBackup): string {
  return JSON.stringify(backup, null, 2);
}

// ─── Import: CSV → Transactions ───────────────────────────────────────────────

function resolveOrCreateAccount(
  name: string,
  byName: Map<string, Account>,
  newMap: Map<string, Account>,
): string {
  const key = name.toLowerCase().trim();
  const existing = byName.get(key) ?? newMap.get(key);
  if (existing) return existing.id;

  const acc: Account = {
    id: String(uuid.v4()),
    name: name.trim(),
    type: "cash",
    icon: "wallet",
    color: "#64748B",
    balance: 0,
    isPrimary: false,
    createdAt: new Date().toISOString(),
  };
  newMap.set(key, acc);
  byName.set(key, acc);
  return acc.id;
}

export function parseCSVToTransactions(
  csv: string,
  existingAccounts: Account[],
): CSVParseResult {
  const rows = parseCSV(csv);
  if (rows.length === 0) return { transactions: [], newAccounts: [], failedRows: 0 };

  // Skip header row if present
  const isHeader = rows[0][0]?.toUpperCase().trim() === "TIME";
  const dataRows = isHeader ? rows.slice(1) : rows;

  const byName = new Map<string, Account>();
  for (const acc of existingAccounts) byName.set(acc.name.toLowerCase().trim(), acc);

  const newMap = new Map<string, Account>();
  const transactions: Transaction[] = [];
  let failedRows = 0;

  for (const row of dataRows) {
    if (row.length < 5) { failedRows++; continue; }

    const [time, typeStr, amountStr, category, accountField, notes = ""] = row;

    const type = csvTypeToInternal(typeStr);
    if (!type) { failedRows++; continue; }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount < 0) { failedRows++; continue; }

    const date = parseDateFromCSV(time);
    const catName = (category.trim() === "  -  " || category.trim() === "") ? "Other" : category.trim();

    let accountId: string;
    let fromAccountId: string | undefined;
    let toAccountId: string | undefined;

    if (type === "transfer") {
      const arrowIdx = accountField.indexOf("->");
      if (arrowIdx === -1) { failedRows++; continue; }
      const fromName = accountField.slice(0, arrowIdx).trim();
      const toName = accountField.slice(arrowIdx + 2).trim();
      fromAccountId = resolveOrCreateAccount(fromName, byName, newMap);
      toAccountId = resolveOrCreateAccount(toName, byName, newMap);
      accountId = fromAccountId;
    } else {
      accountId = resolveOrCreateAccount(accountField.trim(), byName, newMap);
    }

    transactions.push({
      id: String(uuid.v4()),
      title: notes.trim() || catName,
      amount,
      category: catName,
      type,
      date,
      icon: getIcon(catName),
      accountId,
      ...(fromAccountId && { fromAccountId }),
      ...(toAccountId && { toAccountId }),
    });
  }

  return {
    transactions,
    newAccounts: Array.from(newMap.values()),
    failedRows,
  };
}

// ─── Import: JSON backup ──────────────────────────────────────────────────────

export function parseJSONBackup(json: string): SpendyBackup | null {
  try {
    const parsed = JSON.parse(json);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.version !== "string" ||
      !parsed.data ||
      !Array.isArray(parsed.data.transactions)
    ) return null;
    return parsed as SpendyBackup;
  } catch {
    return null;
  }
}

// ─── Balance recalculation ────────────────────────────────────────────────────

export function recalculateBalances(
  transactions: Transaction[],
  accounts: Account[],
): Account[] {
  const balances = new Map<string, number>();
  for (const acc of accounts) balances.set(acc.id, 0);

  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  for (const tx of sorted) {
    if (tx.type === "income") {
      balances.set(tx.accountId, (balances.get(tx.accountId) ?? 0) + tx.amount);
    } else if (tx.type === "expense") {
      balances.set(tx.accountId, (balances.get(tx.accountId) ?? 0) - tx.amount);
    } else if (tx.type === "transfer") {
      const fromId = tx.fromAccountId ?? tx.accountId;
      const toId = tx.toAccountId ?? tx.accountId;
      balances.set(fromId, (balances.get(fromId) ?? 0) - tx.amount);
      balances.set(toId, (balances.get(toId) ?? 0) + tx.amount);
    }
  }

  return accounts.map((acc) => ({
    ...acc,
    balance: balances.get(acc.id) ?? acc.balance,
  }));
}

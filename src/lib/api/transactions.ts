import AsyncStorage from "@react-native-async-storage/async-storage";
import { Transaction } from "../../types";
import { updateAccountBalance } from "./accounts";

const KEY = "@spendy_transactions";

export const fetchTransactions = async (): Promise<Transaction[]> => {
  const json = await AsyncStorage.getItem(KEY);
  const data: Transaction[] = json ? JSON.parse(json) : [];
  return data.reverse(); // newest first
};

export const saveTransaction = async (tx: Transaction): Promise<void> => {
  const json = await AsyncStorage.getItem(KEY);
  const data: Transaction[] = json ? JSON.parse(json) : [];
  data.push(tx);
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
  // Update account balance
  if (tx.type === "income") {
    await updateAccountBalance(tx.accountId, tx.amount);
  } else if (tx.type === "expense") {
    await updateAccountBalance(tx.accountId, -tx.amount);
  } else if (tx.type === "transfer") {
    if (tx.fromAccountId) await updateAccountBalance(tx.fromAccountId, -tx.amount);
    if (tx.toAccountId) await updateAccountBalance(tx.toAccountId, tx.amount);
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const json = await AsyncStorage.getItem(KEY);
  const data: Transaction[] = json ? JSON.parse(json) : [];
  const tx = data.find((t) => t.id === id);
  await AsyncStorage.setItem(KEY, JSON.stringify(data.filter((t) => t.id !== id)));
  // Reverse the balance effect
  if (tx) {
    if (tx.type === "income") {
      await updateAccountBalance(tx.accountId, -tx.amount);
    } else if (tx.type === "expense") {
      await updateAccountBalance(tx.accountId, tx.amount);
    } else if (tx.type === "transfer") {
      if (tx.fromAccountId) await updateAccountBalance(tx.fromAccountId, tx.amount);
      if (tx.toAccountId) await updateAccountBalance(tx.toAccountId, -tx.amount);
    }
  }
};

export const clearAllTransactions = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEY);
};

export const fetchTransactionsByMonth = async (month: string): Promise<Transaction[]> => {
  const all = await fetchTransactions();
  return all.filter((t) => t.date.startsWith(month));
};

export const fetchTransactionsByPeriod = async (days: number): Promise<Transaction[]> => {
  const all = await fetchTransactions();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return all.filter((t) => new Date(t.date) >= cutoff);
};

export const groupTransactionsByDate = (
  transactions: Transaction[]
): { date: string; items: Transaction[] }[] => {
  const map = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const day = tx.date.slice(0, 10);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(tx);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a)) // newest date first
    .map(([date, items]) => ({
      date,
      items: [...items].sort((a, b) => b.date.localeCompare(a.date)), // newest first within day
    }));
};

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Transaction } from "../../types";
import { updateAccountBalance } from "./accounts";

const storageKey = (email: string) => `@spendy_transactions_${email}`;

export const fetchTransactions = async (email: string): Promise<Transaction[]> => {
  const json = await AsyncStorage.getItem(storageKey(email));
  const data: Transaction[] = json ? JSON.parse(json) : [];
  return data.reverse();
};

export const saveTransaction = async (email: string, tx: Transaction): Promise<void> => {
  const key = storageKey(email);
  const json = await AsyncStorage.getItem(key);
  const data: Transaction[] = json ? JSON.parse(json) : [];
  data.push(tx);
  await AsyncStorage.setItem(key, JSON.stringify(data));
  if (tx.type === "income") {
    await updateAccountBalance(email, tx.accountId, tx.amount);
  } else if (tx.type === "expense") {
    await updateAccountBalance(email, tx.accountId, -tx.amount);
  } else if (tx.type === "transfer") {
    if (tx.fromAccountId) await updateAccountBalance(email, tx.fromAccountId, -tx.amount);
    if (tx.toAccountId) await updateAccountBalance(email, tx.toAccountId, tx.amount);
  }
};

export const deleteTransaction = async (email: string, id: string): Promise<void> => {
  const key = storageKey(email);
  const json = await AsyncStorage.getItem(key);
  const data: Transaction[] = json ? JSON.parse(json) : [];
  const tx = data.find((t) => t.id === id);
  await AsyncStorage.setItem(key, JSON.stringify(data.filter((t) => t.id !== id)));
  if (tx) {
    if (tx.type === "income") {
      await updateAccountBalance(email, tx.accountId, -tx.amount);
    } else if (tx.type === "expense") {
      await updateAccountBalance(email, tx.accountId, tx.amount);
    } else if (tx.type === "transfer") {
      if (tx.fromAccountId) await updateAccountBalance(email, tx.fromAccountId, tx.amount);
      if (tx.toAccountId) await updateAccountBalance(email, tx.toAccountId, -tx.amount);
    }
  }
};

export const updateTransaction = async (
  email: string,
  updated: Transaction,
  original: Transaction,
): Promise<void> => {
  const key = storageKey(email);
  const json = await AsyncStorage.getItem(key);
  const data: Transaction[] = json ? JSON.parse(json) : [];
  const idx = data.findIndex((t) => t.id === updated.id);
  if (idx === -1) throw new Error("Transaction not found");
  data[idx] = updated;
  await AsyncStorage.setItem(key, JSON.stringify(data));
  // Reverse original balance effect
  if (original.type === "income") {
    await updateAccountBalance(email, original.accountId, -original.amount);
  } else if (original.type === "expense") {
    await updateAccountBalance(email, original.accountId, original.amount);
  } else if (original.type === "transfer") {
    if (original.fromAccountId) await updateAccountBalance(email, original.fromAccountId, original.amount);
    if (original.toAccountId) await updateAccountBalance(email, original.toAccountId, -original.amount);
  }
  // Apply updated balance effect
  if (updated.type === "income") {
    await updateAccountBalance(email, updated.accountId, updated.amount);
  } else if (updated.type === "expense") {
    await updateAccountBalance(email, updated.accountId, -updated.amount);
  } else if (updated.type === "transfer") {
    if (updated.fromAccountId) await updateAccountBalance(email, updated.fromAccountId, -updated.amount);
    if (updated.toAccountId) await updateAccountBalance(email, updated.toAccountId, updated.amount);
  }
};

export const clearAllTransactions = async (email: string): Promise<void> => {
  await AsyncStorage.removeItem(storageKey(email));
};

export const fetchTransactionsByMonth = async (
  email: string,
  month: string,
): Promise<Transaction[]> => {
  const all = await fetchTransactions(email);
  return all.filter((t) => t.date.startsWith(month));
};

export const fetchTransactionsByPeriod = async (
  email: string,
  days: number,
): Promise<Transaction[]> => {
  const all = await fetchTransactions(email);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return all.filter((t) => new Date(t.date) >= cutoff);
};

export const groupTransactionsByDate = (
  transactions: Transaction[],
): { date: string; items: Transaction[] }[] => {
  const map = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const day = tx.date.slice(0, 10);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(tx);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      items: [...items].sort((a, b) => b.date.localeCompare(a.date)),
    }));
};

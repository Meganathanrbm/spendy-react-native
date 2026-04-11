import AsyncStorage from "@react-native-async-storage/async-storage";
import { Transaction } from "../../types";

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
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const json = await AsyncStorage.getItem(KEY);
  const data: Transaction[] = json ? JSON.parse(json) : [];
  await AsyncStorage.setItem(KEY, JSON.stringify(data.filter((t) => t.id !== id)));
};

export const clearAllTransactions = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEY);
};

export const fetchTransactionsByMonth = async (month: string): Promise<Transaction[]> => {
  const all = await fetchTransactions();
  return all.filter((t) => t.date.startsWith(month));
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
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
};

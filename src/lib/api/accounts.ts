import AsyncStorage from "@react-native-async-storage/async-storage";
import { Account } from "../../types";

const KEY = "@spendy_accounts";

const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: "default_cash",
    name: "Cash",
    type: "cash",
    icon: "💵",
    color: "#40916C",
    balance: 0,
    isPrimary: true,
    createdAt: new Date().toISOString(),
  },
];

export const getAccounts = async (): Promise<Account[]> => {
  const json = await AsyncStorage.getItem(KEY);
  if (!json) return DEFAULT_ACCOUNTS;
  const parsed: Account[] = JSON.parse(json);
  return parsed.length > 0 ? parsed : DEFAULT_ACCOUNTS;
};

export const saveAccount = async (account: Account): Promise<void> => {
  const accounts = await getAccounts();
  // If this is marked primary, demote others
  const updated = accounts.map((a) =>
    account.isPrimary ? { ...a, isPrimary: false } : a
  );
  await AsyncStorage.setItem(KEY, JSON.stringify([...updated, account]));
};

export const updateAccount = async (updated: Account): Promise<void> => {
  const accounts = await getAccounts();
  const next = accounts.map((a) => {
    if (a.id === updated.id) return updated;
    // Demote others if this one is becoming primary
    if (updated.isPrimary) return { ...a, isPrimary: false };
    return a;
  });
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
};

export const deleteAccount = async (id: string): Promise<void> => {
  const accounts = await getAccounts();
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(accounts.filter((a) => a.id !== id))
  );
};

export const getPrimaryAccount = async (): Promise<Account | null> => {
  const accounts = await getAccounts();
  return accounts.find((a) => a.isPrimary) ?? accounts[0] ?? null;
};

export const updateAccountBalance = async (
  accountId: string,
  delta: number
): Promise<void> => {
  const accounts = await getAccounts();
  const next = accounts.map((a) =>
    a.id === accountId ? { ...a, balance: a.balance + delta } : a
  );
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
};

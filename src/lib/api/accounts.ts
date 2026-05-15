import AsyncStorage from "@react-native-async-storage/async-storage";
import { Account } from "../../types";

const storageKey = (email: string) => `@spendy_accounts_${email}`;

const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: "default_cash",
    name: "Cash",
    type: "cash",
    icon: "cash",
    color: "#40916C",
    balance: 0,
    isPrimary: true,
    createdAt: new Date().toISOString(),
  },
];

export const getAccounts = async (email: string): Promise<Account[]> => {
  const json = await AsyncStorage.getItem(storageKey(email));
  if (!json) return DEFAULT_ACCOUNTS;
  const parsed: Account[] = JSON.parse(json);
  return parsed.length > 0 ? parsed : DEFAULT_ACCOUNTS;
};

export const saveAccount = async (email: string, account: Account): Promise<void> => {
  const accounts = await getAccounts(email);
  const updated = accounts.map((a) =>
    account.isPrimary ? { ...a, isPrimary: false } : a,
  );
  await AsyncStorage.setItem(storageKey(email), JSON.stringify([...updated, account]));
};

export const updateAccount = async (email: string, updated: Account): Promise<void> => {
  const accounts = await getAccounts(email);
  const next = accounts.map((a) => {
    if (a.id === updated.id) return updated;
    if (updated.isPrimary) return { ...a, isPrimary: false };
    return a;
  });
  await AsyncStorage.setItem(storageKey(email), JSON.stringify(next));
};

export const deleteAccount = async (email: string, id: string): Promise<void> => {
  const accounts = await getAccounts(email);
  await AsyncStorage.setItem(
    storageKey(email),
    JSON.stringify(accounts.filter((a) => a.id !== id)),
  );
};

export const getPrimaryAccount = async (email: string): Promise<Account | null> => {
  const accounts = await getAccounts(email);
  return accounts.find((a) => a.isPrimary) ?? accounts[0] ?? null;
};

export const updateAccountBalance = async (
  email: string,
  accountId: string,
  delta: number,
): Promise<void> => {
  const accounts = await getAccounts(email);
  const next = accounts.map((a) =>
    a.id === accountId ? { ...a, balance: a.balance + delta } : a,
  );
  await AsyncStorage.setItem(storageKey(email), JSON.stringify(next));
};

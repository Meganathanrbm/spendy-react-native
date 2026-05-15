import AsyncStorage from "@react-native-async-storage/async-storage";
import { Budget } from "../../types";

const storageKey = (email: string) => `@spendy_budgets_${email}`;

export const getBudgets = async (email: string): Promise<Budget[]> => {
  const json = await AsyncStorage.getItem(storageKey(email));
  return json ? JSON.parse(json) : [];
};

export const getBudgetsForMonth = async (email: string, month: string): Promise<Budget[]> => {
  const all = await getBudgets(email);
  return all.filter((b) => b.month === month);
};

export const saveBudget = async (email: string, budget: Budget): Promise<void> => {
  const all = await getBudgets(email);
  const exists = all.findIndex(
    (b) => b.categoryName === budget.categoryName && b.month === budget.month,
  );
  if (exists !== -1) {
    all[exists] = budget;
  } else {
    all.push(budget);
  }
  await AsyncStorage.setItem(storageKey(email), JSON.stringify(all));
};

export const deleteBudget = async (email: string, id: string): Promise<void> => {
  const all = await getBudgets(email);
  await AsyncStorage.setItem(
    storageKey(email),
    JSON.stringify(all.filter((b) => b.id !== id)),
  );
};

export const clearBudgetsForMonth = async (email: string, month: string): Promise<void> => {
  const all = await getBudgets(email);
  await AsyncStorage.setItem(
    storageKey(email),
    JSON.stringify(all.filter((b) => b.month !== month)),
  );
};

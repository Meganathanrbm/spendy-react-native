import AsyncStorage from "@react-native-async-storage/async-storage";
import { Budget } from "../../types";

const KEY = "@spendy_budgets";

export const getBudgets = async (): Promise<Budget[]> => {
  const json = await AsyncStorage.getItem(KEY);
  return json ? JSON.parse(json) : [];
};

export const getBudgetsForMonth = async (month: string): Promise<Budget[]> => {
  const all = await getBudgets();
  return all.filter((b) => b.month === month);
};

export const saveBudget = async (budget: Budget): Promise<void> => {
  const all = await getBudgets();
  // Replace existing budget for same category + month, or add new
  const exists = all.findIndex(
    (b) => b.categoryName === budget.categoryName && b.month === budget.month
  );
  if (exists !== -1) {
    all[exists] = budget;
  } else {
    all.push(budget);
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
};

export const deleteBudget = async (id: string): Promise<void> => {
  const all = await getBudgets();
  await AsyncStorage.setItem(KEY, JSON.stringify(all.filter((b) => b.id !== id)));
};

export const clearBudgetsForMonth = async (month: string): Promise<void> => {
  const all = await getBudgets();
  await AsyncStorage.setItem(KEY, JSON.stringify(all.filter((b) => b.month !== month)));
};

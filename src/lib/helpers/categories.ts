import AsyncStorage from "@react-native-async-storage/async-storage";
import { Category } from "../../types";

const KEY = "@spendy_custom_categories";

// ─── Defaults ────────────────────────────────────────────────────────────────

export const defaultExpenseCategories: Category[] = [
  { id: "cat_food",          name: "Food",          icon: "🍔", color: "#F97316", type: "expense", isCustom: false },
  { id: "cat_groceries",     name: "Groceries",     icon: "🛒", color: "#22C55E", type: "expense", isCustom: false },
  { id: "cat_transport",     name: "Transport",     icon: "🚗", color: "#FACC15", type: "expense", isCustom: false },
  { id: "cat_shopping",      name: "Shopping",      icon: "🛍️", color: "#3B82F6", type: "expense", isCustom: false },
  { id: "cat_bills",         name: "Bills",         icon: "🧾", color: "#6366F1", type: "expense", isCustom: false },
  { id: "cat_health",        name: "Health",        icon: "💊", color: "#EC4899", type: "expense", isCustom: false },
  { id: "cat_entertainment", name: "Entertainment", icon: "🎭", color: "#8B5CF6", type: "expense", isCustom: false },
  { id: "cat_education",     name: "Education",     icon: "📚", color: "#06B6D4", type: "expense", isCustom: false },
  { id: "cat_travel",        name: "Travel",        icon: "✈️", color: "#0EA5E9", type: "expense", isCustom: false },
  { id: "cat_rent",          name: "Rent",          icon: "🏠", color: "#10B981", type: "expense", isCustom: false },
  { id: "cat_other_exp",     name: "Other",         icon: "📦", color: "#64748B", type: "expense", isCustom: false },
];

export const defaultIncomeCategories: Category[] = [
  { id: "cat_salary",    name: "Salary",    icon: "💰", color: "#2D6A4F", type: "income", isCustom: false },
  { id: "cat_freelance", name: "Freelance", icon: "💻", color: "#0EA5E9", type: "income", isCustom: false },
  { id: "cat_business",  name: "Business",  icon: "💼", color: "#6366F1", type: "income", isCustom: false },
  { id: "cat_gift",      name: "Gift",      icon: "🎁", color: "#EC4899", type: "income", isCustom: false },
  { id: "cat_investment_income", name: "Returns",  icon: "📈", color: "#F59E0B", type: "income", isCustom: false },
  { id: "cat_other_inc", name: "Other",     icon: "📦", color: "#64748B", type: "income", isCustom: false },
];

export const defaultCategories: Category[] = [
  ...defaultIncomeCategories,
  ...defaultExpenseCategories,
];

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const json = await AsyncStorage.getItem(KEY);
    const custom: Category[] = json ? JSON.parse(json) : [];
    return [...defaultCategories, ...custom];
  } catch {
    return defaultCategories;
  }
};

export const getCategoriesByType = async (
  type: "income" | "expense"
): Promise<Category[]> => {
  const all = await getAllCategories();
  return all.filter((c) => c.type === type);
};

export const saveCustomCategory = async (cat: Category): Promise<void> => {
  const json = await AsyncStorage.getItem(KEY);
  const custom: Category[] = json ? JSON.parse(json) : [];
  await AsyncStorage.setItem(KEY, JSON.stringify([...custom, cat]));
};

export const deleteCustomCategory = async (id: string): Promise<void> => {
  const json = await AsyncStorage.getItem(KEY);
  const custom: Category[] = json ? JSON.parse(json) : [];
  await AsyncStorage.setItem(KEY, JSON.stringify(custom.filter((c) => c.id !== id)));
};

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export const getCategoryById = async (id: string): Promise<Category | undefined> => {
  const all = await getAllCategories();
  return all.find((c) => c.id === id);
};

export const getCategoryByName = (
  name: string,
  categories: Category[]
): Category | undefined => categories.find((c) => c.name === name);

// ─── Sync lookup helpers ──────────────────────────────────────────────────────

export const getIcon = (categoryName: string): string => {
  const cat = defaultCategories.find((c) => c.name === categoryName);
  return cat?.icon ?? "📦";
};

export const getIconBgColor = (categoryName: string): string => {
  const cat = defaultCategories.find((c) => c.name === categoryName);
  return (cat?.color ?? "#64748B") + "22";
};

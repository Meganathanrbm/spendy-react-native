import AsyncStorage from "@react-native-async-storage/async-storage";
import { Category } from "../../types";

const storageKey = (email: string) => `@spendy_custom_categories_${email}`;

// ─── Defaults ────────────────────────────────────────────────────────────────

export const defaultExpenseCategories: Category[] = [
  { id: "cat_food",          name: "Food",          icon: "Utensils",    color: "#F97316", type: "expense", isCustom: false },
  { id: "cat_groceries",     name: "Groceries",     icon: "ShoppingCart",color: "#22C55E", type: "expense", isCustom: false },
  { id: "cat_transport",     name: "Transport",     icon: "Car",         color: "#FACC15", type: "expense", isCustom: false },
  { id: "cat_shopping",      name: "Shopping",      icon: "ShoppingBag", color: "#3B82F6", type: "expense", isCustom: false },
  { id: "cat_bills",         name: "Bills",         icon: "ReceiptText", color: "#6366F1", type: "expense", isCustom: false },
  { id: "cat_health",        name: "Health",        icon: "Pill",        color: "#EC4899", type: "expense", isCustom: false },
  { id: "cat_entertainment", name: "Entertainment", icon: "Film",        color: "#8B5CF6", type: "expense", isCustom: false },
  { id: "cat_education",     name: "Education",     icon: "BookOpen",    color: "#06B6D4", type: "expense", isCustom: false },
  { id: "cat_travel",        name: "Travel",        icon: "Plane",       color: "#0EA5E9", type: "expense", isCustom: false },
  { id: "cat_rent",          name: "Rent",          icon: "House",       color: "#10B981", type: "expense", isCustom: false },
  { id: "cat_other_exp",     name: "Other",         icon: "Package",     color: "#64748B", type: "expense", isCustom: false },
];

export const defaultIncomeCategories: Category[] = [
  { id: "cat_salary",    name: "Salary",    icon: "Briefcase",   color: "#2D6A4F", type: "income", isCustom: false },
  { id: "cat_freelance", name: "Freelance", icon: "Banknote",    color: "#0EA5E9", type: "income", isCustom: false },
  { id: "cat_business",  name: "Business",  icon: "Landmark",    color: "#6366F1", type: "income", isCustom: false },
  { id: "cat_gift",      name: "Gift",      icon: "Gift",        color: "#EC4899", type: "income", isCustom: false },
  { id: "cat_investment_income", name: "Returns",  icon: "TrendingDown", color: "#F59E0B", type: "income", isCustom: false },
  { id: "cat_other_inc", name: "Other",     icon: "Package",     color: "#64748B", type: "income", isCustom: false },
];

export const defaultCategories: Category[] = [
  ...defaultIncomeCategories,
  ...defaultExpenseCategories,
];

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export const getAllCategories = async (email: string): Promise<Category[]> => {
  try {
    const json = await AsyncStorage.getItem(storageKey(email));
    const custom: Category[] = json ? JSON.parse(json) : [];
    return [...defaultCategories, ...custom];
  } catch {
    return defaultCategories;
  }
};

export const getCategoriesByType = async (
  email: string,
  type: "income" | "expense"
): Promise<Category[]> => {
  const all = await getAllCategories(email);
  return all.filter((c) => c.type === type);
};

export const saveCustomCategory = async (email: string, cat: Category): Promise<void> => {
  const json = await AsyncStorage.getItem(storageKey(email));
  const custom: Category[] = json ? JSON.parse(json) : [];
  await AsyncStorage.setItem(storageKey(email), JSON.stringify([...custom, cat]));
};

export const deleteCustomCategory = async (email: string, id: string): Promise<void> => {
  const json = await AsyncStorage.getItem(storageKey(email));
  const custom: Category[] = json ? JSON.parse(json) : [];
  await AsyncStorage.setItem(storageKey(email), JSON.stringify(custom.filter((c) => c.id !== id)));
};

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export const getCategoryById = async (email: string, id: string): Promise<Category | undefined> => {
  const all = await getAllCategories(email);
  return all.find((c) => c.id === id);
};

export const getCategoryByName = (
  name: string,
  categories: Category[]
): Category | undefined => categories.find((c) => c.name === name);

// ─── Sync lookup helpers ──────────────────────────────────────────────────────

export const getIcon = (categoryName: string): string => {
  const cat = defaultCategories.find((c) => c.name === categoryName);
  return cat?.icon ?? "Package";
};

export const getIconBgColor = (categoryName: string): string => {
  const cat = defaultCategories.find((c) => c.name === categoryName);
  return (cat?.color ?? "#64748B") + "22";
};

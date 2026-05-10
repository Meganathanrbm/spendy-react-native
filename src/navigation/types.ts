import { Transaction } from "../types";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
  AddTransaction: { defaultAccountId?: string; editTransaction?: Transaction } | undefined;
  AddAccount: undefined;
  AddAsset: undefined;
  SetBudget: { categoryName: string; month: string; existingLimit?: number };
  EditAsset: { assetId: string };
  Settings: undefined;
  CategoriesNav: undefined;
  SMSInbox: undefined;
};

export type BottomTabParamList = {
  Records: undefined;
  Analysis: undefined;
  Budgets: undefined;
  Accounts: undefined;
  Assets: undefined;
};

export type DrawerParamList = {
  Tabs: undefined;
  Profile: undefined;
  Categories: undefined;
  Settings: undefined;
};

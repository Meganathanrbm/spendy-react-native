export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
  AddTransaction: { defaultAccountId?: string } | undefined;
  AddAccount: undefined;
  AddAsset: undefined;
  SetBudget: { categoryName: string; month: string; existingLimit?: number };
  EditAsset: { assetId: string };
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

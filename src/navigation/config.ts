import {
  ChartNoAxesColumn,
  CreditCard,
  LucideIcon,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react-native";
import { BottomTabParamList } from "./types";

export const TAB_CONFIG: Record<
  keyof BottomTabParamList,
  { label: string; icon: LucideIcon }
> = {
  Records: { label: "Records", icon: Receipt },
  Analysis: { label: "Analysis", icon: ChartNoAxesColumn },
  Budgets: { label: "Budgets", icon: Wallet },
  Accounts: { label: "Accounts", icon: CreditCard },
  Assets: { label: "Assets", icon: TrendingUp },
};

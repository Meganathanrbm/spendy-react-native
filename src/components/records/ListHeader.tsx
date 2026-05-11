import { memo } from "react";
import AccountBanner from "./AccountBanner";
import MonthNavigator from "../common/MonthNavigator";
import SummaryBar from "./SummaryBar";
import { View } from "react-native";
import { Account } from "../../types";

type ListHeaderProps = {
  account: Account | null;
  income: number;
  expense: number;
  month: string;
  onMonthChange: (m: string) => void;
  onAccountPress: () => void;
};

export const ListHeader = memo(function ListHeader({
  account,
  income,
  expense,
  month,
  onMonthChange,
  onAccountPress,
}: ListHeaderProps) {
  return (
    <View>
      <AccountBanner account={account} onPress={onAccountPress} />
      <MonthNavigator month={month} onChange={onMonthChange} />
      <SummaryBar income={income} expense={expense} />
    </View>
  );
});

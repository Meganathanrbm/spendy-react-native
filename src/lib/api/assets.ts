import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "../../types";

const KEY = "@spendy_assets";

export const getAssets = async (): Promise<Asset[]> => {
  const json = await AsyncStorage.getItem(KEY);
  return json ? JSON.parse(json) : [];
};

export const saveAsset = async (asset: Asset): Promise<void> => {
  const all = await getAssets();
  await AsyncStorage.setItem(KEY, JSON.stringify([...all, asset]));
};

export const updateAsset = async (updated: Asset): Promise<void> => {
  const all = await getAssets();
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(all.map((a) => (a.id === updated.id ? updated : a)))
  );
};

export const deleteAsset = async (id: string): Promise<void> => {
  const all = await getAssets();
  await AsyncStorage.setItem(KEY, JSON.stringify(all.filter((a) => a.id !== id)));
};

// ─── Portfolio Calculations ───────────────────────────────────────────────────

export type PortfolioSummary = {
  totalInvested: number;
  totalCurrentValue: number;
  totalReturns: number;
  totalReturnsPercent: number;
  byType: Record<string, { invested: number; current: number }>;
  bySubType: Record<string, { invested: number; current: number }>;
};

export const getPortfolioSummary = async (): Promise<PortfolioSummary> => {
  const assets = await getAssets();

  let totalInvested = 0;
  let totalCurrentValue = 0;
  const byType: PortfolioSummary["byType"] = {};
  const bySubType: PortfolioSummary["bySubType"] = {};

  for (const a of assets) {
    totalInvested += a.investedAmount;
    totalCurrentValue += a.currentValue;

    if (!byType[a.type]) byType[a.type] = { invested: 0, current: 0 };
    byType[a.type].invested += a.investedAmount;
    byType[a.type].current += a.currentValue;

    if (!bySubType[a.subType]) bySubType[a.subType] = { invested: 0, current: 0 };
    bySubType[a.subType].invested += a.investedAmount;
    bySubType[a.subType].current += a.currentValue;
  }

  const totalReturns = totalCurrentValue - totalInvested;
  const totalReturnsPercent =
    totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  return {
    totalInvested,
    totalCurrentValue,
    totalReturns,
    totalReturnsPercent,
    byType,
    bySubType,
  };
};

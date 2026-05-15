import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "../../types";

const storageKey = (email: string) => `@spendy_assets_${email}`;

export const getAssets = async (email: string): Promise<Asset[]> => {
  const json = await AsyncStorage.getItem(storageKey(email));
  return json ? JSON.parse(json) : [];
};

export const saveAsset = async (email: string, asset: Asset): Promise<void> => {
  const all = await getAssets(email);
  await AsyncStorage.setItem(storageKey(email), JSON.stringify([...all, asset]));
};

export const updateAsset = async (email: string, updated: Asset): Promise<void> => {
  const all = await getAssets(email);
  await AsyncStorage.setItem(
    storageKey(email),
    JSON.stringify(all.map((a) => (a.id === updated.id ? updated : a))),
  );
};

export const deleteAsset = async (email: string, id: string): Promise<void> => {
  const all = await getAssets(email);
  await AsyncStorage.setItem(
    storageKey(email),
    JSON.stringify(all.filter((a) => a.id !== id)),
  );
};

// ─── Portfolio Calculations ───────────────────────────────────────────────────

export type PortfolioSummary = {
  totalInvested: number;
  totalCurrentValue: number;
  totalReturns: number;
  totalReturnsPercent: number;
  byType: Record<string, { invested: number; current: number }>;
};

export const getPortfolioSummary = async (email: string): Promise<PortfolioSummary> => {
  const assets = await getAssets(email);

  let totalInvested = 0;
  let totalCurrentValue = 0;
  const byType: PortfolioSummary["byType"] = {};

  for (const a of assets) {
    totalInvested += a.investedAmount;
    totalCurrentValue += a.currentValue;

    if (!byType[a.type]) byType[a.type] = { invested: 0, current: 0 };
    byType[a.type].invested += a.investedAmount;
    byType[a.type].current += a.currentValue;
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
  };
};

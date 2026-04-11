import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAssets,
  saveAsset,
  updateAsset,
  deleteAsset,
  getPortfolioSummary,
} from "../lib/api/assets";
import { Asset } from "../types";

export const ASSETS_KEY = ["assets"] as const;

export const useAssets = () =>
  useQuery({ queryKey: ASSETS_KEY, queryFn: getAssets });

export const usePortfolioSummary = () =>
  useQuery({
    queryKey: [...ASSETS_KEY, "summary"],
    queryFn: getPortfolioSummary,
  });

export const useSaveAsset = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveAsset,
    onSuccess: () => qc.invalidateQueries({ queryKey: ASSETS_KEY }),
  });
};

export const useUpdateAsset = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAsset,
    onSuccess: () => qc.invalidateQueries({ queryKey: ASSETS_KEY }),
  });
};

export const useDeleteAsset = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAsset(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ASSETS_KEY }),
  });
};

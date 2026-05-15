import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAssets,
  saveAsset,
  updateAsset,
  deleteAsset,
  getPortfolioSummary,
} from "../lib/api/assets";
import { useAuth } from "../contexts/AuthContext";
import { Asset } from "../types";

export const useAssets = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["assets", user?.email],
    queryFn: () => getAssets(user!.email),
    enabled: !!user,
  });
};

export const usePortfolioSummary = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["assets", user?.email, "summary"],
    queryFn: () => getPortfolioSummary(user!.email),
    enabled: !!user,
  });
};

export const useSaveAsset = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (asset: Asset) => saveAsset(user!.email, asset),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets", user?.email] }),
  });
};

export const useUpdateAsset = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (asset: Asset) => updateAsset(user!.email, asset),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets", user?.email] }),
  });
};

export const useDeleteAsset = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAsset(user!.email, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets", user?.email] }),
  });
};

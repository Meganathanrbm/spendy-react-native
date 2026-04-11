import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAccounts,
  saveAccount,
  updateAccount,
  deleteAccount,
  getPrimaryAccount,
} from "../lib/api/accounts";
import { Account } from "../types";

export const ACCOUNTS_KEY = ["accounts"] as const;

export const useAccounts = () =>
  useQuery({ queryKey: ACCOUNTS_KEY, queryFn: getAccounts });

export const usePrimaryAccount = () =>
  useQuery({ queryKey: [...ACCOUNTS_KEY, "primary"], queryFn: getPrimaryAccount });

export const useSaveAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNTS_KEY }),
  });
};

export const useUpdateAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNTS_KEY }),
  });
};

export const useDeleteAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNTS_KEY }),
  });
};

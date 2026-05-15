import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAccounts,
  saveAccount,
  updateAccount,
  deleteAccount,
  getPrimaryAccount,
} from "../lib/api/accounts";
import { useAuth } from "../contexts/AuthContext";
import { Account } from "../types";

export const useAccounts = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["accounts", user?.email],
    queryFn: () => getAccounts(user!.email),
    enabled: !!user,
    staleTime: Infinity,
  });
};

export const usePrimaryAccount = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["accounts", user?.email, "primary"],
    queryFn: () => getPrimaryAccount(user!.email),
    enabled: !!user,
  });
};

export const useSaveAccount = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (account: Account) => saveAccount(user!.email, account),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts", user?.email] }),
  });
};

export const useUpdateAccount = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (account: Account) => updateAccount(user!.email, account),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts", user?.email] }),
  });
};

export const useDeleteAccount = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAccount(user!.email, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts", user?.email] }),
  });
};

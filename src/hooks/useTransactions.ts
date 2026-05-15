import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTransactions,
  fetchTransactionsByMonth,
  fetchTransactionsByPeriod,
  saveTransaction,
  updateTransaction,
  deleteTransaction,
  clearAllTransactions,
} from "../lib/api/transactions";
import { useAuth } from "../contexts/AuthContext";
import { Transaction } from "../types";

export const useTransactions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["transactions", user?.email],
    queryFn: () => fetchTransactions(user!.email),
    enabled: !!user,
  });
};

export const useTransactionsByMonth = (month: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["transactions", user?.email, month],
    queryFn: () => fetchTransactionsByMonth(user!.email, month),
    enabled: !!user,
    staleTime: 30_000,
  });
};

export const useTransactionsByPeriod = (days: number = 30) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["transactions", user?.email, "period", days],
    queryFn: () => fetchTransactionsByPeriod(user!.email, days),
    enabled: !!user,
    staleTime: 30_000,
  });
};

export const useSaveTransaction = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tx: Transaction) => saveTransaction(user!.email, tx),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions", user?.email] });
      qc.invalidateQueries({ queryKey: ["accounts", user?.email] });
    },
  });
};

export const useUpdateTransaction = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ updated, original }: { updated: Transaction; original: Transaction }) =>
      updateTransaction(user!.email, updated, original),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions", user?.email] });
      qc.invalidateQueries({ queryKey: ["accounts", user?.email] });
    },
  });
};

export const useDeleteTransaction = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(user!.email, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions", user?.email] });
      qc.invalidateQueries({ queryKey: ["accounts", user?.email] });
    },
  });
};

export const useClearTransactions = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => clearAllTransactions(user!.email),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions", user?.email] }),
  });
};

// ─── Derived selectors ───────────────────────────────────────────────────────

export const useMonthlySummary = (transactions: Transaction[]) => {
  return useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.type === "income") income += t.amount;
      else if (t.type === "expense") expense += t.amount;
    }
    return { income, expense, net: income - expense };
  }, [transactions]);
};

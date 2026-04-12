import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTransactions,
  fetchTransactionsByMonth,
  saveTransaction,
  deleteTransaction,
  clearAllTransactions,
} from "../lib/api/transactions";
import { Transaction } from "../types";

export const TRANSACTIONS_KEY = ["transactions"] as const;

export const useTransactions = () =>
  useQuery({ queryKey: TRANSACTIONS_KEY, queryFn: fetchTransactions });

export const useTransactionsByMonth = (month: string) =>
  useQuery({
    queryKey: [...TRANSACTIONS_KEY, month],
    queryFn: () => fetchTransactionsByMonth(month),
  });

export const useSaveTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useDeleteTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      qc.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

export const useClearTransactions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearAllTransactions,
    onSuccess: () => qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY }),
  });
};

// ─── Derived selectors ───────────────────────────────────────────────────────

export const useMonthlySummary = (transactions: Transaction[]) => {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    else if (t.type === "expense") expense += t.amount;
  }
  return { income, expense, net: income - expense };
};

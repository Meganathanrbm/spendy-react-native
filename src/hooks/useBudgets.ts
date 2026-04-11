import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBudgets,
  getBudgetsForMonth,
  saveBudget,
  deleteBudget,
} from "../lib/api/budgets";
import { Budget } from "../types";

export const BUDGETS_KEY = ["budgets"] as const;

export const useBudgets = () =>
  useQuery({ queryKey: BUDGETS_KEY, queryFn: getBudgets });

export const useBudgetsByMonth = (month: string) =>
  useQuery({
    queryKey: [...BUDGETS_KEY, month],
    queryFn: () => getBudgetsForMonth(month),
  });

export const useSaveBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveBudget,
    onSuccess: () => qc.invalidateQueries({ queryKey: BUDGETS_KEY }),
  });
};

export const useDeleteBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: BUDGETS_KEY }),
  });
};

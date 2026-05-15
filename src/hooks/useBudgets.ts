import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBudgets,
  getBudgetsForMonth,
  saveBudget,
  deleteBudget,
} from "../lib/api/budgets";
import { useAuth } from "../contexts/AuthContext";
import { Budget } from "../types";

export const useBudgets = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["budgets", user?.email],
    queryFn: () => getBudgets(user!.email),
    enabled: !!user,
  });
};

export const useBudgetsByMonth = (month: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["budgets", user?.email, month],
    queryFn: () => getBudgetsForMonth(user!.email, month),
    enabled: !!user,
  });
};

export const useSaveBudget = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (budget: Budget) => saveBudget(user!.email, budget),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets", user?.email] }),
  });
};

export const useDeleteBudget = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBudget(user!.email, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets", user?.email] }),
  });
};

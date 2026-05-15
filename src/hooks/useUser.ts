import { useAuth } from "../contexts/AuthContext";

export const useUserEmail = (): string | undefined => {
  const { user } = useAuth();
  return user?.email;
};

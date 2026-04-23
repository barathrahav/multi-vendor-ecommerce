import { useQuery } from "@apollo/client/react";
import { ME_QUERY } from "../graphql/auth.queries";

type MeData = {
  me: {
    id: string;
    name: string;
    email: string;
    role: string | null;
  } | null;
};

export const useAuth = () => {
  const token = localStorage.getItem("token");

  const { data, loading } = useQuery<MeData>(ME_QUERY, {
    skip: !token,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  return {
    user: data?.me || null,
    loading,
    isAuthenticated: !!token,
    role: data?.me?.role,
  };
};

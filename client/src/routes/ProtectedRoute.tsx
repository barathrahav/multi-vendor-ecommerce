import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import type { JSX } from "react";

const ProtectedRoute = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import type { JSX } from "react";

const RoleProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: string[];
}) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default RoleProtectedRoute;
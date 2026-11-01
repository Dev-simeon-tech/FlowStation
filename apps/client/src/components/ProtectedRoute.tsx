import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({ children }: Props) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(currentPath)}`}
        replace
      />
    );
  }

  return <>{children}</>;
}

import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({ children }: Props) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  // return <Navigate to='/' replace />;

  return <>{children}</>;
}

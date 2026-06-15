import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { tokenStore } from "@/lib/token";

/** Token yoksa /login'e yönlendirir. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!tokenStore.get()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

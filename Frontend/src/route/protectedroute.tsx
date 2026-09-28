// frontend/src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useauth";
import { useEffect, useState } from "react";
import { getUserSubscription } from "../api/subscriptionapi";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user" | "admin";
  requireSubscription?: boolean;
}

export default function ProtectedRoute({ children, requiredRole, requireSubscription = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [subscriptionLoading, setSubscriptionLoading] = useState(requireSubscription && Boolean(user));
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    if (!requireSubscription || !user) {
      setSubscriptionLoading(false);
      return;
    }

    let mounted = true;
    setSubscriptionLoading(true);
    getUserSubscription()
      .then((subscription) => {
        if (mounted) setHasSubscription(Boolean(subscription));
      })
      .catch(() => {
        if (mounted) setHasSubscription(false);
      })
      .finally(() => {
        if (mounted) setSubscriptionLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [requireSubscription, user]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;
  if (subscriptionLoading) return <div className="hotflix-shell flex min-h-screen items-center justify-center text-muted">Checking your membership...</div>;
  if (requireSubscription && !hasSubscription) return <Navigate to="/subscription" replace />;

  return <>{children}</>;
}
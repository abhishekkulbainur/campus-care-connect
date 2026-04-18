import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth, type AppRole } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export function useRequireRole(required: AppRole | AppRole[]) {
  const { role, loading, user } = useAuth();
  const navigate = useNavigate();
  const allowed = Array.isArray(required) ? required : [required];

  useEffect(() => {
    if (loading || !user) return;
    if (!role || !allowed.includes(role)) {
      if (role === "admin") navigate({ to: "/admin" });
      else if (role === "staff") navigate({ to: "/staff" });
      else navigate({ to: "/dashboard" });
    }
  }, [role, loading, user, navigate, allowed]);

  return { role, loading, ok: role ? allowed.includes(role) : false };
}

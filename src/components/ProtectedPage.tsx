import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth, type AppRole } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";

export function ProtectedPage({
  allow,
  children,
}: {
  allow: AppRole[];
  children: ReactNode;
}) {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (role && !allow.includes(role)) {
      // redirect to user's own dashboard
      if (role === "admin") navigate({ to: "/admin" });
      else if (role === "staff") navigate({ to: "/staff" });
      else navigate({ to: "/dashboard" });
    }
  }, [user, role, loading, navigate, allow]);

  if (loading || !user || !role || !allow.includes(role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}

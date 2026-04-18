import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Sparkles, LogOut, LayoutDashboard, PlusCircle, Users, ListChecks } from "lucide-react";
import { useAuth, type AppRole } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const roleNav: Record<AppRole, { to: string; label: string; icon: typeof LayoutDashboard }[]> = {
  student: [
    { to: "/dashboard", label: "My Complaints", icon: LayoutDashboard },
    { to: "/complaints/new", label: "New Complaint", icon: PlusCircle },
  ],
  admin: [
    { to: "/admin", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/complaints", label: "Complaints", icon: ListChecks },
    { to: "/admin/users", label: "Users", icon: Users },
  ],
  staff: [
    { to: "/staff", label: "My Tasks", icon: ListChecks },
  ],
};

export function AppShell({ children }: { children: ReactNode }) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const items = role ? roleNav[role] : [];

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
        <Link to="/" className="flex items-center gap-2 border-b px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-base font-bold leading-tight">CleanTrack</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Campus Maintenance</div>
          </div>
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/dashboard" && to !== "/admin" && to !== "/staff" && pathname.startsWith(to));
            const exactActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-smooth",
                  exactActive || active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <div className="mb-3 truncate text-xs text-muted-foreground">
            <div className="font-medium text-foreground truncate">{user?.email}</div>
            <div className="capitalize">{role}</div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
            <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-card/60 px-4 py-3 backdrop-blur md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">CleanTrack</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        {/* Mobile nav tabs */}
        <nav className="flex gap-1 overflow-x-auto border-b bg-card/40 px-2 py-2 md:hidden">
          {items.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium",
                pathname === to ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

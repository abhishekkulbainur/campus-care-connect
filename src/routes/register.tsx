import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/lib/auth-context";
import { AuthLayout, roleHome } from "./login";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Create account — CleanTrack" }] }),
});

function passwordStrength(p: string): { score: number; label: string; color: string } {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  const labels = ["Too short", "Weak", "Okay", "Strong", "Excellent"];
  const colors = ["bg-destructive", "bg-destructive", "bg-warning", "bg-info", "bg-success"];
  return { score: s, label: labels[s], color: colors[s] };
}

function RegisterPage() {
  const navigate = useNavigate();
  const { user, role: existingRole, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("student");
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  useEffect(() => {
    if (!loading && user && existingRole) {
      navigate({ to: roleHome(existingRole) });
    }
  }, [user, existingRole, loading, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (strength.score < 2) {
      toast.error("Please choose a stronger password.");
      return;
    }
    setSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { name },
      },
    });

    if (error) {
      setSubmitting(false);
      toast.error(error.message);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const { error: roleErr } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (roleErr) {
        setSubmitting(false);
        toast.error("Account created, but couldn't set role: " + roleErr.message);
        return;
      }
    }

    setSubmitting(false);
    toast.success("Account created! Welcome to CleanTrack.");
    navigate({ to: roleHome(role) });
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join CleanTrack and help keep campus clean.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          {password && (
            <div className="space-y-1">
              <div className="flex h-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={cn("flex-1 rounded-full transition-smooth", i < strength.score ? strength.color : "bg-muted")} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{strength.label}</p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>I am a</Label>
          <div className="grid grid-cols-3 gap-2">
            {(["student", "staff", "admin"] as AppRole[]).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition-smooth",
                  role === r
                    ? "border-primary bg-primary/10 text-primary shadow-soft"
                    : "border-border bg-card text-muted-foreground hover:bg-accent",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="w-full gradient-primary text-primary-foreground shadow-elegant transition-smooth hover:scale-[1.01]">
          {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…</> : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

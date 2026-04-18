import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — CleanTrack" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && role) {
      navigate({ to: roleHome(role) });
    }
  }, [user, role, loading, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
  };

  return <AuthLayout title="Welcome back" subtitle="Sign in to manage campus cleanliness.">
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <Button type="submit" disabled={submitting} className="w-full gradient-primary text-primary-foreground shadow-elegant transition-smooth hover:scale-[1.01]">
        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</> : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        New here? <Link to="/register" className="font-medium text-primary hover:underline">Create an account</Link>
      </p>
    </form>
  </AuthLayout>;
}

export function roleHome(role: "student" | "admin" | "staff") {
  if (role === "admin") return "/admin" as const;
  if (role === "staff") return "/staff" as const;
  return "/dashboard" as const;
}

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="absolute inset-0 -z-10 gradient-hero opacity-[0.08]" />
      <div className="absolute -top-32 right-1/4 -z-10 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 -z-10 h-96 w-96 rounded-full bg-primary-glow/30 blur-3xl" />

      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">CleanTrack</span>
        </Link>
        <div className="glass rounded-2xl p-8 shadow-elegant">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

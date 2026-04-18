import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Activity, Leaf, Droplets, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "CleanTrack — Smart College Cleaning & Maintenance" },
      { name: "description", content: "Digitize complaint reporting on campus. Faster resolutions, transparent tracking, healthier spaces." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">CleanTrack</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gradient-primary text-primary-foreground shadow-elegant transition-smooth hover:scale-[1.03]">
                Get started <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient-hero opacity-[0.07]" />
        <div className="absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              Aligned with SDG 6 & SDG 11
            </div>
            <h1 className="text-balance text-5xl font-extrabold tracking-tight md:text-7xl">
              A cleaner campus,{" "}
              <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                resolved in real time.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              CleanTrack digitizes cleaning and maintenance reporting for colleges. Submit, assign, and track every issue — transparently, instantly.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/register">
                <Button size="lg" className="gradient-primary text-primary-foreground shadow-elegant transition-smooth hover:scale-[1.03] hover:shadow-glow">
                  Get started free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="transition-smooth hover:scale-[1.02]">
                  Sign in
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-20 grid max-w-5xl gap-4 md:grid-cols-3"
          >
            {[
              { icon: Activity, title: "Real-time tracking", desc: "Watch every complaint move from pending to resolved with instant updates." },
              { icon: ShieldCheck, title: "Role-based access", desc: "Students report, staff resolve, admins oversee — secure JWT auth." },
              { icon: Leaf, title: "Sustainable impact", desc: "Cleaner facilities, less waste, healthier learning environments." },
            ].map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SDG section */}
      <section className="border-t bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-info/15 text-info">
                <Droplets className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SDG 6</div>
                <h3 className="mt-1 text-xl font-semibold">Clean Water & Sanitation</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Quickly report unclean restrooms, leaks, and water issues — keeping campus sanitation a daily priority.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SDG 11</div>
                <h3 className="mt-1 text-xl font-semibold">Sustainable Communities</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Build accountable, sustainable campus operations with transparent issue resolution data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CleanTrack. Building cleaner campuses.
        </div>
      </footer>
    </div>
  );
}

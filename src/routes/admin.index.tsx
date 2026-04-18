import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ListChecks, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Complaint } from "@/components/ComplaintCard";

export const Route = createFileRoute("/admin/")({
  component: () => (
    <ProtectedPage allow={["admin"]}>
      <AdminOverview />
    </ProtectedPage>
  ),
  head: () => ({ meta: [{ title: "Admin overview — CleanTrack" }] }),
});

function AdminOverview() {
  const [items, setItems] = useState<Complaint[] | null>(null);

  useEffect(() => {
    supabase.from("complaints").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setItems((data as Complaint[]) ?? []));
  }, []);

  const total = items?.length ?? 0;
  const pending = items?.filter((c) => c.status === "pending").length ?? 0;
  const inProgress = items?.filter((c) => c.status === "in_progress").length ?? 0;
  const completed = items?.filter((c) => c.status === "completed").length ?? 0;

  const statusData = [
    { name: "Pending", value: pending, color: "var(--warning)" },
    { name: "In Progress", value: inProgress, color: "var(--info)" },
    { name: "Completed", value: completed, color: "var(--success)" },
  ];

  const priorityData = [
    { name: "Low", count: items?.filter((c) => c.priority === "low").length ?? 0 },
    { name: "Medium", count: items?.filter((c) => c.priority === "medium").length ?? 0 },
    { name: "High", count: items?.filter((c) => c.priority === "high").length ?? 0 },
  ];

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Campus-wide complaint and maintenance pulse."
        actions={
          <Link to="/admin/complaints">
            <Button variant="outline">
              Manage complaints <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        }
      />
      <div className="space-y-6 px-6 py-6 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={ListChecks} label="Total" value={total} loading={!items} accent="bg-primary/10 text-primary" />
          <StatCard icon={AlertCircle} label="Pending" value={pending} loading={!items} accent="bg-warning/10 text-warning" />
          <StatCard icon={Clock} label="In progress" value={inProgress} loading={!items} accent="bg-info/10 text-info" />
          <StatCard icon={CheckCircle2} label="Completed" value={completed} loading={!items} accent="bg-success/10 text-success" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Status distribution</h3>
              {!items ? <Skeleton className="h-64 w-full" /> : total === 0 ? <EmptyChart /> : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">By priority</h3>
              {!items ? <Skeleton className="h-64 w-full" /> : total === 0 ? <EmptyChart /> : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={priorityData}>
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, label, value, loading, accent }: { icon: typeof ListChecks; label: string; value: number; loading: boolean; accent: string }) {
  return (
    <Card className="transition-smooth hover:-translate-y-0.5 hover:shadow-elegant">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          {loading ? <Skeleton className="mt-1 h-7 w-12" /> : <div className="text-2xl font-bold">{value}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyChart() {
  return <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No data yet.</div>;
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PlusCircle, Search, Inbox } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { PageHeader } from "@/components/PageHeader";
import { ComplaintCard, type Complaint } from "@/components/ComplaintCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <ProtectedPage allow={["student"]}>
      <StudentDashboard />
    </ProtectedPage>
  ),
  head: () => ({ meta: [{ title: "My complaints — CleanTrack" }] }),
});

function StudentDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<Complaint[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("complaints")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems((data as Complaint[]) ?? []));
  }, [user]);

  const filtered = useMemo(() => {
    if (!items) return null;
    return items.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (priorityFilter !== "all" && c.priority !== priorityFilter) return false;
      if (search && !`${c.title} ${c.description} ${c.location}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, statusFilter, priorityFilter, search]);

  return (
    <>
      <PageHeader
        title="My complaints"
        subtitle="Track everything you've reported."
        actions={
          <Link to="/complaints/new">
            <Button className="gradient-primary text-primary-foreground shadow-elegant transition-smooth hover:scale-[1.02]">
              <PlusCircle className="mr-2 h-4 w-4" /> New complaint
            </Button>
          </Link>
        }
      />
      <div className="px-6 py-6 md:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search complaints…" className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!filtered ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => <ComplaintCard key={c.id} c={c} />)}
          </div>
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-card/40 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Inbox className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold">No complaints yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Spotted a maintenance issue on campus? Report it in seconds and track until it's resolved.
      </p>
      <Link to="/complaints/new" className="mt-5">
        <Button className="gradient-primary text-primary-foreground shadow-elegant">
          <PlusCircle className="mr-2 h-4 w-4" /> Report your first issue
        </Button>
      </Link>
    </div>
  );
}

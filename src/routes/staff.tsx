import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ListChecks, MapPin, Calendar } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import type { Complaint } from "@/components/ComplaintCard";

export const Route = createFileRoute("/staff")({
  component: () => (
    <ProtectedPage allow={["staff"]}>
      <StaffDashboard />
    </ProtectedPage>
  ),
  head: () => ({ meta: [{ title: "My tasks — CleanTrack" }] }),
});

function StaffDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<Complaint[] | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("complaints").select("*").eq("assigned_to", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setItems((data as Complaint[]) ?? []));
  }, [user]);

  const updateField = async (id: string, patch: Partial<Complaint>) => {
    const { error } = await supabase.from("complaints").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    setItems((prev) => prev?.map((c) => c.id === id ? { ...c, ...patch } : c) ?? null);
  };

  return (
    <>
      <PageHeader title="My assigned tasks" subtitle="Complete them, update status, and leave remarks." />
      <div className="px-6 py-6 md:px-8">
        {!items ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed bg-card/40 px-6 py-16 text-center">
            <ListChecks className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="font-semibold">All caught up!</h3>
            <p className="mt-1 text-sm text-muted-foreground">No tasks assigned to you yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {items.map((c) => <TaskCard key={c.id} c={c} onUpdate={(p) => updateField(c.id, p)} />)}
          </div>
        )}
      </div>
    </>
  );
}

function TaskCard({ c, onUpdate }: { c: Complaint; onUpdate: (p: Partial<Complaint>) => void }) {
  const [remarks, setRemarks] = useState(c.remarks ?? "");
  return (
    <Card className="overflow-hidden transition-smooth hover:shadow-elegant">
      {c.image_url && (
        <div className="h-40 w-full overflow-hidden bg-muted">
          <img src={c.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
      )}
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{c.title}</h3>
          <PriorityBadge priority={c.priority} />
        </div>
        <p className="text-sm text-muted-foreground">{c.description}</p>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.location}</span>
          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(c.created_at).toLocaleDateString()}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Status</span>
            <StatusBadge status={c.status} />
          </div>
          <Select value={c.status} onValueChange={(v) => onUpdate({ status: v as Complaint["status"] })}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Remarks</span>
          <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add notes for the admin/student…" rows={3} />
          <Button size="sm" variant="outline" className="w-full" onClick={() => onUpdate({ remarks })}>
            Save remarks
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

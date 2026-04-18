import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Trash2, ListChecks } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import type { Complaint } from "@/components/ComplaintCard";

interface UserLite { id: string; name: string; email: string }

export const Route = createFileRoute("/admin/complaints")({
  component: () => (
    <ProtectedPage allow={["admin"]}>
      <AdminComplaints />
    </ProtectedPage>
  ),
  head: () => ({ meta: [{ title: "Manage complaints — CleanTrack" }] }),
});

function AdminComplaints() {
  const [items, setItems] = useState<Complaint[] | null>(null);
  const [staff, setStaff] = useState<UserLite[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = async () => {
    const { data } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
    setItems((data as Complaint[]) ?? []);
  };

  useEffect(() => {
    load();
    // load staff users
    (async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "staff");
      const ids = (roles ?? []).map((r) => r.user_id);
      if (ids.length === 0) { setStaff([]); return; }
      const { data: profs } = await supabase.from("profiles").select("id,name,email").in("id", ids);
      setStaff((profs as UserLite[]) ?? []);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!items) return null;
    return items.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (search && !`${c.title} ${c.location}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, statusFilter, search]);

  const updateStatus = async (id: string, status: "pending" | "in_progress" | "completed") => {
    const { error } = await supabase.from("complaints").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    setItems((prev) => prev?.map((c) => c.id === id ? { ...c, status } : c) ?? null);
  };

  const assign = async (id: string, userId: string | null) => {
    const { error } = await supabase.from("complaints").update({ assigned_to: userId }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(userId ? "Assigned to staff" : "Unassigned");
    setItems((prev) => prev?.map((c) => c.id === id ? { ...c, assigned_to: userId } : c) ?? null);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this complaint?")) return;
    const { error } = await supabase.from("complaints").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setItems((prev) => prev?.filter((c) => c.id !== id) ?? null);
  };

  return (
    <>
      <PageHeader title="All complaints" subtitle="Assign staff, update statuses, and resolve quickly." />
      <div className="px-6 py-6 md:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or location…" className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!filtered ? (
          <Skeleton className="h-96 w-full rounded-2xl" />
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed bg-card/40 px-6 py-16 text-center">
            <ListChecks className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No complaints match these filters.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Complaint</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assign</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="max-w-xs">
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-muted-foreground">{c.location} • {new Date(c.created_at).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell><PriorityBadge priority={c.priority} /></TableCell>
                    <TableCell>
                      <Select value={c.status} onValueChange={(v) => updateStatus(c.id, v as "pending" | "in_progress" | "completed")}>
                        <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-1"><StatusBadge status={c.status} /></div>
                    </TableCell>
                    <TableCell>
                      <Select value={c.assigned_to ?? "none"} onValueChange={(v) => assign(c.id, v === "none" ? null : v)}>
                        <SelectTrigger className="h-8 w-44"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Unassigned</SelectItem>
                          {staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => remove(c.id)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}

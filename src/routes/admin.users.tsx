import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth-context";

interface Row { id: string; name: string; email: string; role: AppRole | null }

export const Route = createFileRoute("/admin/users")({
  component: () => (
    <ProtectedPage allow={["admin"]}>
      <AdminUsers />
    </ProtectedPage>
  ),
  head: () => ({ meta: [{ title: "Manage users — CleanTrack" }] }),
});

function AdminUsers() {
  const [rows, setRows] = useState<Row[] | null>(null);

  const load = async () => {
    const { data: profs } = await supabase.from("profiles").select("id,name,email").order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("user_id,role");
    const map = new Map<string, AppRole>();
    (roles ?? []).forEach((r) => map.set(r.user_id, r.role as AppRole));
    setRows((profs ?? []).map((p) => ({ ...p, role: map.get(p.id) ?? null })));
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (userId: string, newRole: AppRole) => {
    // Delete existing roles, insert new
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    if (error) return toast.error(error.message);
    toast.success("Role updated");
    setRows((prev) => prev?.map((r) => r.id === userId ? { ...r, role: newRole } : r) ?? null);
  };

  return (
    <>
      <PageHeader title="Users" subtitle="Manage roles for students, staff, and admins." />
      <div className="px-6 py-6 md:px-8">
        {!rows ? (
          <Skeleton className="h-96 w-full rounded-2xl" />
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed bg-card/40 px-6 py-16 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No users yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-48">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.email}</TableCell>
                    <TableCell>
                      <Select value={r.role ?? ""} onValueChange={(v) => changeRole(r.id, v as AppRole)}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="No role" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
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

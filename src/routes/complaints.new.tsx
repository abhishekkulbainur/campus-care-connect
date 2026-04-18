import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, Upload, X, ImagePlus } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const LOCATIONS = [
  "Library", "Cafeteria", "Hostel Block A", "Hostel Block B", "Classroom Block",
  "Restrooms - Ground Floor", "Restrooms - Upper Floor", "Sports Complex",
  "Auditorium", "Parking Area", "Garden / Lawn", "Laboratory", "Other",
];

export const Route = createFileRoute("/complaints/new")({
  component: () => (
    <ProtectedPage allow={["student", "admin", "staff"]}>
      <NewComplaint />
    </ProtectedPage>
  ),
  head: () => ({ meta: [{ title: "Report a complaint — CleanTrack" }] }),
});

function NewComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("medium");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onFileChange = (f: File | null) => {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !location) {
      toast.error("Please pick a location.");
      return;
    }
    setSubmitting(true);

    let imageUrl: string | null = null;
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("complaint-images").upload(path, file);
      if (upErr) {
        setSubmitting(false);
        toast.error("Image upload failed: " + upErr.message);
        return;
      }
      const { data: pub } = supabase.storage.from("complaint-images").getPublicUrl(path);
      imageUrl = pub.publicUrl;
    }

    const { error } = await supabase.from("complaints").insert({
      title, description, location,
      priority: priority as "low" | "medium" | "high",
      image_url: imageUrl,
      created_by: user.id,
    });

    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Complaint submitted!");
    navigate({ to: "/dashboard" });
  };

  return (
    <>
      <PageHeader title="Report a complaint" subtitle="Tell us what needs attention. Be specific — it speeds up resolution." />
      <div className="mx-auto max-w-3xl px-6 py-8 md:px-8">
        <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border bg-card p-6 shadow-soft md:p-8">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Leaking tap in 2nd floor restroom" maxLength={120} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue clearly…" rows={5} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Location *</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Photo (optional)</Label>
            {preview ? (
              <div className="relative overflow-hidden rounded-xl border">
                <img src={preview} alt="Preview" className="max-h-72 w-full object-cover" />
                <Button type="button" size="sm" variant="destructive" className="absolute right-2 top-2" onClick={() => onFileChange(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 px-4 py-10 text-center transition-smooth hover:bg-muted/60">
                <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium">Click to upload an image</span>
                <span className="text-xs text-muted-foreground">PNG, JPG up to 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/dashboard" })}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="gradient-primary text-primary-foreground shadow-elegant transition-smooth hover:scale-[1.02]">
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</> : <><Upload className="mr-2 h-4 w-4" /> Submit complaint</>}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

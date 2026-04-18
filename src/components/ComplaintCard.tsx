import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar } from "lucide-react";

export interface Complaint {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  image_url: string | null;
  created_by: string;
  assigned_to: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export function ComplaintCard({ c, onClick }: { c: Complaint; onClick?: () => void }) {
  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer overflow-hidden border bg-card transition-smooth hover:-translate-y-0.5 hover:shadow-elegant"
    >
      {c.image_url && (
        <div className="relative h-40 w-full overflow-hidden bg-muted">
          <img
            src={c.image_url}
            alt={c.title}
            loading="lazy"
            className="h-full w-full object-cover transition-smooth group-hover:scale-105"
          />
        </div>
      )}
      <CardContent className="p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold">{c.title}</h3>
          <PriorityBadge priority={c.priority} />
        </div>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {c.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {new Date(c.created_at).toLocaleDateString()}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <StatusBadge status={c.status} />
        </div>
      </CardContent>
    </Card>
  );
}

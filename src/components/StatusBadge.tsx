import { cn } from "@/lib/utils";

type Status = "pending" | "in_progress" | "completed";
type Priority = "low" | "medium" | "high";

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-warning/15 text-warning-foreground border-warning/30 dark:text-warning" },
  in_progress: { label: "In Progress", className: "bg-info/15 text-info border-info/30" },
  completed: { label: "Completed", className: "bg-success/15 text-success border-success/30" },
};

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-muted text-muted-foreground border-border" },
  medium: { label: "Medium", className: "bg-info/10 text-info border-info/30" },
  high: { label: "High", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

export function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
      cfg.className,
    )}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = priorityConfig[priority];
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
      cfg.className,
    )}>
      {cfg.label}
    </span>
  );
}

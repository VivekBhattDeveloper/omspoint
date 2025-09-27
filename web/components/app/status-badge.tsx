import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const orderStatusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  shipped: "bg-sky-100 text-sky-700 border-sky-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
};

const printJobStatusStyles: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  printing: "bg-indigo-100 text-indigo-700 border-indigo-200",
  complete: "bg-emerald-100 text-emerald-700 border-emerald-200",
  failed: "bg-rose-100 text-rose-700 border-rose-200",
};

const defaultStyles = "bg-muted text-foreground border-transparent";

export type StatusBadgeKind = "order" | "printJob";

export const StatusBadge = ({ status, kind = "order" }: { status?: string | null; kind?: StatusBadgeKind }) => {
  if (!status) {
    return null;
  }

  const normalized = status.toLowerCase();

  const styleMap = kind === "printJob" ? printJobStatusStyles : orderStatusStyles;
  const styles = styleMap[normalized] ?? defaultStyles;

  return (
    <Badge variant="outline" className={cn("capitalize", styles)}>
      {status.replace(/-/g, " ")}
    </Badge>
  );
};

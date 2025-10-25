import { Layers, Paintbrush2, ShieldCheck, Upload } from "lucide-react";

export type DesignStatus = "draft" | "inReview" | "approved" | "archived";
export type DesignDiscipline = "print" | "embroidery" | "uv" | "sublimation";

export const DESIGN_STATUSES: readonly DesignStatus[] = ["draft", "inReview", "approved", "archived"];
export const DESIGN_DISCIPLINES: readonly DesignDiscipline[] = ["print", "embroidery", "uv", "sublimation"];

export const statusMeta: Record<
  DesignStatus,
  { label: string; variant: "outline" | "secondary" | "destructive" | "default" }
> = {
  draft: { label: "Draft", variant: "outline" },
  inReview: { label: "In review", variant: "default" },
  approved: { label: "Approved", variant: "secondary" },
  archived: { label: "Archived", variant: "destructive" },
};

export const disciplineMeta: Record<DesignDiscipline, { label: string; icon: typeof Paintbrush2 }> = {
  print: { label: "Direct print", icon: Paintbrush2 },
  embroidery: { label: "Embroidery", icon: Layers },
  uv: { label: "UV print", icon: ShieldCheck },
  sublimation: { label: "Sublimation", icon: Upload },
};

export const statusToneClasses: Record<(typeof statusMeta)[DesignStatus]["variant"], string> = {
  outline: "border border-muted-foreground/20 text-muted-foreground",
  secondary: "bg-emerald-600 text-emerald-50 hover:bg-emerald-500",
  destructive: "bg-rose-600 text-rose-50 hover:bg-rose-500",
  default: "",
};

export const isDesignStatus = (value: unknown): value is DesignStatus =>
  typeof value === "string" && DESIGN_STATUSES.includes(value as DesignStatus);

export const isDesignDiscipline = (value: unknown): value is DesignDiscipline =>
  typeof value === "string" && DESIGN_DISCIPLINES.includes(value as DesignDiscipline);

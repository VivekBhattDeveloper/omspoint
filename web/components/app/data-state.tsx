import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ReactNode } from "react";

type DataStateVariant = "sample" | "empty" | "error";

type Defaults = Record<DataStateVariant, { title: string; description: string }>;

const DEFAULT_CONTENT: Defaults = {
  sample: {
    title: "Sample dataset",
    description: "The live data source is unavailable right now. Showing curated reference data so you can keep working.",
  },
  empty: {
    title: "Nothing to display",
    description: "We didn't find any records matching the current filters. Adjust filters or try again later.",
  },
  error: {
    title: "Unable to load data",
    description: "Something went wrong while loading this section. Please try again or contact support if it persists.",
  },
};

export type DataStateProps = {
  variant?: DataStateVariant;
  title?: string;
  description?: ReactNode;
  children?: ReactNode;
};

export function DataState({ variant = "sample", title, description, children }: DataStateProps) {
  const defaults = DEFAULT_CONTENT[variant];

  return (
    <Alert variant={variant === "error" ? "destructive" : "default"}>
      <AlertTitle>{title ?? defaults.title}</AlertTitle>
      <AlertDescription>
        {description ?? defaults.description}
        {children}
      </AlertDescription>
    </Alert>
  );
}

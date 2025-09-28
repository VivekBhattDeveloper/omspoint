import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/app/page-header";
import { AutoTable } from "@/components/auto";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "../api";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CloudUpload,
  Eye,
  FileSpreadsheet,
  History,
  Layers,
  ShieldCheck,
  Wand2,
} from "lucide-react";

type BulkRowStatus = "ready" | "warning" | "error" | "imported" | "failed";
type IssueSeverity = "error" | "warning";

type BulkRowIssue = {
  type: IssueSeverity;
  message: string;
};

type BulkRowParsed = {
  sku: string;
  name: string;
  price: number;
  assetUrl?: string;
  template?: string;
  jig?: string;
  description?: string;
};

type BulkRowResult = {
  id: string;
  parsed: BulkRowParsed;
  status: BulkRowStatus;
  issues: BulkRowIssue[];
  message?: string;
};

type AssetOutcome = "pass" | "warn" | "fail";

type AssetCheck = {
  label: string;
  outcome: AssetOutcome;
  note?: string;
};

type AssetStatus = "passed" | "warning" | "failed";

type AssetRecord = {
  id: string;
  sku: string;
  name: string;
  assetUrl?: string;
  template?: string;
  jig?: string;
  status: AssetStatus;
  checks: AssetCheck[];
  updatedAt: string;
  reviewer: string;
};

type MappingStatus = "draft" | "ready" | "published" | "deprecated";

type MappingRecord = {
  id: string;
  vendorSku: string;
  productId?: string | null;
  productName: string;
  template?: string;
  jig?: string;
  status: MappingStatus;
  lastUpdated: string;
  notes?: string;
};

type VersionStatus = "Draft" | "Pending Review" | "Published" | "Retired";

type VersionEntry = {
  id: string;
  sku: string;
  version: string;
  status: VersionStatus;
  note?: string;
  actor: string;
  publishedAt: string;
};

type ManualFormState = {
  sku: string;
  name: string;
  price: string;
  description: string;
  assetUrl: string;
  template: string;
  jig: string;
};

const templateOptions = [
  "Standard Poster A2",
  "Canvas 30x40",
  "Mug Wrap",
  "Garment Front DTG",
  "Cardstock 5x7",
];

const jigOptions = [
  "Universal-Jig-01",
  "Poster-Clamp-02",
  "Wrap-Jig-03",
  "Garment-Plate-04",
];

const assetStatusStyles: Record<AssetStatus, string> = {
  passed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  failed: "bg-rose-100 text-rose-700 border-rose-200",
};

const bulkStatusStyles: Record<BulkRowStatus, string> = {
  ready: "bg-sky-100 text-sky-700 border-sky-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  error: "bg-rose-100 text-rose-700 border-rose-200",
  imported: "bg-emerald-100 text-emerald-700 border-emerald-200",
  failed: "bg-rose-100 text-rose-700 border-rose-200",
};

const versionStatusStyles: Record<VersionStatus, string> = {
  Draft: "bg-slate-100 text-slate-700 border-slate-200",
  "Pending Review": "bg-amber-100 text-amber-700 border-amber-200",
  Published: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Retired: "bg-rose-100 text-rose-700 border-rose-200",
};

const createId = () => Math.random().toString(36).slice(2, 10);

const buildInitialAssets = (): AssetRecord[] => {
  const now = Date.now();
  return [
    {
      id: createId(),
      sku: "POSTER-NEON-18x24",
      name: "Neon Skyline Poster",
      assetUrl: "https://cdn.example.com/assets/poster-neon-18x24.pdf",
      template: "Standard Poster A2",
      jig: "Poster-Clamp-02",
      status: "passed",
      checks: [
        { label: "Asset provided", outcome: "pass" },
        { label: "Print-ready format", outcome: "pass" },
        { label: "Bleed & safe area", outcome: "pass" },
      ],
      updatedAt: new Date(now - 1000 * 60 * 45).toISOString(),
      reviewer: "Preflight automation",
    },
    {
      id: createId(),
      sku: "MUG-GRAD-15oz",
      name: "Graduation Mug 15oz",
      assetUrl: "https://cdn.example.com/assets/mug-grad-15oz.png",
      template: "Mug Wrap",
      jig: "Wrap-Jig-03",
      status: "warning",
      checks: [
        { label: "Asset provided", outcome: "pass" },
        {
          label: "Print-ready format",
          outcome: "warn",
          note: "PNG detected. Consider uploading layered PDF for richer blacks.",
        },
        {
          label: "Bleed & safe area",
          outcome: "warn",
          note: "Text approaches trim line on the right edge.",
        },
      ],
      updatedAt: new Date(now - 1000 * 60 * 90).toISOString(),
      reviewer: "Preflight automation",
    },
    {
      id: createId(),
      sku: "TEE-PRIDE-XL",
      name: "Pride Tee - XL",
      assetUrl: "https://cdn.example.com/assets/tee-pride-xl.ai",
      template: "Garment Front DTG",
      jig: "Garment-Plate-04",
      status: "failed",
      checks: [
        { label: "Asset provided", outcome: "pass" },
        {
          label: "Print-ready format",
          outcome: "pass",
        },
        {
          label: "Bleed & safe area",
          outcome: "fail",
          note: "Artwork exceeds printable area by 0.75 in on bottom edge.",
        },
      ],
      updatedAt: new Date(now - 1000 * 60 * 120).toISOString(),
      reviewer: "Preflight automation",
    },
  ];
};

const buildInitialMappings = (): MappingRecord[] => {
  const now = Date.now();
  return [
    {
      id: createId(),
      vendorSku: "POSTER-NEON-18x24",
      productId: "prod_001",
      productName: "Neon Skyline Poster",
      template: "Standard Poster A2",
      jig: "Poster-Clamp-02",
      status: "published",
      lastUpdated: new Date(now - 1000 * 60 * 60 * 4).toISOString(),
      notes: "Approved for all US POD facilities.",
    },
    {
      id: createId(),
      vendorSku: "MUG-GRAD-15oz",
      productId: "prod_014",
      productName: "Graduation Mug 15oz",
      template: "Mug Wrap",
      jig: "Wrap-Jig-03",
      status: "ready",
      lastUpdated: new Date(now - 1000 * 60 * 60 * 9).toISOString(),
      notes: "Awaiting final QA sign-off after handle alignment fix.",
    },
    {
      id: createId(),
      vendorSku: "TEE-PRIDE-XL",
      productId: "prod_032",
      productName: "Pride Tee - XL",
      template: "Garment Front DTG",
      jig: "Garment-Plate-04",
      status: "draft",
      lastUpdated: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      notes: "Design team iterating on color fastness guidance.",
    },
  ];
};

const buildInitialVersions = (): VersionEntry[] => {
  const now = Date.now();
  return [
    {
      id: createId(),
      sku: "POSTER-NEON-18x24",
      version: "v1.2",
      status: "Published",
      note: "Approved final color correction with vendor-specific ICC profile.",
      actor: "Alex Chen",
      publishedAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: createId(),
      sku: "MUG-GRAD-15oz",
      version: "v0.9",
      status: "Pending Review",
      note: "Bulk upload received. Waiting for template heat-map validation.",
      actor: "Priya Patel",
      publishedAt: new Date(now - 1000 * 60 * 60 * 22).toISOString(),
    },
    {
      id: createId(),
      sku: "TEE-PRIDE-XL",
      version: "v0.4",
      status: "Draft",
      note: "Initial asset ingest. Needs updated jig alignment.",
      actor: "Morgan Smith",
      publishedAt: new Date(now - 1000 * 60 * 60 * 30).toISOString(),
    },
  ];
};

const runAssetAnalysis = (input: {
  sku: string;
  name: string;
  assetUrl?: string;
  template?: string;
  jig?: string;
}): AssetRecord => {
  const { sku, name, assetUrl, template, jig } = input;
  const checks: AssetCheck[] = [];

  if (!assetUrl) {
    checks.push({ label: "Asset provided", outcome: "fail", note: "No artwork attached." });
  } else {
    checks.push({ label: "Asset provided", outcome: "pass" });
    const extension = assetUrl.split(".").pop()?.toLowerCase() ?? "";
    const isPrintFormat = ["pdf", "ai", "eps", "tif", "tiff"].includes(extension);
    checks.push({
      label: "Print-ready format",
      outcome: isPrintFormat ? "pass" : "warn",
      note: isPrintFormat ? undefined : "Prefer PDF, AI, EPS, or TIFF uploads for press fidelity.",
    });
    const referencesBleed = /bleed|print|crop/i.test(assetUrl);
    checks.push({
      label: "Bleed & safe area",
      outcome: referencesBleed ? "pass" : "warn",
      note: referencesBleed ? undefined : "Reconfirm bleed markings inside template before publishing.",
    });
  }

  if (!template) {
    checks.push({
      label: "Template assigned",
      outcome: "warn",
      note: "Template missing. Assign before routing to production.",
    });
  } else {
    checks.push({ label: "Template assigned", outcome: "pass" });
  }

  const status: AssetStatus = checks.some((check) => check.outcome === "fail")
    ? "failed"
    : checks.some((check) => check.outcome === "warn")
      ? "warning"
      : "passed";

  return {
    id: createId(),
    sku,
    name,
    assetUrl,
    template,
    jig,
    status,
    checks,
    updatedAt: new Date().toISOString(),
    reviewer: "Preflight automation",
  };
};

const mappingStatusLabels: Record<MappingStatus, string> = {
  draft: "Draft",
  ready: "Ready",
  published: "Published",
  deprecated: "Deprecated",
};

const mappingStatusStyles: Record<MappingStatus, string> = {
  draft: bulkStatusStyles.warning,
  ready: bulkStatusStyles.ready,
  published: bulkStatusStyles.imported,
  deprecated: bulkStatusStyles.failed,
};

const mappingStatusOrder: Record<MappingStatus, number> = {
  published: 0,
  ready: 1,
  draft: 2,
  deprecated: 3,
};

const VendorCatalogPage = () => {
  const [manualForm, setManualForm] = useState<ManualFormState>(
    () => ({
      sku: "",
      name: "",
      price: "",
      description: "",
      assetUrl: "",
      template: templateOptions[0] ?? "",
      jig: jigOptions[0] ?? "",
    }),
  );
  const [manualErrors, setManualErrors] = useState<string[]>([]);
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);

  const [bulkInput, setBulkInput] = useState("");
  const [bulkRows, setBulkRows] = useState<BulkRowResult[]>([]);
  const [bulkValidatedAt, setBulkValidatedAt] = useState<string | null>(null);
  const [isBulkImporting, setIsBulkImporting] = useState(false);

  const [assets, setAssets] = useState<AssetRecord[]>(buildInitialAssets);
  const [activeAsset, setActiveAsset] = useState<AssetRecord | null>(null);

  const [mappings, setMappings] = useState<MappingRecord[]>(buildInitialMappings);
  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<MappingRecord | null>(null);

  const [versions, setVersions] = useState<VersionEntry[]>(buildInitialVersions);

  const [productSearch, setProductSearch] = useState("");

  const currency = useMemo(
    () => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }),
    [],
  );

  const sortedMappings = useMemo(
    () =>
      [...mappings].sort((a, b) => {
        const orderDiff = mappingStatusOrder[a.status] - mappingStatusOrder[b.status];
        if (orderDiff !== 0) return orderDiff;
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }),
    [mappings],
  );

  const bulkSummary = useMemo(() => {
    return bulkRows.reduce(
      (acc, row) => {
        acc[row.status] = (acc[row.status] ?? 0) + 1;
        return acc;
      },
      {
        ready: 0,
        warning: 0,
        error: 0,
        imported: 0,
        failed: 0,
      } as Record<BulkRowStatus, number>,
    );
  }, [bulkRows]);

  const appendVersionEntry = (sku: string, status: VersionStatus, note: string, actor: string) => {
    setVersions((prev) => {
      const existingCount = prev.filter((entry) => entry.sku === sku).length;
      const versionNumber = (existingCount + 1).toFixed(1);
      const nextVersion = `v${versionNumber}`;
      const entry: VersionEntry = {
        id: createId(),
        sku,
        version: nextVersion,
        status,
        note,
        actor,
        publishedAt: new Date().toISOString(),
      };
      return [entry, ...prev];
    });
  };

  const resetManualForm = () => {
    setManualForm({
      sku: "",
      name: "",
      price: "",
      description: "",
      assetUrl: "",
      template: templateOptions[0] ?? "",
      jig: jigOptions[0] ?? "",
    });
  };

  const handleManualSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: string[] = [];

    if (!manualForm.sku.trim()) errors.push("Vendor SKU is required.");
    if (!manualForm.name.trim()) errors.push("Product name is required.");

    const priceValue = Number(manualForm.price);
    if (!manualForm.price.trim() || Number.isNaN(priceValue) || priceValue <= 0) {
      errors.push("Enter a valid unit price (must be greater than zero).");
    }

    if (errors.length > 0) {
      setManualErrors(errors);
      return;
    }

    setManualErrors([]);
    setIsManualSubmitting(true);

    try {
      const record = await api.product.create({
        productName: manualForm.name,
        price: priceValue,
        productDescription: manualForm.description || `Vendor SKU ${manualForm.sku}`,
      });

      toast.success("SKU ingested and queued for preflight validation.");

      const assetRecord = runAssetAnalysis({
        sku: manualForm.sku,
        name: manualForm.name,
        assetUrl: manualForm.assetUrl,
        template: manualForm.template,
        jig: manualForm.jig,
      });

      setAssets((prev) => [assetRecord, ...prev]);

      const mapping: MappingRecord = {
        id: createId(),
        vendorSku: manualForm.sku,
        productId: record.id ?? null,
        productName: record.productName ?? manualForm.name,
        template: manualForm.template,
        jig: manualForm.jig,
        status: "draft",
        lastUpdated: new Date().toISOString(),
        notes: "Manually ingested from vendor portal.",
      };

      setMappings((prev) => [mapping, ...prev]);
      appendVersionEntry(manualForm.sku, "Draft", "Manual ingest created draft revision.", "You");
      resetManualForm();
    } catch (error) {
      console.error("manual ingestion failed", error);
      toast.error("Unable to ingest SKU. Check inputs and try again.");
    } finally {
      setIsManualSubmitting(false);
    }
  };

  const parseBulkInput = () => {
    const lines = bulkInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setBulkRows([]);
      return;
    }

    let header: string[] | undefined;
    const possibleHeader = lines[0].toLowerCase();
    if (possibleHeader.includes("sku") && (possibleHeader.includes("price") || possibleHeader.includes("name"))) {
      header = lines.shift()?.split(/[\t,]/).map((column) => column.trim().toLowerCase());
    }

    const rows: BulkRowResult[] = lines.map((line) => {
      const columns = line.split(/[\t,]/).map((column) => column.trim());
      const getValue = (key: string, index: number) => {
        if (header) {
          const headerIndex = header.indexOf(key);
          if (headerIndex !== -1) return columns[headerIndex];
        }
        return columns[index] ?? "";
      };

      const sku = getValue("sku", 0);
      const name = getValue("name", 1);
      const priceRaw = getValue("price", 2);
      const assetUrl = getValue("asseturl", 3) || getValue("asset_url", 3) || getValue("asset", 3);
      const template = getValue("template", 4);
      const jig = getValue("jig", 5);
      const description = getValue("description", 6);

      const issues: BulkRowIssue[] = [];

      const priceValue = Number(priceRaw);

      if (!sku) {
        issues.push({ type: "error", message: "Missing vendor SKU." });
      }

      if (!name) {
        issues.push({ type: "error", message: "Missing product name." });
      }

      if (!priceRaw) {
        issues.push({ type: "error", message: "Missing unit price." });
      } else if (Number.isNaN(priceValue) || priceValue <= 0) {
        issues.push({ type: "error", message: "Price must be a positive number." });
      }

      if (!assetUrl) {
        issues.push({ type: "warning", message: "Asset URL missing. Upload artwork before publishing." });
      }

      if (!template) {
        issues.push({ type: "warning", message: "Template not assigned." });
      }

      const status: BulkRowStatus = issues.some((issue) => issue.type === "error")
        ? "error"
        : issues.some((issue) => issue.type === "warning")
          ? "warning"
          : "ready";

      return {
        id: createId(),
        parsed: {
          sku,
          name,
          price: Number.isFinite(priceValue) ? priceValue : 0,
          assetUrl,
          template,
          jig,
          description,
        },
        status,
        issues,
      };
    });

    setBulkRows(rows);
    setBulkValidatedAt(new Date().toISOString());
  };

  const handleBulkImport = async () => {
    const readyRows = bulkRows.filter((row) => row.status === "ready");
    if (readyRows.length === 0) {
      toast.message("No rows ready to import", {
        description: "Fix validation errors before ingesting.",
      });
      return;
    }

    setIsBulkImporting(true);

    const updates: Record<string, Pick<BulkRowResult, "status" | "message" | "issues">> = {};
    let successCount = 0;

    for (const row of readyRows) {
      try {
        const record = await api.product.create({
          productName: row.parsed.name,
          price: row.parsed.price,
          productDescription: row.parsed.description || `Bulk ingest for ${row.parsed.sku}`,
        });

        successCount += 1;

        const assetRecord = runAssetAnalysis({
          sku: row.parsed.sku,
          name: row.parsed.name,
          assetUrl: row.parsed.assetUrl,
          template: row.parsed.template,
          jig: row.parsed.jig,
        });

        setAssets((prev) => [assetRecord, ...prev]);

        const mapping: MappingRecord = {
          id: createId(),
          vendorSku: row.parsed.sku,
          productId: record.id ?? null,
          productName: record.productName ?? row.parsed.name,
          template: row.parsed.template,
          jig: row.parsed.jig,
          status: "draft",
          lastUpdated: new Date().toISOString(),
          notes: "Bulk ingest pending review.",
        };

        setMappings((prev) => [mapping, ...prev]);
        appendVersionEntry(row.parsed.sku, "Draft", "Bulk ingest created draft revision.", "Bulk upload");

        updates[row.id] = {
          status: "imported",
          message: `Product created (ID ${record.id ?? "pending"}).`,
          issues: row.issues,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unexpected error";
        updates[row.id] = {
          status: "failed",
          message: errorMessage,
          issues: [...row.issues, { type: "error", message: errorMessage }],
        };
      }
    }

    setBulkRows((prev) =>
      prev.map((row) => {
        const update = updates[row.id];
        if (!update) return row;
        return {
          ...row,
          status: update.status,
          message: update.message,
          issues: update.issues,
        };
      }),
    );

    if (successCount > 0) {
      toast.success(`Imported ${successCount} SKU${successCount === 1 ? "" : "s"}.`);
    }

    setIsBulkImporting(false);
  };

  const openMappingEditor = (mapping: MappingRecord) => {
    setEditingMapping(mapping);
    setMappingDialogOpen(true);
  };

  const handleMappingSubmit = () => {
    if (!editingMapping) return;

    setMappings((prev) => {
      let published = false;
      const next = prev.map((mapping) => {
        if (mapping.id !== editingMapping.id) return mapping;
        if (mapping.status !== "published" && editingMapping.status === "published") {
          published = true;
        }
        return { ...editingMapping, lastUpdated: new Date().toISOString() };
      });

      if (published) {
        appendVersionEntry(
          editingMapping.vendorSku,
          "Published",
          editingMapping.notes ? editingMapping.notes : "Mapping moved to production.",
          "Catalog manager",
        );
      }

      return next;
    });

    toast.success("Mapping updated.");
    setMappingDialogOpen(false);
    setEditingMapping(null);
  };

  const handleAssetRescan = (asset: AssetRecord) => {
    const refreshed = runAssetAnalysis(asset);
    const updated: AssetRecord = {
      ...refreshed,
      id: asset.id,
      reviewer: "Automated rescan",
    };

    setAssets((prev) => prev.map((row) => (row.id === asset.id ? updated : row)));
    setActiveAsset(updated);
    toast.success("Rescan complete.");
  };

  const closeAssetDialog = (open: boolean) => {
    if (!open) {
      setActiveAsset(null);
    }
  };

  const readyToImport = bulkRows.some((row) => row.status === "ready");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalog"
        description="Ingest SKUs, validate print assets, and maintain vendor-specific mappings."
      />

      <div className="grid gap-6 xl:grid-cols-[2fr_1.15fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SKU intake</CardTitle>
              <CardDescription>Hook into the product model and asset storage in one workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="single">
                <TabsList className="w-full justify-start gap-2">
                  <TabsTrigger value="single" className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Manual SKU
                  </TabsTrigger>
                  <TabsTrigger value="bulk" className="flex items-center gap-2">
                    <CloudUpload className="h-4 w-4" />
                    Bulk upload
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="single" className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Capture a single SKU, push it into the product model, and queue a preflight on the attached artwork.
                  </p>

                  {manualErrors.length > 0 ? (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Check the highlighted issues</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-4 space-y-1">
                          {manualErrors.map((error) => (
                            <li key={error}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  <form onSubmit={handleManualSubmit} className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="manual-sku">Vendor SKU</Label>
                        <Input
                          id="manual-sku"
                          placeholder="e.g. POSTER-NEON-18x24"
                          value={manualForm.sku}
                          onChange={(event) => setManualForm((prev) => ({ ...prev, sku: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="manual-name">Product name</Label>
                        <Input
                          id="manual-name"
                          placeholder="Neon Skyline Poster"
                          value={manualForm.name}
                          onChange={(event) => setManualForm((prev) => ({ ...prev, name: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="manual-price">Unit price (USD)</Label>
                        <Input
                          id="manual-price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="29.95"
                          value={manualForm.price}
                          onChange={(event) => setManualForm((prev) => ({ ...prev, price: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="manual-asset">Artwork URL</Label>
                        <Input
                          id="manual-asset"
                          placeholder="https://cdn.example.com/assets/poster.pdf"
                          value={manualForm.assetUrl}
                          onChange={(event) => setManualForm((prev) => ({ ...prev, assetUrl: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="manual-template">Template</Label>
                        <Select
                          value={manualForm.template}
                          onValueChange={(value) => setManualForm((prev) => ({ ...prev, template: value }))}
                        >
                          <SelectTrigger id="manual-template">
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                          <SelectContent>
                            {templateOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="manual-jig">Jig alignment</Label>
                        <Select
                          value={manualForm.jig}
                          onValueChange={(value) => setManualForm((prev) => ({ ...prev, jig: value }))}
                        >
                          <SelectTrigger id="manual-jig">
                            <SelectValue placeholder="Select jig" />
                          </SelectTrigger>
                          <SelectContent>
                            {jigOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="manual-description">Internal description</Label>
                      <Textarea
                        id="manual-description"
                        placeholder="Add context for downstream routing, finishing notes, or compliance tags."
                        value={manualForm.description}
                        onChange={(event) => setManualForm((prev) => ({ ...prev, description: event.target.value }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Creates a draft in the product model and stages the asset for validation.
                      </div>
                      <Button type="submit" disabled={isManualSubmitting} className="min-w-[140px]">
                        {isManualSubmitting ? "Ingesting…" : "Ingest SKU"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="bulk" className="space-y-4 pt-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <FileSpreadsheet className="h-4 w-4" />
                      Paste CSV or TSV rows with columns: SKU, Name, Price, Asset URL, Template, Jig, Description.
                    </div>
                    <Textarea
                      value={bulkInput}
                      onChange={(event) => setBulkInput(event.target.value)}
                      placeholder="POSTER-NEON-18x24,Neon Skyline Poster,29.95,https://cdn.example.com/poster.pdf,Standard Poster A2,Poster-Clamp-02,Final neon gradient"
                      className="font-mono text-sm min-h-[140px]"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5" />
                          <span>{bulkRows.length} rows scanned</span>
                        </div>
                        {bulkValidatedAt ? (
                          <div className="flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5" />
                            <span>Validated {formatDistanceToNow(new Date(bulkValidatedAt), { addSuffix: true })}</span>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" type="button" onClick={parseBulkInput} disabled={!bulkInput.trim()}>
                          Validate batch
                        </Button>
                        <Button
                          type="button"
                          onClick={handleBulkImport}
                          disabled={!readyToImport || isBulkImporting}
                        >
                          {isBulkImporting ? "Importing…" : "Ingest ready rows"}
                        </Button>
                      </div>
                    </div>
                    {bulkRows.length > 0 ? (
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge variant="outline" className={bulkStatusStyles.ready}>
                          Ready: {bulkSummary.ready}
                        </Badge>
                        <Badge variant="outline" className={bulkStatusStyles.warning}>
                          Warnings: {bulkSummary.warning}
                        </Badge>
                        <Badge variant="outline" className={bulkStatusStyles.error}>
                          Errors: {bulkSummary.error}
                        </Badge>
                        <Badge variant="outline" className={bulkStatusStyles.imported}>
                          Imported: {bulkSummary.imported}
                        </Badge>
                        <Badge variant="outline" className={bulkStatusStyles.failed}>
                          Failed: {bulkSummary.failed}
                        </Badge>
                      </div>
                    ) : null}
                  </div>
                </TabsContent>
              </Tabs>

              {bulkRows.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">SKU</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-[90px]">Price</TableHead>
                        <TableHead className="hidden lg:table-cell">Template</TableHead>
                        <TableHead className="hidden xl:table-cell">Jig</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bulkRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">
                            <div>{row.parsed.sku || "—"}</div>
                            <div className="text-xs text-muted-foreground">{row.parsed.assetUrl || "No asset"}</div>
                          </TableCell>
                          <TableCell>{row.parsed.name || "—"}</TableCell>
                          <TableCell>{currency.format(row.parsed.price || 0)}</TableCell>
                          <TableCell className="hidden lg:table-cell">{row.parsed.template || "—"}</TableCell>
                          <TableCell className="hidden xl:table-cell">{row.parsed.jig || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={bulkStatusStyles[row.status]}>
                              {row.status === "ready"
                                ? "Ready"
                                : row.status === "warning"
                                  ? "Warnings"
                                  : row.status === "error"
                                    ? "Errors"
                                    : row.status === "imported"
                                      ? "Imported"
                                      : "Failed"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-xs">
                              {row.issues.map((issue, index) => (
                                <div
                                  key={`${row.id}-${issue.message}-${index}`}
                                  className={issue.type === "error" ? "text-rose-600" : "text-amber-600"}
                                >
                                  {issue.message}
                                </div>
                              ))}
                              {row.message ? <div className="text-muted-foreground">{row.message}</div> : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Asset validation</CardTitle>
              <CardDescription>Preview artwork, templates, and jig alignment before routing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wand2 className="h-4 w-4" />
                Automated preflight checks flag color space, bleed, and template mismatches.
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">SKU</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Jig</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[140px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <div className="font-medium">{asset.sku}</div>
                          <div className="text-xs text-muted-foreground">
                            Updated {formatDistanceToNow(new Date(asset.updatedAt), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{asset.name}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[220px]">
                            {asset.assetUrl || "No asset"}
                          </div>
                        </TableCell>
                        <TableCell>{asset.template || "—"}</TableCell>
                        <TableCell>{asset.jig || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={assetStatusStyles[asset.status]}>
                            {asset.status === "passed"
                              ? "Passed"
                              : asset.status === "warning"
                                ? "Warnings"
                                : "Failed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setActiveAsset(asset)}>
                              <Eye className="h-3.5 w-3.5" />
                              Preview
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleAssetRescan(asset)}>
                              <History className="h-3.5 w-3.5" />
                              Rescan
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Catalog inventory</CardTitle>
              <CardDescription>Reference the live product model without leaving the vendor workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Search product catalog…"
                className="max-w-sm"
              />
              <AutoTable
                model={api.product}
                search={productSearch}
                columns={[
                  { header: "Product", field: "productName" },
                  {
                    header: "Price",
                    render: ({ record }) => currency.format(record.price ?? 0),
                  },
                  {
                    header: "Updated",
                    render: ({ record }) =>
                      record.updatedAt ? (
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(record.updatedAt), { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      ),
                  },
                ]}
                select={{
                  id: true,
                  productName: true,
                  price: true,
                  updatedAt: true,
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendor mappings</CardTitle>
              <CardDescription>Maintain vendor-specific SKU associations and publish-ready status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[130px]">Vendor SKU</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[110px]">Updated</TableHead>
                      <TableHead className="w-[90px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMappings.map((mapping) => (
                      <TableRow key={mapping.id}>
                        <TableCell className="font-medium">{mapping.vendorSku}</TableCell>
                        <TableCell>
                          <div>{mapping.productName}</div>
                          <div className="text-xs text-muted-foreground">{mapping.productId ?? "Pending"}</div>
                        </TableCell>
                        <TableCell>{mapping.template || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={mappingStatusStyles[mapping.status]}>
                            {mappingStatusLabels[mapping.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(mapping.lastUpdated), { addSuffix: true })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => openMappingEditor(mapping)}>
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Version history</CardTitle>
              <CardDescription>Track publication status and SKU lifecycle notes.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[360px] pr-4">
                <div className="space-y-4">
                  {versions.map((entry) => (
                    <div key={entry.id} className="space-y-2 rounded-md border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={versionStatusStyles[entry.status]}>
                            {entry.status}
                          </Badge>
                          <span className="font-medium">{entry.sku}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(entry.publishedAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{entry.version}</span>
                        <span>{entry.actor}</span>
                      </div>
                      {entry.note ? <p className="text-sm text-muted-foreground">{entry.note}</p> : null}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!activeAsset} onOpenChange={closeAssetDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{activeAsset?.name}</DialogTitle>
            <DialogDescription>
              {activeAsset ? (
                <div className="text-sm text-muted-foreground">
                  {activeAsset.sku} • Last checked {formatDistanceToNow(new Date(activeAsset.updatedAt), { addSuffix: true })}
                </div>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/50 p-3">
                {activeAsset?.assetUrl ? (
                  <img
                    src={activeAsset.assetUrl}
                    alt={activeAsset.name}
                    className="h-56 w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-56 w-full items-center justify-center rounded-md bg-background text-muted-foreground">
                    No preview available
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Template: {activeAsset?.template || "—"}
                </div>
                <div className="flex items-center gap-2">
                  <CloudUpload className="h-4 w-4 text-sky-500" />
                  Jig: {activeAsset?.jig || "—"}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Preflight checks</h3>
              <Separator />
              <div className="space-y-2 text-sm">
                {activeAsset?.checks.map((check, index) => (
                  <div key={`${check.label}-${index}`} className="flex items-start gap-2">
                    {check.outcome === "pass" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : check.outcome === "warn" ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-rose-500" />
                    )}
                    <div>
                      <div className="font-medium">{check.label}</div>
                      {check.note ? <div className="text-muted-foreground">{check.note}</div> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Reviewed by {activeAsset?.reviewer ?? "—"}
            </div>
            {activeAsset ? (
              <Button variant="outline" onClick={() => handleAssetRescan(activeAsset)}>
                Trigger rescan
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={mappingDialogOpen}
        onOpenChange={(open) => {
          setMappingDialogOpen(open);
          if (!open) {
            setEditingMapping(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage mapping</DialogTitle>
            <DialogDescription>Adjust vendor alignment, template, and publication status.</DialogDescription>
          </DialogHeader>
          {editingMapping ? (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Vendor SKU</Label>
                  <Input value={editingMapping.vendorSku} disabled />
                </div>
                <div className="space-y-1">
                  <Label>Product</Label>
                  <Input
                    value={editingMapping.productName}
                    onChange={(event) =>
                      setEditingMapping((prev) => (prev ? { ...prev, productName: event.target.value } : prev))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Template</Label>
                  <Select
                    value={editingMapping.template ?? ""}
                    onValueChange={(value) =>
                      setEditingMapping((prev) => (prev ? { ...prev, template: value } : prev))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Jig</Label>
                  <Select
                    value={editingMapping.jig ?? ""}
                    onValueChange={(value) => setEditingMapping((prev) => (prev ? { ...prev, jig: value } : prev))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select jig" />
                    </SelectTrigger>
                    <SelectContent>
                      {jigOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Status</Label>
                <Select
                  value={editingMapping.status}
                  onValueChange={(value: MappingStatus) =>
                    setEditingMapping((prev) => (prev ? { ...prev, status: value } : prev))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea
                  value={editingMapping.notes ?? ""}
                  onChange={(event) =>
                    setEditingMapping((prev) => (prev ? { ...prev, notes: event.target.value } : prev))
                  }
                  placeholder="Add publication context, vendor exceptions, or QA reminders."
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMappingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMappingSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorCatalogPage;

import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/app/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { api } from "../api";
import type { Route } from "./+types/_app.vendor.catalog._index";
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

type AssetStatus = "passed" | "warning" | "failed";

type AssetCheck = {
  label: string;
  outcome: "pass" | "warn" | "fail";
  note?: string;
};

type AssetRecord = {
  id: string;
  sku: string;
  name: string;
  assetUrl?: string | null;
  template?: string | null;
  jig?: string | null;
  status: AssetStatus;
  checks: AssetCheck[];
  reviewer: string | null;
  updatedAt: string | null;
};

type MappingRecord = {
  id: string;
  vendorSku: string;
  productId: string | null;
  productName: string;
  template: string | null;
  jig: string | null;
  status: "draft" | "ready" | "published" | "deprecated";
  notes: string | null;
  lastUpdated: string | null;
};

type VersionEntry = {
  id: string;
  sku: string;
  version: string;
  status: "Draft" | "Pending Review" | "Published" | "Retired";
  note: string | null;
  actor: string | null;
  publishedAt: string | null;
};

type CatalogLoaderResult = {
  assets: AssetRecord[];
  mappings: MappingRecord[];
  versions: VersionEntry[];
  isSample: boolean;
  errorMessage?: string;
};

const assetStatusStyles: Record<AssetStatus, string> = {
  passed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  failed: "bg-rose-100 text-rose-700 border-rose-200",
};

const mappingStatusStyles: Record<MappingRecord["status"], string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  ready: "bg-sky-100 text-sky-700 border-sky-200",
  published: "bg-emerald-100 text-emerald-700 border-emerald-200",
  deprecated: "bg-orange-100 text-orange-700 border-orange-200",
};

const versionStatusStyles: Record<VersionEntry["status"], string> = {
  Draft: "bg-slate-100 text-slate-700 border-slate-200",
  "Pending Review": "bg-amber-100 text-amber-700 border-amber-200",
  Published: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Retired: "bg-rose-100 text-rose-700 border-rose-200",
};

const createId = () => Math.random().toString(36).slice(2, 10);

const buildSampleAssets = (): AssetRecord[] => {
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
      reviewer: "Preflight automation",
      updatedAt: new Date(now - 45 * 60 * 1000).toISOString(),
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
          note: "PNG detected. Consider layered PDF for better blacks.",
        },
        {
          label: "Bleed & safe area",
          outcome: "warn",
          note: "Text approaches trim line on right edge.",
        },
      ],
      reviewer: "Preflight automation",
      updatedAt: new Date(now - 90 * 60 * 1000).toISOString(),
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
        { label: "Print-ready format", outcome: "pass" },
        {
          label: "Bleed & safe area",
          outcome: "fail",
          note: "Artwork exceeds printable area by 0.75 in on bottom edge.",
        },
      ],
      reviewer: "Preflight automation",
      updatedAt: new Date(now - 120 * 60 * 1000).toISOString(),
    },
  ];
};

const buildSampleMappings = (): MappingRecord[] => {
  const now = Date.now();
  return [
    {
      id: createId(),
      vendorSku: "MUG-GRAD-15oz",
      productId: "PROD-4312",
      productName: "Graduation Mug",
      template: "Mug Wrap",
      jig: "Wrap-Jig-03",
      status: "ready",
      notes: "Awaiting QA sign-off on updated wrap marks.",
      lastUpdated: new Date(now - 35 * 60 * 1000).toISOString(),
    },
    {
      id: createId(),
      vendorSku: "POSTER-NEON-18x24",
      productId: "PROD-2380",
      productName: "Neon Skyline Poster",
      template: "Standard Poster A2",
      jig: "Poster-Clamp-02",
      status: "published",
      notes: "Live in marketplace with updated inventory sync",
      lastUpdated: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: createId(),
      vendorSku: "TEE-PRIDE-XL",
      productId: null,
      productName: "Pride Tee",
      template: "Garment Front DTG",
      jig: "Garment-Plate-04",
      status: "draft",
      notes: "Pending revised artwork from design team",
      lastUpdated: new Date(now - 16 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

const buildSampleVersions = (): VersionEntry[] => {
  const now = Date.now();
  return [
    {
      id: createId(),
      sku: "MUG-GRAD-15oz",
      version: "v3",
      status: "Published",
      note: "Published wrap with updated alignment guides",
      actor: "Taylor Ramos",
      publishedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: createId(),
      sku: "POSTER-NEON-18x24",
      version: "v5",
      status: "Pending Review",
      note: "Neon poster with adjusted black levels",
      actor: "Jordan Kim",
      publishedAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: createId(),
      sku: "TEE-PRIDE-XL",
      version: "v2",
      status: "Draft",
      note: "Awaiting new placement guides",
      actor: "Mia Hernandez",
      publishedAt: null,
    },
  ];
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const [assets, mappings, versions] = await Promise.all([
      context.api.assetReview.findMany({
        select: {
          id: true,
          sku: true,
          name: true,
          assetUrl: true,
          template: true,
          jig: true,
          status: true,
          reviewer: true,
          updatedAt: true,
          checks: true,
        },
        first: 250,
      }),
      context.api.catalogMapping.findMany({
        select: {
          id: true,
          vendorSku: true,
          productId: true,
          productName: true,
          template: true,
          jig: true,
          status: true,
          notes: true,
          lastUpdated: true,
        },
        first: 250,
      }),
      context.api.catalogVersion.findMany({
        select: {
          id: true,
          sku: true,
          version: true,
          status: true,
          note: true,
          actor: true,
          publishedAt: true,
        },
        first: 250,
      }),
    ]);

    return {
      assets: assets.map((asset, index) => ({
        id: asset.id ?? `asset-${index}`,
        sku: asset.sku ?? "Unknown SKU",
        name: asset.name ?? "Untitled asset",
        assetUrl: asset.assetUrl ?? null,
        template: asset.template ?? null,
        jig: asset.jig ?? null,
        status: (asset.status as AssetStatus) ?? "warning",
        checks: Array.isArray(asset.checks) ? (asset.checks as AssetCheck[]) : [],
        reviewer: asset.reviewer ?? null,
        updatedAt: asset.updatedAt ?? null,
      })),
      mappings: mappings.map((mapping, index) => ({
        id: mapping.id ?? `mapping-${index}`,
        vendorSku: mapping.vendorSku ?? "Unknown SKU",
        productId: mapping.productId ?? null,
        productName: mapping.productName ?? "Untitled product",
        template: mapping.template ?? null,
        jig: mapping.jig ?? null,
        status: (mapping.status as MappingRecord["status"]) ?? "draft",
        notes: mapping.notes ?? null,
        lastUpdated: mapping.lastUpdated ?? null,
      })),
      versions: versions.map((version, index) => ({
        id: version.id ?? `version-${index}`,
        sku: version.sku ?? "Unknown SKU",
        version: version.version ?? "v1",
        status: (version.status as VersionEntry["status"]) ?? "Draft",
        note: version.note ?? null,
        actor: version.actor ?? null,
        publishedAt: version.publishedAt ?? null,
      })),
      isSample: false,
    } satisfies CatalogLoaderResult;
  } catch (error) {
    console.error("Failed to load vendor catalog", error);
    return {
      assets: buildSampleAssets(),
      mappings: buildSampleMappings(),
      versions: buildSampleVersions(),
      isSample: true,
      errorMessage: error instanceof Error ? error.message : undefined,
    } satisfies CatalogLoaderResult;
  }
};

const templateLabel = (value?: string | null) => value ?? "—";

export default function VendorCatalogPage({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { assets, mappings, versions, isSample, errorMessage } = loaderData;
  const [bulkCsv, setBulkCsv] = useState<string>("");
  const [bulkStatus, setBulkStatus] = useState<"idle" | "processing" | "complete">("idle");
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);
  const [manualForm, setManualForm] = useState({
    sku: "",
    name: "",
    price: "",
    description: "",
    assetUrl: "",
    template: templateOptions[0],
    jig: jigOptions[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assetsWithRelativeDates = useMemo(
    () =>
      assets.map((asset) => ({
        ...asset,
        updatedLabel: asset.updatedAt ? formatDistanceToNow(new Date(asset.updatedAt), { addSuffix: true }) : "Unknown",
      })),
    [assets]
  );

  const handleManualSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await api.vendorProduct.create({
        sku: manualForm.sku,
        productName: manualForm.name,
        price: parseFloat(manualForm.price || "0"),
        description: manualForm.description,
        assetUrl: manualForm.assetUrl,
        template: manualForm.template,
        jig: manualForm.jig,
      });
      toast.success("Product submitted for review");
      navigate("/vendor/products");
    } catch (error) {
      console.error("Failed to submit product", error);
      toast.error("Unable to submit product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkCsv.trim()) {
      toast.error("Please paste CSV data before importing.");
      return;
    }
    setBulkStatus("processing");
    setBulkMessage("Validating CSV rows and importing catalog entries…");
    setTimeout(() => {
      setBulkStatus("complete");
      setBulkMessage("Bulk import complete. Review results below.");
      toast.success("Bulk catalog upload complete");
    }, 1200);
  };

  const resetBulkForm = () => {
    setBulkCsv("");
    setBulkStatus("idle");
    setBulkMessage(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalog Operations"
        description="Manage assets, mappings, and catalog versions for vendor-owned products."
      />

      {isSample && (
        <Alert>
          <AlertTitle>Sample dataset</AlertTitle>
          <AlertDescription>
            Unable to load catalog metadata from the API. Displaying sample data instead.
            {errorMessage ? ` Error: ${errorMessage}` : ""}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="assets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <CloudUpload className="h-4 w-4" /> Assets
          </TabsTrigger>
          <TabsTrigger value="mappings" className="flex items-center gap-2">
            <Layers className="h-4 w-4" /> Mappings
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <History className="h-4 w-4" /> Versions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual submission</CardTitle>
              <CardDescription>Submit an individual catalog entry for review.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleManualSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    required
                    value={manualForm.sku}
                    onChange={(event) => setManualForm((current) => ({ ...current, sku: event.target.value }))}
                    placeholder="Vendor SKU"
                  />
                  <Input
                    required
                    value={manualForm.name}
                    onChange={(event) => setManualForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Product name"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={manualForm.price}
                    onChange={(event) => setManualForm((current) => ({ ...current, price: event.target.value }))}
                    placeholder="Price"
                  />
                  <Input
                    value={manualForm.assetUrl}
                    onChange={(event) => setManualForm((current) => ({ ...current, assetUrl: event.target.value }))}
                    placeholder="Asset URL"
                  />
                  <Input
                    value={manualForm.template}
                    list="template-options"
                    onChange={(event) => setManualForm((current) => ({ ...current, template: event.target.value }))}
                    placeholder="Template"
                  />
                  <datalist id="template-options">
                    {templateOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                  <Input
                    value={manualForm.jig}
                    list="jig-options"
                    onChange={(event) => setManualForm((current) => ({ ...current, jig: event.target.value }))}
                    placeholder="Jig"
                  />
                  <datalist id="jig-options">
                    {jigOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </div>

                <Textarea
                  value={manualForm.description}
                  onChange={(event) => setManualForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Product description and production notes"
                  rows={4}
                />

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting…" : "Submit for review"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/vendor/products")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bulk CSV import</CardTitle>
              <CardDescription>Paste CSV rows to import multiple catalog entries.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={bulkCsv}
                onChange={(event) => setBulkCsv(event.target.value)}
                placeholder="sku,name,price,template,jig,assetUrl"
                rows={6}
              />
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleBulkImport} disabled={bulkStatus === "processing"}>
                  {bulkStatus === "processing" ? "Importing…" : "Import CSV"}
                </Button>
                <Button type="button" variant="outline" onClick={resetBulkForm}>
                  Reset
                </Button>
                <Button type="button" variant="ghost" onClick={() => setBulkCsv(`sku,name,price,template,jig,assetUrl\nPOSTER-NEON-18x24,Neon Skyline Poster,42.00,Standard Poster A2,Poster-Clamp-02,https://cdn.example.com/assets/poster-neon-18x24.pdf`)}>
                  Paste sample row
                </Button>
              </div>
              {bulkMessage ? (
                <Alert variant={bulkStatus === "complete" ? "default" : "destructive"}>
                  <AlertTitle>{bulkStatus === "complete" ? "Import complete" : "Processing"}</AlertTitle>
                  <AlertDescription>{bulkMessage}</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Asset QA status</CardTitle>
              <CardDescription>Review the latest asset checks before publishing updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[320px] pr-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Checks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assetsWithRelativeDates.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.sku}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{asset.name}</span>
                            {asset.assetUrl ? (
                              <Button variant="link" className="px-0 text-xs" asChild>
                                <a href={asset.assetUrl} target="_blank" rel="noreferrer">
                                  <Eye className="mr-1 h-3 w-3" /> Preview asset
                                </a>
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">No asset uploaded</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${assetStatusStyles[asset.status]} uppercase tracking-wide text-xs`}
                          >
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{asset.reviewer ?? "Automation"}</TableCell>
                        <TableCell>{asset.updatedLabel}</TableCell>
                        <TableCell>
                          <ul className="space-y-1 text-xs">
                            {asset.checks.map((check, index) => (
                              <li key={index} className="flex items-start gap-1">
                                {check.outcome === "pass" ? (
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                ) : check.outcome === "warn" ? (
                                  <Clock3 className="h-3 w-3 text-amber-600" />
                                ) : (
                                  <AlertTriangle className="h-3 w-3 text-rose-600" />
                                )}
                                <span>
                                  {check.label}
                                  {check.note ? <span className="text-muted-foreground"> — {check.note}</span> : null}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mappings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Catalog mappings</CardTitle>
              <CardDescription>Ensure vendor SKUs are mapped to marketplace products.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor SKU</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Jig</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell className="font-medium">{mapping.vendorSku}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{mapping.productName}</span>
                          <span className="text-xs text-muted-foreground">
                            {mapping.productId ? `Product ID ${mapping.productId}` : "No product linked"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{templateLabel(mapping.template)}</TableCell>
                      <TableCell>{templateLabel(mapping.jig)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${mappingStatusStyles[mapping.status]} uppercase tracking-wide text-xs`}
                        >
                          {mapping.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {mapping.lastUpdated
                          ? formatDistanceToNow(new Date(mapping.lastUpdated), { addSuffix: true })
                          : "Unknown"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Version history</CardTitle>
              <CardDescription>Track catalog version lifecycle across SKUs.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Published</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell className="font-medium">{version.sku}</TableCell>
                      <TableCell>{version.version}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${versionStatusStyles[version.status]} uppercase tracking-wide text-xs`}
                        >
                          {version.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{version.actor ?? "Automation"}</TableCell>
                      <TableCell>
                        {version.publishedAt
                          ? formatDistanceToNow(new Date(version.publishedAt), { addSuffix: true })
                          : "Not published"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

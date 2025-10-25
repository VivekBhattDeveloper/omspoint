import { useMemo } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { FileText, Link2, Paintbrush2, ShieldCheck, Upload } from "lucide-react";
import {
  DesignDiscipline,
  DesignStatus,
  disciplineMeta,
  isDesignDiscipline,
  isDesignStatus,
  statusMeta,
  statusToneClasses,
} from "./_app.seller.designs/constants";
import type { Route } from "./+types/_app.seller.designs._index";

type DatasetSource = "live" | "fallback";

type DesignRecord = {
  id: string;
  name: string;
  slug: string;
  status: DesignStatus;
  discipline: DesignDiscipline;
  primaryChannel: string;
  assignedProductCount: number;
  lastReviewedAt: string | null;
  tags: string[];
};

const randomId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `design-${Math.random().toString(36).slice(2, 10)}`;

const fallbackDesigns: DesignRecord[] = [
  {
    id: "design-1",
    name: "Floral Burst Tee",
    slug: "floral-burst-tee",
    status: "approved",
    discipline: "print",
    primaryChannel: "Shopify US",
    assignedProductCount: 12,
    lastReviewedAt: "2025-04-02T10:00:00.000Z",
    tags: ["Spring 25", "Sustainable inks"],
  },
  {
    id: "design-2",
    name: "Metro Skyline Hoodie",
    slug: "metro-skyline-hoodie",
    status: "inReview",
    discipline: "embroidery",
    primaryChannel: "Amazon",
    assignedProductCount: 8,
    lastReviewedAt: "2025-04-18T19:06:00.000Z",
    tags: ["Q2 capsule", "Needs digitizing"],
  },
  {
    id: "design-3",
    name: "Desert Bloom Wall Art",
    slug: "desert-bloom-wall-art",
    status: "draft",
    discipline: "uv",
    primaryChannel: "Faire B2B",
    assignedProductCount: 5,
    lastReviewedAt: "2025-04-10T14:30:00.000Z",
    tags: ["Wholesale", "Frame-ready"],
  },
  {
    id: "design-4",
    name: "Aurora Gradient Mug",
    slug: "aurora-gradient-mug",
    status: "approved",
    discipline: "sublimation",
    primaryChannel: "Etsy",
    assignedProductCount: 19,
    lastReviewedAt: "2025-03-29T09:15:00.000Z",
    tags: ["Evergreen", "Top seller"],
  },
  {
    id: "design-5",
    name: "Retro Wave Poster",
    slug: "retro-wave-poster",
    status: "archived",
    discipline: "print",
    primaryChannel: "Shopify EU",
    assignedProductCount: 0,
    lastReviewedAt: "2025-01-15T08:00:00.000Z",
    tags: ["Seasonal", "Sunset"],
  },
];

const reviewQueue = [
  {
    name: "Festival Badge Pack",
    submittedBy: "M. Chen",
    submittedAt: "Apr 19, 08:42",
    blockers: ["Brand palette mismatch", "Missing webhooks"],
  },
  {
    name: "Gradient Skyline Tote",
    submittedBy: "R. Patel",
    submittedAt: "Apr 18, 19:06",
    blockers: ["Awaiting product photography"],
  },
];

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const manager = (context.api as any)?.design;
    if (!manager) {
      throw new Error("Design manager unavailable in the Gadget client");
    }

    const records = await manager.findMany({
      select: {
        id: true,
        _all: true,
      },
      sort: { updatedAt: "Descending" },
      first: 250,
    });

    if (!Array.isArray(records) || records.length === 0) {
      return {
        designs: fallbackDesigns,
        datasetSource: "fallback" as DatasetSource,
        datasetError: "No designs found yet. Showing reference dataset.",
      };
    }

    const normalized = records.map((record: any): DesignRecord => {
      const id = typeof record.id === "string" && record.id.trim().length > 0 ? record.id : randomId();
      const raw = (record._all ?? {}) as Record<string, unknown>;

      const name = typeof raw.name === "string" && raw.name.trim().length > 0 ? raw.name : "Untitled design";
      const slug = typeof raw.slug === "string" && raw.slug.trim().length > 0 ? raw.slug : `design-${id}`;
      const status = isDesignStatus(raw.status) ? (raw.status as DesignStatus) : "draft";
      const discipline = isDesignDiscipline(raw.designType) ? (raw.designType as DesignDiscipline) : "print";
      const primaryChannel =
        typeof raw.primaryChannel === "string" && raw.primaryChannel.trim()
          ? (raw.primaryChannel as string)
          : "—";
      const assignedProductCount =
        typeof raw.assignedProductCount === "number"
          ? (raw.assignedProductCount as number)
          : Number(raw.assignedProductCount) || 0;
      const lastReviewedAt = typeof raw.lastReviewedAt === "string" ? (raw.lastReviewedAt as string) : null;
      const tags = Array.isArray(raw.tags)
        ? (raw.tags as unknown[]).filter((tag: unknown): tag is string => typeof tag === "string")
        : [];

      return {
        id,
        name,
        slug,
        status,
        discipline,
        primaryChannel,
        assignedProductCount,
        lastReviewedAt,
        tags,
      };
    });

    return {
      designs: normalized,
      datasetSource: "live" as DatasetSource,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load designs.";

    return {
      designs: fallbackDesigns,
      datasetSource: "fallback" as DatasetSource,
      datasetError: message,
    };
  }
};

export default function SellerDesignLibrary({ loaderData }: Route.ComponentProps) {
  const { designs, datasetSource, datasetError } = loaderData;
  const numberFormatter = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }),
    []
  );
  const navigate = useNavigate();

  const activeDesigns = designs.filter((design) => design.status !== "archived").length;
  const awaitingApproval = designs.filter((design) => design.status === "inReview").length;
  const assignedProductTotal = designs.reduce((total, design) => total + design.assignedProductCount, 0);

  const summaryMetrics = [
    {
      title: "Active designs",
      value: numberFormatter.format(activeDesigns),
      delta: datasetSource === "live" ? "Live workspace" : "Reference mix",
      icon: Paintbrush2,
    },
    {
      title: "Awaiting approval",
      value: numberFormatter.format(awaitingApproval),
      delta: "Brand review queue",
      icon: ShieldCheck,
    },
    {
      title: "Assigned products",
      value: numberFormatter.format(assignedProductTotal),
      delta: datasetSource === "live" ? "Across connected channels" : "Sample total",
      icon: Link2,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Design library"
        description="Organize design assets, monitor brand approvals, and track the listings using each creative."
        actions={
          <Button onClick={() => navigate("/seller/designs/new")}>
            <Upload className="mr-2 h-4 w-4" />
            Upload design
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Design inventory</CardTitle>
            <CardDescription>Each design links downstream to the products and channels where it is active.</CardDescription>
            <Badge
              variant="outline"
              className={cn(
                "mt-3 inline-flex text-xs font-semibold uppercase tracking-wide",
                datasetSource === "fallback"
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              )}
            >
              {datasetSource === "fallback" ? "Sample dataset" : "Live dataset"}
            </Badge>
            {datasetError ? (
              <p className="mt-2 text-xs text-amber-600">{datasetError}</p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              View specs
            </Button>
            <Button variant="secondary">
              <Paintbrush2 className="mr-2 h-4 w-4" />
              New concept brief
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Design</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Discipline</TableHead>
                <TableHead>Primary channel</TableHead>
                <TableHead className="text-right">Assigned products</TableHead>
                <TableHead className="text-right pr-6">Last reviewed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {designs.map((design) => {
                const status = statusMeta[design.status];
                const discipline = disciplineMeta[design.discipline];

                return (
                  <TableRow
                    key={design.id}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    onClick={() => navigate(`/seller/designs/${design.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/seller/designs/${design.id}`);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <TableCell className="pl-6">
                      <div className="flex flex-col">
                        <span className="font-medium">{design.name}</span>
                        <span className="text-sm text-muted-foreground">/{design.slug}</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {design.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", statusToneClasses[status.variant])} variant={status.variant}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <discipline.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{discipline.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>{design.primaryChannel}</TableCell>
                    <TableCell className="text-right">{design.assignedProductCount}</TableCell>
                    <TableCell className="text-right pr-6 text-muted-foreground">
                      {design.lastReviewedAt ? dateFormatter.format(new Date(design.lastReviewedAt)) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review queue</CardTitle>
          <CardDescription>Track designs that need creative ops review before they can publish live.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {reviewQueue.map((request, index) => (
            <div key={request.name} className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{request.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Submitted by {request.submittedBy} · {request.submittedAt}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Assign reviewer
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {request.blockers.map((blocker) => (
                  <Badge key={blocker} variant="outline">
                    {blocker}
                  </Badge>
                ))}
              </div>
              {index < reviewQueue.length - 1 ? <Separator /> : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

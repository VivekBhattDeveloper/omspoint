import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Archive, CheckCircle2, Download, Loader2, Send, Trash2, X } from "lucide-react";
import { api } from "../api";
import { slugify } from "@/lib/slug";
import {
  DESIGN_DISCIPLINES,
  DESIGN_STATUSES,
  DesignDiscipline,
  DesignStatus,
  disciplineMeta,
  isDesignDiscipline,
  isDesignStatus,
  statusMeta,
  statusToneClasses,
} from "./_app.seller.designs/constants";
import type { Route } from "./+types/_app.seller.designs.$id";

type DatasetSource = "live" | "fallback";

type DesignDetail = {
  id: string;
  name: string;
  slug: string;
  status: DesignStatus;
  designType: DesignDiscipline;
  primaryChannel: string;
  assignedProductCount: number;
  tags: string[];
  previewUrl: string | null;
  notes: string;
  lastReviewedAt: string | null;
  ownerName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type Assignment = {
  id: string;
  title: string;
  status: string;
  channel: string;
  variantCount: number;
  updatedAt: string | null;
};

type LoaderResult = {
  design: DesignDetail;
  assignments: Assignment[];
  datasetSource: DatasetSource;
  loaderError?: string;
  assignmentError?: string;
};

const designDetailSelect = {
  id: true,
  name: true,
  slug: true,
  status: true,
  designType: true,
  primaryChannel: true,
  assignedProductCount: true,
  tags: true,
  previewUrl: true,
  notes: { markdown: true },
  lastReviewedAt: true,
  owner: { id: true, name: true },
  createdAt: true,
  updatedAt: true,
} as const;

const assignmentSelect = {
  id: true,
  title: true,
  status: true,
  channel: true,
  updatedAt: true,
  variants: { edges: { node: { id: true } } },
} as const;

const maxTags = 10;
const maxTagLength = 32;

const sampleDesign: DesignDetail = {
  id: "design-sample",
  name: "Aurora Gradient Mug",
  slug: "aurora-gradient-mug",
  status: "inReview",
  designType: "sublimation",
  primaryChannel: "Etsy",
  assignedProductCount: 3,
  tags: ["Evergreen", "Top seller"],
  previewUrl: "https://cdn.omspoint.dev/samples/aurora-gradient-mug.png",
  notes:
    "- Submit updated packaging mockups before publish.\n- Pending compliance review for dishwasher-safe copy.\n",
  lastReviewedAt: "2025-03-29T09:15:00.000Z",
  ownerName: "Marketplace Demo Seller",
  createdAt: "2025-03-14T11:05:00.000Z",
  updatedAt: "2025-04-11T08:20:00.000Z",
};

const sampleAssignments: Assignment[] = [
  {
    id: "assignment-sample-1",
    title: "Gradient Mug - 15oz",
    status: "active",
    channel: "Shopify US",
    variantCount: 4,
    updatedAt: "2025-04-10T17:45:00.000Z",
  },
  {
    id: "assignment-sample-2",
    title: "Gradient Mug Gift Set",
    status: "draft",
    channel: "Amazon",
    variantCount: 2,
    updatedAt: "2025-04-03T09:30:00.000Z",
  },
];

const normalizeTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  const sanitized = value
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return Array.from(new Set(sanitized));
};

const normalizeDesignRecord = (record: any, fallbackId: string): DesignDetail => {
  const id = typeof record?.id === "string" ? record.id : fallbackId;
  const status = isDesignStatus(record?.status) ? record.status : "draft";
  const designType = isDesignDiscipline(record?.designType) ? record.designType : "print";
  const name =
    typeof record?.name === "string" && record.name.trim().length > 0
      ? record.name
      : "Untitled design";
  const slug =
    typeof record?.slug === "string" && record.slug.trim().length > 0
      ? record.slug
      : `design-${id.slice(-6)}`;

  const notesMarkdown =
    typeof record?.notes?.markdown === "string" ? record.notes.markdown : "";

  return {
    id,
    name,
    slug,
    status,
    designType,
    primaryChannel: typeof record?.primaryChannel === "string" ? record.primaryChannel : "",
    assignedProductCount:
      typeof record?.assignedProductCount === "number" ? record.assignedProductCount : 0,
    tags: normalizeTags(record?.tags),
    previewUrl: typeof record?.previewUrl === "string" ? record.previewUrl : null,
    notes: notesMarkdown,
    lastReviewedAt: typeof record?.lastReviewedAt === "string" ? record.lastReviewedAt : null,
    ownerName: typeof record?.owner?.name === "string" ? record.owner.name : null,
    createdAt: typeof record?.createdAt === "string" ? record.createdAt : null,
    updatedAt: typeof record?.updatedAt === "string" ? record.updatedAt : null,
  };
};

const normalizeAssignments = (records: Array<Record<string, unknown>>): Assignment[] =>
  records.map((record, index) => {
    const variants = (record as {
      variants?: { edges?: Array<Record<string, unknown>> };
    }).variants;
    const variantEdges = Array.isArray(variants?.edges) ? variants.edges : [];

    return {
      id: typeof record.id === "string" ? record.id : `assignment-${index}`,
      title:
        typeof record.title === "string" && record.title.trim().length > 0
          ? record.title
          : "Untitled product",
      status: typeof record.status === "string" ? record.status : "draft",
      channel: typeof record.channel === "string" && record.channel ? record.channel : "manual",
      variantCount: variantEdges.length,
      updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : null,
    };
  });

export const loader = async ({ context, params }: Route.LoaderArgs) => {
  const { id } = params;
  if (!id) {
    throw new Response("Design id is required", { status: 400 });
  }

  try {
    const record = await context.api.design.findOne(id, { select: designDetailSelect });
    if (!record) {
      throw new Error("Design not found");
    }

    const design = normalizeDesignRecord(record, id);

    let assignments: Assignment[] = [];
    let assignmentError: string | undefined;

    try {
      const assignmentRecords = (await context.api.sellerProduct.findMany({
        select: assignmentSelect,
        filter: { designId: { equals: design.id } },
        sort: { updatedAt: "Descending" },
        first: 50,
      })) as Array<Record<string, unknown>>;

      assignments = normalizeAssignments(assignmentRecords);
    } catch (error) {
      assignmentError =
        error instanceof Error
          ? error.message
          : "Unable to load product assignments. Showing sample data.";
      assignments = sampleAssignments;
    }

    return {
      design,
      assignments,
      datasetSource: "live" as DatasetSource,
      assignmentError,
    } satisfies LoaderResult;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load design. Showing sample data.";

    return {
      design: { ...sampleDesign, id },
      assignments: sampleAssignments,
      datasetSource: "fallback" as DatasetSource,
      loaderError: message,
    } satisfies LoaderResult;
  }
};

type FormState = {
  name: string;
  slug: string;
  status: DesignStatus;
  designType: DesignDiscipline;
  primaryChannel: string;
  previewUrl: string;
  notes: string;
  lastReviewedAt: string | null;
};

export default function SellerDesignDetail({ loaderData }: Route.ComponentProps) {
  const { design, assignments, datasetSource, loaderError, assignmentError } = loaderData;
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    name: design.name,
    slug: design.slug,
    status: design.status,
    designType: design.designType,
    primaryChannel: design.primaryChannel,
    previewUrl: design.previewUrl ?? "",
    notes: design.notes,
    lastReviewedAt: design.lastReviewedAt,
  });
  const [tags, setTags] = useState<string[]>(design.tags);
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);
  const [assignedProductCount, setAssignedProductCount] = useState(design.assignedProductCount);
  const [updatedAt, setUpdatedAt] = useState(design.updatedAt);
  const [storedStatus, setStoredStatus] = useState<DesignStatus>(design.status);
  const [storedLastReviewedAt, setStoredLastReviewedAt] = useState<string | null>(
    design.lastReviewedAt,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [slugDirty, setSlugDirty] = useState(false);

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }),
    [],
  );
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }),
    [],
  );
  const dateOnlyFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }),
    [],
  );

  const statusBadge = statusMeta[form.status];
  const disciplineBadge = disciplineMeta[form.designType];
  const DisciplineIcon = disciplineBadge.icon;

  const setFormField =
    <Key extends keyof FormState>(key: Key) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      if (key === "name" && !slugDirty) {
        setForm((current) => ({
          ...current,
          name: value,
          slug: slugify(value),
        }));
        return;
      }
      setForm((current) => ({ ...current, [key]: value }));
    };

  const handleSlugChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSlugDirty(true);
    setForm((current) => ({ ...current, slug: slugify(event.target.value) }));
  };

  const handleStatusChange = (value: string) => {
    setForm((current) => ({ ...current, status: value as DesignStatus }));
  };

  const handleDesignTypeChange = (value: string) => {
    setForm((current) => ({ ...current, designType: value as DesignDiscipline }));
  };

  const handleChannelChange = (value: string) => {
    setForm((current) => ({ ...current, primaryChannel: value }));
  };

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    if (trimmed.length > maxTagLength) {
      setTagError(`Tags must be ${maxTagLength} characters or fewer.`);
      return;
    }
    setTags((current) => {
      if (current.includes(trimmed)) {
        setTagError("Tag already added.");
        return current;
      }
      if (current.length >= maxTags) {
        setTagError(`Limit ${maxTags} tags per design.`);
        return current;
      }
      setTagError(null);
      return [...current, trimmed];
    });
  };

  const removeTag = (tag: string) => {
    setTags((current) => current.filter((value) => value !== tag));
  };

  const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(tagInput);
      setTagInput("");
    }
  };

  const handleTagBlur = () => {
    if (tagInput.trim()) {
      addTag(tagInput);
      setTagInput("");
    }
  };

  const applyNormalized = (next: DesignDetail) => {
    setForm({
      name: next.name,
      slug: next.slug,
      status: next.status,
      designType: next.designType,
      primaryChannel: next.primaryChannel,
      previewUrl: next.previewUrl ?? "",
      notes: next.notes,
      lastReviewedAt: next.lastReviewedAt,
    });
    setTags(next.tags);
    setAssignedProductCount(next.assignedProductCount);
    setUpdatedAt(next.updatedAt);
    setStoredStatus(next.status);
    setStoredLastReviewedAt(next.lastReviewedAt);
    setSlugDirty(false);
  };

  const updateDesign = async (
    payload: Record<string, unknown>,
    successMessage = "Design updated",
  ) => {
    setIsSaving(true);
    setFormError(null);
    try {
      const result = await api.design.update(design.id, payload, { select: designDetailSelect });
      const normalized = normalizeDesignRecord(result, design.id);
      applyNormalized(normalized);
      toast.success(successMessage);
    } catch (error) {
      console.error("Failed to update design", error);
      setFormError(
        error instanceof Error ? error.message : "Unable to update design. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    const trimmedName = form.name.trim();
    if (trimmedName.length < 3) {
      setFormError("Design name must be at least 3 characters long.");
      return;
    }
    const slugValue = form.slug.trim();
    if (!slugValue) {
      setFormError("Slug is required.");
      return;
    }

    const previewValue = form.previewUrl.trim();
    if (form.status === "approved" && !previewValue) {
      setFormError("Attach a preview asset before marking the design as approved.");
      return;
    }

    const payload: Record<string, unknown> = {
      name: trimmedName,
      slug: slugValue,
      status: form.status,
      designType: form.designType,
      primaryChannel: form.primaryChannel || undefined,
      previewUrl: previewValue || undefined,
      tags,
      notes: { markdown: form.notes },
    };

    if (storedStatus !== "approved" && form.status === "approved") {
      payload.lastReviewedAt = new Date().toISOString();
    } else if (storedStatus === "approved" && form.status !== "approved") {
      payload.lastReviewedAt = null;
    }

    await updateDesign(payload);
  };

  const handleRequestReview = async () => {
    if (form.status === "inReview") {
      toast.info("Design is already in review.");
      return;
    }
    await updateDesign(
      {
        status: "inReview",
        lastReviewedAt: storedLastReviewedAt ?? undefined,
      },
      "Review requested",
    );
  };

  const handleMarkApproved = async () => {
    const previewValue = form.previewUrl.trim();
    if (!previewValue) {
      setFormError("Attach a preview asset before approving the design.");
      return;
    }
    const timestamp = new Date().toISOString();
    await updateDesign(
      {
        status: "approved",
        lastReviewedAt: timestamp,
      },
      "Design approved",
    );
  };

  const handleArchive = async () => {
    await updateDesign(
      {
        status: "archived",
        lastReviewedAt: storedLastReviewedAt ?? undefined,
      },
      "Design archived",
    );
  };

  const handleDelete = async () => {
    try {
      setIsSaving(true);
      await api.design.delete(design.id);
      toast.success("Design deleted");
      navigate("/seller/designs");
    } catch (error) {
      console.error("Failed to delete design", error);
      toast.error("Unable to delete design. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const metrics = [
    {
      title: "Assigned products",
      value: numberFormatter.format(assignedProductCount),
      description: "Across seller listings using this design",
    },
    {
      title: "Current status",
      value: statusBadge.label,
      description: `Last change ${updatedAt ? dateFormatter.format(new Date(updatedAt)) : "N/A"}`,
    },
    {
      title: "Last reviewed",
      value: form.lastReviewedAt ? dateOnlyFormatter.format(new Date(form.lastReviewedAt)) : "Not reviewed",
      description: form.lastReviewedAt ? "Approval timestamp" : "Awaiting review outcome",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={form.name || "Design"}
        description={
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`capitalize ${statusToneClasses[statusBadge.variant]}`} variant={statusBadge.variant}>
                {statusBadge.label}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 capitalize">
                <DisciplineIcon className="h-3.5 w-3.5 text-muted-foreground" />
                {disciplineBadge.label}
              </Badge>
              {datasetSource === "fallback" ? (
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  Sample dataset
                </Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium text-foreground">/{form.slug}</span>
              {design.ownerName ? <span>Owner {design.ownerName}</span> : <span>Owner unassigned</span>}
              {updatedAt ? <span>Updated {dateFormatter.format(new Date(updatedAt))}</span> : null}
            </div>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate("/seller/designs")}>
              Back to library
            </Button>
            <Button variant="secondary" onClick={handleRequestReview} disabled={isSaving}>
              <Send className="mr-2 h-4 w-4" />
              Request review
            </Button>
            <Button variant="outline" onClick={handleMarkApproved} disabled={isSaving}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark approved
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        }
      />

      {loaderError ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800">
          <AlertTitle>Using sample design</AlertTitle>
          <AlertDescription>{loaderError}</AlertDescription>
        </Alert>
      ) : null}

      {assignmentError ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800">
          <AlertTitle>Assignments unavailable</AlertTitle>
          <AlertDescription>{assignmentError}</AlertDescription>
        </Alert>
      ) : null}

      {formError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to update design</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{metric.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Design metadata</CardTitle>
            <CardDescription>Update naming, slug, discipline, channels, and notes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="design-name">
                  Name
                </label>
                <Input
                  id="design-name"
                  value={form.name}
                  onChange={setFormField("name")}
                  placeholder="Festival Badge Pack"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="design-slug">
                  Slug
                </label>
                <Input
                  id="design-slug"
                  value={form.slug}
                  onChange={handleSlugChange}
                  placeholder="festival-badge-pack"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="design-status">
                  Status
                </label>
                <Select value={form.status} onValueChange={handleStatusChange}>
                  <SelectTrigger id="design-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGN_STATUSES.map((status) => (
                      <SelectItem key={status} value={status} className="capitalize">
                        {status === "inReview" ? "In review" : status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="design-discipline">
                  Discipline
                </label>
                <Select value={form.designType} onValueChange={handleDesignTypeChange}>
                  <SelectTrigger id="design-discipline">
                    <SelectValue placeholder="Select discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGN_DISCIPLINES.map((discipline) => (
                      <SelectItem key={discipline} value={discipline} className="capitalize">
                        {discipline}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="design-channel">
                  Primary channel
                </label>
                <Input
                  id="design-channel"
                  value={form.primaryChannel}
                  onChange={setFormField("primaryChannel")}
                  placeholder="Shopify US"
                />
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 lg:grid-cols-[2fr,3fr]">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="design-preview">
                  Preview URL
                </label>
                <Input
                  id="design-preview"
                  type="url"
                  value={form.previewUrl}
                  onChange={setFormField("previewUrl")}
                  placeholder="https://cdn.example.com/designs/festival-badge-pack.png"
                />
                <p className="text-xs text-muted-foreground">
                  Provide a signed URL or CDN asset so reviewers can inspect the creative.
                </p>
              </div>
              <div
                className={`flex items-center justify-center rounded-lg border bg-muted/10 ${
                  form.previewUrl ? "p-4" : "p-8"
                }`}
              >
                {form.previewUrl ? (
                  <img
                    src={form.previewUrl}
                    alt="Design preview"
                    className="max-h-[320px] w-full rounded-md bg-white object-contain"
                    onError={() => setFormError("Preview URL is invalid or unreachable.")}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">No preview attached yet.</p>
                )}
              </div>
            </div>
            {form.previewUrl ? (
              <Button
                variant="outline"
                type="button"
                onClick={() => window.open(form.previewUrl, "_blank", "noopener")}
              >
                <Download className="mr-2 h-4 w-4" />
                Download asset
              </Button>
            ) : null}
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="design-tags">
                Tags
              </label>
              <Input
                id="design-tags"
                value={tagInput}
                onChange={(event) => {
                  if (tagError) {
                    setTagError(null);
                  }
                  setTagInput(event.target.value);
                }}
                onKeyDown={handleTagKeyDown}
                onBlur={handleTagBlur}
                placeholder="Spring 25"
              />
              <p className="text-xs text-muted-foreground">
                Press Enter to add. {tags.length}/{maxTags} used.
              </p>
              {tagError ? <p className="text-xs text-destructive">{tagError}</p> : null}
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      <span>{tag}</span>
                      <button
                        type="button"
                        className="rounded-full p-0.5 hover:bg-muted"
                        onClick={() => removeTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X className="h-3 w-3" aria-hidden />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="design-notes">
                Notes
              </label>
              <Textarea
                id="design-notes"
                value={form.notes}
                onChange={setFormField("notes")}
                rows={8}
                placeholder="Creative brief, approval history, or production caveats."
              />
              <p className="text-xs text-muted-foreground">
                Markdown supported. Keep the review team aligned with the latest context.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review & workflow</CardTitle>
            <CardDescription>Track milestones and next actions for this design.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/10 p-4">
              <p className="text-sm font-medium text-muted-foreground">Current status</p>
              <p className="text-lg font-semibold">{statusBadge.label}</p>
              <p className="text-xs text-muted-foreground">
                {storedLastReviewedAt
                  ? `Last reviewed ${dateFormatter.format(new Date(storedLastReviewedAt))}`
                  : "Not reviewed yet"}
              </p>
            </div>
            <div className="space-y-3 text-sm">
              <p className="font-medium text-muted-foreground">Suggested next steps</p>
              <ul className="list-disc space-y-2 pl-5">
                {form.status === "draft" ? (
                  <li>Request a review when the asset is ready for brand approval.</li>
                ) : null}
                {form.status === "inReview" ? (
                  <li>Capture reviewer feedback in notes and mark approved when satisfied.</li>
                ) : null}
                {form.status === "approved" ? (
                  <li>Ensure all assigned products are synced to channels before launch.</li>
                ) : null}
                {form.status === "archived" ? (
                  <li>Remove assignments or swap to a replacement design if still in use.</li>
                ) : null}
              </ul>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-muted-foreground">Metadata</p>
              <div className="flex flex-col gap-1 text-muted-foreground">
                <span>Created {design.createdAt ? dateFormatter.format(new Date(design.createdAt)) : "Unknown"}</span>
                <span>
                  Owner {design.ownerName ? design.ownerName : "Unassigned"}
                </span>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <Button variant="outline" className="w-full" onClick={handleArchive} disabled={isSaving}>
                <Archive className="mr-2 h-4 w-4" />
                Archive design
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full" disabled={isSaving}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete design
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete design?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes the design record and does not automatically clean up product assignments.
                      Make sure any active listings use a replacement design first.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isSaving}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>Products currently using this design across channels.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {assignments.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">
              No products are linked yet. Assign this design from the product editor to start tracking usage.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Variants</TableHead>
                  <TableHead className="pr-6 text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="pl-6 font-medium">{assignment.title}</TableCell>
                    <TableCell className="capitalize">{assignment.status}</TableCell>
                    <TableCell>{assignment.channel}</TableCell>
                    <TableCell className="text-right">{assignment.variantCount}</TableCell>
                    <TableCell className="pr-6 text-right text-muted-foreground">
                      {assignment.updatedAt
                        ? dateFormatter.format(new Date(assignment.updatedAt))
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

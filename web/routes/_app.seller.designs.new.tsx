import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { X } from "lucide-react";
import { api } from "../api";
import { slugify } from "@/lib/slug";
import {
  DESIGN_DISCIPLINES,
  DESIGN_STATUSES,
  DesignDiscipline,
  DesignStatus,
} from "./_app.seller.designs/constants";
import type { Route } from "./+types/_app.seller.designs.new";

type DatasetSource = "live" | "fallback";

type ChannelOption = {
  id: string;
  label: string;
};

type LoaderResult = {
  channels: ChannelOption[];
  datasetSource: DatasetSource;
  datasetError?: string;
};

const fallbackChannels: ChannelOption[] = [
  { id: "shopify-us", label: "Shopify US" },
  { id: "amazon", label: "Amazon" },
  { id: "faire-b2b", label: "Faire B2B" },
  { id: "etsy", label: "Etsy" },
];

const normalizeChannelLabel = (record: any, index: number): ChannelOption => {
  const id = typeof record.id === "string" && record.id.trim() ? record.id : `channel-${index}`;
  const type = typeof record.type === "string" ? record.type : "";
  const name = typeof record.name === "string" ? record.name : "";
  const label = [name, type].filter(Boolean).join(" • ") || name || type || "Channel";
  return { id, label };
};

export const loader = async ({ context }: Route.LoaderArgs) => {
  try {
    const manager = (context.api as { salesChannel?: { findMany?: (options: unknown) => Promise<unknown> } }).salesChannel;
    if (!manager?.findMany) {
      throw new Error("Sales channel manager unavailable");
    }

    const records = (await manager.findMany({
      select: { id: true, name: true, type: true },
      sort: { name: "Ascending" },
      first: 50,
    })) as Array<Record<string, unknown>>;

    const channels = records.map(normalizeChannelLabel).filter((channel, index, array) => {
      return array.findIndex((entry) => entry.id === channel.id) === index;
    });

    if (channels.length === 0) {
      return {
        channels: fallbackChannels,
        datasetSource: "fallback" as DatasetSource,
        datasetError: "No sales channels available yet. Using reference list.",
      } satisfies LoaderResult;
    }

    return {
      channels,
      datasetSource: "live" as DatasetSource,
    } satisfies LoaderResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load sales channels.";
    return {
      channels: fallbackChannels,
      datasetSource: "fallback" as DatasetSource,
      datasetError: message,
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
};

const maxTags = 10;
const maxTagLength = 32;

export default function SellerDesignCreate({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { channels, datasetSource, datasetError } = loaderData;

  const [form, setForm] = useState<FormState>({
    name: "",
    slug: "",
    status: "draft",
    designType: "print",
    primaryChannel: "",
    previewUrl: "",
    notes: "",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);
  const [requestReview, setRequestReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugDirty, setSlugDirty] = useState(false);

  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }), []);
  const UNASSIGNED_CHANNEL_VALUE = "__unassigned__";

  const handleFieldChange =
    <Key extends keyof FormState>(key: Key) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((current) => {
        if (key === "name" && !slugDirty) {
          return {
            ...current,
            name: value,
            slug: slugify(value),
          };
        }
        return { ...current, [key]: value };
      });
    };

  const handleSlugChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSlugDirty(true);
    setForm((current) => ({ ...current, slug: slugify(event.target.value) }));
  };

  const handleStatusChange = (next: string) => {
    setForm((current) => ({ ...current, status: next as DesignStatus }));
  };

  const handleDesignTypeChange = (next: string) => {
    setForm((current) => ({ ...current, designType: next as DesignDiscipline }));
  };

  const handleChannelChange = (next: string) => {
    setForm((current) => ({
      ...current,
      primaryChannel: next === UNASSIGNED_CHANNEL_VALUE ? "" : next,
    }));
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

  const resetAndNavigateBack = () => {
    setForm({
      name: "",
      slug: "",
      status: "draft",
      designType: "print",
      primaryChannel: "",
      previewUrl: "",
      notes: "",
    });
    setTags([]);
    navigate("/seller/designs");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const trimmedName = form.name.trim();
    if (trimmedName.length < 3) {
      setSubmitError("Design name must be at least 3 characters long.");
      setIsSubmitting(false);
      return;
    }

    const slugValue = form.slug.trim();
    if (!slugValue) {
      setSubmitError("Slug is required.");
      setIsSubmitting(false);
      return;
    }

    const finalStatus: DesignStatus = requestReview ? "inReview" : form.status;
    if (finalStatus === "approved" && !form.previewUrl.trim()) {
      setSubmitError("Upload or link a preview asset before marking a design as approved.");
      setIsSubmitting(false);
      return;
    }

    const payload: Record<string, unknown> = {
      name: trimmedName,
      slug: slugValue,
      status: finalStatus,
      designType: form.designType,
      primaryChannel: form.primaryChannel || undefined,
      previewUrl: form.previewUrl.trim() || undefined,
      tags,
    };

    if (form.notes.trim()) {
      payload.notes = { markdown: form.notes.trim() };
    }

    if (finalStatus === "approved") {
      payload.lastReviewedAt = new Date().toISOString();
    }

    try {
      const result = await api.design.create(payload, { select: { id: true } });
      toast.success("Design created");
      const newId = (result as { id?: string }).id;
      if (newId) {
        navigate(`/seller/designs/${newId}`);
      } else {
        resetAndNavigateBack();
      }
    } catch (error) {
      console.error("Failed to create design", error);
      setSubmitError(
        error instanceof Error ? error.message : "Unable to create design. Please verify the details and try again.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New design"
        description="Register a creative asset with metadata so the team can review, approve, and assign it to products."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Badge
          variant="outline"
          className={
            datasetSource === "fallback"
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }
        >
          {datasetSource === "fallback" ? "Reference channels" : "Live channels"}
        </Badge>
        {datasetSource === "live" ? (
          <span className="text-sm text-muted-foreground">
            Last refreshed {dateFormatter.format(new Date())}
          </span>
        ) : null}
      </div>

      {datasetError ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800">
          <AlertTitle>Channel lookup offline</AlertTitle>
          <AlertDescription>{datasetError}</AlertDescription>
        </Alert>
      ) : null}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Design details</CardTitle>
            <CardDescription>Give the asset a clear name, slug, status, and discipline.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="design-name">
                  Design name
                </label>
                <Input
                  id="design-name"
                  value={form.name}
                  onChange={handleFieldChange("name")}
                  placeholder="Festival Badge Pack"
                  required
                />
                <p className="text-xs text-muted-foreground">Displayed in the library and product assignment flows.</p>
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
                <p className="text-xs text-muted-foreground">Auto-derives from the name; you can tweak for readability.</p>
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
                <Select value={form.primaryChannel || UNASSIGNED_CHANNEL_VALUE} onValueChange={handleChannelChange}>
                  <SelectTrigger id="design-channel">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED_CHANNEL_VALUE}>Unassigned</SelectItem>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.label}>
                        {channel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Optional hint for where this design will launch first.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset & preview</CardTitle>
            <CardDescription>Link to a preview so reviewers can inspect the creative quickly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="design-preview">
                Preview URL
              </label>
              <Input
                id="design-preview"
                type="url"
                placeholder="https://cdn.example.com/designs/festival-badge-pack.png"
                value={form.previewUrl}
                onChange={handleFieldChange("previewUrl")}
              />
              <p className="text-xs text-muted-foreground">
                Paste a signed file URL or CDN asset. Upload workflows will attach this automatically later.
              </p>
            </div>
            {form.previewUrl ? (
              <div className="overflow-hidden rounded-lg border bg-muted/20">
                <img
                  src={form.previewUrl}
                  alt="Design preview"
                  className="max-h-96 w-full object-contain bg-white"
                  onError={() => setSubmitError("Preview URL is invalid or unreachable.")}
                />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No preview attached yet. Uploads will render here once linked.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags & notes</CardTitle>
            <CardDescription>Add review context, tags, and any production notes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                        <X className="h-3 w-3" />
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
                onChange={handleFieldChange("notes")}
                rows={6}
                placeholder="Creative brief, approval history, or production caveats."
              />
              <p className="text-xs text-muted-foreground">
                Markdown supported on save. Keep reviewers in the loop with the latest context.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review kickoff</CardTitle>
            <CardDescription>Switch on to immediately route this design into the creative review queue.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-medium">Request creative ops review</p>
              <p className="text-sm text-muted-foreground">
                Sets the status to In review on save and notifies the approvers.
              </p>
            </div>
            <Switch checked={requestReview} onCheckedChange={setRequestReview} id="design-request-review" />
          </CardContent>
        </Card>

        {submitError ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to save design</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Save design"}
          </Button>
          <Button variant="ghost" type="button" onClick={resetAndNavigateBack} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
